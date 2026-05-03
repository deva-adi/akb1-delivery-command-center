# BUILD_STATE.md
### AKB1 Delivery Command Center v1 | Session-level build state | Last updated: 2026-05-01 (M7 scaffold closed)

> Updated at the end of every substantive session. Percent complete per module. Keep to one page.

---

## Current Phase

**Rev 4 cascade complete. Phases 1 through 9 closed. M6 backend build can begin against stable spec. v1.0.0 launch target 2026-06-10.**

## Overall Project Progress

| Module | Percent complete | State |
|--------|------------------|-------|
| Scaffold (M0) | 100 | CLOSED 2026-04-24 |
| Pre-wireframe readiness | 100 | CLOSED 2026-04-24 |
| Wireframes (M1) rev 4 | 100 | CLOSED 2026-04-25. 17 wireframes at R4 (3 new plus 14 cascaded) plus 3 cross-cutting wireframes plus Index updated |
| PRD suite (M2) rev 4 | 100 | CLOSED 2026-04-25. 28 PRDs total (3 new tab PRDs at rev 1, 14 existing tab PRDs at rev 4 or rev 2, 4 cross-cutting at rev 2, 2 new cross-cutting at rev 1, Master at rev 3, Data Model at rev 4, Intelligence Layer rev 2, Security rev 2) |
| Architecture suite (M3) rev 4 | 100 | CLOSED 2026-04-25. Design Foundations rev 4 with 13 amendment sub-sections |
| Test strategy (M4) rev 2 | 100 | CLOSED 2026-04-25. 14 docs in docs/test/ (5 new at rev 1, 5 cascaded to rev 2, 4 unchanged) |
| Subagent roster (M5) rev 1 | 100 | Carries forward from rev 1; rev 2 update deferred to backend kickoff |
| Rev 4 cascade for 50 UCs | 100 | CLOSED 2026-04-25. All 50 UCs absorbed across PRDs and wireframes per D-029 through D-034 |
| Backend service (M6) | 53 | Slice 5c CLOSED 2026-05-01. GET /api/v1/audit/entry/{entry_id} completes the audit console MVP per PRD 26 section 10. AP-strict (require_audit_access extended with strict_ap kwarg, default false preserves slice 4 /audit/search behaviour, /audit/entry/{id} passes strict_ap=True so PortfolioOwner without AP is denied with ApFlagDenied; no PO carve-out because there is no metadata-only fallback). Response includes before_json, after_json, and a server-computed shallow diff (top-level added / removed / changed; nested objects compared as opaque values, deep-diff deferred). diff is null when either snapshot is null. 404 on unknown entry_id with no audit row written. Successful reads not audited (D-039 ruling 8). 24 new tests (3 allowed-role 200, 2 ApFlagDenied incl. PO+AP=false, 3 RoleDenied parametrised, 2 auth errors, 1 unknown-id 404, 1 successful-read-no-audit, 4 diff null/identical cases, 7 compute_shallow_diff helper unit tests, 1 e2e login -> search -> entry). Total: 171 of 171 tests green (slice 1: 34, slice 2: 33, slice 3: 32, slice 4: 18, slice 5b: 21, slice 5a: 9, slice 5c: 24). Migrations applied: 001 through 006 (no new migration in slice 5c). See D-043. |
| Backend slice 5a | n/a | Slice 5a CLOSED 2026-04-30. Programme scoping for DD/FL on /api/v1/audit/search, closing the slice 4 D-040 ruling 2 deferred TODO. Migration 006 introduces person_programme_assignments join table (person_id UUID FK people.person_id ON DELETE CASCADE, programme_id TEXT FK programmes.programme_code ON DELETE CASCADE, assigned_at TIMESTAMPTZ, PK (person_id, programme_id), index on person_id). Seed extends to populate 15 assignments deterministically: each of the 2 DDs and 3 FLs gets 3 programmes drawn via numpy.random.RandomState(SEED) with replacement=False per person; overlaps allowed across people. New seed SHA-256: 56843a290993e21d89e2a546ac4a2307fa8d714f7e36dd949a4670bb28684a12 (slice 4 was ef381cb...). Audit search visibility (5a-narrow): DD/FL with AP=true sees rows whose actor_user_id is in the set of people assigned to one of the caller's programmes via two-level subquery (`actor_user_id IN (SELECT person_id FROM person_programme_assignments WHERE programme_id IN (SELECT programme_id FROM person_programme_assignments WHERE person_id = caller))`). EXPLAIN-asserted to use the index on person_id. PO with AP=true unaffected (sees all). 5a-broad (resource-ownership scoping) deferred until programme-scoped resources land; TODO comment in services/audit_search.py. 9 new tests (parametrised overlap/disjoint matrix, self-visibility, orphan-DD edge case, PO regression, e2e disjoint vs overlapping DD, EXPLAIN index assertion). See D-036 through D-042. |
| Backend slice 5b | n/a | Slice 5b CLOSED 2026-04-30. Auth-hardening: Redis-backed lockout, per-IP rate limit middleware, stateless double-submit CSRF middleware. Slice 3 in-memory dict removed (single-worker correctness gap closed). Lockout key shape lockout:{email} with TTL 15 min stamped on first failure, INCR + EXPIRE-on-first counter semantics. Rate limit per 2c resolution: tiered limits (rate_limit_auth_requests=10, rate_limit_default_requests=120, window=60s) on a shared per-IP-per-minute bucket key ratelimit:{ip}:{minute}; sliding window per-minute bucket retained from kickoff (token-bucket divergence from PRD section 11 documented as accepted at current scale). X-Forwarded-For trust gated on TRUSTED_PROXY setting (empty in dev = ignore header to close spoof bypass). CSRF stateless: secrets.compare_digest cookie vs X-CSRF-Token header on POST/PUT/PATCH/DELETE under /api/v1/* (login exempt as token issuance point). Login response sets csrf_token cookie (HttpOnly=False so browser JS can read for double-submit, SameSite=Strict). 21 new tests (4 Redis-lockout, 8 rate-limit, 9 CSRF). E2E tests acquire CSRF cookie from real login response and re-sync the X-CSRF-Token header. See D-036 through D-041. |
| Frontend app (M7) | 8 | M7 scaffold CLOSED 2026-05-01. Foolproof first vertical: Next.js 14.2.35 App Router on TypeScript strict, Tailwind on Option D Executive Mid palette tokens (D-018) declared in tailwind.config.ts with semantic names per Q4 ruling, no inline hex in components. Two pages: /login (public) and /home (authenticated). Route Handler proxy at POST /api/auth/login per Q2 ruling (no NextAuth at scaffold; deferred to Phase 2 OAuth and documented in the route handler comment). JWT planted as akb1_session httpOnly cookie; backend csrf_token cookie forwarded as-is per slice 5b D-041 ruling 11. Edge middleware on /login + /home/* redirects logged-in user from /login to /home and unauthenticated user from /home to /login?from=... Role-aware primary 5-tab nav per Master PRD R3.3 for all 6 roles (PO, DD, PM, FL, HRBP, RO) plus AP gold-dot overlay on the role badge per Design Foundations rev 4 R4.1. PO sees populated tier-config card from GET /api/v1/admin/tier-config (Q1 ruling part 1); non-PO sees stub card (Q1 ruling part 2). OpenAPI codegen: openapi-typescript regenerates frontend/lib/api-client/schema.ts from frontend/openapi.json which is itself dumped from FastAPI app.openapi() via scripts/gen-openapi.sh; --check mode for CI fails on backend drift per Q3 ruling and CLAUDE.md mandate. Vitest 40 of 40 green (20 role-nav map, 7 RoleAwareNav, 3 RoleBadge, 3 LoginForm, 7 session decode). E2E smoke run against live backend: bad creds 401 with backend detail "Invalid email or password", good creds 200 with both cookies planted, /home with cookies 200 rendering PO 5-tab nav and tier card data-state=loaded with all 5 seeded tiers, /home without cookies 307 redirect to /login?from=/home, PM smoke shows stub card + correct 5-tab nav (Delivery Health / Flow and Velocity / Governance / Risk and RAID / Ops and SLA). Next.js production build green; tsc --noEmit clean. See D-044. |
| Integration and QA (M8) | 0 | Blocked on M7 |
| Release v1.0.0 (M9) | 0 | Target 2026-06-10 |

**Overall project: 76 percent complete.** M1 through M4 at rev 4 closed. M6 backend slices 1 through 5c closed (audit console MVP complete; auth perimeter complete). M7 frontend scaffold closed (foolproof first vertical: shell, login, role nav, role-aware tier card, OpenAPI codegen client wiring, smoke tests).

## Current Session Log

### Session 2026-05-01 (later) | M7 frontend scaffold closed: shell, login, role nav, role-aware tier card

Scope locked at M7 kickoff with four open-question rulings: Q1 populated tier-config card for PO + stub for non-PO, Q2 Route Handler proxy (no NextAuth at scaffold; deferred to Phase 2 OAuth via documented code comment), Q3 OpenAPI codegen client (openapi-typescript) plus CI check on backend drift, Q4 Tailwind palette in tailwind.config.ts with semantic tokens (no inline hex). Acceptance gate seven items: login form renders and posts; failed login shows 401 inline; 429 shows Retry-After; success redirects to /home with role-correct 5-tab nav; PO sees populated tier-config card; non-PO sees stub; protected route without JWT redirects to /login.

Step 1 config layer: package.json with next 14.2.35 (bumped from 14.2.15 to clear the 2025-12-11 security advisory before npm install completed), react 18.3.1, jose 5.9.6, openapi-typescript 7.4.1, vitest 2.1.2, tailwindcss 3.4.13, typescript 5.6.2 strict. tsconfig.json with strict, noUncheckedIndexedAccess, noImplicitOverride, paths "@/*". next.config.js with reactStrictMode and poweredByHeader off (typedRoutes experimental was tried and reverted: it rejected the runtime-string redirectTo on the login form; will re-enable when all 18 tab routes are statically known). tailwind.config.ts maps Option D Executive Mid hex values (Design Foundations rev 4 section 1) to semantic tokens bg-base, bg-surface, bg-surface-elevated, bg-surface-subtle, border-subtle, border-strong, text-primary, text-secondary, text-muted, text-subtle, accent-gold, status-red, status-amber, status-green plus role-pm and role-fl supplementals. postcss.config.js, .eslintrc.json (extends next/core-web-vitals), .gitignore (node_modules, .next, env locals), vitest.config.ts (jsdom by default, alias @, tests/unit only). vitest.setup.ts pulls in jest-dom matchers.

Step 2 lib layer: lib/env.ts holds backendApiUrl read at module load; JWT_SECRET is NOT cached here so tests can override process.env across runs. lib/auth/role-nav.ts encodes Master PRD R3.3 per-role 5-tab map for all 6 roles plus an isKnownRole type guard. lib/auth/cookies.ts names akb1_session (httpOnly, SameSite=Strict, Secure in production) and forwards csrf_token (HttpOnly=False per slice 5b D-041 ruling 11, SameSite=Strict). lib/auth/session.ts decodes the backend-issued JWT via jose's jwtVerify at HS256, returning a CurrentUser shape with role narrowing. JWT_SECRET is read inside secretBytes() at call time, not at module load, so test beforeAll setup works without cache reset. lib/api-client/fetcher.ts is a server-side fetch wrapper that attaches the Bearer token from the akb1_session cookie and the X-CSRF-Token header (synced with the csrf_token cookie value) on mutating methods; surfaces a typed BackendError carrying status + detail + retryAfter.

Step 3 OpenAPI codegen: scripts/gen-openapi.sh dumps app.openapi() from the FastAPI app and writes frontend/openapi.json plus generates frontend/lib/api-client/schema.ts via openapi-typescript. --check mode (CI) fails on snapshot drift between backend spec and committed openapi.json, plus fails if regenerated schema.ts diverges from the committed copy. Both files are committed; CI keeps them in lockstep with backend Pydantic shapes per CLAUDE.md hard rule.

Step 4 routing layer: middleware.ts gates /home/* on a valid akb1_session JWT and redirects /login to /home for already-authenticated callers. Edge runtime; uses lib/auth/session.decodeSessionToken which is jose-based and Edge compatible. app/layout.tsx is the root html shell with globals.css that imports tailwind directives. app/page.tsx redirects to /home or /login based on session. app/login/page.tsx renders the login chrome and imports the LoginForm client component. app/login/LoginForm.tsx is the client form: posts to /api/auth/login, redirects on 200 via router.replace + router.refresh, renders inline 401 detail, renders 429 Retry-After countdown. app/api/auth/login/route.ts is the Route Handler proxy: forwards email + password to backend, plants both cookies on 2xx, never echoes the JWT or password in the response body. app/api/auth/logout/route.ts wipes both cookies. app/home/layout.tsx is the protected layout: server-decodes the JWT, redirects to /login if invalid, renders the header with RoleBadge plus RoleAwareNav. app/home/page.tsx is the landing page with the TierConfigCard.

Step 5 components: RoleAwareNav renders the 5-tab primary nav per role per Master PRD R3.3 with data-testid and data-role hooks for tests. RoleBadge renders the human-readable role label and overlays the gold AP dot when ap_flag is true (Design Foundations rev 4 R4.1). TierConfigCard is a Server Component that branches on role: PortfolioOwner sees the populated tier card from GET /api/v1/admin/tier-config (wrapped {items: [...]} response shape), every other role sees a stub welcome card. BackendError surfaces inline as a status-red banner if the call fails.

Step 6 tests: 5 unit test files. tests/unit/role-nav.test.ts (20 tests: each role has 5 unique items, full per-role order assertions matching Master PRD R3.3, isKnownRole type guard). tests/unit/role-aware-nav.test.tsx (7 tests: render assertions per role plus PO order). tests/unit/role-badge.test.tsx (3 tests: label rendering, AP dot present when true, AP dot absent when false). tests/unit/login-form.test.tsx (3 tests: success redirect, 401 inline, 429 retry-after countdown). tests/unit/session.test.ts (7 tests, // @vitest-environment node directive because jose's SignJWT does not run in jsdom: empty/malformed/wrong-secret/valid/unknown-role/missing-sub/missing-ap-defaults). 40 of 40 vitest green; tsc --noEmit clean; npm run build produces 6 routes plus middleware.

Step 7 e2e smoke against live backend (db + redis + uvicorn + npm run dev): bad creds returned 401 with backend detail "Invalid email or password" through the proxy; good creds returned 200 and planted akb1_session (httpOnly) and csrf_token (non-httpOnly) cookies; GET /home authenticated returned 200 with PO 5-tab nav (Executive, Governance, Financials, Capability, Client Health) and tier-config-card data-state=loaded rendering all 5 seeded tier rows; GET /home without cookies returned 307 to /login?from=%2Fhome. PM smoke confirmed stub card + role-aware nav (Delivery Health, Flow and Velocity, Governance, Risk and RAID, Ops and SLA) + role badge data-ap=false (no gold dot). 429 retry-after path covered by the unit test (LoginForm); not exercised in live smoke to avoid burning the seeded user's lockout budget.

Acceptance: vitest 40 of 40 green; npm run typecheck clean; npm run build clean; em-dash and en-dash sweep clean across all frontend authored files (excluded node_modules, .next, openapi.json, lib/api-client/schema.ts); end-to-end smoke against live backend hits all seven gate items.

Architectural decisions logged in D-044 covering: Q1/Q2/Q3/Q4 rulings as ratified at kickoff, frontend directory layout under frontend/ root with no src/ wrapper, lib/api-client/schema.ts committed alongside openapi.json so CI diff is cheap and reproducible, JWT_SECRET read lazily at call time inside session.ts rather than cached at env.ts module load (test ergonomics, no production behaviour change), typedRoutes experimental temporarily disabled (will re-enable when all 18 tabs land as static routes), Next 14.2.35 selected over 14.2.15 to clear the 2025-12-11 advisory before any code shipped.

End-of-session state: M7 scaffold closed. Containers (db + redis) healthy. Frontend dev workflow proven end-to-end. Recommended next slice: M7-2 Executive tab content against GET /api/v1/admin/tier-config plus seeded EVM data (would activate the first real tab page for PO and DD landing); OR M7-2 Governance Operating Model tab (the new R3 tab three roles include in primary nav, so it lights up four roles at once); OR populate programme-scoped resources on the backend (RAID, milestones, health snapshots) which would then feed multiple tab slices in parallel.

Blocked or pending from Adi: M7 scaffold acceptance signoff. Confirmation of next slice scope.

### Session 2026-05-01 | M6 slice 5c closed: GET /audit/entry/{id} with before / after diff

Slice 5c ran end-to-end in this session. 24 new tests added; 171 backend tests green total. D-042 was backfilled to DECISION_LOG.md at the start of the session (BUILD_STATE referenced D-042 from slice 5a but the entry was never appended to DECISION_LOG.md; baseline at slice 5c kickoff was 147 of 147 green per pytest run after the backfill).

Two design conflicts surfaced in the brief and were resolved by Adi before code: (1) PO+AP=false handling on /audit/entry/{id}; the existing require_audit_access lets PortfolioOwner through with AP=false (slice 4 /audit/search drops to own-actions row scope) but /audit/entry/{id} has no metadata-only fallback to scope to. Resolved by extending require_audit_access with a strict_ap kwarg, default false. (2) Response field naming: brief used request_snapshot / response_snapshot, codebase already established before_json / after_json. Resolved by using the codebase vocabulary in AuditEntryDetail.

Step 1 require_audit_access extension (backend/app/auth/dependencies.py): added strict_ap: bool = False kwarg. Default mode preserves slice 4 /audit/search behaviour exactly (PO carve-out without AP intact). Strict mode removes the carve-out so any allowed role without AP=true is denied with ApFlagDenied + 403. Audit-on-denial logic stays in one place. Existing slice 4 call site and all 16 slice 4 audit search tests unchanged.

Step 2 schemas/audit.py extension: added AuditEntryDiff (added / removed / changed top-level fields) and AuditEntryDetail (entry_id, occurred_at, actor_user_id, actor_role, http_method, endpoint, resource_type, resource_id, outcome, ip_address, before_json, after_json, diff). Module docstring updated to cover both endpoints.

Step 3 services/audit_entry.py (new file): compute_shallow_diff(before, after) returns None when either side is None, otherwise an AuditEntryDiff with sorted top-level added / removed / changed. Nested objects (dict-valued top-level keys) are compared by value as opaque payloads, no recursion. get_audit_entry(session, entry_id=...) selects by PK, raises 404 when missing, otherwise renders AuditEntryDetail. Reads are not audited (D-039 ruling 8).

Step 4 api/v1/audit.py: GET /audit/entry/{entry_id} added alongside the existing /audit/search route. resource_type=audit_entry for denial audit rows. Allowed roles: PortfolioOwner, DeliveryDirector, FinanceLead with strict_ap=True so PO+AP=false is denied with ApFlagDenied.

Step 5 tests (backend/tests/integration/test_audit_entry.py, new file, 24 tests): 3 allowed-role 200 (PO/DD/FL with AP=true, full body assertion on the PO case incl. diff added/removed/changed), 2 ApFlagDenied (PO+AP=false manufactured, DD+AP=false from seed), 3 RoleDenied parametrised across (PM, HRBP, RO), 2 auth errors (no token, invalid token), 1 unknown entry_id 404 with audit-row-count regression guard, 1 successful-read-no-audit, 4 diff null and identical cases (before null, after null, both null, before==after with empty sections), 7 compute_shallow_diff helper unit tests (added only, removed only, changed only, mixed, null-before, null-after, nested-as-opaque), 1 e2e (real /auth/login -> /audit/search -> /audit/entry/{id} with full shape assertion).

Acceptance: pytest 171 of 171 green. Em-dash and en-dash sweeps clean across all slice 5c authored or modified files. no-hardcoded-thresholds lint clean (no rule modules touched).

Architectural decisions logged in D-043 covering: strict_ap kwarg extension on require_audit_access (over a new sibling dependency), shallow top-level diff scope at slice 5c (deep diff deferred), nested-object comparison as opaque values within shallow diff, before_json / after_json response field names over brief's request_snapshot / response_snapshot, 404 short-circuits no audit row, successful read not audited, audit_entry resource_type for denial rows, no migration required (reads from existing audit_trail_entries only).

Migrations applied: 001 through 006 (no new migration in slice 5c). Mutating endpoints unchanged in count (3). Read endpoints: 5 (/health, GET /admin/tier-config, GET /admin/threshold-register, GET /audit/search, GET /audit/entry/{entry_id}). AP-gated endpoints: 2 (audit search default mode, audit entry strict mode).

End-of-session state: M6 slice 5c closed. Containers (db + redis) healthy. Audit console MVP complete (search + per-entry detail with diff). Recommended next slice: begin M7 frontend scaffold against the stable auth and audit surfaces, OR populate programme-scoped resources (RAID rows, milestones, health snapshots) which would activate the slice 5a-broad scoping expansion AND surface a richer set of mutation deltas in the audit console, OR extend AuditEntryDiff to deep-diff (nested-path alignment, array index handling) for richer audit forensics.

Blocked or pending from Adi: Slice 5c acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-30 (later) | M6 slice 5a closed: programme scoping for DD/FL on /audit/search

Slice 5a ran in five steps per Adi's locked kickoff. 9 new tests added; 147 backend tests green total.

Step 1 migration 006_people_programme_assignments: new join table per kickoff. Columns person_id UUID FK to people(person_id) ON DELETE CASCADE, programme_id TEXT FK to programmes(programme_code) ON DELETE CASCADE, assigned_at TIMESTAMPTZ DEFAULT NOW(). PK on (person_id, programme_id). Index on person_id for the caller-lookup hot path. Standard akb1_app grants on SELECT/INSERT/UPDATE/DELETE; "append-only" is application convention only, no DB-level enforcement (unlike audit_trail_entries). Two naming notes flagged: (1) people PK is person_id not id (kickoff said people(id) as conversational shorthand; resolved to person_id); (2) programmes(programme_code) is a UNIQUE VARCHAR(32) natural key, not the PK; the new column is named programme_id but holds the TEXT code per kickoff (inconsistent with rest of codebase where programme_id always means UUID; preserved for now, flagged for PRD rev 5 cascade).

Step 2 ORM model PersonProgrammeAssignment in backend/app/models/person_programme_assignment.py and registered in models/__init__.py.

Step 3 seed extension: each DD and FL is assigned DD_FL_PROGRAMMES_EACH=3 programmes drawn via numpy.random.RandomState(SEED).choice(replace=False). Overlaps allowed across distinct people (e.g., DD1 and DD2 both have STELLAR by deterministic draw). Total 15 assignments (2 DDs * 3 + 3 FLs * 3). Seed fingerprint changed from ef381cb3301765a8fa313c416bddb0fb66cbc3d608cf767d96aa212c70d93d41 (slice 4) to 56843a290993e21d89e2a546ac4a2307fa8d714f7e36dd949a4670bb28684a12 (slice 5a). Two-run byte-identicality test still green.

Step 4 audit_search service: row-scope filter for DD/FL with AP=true now joins via two scalar subqueries: caller_programmes = SELECT programme_id FROM person_programme_assignments WHERE person_id = caller; in_caller_programmes = SELECT person_id FROM person_programme_assignments WHERE programme_id IN caller_programmes; final WHERE actor_user_id IN in_caller_programmes. Single SQL execution path, no application-layer post-filter. PO with AP=true unaffected (still sees all rows). PO with AP=false still scoped to own actions. 5a-broad TODO comment added: "extend filter to resource ownership once programme-scoped resources land (RAID rows, milestones, health snapshots)".

Step 5 tests: 9 new in tests/integration/test_audit_search_programme_scope.py covering: 4 parametrised cases across (DD, FL) x (overlapping, disjoint) using synthetic actors with crafted programme assignments; DD self-visibility (caller is in own programmes); DD-with-zero-assignments edge case (synthetic orphan DD sees zero rows including own); PO regression (AP=true sees all rows including programme-scoped data, since PO has no person_programme_assignments entries the join must short-circuit to "all"); e2e DD1-overlapping-vs-disjoint scenario; EXPLAIN assertion that the caller-lookup query hits person_programme_assignments_person_id_idx.

Step 6 acceptance: pytest 147 of 147 green. Em-dash and en-dash sweeps clean across all slice 5a authored or modified files. no-hardcoded-thresholds lint clean (no rule modules touched).

Architectural decisions logged in D-042 covering: kickoff naming inconsistency preserved (programme_id TEXT FK to programmes(programme_code)), ON DELETE CASCADE on both FKs (assignments are derived state, no semantic meaning if either side is deleted), 5a-narrow scope (actor-based) over 5a-broad (resource-ownership) per Adi's confirmed scope, two-level scalar subquery in SQLAlchemy ORM (compiles to single Postgres query with index hits), seed determinism preserved via numpy.random.RandomState(SEED).choice with replace=False, orphan-caller edge case (DD with zero assignments sees empty set, including own actions; documented in service docstring).

Migrations applied: 001 through 006 (head: 006_people_programme_assignments).

End-of-session state: M6 slice 5a closed. Containers (db + redis) healthy. DD/FL programme scoping live; the slice 4 D-040 ruling 2 deferred TODO is closed. Recommended next slice: GET /api/v1/audit/entry/{id} with full before/after diff for AP holders (small slice, completes audit console MVP per PRD 26 section 10), OR begin M7 frontend scaffold now that the auth and audit surfaces are stable, OR populate programme-scoped resources (RAID, milestones) which would activate the 5a-broad expansion.

Blocked or pending from Adi: Slice 5a acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-30 | M6 slice 5b closed: auth-hardening (Redis lockout + rate limit + CSRF)

Slice 5b ran in three items per Adi's locked scope. 21 new tests added; 138 backend tests green total.

Item 1 Redis-backed lockout: backend/app/cache.py introduces a process-wide async Redis client (redis 5.2.1) with FastAPI dependency get_redis. backend/app/auth/lockout.py rewritten to async functions backed by INCR + EXPIRE-on-first counter. Slice 3 in-memory dict and threading lock removed entirely (regression-guard test asserts the module surface no longer exposes _FAILURES, _LOCK, or reset_all). services/auth_login.py takes the Redis client as positional argument. fakeredis 2.26.1 added as test-only dep; conftest fake_redis fixture (per-test flushed) is wired into http_client via dependency_overrides[get_redis]. Lockout TTL = 15 min stamped on first failure of the window; counter expires from first failure regardless of subsequent activity (stricter than slice 3 sliding window). All 13 slice 3 lockout tests carried over unchanged; 4 new tests cover Redis key shape with TTL bound, key cleared on success, per-email key isolation, and the in-memory-state regression guard.

Item 2 per-IP rate limit middleware: backend/app/middleware/rate_limit.py registers a Starlette BaseHTTPMiddleware reading limits from settings (rate_limit_auth_requests=10, rate_limit_default_requests=120, rate_limit_window_seconds=60) with a per-test override seam via app.state. Bucket key shape ratelimit:{ip}:{minute} per kickoff. Tiered comparison against shared counter: any /api/v1/auth/* request 429s once counter > auth_requests; any other /api/v1/* request 429s once counter > default_requests. Health (/health) and non-/api/v1 paths exempt by prefix filter. X-Forwarded-For honoured only when TRUSTED_PROXY setting is non-empty; empty (dev default) ignores the header to close the spoof bypass. 8 new tests cover health exempt, auth tier 429, default tier 429, shared-counter tiered semantics, bucket reset on key delete, XFF ignored when trusted_proxy empty, XFF first-IP honoured when trusted_proxy set, Redis key shape and TTL bound.

Item 3 CSRF stateless double-submit: backend/app/middleware/csrf.py registers a second middleware. On POST/PUT/PATCH/DELETE under /api/v1/* (excluding /auth/login as the issuance point), secrets.compare_digest verifies the csrf_token cookie equals the X-CSRF-Token header; mismatch returns 403. On 2xx response to POST /auth/login, the middleware mints a 32-byte urlsafe base64 token and sets it as csrf_token cookie (HttpOnly=False per double-submit pattern, SameSite=Strict, Secure=False in dev). Existing tests using mint_token continue to satisfy CSRF via a default cookie+header pre-seeded on the conftest http_client fixture; the 4 e2e tests that perform real login were updated to re-sync the default X-CSRF-Token header to the freshly-issued cookie value via a _sync_csrf helper. New http_client_no_csrf fixture in conftest exercises CSRF directly without the pre-seed. 9 new tests cover missing both, cookie only, header only, mismatch, match, GET exempt, POST /auth/login exempt from verification, login response sets the cookie shape, failed login does not mint a token.

Item 5b acceptance: pytest 138 of 138 green. Em-dash and en-dash sweeps clean across all slice 5b authored or modified files. no-hardcoded-thresholds lint clean (no rule modules touched).

Architectural decisions logged in D-041 covering: Redis client singleton on app.state for both DI routes and middleware (middleware cannot use Depends), counter semantics over sliding-window for lockout (TTL anchored to first failure), shared-counter tiered comparison for rate limit, per-minute sliding bucket retained over true token bucket as accepted PRD section 11 deviation, TRUSTED_PROXY setting to gate X-Forwarded-For trust, CSRF as defense-in-depth despite JWT-in-body auth, fixture pre-seed strategy for tests that bypass real login, fail-loud rather than in-memory fallback when Redis is unreachable.

Mutating endpoints unchanged in count (3): POST /auth/login, PATCH /admin/tier-config/{n}, PATCH /admin/threshold-register/{metric_id}. New cross-cutting middleware: 2 (CsrfMiddleware, RateLimitMiddleware). New runtime deps: redis 5.2.1 (production), fakeredis 2.26.1 (test).

End-of-session state: M6 slice 5b closed. Containers (db + redis) healthy. Auth perimeter complete for M7 frontend kickoff. Recommended next slice: programme scoping for DD/FL on /audit/search (closes the slice 4 deferred TODO; needs people-to-programmes join table), OR GET /api/v1/audit/entry/{id} with full before/after diff for AP holders (small slice, completes audit console MVP per PRD 26 section 10), OR begin M7 frontend scaffold now that the auth surface is stable.

Blocked or pending from Adi: Slice 5b acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-25 late+1 | M6 slice 3 closed: auth login, read-side GETs, e2e flow

Slice 3 ran in five phases per Adi's locked scope. 32 new tests added; 99 backend tests green total.

Phase 3.1 password_hash schema + bcrypt: migration 003_password_hash adds password_hash VARCHAR(128) NOT NULL DEFAULT '' to people. backend/app/auth/passwords.py wraps bcrypt directly (passlib 1.7.4 has compat issues with bcrypt 5.x; switched to bcrypt module direct calls). Cost factor 12 in production via BCRYPT_ROUNDS env var; tests use the module default. Seed determinism preserved by embedding a precomputed bcrypt hash literal (cost 4) for the canonical demo password "akb1_demo_password"; all 300 seeded users share this hash. Seed SHA-256 changed from e9c4f57... to ef381cb... (still byte-identical across runs because the hash literal is fixed).

Phase 3.2 POST /api/v1/auth/login: bcrypt password verify against people.password_hash. JWT carries user_id, role, ap_flag, iat, exp claims (HS256 signed with JWT_SECRET from env). LoginRequest with extra='forbid' rejects unknown keys; LoginResponse never carries password_hash. Uniform 401 detail "Invalid email or password" on unknown user OR wrong password (no existence leak in API responses). Per-email lockout in backend/app/auth/lockout.py: 5 failures in 15 min returns 429 with Retry-After header. In-memory state with thread-safe lock; production multi-worker needs Redis-backed (carried forward as slice 3 hand-back follow-up). Audit row written on Success and on known-email Denied; unknown-email failures do not audit because actor_user_id is NOT NULL FK (deliberate trade-off documented). 13 contract tests cover success, wrong-password 401, unknown-email 401-with-same-detail, no-audit-on-unknown, lockout 429 with Retry-After, lockout per-email isolation, success-clears-lockout, missing-email 422, missing-password 422, unknown-field 422, password-hash never in response.

Phase 3.3 GET /admin/tier-config + GET /admin/threshold-register: PO-only reads, wrapped list response shape {"items": [...]} for forward extensibility. Reads not audited per spec. 14 contract tests cover 200 PO, 5 non-PO 403 each (parametrised), 401 missing token, no audit row written.

Phase 3.4 end-to-end test: 3 scenarios that POST /auth/login, capture the JWT, use it on PATCH then GET endpoints. Validates the production auth path end-to-end (login -> PATCH -> GET), the JWT works against threshold-register endpoints, and PM token correctly 403s on PATCH while a separate PO login token succeeds. mint_token retained for unit tests that need direct token issuance.

Phase 3.5 acceptance: pytest 99 of 99 green. Em-dash and en-dash sweeps clean across all slice 3 authored or modified files. Direct lint script invocation clean.

Architectural decisions logged in D-039 covering: bcrypt direct (no passlib middleman), seed-time bcrypt hash literal for byte-identicality, uniform 401 detail for no-existence-leak, audit-on-known-email-only trade-off, in-memory lockout (Redis migration deferred), explicit session.commit on the login path so audit rows persist before HTTPException raises, JWT secret from env (never hardcoded).

Mutating endpoints now via shared decorator: 4 (PATCH tier-config, PATCH threshold-register, both via update_with_audit; plus POST /auth/login which manages its own commit semantics for the Denied path).

End-of-session state: M6 slice 3 closed. Containers healthy. Recommended next slice: implement the AP flag enforcement pattern (require_ap_flag dependency) + extend audit_trail_entries.outcome enum (ApFlagDenied, RoleDenied) + first AP-gated endpoint (audit search) per PRD 26. Alternative: ship Phase 1 CSRF + per-IP rate limiting per PRD 03 sections 9-11 to round out the auth perimeter before frontend M7 starts.

Blocked or pending from Adi: Slice 3 acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-25 late | M6 slice 2 closed: second endpoint, shared decorator, lint exercised

Slice 2 ran in three phases as Adi locked. Total 33 new tests added. All 67 backend tests green.

Phase 2.1 PATCH /api/v1/admin/threshold-register/{metric_id}: PO-only, mirrors tier-config shape. ThresholdRegisterUpdate schema with 9 optional editable fields (display_name, direction, green/amber/red threshold, range_lower, range_upper, rationale_text, owning_role) plus model_validator requiring at least one. metric_id is path-only and not editable. last_calibrated_at and last_calibrated_by are system-set on every PATCH. Decimal columns serialise as string in the before/after JSON snapshots so the audit row carries lossless precision. 18 contract tests: 1 PO 200, 5 non-PO 403, 1 missing token 401, 1 invalid token 401, 1 empty body 422, 1 unknown field 422, 1 invalid direction 422, 1 invalid owning_role 422, 1 unknown metric 404, 1 audit count, 1 snapshot full state, 1 RangeIsBetter snapshot (range_lower / range_upper preserved), 1 calibration propagates to DB, 1 atomic rollback.

Phase 2.2 refactor to update_with_audit: extracted the shared SELECT FOR UPDATE plus snapshot plus mutate plus audit-write pattern into backend/app/services/audited_mutation.py. Both endpoint services rebound: update_tier_config supplies tier-specific snapshot_fn and mutate_fn closures, update_threshold supplies threshold-specific. AuditWriter type alias re-exported from tier_config.py for backward-compat with the slice 2.5 import path in admin.py. All 33 contract tests across both endpoints stay green without modification, proving the refactor is externally transparent.

Phase 2.3 no-hardcoded-thresholds lint exercised: scripts/check_no_hardcoded_thresholds.sh updated to accept optional path arg as `$1` so tests can point it at a temp directory. Pattern tightened from `[><=!]=?` to explicit Python comparison operators `(>=|<=|==|!=|>|<)` so module-level assignments like `__version__ = 1` do not trip the rule. Comment-skip filter corrected for grep's single-file LINENO:CONTENT output format. 15 unit tests in tests/unit/test_no_hardcoded_thresholds.py cover: script-exists guard, empty dir no-op pass, 7 parametrised literal-comparison patterns that should block, register-lookup variable form passes, assignment-only file passes, noqa opt-out passes, comment-only line passes, __init__.py skip, default invocation against the real rules dir at slice 2.3 close passes (no tab modules implemented yet).

Phase 2.4 acceptance: pytest 67 green (34 slice 1 + 18 threshold-register + 15 lint). Em-dash and en-dash sweeps clean across all slice 2 authored files. Direct lint script invocation clean.

Architectural decisions logged in D-038 covering the shared decorator design, Decimal-as-string in audit snapshots, lint regex tightening, and the forward-looking AP flag pattern (require_ap_flag dependency layered on require_role; distinct ApFlagDenied vs RoleDenied audit outcomes: extends the audit_trail_entries.outcome CHECK enum and lands in the PRD 26 / PRD 25 endpoint slices, not slice 2).

End-of-session state: M6 slice 2 closed. Containers healthy. Two mutating endpoints share the `update_with_audit` decorator. Lint rule fires correctly on tab intelligence modules. Recommended next slice: build the JWT login endpoint + the read-side GET /api/v1/admin/tier-config so the PATCH flow has a complete read-write loop, OR begin the Audit Trail Console PRD 26 endpoints to exercise the AP flag pattern.

Blocked or pending from Adi: Slice 2 acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-25 evening | M6 slice 1 closed: foolproof first vertical

Slice 1 covered four entities (programmes, people, audit_trail_entries, escalation_tier_config plus threshold_calibration_register) and one PATCH endpoint that exercises every cross-cutting invariant end-to-end. 34 of 34 tests green.

Slice gate 2.1 scaffold: FastAPI plus async SQLAlchemy 2 plus asyncpg plus Alembic plus pytest plus schemathesis plus hypothesis pinned in backend/requirements.txt. /health returns 200. pytest 2 of 2 green.

Slice gate 2.2 docker compose: project-root docker-compose.yml restructured. Service names db plus redis plus backend. db plus redis healthy in under 25 seconds. infra/postgres/init/01_create_roles.sql provisions akb1_owner (schema owner, NOT superuser, FORCE RLS bound) and akb1_app (FastAPI runtime role) on first cluster init. Bootstrap superuser used only to create the two operational roles.

Slice gate 2.3 first migration 001_rev4_foundation: programmes (rev 2 baseline), people (rev 2 plus rev 3 fields overtime_hours_mtd and last_1on1_sentiment_score plus ap_flag column per Q3), escalation_tier_config (per Q1, 5-tier ladder, JSONB role_mapping NOT NULL), audit_trail_entries (full schema per section 4.71). Append-only enforcement at three layers: REVOKE ALL plus GRANT SELECT, INSERT only on both roles plus FORCE ROW LEVEL SECURITY plus INSERT and SELECT policies (no UPDATE policy, no DELETE policy = implicit deny). TRUNCATE bypass closed by stripping owner default privileges. 6 parametrised tests across akb1_app and akb1_owner verify update_blocked, delete_blocked, insert_works.

Slice gate 2.4 seed determinism: SEED=20260424 single entropy source via numpy.random.RandomState. Migration 002_threshold_register adds the 60-metric register table per section 4.31. Seed payload: 10 programmes (PEGASUS Red, PHOENIX Amber, ORION Green, STELLAR Amber, HELIX Amber, ATLAS Watching, DRACO Green, LYRA Green, VEGA Green, ANDROMEDA Failing - aligns to section 5.1.4 EVM seed targets), 300 people (B1 to B5 pyramid 90/90/60/36/24, role distribution 1 PO + 2 DD + 10 PM + 3 FL + 2 HRBP + 282 RO, AP flag true on 1 PO + 1 DD + 1 FL), 5 escalation_tier_config rows (display_label seeded equal to default_label), 60 threshold_calibration_register rows transcribed verbatim from section 5.2 (8 + 10 + 10 + 8 + 6 + 8 + 6 + 4). audit_trail_entries empty. SHA-256 fingerprint e9c4f5729da4e0fc8856a9d2c1c43a0c458e9e99dff58ffaf7e6ef0b6b5a35f8 byte-identical across runs. 11 tests green.

Slice gate 2.5 PATCH /api/v1/admin/tier-config/{n}: HS256 JWT auth via FastAPI Bearer dependency, require_role('PortfolioOwner'). Service layer locks the row with SELECT FOR UPDATE, builds full before snapshot, applies UPDATE, builds full after snapshot, writes audit_trail_entries row in same transaction via dependency-injected audit_writer. Atomic rollback verified via FastAPI dependency_overrides + httpx ASGITransport(raise_app_exceptions=False) + simulated audit failure. Q1 acceptance verified: PATCH then GET returns new display_label while default_label remains immutable. 15 contract tests green covering 200 PO, 403 for 5 non-PO roles, 401 missing token, 401 invalid token, 422 empty body, 422 unknown field, 404 unknown tier, audit count increments by exactly 1, snapshot full state not diffs, Q1 propagation, atomic rollback.

Slice gate 2.6 em-dash pre-commit hook: scripts/check_em_dash.sh with line-level workspace-path exclusion (the literal "AKB1 Base [U+2014] Chief of Staff" is the one allowed occurrence per D-006). Script source uses printf UTF-8 byte escapes so it carries no literal em dash. Verified across 5 scenarios: clean PASS, em-dash file BLOCK, workspace-path-only PASS, mixed BLOCK on offending line, self-check PASS.

Slice gate 2.7 no-hardcoded-thresholds lint: scripts/check_no_hardcoded_thresholds.sh scaffolded for backend/app/intelligence/rules/. No-op currently (rules directory empty); rule fires when tab modules land in slice 6 onward.

Slice gate 2.8 acceptance: pytest 34 green, em-dash and en-dash sweeps clean across all authored files.

Architectural decisions logged: D-037 (this session) covers auth library lock, atomic rollback test pattern, NullPool plus engine.dispose for SQLAlchemy async plus pytest-asyncio cross-loop compatibility, Option C test fixture strategy (Alembic schema reset between seed runs to preserve append-only invariant from slice 2.3).

End-of-session state: M6 slice 1 closed under Claude Code. Containers (db, redis) running. Backend service definition in docker-compose.yml ready for slice 2 launch. Recommended next slice: extend audit invariant suite to a second mutating endpoint (Decision Queue or Notifications) to exercise the audit pattern across multiple resource types. Alternative: ship the JWT login endpoint and the read endpoint for /api/v1/admin/tier-config so the PATCH flow has a complete read-write loop.

Blocked or pending from Adi: Slice 1 acceptance signoff. Confirmation of next slice scope. v1.0.0 launch target 2026-06-10 retained.

### Session 2026-04-25 | Phases 1 through 9: Full rev 4 cascade

Completed this session in 9 phases per IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md Option 1 Full execution.

Phase 1 (D-027): Data Model PRD rev 4 with 51 new entities (escalation_tier_config added per Q1) plus 60-metric threshold calibration register seeded plus Q1, Q3, Q5, Q6 ruling resolutions applied. Q4 closed under D-027 with Option A full snapshot selected.

Phase 2 turn 3 (D-028): Design Foundations rev 4 with 13 amendment sub-sections (role taxonomy expansion, AP dot visual, two new locked Hub phrases, AI governance tier visual treatment, tier label rendering rule, onboarding visibility matrix, audit trail visual treatment, confidentiality classifications, three new tab voice samples, role-differentiated subtitle, component additions). Master PRD rev 3 with tab inventory growing from 15 to 18, role taxonomy 4 to 6 plus AP, PRD count 23 to 28.

Phase 3 (D-029): 3 new tab PRDs authored at rev 1 covering 23 UCs. PRD 23 Governance Operating Model, PRD 24 Capability and Supply Chain, PRD 25 AI Governance.

Phase 4 (D-030): 14 existing tab PRDs cascaded to rev 4 or rev 2. 27 additional UCs absorbed. Cross-link patterns established between governance and capability and AI governance tabs and the new primary tabs.

Phase 5 (D-031): 3 new wireframes authored. Em-dash incident caught and remediated; lesson learned logged for per-file gate going forward.

Phase 6 (D-032): 14 existing wireframes cascaded to rev 4 or rev 2. Per-file em-dash gate caught zero new violations.

Phase 7 (D-033): Cross-cutting surfaces complete. PRD 26 Audit Trail Console plus PRD 27 First 90 Days Onboarding authored. Cross-cutting PRDs 19, 20, 21, 22 cascaded to rev 2. 3 cross-cutting wireframes authored. UC absorption complete: 50 of 50 use cases now have a named home surface.

Phase 8 (D-034): M4 test strategy extended to rev 2. 5 new test plan docs (Governance, Capability, AI Governance, EVM, Audit Trail). 5 cascaded test plans (Contract, Playwright E2E, Voice Regression, Role Gating, Performance Benchmarks). Test scale at rev 2: ~190 unit tests, ~80 Playwright scenarios, 54 voice snapshots, 1,215 role-gating assertions, ~135 contract test endpoints, 10 performance hot paths.

Phase 9 (D-035): Final gate. Project-wide em-dash sweep clean (only legitimate workspace path occurrences). BUILD_STATE updated to reflect rev 4 closure. Hot cache and memory updated. M6 backend build unblocked.

End-of-session state: Rev 4 cascade complete. M6 backend build unblocked. v1.0.0 launch target 2026-06-10 retained.

Blocked or pending from Adi: None for the rev 4 cascade. Phase 9 closure pending review. Next: M6 backend kickoff prompt and Claude Code handoff.

### Session 2026-04-24 end of day | Wave 3 through 6: Full Hub UC mapping and implementation plan

Completed this session window:

Wave 3 (D-023): Initial Hub-to-Product use case gap analysis. 14 UCs identified (UC-A through UC-N) via Portfolio Desk and When Delivery Breaks cross-reference. Created `docs/state/USE_CASE_GAP_ANALYSIS_2026-04-24.md`. Initial severity-1 count: 4.

Wave 4 (D-024): Extended scan across Delivery Truths, Delivery PnL Option B, Governance in AI, Portfolio Desk Manifesto. 10 additional UCs surfaced (UC-O through UC-X). UC-O AI Governance Layer and UC-P EVM CPI SPI flagged as additional severity-1 gaps. Severity-1 count raised to 6. Gap analysis doc extended to section 10 onward.

Wave 5 (D-025): Exhaustive scan. Every drafted article, post, and carousel across all 10 series read (49 pieces plus 12 Portfolio Desk placeholders). 50 distinct UCs (UC-A through UC-PP) catalogued. Created `docs/state/UC_TO_DASHBOARD_MAPPING_2026-04-24.md`. Coverage reality: 0 fully covered, 22 partial, 28 not covered. Severity-1 count finalised at 8. Seven cross-pattern observations recorded.

Wave 6 (D-026): Full implementation plan. Created `docs/state/IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md`. Covers 3 new tabs (v1_16 Governance, v1_17 Capability, v1_18 AI Governance), 12 tab rev 4 cascades, 3 cross-cutting surfaces, 50 new data entities (growing total to ~85), 26 PRD files to touch, 17 wireframe HTML files to touch, voice snapshots 45 to 54, endpoint inventory 92 to 135, 22,000 new seeded rows. Three execution options presented. Recommended: Option 1 Full (14 turns).

End-of-session state: Plan awaiting Adi approval. No execution yet on rev 4 cascade. All documentation and state files up to date. DECISION_LOG carries D-023 through D-026.

Blocked or pending from Adi: Option selection from IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md section 14. Plus any challenge to assumptions in section 12.

Next actions on approval: Phase 1 Data Model PRD rev 4 with 50 new entity specifications. Then Phase 2 through Phase 9 per the plan.

### Session 2026-04-24 earlier | Project initiation and pre-wireframe planning

Completed this session: Name locked (AKB1 Delivery Command Center). Tech stack locked (Next.js plus FastAPI plus Postgres plus Redis in Docker). Scope locked (14 tabs). Repo visibility strategy locked (private until v1.0.0 then public). Project root location set (inside AKB1 Base Cowork workspace). Scaffold created: PROJECT_MANIFEST.md, CLAUDE.md, DECISION_LOG.md, BUILD_STATE.md, MILESTONE_STATUS.md. Folder structure stubs for docs/wireframes, docs/prd, docs/architecture, docs/test-strategy.

Pre-wireframe readiness planning: Forty-two item prerequisite inventory authored. Folder structure audit completed. Four additional decisions locked (D-007 palette reuse v5.8, D-008 Tailwind CDN, D-009 Claude proposes programme seed, D-010 mixed signal narrative). Planning document authored at `docs/state/PRE_WIREFRAME_READINESS_PLAN.md` for future reference.

In progress: Preparing to build Design Foundations document at `docs/architecture/00_Design_Foundations.md`. This is the single artifact that locks the remaining 32 prerequisite items before the first wireframe is authored.

Blocked or pending from Adi: Signoff on the sequence (Design Foundations document, then operational readiness trio, then first wireframe).

Next actions: Build Design Foundations document. Submit for review. Iterate until signed off. Then author `.gitignore`, `.pre-commit-config.yaml`. Get consent for git init. Then build v1_00_Index.html and v1_01_Executive.html as the quality benchmark. Then remaining 14 tab wireframes.

## Recent Checkpoint

| Field | Value |
|-------|-------|
| Project folder | `17_AKB1_Delivery_Command_Center` per D-013 |
| Current branch | main |
| Latest commit | `911d915 chore(scaffold): initial project at v0.1.0-wireframe` (pre-wireframes) |
| Uncommitted changes | All wireframes, Design Foundations, state updates, full rev 4 PRD set, full M6 slice 1 backend (Adi commits in iTerm2 per D-036 ruling 3) |
| Tests | 171 of 171 backend pytest green (2 unit health, 15 lint unit, 6 audit append-only, 11 seed determinism, 15 PATCH tier-config, 18 PATCH threshold-register, 17 auth login incl. 4 Redis-lockout, 16 admin GET, 3 e2e auth flow, 16 audit search, 2 e2e audit search, 9 audit search programme scope, 24 audit entry incl. 7 compute_shallow_diff helper, 8 rate limit, 9 CSRF) |
| Migrations applied | 001_rev4_foundation, 002_threshold_register, 003_password_hash, 004_outcome_enum_extension, 005_http_method_get, 006_people_programme_assignments (head) |
| Seed footprint | SHA-256 56843a290993e21d89e2a546ac4a2307fa8d714f7e36dd949a4670bb28684a12; 10 programmes, 300 people, 5 tier configs, 60 thresholds, 15 person-programme assignments, 0 audit rows |
| Mutating endpoints | 3 (POST /auth/login, PATCH /admin/tier-config/{n}, PATCH /admin/threshold-register/{metric_id}); 2 PATCH paths via update_with_audit |
| Read endpoints | 5 (/health, GET /admin/tier-config, GET /admin/threshold-register, GET /audit/search, GET /audit/entry/{entry_id}) |
| AP-gated endpoints | 2 (GET /audit/search default mode, GET /audit/entry/{entry_id} strict_ap mode); both via require_audit_access; denial paths emit ApFlagDenied / RoleDenied audit rows |
| Cross-cutting middleware | 2 (RateLimitMiddleware outermost, CsrfMiddleware inner) |
| Redis surfaces | 2 (per-email login lockout, per-IP rate-limit bucket); fakeredis used for test isolation |
| Wireframe completion | 20 of 20 wireframes (17 tab plus 3 cross-cutting) |
| PRD completion | 28 of 28 PRDs at rev 4 / rev 3 / rev 2 |
| Backend slice progress | Slice 5c of N closed (GET /audit/entry/{id} with before / after diff; audit console MVP complete) |
| Frontend slice progress | Scaffold of N closed (foolproof first vertical: shell, login, role nav, role-aware tier card, OpenAPI codegen wiring, 40 vitest tests) |

## Gates Status

| Gate | Status |
|------|--------|
| Wireframes approved | Pending |
| PRD approved | Pending |
| Architecture approved | Pending |
| Test strategy approved | Pending |
| Backend alpha green | Slice 5c green (5 entities + 1 join table, 3 mutating + 5 read endpoints, AP flag enforcement, AP-strict mode for /audit/entry/{id}, denial-audit pattern, outcome enum extended with ApFlagDenied + RoleDenied, Redis-backed lockout, per-IP rate limit middleware, stateless double-submit CSRF middleware, programme scoping for DD/FL on /audit/search, server-computed shallow diff on /audit/entry/{id}, 171 tests). Audit console MVP complete. Awaiting next slice scope. |
| Frontend alpha green | Scaffold green (Next.js 14.2.35 App Router on TypeScript strict, 6 routes plus Edge middleware, 40 vitest tests, OpenAPI codegen wired with --check CI mode, e2e smoke against live backend confirms all seven acceptance gate items). Awaiting next slice scope; tab content fills in subsequent M7 slices. |
| Integration tests green | Pending |
| Performance benchmark green | Pending |
| Security scan green | Pending |
| v1.0.0 release ready | Pending |

---

*Update this file at every substantive session end. Rule from Adi: never finish a session without updating state.*
