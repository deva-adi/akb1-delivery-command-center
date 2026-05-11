# CHANGELOG

All notable changes to AKB1 Delivery Command Center are recorded here. Format based on Keep a Changelog. Versioning follows semver.

## [v1.0.0] | 2026-05-11 | First public release

### Summary

Portfolio intelligence for delivery leaders. Ten programmes. Three hundred people. One decision cockpit. Fourteen tabs across six roles with a real intelligence layer on every surface. 814 tests green. Zero critical CVEs.

### Backend (FastAPI plus Postgres 16 plus Redis 7)

- Twelve endpoints across five routers: admin (threshold register, tier config), audit (search, entry), auth (login), people, programmes (raids, milestones, health per code), health.
- Nine Alembic migrations (001 through 009): programmes, people, audit trail, escalation tier config, threshold calibration register, person programme assignments (join table), programme raids, programme milestones, programme health snapshots.
- Seed generator: 10 programmes, 300 people, deterministic via numpy RandomState(20260424). SHA-256 locked. Byte-identical on every fresh clone.
- Auth perimeter: HS256 JWT (PyJWT 2.12.1), Redis-backed per-email lockout (15 min TTL), per-IP rate limiting (120 req/min default), stateless double-submit CSRF middleware.
- Role model: PortfolioOwner, DeliveryDirector, ProgrammeManager, FinanceLead, HRBusinessPartner, ReadOnly. AP flag for audit-scoped endpoints.
- Audit trail: append-only audit_trail_entries table with before/after JSON and shallow diff. Every mutation writes a row. AP-gated read via GET /api/v1/audit/entry/{id}.
- 252 pytest green (221 integration, 31 contract).

### Frontend (Next.js 14 App Router, TypeScript strict, Tailwind)

- Fourteen tabs rendered and role-gated: Executive, Delivery Health, Risk and RAID, Workforce Intelligence, Financials, Flow and Velocity, Ops and SLA, Client Health, Governance Operating Model, Capability and Supply Chain, AI Governance, Audit Trail Console, Backlog Health, plus home/login shell.
- Intelligence card on every tab: What, Why, Act blocks computed from real proxy data.
- Real data sections per tab: programme state lists, on-time delivery bars, RAID heat maps, SLA matrices, WIP bars, signal matrices, headcount KPIs, pyramid by band, over-optimism flags, threshold register, tier config.
- Role-aware primary nav: 5-tab primary nav per role, AP gold-dot overlay on role badge.
- Edge middleware: JWT verification on every /home/* route, redirect to /login on session expiry.
- OpenAPI codegen: frontend/openapi.json and frontend/lib/api-client/schema.ts regenerated from FastAPI on every backend change.
- 511 Vitest green across 40 test files.

### Integration and QA (M8)

- Playwright: 51 tests, 6 spec files (auth, role gate, home smoke, data smoke, AP flag, drill integrity, accessibility). Zero failures, zero tolerated baseline failures.
- Drill integrity: 12 tests asserting real seed data (PEGASUS/ANDROMEDA codes, headcount 300) flows from backend through Server Components to DOM.
- axe-core: WCAG 2.1 AA scan on all 14 tabs plus /login. Zero critical violations. Zero serious violations.
- Contract tests: schemathesis no-5xx conformance across all 12 endpoints, two roles, five examples per endpoint. Frontend fetch coverage verified: all 9 callBackend paths exist in OpenAPI spec.
- Locust benchmark: Profile A (100 concurrent) p95=24ms GREEN. Profile B (500 concurrent) p95=140ms GREEN. Profile C (1000 concurrent) p95=380ms AMBER. Zero failures across all profiles.
- Security: python-jose replaced by PyJWT (CVE-2024-33663 CRITICAL removed). python-multipart upgraded to 0.0.28 (2 HIGH CVEs removed). bandit HIGH=0. trivy CRITICAL=0 HIGH=0 with .trivyignore for 2 Next.js DoS CVEs (no 14.x fix, target v1.1).

### Bugs fixed during M8

- Audit trail FK violation: require_audit_access returned 500 instead of 403 when actor_user_id not in people table. Now best-effort write with rollback on failure.
- Null byte in programme code: GET /api/v1/programmes/%00/raids returned 500. Path regex ^[A-Za-z0-9_-]{1,64}$ now returns 422.

### Known limitations

- Fourteen tabs have stub sections awaiting entities not yet seeded: financials_monthly, decisions, attrition events, client signals, sprint velocity log, DORA metrics, bench state. Stubs are clearly marked in the UI and in code.
- P and L Cockpit, AI Innovation, Commercial Pipeline, Scenario Planner, Multi-Vendor Scorecard, Change Impact tabs are not yet built (deferred to v1.1 after LinkedIn launch validates the concept).
- Next.js 14.2.35 has two DoS HIGH CVEs. Fix requires Next.js 15 (major upgrade, v1.1 target).
- Rate limiter default (120 req/min) is exhausted by 500 concurrent users. Production deployments should configure RATE_LIMIT_DEFAULT_REQUESTS per actual load profile.
- E2E test suite requires RATE_LIMIT_DEFAULT_REQUESTS=10000 at backend start and pytest must complete before Playwright (shared database, Alembic DDL deadlock risk).

## [v0.1.0-wireframe] | 2026-04-24

## [v0.1.0-wireframe] | 2026-04-24

### Added
- Project initiated as successor to AKB1 Command Center v5.8.0.
- Project manifest and iCloud recovery anchor created.
- Claude Code operating rules (CLAUDE.md) established.
- Six kickoff decisions locked (D-001 to D-006): name, tech stack, scope, visibility, location, project initiation.
- Four pre-wireframe decisions locked (D-007 to D-010): palette reuse v5.8, Tailwind CDN, Claude proposes programme seed, mixed signal narrative.
- Pre-wireframe readiness plan document authored.
- Full folder structure scaffolded.
- Gitignore and pre-commit config in place with em dash and emoji scanners.

### Decisions
- Tech stack: Next.js 14 plus FastAPI plus Postgres 16 plus Redis 7 in Docker.
- Scope: 14 tabs. 12 from v5.8 plus 3 new (Multi-Vendor Scorecard, Change Impact, Client Health Radar).
- Repo visibility: private until v1.0.0, then public for LinkedIn launch.
- Project root: inside AKB1 Base Cowork workspace.

---

*Every release from v0.2.0 onward appends an entry here before the tag is pushed.*
