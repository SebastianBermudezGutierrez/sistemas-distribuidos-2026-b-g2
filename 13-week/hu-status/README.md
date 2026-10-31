<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       13-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 13

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Sebastian Bermudez Gutierrez
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Analyze the security of my claimed boundary, the internal API of auth-service, by mapping its attack surface, running a STRIDE analysis, turning the top risks into security stories, and adding a security workflow with a negative authorization test.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-SEC-001 | Claim the auth-service internal API boundary and create the config file | done | CLAIM_ISSUE in the -docs repository, config file |
| HU-SEC-002 | Map the attack surface: data flow diagram, trust boundaries, asset inventory and entry points | done | 01-attack-surface.md |
| HU-SEC-003 | Run the STRIDE analysis of the boundary with six threats, scores and mitigations | done | 05-architecture/security/stride-SebastianBermudezGutierrez.md (PR in -docs) |
| HU-SEC-004 | Define, refine and link the three security stories (S, I, E) with acceptance criteria | done | Issues in the -docs repository, listed in STORIES |
| HU-SEC-005 | Add the security workflow, secret scan rules and a negative authorization test | done | 04-security-ci/, 04-security-ci/HOW-TO-RUN.md |
| HU-SEC-006 | Review a teammate's PR and answer the review of my own PR (residual risk and references) | done | PR review comment, my PR branch |
| HU-SEC-007 | Write the implementation plan for the security stories | done | Reflection document, hu-status/README.md |

## 2. My individual contribution
- Claimed the boundary I analyzed: the internal API of auth-service (GET /internal/users/:id, POST /internal/reservations and DELETE /internal/reservations/:reservationId), called by the backend gateway and by appointments-service with a shared x-service-token. I created the config file for it (CP0).
- Built the data flow diagram with eight trust boundaries, the asset inventory and the entry points in 01-attack-surface.md (CP1).
- Ran the STRIDE analysis of the boundary and opened a PR with six threats, each with attack path, score and mitigation (CP2).
- Ranked the threats by risk: Spoofing (9), Information disclosure (9), Elevation of privilege (6), Repudiation (6), Tampering (4) and Denial of service (4).
- Turned the three highest risks into three security stories in the team backlog, with acceptance criteria, labels and priority (CP3).
- Refined the stories and linked them with related issues from teammates (CP7).
- Added the security workflow, the secret scan rules and a negative authorization test in 04-security-ci/: requests to /internal/* without a valid credential must get 401 (CP4).
- Ran the negative test on my machine, validated the workflow and documented the steps in HOW-TO-RUN.md (CP8).
- Left a review comment on a teammate's pull request (CP5) and answered the review of my own PR, adding the residual risk and references (CP6).
- Wrote the implementation plan in the reflection document (CP9).

## 3. Blockers and risks
- The default service credential that is still in the repository is the top risk (S, score 9) until the security story that removes it is implemented.
- The shared x-service-token opens every internal route, so a compromised gateway has too much power until credentials are split per caller and per route (E, score 6).
- The negative test only covers the first threat (calls without a valid credential). The other five threats still have no automated test.
- The three stories depend on changes in auth-service and in the callers, so they need coordination with the teammates who own those services.
- Residual risk remains after the proposed mitigations and is documented in the PR.

## 4. Plan for next week
- Implement the three security stories in order of risk: remove the default credential (S), reduce the profile data crossing the boundary to what is needed (I), and split credentials per caller and route (E).
- Add the audit trail for /internal/* calls (R) and extend the negative tests to cover more threats.
- Keep the security workflow running on PRs so secrets and unauthorized calls are caught early.
- Keep reviewing teammates' PRs for security issues.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Testable acceptance criteria
- [x] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O)
- [ ] No secrets; config via environment variables

> Note: the secrets item is not checked because this week's analysis found a default service credential in the repository. The secret scan rules and the first security story are meant to fix that.

## 6. Evidence links
- Attack surface: 01-attack-surface.md
- STRIDE analysis: 05-architecture/security/stride-SebastianBermudezGutierrez.md (PR in the -docs repository)
- Security stories: issues in the -docs repository, listed in STORIES
- Security CI: 04-security-ci/ and 04-security-ci/HOW-TO-RUN.md