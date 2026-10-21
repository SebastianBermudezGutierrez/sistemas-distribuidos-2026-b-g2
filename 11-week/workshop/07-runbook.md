# 07 - Runbook: `AppointmentsAvailabilityFastBurn`

Alert in `06-alerts.yml`, severity `page`. It fires when more than 1.44 % of the requests
to `/api/turnos` answered 5xx in the last hour and in the last 5 minutes (burn rate 14.4
on SLO 1, 99.9 %). Each hour of this alert costs about 2 % of the 30-day budget; left alone
the whole budget (30 failed requests, 43.2 min) is gone in about 50 hours.

Commands assume the CP3 module is applied (JSON logs with `trace_id`) and are run from the
folder with `docker-compose.yml`. With today's plain-text logs use `grep` instead of `jq`.

## 1. Symptoms

- Patients cannot book: the app gets 503 `Error al crear turno` (appointments-service) or
  502 `Servicio temporalmente no disponible` (gateway).
- `GET /health/ready` of `appointments-service` answers 503 `degraded`.
- ERROR lines in `appointments-service` (`Appointment creation failed`).
- Blind spot: if `appointments-service` is down it exposes no metrics and the alert stays
  silent. Check that its target is up in Prometheus (`up == 0`).

## 2. Confirm (first 3 minutes)

```promql
sum(rate(appointments_requests_total{route="/api/turnos", result="error"}[5m]))
/ sum(rate(appointments_requests_total{route="/api/turnos"}[5m]))
```

Above 0.0144 the alert is real. If `sum(rate(appointments_requests_total{route="/api/turnos"}[5m]))`
is 0, requests are not arriving: suspect the gateway or a dead service.

Find a failing trace, then follow it across the three services:

```bash
docker compose logs --since 15m appointments-service \
  | jq -R -c 'fromjson? | select(.level=="ERROR") | {timestamp,trace_id,event,message}'
docker compose logs --no-log-prefix backend appointments-service auth-service \
  | jq -R -c 'fromjson? | select(.trace_id=="<trace_id>")'
docker compose exec appointments-service node -e \
  "fetch('http://127.0.0.1:3002/health/ready').then(async r=>console.log(r.status, await r.text()))"
```

| What you see | Likely cause | Go to |
| :--- | :--- | :--- |
| `health/ready` shows `database` not `connected` | MongoDB | Mitigation 1 (restart `mongodb`) |
| 502 in `backend`, no line for that trace in `appointments-service` | `appointments-service` down or unreachable | Mitigation 1 |
| Errors start right after the `version` field changed in the logs | bad deploy | Mitigation 2 |
| 5xx with high latency and CPU pinned | saturation | Mitigation 3 |
| Only `auth.reservation.timeout`, no 5xx | `auth-service` slow. This is the saga path: `POST /api/turnos` still answers 202, so it is not this alert's cause | Mitigation 1 (restart `auth-service`), see `08-incident.md` |
| `broker: disconnected` | RabbitMQ down. `POST` still answers 202 (outbox keeps the events) | not a cause of this alert |

## 3. Mitigations, from lowest to highest risk

1. **Restart the failing container** (low risk):
   `docker compose restart appointments-service` (or `mongodb`, `auth-service`).
   Safe because `Turno` and its outbox events live in MongoDB (volume `mongodb_data`),
   saga messages are persistent and un-acked ones are redelivered, and the saga is
   idempotent (`sagaStatus: PENDING` check, upsert of the reservation). Only requests in
   flight during the restart are lost. Check `health/ready` returns 200 afterwards.
2. **Roll back the last deploy** (medium risk): only if the first 5xx appeared within
   about 30 minutes of a deploy. `git revert <commit>` then
   `docker compose up -d --build appointments-service`. Warn the Tech Lead first: a rollback
   that changes the outbox event format can leave pending events unreadable.
3. **Add a replica** (higher risk): `docker compose up -d --scale appointments-service=2`,
   only for saturation when the restart did not help. Every replica starts its own outbox
   relay (`setInterval(relayOutbox, 1000)`), so an event can be published twice. The saga
   tolerates it, but `saga.requested.received` will show duplicates.

Considered and discarded, because the architecture does not support them:

- **Feature flag:** the only flag is `DEMO_FAILURE_ENABLED`; it injects saga failures and
  never changes an HTTP status. Note that `docker-compose.yml` defaults it to `true`.
- **Circuit breaker:** not implemented. `authClient.js` only has the 3000 ms timeout.
- **Autoscaling:** there is no orchestrator, only the manual `--scale` of step 3.

## 4. Escalation

Roles come from `01-context/overview.md` of the docs repo (names are still `[Name]` there).

| After | Who | Why |
| :--- | :--- | :--- |
| 0 min | Backend/DevOps on call | owns the page, opens the incident thread, runs steps 2 and 3 |
| 15 min | Tech Lead | no cause found, or the ratio does not fall after mitigation 1. Always before a rollback |
| 30 min | Product Owner | patients affected for 30 min or 75 % of the budget used (`05-slo.md`); decides what to tell the clinics |

## 5. Verify recovery

1. The error ratio of step 2 stays below 0.001 (burn rate 1) for 15 minutes.
2. The alert resolves by itself about 5 minutes after the errors stop (the 5-minute window clears first).
3. Book a test appointment: `POST /api/turnos` answers 202 and the `Turno` ends `Confirmado`.
4. No stuck messages: `docker compose exec rabbitmq rabbitmqctl list_queues name messages`
   shows 0 in `appointments.saga.v1` and in `appointments.saga.v1.dead`.
5. No pending appointments:
   `docker compose exec mongodb mongosh --quiet SaludActiva_turnos --eval "db.turnos.countDocuments({sagaStatus:'PENDING'})"` returns 0.
6. If more than 5 % of the budget was used, write a blameless postmortem (format in `08-incident.md`).