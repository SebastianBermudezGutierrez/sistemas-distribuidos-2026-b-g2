# 05 - SLIs, SLOs and Error Budget.

Journey: Android app -> `backend` (gateway, `proxyTo`) -> `appointments-service` (`POST /api/turnos`, saves the `Turno` as `Pendiente` with an outbox event, returns 202) -> outbox relay -> RabbitMQ (`appointments.saga.v1`) -> saga -> `auth-service` (`POST /internal/reservations`) -> `Turno` becomes `Confirmado` or `Cancelado`.

## 1. Traffic estimate

| Item | Value | Why |
| :--- | :--- | :--- |
| Registered patients | ~10,000 | `03-product/problem-framing.md` (affected users) |
| Bookings per patient per month | 2 | Assumption: routine visits, not emergencies |
| Accepted bookings per month (HTTP 202) | 20,000 | 10,000 x 2 |
| Request multiplier | x1.5 | Retries, offline sync (`SyncWorker`), rejected double-bookings (HTTP 409) |
| `POST /api/turnos` requests per month | 30,000 | 20,000 x 1.5 |
| Average rate | ~1,000 per day (~42 per hour) | 30,000 / 30 |
| Sagas per month | ~20,000 | One `appointment.requested.v1` event per accepted booking |

## 2. SLO 1 - Availability of `/api/turnos`

- **SLI:** requests that did not fail on our side / all requests on the route.
- **Formula:** `good = result != "error"` (`ok` and `rejected`), `valid = all`. A taken slot is answered with HTTP 409 (`rejected`): a correct answer, so a good event. Only 5xx (`error`) counts as a failure.
- **Objective:** 99.9 % (NFR-002, production).
- **Window:** 30 days.

```promql
sum(rate(appointments_requests_total{route="/api/turnos", result!="error"}[30d]))
/
sum(rate(appointments_requests_total{route="/api/turnos"}[30d]))
```

## 3. SLO 2 - Latency of `/api/turnos`

- **SLI:** requests answered in 300 ms or less / all requests on the route.
- **Objective:** 95 % under 300 ms (NFR-001, P95 < 300 ms). The `POST` only saves the `Turno` with its outbox event and answers 202, so it does not wait for `auth-service`.
- **Window:** 30 days.
- The bucket `le="0.3"` exists (`0.05, 0.1, 0.2, 0.3, 0.5, 1, 3`).

```promql
sum(rate(appointments_request_duration_seconds_bucket{route="/api/turnos", le="0.3"}[30d]))
/
sum(rate(appointments_request_duration_seconds_count{route="/api/turnos"}[30d]))
```

## 4. SLO 3 - Saga completes without dead-letter

Product reason: the patient gets a 202 `Pendiente` before the reservation exists in `auth-service`. If the saga fails 6 times, the message goes to `appointments.saga.v1.dead` and the `Turno` stays `Pendiente` until a person fixes it.

- **SLI:** saga outcomes that are not `dead_lettered` / all saga outcomes. `confirmed` and `compensated` (`auth-service` answers 404 or 409 and the `Turno` ends as `Cancelado`) are good events.
- **Objective:** 99.5 %.
- **Window:** 30 days.
- `appointments_saga_outcomes_total` is **proposed** in `04-metrics.md`, not implemented. This SLO cannot be measured until it exists.

```promql
1 - (
  sum(rate(appointments_saga_outcomes_total{outcome="dead_lettered"}[30d]))
  /
  sum(rate(appointments_saga_outcomes_total[30d]))
)
```

## 5. Error budget

| SLO | Objective | Budget (fraction) | Budget in events (30 days) | Budget in time |
| :--- | :--- | :--- | :--- | :--- |
| Availability | 99.9 % | 0.1 % | 30 failed requests (0.1 % of 30,000) | 43.2 min of total outage (0.001 x 43,200 min) |
| Latency | 95 % under 300 ms | 5 % | 1,500 slow requests (5 % of 30,000) | not used |
| Saga | 99.5 % | 0.5 % | 100 dead-lettered sagas (0.5 % of 20,000) | not used |

## 6. Error budget policy

| Budget consumed | What the team does |
| :--- | :--- |
| 50 % | Post in the team channel. Review the cause in the next daily. Add one reliability story to the current sprint. |
| 75 % | Stop risky changes (schema changes, dependency upgrades, changes to `POST /api/turnos` or the saga). Only bug fixes and reliability work are merged. The tech lead reviews every deploy. |
| 100 % | Feature freeze on the affected service until the budget recovers or the agreed reliability stories are done. Write a blameless postmortem within 3 working days. Exceptions need approval from the tech lead and the product owner. |
