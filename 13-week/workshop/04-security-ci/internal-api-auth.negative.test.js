const request = require('supertest');

const VALID_TOKEN = 'test-service-token';
const PROTECTED_ROUTES = [
    ['post', '/internal/reservations', { reservationId: 'r-1', userId: 'u-1' }],
    ['delete', '/internal/reservations/r-1'],
    ['get', '/internal/users/u-1']
];

function loadAuthService(serviceToken) {
    jest.resetModules();
    if (serviceToken === undefined) delete process.env.SERVICE_TOKEN;
    else process.env.SERVICE_TOKEN = serviceToken;
    return require('../../services/auth-service/server');
}

describe('auth-service /internal API rejects callers without a valid service token', () => {
    const originalToken = process.env.SERVICE_TOKEN;
    afterAll(() => {
        if (originalToken === undefined) delete process.env.SERVICE_TOKEN;
        else process.env.SERVICE_TOKEN = originalToken;
    });

    describe.each(PROTECTED_ROUTES)('%s %s', (method, path, body) => {
        it('answers 401 when x-service-token is missing', async () => {
            const app = loadAuthService(VALID_TOKEN);
            const response = await request(app)[method](path).send(body);
            expect(response.status).toBe(401);
        });

        it('answers 401 when x-service-token is wrong', async () => {
            const app = loadAuthService(VALID_TOKEN);
            const response = await request(app)[method](path).set('x-service-token', 'not-the-token').send(body);
            expect(response.status).toBe(401);
        });

        it('fails closed with 401 when the service has no SERVICE_TOKEN configured', async () => {
            const app = loadAuthService(undefined);
            const response = await request(app)[method](path).set('x-service-token', 'anything').send(body);
            expect(response.status).toBe(401);
        });
    });

    it('does not leak profile or health fields in the 401 body of GET /internal/users/:id', async () => {
        const app = loadAuthService(VALID_TOKEN);
        const response = await request(app).get('/internal/users/u-1');
        expect(response.status).toBe(401);
        const text = JSON.stringify(response.body);
        for (const field of ['email', 'telefono', 'fcmToken', 'tipoSanguineo', 'alergias', 'condiciones']) {
            expect(text).not.toContain(field);
        }
    });
});
