# PROJECT_MANIFEST.md
### AKB1 Delivery Command Center v1 | iCloud Recovery Anchor | Created: 2026-04-24

> If you are reading this after an OS reinstall and iCloud Drive restore, start here. This file tells Claude Code what this project is, where it stands, and how to resume work without losing context.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| Project name | AKB1 Delivery Command Center |
| Public title | AKB1 Delivery Command Center |
| Repo slug | AKB1_Delivery_Command_Center |
| Short code | AKB1-DCC |
| Version (current) | v0.3.0-backend (M6 slice 5b closed; 138 tests green) |
| Version (target for public launch) | v1.0.0 |
| Owner | Adi Kompalli |
| Email | deva.adi@gmail.com |
| Role in project | Product owner |
| Architect | Claude (acting as enterprise-wide solution architect) |
| Created | 2026-04-24 |
| Tagline | Portfolio intelligence for delivery leaders. Ten programmes. Three hundred people. One decision cockpit. |

## 2. Location

| Scope | Path |
|-------|------|
| Project root | /Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/AKB1_Delivery_Command_Center/ |
| iCloud backup | Yes, via Documents sync. Recovers to the same path on a restored Mac. |
| GitHub repo | Not yet created. Private until v1.0.0 tag, then flipped public. |
| Parent workspace | AKB1 Base — Chief of Staff Cowork workspace. Project is colocated with the Chief of Staff hub. |

## 3. Current Phase

**Phase 3 of 4: Backend build (M6 in progress, slice 5b of N closed).** Phases 1 and 2 (wireframes, PRDs/architecture/test-strategy) closed. v1.0.0 launch target 2026-06-10. Current state: 138 backend tests green, 5 migrations applied (head: 005_http_method_get), 3 mutating + 4 read endpoints, AP flag enforcement live for the first AP-gated endpoint (GET /audit/search), auth perimeter complete (Redis-backed per-email lockout, per-IP rate limit middleware, stateless double-submit CSRF middleware) and ready for M7 frontend kickoff. See docs/state/BUILD_STATE.md and docs/state/SESSION_LOG.md.

**Original Phase 1 of 4: Wireframe design (CLOSED 2026-04-25 at rev 4).**

| Phase | What happens | Gate to next phase |
|-------|-------------|--------------------|
| 1. Wireframe | Build 16 HTML wireframes (1 index + 15 tabs), iterate to Adi approval | Explicit written sign-off on all wireframes |
| 2. Documentation | PRDs, architecture, test strategy, multi-agent spec | Sign-off on documentation suite |
| 3. Development | Claude Code builds backend, frontend, infra via specialised subagents | v1.0.0 regression gates green |
| 4. Release | Flip repo public, LinkedIn launch, monitor | Launch announcement live |

## 4. Locked Decisions (see DECISION_LOG.md for full log)

| ID | Decision | Locked on |
|----|----------|-----------|
| D-001 | Name: AKB1 Delivery Command Center | 2026-04-24 |
| D-002 | Tech stack: Next.js 14 + FastAPI + Postgres + Redis in Docker | 2026-04-24 |
| D-003 | Scope: 14 tabs (12 from v5.8 plus 3 new) | 2026-04-24 |
| D-004 | Repo visibility: Private until v1.0.0, then public | 2026-04-24 |
| D-005 | Project root: inside AKB1 Base Cowork workspace | 2026-04-24 |

## 5. Milestone Map

| ID | Milestone | Owner | State |
|----|-----------|-------|-------|
| M0 | Project scaffold, manifest, memory anchors | Claude (Cowork) | In progress, 2026-04-24 |
| M1 | 16 wireframes built, reviewed, approved | Claude (Cowork) | Planned |
| M2 | Master PRD plus 14 tab PRDs plus 3 cross-cutting PRDs | Claude (Cowork) | Planned |
| M3 | Architecture suite: ADR, data flow, security, deployment, multi-agent | Claude (Cowork) | Planned |
| M4 | Test strategy master plus 8 test plans | Claude (Cowork) | Planned |
| M5 | Nine subagent markdown files ready in .claude/agents/ | Claude (Cowork) | Planned |
| M6 | Backend build (FastAPI, Postgres schema, seed generator, intelligence engine) | Claude Code | Planned |
| M7 | Frontend build (Next.js app, 14 tab views, intelligence layer UI) | Claude Code | Planned |
| M8 | Integration, Playwright, axe-core, performance benchmark at 1000 concurrent | Claude Code | Planned |
| M9 | v1.0.0 release: tag, flip public, LinkedIn launch kit published | Claude Code plus Adi | Planned |

## 6. Module Registry

Populated as modules are built. Each module carries a status.

