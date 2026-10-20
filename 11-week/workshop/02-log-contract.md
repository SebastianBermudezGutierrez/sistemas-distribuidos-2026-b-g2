# 02 · Structured log contract

Applies to the three services in the "book an appointment" journey: `backend`,
`appointments-service` and `auth-service`. Each log entry is a single-line JSON
object written to standard output.

## Required fields

| Field | Type | Required | Example | Why it exists |
|---|---|---|---|---|
| `timestamp` | ISO-8601 UTC string | yes | `2026-10-20T14:02:11.141Z` | order events across services with no time zone ambiguity |
| `level` | string | yes | `ERROR` | filter by severity (`ERROR`, `WARN`, `INFO`, `DEBUG`) |
| `service` | string | yes | `appointments-service` | tell which process wrote the line |
| `version` | string | yes | `2.0.0` | tie a failure to a deployment (`package.json`) |
| `environment` | string | yes | `development` | separate environments (`NODE_ENV`) |
| `trace_id` | string, 32 hex | yes | `a1c3e5f7092b4d6e8f10213243546576` | join every line of one request |
| `span_id` | string, 16 hex | yes | `7d2f9c4a1b3e5f60` | locate the exact operation inside the trace |
| `correlation_id` | string | yes | `6710f3a2c4b5d6e7f8091a2b` | business id (the `Turno` id); still works if the `trace_id` is lost in the queue |
| `event` | string `domain.action` | yes | `auth.reservation.timeout` | stable name that can be searched and counted |
| `message` | string | yes | `auth-service did not answer` | readable explanation, with no sensitive data |
| `duration_ms` | integer | yes (0 if not applicable) | `3004` | measure latency and feed the CP3 histogram |
| `http_status` | integer | no | `404` | result of an HTTP call |

## Domain fields

| Field | Type | Example | Why it exists |
|---|---|---|---|
| `appointment_id` | string | `6710f3a2c4b5d6e7f8091a2b` | identifies the `Turno` (`_id`) and is the `reservationId` in `auth-service` |
| `user_id` | string | `671000a1b2c3d4e5f6a7b8c9` | `Turno.usuarioId`; allows searching by patient without storing name or email |
| `saga_status` | string | `PENDING` | saga state (`PENDING`, `COMPLETED`, `COMPENSATED`) to know whether the appointment was confirmed |
| `retry_count` | number | `1` | consumer attempt (`x-retry-count`); goes to the dead-letter queue at 6 |
| `slot` | string | `2026-10-23 09:30` | `fecha` and `hora` of the appointment; useful to investigate schedule conflicts |
| `specialty` | string | `General` | `Turno.especialidad`; shows whether a failure affects one specialty |

## Never log

| Data | Where it exists | How it is handled |
|---|---|---|
| `Authorization` and the JWT | `auth.js`, `appointments-service` | not logged; only `user_id` |
| `JWT_SECRET`, `SERVICE_TOKEN`, `DEMO_FAILURE_TOKEN` | environment variables | not logged |
| `FIREBASE_SERVICE_ACCOUNT` | `notification.js` | not logged |
| `MONGODB_URI`, `RABBITMQ_URL` | environment variables | host only, never user or password |
| `fcmToken` | `User` | omitted; use `fcm_token_present: true` |
| `contrasena`, `verificationCode` | `User` | not logged |
| `email`, `telefono`, `nombre`, `pacienteNombre` | `User`, `Turno` | omitted; use `user_id` |
| `tipoSanguineo`, `alergias`, `condiciones`, `contactoEmergencia` | `User` | health data, never |
| `motivo` of the appointment | `Turno` | health data, never |
| full `req.body` | `/api/turnos` and `/api/auth` routes | not logged; only the fields listed above |

Current leaks in the code: `middleware/notification.js` prints the `fcmToken` in
simulation mode and `routes/auth.js` prints the `email` when registering users.

## Levels

