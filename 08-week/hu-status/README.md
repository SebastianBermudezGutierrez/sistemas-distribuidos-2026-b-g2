<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       08-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 08

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: Sebastian Bermudez Gutierrez
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Consolidate the topics covered in both class sessions (Agile & DevOps for distributed teams, and planning with story mapping and estimation) and move forward with the Salud Activa API contract so backend and frontend share a single reference.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-DOC-008 | Summarize the topics from the two class sessions (Agile & DevOps, Planning) as visual summaries   | done                           | 08-week/hu-status/08-week-sesion-1.png, 08-week-sesion-2.png        |
| HU-API-001 | Advance the Salud Activa API contract (`api-contract.md`)                                         | doing                          | https://github.com/code-corhuila/appt-mgmt-docs                     |

## 2. My individual contribution
- Prepared a visual summary of session 1, "Agile & DevOps for Distributed Teams": Scrum flow (backlog, sprint, increment, ceremonies and roles), how to write a good user story with testable acceptance criteria, the DevOps cycle and its "you build it, you run it" culture, coordination practices for distributed teams (ownership, small batches, fast feedback with CI, async communication with ADRs and PRs), flow metrics (WIP, lead time, cycle time, throughput), and common mistakes to avoid.
- Prepared a visual summary of session 2, "Planning - Story Mapping, Estimation and MVP 2 Commitment": story mapping to see the whole user journey, relative estimation with story points and planning poker, handling cross-service dependencies with a contract-first approach, committing realistically based on velocity, and common planning mistakes.
- Worked on the `api-contract.md` for the project, which defines the API conventions the team will follow: `/api/v1` versioning, UUID identifiers, `camelCase` JSON, date and time formats, pagination, JWT authentication, appointment statuses, HTTP status codes, and a common error format.
- Contributed to documenting the appointment endpoints in the contract (list, get details, request, and cancel), including their requests, responses, errors, and validation and business rules, along with the offline behavior, OpenAPI alignment requirements, and traceability to the user stories.
- Helped record the pending gaps in the contract (doctor as text or reference, specialty catalog, conflict detection, offline sync policy, endpoint testing, and OpenAPI validation) so they can be assigned and closed.

## 3. Blockers and risks
- The API contract still has open gaps that need confirmation from the responsible parties, so it cannot be considered closed yet.
- It is still undecided whether the appointment functionality will be an independent service or part of a modular monolith, which affects how the contract will be implemented.
- The offline synchronization policy between the mobile app and the backend still needs to be agreed.
- The OpenAPI specification needs to be validated against the contract to avoid inconsistencies.

## 4. Plan for next week
- Work with the team on closing the pending gaps in the API contract.
- Check that the OpenAPI specification matches the contract.
- Apply what we saw in class (story mapping, relative estimation, contract-first) to plan the next MVP.
- Keep syncing the frontend changes with the endpoints defined in the contract.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [x] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [ ] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

## 6. Evidence links
- Documentation repository: https://github.com/code-corhuila/appt-mgmt-docs
- Session 1 summary: `08-week/hu-status/08-week-sesion-1.png`
- Session 2 summary: `08-week/hu-status/08-week-sesion-2.png`
