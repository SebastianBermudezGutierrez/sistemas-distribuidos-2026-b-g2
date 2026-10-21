const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const {
    parseTraceparent, newTraceContext, formatTraceparent,
    contextFromMessage, runWithContext, currentContext
} = require('./observability/trace-context');
const { traceContext } = require('./observability/middleware');
const { createLogger } = require('./observability/logger');
const { createMetrics, requestMetrics } = require('./observability/metrics');

const TRACE_ID = 'a1c3e5f7092b4d6e8f10213243546576';
const PARENT_SPAN = '7d2f9c4a1b3e5f60';
const INCOMING = `00-${TRACE_ID}-${PARENT_SPAN}-01`;
const APPOINTMENT_ID = '6710f3a2c4b5d6e7f8091a2b';

function fakeResponse(statusCode = 200) {
    const res = new EventEmitter();
    res.statusCode = statusCode;
    res.headers = {};
    res.setHeader = (name, value) => { res.headers[name] = value; };
    return res;
}

test('parseTraceparent accepts a valid header and rejects malformed ones', () => {
    assert.deepEqual(parseTraceparent(INCOMING), { traceId: TRACE_ID, spanId: PARENT_SPAN, flags: '01' });
    assert.equal(parseTraceparent('not-a-traceparent'), null);
    assert.equal(parseTraceparent(`00-${'0'.repeat(32)}-${PARENT_SPAN}-01`), null);
    const ctx = newTraceContext();
    assert.equal(parseTraceparent(formatTraceparent(ctx)).traceId, ctx.traceId);
});

test('contextFromMessage continues the trace of a RabbitMQ message', () => {
    const message = { properties: { headers: { traceparent: INCOMING } } };
    const ctx = contextFromMessage(message);
    assert.equal(ctx.traceId, TRACE_ID);
    assert.notEqual(ctx.spanId, PARENT_SPAN);
    assert.match(contextFromMessage({ properties: { headers: {} } }).traceId, /^[0-9a-f]{32}$/);
});

test('traceContext keeps the incoming trace_id, answers with a new span_id and keeps the context', () => {
    const req = { headers: { traceparent: INCOMING } };
    const res = fakeResponse();
    let seenInside;
    traceContext(req, res, () => { seenInside = currentContext(); });

    const returned = parseTraceparent(res.headers.traceparent);
    assert.equal(returned.traceId, TRACE_ID);
    assert.notEqual(returned.spanId, PARENT_SPAN);
    assert.equal(seenInside, req.ctx);

    const fresh = fakeResponse();
    traceContext({ headers: {} }, fresh, () => {});
    assert.match(fresh.headers.traceparent, /^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
});

test('logger writes the CP2 fields with the current trace and drops fields outside the contract', () => {
    const lines = [];
    const log = createLogger({
        service: 'appointments-service', version: '2.0.0', environment: 'development', write: l => lines.push(l)
    });
    const ctx = newTraceContext();
    runWithContext(ctx, () => log('INFO', 'appointment.created', 'appointment saved as Pendiente with an outbox event', {
        appointment_id: APPOINTMENT_ID, user_id: '671000a1b2c3d4e5f6a7b8c9', saga_status: 'PENDING',
        slot: '2026-10-23 09:30', specialty: 'General', http_status: 202, duration_ms: 34.4,
        email: 'patient@example.com', motivo: 'private', fcmToken: 'secret'
    }));
    const entry = JSON.parse(lines[0]);
    for (const field of ['timestamp', 'level', 'service', 'version', 'environment', 'trace_id', 'span_id',
        'correlation_id', 'event', 'message', 'duration_ms']) {
        assert.ok(field in entry, `missing ${field}`);
    }
    assert.equal(entry.trace_id, ctx.traceId);
    assert.equal(entry.correlation_id, APPOINTMENT_ID);
    assert.equal(entry.duration_ms, 34);
    for (const forbidden of ['email', 'motivo', 'fcmToken']) assert.equal(forbidden in entry, false);
});

test('requestMetrics counts by result and fills the latency histogram', () => {
    const metrics = createMetrics();
    const measure = requestMetrics(metrics);
    for (const [status, route] of [[202, '/api/turnos'], [409, '/api/turnos'], [503, '/api/turnos'], [404, undefined]]) {
        const req = { baseUrl: '', route: route && { path: route }, url: `/api/turnos/${APPOINTMENT_ID}` };
        const res = fakeResponse(status);
        measure(req, res, () => {});
        res.emit('finish');
    }
    const text = metrics.render();
    assert.match(text, /appointments_requests_total\{route="\/api\/turnos",result="ok"\} 1/);
    assert.match(text, /appointments_requests_total\{route="\/api\/turnos",result="rejected"\} 1/);
    assert.match(text, /appointments_requests_total\{route="\/api\/turnos",result="error"\} 1/);
    assert.match(text, /appointments_requests_total\{route="unmatched",result="rejected"\} 1/);
    assert.match(text, /appointments_request_duration_seconds_bucket\{route="\/api\/turnos",le="0\.3"\} 3/);
    assert.match(text, /appointments_request_duration_seconds_count\{route="\/api\/turnos"\} 3/);
    assert.doesNotMatch(text, new RegExp(APPOINTMENT_ID));
});