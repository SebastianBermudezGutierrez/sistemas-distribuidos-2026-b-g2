const crypto = require('node:crypto');
const { AsyncLocalStorage } = require('node:async_hooks');

// W3C traceparent: version-traceid-spanid-flags, lowercase hex.
const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;
const storage = new AsyncLocalStorage();

function randomHex(bytes) {
    return crypto.randomBytes(bytes).toString('hex');
}

function parseTraceparent(header) {
    const match = TRACEPARENT.exec(String(header || '').trim());
    if (!match) return null;
    const [, traceId, spanId, flags] = match;
    if (/^0+$/.test(traceId) || /^0+$/.test(spanId)) return null;
    return { traceId, spanId, flags };
}

function newTraceContext() {
    return { traceId: randomHex(16), spanId: randomHex(8), parentSpanId: null, flags: '01' };
}

// Same trace_id, new span_id: one more hop of the same request.
function childContext(parent) {
    return {
        traceId: parent.traceId,
        spanId: randomHex(8),
        parentSpanId: parent.spanId,
        flags: parent.flags
    };
}

function formatTraceparent(ctx) {
    return `00-${ctx.traceId}-${ctx.spanId}-${ctx.flags}`;
}

// Keeps the context available in every async step of the same request or message,
// so authClient.js can read it without changing the saga signatures.
function runWithContext(ctx, fn) {
    return storage.run(ctx, fn);
}

function currentContext() {
    return storage.getStore();
}

// RabbitMQ carries the traceparent in message.properties.headers.
function contextFromMessage(message) {
    const incoming = parseTraceparent(message?.properties?.headers?.traceparent);
    return incoming ? childContext(incoming) : newTraceContext();
}

module.exports = {
    parseTraceparent,
    newTraceContext,
    childContext,
    formatTraceparent,
    runWithContext,
    currentContext,
    contextFromMessage
};