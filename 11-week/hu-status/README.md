<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       11-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 11

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Sebastian Bermudez Gutierrez
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Make the appointment-booking journey (HU-007) observable: trace context, structured logs, metrics, SLOs, burn-rate alerts, a runbook and an incident drill.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-007 | Request Medical Appointment: observability of its journey (CP1-CP9: journey map, log contract, instrumentation module with 8 tests, metric catalog, SLOs, burn-rate alerts, runbook, incident drill) | doing | https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/tree/main/11-week/workshop |

## 2. My individual contribution
- Mapped the critical journey `POST /api/turnos` (Android app -> backend -> appointments-service -> saga -> auth-service) with a hop table, sequence diagram and span tree (`01-journey.md`).
- Wrote the structured log contract with required fields, domain fields and a "never log" list (`02-log-contract.md`).
- Built the instrumentation module for `appointments-service` (trace context, logger, metrics, `authClient.js`). Its 8 tests pass (`03-instrumentation/`).
- Defined the golden signals, the metric catalog, the cardinality rules and the histogram buckets (`04-metrics.md`).
- Defined 3 SLOs (availability 99.9 %, latency 95 % under 300 ms, saga 99.5 %), the error budget and its policy (`05-slo.md`).
- Wrote the fast-burn (14.4) and slow-burn (6) alert rules, validated with `promtool check rules` (`06-alerts.yml`, `06-alert-policy.md`).
- Wrote the runbook for the fast-burn alert with mitigations limited to what our architecture supports (`07-runbook.md`).
- Ran an incident drill (`auth-service` answers in 3 s for 25 % of the calls) and a blameless postmortem with 3 follow-up stories (`08-incident.md`).
- Main finding of the drill: no alert fires, because `POST /api/turnos` answers 202 before calling `auth-service`.

## 3. Blockers and risks
- The module is not applied to the real service yet: `appointments-service/server.js` has no `/metrics`.
- `docker-compose.yml` has no Prometheus, so the alert rules cannot run end to end.
- `prom-client` is not in `backend/package.json`, while `04-metrics.md` mentions its default metrics.
- Nothing creates the `traceparent` today (neither the app nor `backend`), so real traces start in `appointments-service`.
- Changing `server.js` and `messaging.js` can conflict with teammates' branches.
- Scaling `appointments-service` duplicates the outbox relay; the saga is idempotent, but it must be watched.
- My traffic numbers are estimates (1,000 `POST` per day, 25 % independent failures); the minimum-traffic guards in the alerts are assumptions.
- I did not run `docker compose` or the full runbook end to end.

## 4. Plan for next week
- HU-OBS-00: apply the instrumentation module to `appointments-service` (`GET /metrics` shows `appointments_requests_total`).
- HU-OPS-04: add Prometheus to `docker-compose.yml` and set `DEMO_FAILURE_ENABLED` to `false` by default.
- HU-OBS-03: add `appointments_saga_outcomes_total` so SLO 3 can be measured.
- HU-OBS-01: add `appointments_auth_calls_total{outcome}` and the alert `AppointmentsAuthTimeoutRatio` (more than 10 % timeouts in 30 minutes), tested with `promtool test rules`.
- HU-SAGA-02: exponential backoff in the saga retries (1, 2, 4, 8, 16 s) so a 30 s `auth-service` outage does not reach the dead-letter queue.
- Later: create the `traceparent` in the gateway; evaluate a circuit breaker once the metrics exist.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Testable acceptance criteria
- [x] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

## 6. Evidence links
- Workshop folder: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/tree/main/11-week/workshop
- Journey: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/blob/main/11-week/workshop/01-journey.md
- Log contract: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/blob/main/11-week/workshop/02-log-contract.md
- Instrumentation: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/tree/main/11-week/workshop/03-instrumentation
- Metrics: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/blob/main/11-week/workshop/04-metrics.md
- SLOs: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/blob/main/11-week/workshop/05-slo.md
- Alerts: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/blob/main/11-week/workshop/06-alerts.yml
- Runbook: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/blob/main/11-week/workshop/07-runbook.md
- Incident drill and postmortem: https://github.com/SebastianBermudezGutierrez/sistemas-distribuidos-2026-b-g2/blob/main/11-week/workshop/08-incident.md
- Reflection document: https://docs.google.com/document/d/1j0cZ2Ndo5YoIX5X290k3AA1_QPRXhXR_XjIIh3LNWT0/edit
