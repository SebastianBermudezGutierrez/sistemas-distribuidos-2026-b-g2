# 08 - Incident drill and blameless postmortem

**Simulated incident, not a real one.** Hop under test: step 6 of `01-journey.md`
(`appointments-service` -> `auth-service`, `POST /internal/reservations`). For 40 minutes
(10:00 to 10:40 UTC) `auth-service` answers in 3 s for 25 % of the calls. 3 s is the
`AbortSignal.timeout(3000)` of `authClient.js`, so every slow call is a timeout. All
numbers are expected values from `05-slo.md` (30,000 `POST` and 20,000 sagas per month).

| Item (40 min) | Calculation | Value |
| :--- | :--- | :--- |
| `POST /api/turnos` | 1,000 per day / 1,440 x 40 | 27.8 |
| Sagas | 20,000 / 30 / 1,440 x 40 | 18.5 |
| Reservation attempts | 18.5 / (1 - 0.25), retry until success | 24.7 |
| Timeouts | 25 % of attempts | 6.2 |
| Sagas with at least one timeout | 25 % of 18.5 | 4.6 |

## 1. Trace of one slow request (`trace_id` 9f3b7c1d5a2e4086b1c3d5e7f9a02468)

Milliseconds from `t0 = 10:12:30.000`. It is the CP1 span tree with the first attempt failing.
Today no code creates the `traceparent` (the app and `backend` do not), so the real root would be
`appointments-service`; the tree keeps the CP1 target design.

```text
POST /api/turnos (SERVER, backend)                          0 ->   52    52 ms
  proxy POST /api/turnos (CLIENT, backend)                  4 ->   50    46 ms
    POST /api/turnos (SERVER, appointments-service)         8 ->   48    40 ms
      mongo Turno.save (CLIENT)                            12 ->   46    34 ms
  publish appointment.requested.v1 (PRODUCER, relay)      940 ->  946     6 ms
    consume appointments.saga.v1, attempt 1 (CONSUMER)    953 -> 3962  3009 ms
      saga.handleRequested (INTERNAL)                     953 -> 3962  3009 ms
        POST /internal/reservations (CLIENT)              955 -> 3959  3004 ms  TIMEOUT
          POST /internal/reservations (SERVER, auth)      958 -> 3990  3032 ms  slow
    [fixed wait of 1000 ms, then republish with x-retry-count=1]
    consume appointments.saga.v1, attempt 2 (CONSUMER)   4962 -> 5020    58 ms
      saga.handleRequested (INTERNAL)                    4962 -> 5020    58 ms
        POST /internal/reservations (CLIENT)             4965 -> 4986    21 ms
          POST /internal/reservations (SERVER, auth)     4967 -> 4985    18 ms
        mongo Turno.findOneAndUpdate (CLIENT, finish)    4990 -> 5018    28 ms
```

The patient gets the 202 in 52 ms. The appointment becomes `Confirmado` after 5,018 ms
instead of about 1,005 ms: 3,004 ms timeout + 1,000 ms wait + the retry.

## 2. Four log lines of that trace (CP2 format)

```json
{"timestamp":"2026-10-20T10:12:30.048Z","level":"INFO","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"9f3b7c1d5a2e4086b1c3d5e7f9a02468","span_id":"3b8e1d6a9c4f2057","correlation_id":"6716a3b9c2d4e5f607182930","event":"appointment.created","message":"appointment saved as Pendiente with an outbox event","duration_ms":40,"http_status":202,"appointment_id":"6716a3b9c2d4e5f607182930","user_id":"671000a1b2c3d4e5f6a7b8c9","saga_status":"PENDING"}
{"timestamp":"2026-10-20T10:12:33.959Z","level":"ERROR","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"9f3b7c1d5a2e4086b1c3d5e7f9a02468","span_id":"8a4d2f6c0e1b3975","correlation_id":"6716a3b9c2d4e5f607182930","event":"auth.reservation.timeout","message":"auth-service did not answer POST /internal/reservations","duration_ms":3004,"appointment_id":"6716a3b9c2d4e5f607182930","saga_status":"PENDING","retry_count":0}
{"timestamp":"2026-10-20T10:12:34.962Z","level":"INFO","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"9f3b7c1d5a2e4086b1c3d5e7f9a02468","span_id":"2c7e9a1b4d6f8035","correlation_id":"6716a3b9c2d4e5f607182930","event":"saga.requested.received","message":"message received from appointments.saga.v1","duration_ms":0,"appointment_id":"6716a3b9c2d4e5f607182930","saga_status":"PENDING","retry_count":1}
{"timestamp":"2026-10-20T10:12:35.018Z","level":"INFO","service":"appointments-service","version":"2.0.0","environment":"development","trace_id":"9f3b7c1d5a2e4086b1c3d5e7f9a02468","span_id":"6d0b2e4a8c1f3957","correlation_id":"6716a3b9c2d4e5f607182930","event":"saga.appointment.confirmed","message":"appointment confirmed after reservation in auth-service","duration_ms":28,"appointment_id":"6716a3b9c2d4e5f607182930","saga_status":"COMPLETED","retry_count":1}
```

