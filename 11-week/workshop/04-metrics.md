# 04 · Golden signals and metric catalog

Services in the "book an appointment" journey: `backend` (gateway), `appointments-service`
and `auth-service`. Conventions: `snake_case`, service prefix, base unit in the name
(`_seconds`) and `_total` on counters. Status: **implemented** means it is in the CP3
module and **proposed** means it does not exist yet.

Label `result` (HTTP requests): `ok` (below 400), `rejected` (4xx), `error` (5xx).
Label `outcome` (saga and reservations): business result. The guide text uses `outcome`
for everything; here `result` is already in the CP3 code.

## backend (gateway)

| Signal | Metric | Type | Labels | PromQL | Status |
|---|---|---|---|---|---|
| Latency | `gateway_request_duration_seconds` | histogram | `route`, `method` | `histogram_quantile(0.95, sum by (le, route) (rate(gateway_request_duration_seconds_bucket[5m])))` | proposed |
| Traffic | `gateway_requests_total` | counter | `route`, `method`, `result` | `sum by (route) (rate(gateway_requests_total[5m]))` | proposed |
| Errors | `gateway_requests_total` | counter | `route`, `method`, `result` | `sum(rate(gateway_requests_total{result="error"}[5m])) / sum(rate(gateway_requests_total[5m]))` | proposed |
| Saturation | `gateway_requests_in_flight` | gauge | none | `max_over_time(gateway_requests_in_flight[5m])` | proposed |

## appointments-service

| Signal | Metric | Type | Labels | PromQL | Status |
|---|---|---|---|---|---|
| Latency | `appointments_request_duration_seconds` | histogram | `route` | `histogram_quantile(0.95, sum by (le) (rate(appointments_request_duration_seconds_bucket{route="/api/turnos"}[5m])))` | implemented |
| Latency (saga) | `appointments_saga_duration_seconds` | histogram | `outcome` | `histogram_quantile(0.95, sum by (le) (rate(appointments_saga_duration_seconds_bucket[5m])))` | proposed |
| Traffic | `appointments_requests_total` | counter | `route`, `result` | `sum by (route) (rate(appointments_requests_total[5m]))` | implemented |
| Errors | `appointments_requests_total` | counter | `route`, `result` | `sum(rate(appointments_requests_total{result="error"}[5m])) / sum(rate(appointments_requests_total[5m]))` | implemented |
| Errors (saga) | `appointments_saga_outcomes_total` | counter | `outcome` | `sum(rate(appointments_saga_outcomes_total{outcome="dead_lettered"}[5m]))` | proposed |
| Saturation | `appointments_outbox_pending_events` | gauge | none | `max_over_time(appointments_outbox_pending_events[5m])` | proposed |

Saga `outcome`: `confirmed`, `compensated` (business rejection, for example a user that
does not exist) and `dead_lettered` (6 failed attempts). Only `dead_lettered` is a real failure.

## auth-service

| Signal | Metric | Type | Labels | PromQL | Status |
|---|---|---|---|---|---|
| Latency | `auth_request_duration_seconds` | histogram | `route` | `histogram_quantile(0.95, sum by (le) (rate(auth_request_duration_seconds_bucket{route="/internal/reservations"}[5m])))` | proposed |
| Traffic | `auth_requests_total` | counter | `route`, `result` | `sum by (route) (rate(auth_requests_total[5m]))` | proposed |
| Errors | `auth_requests_total` | counter | `route`, `result` | `sum(rate(auth_requests_total{result="error"}[5m])) / sum(rate(auth_requests_total[5m]))` | proposed |
| Business rules | `auth_reservations_total` | counter | `outcome` | `sum by (outcome) (rate(auth_reservations_total[5m]))` | proposed |
| Saturation | `auth_requests_in_flight` | gauge | none | `max_over_time(auth_requests_in_flight[5m])` | proposed |

Reservation `outcome`: `reserved`, `released`, `user_not_found` (404) and `conflict` (409).
In all three services saturation is complemented with `nodejs_eventloop_lag_p99_seconds`,
which comes with prom-client's `collectDefaultMetrics`.

## Cardinality

| Label | Possible values | Decision |
|---|---|---|
| `route` | 6 per service (`/api/turnos`, `/api/turnos/check-availability`, `/api/turnos/:id`, `/metrics`, others, `unmatched`) | allowed, always the route template |
| `method` | 4 (`GET`, `POST`, `PUT`, `DELETE`) | allowed |
| `result` | 3 | allowed |
| `outcome` | 3 to 4 | allowed |

Series per service: the counter with `route` and `result` produces about 18 series. The
histogram with `route` and 7 buckets plus `+Inf`, `_sum` and `_count` produces about 60. In
the gateway, with `method`, it is about 72 and 240. Everything stays in the hundreds of
series, not millions.

| Forbidden label | Why it is unbounded | What replaces it |
|---|---|---|
| `user_id` | one series per patient | the `user_id` field in the log (CP2) |
| `appointment_id` | one series per appointment | `correlation_id` in logs and traces |
| raw URL (`/api/turnos/6710f3a2...`) | every MongoDB `_id` creates a series | `req.baseUrl + req.route.path`, that is `/api/turnos/:id` |
| `email`, `telefono`, `fcmToken` | personal data and unbounded | nothing; see "Never log" in CP2 |
| `slot` (`fecha` and `hora`) | hundreds of combinations per year | nothing; it stays in the log |
| `trace_id` | one series per request | the log and the trace |

## Latency histogram buckets

NFR-001 (`04-requirements/non-functional.md`) sets for `POST /api/turnos` and
`POST /api/auth/login`: P95 below 300 ms at 100 RPS and P99 below 500 ms at 200 RPS.

Buckets in seconds: `0.05, 0.1, 0.2, 0.3, 0.5, 1, 3`.

- `0.3` and `0.5` match the NFR targets, so `histogram_quantile` is most precise exactly
  where it is decided whether the target is met.
- `0.05`, `0.1` and `0.2` separate the fast path (saving the `Turno`) from an already
  degraded one.
- `1` marks a response the patient perceives as slow.
- `3` matches the `auth-service` timeout (`AbortSignal.timeout(3000)`); anything above 3 s
  falls into `+Inf`.

Saga (`appointments_saga_duration_seconds`): `1, 2, 5, 10, 30`. The outbox relay runs every
1 s, so the minimum is close to 1 s. In the worst case there are 6 attempts with a 3 s
timeout and 1 s wait, about 24 s, which falls into the 30 bucket.
