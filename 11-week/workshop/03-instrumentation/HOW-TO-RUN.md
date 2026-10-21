# CP3 - How to run: appointments-service instrumentation

The folders mirror `backend/` of the team repo: `observability/` goes to `backend/observability/`, and `services/appointments-service/authClient.js` replaces the file with the same path. The tests use only Node.js built-ins, so no `npm install` is needed.

## Run the tests

```bash
cd 11-week/workshop/03-instrumentation
node --version   # 18 or newer
npm test
```

On Windows PowerShell, if `npm test` is blocked by the execution policy, use `npm.cmd test`.

Expected: 8 tests pass, 0 fail. One test waits 3 seconds on purpose: it is the real 3000 ms timeout of `authClient.js`.

| Test file | What it proves |
| :--- | :--- |
| `observability.test.js` | The middleware keeps the `trace_id`, the logger follows the CP2 contract, the metrics follow the CP4 catalog |
| `authClient.test.js` | The `trace_id` from the queue message reaches `POST /internal/reservations`, and a timeout is logged as `auth.reservation.timeout` with the same `trace_id` |

## Apply it to the real service

From the root of the team repo:

```bash
cp -r observability backend/observability
cp services/appointments-service/authClient.js backend/services/appointments-service/authClient.js
docker compose up --build
```

Then log in with `POST /api/auth/login`, create an appointment with `POST /api/turnos` through the gateway (body with `fecha` and `hora`), and send the header `traceparent: 00-a1c3e5f7092b4d6e8f10213243546576-7d2f9c4a1b3e5f60-01`. In the logs of `appointments-service`, the lines `appointment.created` and `saga.requested.received` show the same `trace_id`. `GET http://localhost:3002/metrics` shows `appointments_requests_total` and `appointments_request_duration_seconds`.

## Real console output

```text
PS C:\Users\sebas\sistemas-distribuidos-2026-b-g2\11-week\workshop\03-instrumentation> npm.cmd test

> appointments-service-instrumentation@2.0.0 test
> node --test

✔ the trace_id received from the queue is the one sent to auth-service (46.6984ms)
✔ without a trace context the call still works and sends no traceparent (7.2106ms)
✔ a timeout from auth-service is logged as ERROR with the same trace_id (3000 ms) (3006.6754ms)
✔ parseTraceparent accepts a valid header and rejects malformed ones (1.1912ms)
✔ contextFromMessage continues the trace of a RabbitMQ message (0.2718ms)
✔ traceContext keeps the incoming trace_id, answers with a new span_id and keeps the context (0.2887ms)
✔ logger writes the CP2 fields with the current trace and drops fields outside the contract (1.4402ms)
✔ requestMetrics counts by result and fills the latency histogram (0.4743ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3343.5178
```