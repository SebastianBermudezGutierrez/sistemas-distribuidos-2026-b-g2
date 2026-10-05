<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       09-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 09

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Sebastian Bermudez Gutierrez
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Summarize the topics from the two class sessions (secure configuration/feature flags, and planning for secure and progressive delivery), review teammates' pull requests, and document the microservices section of the project.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-DOC-009 | Summarize the topics from the two class sessions (config/secrets/feature flags, planning) | done                           | 09-week/hu-status/09-week-sesion-1.png, 09-week-sesion-2.png     |
| HU-REV-001 | Review teammates' pull requests for the UML and DevOps documentation sections             | done                           | 08-uml, 10-devops                                                |
| HU-SVC-001 | Document the microservices section of the project                                         | done                           | 09-microservices                                                 |

## 2. My individual contribution
- Prepared a visual summary of session 1, "Configuration, Secrets and Feature Flags": managing configuration strictly by environment (12-factor), never committing secrets and rotating them through a secret store, validating required configuration at startup (fail fast), using feature flags to separate deploy from release, and common mistakes like secrets in git or silent startup failures.
- Prepared a visual summary of session 2, "Planning - secure config and progressive delivery": building a real secrets ownership/rotation plan, defining a feature-flag strategy, designing a canary + rollback plan for progressive delivery, and slicing this hardening work into testable MVP 2 stories.
- Reviewed teammates' pull requests for the `08-uml` section (UML/C4 diagrams and diagram index) and the `10-devops` section (environments and local setup documentation), checking content and giving feedback before merging.
- Took ownership of documenting the 09-microservices section.
- Set up the service documentation template and the services folder for the services defined so far.
- Wrote the general overview and service catalog for the section.
- Documented how services communicate, their dependencies, and who owns what data (communication-patterns.md, dependency-map.md, data-ownership-matrix.md).
- Documented the domain events exchanged between services and the rules for keeping service boundaries clean (event-catalog.md, service-boundary-rules.md).
- Documented the readiness checklist for services and how medical documents/files are stored (service-readiness-checklist.md, storage-and-documents.md).

## 3. Blockers and risks
- The branch with this documentation is still a few commits behind main, so it needs to be synced/rebased before the final merge.
- The microservices documentation needs to stay in sync with the API contract and the domain definitions as those evolve.
- Config/secrets management and feature-flag strategy (from this week's class topics) still need to be formally applied to the project's own services, not just documented as general theory.

## 4. Plan for next week
- Sync the 09-microservices branch with main and get PR #15 merged.
- Start applying the secrets-management and feature-flag practices seen in class to the actual service configuration.
- Keep reviewing teammates' PRs to help maintain consistency across the documentation repository.

## 5. Compliance self-check
- [x] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [ ] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

## 6. Evidence links
- Documentation repository: https://github.com/code-corhuila/appt-mgmt-docs
- Microservices section PR: https://github.com/code-corhuila/appt-mgmt-docs/pull/15
- Microservices section: 09-microservices
- UML section reviewed: 08-uml
- DevOps section reviewed: 10-devops
- Session 1 summary: 09-week/hu-status/09-week-sesion-1.png
- Session 2 summary: 09-week/hu-status/09-week-sesion-2.png