| Module | Folder | Status | Notes |
|--------|--------|--------|-------|
| Project scaffold | /AKB1_Delivery_Command_Center/ | In progress | |
| Wireframe library | /docs/wireframes/ | Planned | 16 HTML files planned |
| PRD suite | /docs/prd/ | Planned | 18 PRD files planned |
| Architecture suite | /docs/architecture/ | Planned | 7 architecture files planned |
| Test strategy | /docs/test-strategy/ | Planned | 9 test plan files planned |
| Backend service | /backend/ | Not started | FastAPI, created in M6 |
| Frontend app | /frontend/ | Not started | Next.js, created in M7 |
| Infra | /infra/ | Not started | Docker compose, Caddy, K8s, created in M6 |
| Subagent roster | /.claude/agents/ | Planned | 9 agents planned |
| LinkedIn launch kit | /docs/linkedin/ | Planned | Built in M9 |

## 7. Ecosystem Dependencies

| Dependency | Version | Purpose | Required for |
|------------|---------|---------|--------------|
| Python | 3.12 or 3.14 | Backend runtime | M6 onward |
| Node.js | 20 LTS | Frontend runtime | M7 onward |
| Postgres | 16 | Primary datastore | M6 onward |
| Redis | 7 | Sessions, cache | M6 onward |
| Docker | 26+ | Containerisation | M6 onward |
| Docker Compose | v2.27+ | Local orchestration | M6 onward |
| Playwright | 1.45+ | E2E testing | M8 |
| pytest | 8+ | Backend unit tests | M6 onward |
| Vitest | 2+ | Frontend unit tests | M7 onward |
| axe-core | 4.9+ | Accessibility audit | M8 |
| Ollama local | any | Intelligence layer fallback | M6 onward, optional |
| LiteLLM proxy | localhost:4000 | OpenAI compatible endpoint | M6 onward, optional |

## 8. Recovery Commands

After an OS reinstall plus iCloud Drive restore, run the following inside iTerm2 to resume work.

```bash
# navigate to project root
cd "/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/AKB1_Delivery_Command_Center"

# verify state files exist
ls -la PROJECT_MANIFEST.md CLAUDE.md docs/state/

# load Claude Code with the project context
claude
```

Claude Code opens, reads CLAUDE.md, discovers PROJECT_MANIFEST.md, and reconstructs context from state files. No manual briefing needed.

## 9. Key Files Registry

| File | Purpose |
|------|---------|
| PROJECT_MANIFEST.md | This file. iCloud recovery anchor. |
| CLAUDE.md | Project-scoped Claude Code operating rules and memory. |
| README.md | Public-facing project overview (created in M9). |
| SECURITY.md | Security policy (created in M3). |
| PRIVACY.md | Zero telemetry declaration (created in M3). |
| LICENSE | AGPL-3 proposed (created in M9). |
| CHANGELOG.md | Semver log (created in M9). |
| docs/state/BUILD_STATE.md | Session-level state. Updated every session. |
| docs/state/DECISION_LOG.md | Every architectural decision with rationale. |
| docs/state/MILESTONE_STATUS.md | Milestone gate status and test results. |
| docs/state/RISK_REGISTER.md | Open risks and mitigations. |
| docs/state/TECH_DEBT.md | Deferred items, created during build. |
| docker-compose.yml | Local stack orchestration (created in M6). |

## 10. Session Handoff Protocol

At the end of every substantive session, the following four files must be current:

| File | Must reflect |
|------|--------------|
| BUILD_STATE.md | Percent complete per module as of session end |
| DECISION_LOG.md | Any new decision made in the session |
| MILESTONE_STATUS.md | Gate status if a milestone opened, closed, or progressed |
| PROJECT_MANIFEST.md | Current version and phase, if changed |

Failure to update these files before session end is a hard failure per Adi's rule set.

## 11. Hard Rules (non-negotiable across every session)

No em dashes anywhere. No emojis in source code, commits, filenames, or documentation (exception: LinkedIn launch copy only, if Adi approves). Human voice, never AI tells. No deletes or executions without Adi's explicit consent. Write to memory on every event. Wireframes approved before code. Senior practitioner tone, never basics.

## 12. Versioning

Semantic versioning starting at v0.1.0-wireframe. Progression:
v0.1.0-wireframe (wireframe phase), v0.2.0-docs (documentation phase), v0.3.0-backend (backend alpha), v0.4.0-frontend (frontend alpha), v0.5.0-integration (integration), v0.9.0-rc (release candidate), v1.0.0 (public launch).

---

*File owner: Claude. Last updated: 2026-04-24. Update on every version bump, phase transition, or module status change.*
