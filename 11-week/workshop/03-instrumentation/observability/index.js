const { version } = require('../package.json');
const trace = require('./trace-context');
const { traceContext } = require('./middleware');
const { createLogger } = require('./logger');
const { createMetrics, requestMetrics } = require('./metrics');

// `sink` lets a test capture the log lines instead of printing them.
const sink = { write: line => process.stdout.write(`${line}\n`) };

const log = createLogger({
    service: 'appointments-service',
    version,
    environment: process.env.NODE_ENV || 'development',
    write: line => sink.write(line)
});

const metrics = createMetrics();

module.exports = { ...trace, traceContext, createLogger, log, sink, metrics, requestMetrics };