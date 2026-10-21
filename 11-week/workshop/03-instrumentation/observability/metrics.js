// Names, labels and buckets come from 04-metrics.md.
const BUCKETS = [0.05, 0.1, 0.2, 0.3, 0.5, 1, 3];

function resultOf(statusCode) {
    if (statusCode < 400) return 'ok';
    if (statusCode < 500) return 'rejected';
    return 'error';
}

// Always the route template (/api/turnos/:id), never the raw URL.
function routeLabel(req) {
    return req.route ? `${req.baseUrl || ''}${req.route.path}` : 'unmatched';
}

function createMetrics() {
    const counts = new Map();
    const histograms = new Map();

    function record(route, result, seconds) {
        const key = `${route}|${result}`;
        counts.set(key, (counts.get(key) || 0) + 1);
        if (!histograms.has(route)) {
            histograms.set(route, { buckets: BUCKETS.map(() => 0), sum: 0, count: 0 });
        }
        const histogram = histograms.get(route);
        BUCKETS.forEach((le, i) => { if (seconds <= le) histogram.buckets[i] += 1; });
        histogram.sum += seconds;
        histogram.count += 1;
    }

    function render() {
        const lines = [
            '# HELP appointments_requests_total HTTP requests by route and result.',
            '# TYPE appointments_requests_total counter'
        ];
        for (const [key, value] of counts) {
            const [route, result] = key.split('|');
            lines.push(`appointments_requests_total{route="${route}",result="${result}"} ${value}`);
        }
        lines.push(
            '# HELP appointments_request_duration_seconds HTTP request duration in seconds.',
            '# TYPE appointments_request_duration_seconds histogram'
        );
        for (const [route, h] of histograms) {
            const name = 'appointments_request_duration_seconds';
            BUCKETS.forEach((le, i) => lines.push(`${name}_bucket{route="${route}",le="${le}"} ${h.buckets[i]}`));
            lines.push(`${name}_bucket{route="${route}",le="+Inf"} ${h.count}`);
            lines.push(`${name}_sum{route="${route}"} ${h.sum}`);
            lines.push(`${name}_count{route="${route}"} ${h.count}`);
        }
        return `${lines.join('\n')}\n`;
    }

    return { record, render };
}

// app.use(requestMetrics(metrics))
function requestMetrics(metrics) {
    return (req, res, next) => {
        const startedAt = process.hrtime.bigint();
        res.on('finish', () => {
            const seconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
            metrics.record(routeLabel(req), resultOf(res.statusCode), seconds);
        });
        next();
    };
}

module.exports = { createMetrics, requestMetrics };