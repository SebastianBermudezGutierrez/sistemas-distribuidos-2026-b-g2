<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       14-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 14

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Sebastian Bermudez Gutierrez
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Summarize the topics from the two class sessions (CI/CD pipelines and quality gates, and planning the pipeline, DoD as gates and branch protection) and defend my work from week 11 and week 13.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-DOC-011 | Summarize session 1: CI/CD, pipelines and quality gates | done | 14-week/hu-status/14-week-session-01.png |
| HU-DOC-012 | Summarize session 2: planning the pipeline, DoD as gates and branch protection | done | 14-week/hu-status/14-week-session-02.png |
| HU-DEF-001 | Defend my work from week 11 and week 13 | done | In-class defense (week 11 and week 13 work) |

## 2. My individual contribution
- Prepared a visual summary of session 1, "CI/CD - Pipelines and Quality Gates": the difference between CI, continuous delivery and continuous deployment, a pipeline with build, test and quality gates that blocks the merge when a gate fails, and the quality gates themselves (lint, type check, tests, coverage threshold, security scan and no TODO/FIXME).
- In the same summary I covered the trunk-based flow with PR checks and a protected main, the DORA metrics (deployment frequency, lead time for changes, change failure rate and time to recovery), the "broken main" scenario, and common mistakes such as manual builds, gates that only warn, and direct pushes to main.
- Prepared a visual summary of session 2, "Planning - your pipeline, DoD as gates and branch protection": turning the Definition of Done into a machine checklist where every item has a verifier, branch protection rules (no direct pushes, required checks, at least one approval, branch up to date), and how to design the pipeline for many services (auth-service, appointments-service and gateway with build, test and scan, plus contract tests, image push and deploy per environment).
- In that summary I also covered how to slice the CI/CD work for MVP 3 into stories, the "I only merge" scenario where a gate gets skipped under pressure, and common mistakes such as a DoD without gates, optional gates, one giant pipeline and no branch protection.
- Defended my work from week 11 and week 13 in class, including the security analysis of the auth-service internal API from week 13: attack surface, STRIDE threats, security stories and the negative authorization test.

## 3. Blockers and risks
- The security stories from week 13 (default credential, profile data crossing the boundary, and credentials per caller and route) still need to be implemented.
- The pipeline, quality gates and branch protection seen in class are not yet applied to the project's services.
- MVP 3 is next week, so the CI/CD work needs to be sliced and started soon to avoid a rushed delivery.

## 4. Plan for next week
- Turn our Definition of Done into automated gates: lint, tests, coverage, security scan and no TODO/FIXME.
- Set up branch protection on the repositories: no direct pushes, required checks and at least one review.
- Design the pipeline per service (auth-service, appointments-service and gateway) with path filters and a shared release step.
- Implement the week 13 security stories and keep the security workflow running on PRs.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [ ] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O)
- [ ] No secrets; config via environment variables

## 6. Evidence links
- Session 1 summary: 14-week/hu-status/14-week-session-01.png
- Session 2 summary: 14-week/hu-status/14-week-session-02.png
- Week 11 work defended: 11-week/workshop
- Week 13 work defended: 13-week/workshop
