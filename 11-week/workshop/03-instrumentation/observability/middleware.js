const {
    parseTraceparent,
    newTraceContext,
    childContext,
    formatTraceparent,
    runWithContext
} = require('./trace-context');

// app.use(traceContext): reads or creates the trace context, returns it in the response
// and keeps it for the whole request.
function traceContext(req, res, next) {
    const incoming = parseTraceparent(req.headers.traceparent);
    const ctx = incoming ? childContext(incoming) : newTraceContext();
    req.ctx = ctx;
    res.setHeader('traceparent', formatTraceparent(ctx));
    runWithContext(ctx, next);
}

module.exports = { traceContext };