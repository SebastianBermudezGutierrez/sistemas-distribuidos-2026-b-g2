# 06 - Alert policy for SLO 1 (availability of `/api/turnos`)

Rules are in `06-alerts.yml`. They use `appointments_requests_total{route,result}` from `04-metrics.md`. Budget: 99.9 % over 30 days = 0.1 % = 30 failed requests or 43.2 minutes of total outage (`05-slo.md`).

## 1. Budget behind each alert

| Alert | Burn rate | Windows | Error ratio that fires it | Budget spent at that pace | In requests | In minutes of total outage | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AppointmentsAvailabilityFastBurn` | 14.4 | 1 h and 5 min | 14.4 x 0.1 % = 1.44 % | 14.4 x 1 h / 720 h = 2 % | 0.6 | 0.86 (about 52 s) | critical |
| `AppointmentsAvailabilitySlowBurn` | 6 | 6 h and 30 min | 6 x 0.1 % = 0.6 % | 6 x 6 h / 720 h = 5 % | 1.5 | 2.16 | warning |

- 720 h is the 30-day window.
- At burn rate 14.4 the whole budget lasts 50 hours (720 / 14.4). At burn rate 6 it lasts 5 days.
- The fast alert is for a sharp failure and the slow alert is for a leak that is small but constant.
- The long window shows that the burn is big enough. The short window shows that it is still happening, so the alert stops soon after the service recovers.

## 2. Low traffic: what to expect

`05-slo.md` estimates about 42 requests per hour on `/api/turnos`.

- 1.44 % of one hour of traffic is 0.6 requests, so one single 503 in an hour (1 of 42, 2.4 %) already goes over the fast threshold. In the 5 min window, one failure among about 3.5 requests is also over the threshold. The fast alert can fire with one failed request.
- The slow alert needs about two failures in 6 hours (0.6 % of about 252 requests is 1.5).
- The last condition of each rule (at least 20 requests in 1 h, at least 100 in 6 h, about half of the expected traffic) stops the alerts at night, when two requests are enough to make a big percentage.
- Decision for the first month in QA: measure the real traffic with `appointments_requests_total`. If the alerts are too noisy, raise the minimum or relax the SLO to 99.5 % (thresholds become 7.2 % and 3 %).

## 3. Cause-based alerts we will NOT create

| Alert | Why not |
| :--- | :--- |
| High CPU in `appointments-service` (or `nodejs_eventloop_lag_p99_seconds` above a limit) | CPU can be high while no request fails or is slow, so it would page without user impact. When patients are hurt, the burn-rate alert already fires. CPU stays on the dashboard as the saturation signal of `04-metrics.md`. |
| RabbitMQ disconnected (`/health/ready` answers 503 with `broker: disconnected`) | The service keeps saving the `Turno` and its outbox event, patients still get 202, and the service reconnects by itself. A broker outage hurts the user only if the saga ends in the dead-letter queue, and that is the symptom measured by SLO 3. |
