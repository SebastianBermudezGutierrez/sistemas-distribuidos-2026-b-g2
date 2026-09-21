<!-- HU-STATUS TEMPLATE - do NOT remove the <!-- ... --> markers or the table headers.
     Your weekly grade is read AUTOMATICALLY from this file:
       06-week/hu-status/README.md  (inside YOUR fork). English. -->

# Weekly Status - Week 06

<!-- CONFIG-START - must match your profile repo (username/username) CONFIG -->
- FULL_NAME: SEBASTIAN BERMUDEZ GUTIERREZ
- GITHUB_USER: SebastianBermudezGutierrez
- TEAM: Salud Activa
- SPRINT_GOAL: Research and define the core domains and cross-cutting domains the project will be built around, apply improvements to the MVP to meet code quality requirements, and start dividing the documentation content across each domain.
<!-- CONFIG-END -->

## 1. User stories worked this week
| HU ID | Title | Status (todo/doing/done) | Evidence (PR or commit URL) |
|---|---|---|---|
| HU-DOM-001 | Research and define the project's core and cross-cutting domains | done | 02-domain |
| HU-DOM-002 | Apply improvements to the MVP to meet code quality requirements | doing | 02-domain |
| HU-DOM-003 | Start dividing documentation content across each domain | doing | 02-domain |

## 2. My individual contribution
- Researched how to properly identify and separate the core domains and cross-cutting (transversal) domains for the project.
- Worked with the team to agree on the concrete domains for Salud Activa and which concerns should be treated as cross-cutting rather than tied to a single domain.
- Took the domain definitions the team agreed on and wrote them up, documenting them in `02-domain`.
- Started applying improvements to the MVP to bring it in line with code quality requirements.
- Began dividing the documentation content across each of the domains we defined, so each domain has its own clearly scoped set of information.

## 3. Blockers and risks
- Some domain boundaries may still need adjustment once we get further into implementation and see how the domains actually interact.
- Cross-cutting domains (like notifications or security) need to be clearly scoped so they don't end up leaking into the core domain logic.

## 4. Plan for next week
- Validate the domain definitions against the user stories and requirements already documented.
- Start refining the domain model (entities, aggregates) based on this domain split.
- Keep aligning the architecture documentation with these domain decisions.

## 5. Compliance self-check
- [ ] Conventional Commits - `type(scope): summary`
- [ ] Per-environment HU branch + PR to that environment (hu-xxx-dev -> develop, ...)
- [ ] Testable acceptance criteria
- [ ] Tests added/updated (unit / integration)
- [x] DDD / hexagonal boundaries respected (domain has no I/O)
- [x] No secrets; config via environment variables

## 6. Evidence links
- Repositorio documentacion: https://github.com/code-corhuila/appt-mgmt-docs.git
- Domain folder: `02-domain`
- Repositorio MVP-1: https://github.com/code-corhuila/appointment-management-app.git
