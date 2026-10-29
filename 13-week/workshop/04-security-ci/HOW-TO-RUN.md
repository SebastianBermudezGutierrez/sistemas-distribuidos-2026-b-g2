# How to run the negative authorization test

## What it covers

- Service and routes: `auth-service`, `POST /internal/reservations`,
  `DELETE /internal/reservations/:reservationId` and `GET /internal/users/:id`.
- Story: "Give each internal caller its own service credential and compare it in constant
  time" (Spoofing, risk 6). Criterion 1: a request without a valid credential, or with a
  wrong one, gets 401, and so does any request when the service has no credential configured.
- Extra check for the Information disclosure story: the 401 body of `GET /internal/users/:id`
  contains none of the profile or health fields.

## Run it locally

```bash
git clone https://github.com/BrayanYara1/ProyectoDistribuidos2026.git
cd ProyectoDistribuidos2026
mkdir -p backend/tests/security
cp <path-to-fork>/13-week/workshop/04-security-ci/internal-api-auth.negative.test.js backend/tests/security/
cd backend
npm ci
npx jest tests/security --runInBand
```

The test sets `SERVICE_TOKEN` by itself and needs no MongoDB: every request is rejected
before the database is used. It uses the jest and supertest versions of `backend/package.json`.

## Check that the test can fail

In `backend/services/auth-service/server.js`, replace the condition of the `/internal`
middleware with `if (false) {`, run the command again and confirm that the tests fail.
Restore the file with `git checkout backend/services/auth-service/server.js`.

## Run the other gates locally

```bash
gitleaks detect --source . --no-git --config <path-to-fork>/13-week/workshop/04-security-ci/gitleaks.toml --redact
cd backend && npm audit --omit=dev --audit-level=critical
```

## Where the workflow goes

`security.yml` is a proposal for the team code repository. To adopt it, copy it to
`.github/workflows/security.yml` and copy `gitleaks.toml` to `.github/gitleaks.toml`.

## State of the gates on 2026-10-28

- Secret scan: the workflow scans only the commits of each pull request. The working tree
  already has findings with this configuration; they must be removed and rotated, not only
  gated.
- Dependency audit: `npm audit` reports 19 vulnerabilities in production dependencies
  (2 critical, 7 high, 10 moderate). The gate starts at `critical`; `security-rules.md`
  (A06) asks to patch critical and high ones in the sprint, so the level should move to `high`
  after that work.
