# CP4: pipeline security checks and a negative test for auth-service

## What is here

| File | Purpose |
|------|---------|
| `security.yml` | Workflow for pull requests with three gates: secret scan, dependency audit and authorization tests |
| `gitleaks.toml` | Rules for the secret scan: two project rules and an allowlist for example files |
| `internal-api-auth.negative.test.js` | Negative test for the three `/internal` routes of `auth-service` (jest and supertest) |

This workflow is only a suggestion for the team's code repository; nothing was changed there
today. To adopt it, copy `security.yml` to `.github/workflows/security.yml`, `gitleaks.toml` to `.github/gitleaks.toml`
and the test to `backend/tests/security/`.

## Story and criteria covered

- Story: **[security] Remove the default service credentials and give each internal caller its own**
  (P0, risk 9): <issue URL>.
- Criterion covered: a request to any `/internal/*` route without a valid `x-service-token`, or with
  a wrong one, gets 401, and so does any request when the service has no token configured.
- Extra check: the 401 body of `GET /internal/users/:id` has none of the profile or health fields
  (supports the Information disclosure story).
- Threat: S (Spoofing), risk 9, section 5.1 of `stride-<github-user>.md`.

## Run locally

You need Node.js 18+ and read access to the team code repository. The test needs no MongoDB
and no running service: every request is rejected before the database is used, and the
test sets `SERVICE_TOKEN` by itself.

```bash
git clone https://github.com/BrayanYara1/ProyectoDistribuidos2026.git
cd ProyectoDistribuidos2026
mkdir -p backend/tests/security
cp <path-to-fork>/13-week/workshop/04-security-ci/internal-api-auth.negative.test.js backend/tests/security/
cd backend
npm ci
npx jest tests/security --runInBand --verbose
```

Check that the test can fail: in `backend/services/auth-service/server.js` replace the condition of
the `/internal` middleware with `if (false) {`, run only the cases of `GET /internal/users/:id`
and restore the file with `git checkout`:

```bash
npx jest tests/security --runInBand --testTimeout=2500 -t "get /internal/users"
```

The other two gates, from the root of the code repository:

```bash
gitleaks detect --source . --no-git --config <path-to-fork>/13-week/workshop/04-security-ci/gitleaks.toml --redact
cd backend && npm audit --omit=dev --audit-level=critical
```

## Expected result

- With the guard in place: one suite and ten tests pass, and the exit code is 0. Jest also prints
  the time of each test and the total time.

```text
PASS tests/security/internal-api-auth.negative.test.js
  auth-service /internal API rejects callers without a valid service token
    ✓ does not leak profile or health fields in the 401 body of GET /internal/users/:id
    post /internal/reservations
      ✓ answers 401 when x-service-token is missing
      ✓ answers 401 when x-service-token is wrong
      ✓ fails closed with 401 when the service has no SERVICE_TOKEN configured
    delete /internal/reservations/r-1
      ✓ answers 401 when x-service-token is missing
      ✓ answers 401 when x-service-token is wrong
      ✓ fails closed with 401 when the service has no SERVICE_TOKEN configured
    get /internal/users/u-1
      ✓ answers 401 when x-service-token is missing
      ✓ answers 401 when x-service-token is wrong
      ✓ fails closed with 401 when the service has no SERVICE_TOKEN configured

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
```

- With the guard removed: `Tests: 4 failed, 6 skipped, 10 total`.
- `npm audit` exits with a non-zero code while the production dependencies have critical advisories,
  so the dependency gate starts at `critical` and should move to `high` after the updates
  (`security-rules.md`, A06). `gitleaks` reports the findings that already exist in the working tree.

## Real console output (CP8)

```text
PASS tests/security/internal-api-auth.negative.test.js
  auth-service /internal API rejects callers without a valid service token
    ✓ does not leak profile or health fields in the 401 body of GET /internal/users/:id (18 ms)
    post /internal/reservations
      ✓ answers 401 when x-service-token is missing (12 ms)
      ✓ answers 401 when x-service-token is wrong (5 ms)
      ✓ fails closed with 401 when the service has no SERVICE_TOKEN configured (4 ms)
    delete /internal/reservations/r-1
      ✓ answers 401 when x-service-token is missing (4 ms)
      ✓ answers 401 when x-service-token is wrong (3 ms)
      ✓ fails closed with 401 when the service has no SERVICE_TOKEN configured (3 ms)
    get /internal/users/u-1
      ✓ answers 401 when x-service-token is missing (4 ms)
      ✓ answers 401 when x-service-token is wrong (3 ms)
      ✓ fails closed with 401 when the service has no SERVICE_TOKEN configured (3 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.245 s
Ran all test suites matching /tests\/security/i.
```

## Workflow validation (CP8)

```text
git diff --check

No errors found.
Exit code: 0
```