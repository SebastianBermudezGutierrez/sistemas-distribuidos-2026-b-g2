const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { parseTraceparent, contextFromMessage, runWithContext } = require('./observability/trace-context');
const { sink } = require('./observability');
const { reserveAppointment } = require('./services/appointments-service/authClient');

const TRACE_ID = 'a1c3e5f7092b4d6e8f10213243546576';
const PARENT_SPAN = '7d2f9c4a1b3e5f60';
const APPOINTMENT_ID = '6710f3a2c4b5d6e7f8091a2b';
const USER_ID = '671000a1b2c3d4e5f6a7b8c9';
// Same shape that amqplib gives to the consumer of appointments.saga.v1.
const message = { properties: { headers: { traceparent: `00-${TRACE_ID}-${PARENT_SPAN}-01` } } };

function listen(server) {
    return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

function close(server) {
    server.closeAllConnections();
    return new Promise(resolve => server.close(resolve));
}

// Stands in for auth-service: records every POST /internal/reservations it gets.
async function startAuthService(t, { hang = false } = {}) {
    const received = [];
    const server = http.createServer((req, res) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            received.push({ method: req.method, url: req.url, headers: req.headers, body: JSON.parse(body) });
            if (hang) return;
            res.writeHead(200, { 'content-type': 'application/json' });
            res.end(JSON.stringify({ status: 'RESERVED' }));
        });
    });
    t.after(() => close(server));
    const port = await listen(server);
    process.env.AUTH_SERVICE_URL = `http://127.0.0.1:${port}`;
    process.env.SERVICE_TOKEN = 'test-token';
    return received;
}

test('the trace_id received from the queue is the one sent to auth-service', async t => {
    const received = await startAuthService(t);

    const result = await runWithContext(contextFromMessage(message),
        () => reserveAppointment(APPOINTMENT_ID, USER_ID));

    assert.deepEqual(result, { status: 'RESERVED' });
    const [request] = received;
    assert.equal(request.method, 'POST');
    assert.equal(request.url, '/internal/reservations');
    assert.deepEqual(request.body, { reservationId: APPOINTMENT_ID, userId: USER_ID });
    assert.equal(request.headers['x-service-token'], 'test-token');
    const sent = parseTraceparent(request.headers.traceparent);
    assert.equal(sent.traceId, TRACE_ID);
    assert.notEqual(sent.spanId, PARENT_SPAN);
});

test('without a trace context the call still works and sends no traceparent', async t => {
    const received = await startAuthService(t);
    await reserveAppointment(APPOINTMENT_ID, USER_ID);
    assert.equal(received[0].headers.traceparent, undefined);
});

test('a timeout from auth-service is logged as ERROR with the same trace_id (3000 ms)', async t => {
    await startAuthService(t, { hang: true });
    const lines = [];
    const original = sink.write;
    sink.write = line => lines.push(JSON.parse(line));
    t.after(() => { sink.write = original; });

    await assert.rejects(
        runWithContext(contextFromMessage(message), () => reserveAppointment(APPOINTMENT_ID, USER_ID)),
        /Auth service contract unavailable/
    );

    const failure = lines.find(entry => entry.event === 'auth.reservation.timeout');
    assert.equal(failure.level, 'ERROR');
    assert.equal(failure.trace_id, TRACE_ID);
    assert.equal(failure.correlation_id, APPOINTMENT_ID);
    assert.equal(failure.saga_status, 'PENDING');
    assert.ok(failure.duration_ms >= 2900, `duration_ms was ${failure.duration_ms}`);
});