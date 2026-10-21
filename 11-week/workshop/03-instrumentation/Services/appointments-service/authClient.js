const { currentContext, childContext, formatTraceparent, log } = require('../../observability');

const baseUrl = () => {
    if (!process.env.AUTH_SERVICE_URL) {
        throw new Error('AUTH_SERVICE_URL must be configured for the appointments service');
    }
    if (!process.env.SERVICE_TOKEN) {
        throw new Error('SERVICE_TOKEN must be configured for the appointments service');
    }
    return process.env.AUTH_SERVICE_URL.replace(/\/$/, '');
};

async function sendReservationRequest(path, options = {}, appointmentId) {
    const parent = currentContext();
    const outgoing = parent && childContext(parent);
    const startedAt = Date.now();
    let response;
    try {
        response = await fetch(`${baseUrl()}${path}`, {
            ...options,
            headers: {
                'content-type': 'application/json',
                'x-service-token': process.env.SERVICE_TOKEN,
                ...(outgoing && { traceparent: formatTraceparent(outgoing) }),
                ...options.headers
            },
            signal: AbortSignal.timeout(3000)
        });
    } catch (error) {
        if (error.name === 'TimeoutError') {
            log('ERROR', 'auth.reservation.timeout',
                `auth-service did not answer ${options.method} /internal/reservations`, {
                    appointment_id: appointmentId,
                    saga_status: 'PENDING',
                    duration_ms: Date.now() - startedAt
                });
        }
        throw new Error(`Auth service contract unavailable: ${error.message}`, { cause: error });
    }

    if (!response.ok) {
        const error = new Error(`Auth service contract returned ${response.status}`);
        error.status = response.status;
        throw error;
    }
    return response.json();
}

function reserveAppointment(reservationId, userId) {
    return sendReservationRequest('/internal/reservations', {
        method: 'POST',
        body: JSON.stringify({ reservationId, userId })
    }, reservationId);
}

function releaseAppointment(reservationId) {
    return sendReservationRequest(`/internal/reservations/${encodeURIComponent(reservationId)}`, {
        method: 'DELETE'
    }, reservationId);
}

module.exports = { reserveAppointment, releaseAppointment };