| Level | When it is used | Example from this project |
|---|---|---|
| `ERROR` | the operation failed and did not recover within that call | `auth-service` does not answer `POST /internal/reservations` within 3000 ms |
| `WARN` | expected business-rule rejection or a failure that will be retried | the saga rejects the appointment because the user no longer exists (404) |
| `INFO` | normal milestones of the journey | appointment saved as `Pendiente` with a 202 response |
| `DEBUG` | development detail; off in production | the outbox relay checks the database and finds no pending events |

## Example: one failed request (same `trace_id`)

```json
{"timestamp":"2026-10-20T14:02:11.102Z","level":"INFO","service":"backend","version":"2.0.0","environment":"development","trace_id":"a1c3e5f7092b4d6e8f10213243546576","span_id":"7d2f9c4a1b3e5f60","correlation_id":"6710f3a2c4b5d6e7f8091a2b","event":"gateway.request.received","message":"POST /api/turnos received and forwarded to appointments-service","duration_ms":0,"user_id":"671000a1b2c3d4e5f6a7b8c9"}
{"timestamp":"2026-10-20T14:02:11.141Z","level":"INFO","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"a1c3e5f7092b4d6e8f10213243546576","span_id":"3b8e1d6a9c4f2057","correlation_id":"6710f3a2c4b5d6e7f8091a2b","event":"appointment.created","message":"appointment saved as Pendiente with an outbox event","duration_ms":34,"http_status":202,"appointment_id":"6710f3a2c4b5d6e7f8091a2b","user_id":"671000a1b2c3d4e5f6a7b8c9","saga_status":"PENDING","slot":"2026-10-23 09:30","specialty":"General"}
{"timestamp":"2026-10-20T14:02:12.058Z","level":"INFO","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"a1c3e5f7092b4d6e8f10213243546576","span_id":"c94a0e7b5d213f68","correlation_id":"6710f3a2c4b5d6e7f8091a2b","event":"outbox.event.published","message":"appointment.requested.v1 published to salud-activa.events.v1","duration_ms":6,"appointment_id":"6710f3a2c4b5d6e7f8091a2b","saga_status":"PENDING"}
{"timestamp":"2026-10-20T14:02:12.071Z","level":"INFO","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"a1c3e5f7092b4d6e8f10213243546576","span_id":"5e1b7a3c9d0f4286","correlation_id":"6710f3a2c4b5d6e7f8091a2b","event":"saga.requested.received","message":"message received from appointments.saga.v1","duration_ms":0,"appointment_id":"6710f3a2c4b5d6e7f8091a2b","saga_status":"PENDING","retry_count":0}
{"timestamp":"2026-10-20T14:02:15.077Z","level":"ERROR","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"a1c3e5f7092b4d6e8f10213243546576","span_id":"8a4d2f6c0e1b3975","correlation_id":"6710f3a2c4b5d6e7f8091a2b","event":"auth.reservation.timeout","message":"auth-service did not answer POST /internal/reservations","duration_ms":3004,"appointment_id":"6710f3a2c4b5d6e7f8091a2b","saga_status":"PENDING","retry_count":0}
{"timestamp":"2026-10-20T14:02:16.101Z","level":"WARN","service":"auth-service","version":"2.0.0","environment":"development","trace_id":"a1c3e5f7092b4d6e8f10213243546576","span_id":"d6f0b2a4c8e17359","correlation_id":"6710f3a2c4b5d6e7f8091a2b","event":"reservation.rejected","message":"user does not exist, reservation rejected","duration_ms":18,"http_status":404,"user_id":"671000a1b2c3d4e5f6a7b8c9"}
{"timestamp":"2026-10-20T14:02:16.109Z","level":"WARN","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"a1c3e5f7092b4d6e8f10213243546576","span_id":"1f3a5c7e9b0d2468","correlation_id":"6710f3a2c4b5d6e7f8091a2b","event":"saga.appointment.rejected","message":"appointment cancelled after permanent rejection from auth-service","duration_ms":28,"appointment_id":"6710f3a2c4b5d6e7f8091a2b","saga_status":"COMPENSATED","retry_count":1}
```