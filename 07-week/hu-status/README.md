<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       07-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 07

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Sebastian Bermudez Gutierrez
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Finalize the selection of the domains the project will use, keep the project's ADR up to date as these decisions get applied, and start adjusting the project (including the frontend) for the shift from a monolith to a microservices architecture.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-DOM-004 | Finalize the selection of domains for the project                    | done                           | 02-domain                          |
| HU-DOM-005 | Review the changes needed on the frontend to divide screens across the defined domains, as part of the monolith-to-microservices shift | doing |           |
| HU-DOM-006 | Start making changes to the documentation repository through child branches and Pull Requests | doing | https://github.com/code-corhuila/appt-mgmt-docs |

## 2. My individual contribution
- Took part in the team discussion to finalize the domains the project will use, proposing and defending one of the domains that ended up being selected.
- The team also started adjusting the project for the shift from a monolith to a microservices architecture; my part in this was reviewing the frontend and looking at what changes need to be made to the screens so they can be divided/organized according to the domains we defined.
- We also started making changes to the documentation repository through child branches and Pull Requests instead of committing directly, to keep a cleaner history and review process.

## 3. Blockers and risks
- As domains get finalized, some previously written documentation (architecture, data models) may need small adjustments to stay consistent.
- Moving from a monolith to microservices means the frontend screens need to be reorganized around the defined domains, and we're still reviewing exactly what changes that requires.

## 4. Plan for next week
- Finish syncing the rest of the documentation (architecture, data, requirements) with the finalized domain selection.
- Continue reviewing and applying the frontend changes needed for the microservices split.
- Start moving from domain definition into implementation planning for the first domain(s).

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [x] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [ ] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [x] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

## 6. Evidence links
- Repository: https://github.com/code-corhuila/appt-mgmt-docs
- Domain folder: `02-domain`
