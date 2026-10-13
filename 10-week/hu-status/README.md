<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       10-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 10

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: SEBASTIAN BERMUDEZ GUTIERREZ
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Summarize the topics from the two class sessions (persistence in distributed systems, and the MVP 2 release) and start contributing to the new repositories the team will use to support the microservices (infrastructure and workflows).
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-DOC-010 | Summarize the topics from the two class sessions (persistence in distributed systems, MVP 2 release) | done                  | 10-week/hu-status/10-week-session-01.png, 10-week-session-02.png    |
| HU-INF-001 | Set up the base structure of the infrastructure repository (Terraform, Docker Compose, ADRs, tests)    | doing                          | https://github.com/code-corhuila/appt-mgmt-infra         |
| HU-WF-001  | Set up the base structure of the workflow repository (source, Dockerfile, ADRs, tests)       | doing                          | https://github.com/code-corhuila/appt-mgmt-workflow                |

## 2. My individual contribution
- Prepared a visual summary of session 1, "Persistence in Distributed Systems": each service owns its own database, sagas to keep consistency without global transactions (orchestration vs choreography), the outbox pattern to publish events reliably, CQRS with eventual consistency for fast reads, and common mistakes like dual writes without an outbox or non-idempotent consumers.
- Prepared a visual summary of session 2, "Release - shipping MVP 2 (integrated system)": promoting the increment through environments (develop, qa, main) with a version tag, the MVP 2 release checklist, demoing the system including a failure path, retrospective and carry-over to Corte 3, how MVP 2 is evaluated (architecture, code quality, Scrum compliance), and common mistakes.
- Set up the base structure of the new `appt-mgmt-infra` repository, which the team will use for the infrastructure of the microservices.
- In `appt-mgmt-infra` I added the `.github` folder, `adrs`, `terraform`, `tests`, a `docker-compose.yml`, `package.json`, `CHANGELOG.md`, `release.md` and an updated `README.md`.
- Set up the base structure of the new `appt-mgmt-workflow` repository, which the team will use for the workflow service of the microservices.
- In `appt-mgmt-workflow` I added the `.github` folder, `adrs`, `src`, `tests`, a `Dockerfile`, `package.json`, `CHANGELOG.md`, `release.md` and an updated `README.md`.
- Included `CHANGELOG.md` and `release.md` in both repos so releases are versioned and reproducible, as covered in the MVP 2 session.
- No changes were made to the documentation repository this week.

## 3. Blockers and risks
- The infrastructure and workflow repositories are new and these changes are still local, so they need to be committed and pushed through branches and PRs before there is PR evidence to link.
- Their structure and conventions are still being defined and may change as the team uses them.
- The infrastructure and workflow setups need to stay aligned with the microservices documentation and the secrets and configuration practices seen in class.
- Applying the MVP 2 release checklist (version tag, CHANGELOG, failure demo) to the real services still depends on the rest of the team's progress on the services.

## 4. Plan for next week
- Commit and push the work in `appt-mgmt-infra` and `appt-mgmt-workflow` through branches and PRs.
- Continue developing both repositories.
- Align the infrastructure and workflows with the per-environment flow (develop, qa, main) seen in class.
- Keep configuration and secrets out of the repositories, handled per environment.
- Keep supporting the team with the MVP 2 release preparation.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [ ] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

## 6. Evidence links
- Infrastructure repository: https://github.com/code-corhuila/appt-mgmt-infra
- Workflows repository: https://github.com/code-corhuila/appt-mgmt-workflow
- Session 1 summary: `10-week/hu-status/10-week-session-01.png`
- Session 2 summary: `10-week/hu-status/10-week-session-02.png`
