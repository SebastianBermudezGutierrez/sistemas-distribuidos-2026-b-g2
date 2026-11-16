<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       15-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 15

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Sebastian Bermudez Gutierrez
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Add the quality, operations, training and project control documentation to the team's docs repository, summarize the two class sessions (testing at scale and the MVP 3 release), and start moving the content to the other repositories according to the project domains.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-DOC-013 | Add the quality documentation | done | 11-quality (appt-mgmt-docs) |
| HU-DOC-014 | Add the operations documentation | done | 13-operations (appt-mgmt-docs) |
| HU-DOC-015 | Add the training documentation | done | 14-training (appt-mgmt-docs) |
| HU-DOC-016 | Add the project control documentation | done | 15-project-control (appt-mgmt-docs) |
| HU-DOC-017 | Add documentation content to the other repositories according to the domains | doing | https://github.com/code-corhuila/appt-mgmt-docs |
| HU-DOC-018 | Summarize session 1: testing at scale (contract, e2e, load and chaos) | done | 15-week/hu-status/15-week-session-1.png |
| HU-DOC-019 | Summarize session 2: release, shipping MVP 3 (production-grade) | done | 15-week/hu-status/15-week-session-2.png |

## 2. My individual contribution
- Added the content of the quality section in the docs repository (11-quality).
- Added the content of the operations section in the docs repository (13-operations).
- Added the content of the training section in the docs repository (14-training).
- Added the content of the project control section in the docs repository (15-project-control).
- Prepared a visual summary of session 1, "Testing at scale - contract, e2e, load and chaos": the test pyramid adapted to distributed systems, integration tests with real dependencies using Testcontainers, contract tests with Pact and a few key e2e journeys, load and performance testing with tools like k6, Gatling or JMeter compared against the SLOs, chaos engineering to prove resilience, and common mistakes such as only unit tests or mocking the database.
- Prepared a visual summary of session 2, "Release - shipping MVP 3 (production-grade)": what production-grade means (observability, zero-downtime deploy with rollback, security and proven resilience), promoting through develop, qa and main with the v3.0.0 tag, the operability checklist, a demo under stress (load, failure and recovery), the retrospective toward the final presentation, how MVP 3 is evaluated, and common mistakes.
- Started planning the content that has to go into the other repositories, organized by the domains we defined, so each domain keeps its own documentation.

## 3. Blockers and risks
- The documentation in the other repositories has not been added yet, so the content is still split between the docs repository and the domain repositories.
- The new sections need to stay consistent with the architecture, microservices and security documentation already written.
- The content has to be kept up to date as the services change, so it does not fall out of sync with the implementation.

## 4. Plan for next week
- Add the documentation content to the other repositories according to the domains.
- Review the new sections for consistency with the rest of the docs.
- Apply what we saw in class to MVP 3: load and chaos tests, the operability checklist and the v3.0.0 release with its CHANGELOG.
- Keep working with branches and PRs so every change is reviewed before merging.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [ ] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O)
- [ ] No secrets; config via environment variables

> Note: this week's work was documentation, not code, so most items do not apply. I left them unchecked until I confirm the commits and PRs for each section.

## 6. Evidence links
- Documentation repository: https://github.com/code-corhuila/appt-mgmt-docs
- Quality section: 11-quality
- Operations section: 13-operations
- Training section: 14-training
- Project control section: 15-project-control
- Session 1 summary: 15-week/hu-status/15-week-session-1.png
- Session 2 summary: 15-week/hu-status/15-week-session-2.png