`saga.appointment.confirmed` is a new event name that follows the `domain.action` rule of
CP2; the current code does not log it yet.

## 3. SLIs, alerts and runbook

| SLI (`05-slo.md`) | Value during the 40 min | Why |
| :--- | :--- | :--- |
| SLO 1 availability (99.9 %) | 100 %: 0 of 27.8 requests failed. Budget used: 0 of 30 failed requests, 0 of 43.2 min | `POST` answers 202 before calling `auth-service` |
| SLO 2 latency (95 % under 300 ms) | 100 % under 300 ms (about 40 ms) | same reason |
| SLO 3 saga (99.5 % without dead-letter) | 99.976 %: dead-letter chance is 0.25^6 = 0.024 %, so 0.0045 of 18.5 sagas. Budget used: 0.0045 of 100 | only if all 6 attempts fail. Not measurable today: the metric is **proposed** |

**No alert fires, neither `AppointmentsAvailabilityFastBurn` nor `AppointmentsAvailabilitySlowBurn`.**
Both only count 5xx on `/api/turnos`, and this incident produces none. With today's rules
the drill ends at minute 40 without anyone noticing; the only trace is the ERROR line above.

What would have caught it (proposed, not implemented): the counter
`appointments_auth_calls_total{outcome}` (`ok`, `rejected`, `timeout`, `error`) and an alert
on the timeout share above 10 % over 30 minutes, with at least 10 attempts and `for: 5m`.
Attempts arrive at 24.7 / 40 = 0.62 per minute, so 10 attempts take 16 minutes and the alert
fires around **minute 21**, with the share at 25 %.

Runbook step that stops the cause: section 2 (row "only `auth.reservation.timeout`")
leads to **Mitigation 1, `docker compose restart auth-service`**. It helps only if the
slowness is inside the `auth-service` process; if it is MongoDB, restart `mongodb`.
Damage is already bounded by the design: 202 plus outbox plus an idempotent saga with 6 retries.

## 4. Postmortem (blameless)

### Timeline

| Time (min) | Event |
| :--- | :--- |
| 10:00 (0) | `auth-service` starts answering in 3 s for 25 % of the calls |
| about 10:06 (6) | first expected `auth.reservation.timeout` (1 / 0.154 timeouts per minute = 6.5 min) |
| 10:12 (12) | trace 9f3b...2468: confirmed in 5.0 s instead of 1.0 s |
| 10:12 to 10:40 | no alert, SLO 1 and SLO 2 at 100 % |
| 10:21 (21) | with the proposed alert, the on-call would be paged |
| 10:40 (40) | slowness ends; nobody noticed |

### Impact

0 failed `POST /api/turnos` of 27.8; 0 minutes of availability budget. About 4.6 appointments
confirmed about 4 s late (more with two timeouts); 6.2 timeouts; 0.0045 expected
dead-lettered sagas. With the alert and a restart at minute 25 the incident would last
25 minutes instead of 40 (3.9 timeouts instead of 6.2).

### Root cause

For the drill, the cause inside `auth-service` was not investigated. What the design adds:
`appointments-service` waits the full 3 s on every slow call and always waits a fixed 1 s
before retrying, with nothing that detects the pattern.

### Contributing factors

- Both CP7 alerts watch only 5xx on `/api/turnos`; nothing watches the saga path.
- `auth-service` and the saga have no metrics yet (`04-metrics.md`: proposed).
- Fixed 1 s retry delay and no backoff: the 6 attempts cover about 24 s (6 x 3 s + 6 x 1 s, as in `04-metrics.md`).
- No circuit breaker in `authClient.js`.

What went well: the 202 answer, the outbox and the idempotent saga lost no appointment.

### Actions

**HU-OBS-01.** As the on-call engineer, I want an alert when more than 10 % of
`auth-service` calls time out over 30 minutes, so that I learn about a slow dependency
before patients do.
- `GET /metrics` of `appointments-service` shows `appointments_auth_calls_total{outcome}` with the 4 outcomes, covered by a unit test.
- `AppointmentsAuthTimeoutRatio` is in `06-alerts.yml` and passes `promtool check rules`.
- A `promtool test rules` case with 25 % timeouts and 0.62 attempts per minute fires in under 25 minutes.

**HU-SAGA-02.** As the tech lead, I want the saga retries to use exponential backoff
(1, 2, 4, 8, 16 s), so that a short `auth-service` outage does not dead-letter appointments.
- The 6 attempts cover at least 45 s (6 x 3 s + 1+2+4+8+16 s of waits), checked by a test.
- With a fake `auth-service` that fails for 30 s, the appointment ends `Confirmado` and `appointments.saga.v1.dead` stays empty.

**HU-OBS-03.** As the tech lead, I want the saga metrics, so that SLO 3 can be measured.
- `appointments_saga_outcomes_total{outcome}` counts `confirmed`, `compensated` and `dead_lettered`.
- After one test booking, the PromQL of SLO 3 returns a value, and the status in `04-metrics.md` changes to implemented.