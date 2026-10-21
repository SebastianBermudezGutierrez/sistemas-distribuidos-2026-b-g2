const { currentContext, newTraceContext } = require('./trace-context');

const LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG'];

// Fields allowed by 02-log-contract.md. Anything else is dropped, so email,
// fcmToken, motivo or a full req.body never reach the logs.
const ALLOWED_FIELDS = [
    'http_status', 'appointment_id', 'user_id', 'saga_status', 'retry_count', 'slot', 'specialty'
];

function createLogger({ service, version, environment, write }) {
    const out = write || (line => process.stdout.write(`${line}\n`));

    return function log(level, event, message, extra = {}) {
        if (!LEVELS.includes(level)) throw new Error(`Unknown log level: ${level}`);
        if (level === 'DEBUG' && environment === 'production') return;

        const ctx = currentContext() || newTraceContext();
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            service,
            version,
            environment,
            trace_id: ctx.traceId,
            span_id: ctx.spanId,
            correlation_id: extra.appointment_id ?? null,
            event,
            message,
            duration_ms: Math.round(extra.duration_ms || 0)
        };
        for (const key of ALLOWED_FIELDS) {
            if (extra[key] !== undefined) entry[key] = extra[key];
        }
        out(JSON.stringify(entry));
    };
}

module.exports = { createLogger };