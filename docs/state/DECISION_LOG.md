# DECISION_LOG.md
### AKB1 Delivery Command Center v1 | Architectural decision log | Created: 2026-04-24

> Every architectural decision with rationale. Append-only. Latest entries at the top.

---

## D-044 | 2026-05-01 | M7 frontend scaffold closed; foolproof first vertical (shell, login, role nav, role-aware tier card)

Context: Slice 5c (D-043) closed the audit console MVP and unblocked frontend kickoff. Adi approved the M7 scaffold scope plus four open-question rulings before any code was written. Scope is intentionally narrow: zero real tab pages; ship the smallest end-to-end stack that proves login, role-resolution, role-scoped nav, JWT cookie handling, CSRF round-trip, OpenAPI codegen, and one authenticated read against one live backend endpoint. 40 of 40 vitest tests green plus end-to-end smoke against live backend (db + redis + uvicorn + npm run dev) confirms all seven acceptance gate items. Backend pytest baseline 171 of 171 unchanged (frontend scaffold did not touch backend code).

Decisions recorded:

1. Q1 ratified at kickoff: PortfolioOwner sees a populated tier-config card on /home rendered from GET /api/v1/admin/tier-config. Every other role sees a stub welcome card explaining the carve-out. Rationale: proving the authenticated read end-to-end is the smallest net-new vertical worth shipping in the scaffold. Deferring the card to its own slice would leave the scaffold without a single live data fetch and would require a second round of session-cookie + CSRF + Bearer-injection plumbing later. Ship once.

2. Q2 ratified at kickoff: Route Handler proxy at POST /api/auth/login. The proxy forwards email + password to backend POST /api/v1/auth/login, plants the backend-issued JWT in an httpOnly SameSite=Strict akb1_session cookie, and forwards the backend's csrf_token cookie as-is (HttpOnly=False per slice 5b D-041 ruling 11). NextAuth is NOT introduced at scaffold time. Rationale: NextAuth would mint its own JWT and persist it in its own cookie machinery, conflicting with the backend-issued JWT. The Route Handler proxy treats the backend JWT as the single source of truth; NextAuth's value (OAuth providers, session callbacks, session refresh choreography) is only relevant in Phase 2. Phase 2 OAuth path is documented as a code comment at the top of app/api/auth/login/route.ts so the migration target is captured at the swap site.

3. Q3 ratified at kickoff: openapi-typescript codegen. scripts/gen-openapi.sh dumps app.openapi() from the FastAPI app via the backend venv and writes frontend/openapi.json plus regenerates frontend/lib/api-client/schema.ts. --check mode (CI) fails on snapshot drift between backend spec and the committed openapi.json AND on diff between regenerated schema.ts and the committed copy. Both files are committed. Rationale: CLAUDE.md hard rule that OpenAPI generated from FastAPI is diffed against PRD in CI; codegen falls out almost free with the spec already produced; commits-not-build-time generation keeps reviewers in front of breaking shape changes; npm run gen:openapi:check is a one-line CI step.

4. Q4 ratified at kickoff: Tailwind palette declared in tailwind.config.ts as semantic tokens. The Option D Executive Mid hex values (Design Foundations rev 4 section 1, locked D-018) map to bg-base, bg-surface, bg-surface-elevated, bg-surface-subtle, border-subtle, border-strong, text-primary, text-secondary, text-muted, text-subtle, accent-gold, status-red, status-amber, status-green. Two role-accent supplementals (role-pm, role-fl) added for downstream tab work. Rationale: centralised tokens let later slices reskin or re-tier without sweeping component files; component code never carries inline hex; the rev 4 component additions in Design Foundations R4.11 land cleanly because every new chip or badge can pick from the same semantic vocabulary.

5. Frontend directory layout under frontend/ root with no src/ wrapper. Mirrors the README stub already shipped in the v0.1.0-wireframe scaffold (frontend/app, frontend/components, frontend/lib, frontend/tests, frontend/public). Rationale: the existing README pre-named the structure; switching to src/ now would create churn for downstream slices and cost the scaffold's foolproof-first-vertical posture.

6. lib/api-client/schema.ts committed alongside openapi.json so the CI diff is cheap and reproducible. Generated files are normally gitignored but here they are part of the contract surface: if the backend OpenAPI shape changes, the frontend's typed read paths must change in lockstep, and the diff is reviewable in the PR. .gitignore explicitly does not exclude these two files.

7. JWT_SECRET is read lazily at call time inside lib/auth/session.secretBytes() rather than cached at lib/env.ts module load. Rationale: caching at module load broke vitest tests because the test environment sets process.env.JWT_SECRET in beforeAll, which runs after module imports. Lazy read at call time costs one process.env access per JWT verify (negligible) and removes a class of test ergonomics bugs. Production has a single stable JWT_SECRET so the cache was never load-bearing in prod.

8. session.test.ts pinned to // @vitest-environment node. Rationale: jose's SignJWT enforces an instanceof Uint8Array check on the JWT payload that fails inside jsdom because jsdom remaps some Node globals. The session decode logic is server-only in production (Edge middleware + Server Components), so running its unit tests in node env is the truthful test environment.

9. typedRoutes experimental disabled. Rationale: typedRoutes refused to compile router.replace(redirectTo) in LoginForm because redirectTo is a runtime-string read from the URL search params and is not statically known at build time. The cost of disabling is small (loose typing on Link href), the cost of leaving it on is broken builds. Re-enable when all 18 tabs are wired as static routes and the only dynamic redirects are between known paths.

10. Next 14.2.35 selected over the originally-pinned 14.2.15 to clear the 2025-12-11 security advisory before any code shipped. Caret range "^14.2.35" pins the patched minor.

11. Edge middleware on /login and /home/* per Master PRD R3.1 RBAC pattern. Logged-in user hitting /login redirects to /home; unauthenticated user hitting /home or any sub-path redirects to /login?from=originalPath. The from query param is captured but the LoginForm's success redirect path is the from value (which the form's parent page reads from searchParams). Backend remains authoritative on every protected fetch (Security PRD section 6); the middleware is convenience only.

12. RoleAwareNav uses next/link without typedRoutes. The nav items are produced by lib/auth/role-nav.navForRole(role) which encodes the Master PRD R3.3 5-tab map for each of the 6 roles. Tab keys are TypeScript string literal types (TabKey union), so the map and any consumer get full intellisense even without typedRoutes.

13. RoleBadge applies the AP gold dot per Design Foundations rev 4 R4.1: a 4px gold dot in the upper-right corner of the role badge when ap_flag is true, with hover tooltip "Audit permission enabled". Achieved with an absolute-positioned span using bg-accent-gold and aria-label for screen readers.

14. TierConfigCard is a Server Component and not a client component. Rationale: Server Components can run the lib/api-client/fetcher.callBackend helper which uses next/headers cookies(), keeping the akb1_session JWT and the csrf_token cookie value entirely server-side. A client TierConfigCard would require either exposing the JWT to the browser (security regression) or proxying the GET through another Route Handler (round-trip cost for no gain). Stub branch for non-PO roles is also a Server Component; both branches return JSX synchronously after the conditional fetch.

15. BackendError class surfaces a typed error from the fetcher. status, detail, retryAfter are all carried as fields. TierConfigCard catches BackendError and renders an inline status-red banner with the backend detail; other exceptions re-throw. Rationale: a forbidden-from-backend response on tier-config (e.g., the JWT was tampered or expired) should render gracefully, not crash the page. Future slices add typed subclasses (NotAuthorisedError, AuditPermissionRequiredError, etc.) when they have user-facing handling.

16. LoginForm renders the 401 detail string verbatim from the backend ("Invalid email or password"). On 429 it parses Retry-After (seconds) and renders a countdown message ("Too many attempts. Try again in N seconds."). Rationale: per slice 3 D-039 ruling 5, the backend returns a uniform 401 detail to prevent existence-leak; the frontend must not paraphrase or split that detail or it leaks information through error-message divergence. 429 is shown as a parsed countdown so the user knows when to retry.

17. Vitest unit suite covers what unit tests can: role-nav map for all 6 roles (20), RoleAwareNav render assertions per role (7), RoleBadge with and without AP dot (3), LoginForm success / 401 / 429 (3), session.decodeSessionToken seven cases (7). Total 40. Playwright E2E is intentionally deferred until enough tabs exist to walk through; the live-backend smoke run during scaffold close stands in for end-to-end coverage at this scope.

18. End-to-end smoke run against the live stack confirms all seven acceptance gate items. PO login plants both cookies and renders the populated tier card. PM login plants both cookies and renders the stub card with the correct PM 5-tab nav. Logged-out /home returns 307 to /login?from=%2Fhome. Bad creds return 401 with backend detail. 429 path covered by the LoginForm unit test (not exercised in live smoke to avoid burning the seeded user's lockout budget). Backend pytest baseline 171 of 171 unchanged.

M7 scaffold verification gate roll-up:
- M7-S1 config layer: tsc --noEmit clean; npm run build produces 6 routes plus middleware (32.5 kB)
- M7-S2 lib layer: env, cookies, role-nav, session, fetcher all type-clean and unit-tested where applicable
- M7-S3 OpenAPI codegen: openapi.json regenerates from backend; schema.ts regenerates from openapi.json; --check mode catches drift
- M7-S4 routing layer: middleware, login, home, auth/login proxy, auth/logout proxy all in place
- M7-S5 components: RoleAwareNav, RoleBadge, TierConfigCard render correctly per role; tier card branches PO populated vs non-PO stub
- M7-S6 vitest: 40 of 40 green
- M7-S7 e2e smoke: PO login + populated card + correct nav; PM login + stub card + correct nav; unauthenticated /home redirect; bad-creds 401
- M7-S8 acceptance: em-dash and en-dash sweep clean across frontend authored files; tsc clean; vitest 40 green; build clean

Files created or modified during the M7 scaffold slice:
NEW (frontend/):
- package.json, tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js, .eslintrc.json, .gitignore, vitest.config.ts, vitest.setup.ts
- middleware.ts
- app/globals.css, app/layout.tsx, app/page.tsx
- app/login/page.tsx, app/login/LoginForm.tsx
- app/api/auth/login/route.ts, app/api/auth/logout/route.ts
- app/home/layout.tsx, app/home/page.tsx
- components/RoleAwareNav.tsx, components/RoleBadge.tsx, components/TierConfigCard.tsx
- lib/env.ts, lib/auth/role-nav.ts, lib/auth/cookies.ts, lib/auth/session.ts, lib/api-client/fetcher.ts
- lib/api-client/schema.ts (codegen output, committed)
- openapi.json (codegen input, committed)
- scripts/gen-openapi.sh (executable)
- tests/unit/role-nav.test.ts, tests/unit/role-aware-nav.test.tsx, tests/unit/role-badge.test.tsx, tests/unit/login-form.test.tsx, tests/unit/session.test.ts
DELETED (frontend/):
- app/.gitkeep, components/.gitkeep, lib/.gitkeep (superseded by real content; tests/unit/.gitkeep, tests/e2e/.gitkeep retained as the dirs are otherwise empty)
MODIFIED:
- docs/state/BUILD_STATE.md (header date, M7 row to 8 percent, frontend slice progress row added, frontend alpha green gate refreshed, M7 scaffold session log prepended, overall percent to 76)
- docs/state/DECISION_LOG.md (this entry)

Migrations applied: unchanged (001 through 006). No backend changes in this slice.

Persistence-everything sweep at M7 scaffold close: BUILD_STATE updated, DECISION_LOG appended with D-044 (this entry). Frontend memory checkpoint also updated for resume continuity per the Continuous-session-memory feedback rule.

Recommended next slice: M7-2 Executive tab content for PO and DD landing surfaces (would activate the first real tab page and exercise the second authenticated read against a richer backend surface), OR M7-2 Governance Operating Model tab (lights up four roles' primary nav at once because PO, DD, PM, RO all carry it in primary nav per Master PRD R3.3), OR populate programme-scoped backend resources (RAID, milestones, health snapshots) which would feed multiple frontend tab slices in parallel.

Owner: Claude Code. Signoff: Adi (pending M7 scaffold acceptance).

---

## D-043 | 2026-05-01 | M6 backend slice 5c closed; GET /audit/entry/{id} with before / after diff

Context: Slice 5b (D-041) shipped the auth perimeter; slice 5a (D-042) shipped programme scoping for DD/FL on /audit/search. Slice 5c completes the audit console MVP per PRD 26 section 10 by adding GET /api/v1/audit/entry/{entry_id}: returns one audit row including before_json, after_json, and a server-computed shallow diff. AP-strict (every allowed role must have ap_flag=true; PortfolioOwner without AP is denied with ApFlagDenied because there is no metadata-only fallback to scope to). 171 of 171 backend tests green (24 new in slice 5c). No new migration; reads from existing audit_trail_entries only. D-042 was backfilled to this log at the start of the slice 5c session before any code was written.

Decisions recorded:

1. require_audit_access extended with strict_ap: bool = False kwarg, not a sibling dependency. Default false preserves slice 4 /audit/search behaviour exactly: every existing call site is byte-identical and all 16 slice 4 audit-search tests pass without modification. /audit/entry/{id} passes strict_ap=True which removes the PortfolioOwner-without-AP carve-out so any allowed role without ap_flag=true is denied with ApFlagDenied + 403. Audit-on-denial logic stays in one place (the existing dependency body) rather than being duplicated inline at the route, which keeps the RoleDenied / ApFlagDenied write-and-commit-then-raise pattern sourced from one definition. Considered alternatives: (a) sibling dependency require_audit_access_strict, rejected because it duplicates the audit-write logic for no behavioural gain; (b) inline AP check in the route handler that writes ApFlagDenied + 403, rejected for the same reason.

2. Strict AP is justified by data sensitivity asymmetry between /audit/search and /audit/entry/{id}. /audit/search returns metadata only (entry_id, occurred_at, actor, endpoint, http_method, outcome, resource_type, resource_id, ip_address, user_agent) and PO without AP can still be safely scoped to own actions. /audit/entry/{id} returns the full before_json and after_json bodies plus a computed diff, which would expose mutation deltas authored by other actors if a non-AP caller could reach it. There is no metadata-only fallback that retains usefulness for the entry-detail endpoint, so the carve-out is removed.

3. Shallow diff over deep diff at slice 5c. The diff sections are added (top-level keys present in after but not before), removed (top-level keys present in before but not after), changed (top-level keys present in both with non-equal values, each entry carrying {before, after}). Nested objects (dict-valued top-level keys) are compared by value as opaque payloads; a change anywhere inside the nested object surfaces as a single changed entry on the parent key with the full prior and full new nested values. No path-style flattening, no array index alignment, no recursion. Rationale: the audit console MVP's user need is "what fields changed on this row" not "what byte changed in this 200-line JSON blob"; deep diff doubles the implementation surface and the test surface for a use case that has not yet been demanded. Deep diff (path expressions, nested-object descent, array index handling) is logged as a future enhancement and intentionally out of scope.

4. compute_shallow_diff returns None when either side is None, not an empty AuditEntryDiff. Rationale: a None on either side means the caller has no basis to compute a delta (the row recorded only one snapshot, e.g., a denial row with after_json={"reason": "ap_flag_required"} and before_json=None). Returning an empty AuditEntryDiff in that case would falsely imply the audit recorded both sides and they were identical. Tests assert this explicitly across all three null-pair cases (before-null, after-null, both-null).

5. Response field naming uses before_json, after_json, diff. The slice 5c brief's request_snapshot / response_snapshot terminology was rejected because: (a) the database columns are before_json and after_json since slice 1 D-037; (b) the slice 4 schemas/audit.py module docstring already pre-named the contract: "full diff render belongs to the per-row detail endpoint"; (c) the audit row stores state-before-mutation and state-after-mutation, not HTTP request payload and HTTP response payload, so request / response would be semantically wrong. Adi confirmed this ruling at slice 5c kickoff before any code was written.

6. resource_type for the audit row written on denial is "audit_entry", distinct from "audit_search" used by slice 4. This lets AP observers filter denial rows by which AP-gated surface they came from, without parsing the endpoint path. Pattern matches slice 4 D-040 ruling 9 (resource_type per audit-gated endpoint).

7. 404 short-circuits with no audit row written. Reads are not audited on success per D-039 ruling 8; the same rule extends to 404. The require_audit_access dependency runs first and only writes audit rows on denials (RoleDenied, ApFlagDenied); if the dependency lets the caller through and the entry_id is not found, the service raises 404 directly with no audit-row side effect. Test test_entry_unknown_id_returns_404_no_audit asserts the audit-row count is unchanged across the 404 response.

8. Successful read does not write an audit row. Same D-039 ruling 8. Test test_entry_successful_read_does_not_write_audit asserts the audit-row count is unchanged across a 200 response. This is the cross-cutting invariant for read endpoints; mutations remain audited per Q4 Option A.

9. No new migration. The endpoint reads from audit_trail_entries (existing schema since slice 1) and uses existing CHECK enum values for the denial outcomes (ApFlagDenied, RoleDenied added in slice 4 migration 004; GET as http_method added in slice 4 migration 005). Migration head remains 006_people_programme_assignments.

10. Service-level split: get_audit_search stays in services/audit_search.py, get_audit_entry lives in services/audit_entry.py. Per slice 5c kickoff. Single-responsibility per module; the search service carries cursor encoding, time-window resolution, and the programme-scoping subquery from slice 5a (none of which are needed for the entry-detail path), and the entry service carries the diff helper (which is not needed for search). Avoids cross-pollination of the two surfaces' concerns and keeps the diff helper independently importable for unit tests.

Slice 5c verification gate roll-up:
- 5c.1 require_audit_access strict_ap kwarg: existing slice 4 /audit/search tests (16) green without modification; PO+AP=false on /audit/search still scoped to own actions (slice 4 contract preserved)
- 5c.2 schemas/audit.py extended: AuditEntryDiff and AuditEntryDetail added; existing AuditSearchEntry / AuditSearchResponse unchanged
- 5c.3 services/audit_entry.py: 7 compute_shallow_diff helper unit tests green (added only, removed only, changed only, mixed, null-before, null-after, nested-as-opaque)
- 5c.4 GET /audit/entry/{entry_id} 17 integration tests green: 3 allowed-role 200 (PO/DD/FL with AP=true, full body assertion on the PO case incl. diff added/removed/changed), 2 ApFlagDenied (PO+AP=false manufactured, DD+AP=false from seed), 3 RoleDenied parametrised across (PM, HRBP, RO), 2 auth errors (no token, invalid token), 1 unknown entry_id 404 with audit-row-count regression guard, 1 successful-read-no-audit, 4 diff null/identical cases (before null, after null, both null, before==after with empty sections), 1 e2e (real /auth/login -> /audit/search -> /audit/entry/{id} with full shape assertion)
- 5c.5 acceptance: 171 of 171 tests green; em-dash and en-dash sweeps clean across all slice 5c authored or modified files; no-hardcoded-thresholds lint clean (no rule modules touched)

Files created or modified during slice 5c:
NEW: backend/app/services/audit_entry.py, backend/tests/integration/test_audit_entry.py.
MODIFIED: backend/app/auth/dependencies.py (+ strict_ap kwarg on require_audit_access; PO carve-out logic gated on the kwarg), backend/app/schemas/audit.py (+ AuditEntryDiff, + AuditEntryDetail; module docstring updated), backend/app/api/v1/audit.py (+ GET /audit/entry/{entry_id} route; + _AUDIT_ENTRY_RESOURCE and _AUDIT_ENTRY_ALLOWED_ROLES constants; module docstring updated), docs/state/BUILD_STATE.md (this slice's session log + checkpoint + gates updated), docs/state/DECISION_LOG.md (this entry, plus D-042 backfilled at session start).

Migrations applied: 001 through 006 (no new migration in slice 5c). Migration head unchanged: 006_people_programme_assignments.

Persistence-everything sweep at slice 5c close: BUILD_STATE updated (header date, M6 row to 53 percent, slice 5a row split out, overall percent to 73, current session log entry prepended, checkpoint and gates refreshed). DECISION_LOG appended with D-043 (this entry); D-042 backfill verified at session start. SESSION_LOG and MILESTONE_STATUS not yet touched in this slice; PROJECT_MANIFEST not yet touched. (Persistence-everything brief for slice 5c specified BUILD_STATE and D-043 only; SESSION_LOG, MILESTONE_STATUS, and PROJECT_MANIFEST will be updated in the next slice or as part of an end-of-day sweep if Adi requests it.)

Recommended next slice: begin M7 frontend scaffold against the stable auth and audit surfaces (audit console MVP is now complete: search + per-entry detail with diff), OR populate programme-scoped resources (RAID rows, milestones, health snapshots) which would activate the slice 5a-broad scoping expansion AND surface a richer set of mutation deltas in the audit console, OR extend AuditEntryDiff to deep-diff (nested-path alignment, array index handling) for richer audit forensics.

Owner: Claude Code. Signoff: Adi (pending slice 5c acceptance).

---

## D-042 | 2026-04-30 | M6 backend slice 5a closed; programme scoping for DD/FL on /audit/search

Context: Slice 5b (D-041) shipped the auth perimeter (Redis-backed lockout, per-IP rate limit, stateless CSRF). Slice 5a closes the slice 4 D-040 ruling 2 deferred TODO: programme scoping for DD/FL on /api/v1/audit/search. Per Adi's locked kickoff, slice 5a ships the narrow form (actor-based scoping); the broad form (resource-ownership scoping) is deferred until programme-scoped resources land. 147 of 147 backend tests green (9 new in slice 5a). Backfilled into DECISION_LOG.md on 2026-05-01 after the slice 5b sweep noticed the missing entry; the BUILD_STATE.md slice 5a session log was the source of truth and is preserved verbatim where overlapping.

Decisions recorded:

1. Migration 006_people_programme_assignments creates a new join table per kickoff. Columns: person_id UUID FK to people(person_id) ON DELETE CASCADE, programme_id TEXT FK to programmes(programme_code) ON DELETE CASCADE, assigned_at TIMESTAMPTZ DEFAULT NOW(). PK on (person_id, programme_id). Index on person_id for the caller-lookup hot path. Standard akb1_app grants on SELECT, INSERT, UPDATE, DELETE; "append-only" is application convention only, no DB-level enforcement (unlike audit_trail_entries which is locked down via REVOKE plus FORCE RLS per slice 1 D-037).

2. Kickoff naming inconsistency preserved for slice 5a, flagged for the next PRD cascade. Two issues: (a) people PK is person_id, not id (kickoff said people(id) as conversational shorthand; resolved to person_id); (b) programmes(programme_code) is a UNIQUE VARCHAR(32) natural key, not the PK; the new join column is named programme_id but holds the TEXT code per kickoff. Inconsistent with the rest of the codebase where programme_id always means UUID. Preserved as-shipped for slice 5a; flagged for the PRD rev 5 cascade to either rename the column to programme_code or migrate the join to the programmes UUID PK.

3. ON DELETE CASCADE on both FKs (person_id and programme_id). Assignments are derived state with no semantic meaning if either side is deleted: a person who leaves the org should not retain programme assignments, and a programme that is retired should not retain stale member rows. This is distinct from audit_trail_entries which never CASCADE deletes (audit history must outlive its referenced rows per slice 1 invariants).

4. ORM model PersonProgrammeAssignment in backend/app/models/person_programme_assignment.py and registered in models/__init__.py. Mirrors the table 1 to 1; no relationship() back to Person or Programme at this slice. Kept the import graph flat to avoid the slice 4 FK-circular-import pattern; relationships added when needed by a downstream slice.

5. Seed extension is deterministic via numpy.random.RandomState(SEED).choice(replace=False). Each of the 2 DDs and 3 FLs is assigned DD_FL_PROGRAMMES_EACH=3 programmes drawn from the 10-programme seed list. Overlaps allowed across distinct people (DD1 and DD2 both have STELLAR by deterministic draw); replace=False is per-person, not global. Total 15 assignments (2 * 3 + 3 * 3). Seed SHA-256 fingerprint changed from ef381cb3301765a8fa313c416bddb0fb66cbc3d608cf767d96aa212c70d93d41 (slice 4) to 56843a290993e21d89e2a546ac4a2307fa8d714f7e36dd949a4670bb28684a12 (slice 5a). Two-run byte-identicality test still green.

6. 5a-narrow scope (actor-based) shipped; 5a-broad scope (resource-ownership) deferred. Per Adi's confirmed scope at kickoff: slice 5a filters DD/FL audit search visibility by ACTOR programme membership only (caller sees rows whose actor_user_id is in someone-assigned-to-one-of-my-programmes). Resource-ownership scoping (caller sees rows whose resource_type plus resource_id maps to one of my programmes) is deferred until programme-scoped resources land (RAID rows, milestones, health snapshots). TODO comment in services/audit_search.py marks the 5a-broad seam.

7. Two-level scalar subquery in SQLAlchemy ORM compiles to a single Postgres query with index hits. Filter for DD/FL with AP=true: caller_programmes = SELECT programme_id FROM person_programme_assignments WHERE person_id = caller; in_caller_programmes = SELECT person_id FROM person_programme_assignments WHERE programme_id IN caller_programmes; final WHERE actor_user_id IN in_caller_programmes. Single SQL execution path, no application-layer post-filter. EXPLAIN-asserted via test that the inner subquery hits person_programme_assignments_person_id_idx.

8. PO with AP=true is unaffected by the new filter (still sees all rows). PO with AP=false is unaffected (still scoped to own actions per slice 4). The new filter applies ONLY to roles in (DeliveryDirector, FinanceLead) with AP=true. A role-routing branch was added to the audit_search service builder; the PO branch is unchanged.

9. Orphan-caller edge case: a DD or FL with zero person_programme_assignments entries sees an empty result set, including their own actions. The two-level subquery short-circuits to actor_user_id IN () which is always false. Documented in services/audit_search.py docstring; covered by a synthetic-actor test.

10. PO regression non-obvious correctness: PO has zero person_programme_assignments rows in seed (POs are not member-scoped). Test asserts PO with AP=true sees all rows including programme-scoped data, because the role branch routes PO around the subquery filter. The dual invariant orphan-DD-sees-empty AND orphan-PO-sees-all is guarded by the role-routing branch, not by the assignments table content.

Slice 5a verification gate roll-up:
- 5a.1 migration 006 applied; PK and index assertions green; ON DELETE CASCADE behaviour verified
- 5a.2 ORM model registered; round-trip insert and select green
- 5a.3 seed determinism: SHA-256 fingerprint 56843a2... reproduces byte-identically across two runs
- 5a.4 audit search programme scope: 9 new tests green (4 parametrised DD/FL across overlapping/disjoint, DD self-visibility, orphan-DD-zero-assignments, PO regression, e2e DD1 overlapping vs disjoint, EXPLAIN index assertion)
- 5a.5 acceptance: 147 of 147 tests green; em-dash and en-dash sweeps clean across all slice 5a authored or modified files; no-hardcoded-thresholds lint clean (no rule modules touched)

Files created or modified during slice 5a:
NEW: backend/alembic/versions/006_people_programme_assignments.py, backend/app/models/person_programme_assignment.py, backend/tests/integration/test_audit_search_programme_scope.py.
MODIFIED: backend/app/models/__init__.py (+ PersonProgrammeAssignment registration), backend/app/seed/generator.py (+ DD/FL programme assignment loop, + DD_FL_PROGRAMMES_EACH constant), backend/app/services/audit_search.py (+ DD/FL programme-scope subquery filter, + 5a-broad TODO comment), docs/state/BUILD_STATE.md, docs/state/DECISION_LOG.md (this entry, backfilled 2026-05-01), docs/state/SESSION_LOG.md (slice 5a entry prepended), docs/state/MILESTONE_STATUS.md (M6 slice 5a evidence), PROJECT_MANIFEST.md (version line and Phase 3 paragraph refreshed).

Migrations applied at slice 5a close: 001 through 006 (head: 006_people_programme_assignments).

Persistence-everything sweep status as of 2026-04-30 close: BUILD_STATE, SESSION_LOG, MILESTONE_STATUS, PROJECT_MANIFEST all current. DECISION_LOG was missed at close and backfilled 2026-05-01 before slice 5c kickoff.

Recommended next slice: GET /api/v1/audit/entry/{id} with full before/after diff for AP holders (small slice, completes the audit console MVP per PRD 26 section 10), OR begin M7 frontend scaffold now that the auth and audit surfaces are stable, OR populate programme-scoped resources (RAID, milestones, health snapshots) which would activate the 5a-broad scoping expansion.

Owner: Claude Code. Signoff: Adi (pending slice 5a acceptance at write time; signoff received 2026-05-01).

---

## D-041 | 2026-04-30 | M6 backend slice 5b closed; auth-hardening (Redis lockout, per-IP rate limit, stateless CSRF)

Context: Slice 4 (D-040) shipped the AP-gated audit-search endpoint and the denial-audit pattern. The auth perimeter still carried two known correctness gaps: the slice 3 in-memory lockout dict breaks the moment the API runs multi-worker, and there was no per-IP rate limit or CSRF protection ahead of the M7 frontend. Slice 5b closes all three. 138 of 138 backend tests green (21 new in slice 5b across Redis-lockout, rate-limit, and CSRF surfaces). 5b chosen over 5a (programme scoping) and 5c (audit entry diff) because the auth perimeter must be production-shaped before browser callers arrive.

Decisions recorded:

1. Redis client singleton on app.state. backend/app/cache.py exposes get_redis_client (process-wide async client created lazily) plus the FastAPI dependency get_redis. Production wires the client into app.state inside the FastAPI lifespan; tests mirror the same instance into app.state from the per-test fake_redis fixture. The reason both paths exist: Starlette ASGI middleware cannot use Depends, so app.state is the only injection seam shared between routes (which prefer Depends) and middleware (which must read state directly). Tests override get_redis via app.dependency_overrides for the route side and assign app.state.redis_client for the middleware side; the conftest http_client fixture handles both transparently.

2. Counter semantics over sliding-window for lockout. backend/app/auth/lockout.py is now an async wrapper around INCR plus EXPIRE-on-first. Per Adi's confirmed Divergence 1 ruling: TTL is anchored to the FIRST failure of a window and does NOT refresh on subsequent failures. Stricter than the slice 3 sliding-window pattern (a user at 4 failures who waits 14 minutes is still locked on attempt 5 if it lands inside the original key's TTL). Race guard: each record_failure pipelines INCR + TTL; if TTL comes back -1 it issues an explicit EXPIRE so the key never grows unbounded. The slice 3 in-memory dict, threading lock, and reset_all helper are all removed; a regression-guard test asserts the module surface stays clean.

3. Fail-loud over in-memory fallback. If Redis is unreachable the request fails (route raises an exception, middleware returns 503) rather than degrading to a process-local store. Per Adi's kickoff: "not a graceful degradation path, fail hard if Redis is unavailable so the gap is visible in ops." A silent in-memory fallback would let the multi-worker brute-force defense regress without any operator signal.

4. Tiered rate-limit caps over a shared per-IP-per-minute counter (Divergence 2c). Settings: rate_limit_auth_requests=10, rate_limit_default_requests=120, rate_limit_window_seconds=60. /api/v1/auth/* compares the shared counter against the auth cap; everything else under /api/v1/* compares against the default cap. Consequence: saturating the strict auth tier rejects further /auth/* calls but does not block default-tier traffic until the counter also exceeds the default cap. This is more restrictive than per-tier buckets (a heavy default user touching /auth even once after counter > 10 still 429s on the auth path) and was chosen because Adi's kickoff locked the single ratelimit:{ip}:{minute} key shape. Per-tier buckets are deferred until the intelligence prefix lands.

5. Per-minute sliding bucket retained over true token bucket (Divergence 3). Bucket key ratelimit:{ip}:{window_start_minute}. INCR + EXPIRE-on-first. This allows up to 2x burst at minute boundaries (a client could fire 120 in second 59 and another 120 in second 61) but is cheap, deterministic, and matches Adi's locked kickoff. Documented as an accepted deviation from PRD section 11 (which specifies token bucket) at current scale.

6. TRUSTED_PROXY setting gates X-Forwarded-For trust. Default empty in dev: middleware ignores X-Forwarded-For entirely and uses request.client.host as the bucket key. Closes the dev-time bypass where an attacker could rotate XFF headers to spread their requests across distinct buckets. In production compose, TRUSTED_PROXY is set to a non-empty marker; the middleware then trusts the first IP in X-Forwarded-For. The setting value itself is just a flag (the operator validates the proxy at the perimeter, not the application). Test pair locks both modes.

7. Health endpoint stays at root (no /api/v1 prefix), so the prefix filter naturally exempts it from rate limiting. No special case needed in the middleware. Same for /docs, /openapi.json, /redoc.

8. Per-test rate-limit override seam via app.state. RateLimitMiddleware reads limits from request.app.state first, falling back to the Settings instance bound at construction. Tests set app.state.rate_limit_auth_requests=3 (or similar) for fast deterministic tests without rebuilding the middleware stack. The conftest http_client fixture clears these attributes at setup and teardown so overrides do not leak across tests.

9. CSRF as defense-in-depth despite JWT-in-body auth. Today's auth path returns the JWT in the response body (not a cookie); CSRF is technically unexploitable for body-token clients because the browser will not auto-attach a body field. CSRF is still implemented per Adi's confirmed ruling so the M7 frontend has a free hand to switch to cookie-stored JWT later without a security gap. Cost is one stateless string compare per mutating request plus the test churn documented in items 10 to 12 below.

10. Stateless double-submit. backend/app/middleware/csrf.py compares the csrf_token cookie to the X-CSRF-Token header via secrets.compare_digest on POST/PUT/PATCH/DELETE under /api/v1/*. No server-side state, no Redis. /auth/login is exempt from verification (it is the issuance point); GET/HEAD/OPTIONS are exempt by spec; non-/api/v1 paths are exempt by prefix.

11. Token issued on successful login response. The middleware mints a 32-byte urlsafe-base64 token (43 ASCII chars after padding strip) and sets it as csrf_token cookie on every 2xx response to POST /auth/login. Cookie attributes: HttpOnly=False (browser JS must read the value to put it in the X-CSRF-Token header for double-submit), SameSite=Strict, Secure=False in dev. Failed login (401) does NOT mint a token: an attacker could otherwise harvest valid CSRF cookies without ever authenticating.

12. Test fixture pre-seed strategy. The default conftest http_client carries a fixed csrf_token cookie and matching X-CSRF-Token header so the ~30 mint_token-based mutating-endpoint tests work unchanged (they bypass real /auth/login entirely). The 4 e2e tests that perform real login were updated with a one-line _sync_csrf helper that lifts the freshly-issued cookie value into the client's default header after the login response, since httpx's cookie jar replaces the pre-seeded cookie. A separate http_client_no_csrf fixture (no pre-seed) exists for the dedicated test_csrf.py file so the missing-header / mismatch / login-issuance assertions are not masked.

13. Middleware order: RateLimitMiddleware outermost, CsrfMiddleware inner. Add order in main.py is reversed at request time so app.add_middleware(CsrfMiddleware) followed by app.add_middleware(RateLimitMiddleware) yields rate limit on the outside. Rationale: rate limit is the cheapest gate against attackers and should shed flood load before any other work happens, including the CSRF compare and any route handler.

14. Slice 3 follow-up cleared. The Redis-backed lockout closes the slice 3 in-memory single-worker trade-off documented in services/auth_login.py. Docstring updated to reflect the new contract.

15. Carried forward without change from D-040 ruling 10: deferred sentinel system user for unknown-email login audit. Still no AP-observer requirement.

16. Acceptance addendum (Adi confirmation 2026-04-30): shared bucket key ratelimit:{ip}:{minute} retained as shipped; the side effect that a heavy default-tier user can be denied subsequent /auth/* calls until the bucket expires is an accepted trade-off at slice 5b scope. Per-tier isolation via key shape ratelimit:{ip}:{tier}:{minute} is the planned upgrade and lands in the slice that introduces /api/v1/intelligence/*. Open loop carried in SESSION_LOG.

17. Acceptance addendum (Adi confirmation 2026-04-30): JWT storage choice (cookie vs body) is delegated to M7. The CSRF surface shipped here works for both cases; if M7 keeps body-stored JWT then CSRF stays defense-in-depth, if M7 flips to cookie-stored JWT then CSRF becomes load-bearing. No backend rework required either way.

18. Acceptance addendum (Adi confirmation 2026-04-30): the HttpOnly=False attribute on the csrf_token cookie is the documented deviation from the standard "cookies should be HttpOnly" hardening rule and is required by the double-submit pattern (browser JS must read the cookie value to put it in the X-CSRF-Token header). Flagged for explicit revisit during the M9 security review; if a stateful CSRF store is preferred at that time the swap is local to the middleware (one Redis lookup per mutating request).

Slice 5b verification gate roll-up:
- 5b.1 Redis lockout: 13 slice 3 lockout tests carried over green plus 4 new (Redis key shape with TTL bound, key cleared on success, per-email key isolation, in-memory-state regression guard)
- 5b.2 rate limit middleware: 8 tests green (health exempt, auth tier 429, default tier 429, shared-counter tiered semantics, bucket reset on key delete, XFF ignored when trusted_proxy empty, XFF first-IP honoured when trusted_proxy set, Redis key shape and TTL bound)
- 5b.3 CSRF middleware: 9 tests green (missing both, cookie only, header only, mismatch, match, GET exempt, POST /auth/login exempt from verification, login response sets the cookie, failed login does not mint a token)
- 5b.4 acceptance: 138 of 138 tests green; em-dash and en-dash sweeps clean; no-hardcoded-thresholds lint clean

Files created or modified during slice 5b:
NEW: backend/app/cache.py, backend/app/middleware/__init__.py, backend/app/middleware/rate_limit.py, backend/app/middleware/csrf.py, backend/tests/integration/test_rate_limit.py, backend/tests/integration/test_csrf.py.
MODIFIED: backend/requirements.txt (+ redis 5.2.1, + fakeredis 2.26.1), backend/app/auth/lockout.py (in-memory dict and reset_all removed; Redis-backed counter with race-guarded TTL), backend/app/services/auth_login.py (positional Redis client argument, await on lockout calls, docstring update), backend/app/api/v1/auth.py (Depends(get_redis)), backend/app/main.py (lifespan sets app.state.redis_client; CsrfMiddleware then RateLimitMiddleware added), backend/app/config.py (rate_limit_*, trusted_proxy, csrf_* settings added), backend/tests/integration/conftest.py (fake_redis fixture, http_client fixture overrides get_redis and pre-seeds CSRF state, http_client_no_csrf sibling fixture, rate-limit override cleanup), backend/tests/integration/test_auth_login.py (lockout.reset_all autouse removed; 4 Redis-specific tests added), backend/tests/integration/test_e2e_login_patch_get.py (lockout import removed; _sync_csrf helper applied after each login), backend/tests/integration/test_e2e_audit_search.py (same), docs/state/BUILD_STATE.md, docs/state/DECISION_LOG.md (this entry), docs/state/SESSION_LOG.md (slice 5b entry prepended), docs/state/MILESTONE_STATUS.md (M6 slice 5b evidence), PROJECT_MANIFEST.md (version line + Phase 3 paragraph refreshed).

Persistence-everything sweep complete: BUILD_STATE, DECISION_LOG, SESSION_LOG, MILESTONE_STATUS, PROJECT_MANIFEST all current.

Recommended next slice: programme scoping for DD/FL on /audit/search (closes the slice 4 deferred TODO; needs people-to-programmes join table), OR GET /api/v1/audit/entry/{id} with full before/after diff for AP holders (small slice, completes the audit console MVP per PRD 26 section 10), OR begin M7 frontend scaffold now that the auth surface is stable.

Owner: Claude Code. Signoff: Adi (pending slice 5b acceptance).

---

## D-040 | 2026-04-25 | M6 backend slice 4 closed; AP flag enforcement, first AP-gated endpoint, outcome enum extended

Context: Slice 1 (D-037) shipped the foolproof first vertical. Slice 2 (D-038) added the second mutating endpoint plus shared update_with_audit decorator. Slice 3 (D-039) closed the auth contract end-to-end. Slice 4 implements the AP flag enforcement pattern that D-038 ruling 10 reserved for the first AP-gated endpoint slice, ships GET /api/v1/audit/search per PRD 26 section 10, and extends audit_trail_entries.outcome with ApFlagDenied and RoleDenied so denial reasons are queryable. 117 of 117 backend tests green (18 new in slice 4).

Decisions recorded:

1. Composite require_audit_access dependency: backend/app/auth/dependencies.py adds two dependencies. require_ap_flag is a standalone dep that enforces user.ap_flag is true (no audit; mirrors require_role's no-side-effects pattern). require_audit_access(resource_type, *allowed_roles) is a composite for AP-gated endpoints: role mismatch writes RoleDenied audit row + 403; ap_flag false writes ApFlagDenied audit row + 403. Audit row written via the standard write_audit_entry inside the request session with explicit session.commit before HTTPException raises (pattern from services/auth_login.py slice 3). Endpoint signature: `Depends(require_audit_access('audit_search', 'PortfolioOwner', 'DeliveryDirector', 'FinanceLead'))`.

2. PortfolioOwner allowed through ap_flag=false on AP-gated endpoints: PO with AP=false gets 200 with own-actions row scope (per PRD 26 access matrix). DD and FL require AP=true (per slice 4 kickoff scope; PRD 26 access matrix is more permissive but kickoff is more restrictive, go with kickoff for slice 4). Programme scoping for DD and FL with AP=true is deferred (data model needs people-to-programmes mapping); slice 4 treats them as "see all rows" with TODO logged.

3. Migration 004_outcome_enum_extension adds ApFlagDenied + RoleDenied to audit_trail_entries.outcome CHECK enum. Per D-038 ruling 10 forward-looking note. Existing values Success / Denied / Error preserved.

4. Migration 005_http_method_get adds GET to audit_trail_entries.http_method CHECK enum. Required because the AP-gated GET /audit/search endpoint must audit denials (per kickoff: "DD/AP=false 403 with detail 'Audit Permission required' emits ApFlagDenied audit row"). PRD section 4.71 originally restricted http_method to mutating methods on the rationale "read endpoints not audited at this volume"; that covered SUCCESSFUL reads, but DENIALS on read endpoints must audit per the AP governance contract. Divergence from PRD 4.71 logged for the next PRD cascade to fold in.

5. Forward-only downgrade for migrations 004 and 005: the restrictive constraint cannot be restored if any audit_trail_entries row carries the new values (ApFlagDenied, RoleDenied, http_method='GET'), because DELETE on the table is REVOKE'd per the slice 2.3 append-only invariant. Both downgrades are no-op for the constraint; the constraint only reverts when 001_rev4_foundation downgrade drops the table. Per-step downgrade -1 from 005 or 004 leaves the extended constraint in place; full downgrade chain to base still works because 001 drops the table along with its rows.

6. GET /api/v1/audit/search response shape: wrapped {items, next_cursor, total_count, page_size} per slice 3 list response convention. AuditSearchEntry omits before_json and after_json (full diff render belongs to GET /audit/entry/{id} which gates body behind AP=true and lands in a later slice; this keeps non-AP callers from indirectly reading mutation deltas through the search endpoint).

7. Cursor pagination encoding: urlsafe base64 of JSON {"ts": isoformat, "id": uuid_str}. Opaque to clients. Cursor decode raises 400 on malformed input. Page size 50 default, 200 max (matches PRD 26 section 3). Total_count via separate COUNT(*) subquery on the same filter shape excluding cursor and order. Order is (occurred_at DESC, entry_id DESC) for tie-breaking.

8. Filter parameters: actor_user_id, resource_type (max 64 chars), resource_id (UUID), http_method (POST|PUT|PATCH|DELETE; GET intentionally excluded since search results don't include the search endpoint's own GET audit unless filtering by outcome=RoleDenied or ApFlagDenied), outcome (Success|Denied|Error|ApFlagDenied|RoleDenied), time_window (1h|24h|7d|30d). FastAPI Query pattern validation rejects invalid values with 422.

9. Audit search endpoint name and resource_type: endpoint /api/v1/audit/search (under audit prefix, mounted at the same /api/v1 router prefix as auth and admin). resource_type='audit_search' for the audit row written on denials.

10. Carried forward without change from D-039: deferred sentinel system user for unknown-email login audit. Per Adi confirmation in slice 3 close. Documented in services/auth_login.py docstring (updated this session).

11. Carried forward from D-038 ruling 12: ALTER TABLE DISABLE ROW LEVEL SECURITY remains a privileged DDL escape that the table owner can issue. Mitigation in PRD 03 rev 3 operational runbook.

12. Persistence-everything directive (Adi rule, hard, applies to every slice from this one forward): five state files updated at slice close. Documented as a meta-decision: SESSION_LOG.md created as a new file at slice 4 close per directive D; future slices append entries.

Slice 4 verification gate roll-up:
- 4.1 dependencies green: require_ap_flag standalone test (implicit via integration), require_audit_access exercised by all 8 role x AP integration paths
- 4.2 migration 004 applied; CHECK enum extended; downgrade documented as forward-only
- 4.2b migration 005 applied; CHECK enum extended for GET; same forward-only pattern
- 4.3 audit search 16 contract tests green: PO/AP=true 200 all, PO/AP=false 200 own scope, DD/AP=true 200, DD/AP=false 403 ApFlagDenied audit, FL/AP=false 403 ApFlagDenied audit, PM/HRBP/RO 403 RoleDenied audit, 401 missing/invalid token, cursor pagination 3-page cycle, invalid cursor 400, resource_type filter, time_window filter, invalid time_window 422, outcome filter
- 4.4 e2e 2 tests green: login -> PATCH (tier_config + threshold_register) -> /audit/search, login itself appears in search
- 4.5 acceptance: 117 of 117 tests green; em-dash and en-dash sweeps clean; direct lint clean

Files created or modified during slice 4:
NEW: backend/alembic/versions/004_outcome_enum_extension.py, backend/alembic/versions/005_http_method_get.py, backend/app/schemas/audit.py, backend/app/services/audit_search.py, backend/app/api/v1/audit.py, backend/tests/integration/test_audit_search.py, backend/tests/integration/test_e2e_audit_search.py, docs/state/SESSION_LOG.md.
MODIFIED: backend/app/auth/dependencies.py (+ require_ap_flag, require_audit_access; Request and AsyncSession promoted to top-level imports), backend/app/models/audit_trail_entries.py (CHECK constraints extended), backend/app/main.py (+ audit router), backend/app/services/auth_login.py (docstring on deferred sentinel system user clarified), docs/state/BUILD_STATE.md, docs/state/DECISION_LOG.md (this entry), docs/state/MILESTONE_STATUS.md (M1-M5 closed states reflected, M6 row updated), PROJECT_MANIFEST.md (version + phase + slice count refreshed).

Persistence-everything sweep complete: BUILD_STATE, DECISION_LOG, MILESTONE_STATUS, SESSION_LOG, PROJECT_MANIFEST all current.

Recommended next slice: programme scoping for DD/FL on /audit/search needs a people-to-programmes mapping (current people.programme_id is for PMs only, one programme each). Lift that with a separate join table in slice 5 prep, OR begin auth-hardening slice 5 candidate (CSRF per PRD 03 section 9, per-IP rate limit per PRD 03 section 11, Redis-backed lockout per D-039 follow-up), OR ship GET /api/v1/audit/entry/{id} per PRD 26 section 10 to surface the full before/after JSON diff for AP holders (small slice, completes the audit console MVP).

Owner: Claude Code. Signoff: Adi (pending slice 4 acceptance).

---

## D-039 | 2026-04-25 | M6 backend slice 3 closed; auth login, read-side GETs, e2e flow

Context: Slice 1 (D-037) shipped one PATCH endpoint plus the foolproof vertical. Slice 2 (D-038) added a second PATCH and the shared `update_with_audit` decorator. Slice 3 closes the auth contract end-to-end: POST /auth/login plus read-side GETs for both admin endpoints plus a real login -> PATCH -> GET test that validates the production token flow. 99 of 99 backend tests green.

Decisions recorded:

1. bcrypt direct, no passlib middleman: passlib 1.7.4 (last released 2020) is incompatible with bcrypt 5.x because bcrypt removed the legacy `__about__` module. Removed `passlib[bcrypt]==1.7.4` from requirements; added `bcrypt==5.0.0` direct. backend/app/auth/passwords.py wraps bcrypt.hashpw / bcrypt.checkpw with cost factor configurable via BCRYPT_ROUNDS env var (default 12; tests run at 4 for speed). Hard rejects passwords longer than 72 bytes (bcrypt 5.x raises rather than silently truncating).

2. Seed-time bcrypt hash literal for byte-identicality: bcrypt.gensalt is non-deterministic by design (random salt). The seed cannot call hash_password live without breaking the SHA-256 byte-identicality test from slice 2.4. Embedded a single precomputed bcrypt hash literal (cost 4) for the canonical demo password "akb1_demo_password" in backend/app/seed/generator.py as `SEED_PASSWORD_HASH`. All 300 seeded users share this hash. New seed SHA-256 ef381cb3301765a8fa313c416bddb0fb66cbc3d608cf767d96aa212c70d93d41 (changed from e9c4f57... in slice 2 due to schema addition). Production resets passwords during onboarding.

3. Migration 003_password_hash: ALTER TABLE people ADD COLUMN password_hash VARCHAR(128) NOT NULL DEFAULT ''. Empty default keeps the migration safe against any existing rows (none in fresh DB; the seed fills every row). Down-migration drops the column.

4. JWT issued by login service, JWT_SECRET sourced from env (never hardcoded): mint_token in backend/app/auth/tokens.py reads settings.jwt_secret which loads from JWT_SECRET env var via pydantic-settings. Default in dev is "replace_with_long_random_string_before_deploy" with the explicit dev-warning string. Production deployments must set JWT_SECRET. Token payload: sub (user_id), role, ap_flag, iat, exp.

5. Uniform 401 detail "Invalid email or password" for unknown user AND wrong password (no existence leak): both code paths return the identical detail string. The HTTP status code, response body, and timing should not allow an external caller to infer whether an email exists. Confirmed in test_login_unknown_email_returns_401_with_same_detail.

6. Audit-on-known-email-only trade-off: audit_trail_entries.actor_user_id is NOT NULL FK to people. For unknown emails there is no actor to attribute, so unknown-email failures do not write an audit row. Known-email Denied DOES write audit (actor = the matched user). Documented in services/auth_login.py docstring. Future option: seed a sentinel "system" user so unknown-email failures can be attributed; deferred to slice 4+ if AP-flagged audit observers need that visibility.

7. Per-email lockout in-memory: backend/app/auth/lockout.py tracks failure timestamps per email in a thread-safe defaultdict. 5 failures in a 15-minute rolling window returns 429 with Retry-After header. Eviction happens on next check (lazy). Successful login clears the email's failure history. Single-worker deployment is fine for slice 3; production multi-worker needs Redis-backed state. Redis already in docker-compose; carrying forward as slice 3 hand-back follow-up. Per-IP rate limiting (PRD 03 section 11) is a separate defense and lands in a later slice.

8. Explicit session.commit() on the login path: auth_login.login does not use `async with session.begin():` because the Denied audit row must persist BEFORE the HTTPException(401) is raised. With begin() the exception would roll back the audit row. Pattern: write audit, await session.commit(), then raise. If commit fails, the session context manager rolls back automatically and the exception propagates as 500. Successful path commits the Success audit row and then mints the JWT (so audit failure prevents JWT issuance, preserving Q4 Option A).

9. Read endpoints (GET /admin/tier-config, GET /admin/threshold-register) are not audited per spec. Reads do not mutate state; the audit invariant applies to PATCH/POST/DELETE only. Test test_get_..._does_not_write_audit verifies count stays unchanged. PO-only via require_role; reads scoped at the application layer (no row-level scoping needed for slice 3 because both endpoints return the full register).

10. Wrapped list response shape `{"items": [...]}` for both GET endpoints. Forward extensibility for pagination, total_count, next_cursor when row counts grow. Pydantic models TierConfigList and ThresholdRegisterList encode this consistently.

11. End-to-end test (slice 3.4) replaces the manual mint_token shortcut in critical-path validation. mint_token is retained for unit tests that need to test individual endpoint behaviour without exercising the login round-trip; the e2e suite proves the production token flow works against both PATCH and GET.

12. ASGITransport(raise_app_exceptions=False) carried forward from slice 2: unhandled exceptions in route handlers surface as 500 responses (matches Starlette production behaviour) instead of bubbling up into the test code. Matters for the auth path because audit failures would otherwise kill the test runner.

Forward-looking items unchanged from D-038:
- AP flag enforcement (require_ap_flag dependency layered on require_role) lands in the slice that ships the first AP-gated endpoint (PRD 26 Audit Trail Console). audit_trail_entries.outcome CHECK enum extension to add ApFlagDenied and RoleDenied at the same time.
- Operational residual: ALTER TABLE DISABLE ROW LEVEL SECURITY remains a privileged DDL escape; mitigation in PRD 03 rev 3 operational runbook.

Slice 3 verification gate roll-up:
- 3.1 password_hash schema + bcrypt: migration 003 applied; bcrypt verify works; seed SHA-256 ef381cb... byte-identical across runs
- 3.2 POST /auth/login: 13 contract tests green (success, wrong-password, unknown-email, lockout, validation, password-hash-never-returned)
- 3.3 GET /admin/tier-config + GET /admin/threshold-register: 14 contract tests green (PO 200, 5 non-PO 403 each, 401 missing token, no-audit-on-read)
- 3.4 e2e login -> PATCH -> GET: 3 tests green (full flow, threshold flow, PM-then-PO)
- 3.5 acceptance: 99 of 99 tests green; em-dash and en-dash sweeps clean; direct lint clean

Files created or modified during slice 3:
NEW: backend/alembic/versions/003_password_hash.py, backend/app/auth/passwords.py, backend/app/auth/lockout.py, backend/app/schemas/auth.py, backend/app/services/auth_login.py, backend/app/api/v1/auth.py, backend/tests/integration/test_auth_login.py, backend/tests/integration/test_admin_get.py, backend/tests/integration/test_e2e_login_patch_get.py.
MODIFIED: backend/requirements.txt (passlib out, bcrypt direct in), backend/app/models/people.py (+ password_hash column), backend/app/seed/generator.py (+ SEED_PASSWORD_HASH literal, INSERT updated), backend/app/main.py (+ auth router), backend/app/api/v1/admin.py (+ 2 GET endpoints), backend/app/schemas/admin.py (+ TierConfigList, ThresholdRegisterList), docs/state/BUILD_STATE.md, docs/state/DECISION_LOG.md (this entry).

Recommended next slice: implement the AP flag enforcement pattern (require_ap_flag dependency on top of require_role) and ship the first AP-gated endpoint (GET /api/v1/audit/search per PRD 26 section 10). At the same time extend audit_trail_entries.outcome CHECK enum to add ApFlagDenied and RoleDenied so denial reasons are auditable and queryable. This unblocks the audit governance surface and validates the AP flag pattern before slice 5+ scales to the full PRD 26 endpoint set.

Alternative: round out the auth perimeter with Phase 1 CSRF (PRD 03 section 9) and per-IP rate limiting in Redis (PRD 03 section 11) before frontend M7 starts. Pre-empts a class of M7 integration friction.

Owner: Claude Code. Signoff: Adi (pending slice 3 acceptance).

---

## D-038 | 2026-04-25 | M6 backend slice 2 closed; second endpoint, shared decorator, exercised lint

Context: Slice 1 (D-037) shipped one PATCH endpoint and the foolproof vertical. Slice 2 extends to a second endpoint and refactors the audited-mutation pattern into a shared decorator. Three phases per Adi's locked scope: (1) PATCH /admin/threshold-register/{metric_id} green; (2) refactor both endpoints onto update_with_audit without breaking slice 1 tests; (3) exercise the no-hardcoded-thresholds lint.

Decisions recorded:

1. Second endpoint shape mirrors tier-config exactly. ThresholdRegisterUpdate schema with 9 optional editable fields (display_name, direction, green_threshold, amber_threshold, red_threshold, range_lower, range_upper, rationale_text, owning_role) plus a model_validator requiring at least one provided. metric_id is path-only and not editable. last_calibrated_at and last_calibrated_by are system-set on every PATCH. PO-only via require_role. Audit row in same transaction.

2. Decimal-as-string in audit snapshots: Decimal columns (numeric(10,2)) serialise to string when written into before_json / after_json. Rationale: JSON has no native Decimal type; numeric values would degrade to float and risk precision loss in audit reconstruction. Tests verify str(Decimal("28.00")) round-trips back via Decimal(snapshot["green_threshold"]).

3. Pydantic v2 PATCH semantics: None means "no change" (not "set to NULL"). Distinguishing "not provided" from "explicit null" requires a Pydantic sentinel pattern that adds complexity without slice-1 or slice-2 demand. Documented limitation in service docstring; can revisit when a tenant needs to NULL out range_lower / range_upper without changing direction.

4. Shared update_with_audit decorator (slice 2.2): extracted the SELECT FOR UPDATE plus before-snapshot plus mutate plus flush plus after-snapshot plus audit-write pattern into backend/app/services/audited_mutation.py. Mutating endpoints supply: a SELECT statement, a not-found message, snapshot_fn callable(row) -> dict, mutate_fn callable(row) -> None, plus audit identity (actor_user_id, actor_role, endpoint_path, http_method, resource_type, optional resource_id). Both update_tier_config and update_threshold reduced to: build mutate_fn closure plus delegate. AuditWriter type alias moved to audited_mutation.py and re-exported from tier_config.py for backward-compat with the slice 2.5 import path in admin.py. All 33 slice-1 plus slice-2.1 contract tests stay green without modification, proving the refactor is externally transparent.

5. Atomic rollback responsibility stays with the caller's `async with session.begin():` block. update_with_audit re-raises whatever mutate_fn / snapshot_fn / audit_writer raises so the begin context rolls back. SAVEPOINTs are not introduced; the begin context is sufficient since each PATCH is one logical transaction.

6. Lint script accepts optional path arg (slice 2.3): `scripts/check_no_hardcoded_thresholds.sh [PATH]` defaults to `backend/app/intelligence/rules` and overrides via $1. Used by the unit test suite to point at a temp directory of fixture files so the rule can be exercised without polluting the real rules directory.

7. Lint regex tightened: pattern was `[><=!]=?` which matched single `=` (assignment) and would false-positive on module-level constants like `__version__ = 1`. Pattern now `(>=|<=|==|!=|>|<)` which only matches Python comparison operators. Documented in script comments.

8. Lint comment-skip filter corrected: regex was `^[^:]+:[0-9]+:[[:space:]]*#` assuming grep -rn output format `FILENAME:LINENO:CONTENT`. The script uses single-file `grep -n` which emits `LINENO:CONTENT` (no filename). Corrected to `^[0-9]+:[[:space:]]*#`. Caught by the lint test `test_lint_skips_comment_only_lines` on first run.

9. Lint test harness pattern: use `subprocess.run([str(LINT_SCRIPT), str(tmp_path)])` from a pytest unit test with parametrised literal patterns. 7 parametrised literal-comparison cases plus 6 single-case allow / block cases plus 1 default-invocation guard against the real rules dir. Total 15 lint unit tests.

10. Forward-looking AP flag pattern (per Adi's slice 1 acceptance message; NOT implemented in slice 2): a separate `require_ap_flag()` FastAPI dependency layered on `require_role()`. Reads CurrentUser.ap_flag, raises 403 with detail "Audit Permission required" on false. Apply to PRD 26 audit endpoints and PRD 25 AI governance audit-scope entities. Distinct ApFlagDenied vs RoleDenied outcomes recorded in audit_trail_entries.outcome: this requires extending the outcome CHECK enum to include the new values (currently just `Success`, `Denied`, `Error`). Lands in the PRD 26 endpoint slices, not slice 2.

11. Operational residual unchanged from D-036 ruling 12 / D-037: ALTER TABLE DISABLE ROW LEVEL SECURITY remains a privileged DDL escape that the table owner can issue. Mitigation belongs in PRD 03 rev 3 operational runbook (Phase 2 cascade item), confirmed in slice 1 hand-back.

Slice 2 verification gate roll-up:
- 2.1 PATCH /admin/threshold-register/{metric_id}: 18 contract tests green (Decimal-as-string snapshots verified, range-band metric snapshot verified, atomic rollback verified)
- 2.2 update_with_audit refactor: 33 of 33 endpoint tests green without modification
- 2.3 no-hardcoded-thresholds lint exercised: 15 unit tests green; lint regex tightened; comment-skip corrected
- 2.4 acceptance: 67 of 67 tests green; em-dash and en-dash sweeps clean; direct lint invocation clean

Files created or modified during slice 2:
NEW: backend/app/services/audited_mutation.py, backend/app/services/threshold_register.py, backend/tests/integration/test_threshold_register_patch.py, backend/tests/unit/test_no_hardcoded_thresholds.py.
MODIFIED: backend/app/schemas/admin.py (+ ThresholdRegisterUpdate, ThresholdRegisterResponse), backend/app/api/v1/admin.py (+ patch_threshold_register endpoint), backend/app/services/tier_config.py (rebound to update_with_audit; AuditWriter re-export), scripts/check_no_hardcoded_thresholds.sh (optional path arg, regex tightened, comment-skip fixed), docs/state/BUILD_STATE.md, docs/state/DECISION_LOG.md (this entry).

Recommended next slice: ship JWT login endpoint (POST /api/v1/auth/login) plus read-side GET /api/v1/admin/tier-config so the PATCH flow has a complete read-write loop and frontend M7 can consume the auth contract. Alternative: begin Audit Trail Console PRD 26 endpoints which exercise the AP flag pattern (require_ap_flag) and validate the forward-looking outcome enum extension.

Owner: Claude Code. Signoff: Adi (pending slice 2 acceptance).

---

## D-037 | 2026-04-25 | M6 backend slice 1 closed; auth, atomic-rollback, and test-fixture patterns locked

Context: D-036 launched the slice 1 vertical and resolved 12 architectural questions through 4 Q&A rounds. This entry closes slice 1 with the additional architectural decisions locked during execution that did not surface in the pre-build Q&A. Slice 1 is GREEN: 34 of 34 backend tests pass.

Decisions recorded:

1. Auth library: python-jose (jose.jwt) for HS256 JWT encode and decode. Rationale: pure-Python implementation with no native deps; cleanly compatible with FastAPI's HTTPBearer dependency. Alternative PyJWT considered; jose chosen because the broader Auth0 / NextAuth ecosystem (M7 frontend) standardises on it, easing the M7 handoff. Tokens carry sub (user_id), role, ap_flag, iat, exp claims.

2. require_role dependency factory pattern: a closure `require_role(*allowed)` returns an async dependency that wraps `get_current_user` and raises 403 on role mismatch, 401 on missing or invalid token. Endpoints declare `Depends(require_role('PortfolioOwner'))` for compile-time-readable allowlists. AP flag enforcement is endpoint-local in slice 1 (not yet needed by PATCH tier-config which is PO-only); landed in CurrentUser model for use by AP-gated endpoints in later slices.

3. Service-layer atomic transaction pattern: the endpoint handler opens `async with session.begin():` and delegates to a service function that performs SELECT FOR UPDATE, builds before snapshot, applies UPDATE, flushes, builds after snapshot, and writes the audit row via an injected audit_writer. Any raise inside the begin block triggers session rollback. The audit_writer parameter is dependency-injected via FastAPI Depends(get_audit_writer) so tests can override it to a failing implementation without monkey-patching.

4. Atomic rollback test pattern: pytest fixture sets `app.dependency_overrides[get_audit_writer] = lambda: failing_writer`. httpx ASGITransport configured with `raise_app_exceptions=False` so the simulated RuntimeError surfaces as an HTTP 500 response (matches Starlette production behaviour) instead of bubbling up through the test transport. dependency_overrides cleared at fixture teardown so injection does not leak across tests.

5. SQLAlchemy async + pytest-asyncio cross-loop compatibility: pytest-asyncio creates a fresh event loop per test (function scope), and a module-level engine with a connection pool binds connections to the loop that imported it. Two-part fix: (a) `app/db.py` switches to NullPool when `PYTEST_CURRENT_TEST` env var is set so each request creates a fresh connection bound to the current loop; (b) the http_client fixture awaits `engine.dispose()` before and after each test so the engine's internal loop refs reset. Production engine retains pool_size=10 plus max_overflow=20.

6. Test fixture strategy for append-only invariant tables (Option C, slice 2.4 mid-build resolution): seed assumes empty schema and raises if any seed table is non-empty. Tests reset between seed runs via `await asyncio.to_thread(reset_schema_via_alembic)` which calls `alembic.command.downgrade(cfg, 'base')` then `alembic.command.upgrade(cfg, 'head')` from a sync thread (env.py uses asyncio.run internally). Session-scoped `session_seeded_schema` fixture resets and seeds once for read-only state-check tests. Function-scoped `seeded_for_mutation` fixture resets and seeds per test for mutation tests. Cost: ~3s per mutation test setup; preserves the slice 2.3 invariant exactly (no GRANT UPDATE relaxation needed).

7. Audit row resource_id NULL convention for non-UUID PKs: `escalation_tier_config.tier_number` is SMALLINT not UUID. The `audit_trail_entries.resource_id` column is UUID nullable per section 4.71. Convention: when the mutated entity has a non-UUID PK, resource_id is NULL and the PK value lives in before_json plus after_json full snapshots. Documented inline in `app/services/tier_config.py`.

8. Endpoint exception model: Pydantic body validation returns 422 (Pydantic v2 `extra='forbid'` rejects unknown fields). Auth missing or invalid returns 401 with WWW-Authenticate header. Role mismatch returns 403. Unknown tier returns 404 (raised from service layer). Audit failure returns 500 (Starlette default for unhandled exceptions). All paths verified by contract tests.

9. Connection user passwords default fix: `app/config.py` default for `database_url` corrected from the original `akb1_dev_password` placeholder to `akb1_app_password` to match the init script. Without this fix, the FastAPI app could not authenticate to Postgres without a custom .env. Note for production: real passwords come from Vault per PRD 03 §12.

10. NullPool resource warning: SQLAlchemy occasionally emits `RuntimeWarning: coroutine 'Connection._cancel' was never awaited` under NullPool plus engine.dispose between tests. Confirmed not a correctness issue; marked as known noise. Consider switching to AsyncAdaptedQueuePool with size 1 in tests if the warning becomes problematic.

Operational residual carried forward from D-036 ruling 12: ALTER TABLE DISABLE ROW LEVEL SECURITY remains a privileged DDL escape that the table owner can issue. Mitigation belongs in PRD 03 rev 3 operational runbook (Phase 2 cascade item) and the deployment hardening guide. Postgres true SUPERUSER bypass also out of scope (no application path connects as bootstrap superuser).

Slice 1 verification gate roll-up:
- 2.1 scaffold: pytest 2 of 2 green; uvicorn /health 200
- 2.2 docker compose: db plus redis healthy in under 25s; init script provisions akb1_owner plus akb1_app
- 2.3 first migration: up plus down plus up idempotent; 6 parametrised tests across both roles confirm append-only
- 2.4 seed determinism: SHA-256 e9c4f5729da4e0fc8856a9d2c1c43a0c458e9e99dff58ffaf7e6ef0b6b5a35f8 byte-identical; 11 tests green
- 2.5 PATCH endpoint: 15 contract tests including atomic rollback green
- 2.6 em-dash hook: 5 verification scenarios pass; project-wide sweep clean
- 2.7 no-hardcoded-thresholds lint: rule scaffolded; no-op until tab modules land
- 2.8 acceptance: 34 of 34 tests green; em-dash and en-dash sweeps clean

Files created or modified during slice 1 (see hand-back report for full inventory): backend/ now contains pyproject.toml, requirements.txt, Dockerfile, .dockerignore, app/{config,db,main}.py, app/api/v1/{health,admin}.py, app/auth/{dependencies,tokens}.py, app/models/{programmes,people,audit_trail_entries,escalation_tier_config,threshold_calibration_register}.py, app/schemas/admin.py, app/services/{audit,tier_config}.py, app/seed/generator.py, app/seed/data/threshold_register.py, alembic.ini, alembic/env.py, alembic/script.py.mako, alembic/versions/{001_rev4_foundation,002_threshold_register}.py, tests/{unit/test_health,integration/test_audit_append_only,integration/test_seed_determinism,integration/test_tier_config_patch}.py, tests/integration/{conftest,_helpers}.py. Plus docker-compose.yml restructured at project root, infra/postgres/init/01_create_roles.sql, scripts/check_em_dash.sh, scripts/check_no_hardcoded_thresholds.sh, .pre-commit-config.yaml updated, .env.example updated, Makefile seed target populated, backend/README.md rewritten.

Recommended next slice: extend the audit-write pattern to a second mutating endpoint (Decision Queue or Notifications) so the cross-cutting invariant proves across multiple resource types and the pattern can be lifted into a shared audited-mutation decorator. Alternative: ship the JWT login endpoint (POST /api/v1/auth/login) plus the read endpoint (GET /api/v1/admin/tier-config) so the PATCH flow has a complete read-write loop and frontend M7 can consume the auth contract.

Owner: Claude Code. Signoff: Adi (pending slice 1 acceptance).

---

## D-036 | 2026-04-25 | M6 backend slice 1 launched under Claude Code; 4 Q&A rounds proxied

Context: After rev 4 cascade closure (D-035), authored `docs/state/CLAUDE_CODE_KICKOFF_PROMPT_2026-04-25.md` and Adi pasted it into a fresh Claude Code session in iTerm2. This Cowork agent proxied 4 Q&A round trips to Claude Code via computer-use screenshots. Documenting the rulings here so future sessions can resume cleanly.

Decisions recorded for slice 1 vertical (escalation_tier_config + audit_trail_entries + programmes + people):

1. psql client: docker compose exec postgres psql for ad-hoc queries. No host install. asyncpg via pytest is the test path.

2. Python interpreter: python3.12 (3.12.13) via backend/.venv. Pinned `requires-python = ">=3.12,<3.13"` in pyproject.toml. Rationale: pydantic-core PyO3 max 3.13, greenlet no arm64 3.14 wheel. Documented in backend/README.md.

3. Git working tree: leave as-is during M6 slice work. Adi commits in iTerm2. Claude Code stages, never commits.

4. Defense-in-depth on audit_trail_entries append-only invariant: REVOKE ALL plus GRANT SELECT, INSERT only plus FORCE ROW LEVEL SECURITY plus INSERT-only policy. Catches the TRUNCATE-bypasses-RLS edge case that the kickoff did not name explicitly. Test must verify akb1_owner (table owner role) cannot UPDATE/DELETE despite ownership, in addition to akb1_app blocked. SUPERUSER bypass is out of scope (operational mitigation; no application path connects as bootstrap superuser).

5. Migration split: 001_rev4_foundation.py contains the 4 kickoff-named entities (programmes, people, audit_trail_entries, escalation_tier_config). 002_threshold_register.py is a separate focused migration adding threshold_calibration_register. Two independently reversible units.

6. dev passwords: keep akb1_owner_password and akb1_app_password as dev defaults in init/01_create_roles.sql. .env in .gitignore (only .env.example committed). Warning header in init script flags credentials as dev-only. Production secrets via Vault per PRD 03 §12.

7. docker-compose.prod.yml: leave M0 placeholder untouched. Caddy plus TLS at M7 or M8.

8. Programme seed list (10): PEGASUS, PHOENIX, ORION, STELLAR, HELIX, ATLAS, DRACO, LYRA, VEGA, ANDROMEDA. State distribution aligns to Data Model rev 4 §5.1.4 evm_snapshots: 2 Failing-equivalent (PEGASUS Red, ANDROMEDA Failing), 3 Slipping (PHOENIX, STELLAR, HELIX Amber), 5 Healthy or Watching (ATLAS Watching plus ORION, DRACO, LYRA, VEGA Green). Mixed-signal narrative D-010 satisfied.

9. programme_code format: full uppercased name (PEGASUS not PEG or PEGASS). Clean, debug-friendly, unambiguous.

10. People seed (300): pyramid B1-B5 at 90/90/60/36/24 (30/30/20/12/8 percent). Role distribution 1 PO, 2 DD, 10 PM (one per programme), 3 FL, 2 HRBP, 282 RO. RO is application-access catch-all (not job title). AP flag true on the seeded PO plus 1 DD plus 1 FL for slice 2.5 contract test paths. First name pool: 20 Hub voice samples (Rajiv, Meera, Priya, Kiran, Anand, Nisha, etc.) cycled deterministically. Last name pool: 20 surnames cycled. Email format `{first}.{last}{seq}@akb1.demo`.

11. threshold_calibration_register.last_calibrated_by FK: set to seeded PortfolioOwner user_id (NOT NULL FK satisfied per §4.31).

12. Operational residual logged for PRD 03 rev 3 (Phase 2 cascade): ALTER TABLE DISABLE ROW LEVEL SECURITY remains a privileged DDL escape that the table owner can issue. Mitigation belongs in operational runbook, not code.

Slice 1 status at session close 2026-04-25: 2.1 scaffold green, 2.2 docker compose green, 2.3 migration green, 2.4 seed in flight (parallel work on 002 migration plus ORM model plus tier config seed plus 60-metric data table plus determinism harness; programmes-and-people seed pending Q4 lock confirmation per ruling 10 above). Containers running.

Session 2026-04-25 closes with M6 slice 1 mid-flight. Next session resumes by reading this log, the kickoff prompt, and BUILD_STATE, then watching for the next Claude Code question via computer-use.

Owner: Claude. Signoff: Adi (pending). Decision proxied to Claude Code with timestamps.

---

## D-035 | 2026-04-25 | Phase 9 closed: rev 4 cascade complete, M6 backend unblocked

Context: Final phase of the 14-turn implementation plan. Phase 9 closes the rev 4 cascade with project-wide quality gate, BUILD_STATE update, hot cache refresh, and memory file refresh.

Decisions recorded:

1. Project-wide em-dash sweep clean. 8 occurrences found across `docs/state/` files; all 8 are legitimate workspace path references (`AKB1 Base — Chief of Staff`) per hard rule 1. Zero non-legitimate em dashes in any product file (PRDs, wireframes, test docs, architecture, master state files).

2. BUILD_STATE.md updated to reflect rev 4 closure. M1 wireframes rev 4 closed (20 wireframes total: 17 tab plus 3 cross-cutting). M2 PRD suite rev 4 closed (28 PRDs total). M3 architecture suite rev 4 closed (Design Foundations rev 4). M4 test strategy rev 2 closed (14 test docs). M5 subagent roster carries forward at rev 1; rev 2 update deferred to backend kickoff. Rev 4 cascade module marked 100 percent complete. Overall project moves from 52 percent to 65 percent.

3. Workspace hot cache refreshed. ACTIVE_CONCEPTS.md updated with rev 4 cascade closure. RECENT_DECISIONS.md gets a 2026-04-25 entry summarising D-027 through D-035.

4. Memory file `project_akb1_dcc_v1.md` updated with current state snapshot: 18 tabs, 28 PRDs, 86 data entities, 60-metric threshold register, 6 roles plus AP flag, 7 locked Hub phrases, Q1-Q6 rulings applied, DECISION_LOG D-001 through D-035.

5. M6 backend build unblocked. Stable rev 4 spec in place. Next session starts with M6 kickoff and Claude Code handoff.

UC absorption final tally: 50 of 50 use cases mapped to a named home surface. 23 in 3 new tab PRDs (Phase 3), 24 in 14 cascaded tab PRDs (Phase 4), 3 in cross-cutting surfaces (Phase 7).

Cascade summary across the 9 phases:

| Phase | D-entry | Files touched | UCs absorbed |
|-------|---------|---------------|--------------|
| 1 Data Model rev 4 | D-027 | 1 PRD plus DECISION_LOG | n/a structural |
| 2 Design Found and Master | D-028 | 3 docs | n/a structural |
| 3 New tab PRDs | D-029 | 3 PRDs plus DECISION_LOG | 23 |
| 4 Existing tab PRD cascades | D-030 | 14 PRDs plus DECISION_LOG | 24 |
| 5 New wireframes | D-031 | 4 files plus DECISION_LOG | 0 (visual) |
| 6 Existing wireframe cascades | D-032 | 14 files plus DECISION_LOG | 0 (visual) |
| 7 Cross-cutting surfaces | D-033 | 10 files plus DECISION_LOG | 3 |
| 8 Test strategy rev 2 | D-034 | 10 test docs plus DECISION_LOG | n/a structural |
| 9 Final gate and closure | D-035 | BUILD_STATE plus hot cache plus memory plus DECISION_LOG | n/a structural |

Total files touched in rev 4 cascade: ~70 files across docs/prd, docs/wireframes, docs/test, docs/architecture, docs/state, plus 3 workspace memory files.

Total D-entries logged in single working day: 9 (D-027 through D-035).

Rationale: Production-grade rev 4 spec is now stable. M6 backend can begin without Hub gap risk.

Quality gate (project-wide):
- Zero em dashes outside legitimate workspace path occurrences
- Zero en dashes
- Zero emojis
- All revision content additive; no rev 3 or rev 1 content deleted (per Adi's no-deletion rule)
- Every new entity has FK enforcement, role access policy, seed distribution
- Every new KPI binds to threshold_calibration_register where eligible
- Every new mutating endpoint writes audit row per Q4 Option A
- Every new tab PRD cites Hub article anchor explicitly

Owner: Claude. Signoff: Adi (pending Phase 9 review).

Next milestone: M6 backend build kickoff. Claude Code handoff. v1.0.0 launch target 2026-06-10 (~6.5 weeks from rev 4 closure).

---

## D-034 | 2026-04-25 | Phase 8 closed: M4 test strategy at rev 2 with 5 new test docs

Context: Phase 8 per the 14-turn implementation plan extends the M4 test strategy from 9 documents at rev 1 to 14 documents at rev 2. Adds test plans for the rev 4 surfaces (Governance, Capability, AI Governance, EVM, Audit Trail) and cascades 5 existing test plans (Contract, Playwright E2E, Voice Regression, Role Gating, Performance) to rev 2.

Decisions recorded:

1. `docs/test/10_Governance_Tests.md` authored at rev 1. 21 unit tests, 8 Playwright scenarios, 4 voice snapshots, 7-role gating. Anchors PRD 23. Tests cadence theatre detection, RACI gap/overlap, decision latency weighted, sponsor engagement composite, threshold register lookup, tier rename propagation per Q1.

2. `docs/test/11_Capability_Tests.md` authored at rev 1. 16 unit tests, 8 Playwright scenarios, 3 voice snapshots. Anchors PRD 24. Tests bench aging, fit_score, DM coverage state, hiring funnel, dm_retention encryption verification per Q5.

3. `docs/test/12_AI_Governance_Tests.md` authored at rev 1. 14 unit tests, 9 Playwright scenarios, 4 voice snapshots, AP flag matrix. Anchors PRD 25. Tests risk tier classification, gate pass rate, delivery speed gap, shadow trend, AP enforcement (5 access scenarios), audit on every PATCH/POST.

4. `docs/test/13_EVM_Tests.md` authored at rev 1. 17 unit tests covering CPI, SPI, TCPI, EAC, ETC, VAC formulas plus state enum derivation. GENERATED STORED column behaviour validated. Cross-surface consistency between v1_02 and v1_06 verified.

5. `docs/test/14_Audit_Trail_Tests.md` authored at rev 1. Append-only invariant validated at app and database layer. Q4 Option A full-snapshot rule enforced on 19 mutating endpoints. AP flag enforcement, export chain-of-custody signature, 10000-row search benchmark.

6. `docs/test/02_Contract_Tests.md` cascaded to rev 2. Endpoint inventory ~92 to ~135. 1,215 role-variant test cases (135 endpoints x 9 role variants). Tier propagation contract test plus audit invariant cross-cutting test added.

7. `docs/test/03_Playwright_E2E.md` cascaded to rev 2. Spec file count 17 to 22 (5 new spec files for rev 4 surfaces, 14 updated specs for rev 4 cascades). Total scenario count ~80. Smoke under 10 min, full under 60 min.

8. `docs/test/04_Voice_Regression.md` cascaded to rev 2. Golden snapshots 45 to 54. Locked Hub phrases 5 to 7 (added "Governance that does not decide is theatre" and "The director sees across..."). 14 new action-line snapshots for rev 4 intelligence layer. Em-dash gate extended to wireframes per D-031 lesson learned.

9. `docs/test/09_Role_Gating.md` cascaded to rev 2. Role count 4 to 6 plus AP flag (3 AP variants). Access matrix grows to 1,215 assertions. Q5 onboarding visibility tests (8 scenarios), Q1 tier rename audit test, AP flag matrix tests (30+ endpoints).

10. `docs/test/05_Performance_Benchmarks.md` cascaded to rev 2. 5 new hot-path endpoints (cadence-calendar, skills-heat-map, risk-tier-matrix, evm-snapshot, audit-search) with p95 targets. 8 per-tab snapshot gates. Audit write throughput, threshold lookup performance, tier rename propagation latency added.

Em-dash gate clean across all 10 test docs. Per-file grep applied immediately after each edit.

Rationale: Phase 8 brings the test strategy to parity with the rev 4 PRD set. Test count grows substantially: ~80 unit tests across 5 new test plans, ~80 Playwright scenarios across 22 spec files, 54 voice snapshots, 1,215 role-gating assertions, ~135 contract test endpoints. Quality bar holds at zero baseline test failures per hard rule 10.

Wiki page updated: pending. Files touched: 5 new test plan documents, 5 cascaded test plan documents.

Cascade dependencies queued: Phase 9 closure: final em-dash gate across whole project, DECISION_LOG D-035 closure entry, BUILD_STATE update to 100 percent on M1 through M5 phases including rev 4 cascades, ACTIVE_CONCEPTS update, hot cache update on the workspace memory files.

Owner: Claude. Signoff: Adi (pending Phase 8 review).

---

## D-033 | 2026-04-25 | Phase 7 closed: cross-cutting surfaces complete, all 50 UCs absorbed

Context: Phase 7 per the 14-turn implementation plan authors the three cross-cutting surfaces and updates four cross-cutting PRDs. With Phase 7 closed, all 50 use cases catalogued in `docs/state/UC_TO_DASHBOARD_MAPPING_2026-04-24.md` have a named home surface across PRDs and wireframes.

Decisions recorded:

1. `docs/prd/26_PRD_Audit_Trail_Console.md` authored at rev 1. Closes UC-K. Full PRD with role access matrix (AP flag enforcement), 7 endpoints, append-only invariant, Option A full-snapshot rule from Q4 ruling. 14 sections.

2. `docs/prd/27_PRD_Onboarding_First_90_Days.md` authored at rev 1. Closes UC-H. Full PRD with 5-role visibility matrix per Q5 ruling and Design Foundations R4.6, 8 endpoints, self-only-writes invariant. 14 sections.

3. `docs/prd/19_PRD_Notifications_Digest.md` cascaded to rev 2. Adds 11 new notification types covering rev 4 entities (governance theatre, escalation contract staleness, sponsor engagement low, bench aging, DM flight risk, AI red pending, AI shadow discovery, AI gate stale, EVM CPI red, audit denial cluster, plus pre-read missing). Daily digest gains 3 new sections (governance pulse, capability watch, AI governance).

4. `docs/prd/20_PRD_Exports_Steerco_Pack.md` cascaded to rev 2. Adds Board Pack export variant (UC-G) with 5-slide director-facing layout, Steerco Pre-Read Kit export (UC-A4) with S04P2 4-column format per decision, and audit-scoped export (UC-K cross-link with chain-of-custody signature).

5. `docs/prd/21_PRD_History_Snapshots.md` cascaded to rev 2. Snapshot coverage extended to 10 new source entities (governance, RACI, decisions by category, bench, DM succession, EVM, revenue leakage, AI use case, AI quality gates). Audit trail uses daily roll-up due to row volume.

6. `docs/prd/22_PRD_Search_Command_Palette.md` cascaded to rev 2. Search index extended to 9 new entity types (stakeholders, AI use cases, governance cadences, escalation contracts, decisions by category, bench, DM succession, QBR records, CR processing). Smart filter syntax introduced (decision category:vendor, tier:Critical, etc.). Recently visited section added.

7. `docs/wireframes/v1_audit_trail_console.html` authored at rev 1. Monospaced row treatment per Design Foundations R4.7. Filter bar, 5 KPI cards, activity stream with expanded diff view showing before/after JSON. AP dot on role badge.

8. `docs/wireframes/v1_board_pack_preview.html` authored at rev 1. 5-slide preview rendering Title, Portfolio Health (Four Instruments), Margin and EVM, Strategic Risks, Decisions Required. Title slide subtitle uses Hub locked phrase verbatim.

9. `docs/wireframes/v1_onboarding_first_90_days.html` authored at rev 1. PO cohort view with 4-joiner table plus single-joiner detail panel showing week-by-week checklist. Cohort blocker pattern callout for cross-link to v1_17 Margin Literacy.

10. `docs/wireframes/v1_00_Index.html` updated with three new cross-cutting surface entries linking to the new wireframes.

UC absorption complete. Final tally:

| Phase | UCs absorbed |
|-------|--------------|
| Phase 3 (3 new tab PRDs) | 23 UCs (governance, capability, AI governance) |
| Phase 4 (14 existing tab cascades) | 24 UCs |
| Phase 7 (cross-cutting surfaces) | 3 UCs (UC-K, UC-G, UC-H) |
| **Total** | **50 of 50** |

Em-dash gate clean across all 9 files touched (5 PRDs, 3 wireframes, 1 index update). Per-file grep applied immediately after each edit per D-031 lesson.

Rationale: Phase 7 closes the structural product surface. Every Hub use case from the Wave 5 inventory is now mapped to a named tab, panel, or cross-cutting surface with a corresponding PRD and wireframe. Backend build (M6, Phase 8 onward in plan numbering) and frontend build (M7) can begin against a stable spec.

Wiki page updated: pending. Files touched: 2 new PRD files, 4 cross-cutting PRD updates, 3 new wireframe files, 1 index update.

Cascade dependencies queued: Phase 8 extends M4 test strategy with 5 new test plan documents (Governance, Capability, AI Governance, EVM, Audit Trail) plus updates to 4 existing test plans (Contract, Playwright, Voice Regression, Role Gating) for rev 4 endpoint inventory. Phase 9 runs final gate, logs closure, and updates state files.

Owner: Claude. Signoff: Adi (pending Phase 7 review).

---

## D-032 | 2026-04-25 | Phase 6 closed: 14 existing wireframes cascaded to rev 4 or rev 2

Context: Phase 6 per the 14-turn implementation plan cascades all existing wireframes to align with the Phase 4 PRD additions. Pattern applied consistently per wireframe: bump revision badge in header and footer, append "Revision 4 amendments" or "Revision 2 amendments" section before the existing footer with new KPI cards and panel previews matching the corresponding PRD rev 4 specs.

Decisions recorded:

1. v1_01 Executive cascaded to R4. Adds Portfolio Drift Delta KPI card and 3-card Four Portfolio Instruments label group.

2. v1_02 Delivery Health cascaded to R4. Adds Over-Optimism strip, EVM Quartet (CPI 0.92, SPI 0.88, TCPI 1.04, EAC), Estimation Negotiation table, Transition Planning table.

3. v1_03 Risk and RAID cascaded to R2. Adds Escalation Timing distribution bars and 5-Why Register table with guided workflow button.

4. v1_04 Workforce Intelligence cascaded to R4. Adds v1_17 Capability cross-link banner, Utilization Reconciliation 3-system table with max gap KPIs.

5. v1_05 Financials cascaded to R4. Adds Revenue Leakage 5-Mechanism horizontal bar chart with $62,400 monthly portfolio total.

6. v1_06 P and L Cockpit cascaded to R4. Adds Hub-aligned 5-leak anatomy bars (Rate Card, Scope Absorbed, Vendor Overrun, Attrition, License Renewal) plus EVM cross-surface 4-card panel.

7. v1_07 Flow and Velocity cascaded to R2. Adds DORA quartet (Deployment Frequency, Lead Time, Change Failure, MTTR) plus DORA band per programme.

8. v1_08 AI Innovation cascaded to R4. Adds v1_18 cross-link banner and Productivity vs Delivery Speed Gap dual-line overlay.

9. v1_09 Commercial Pipeline cascaded to R4. Adds 4 KPI cards plus Account Concentration bubble map and Rate Card Optimisation drift grid.

10. v1_11 Scenario Planner cascaded to R4. Adds two-mode switcher (What-if vs Baseline Forecast) with fan chart and Friday Forecast Call commentary table.

11. v1_12 Ops and SLA cascaded to R4. Adds v1_16 cross-link banner and Decision Queue extended with 4-column S04P2 format plus category filter chips.

12. v1_13 Multi-Vendor cascaded to R4. Adds Contract Lifecycle timeline and Vendor DoD Matrix with gap and overlap markers.

13. v1_14 Change Impact cascaded to R4. Largest cascade: 4 KPI cards plus Closeout Readiness 5-component bars, Scope Creep Interventions matrix, CR Cost vs Value scatter plot, Distributed Decision Tax table.

14. v1_15 Client Health Radar cascaded to R4. Adds Atlas Banking external stakeholder quadrant chart and Opposition Stakeholders panel with Book 1-on-1 action.

Em-dash gate applied after every individual wireframe edit per lesson learned in D-031. Final grep across `docs/wireframes/*.html` confirms zero em dashes, zero en dashes, zero emojis. The grep-after-each-edit approach caught what would have been 0 issues this round (vs 10 em dashes in Phase 5 caught only at end-of-phase).

Rationale: Phase 6 brings the wireframe library into structural parity with the rev 4 PRD set. Each rev 4 amendments block is intentionally compact rather than full-fidelity because the corresponding PRD is the source of truth; the wireframe block surfaces enough to validate visual rendering and confirm new panel patterns.

Wiki page updated: pending. Files touched: 14 existing wireframe HTML files cascaded in place.

Cascade dependencies queued: Phase 7 authors 3 cross-cutting surfaces (Audit Trail Console PRD 26 plus wireframe, First 90 Days Onboarding PRD 27 plus wireframe, Board Pack export wireframe variant) plus 4 cross-cutting PRD updates to rev 2 (Notifications, Exports, History, Search). Phase 8 extends M4 test strategy. Phase 9 closes.

Owner: Claude. Signoff: Adi (pending Phase 6 review).

---

## D-031 | 2026-04-25 | Phase 5 closed: 3 new wireframes authored at revision 1

Context: Phase 5 per the 14-turn implementation plan authors the three new wireframes for the primary tabs added at Master PRD revision 3. Each HTML wireframe uses Tailwind CDN, Option D palette, Inter and JetBrains Mono fonts, and renders the panel library specified in the corresponding PRD.

Decisions recorded:

1. `docs/wireframes/v1_16_Governance_Operating_Model.html` authored at rev 1. Renders all 12 panels: 10 KPI cards (5-by-2 grid), Cadence Calendar grid, RACI Working Matrix (Pegasus sample), Decision Queue extended with 4-column S04P2 format, Escalation Contract tier ladder with `display_label` from `escalation_tier_config`, Steerco Pre-Read Kit with 4-column expansion, Weekly Commitment heatmap, Sponsor Engagement scorecard, Stakeholder Influence quadrant, Over-Optimism Portfolio, Escalation Timing distribution, Threshold Calibration Register snapshot, Tier Config Admin (PO only). AP dot visible on PO role badge per Design R4.1.

2. `docs/wireframes/v1_17_Capability_Supply_Chain.html` authored at rev 1. Renders all 8 panels: 8 KPI cards, Bench Deep Dive with aging strip and roster table, Skills Heat Map grid, Bench-to-Demand Match kanban (Suggested/Reviewed/Confirmed), DM Succession Picture, Hiring Funnel bars, Pyramid Shift overlay, Margin Literacy per DM, DM Retention Cadence (masked notes with reveal control).

3. `docs/wireframes/v1_18_AI_Governance.html` authored at rev 1. Renders all 8 panels: 4 KPI cards plus 4 surfaced counts, AI Risk Tier Matrix with gold left-edge accent on Red pending rows (per Design R4.4), Quality Gates per Tier rollup, Governance Cadence 4-row calendar, Shadow Inventory Trend bar chart, Five Problems AI Cannot Solve radar, Delivery Speed Gap dual-line chart with shaded gap, Pending Red-Tier Backlog table. AP dot visible on PO role badge.

4. Nav shell updated across all three files with role-scoped 5-tab primary nav matching Master PRD rev 3 R3.3. Cross-links to v1_01 Executive, v1_05 Financials, v1_15 Client Health Radar, and between governance tabs verified.

5. `docs/wireframes/v1_00_Index.html` updated with new "Governance Tabs" section listing v1_16, v1_17, v1_18 with R1 badges and UC coverage notes.

6. Quality gate on first authoring flagged seven em dashes in v1_16 (footer, panel titles, stakeholder tooltips), two in v1_17 (footer, panel title), one in v1_18 (footer). All replaced with pipe separators. Post-fix grep confirms zero em dashes across the wireframes directory. Zero en dashes. Zero emojis.

Rationale: Phase 5 gives reviewers browser-openable renderings of the three new primary tabs so the PRD 23, 24, 25 specs can be validated against visual rendering. Seed data shown matches the Wave 5 mixed-signal portfolio narrative (Pegasus stressed, Orion healthy, Phoenix and Stellar mixed).

Wiki page updated: pending. Files touched: 3 new wireframe HTML files plus Index update.

Em-dash incident recorded as lesson learned: wireframe footer lines tempt natural em dash use as visual separators. Mitigation for Phase 6 cascades: grep for em dashes immediately after each wireframe edit, not at the end of the phase. Voice regression test in M4 rev 2 should scan wireframes in addition to PRDs.

Cascade dependencies queued: Phase 6 cascades 12 existing wireframes to rev 4 (turns 10 to 11). Phase 7 authors 3 cross-cutting wireframes (Audit Trail Console, Board Pack preview, First 90 Days Onboarding) alongside PRDs 26 and 27.

Owner: Claude. Signoff: Adi (pending Phase 5 review).

---

## D-030 | 2026-04-25 | Phase 4 closed: 14 existing tab PRDs cascaded to rev 4 or rev 2

Context: Phase 4 per the 14-turn implementation plan cascades all existing tab PRDs to the revision levels specified in IMPLEMENTATION_PLAN section 2.2. Each cascade adds rev 4 amendments in place, preserving rev 3 or rev 1 content verbatim, and cites Data Model rev 4, Design Foundations rev 4, and Master PRD rev 3 as authoritative sources.

Decisions recorded:

1. v1_01 Executive cascaded to rev 4. Adds UC-C Four Portfolio Instruments label layer, UC-AA Portfolio Drift KPI and cross-link to v1_16, role-aware subtitle per R4.10, threshold register binding across all rev 3 KPIs.

2. v1_02 Delivery Health cascaded to rev 4. Adds UC-P EVM Quartet (CPI, SPI, TCPI, EAC), UC-GG Estimation Negotiation Record section, UC-V Transition Planning Readiness section, UC-S Over-Optimism Flag signal strip.

3. v1_03 Risk and RAID cascaded to rev 2. Adds UC-KK Escalation Timing Signal distribution and UC-M 5-Why Register with guided capture workflow.

4. v1_04 Workforce Intelligence cascaded to rev 4. Adds UC-CC Utilization Reconciliation (three-system gap per S08P4) and establishes cross-link to v1_17 Capability for strategic-capability depth.

5. v1_05 Financials cascaded to rev 4. Adds UC-DD Revenue Leakage 5-Mechanism Audit (five mechanisms per S08P7) with recoverability flag.

6. v1_06 P and L Cockpit cascaded to rev 4. Adds UC-NN Five-Leak Anatomy relabel (rev 3 5 drivers re-named to Hub S04P4 mechanisms plus License Renewal added as 6th driver) and UC-P EVM cross-surface.

7. v1_07 Flow and Velocity cascaded to rev 2. Adds UC-L DORA Metrics panel (deployment frequency, lead time for changes, change failure rate, MTTR) with DORA Accelerate band chip per programme.

8. v1_08 AI Innovation cascaded to rev 4. Adds Delivery Speed Gap overlay chart (UC-MM), banner cross-link to v1_18 AI Governance, scope-boundary clarification table separating adoption-tracking from policy-enforcement.

9. v1_09 Commercial Pipeline cascaded to rev 4. Adds four new sections: UC-D Account Concentration Map (bubble chart), UC-U Rate Card Optimisation grid, UC-FF Growth Expansion Tracker, UC-HH QBR Quality Score with theatre_flag filter.

10. v1_11 Scenario Planner cascaded to rev 4. Adds UC-F Baseline Forecast mode (fan chart with p95 range) alongside existing PERT what-if mode, and UC-F2 Friday Forecast Call Commentary table. Two-mode switcher introduced.

11. v1_12 Ops and SLA cascaded to rev 4. Adds UC-Y extended Decision Queue columns (Options, Recommendation, Impact of Deferral sourced from steerco_pre_read join), UC-Z decision category filter and sub-tabs, cross-link banner to v1_16.

12. v1_13 Multi-Vendor cascaded to rev 4. Adds UC-I Contract Lifecycle timeline (MSA, SOW, amendments, rate card, SLA) and UC-N Vendor Definition-of-Done Matrix with gap and overlap detection.

13. v1_14 Change Impact cascaded to rev 4. Largest Phase 4 cascade with six use cases: UC-W Urgent Request Bypass tracker (3x multiplier per S06P8), UC-EE CR Processing Cost vs Value scatter with diagonal threshold, UC-Q Closeout Readiness 5-component panel, UC-X Scope Definition Quality at Kickoff signal strip, UC-II Scope Creep Interventions checklist (3 named interventions), UC-JJ Distributed Decision Tax table.

14. v1_15 Client Health Radar cascaded to rev 4. Adds UC-R Client-scoped Stakeholder Influence panel with quadrant chart filtered to external stakeholders. Full cross-programme map remains on v1_16.

15. v1_10 Backlog Health remains at rev 1 unchanged per IMPLEMENTATION_PLAN section 2.2 (no UC targets this tab).

Cross-cutting rules applied consistently to all cascades:
- Every new KPI sources green, amber, red from `threshold_calibration_register` where a metric_id binding exists.
- Every mutating PATCH or POST endpoint writes to `audit_trail_entries` with full before_json and after_json per Q4 Option A.
- Every tab PRD explicitly names the Hub article(s) anchoring the new capability.
- Role-aware subtitle rendering applied where Design Foundations R4.10 specifies.
- Cross-links to v1_16, v1_17, v1_18 established from relevant source tabs (Executive, Workforce, AI Innovation, Ops and SLA, Change Impact, Client Health).

Rationale: Phase 4 formalises the integration of the 50-UC inventory across the existing tab library. With Phase 3 already absorbing 23 UCs into the three new tabs, Phase 4 cascades absorb the remaining 27 UCs into the 14 existing tabs. Combined with Phase 7 (cross-cutting surfaces for Audit Trail Console, Board Pack, Onboarding), all 50 UCs have a named home surface.

Quality gate: zero em dashes, zero en dashes, zero emojis across all 14 cascaded files. Voice consistency verified. Threshold register citations present on all new KPIs with bindings. Rev 3 (or rev 1) content preserved in every file.

Wiki page updated: pending. Files touched: 14 existing tab PRDs cascaded in place.

Cascade dependencies queued: Phase 5 authors 3 new wireframes (v1_16, v1_17, v1_18). Phase 6 cascades 12 existing wireframes to rev 4. Phase 7 authors Audit Trail Console PRD 26, First 90 Days Onboarding PRD 27, plus updates to 4 cross-cutting PRDs at rev 2. Phase 8 extends M4 test strategy with 5 new test plan docs. Phase 9 runs final gate, logs closure, and updates state files.

Owner: Claude. Signoff: Adi (pending Phase 4 review).

---

## D-029 | 2026-04-25 | Phase 3 closed: three new tab PRDs authored at revision 1

Context: Phase 3 per the 14-turn implementation plan authors the three new primary tab PRDs reserved in Master PRD revision 3 section R3.2. Each PRD cites Data Model rev 4, Design Foundations rev 4, and Master PRD rev 3 as authoritative sources. Each is full-form covering 14 sections (scope, role access, data contract, user stories, KPIs with worked detail, views, drills, intelligence rules, NFR, endpoints, error and empty states, accessibility, test acceptance, release gating).

Decisions recorded:

1. `docs/prd/23_PRD_Tab_16_Governance_Operating_Model.md` authored at rev 1. 12 panels, 10 KPIs, 15 endpoints, 8 Playwright scenarios. Absorbs UC-A, A1, A2, A3, A4, A5, A6, Y, Z, R, S, KK, OO, PP. Subtitle "Governance that does not decide is theatre." rendered across all roles.

2. `docs/prd/24_PRD_Tab_17_Capability_Supply_Chain.md` authored at rev 1. 8 panels, 8 KPIs, 14 endpoints, 8 Playwright scenarios. Absorbs UC-B, E, E2, J, BB expanded, T. DM Retention Conversation note encryption via pgcrypto; reveal is audited.

3. `docs/prd/25_PRD_Tab_18_AI_Governance.md` authored at rev 1. 8 panels, 4 KPIs plus surfaced counts, 17 endpoints, 9 Playwright scenarios. Absorbs UC-O, LL, MM. AP flag required for per-use-case detail; aggregate KPIs visible without AP.

4. All three tabs enforce audit trail full-snapshot rule (Q4 Option A) on every PATCH and POST endpoint.

5. Role-aware rendering locked into all three tab PRDs per Design Foundations rev 4 R4.10 subtitle differentiation and R4.1 role badge visuals.

6. Threshold calibration register references locked: every KPI sources its green, amber, red from `threshold_calibration_register` per R4.2 design rule. No hardcoded thresholds in any of the three PRDs.

Rationale: Phase 3 formalises the three UC clusters (governance primitives, strategic capability, AI governance) that Wave 5 observations 1, 3, and 4 identified as structural omissions. Each PRD is now the source of truth for Phase 5 wireframes and Phase 6 frontend implementation.

Quality gate: zero em dashes, zero en dashes, zero emojis across all three new PRDs. Voice consistency verified against Hub framing. Role access matrix aligned with Data Model PRD rev 4 section 3.1.10.

Wiki page updated: pending. Files touched: 3 new PRD files authored at rev 1.

Cascade dependencies queued: Phase 4 cascades 13 existing tab PRDs to rev 4 citing the three new tabs for cross-link patterns. Phase 5 authors 3 new wireframes for v1_16, v1_17, v1_18. Phase 6 cascades 12 existing wireframes to rev 4. Phase 7 authors 3 cross-cutting surfaces (Audit Trail Console, Board Pack preview, Onboarding First 90 Days). Phase 8 extends M4 test strategy with 5 new test plan docs plus updates to 4 existing. Phase 9 runs final gate and logs closure.

Owner: Claude. Signoff: Adi (pending Phase 3 review).

---

## D-028 | 2026-04-25 | Phase 2 turn 3 closed: Design Foundations rev 4, Master PRD rev 3, Data Model rev 4 threshold seed

Context: Phase 2 turn 3 per the 14-turn implementation plan closes Design Foundations rev 4 and Master PRD rev 3. Tab inventory officially grows from 15 to 18 with Governance Operating Model, Capability and Supply Chain, and AI Governance added as new primary tabs. Cross-cutting surface inventory grows from 4 to 7 with Audit Trail Explorer Console, First 90 Days Onboarding, and Board Pack export variant. Role taxonomy officially expanded with Delivery Director, HR Business Partner, and Audit Permission flag. 60-metric threshold calibration register seeded in Data Model PRD rev 4 section 5.2 as pre-Phase 2 deliverable per Q2 ruling.

Decisions recorded:

1. Tab count locked at 18. Three new primary tabs named in Master PRD rev 3 section R3.2 with PRD file identifiers 23, 24, 25 reserved.

2. Cross-cutting surfaces locked at 7. Audit Trail Explorer Console (PRD file 26) and First 90 Days Onboarding (PRD file 27) added as new PRDs. Board Pack export variant folded into existing `20_PRD_Exports_Steerco_Pack.md` rev 2.

3. Role taxonomy locked at 6 named roles plus 1 permission flag. DD and HRBP introduced. AP flag additive on PO, DD, or FL. No role renumbered, no role removed.

4. Per-role primary navigation rebuilt in Master PRD rev 3 section R3.3. Six role rows now (was 4 at rev 2) with distinct 5-tab primary nav each.

5. Two new Hub phrases locked into product copy per Design Foundations rev 4 section R4.3. Total locked phrase count grows from 5 to 7.

6. 60-metric threshold calibration register seeded. Clusters: Executive and Portfolio 8, Governance 10, Delivery Health 10, Financials and PnL 8, Commercial 6, People and Capability 8, Risk and SLA and Client Health 6, AI and Innovation 4. Every metric has direction, green, amber, red, rationale, and owning role.

7. Design Foundations rev 4 section R4.1 introduces AP dot visual (4px gold dot on role badge). No new colour tokens.

8. Design Foundations rev 4 section R4.8 adds confidentiality classifications for `dm_retention_conversation` (Restricted, encrypted), `audit_trail_entries` (Confidential), `ai_shadow_survey` (Confidential), `onboarding_checklist` (Restricted per-row), `sponsor_engagement` (Internal).

9. Milestone dates shift slightly to accommodate Phase 3 through Phase 9 while preserving the 2026-06-10 launch. M1 wireframes target now 2026-05-02, M2 PRDs target now 2026-05-04, others as per R3.7.

10. PRD count at rev 3 grows from 23 to 28.

Rationale: Phase 2 closure formalises all design decisions that the three new tab PRDs (Phase 3) and the 15 existing tab PRD cascades (Phase 4) will cite as authoritative. Master PRD rev 3 is the tab inventory source of truth. Design Foundations rev 4 is the voice and visual source of truth. Data Model PRD rev 4 is the data source of truth including threshold register seed.

Wiki page updated: pending. Files touched: `docs/architecture/00_Design_Foundations.md` (rev 4), `docs/prd/00_PRD_Master.md` (rev 3), `docs/prd/01_PRD_Data_Model.md` (rev 4 section 5.2 threshold register seed added, Q4 assumption closed).

Cascade dependencies queued: `02_PRD_Intelligence_Layer.md` rev 3 (consumes threshold_calibration_register and action_playbook), `03_PRD_Security_Auth.md` rev 3 (encodes AP flag and DD/HRBP roles), 3 new tab PRDs in Phase 3, 13 existing tab PRD rev 4 cascades in Phase 4, 3 new cross-cutting PRDs in Phase 7.

Owner: Claude. Signoff: Adi (pending Phase 2 close review).

---

## D-027 | 2026-04-25 | Option A Full execution approved; Phase 1 closed with 6 Q resolutions

Context: Adi approved Option 1 Full execution of the 50-UC implementation plan in 14 turns with nothing deferred. Phase 1 (Data Model PRD rev 4) executed in one turn and closed with six open assumptions surfaced. Adi resolved five of the six in the follow-up turn; one (audit trail storage pattern) held open pending option choice.

Decisions recorded:

Option: Option 1 Full execution, 14 turns, nothing deferred.

Phase 1 deliverable: `docs/prd/01_PRD_Data_Model.md` raised to revision 4. Contents preserve revision 3 verbatim and add 50 new entities plus 1 decisions field extension plus 1 additional entity surfaced post-review (escalation_tier_config, entity 4.73). Total new entities at rev 4: 51. Total entities at rev 4: approximately 86. Approximate new seeded rows: 22,100. Approximate total at rev 4: 30,100. SEED constant unchanged at 20260424.

Q1 resolution: Retain the 5-tier default (DM, Programme Director, Portfolio Owner, Sponsor, Steerco) but add `escalation_tier_config` table (4.73) so tenants can rename tiers via Admin Console. Tier range widened to 1 through 9. `escalation_contract.authority_tier` becomes FK to `escalation_tier_config.tier_number`.

Q2 resolution: 60-metric `threshold_calibration_register` list to be surfaced before Phase 2 start (earlier than originally planned) and formally locked inside Design Foundations rev 4 during Phase 2 turn 3.

Q3 resolution: Security Auditor is not a separate user identity. Replaced by Audit Permission flag on Portfolio Owner, Delivery Director, or Finance Lead accounts. Grant path is both SSO group membership and local admin provisioning for on-prem installs. Auth binding lives in `03_PRD_Security_Auth.md` rev 3 (Phase 2).

Q4 resolution: Option A (full `before_json` and `after_json` per event) locked. Forensic completeness and reconstruction-free queries are the deciding criteria given the stated data accuracy priority. Storage growth factor 1.0x baseline accepted. Re-open path to Option B (diff plus nightly snapshot compaction) reserved as a D-decision if production event volume materially exceeds rev 4 10,000-event demo seed.

Q5 resolution: `onboarding_checklist` visibility expanded to Portfolio Owner, Delivery Director, HR Business Partner, and Programme Manager scoped to rows where the owning user is allocated to the PM's programme. Self retains RW on own row. Two new roles (Delivery Director, HR Business Partner) introduced in the rev 4 role taxonomy. Full cross-entity access policy for DD and HRBP deferred to `03_PRD_Security_Auth.md` rev 3 in Phase 2.

Q6 resolution: `GENERATED ALWAYS AS ... STORED` retained on all 5 tables (evm_snapshots, cr_processing_cost, utilization_reconciliation, portfolio_drift_signals, five_leak_anatomy_snapshot). Data accuracy is top priority per Adi; read performance second. Virtual computed columns rejected.

Rationale: Option 1 Full execution matches the previous rework cycle cadence. Q1 ruling preserves factory default while eliminating a future lock-in risk. Q3 ruling avoids spinning up a separate user identity and audit workflow; flag-based grant is lower-friction and covers both SSO and on-prem scenarios. Q5 ruling aligns onboarding visibility to the roles that actually mentor new joiners (PO, DD, HRBP, own-programme PM) rather than leaving self-only and forcing workarounds. Q6 ruling removes drift risk between database and API computation of derived metrics; the data accuracy posture is the differentiator for this product.

Wiki page updated: pending. Pages affected: `01_PRD_Data_Model.md` (revised to rev 4 in-place), `DECISION_LOG.md` (this entry). Cascade dependencies queued: `03_PRD_Security_Auth.md` rev 3 (Phase 2) must encode AP flag auth, DD and HRBP role access policy. `00_Design_Foundations.md` rev 4 (Phase 2) must encode 60-metric threshold register sign-off. Tab PRDs touching governance, capability, AI governance, and onboarding surfaces must reference the new entities and roles.

Owner: Claude. Signoff: Adi (Option 1 approved; Q1, Q3, Q5, Q6 resolved; Q4 held; Q2 list to be surfaced pre-Phase 2).

---

## D-026 | 2026-04-24 | Implementation Plan for 50 UCs drafted, approval pending

Context: Waves 3 through 5 identified 50 use cases across 10 Hub series that the dashboard must satisfy for v1.0.0 launch credibility. Wave 6 produced a full implementation plan with entity-by-entity data model expansion, PRD scope, wireframe scope, test scope, and phased execution options.

Decision: Plan authored at `docs/state/IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md`. Approval paused at end of session 2026-04-24 to resume next session.

Plan summary:
- 3 new primary tabs: v1_16 Governance Operating Model, v1_17 Capability and Supply Chain, v1_18 AI Governance
- 12 existing tabs revise to rev 4
- 3 cross-cutting surfaces: Audit Trail Explorer console, Board Pack export variant, First 90 Days Onboarding flow
- 50 new data entities (Data Model PRD rev 3 to rev 4), approximately 85 entities total
- Approximately 22,000 new seeded rows (total approximately 30,000)
- 26 PRD files touched
- 17 wireframe HTML files touched
- Voice golden snapshots from 45 to 54
- Endpoint inventory from 92 to 135

Three execution options:
- Option 1 Full (14 turns, nothing deferred) - recommended
- Option 2 Compressed (8 turns, brief-form PRDs)
- Option 3 Staged by severity (6 + 5 + 3 turns)

Next step: Adi selects option at start of next session.

Owner: Claude. Signoff pending: Adi (next session).

---

## D-025 | 2026-04-24 | Wave 5: complete Hub scan and UC-to-Dashboard mapping

Context: Adi requested a thorough mapping. Full scan of every drafted article, post, and carousel across 10 Hub series (49 drafted pieces plus 12 Portfolio Desk placeholders). Extracted every use case the Hub commits to.

Decision: Produced `docs/state/UC_TO_DASHBOARD_MAPPING_2026-04-24.md`. 50 distinct use cases identified. Coverage: 0 fully covered, 22 partially covered, 28 not covered. Severity-1 count: 8. Severity-2: 22. Severity-3: 20.

Seven cross-pattern observations recorded:
1. Governance is the product's spine (8 of 10 Hub series converge there)
2. EVM (CPI, SPI) is the biggest structural omission
3. AI Governance is distinct from AI Adoption
4. Director altitude is undersupplied
5. Closeout discipline is entirely missing
6. Intelligence layer is generic, not threshold-specific
7. 8 severity-1 gaps cluster in three themes

Owner: Claude. Signoff: Adi (implicit approval via "prepare plan").

---

## D-024 | 2026-04-24 | Wave 4: extended gap scan, severity-1 count raised from 4 to 8

Context: Additional deeper scan of Delivery Truths 10 short posts, Delivery PnL Option B 10 posts, Governance in AI 4-part series, Portfolio Desk Manifesto.

Decision: Ten new use cases surfaced (UC-O through UC-X). Two of them (UC-O AI Governance Layer, UC-P EVM CPI SPI) identified as additional severity-1 gaps. Total severity-1 raised to 6 at that point (then to 8 in wave 5 with UC-A sub-cases).

Added to `docs/state/USE_CASE_GAP_ANALYSIS_2026-04-24.md` section 10 onward.

Owner: Claude. Signoff: Adi (implicit via "do one more scan").

---

## D-023 | 2026-04-24 | Wave 3: Hub-to-Product use case gap analysis

Context: Previous waves (D-019 and D-021) closed metric gaps (decision latency, bench tax, scope debt, value realisation, PERT, QBR, etc). Adi asked for a different class of analysis: use-case gaps (what the user is actually trying to do).

Decision: Initial inventory of 14 use cases identified (UC-A through UC-N) via Portfolio Desk and When Delivery Breaks series cross-reference. Severity-1 count 4 at this point. Created `docs/state/USE_CASE_GAP_ANALYSIS_2026-04-24.md`.

Recommended Option B Balanced: 2 new tabs, 6 section expansions, 2 cross-cutting surfaces. Adi directed further scan before committing.

Owner: Claude. Signoff: Adi (implicit via "do one more search").

---

## D-022 | 2026-04-24 | Full Strategic scope closed: wireframes, M4, M5, residual gaps

Context: Per directive "Go with full remaining scope in this session. Wireframes plus M4 plus M5 plus residual gaps, all of them", everything staged after D-021 was executed in one session.

Decision: Closed as follows:

1. Wireframe revision 3 cascade on all 12 Hub-aligned tabs. Severity-1 (Executive, Workforce, Ops SLA, Change Impact, Client Health Radar) and severity-2 (Delivery Health, Financials, P and L Cockpit, AI Innovation, Commercial Pipeline, Scenario Planner, Multi-Vendor) now carry their rev 3 sections, KPI cards, and R3 revision stamp in the header badge and footer.

2. M4 Test Strategy wrote 9 documents in `docs/test/`: Test Strategy Master, Contract Tests, Playwright E2E, Voice Regression, Performance Benchmarks, Accessibility, Intelligence Layer Rules, Seed Determinism, Role Gating. Each doc encodes the rev 3 additions as explicit test cases.

3. M5 Subagent Roster wrote 9 specs in `.claude/agents/`: data-modeller, backend-fastapi, frontend-next, intel-rules, voice-qa, exports-engineer, test-runner, perf-benchmarker, security-auditor. Each spec names its authoritative source doc, hard rules, responsibilities, what it does not do, and quality gate.

4. Residual as-of picker gaps closed on v1_02 Delivery Health and v1_11 Scenario Planner. All 12 Hub-aligned wireframes now have the as-of filter.

Quality gate: 65 files scanned across PRD, test, wireframe, subagent, and state folders. Zero em dashes (except the one legitimate workspace path reference), zero en dashes, zero emojis. 13 PRDs at revision 3, 12 wireframes at R3, 9 M4 docs, 9 M5 specs.

Milestones closed: M1 (wireframes), M2 (PRDs), M3 (architecture), M4 (test strategy), M5 (subagent roster). Next milestone: M6 backend build, ready for Claude Code handoff.

Rationale: Full closure in one session removes the credibility risk of shipping v1.0.0 with any Hub gap unclosed. The test strategy and subagent roster are the handoff contract for Claude Code; without them the build would start without a rails.

Owner: Claude. Signoff: Adi (pending review).

---

## D-021 | 2026-04-24 | Hub gap closure wave 2: seven severity-2 metrics added

Context: Per directive "Go with option A. Fix all of them. Rewrite whatever is necessary. Do not leave anything behind", seven severity-2 Hub gaps remained after wave 1 (D-019). Wave 2 closes them without deferring to post-v1.

Decision: Revise seven additional tab PRDs to revision 3 with the following additions:

1. AI and Innovation tab: AI-Originated Defect Rate KPI plus AI-Assist Task Percent per programme. New `ai_defect_attribution` table. Separates AI hype from AI truth at the workstream granularity. Hub Proposition C Article 2.

2. Financials tab: Bench Tax Allocation line per programme. Makes hidden indirect cost visible with named people and roll-off source. New column on `financials_monthly`: `bench_tax_allocated_usd`. Hub Proposition B Article 3.

3. P and L Cockpit tab: Bench Tax as fifth waterfall driver alongside CR absorbed, scope debt, vendor overrun, estimation drift. Net margin formula revised to itemise bench tax. Hub Proposition B Article 3.

4. Delivery Health tab: Estimation Accuracy KPI plus Silent Baseline Variance detection. Flags deliverables with more than 20 percent actual-vs-baseline variance where no CR was raised. New `estimation_baselines` table usage. Hub Proposition C Article 1.

5. Scenario Planner tab: PERT estimation math on all 11 scenario inputs. Expected value, standard deviation, 95 percent confidence band. Surfaces volatility as explicit decision input. Hub Proposition C Article 1.

6. Multi-Vendor Scorecard tab: Vendor Rationalisation Queue with 90-day cadence (Observe at day 0, FormalNotice at day 30, Exit at day 60, off-boarded at day 90). New fields on `vendor_engagements`: `rationalisation_stage`, `rationalisation_entered_at`, `rationalisation_owner`, `rationalisation_gate_date`. Hub Proposition D Article 2.

7. Commercial Pipeline tab: QBR Tracker for Delivery-Led Growth. QBR cadence per programme, outcome attestation, client sponsor signoff, renewal probability adjusted by QBR health multiplier. New `qbr_records` entity. Hub Proposition E Article 1.

Rationale: Hub thesis integrity is the product's differentiator. Leaving any Hub severity gap unclosed means a LinkedIn reader downloading the dashboard finds the gap within a week. Gap-free at v1.0.0 is the credibility bar. All seven PRDs pass the em dash, en dash, and emoji quality gate; file sizes in the 6.7 KB to 8.2 KB range indicating comparable depth to wave 1.

Consequence: Twelve of the fifteen tab PRDs now at revision 3 (Executive, Delivery Health, Workforce, Financials, P and L Cockpit, AI Innovation, Commercial, Scenario Planner, Ops SLA, Multi-Vendor, Change Impact, Client Health). Three tab PRDs remain at revision 1 (Risk and RAID, Flow and Velocity, Backlog Health) where no Hub gap was identified. Wireframe revision 3 cascade pending across the 12 affected tabs.

Owner: Claude. Signoff: Adi (pending). Wiki update pending per CLAUDE.md hot cache routine.

---

## D-020 | 2026-04-24 | Hub voice alignment: five locked phrases in product copy

Context: Hub gap analysis confirmed the product had Hub-aligned metrics but not Hub-aligned voice. Product language risked feeling like generic PPM when the LinkedIn audience expected continuity of the Hub voice.

Decision: Lock five Hub phrases into Design Foundations revision 3 and enforce them in specific surfaces:
- "Governance is a revenue lever, not overhead" in README and About page
- "Green on metrics, red on reality" in Executive amber-state intelligence layer
- "Amber equals steering. Red means we failed to decide in amber." in intelligence layer tooltip
- "Ten seconds. What is your current margin and what is driving the variance?" in Finance Lead onboarding
- "Delivery excellence is the retention argument" as Client Health Radar subtitle

Consequence: Design Foundations revision 3 includes voice enforcement section. Hub voice regression test added to M4 test strategy scope.

Owner: Claude. Signoff: Adi.

---

## D-019 | 2026-04-24 | Hub gap closure: four severity-1 metrics added

Context: Ruthless gap analysis (`AKB1_LinkedIn_Hub/GAP_ANALYSIS_DCC_vs_Hub_2026-04-24.md`) identified four severity-1 gaps between the product and the published Hub thesis.

Decision: Close all four in revision 3 of affected PRDs and Data Model. Specifically:

1. Decision Velocity KPI on Executive tab plus Decision Queue primary surface on Ops and SLA tab. New decisions table columns (opened_at, closed_at, sla_target_days, status, decision_latency_days). New decision_queue_config table. KPI formula: average decision_latency_days for decisions closed last 30 days.

2. Bus Factor plus Overtime Hours plus Team Health Index on Workforce Intelligence tab. New team_sustainability_signals table. New fields on people (overtime_hours_mtd, last_1on1_sentiment_score).

3. Scope Debt on Change Impact tab, distinct from scope creep. New scope_debt table with origin enum (UndeliveredPromise, Workaround, ReworkTax). Scope Debt Register as new section on the tab.

4. Value Realisation KPI on Executive tab plus Value Realisation as fifth composite signal on Client Health Radar. New value_realisation table. Composite formula revised to include value_realisation_adjustment (-10 to +10).

Rationale: Without these four dimensions the product covers the structural Hub architecture but misses the distinctive Hub thesis. LinkedIn launch post cannot reuse Hub content directly unless these land.

Wiki page updated: pending. Data Model PRD revision 3, Design Foundations revision 3, Executive PRD revision 3, Workforce PRD revision 3, Change Impact PRD revision 3, Client Health PRD revision 3, Ops and SLA PRD revision 3, README revision 1. Seven PRDs plus one architecture doc plus README cascaded.

---

## D-020 | 2026-04-24 | Hub voice alignment

Context: Gap analysis flagged narrative alignment as severity-3 but meaningful. Three Hub phrases should appear in the product surface to make the product voice feel like Adi wrote it.

Decision: Lock five Hub phrases in the product copy. Documented in Design Foundations revision 3 section 12.1. README opening lines updated with "Governance is a revenue lever, not overhead. Delivery excellence is the retention argument. On-time on-budget is necessary but not sufficient." Intelligence layer voice samples revised to include "we saw this in amber and we are steering" framing.

Rationale: The product will be adopted if delivery leaders recognise the voice they already read on LinkedIn. Generic SaaS copy blunts that.

Wiki page updated: pending.

---

## D-018 | 2026-04-24 | Palette: Option D Executive Mid (locked)

Context: Ruthless self-check flagged current v5.8 palette (#0B1220 very dark navy) as too oppressive for sustained executive use. Five alternatives presented (B Softer Slate, C Warm Paper Dark, D Executive Mid, E Executive Light, F Cream Paper Light).

Decision: Option D Executive Mid. Base #242D3D with blue under-note. Surface #2E3849, elevated #3A4454, text #F1F5F9, muted #A0AEC0. Gold accent and traffic lights preserved. All 16 wireframes, Design Foundations, and any palette references in PRDs cascade to Option D in the next revision turn.

Rationale: Mid-dark palette reduces eye fatigue versus the near-black v5.8 while retaining premium analytics-tool aesthetic. Sits between Linear-dark and Notion-dark. Appropriate for 30 to 60 minute executive sessions.

Wiki page updated: pending. Design Foundations section 1 replaces previous palette hex values. Wireframe cascade in the batch after PRD revisions.

---

## D-017 | 2026-04-24 | LLM injection policy: aggressive sanitisation plus rules-only fallback by default

Context: Ruthless self-check identified LLM prompt injection vulnerability. Filter state including programme names flows into LLM prompts without sanitisation.

Decision: All user-controlled strings are aggressively sanitised before prompt composition. Special characters and known jailbreak patterns stripped. System-prompt boundary markers enforced. Default mode is rules-only output; LLM polish is an opt-in per deployment.

Rationale: Security over elegance. Rules-only output already satisfies the intelligence layer contract. LLM polish is additive. Defaulting to rules-only removes the injection attack surface from the default install.

Wiki page updated: pending.

---

## D-016 | 2026-04-24 | Compliance scope for v1.0.0: SOC2-lite documented, not certified

Context: Ruthless self-check identified compliance gap. No mention of SOC2, ISO 27001, HIPAA, or GDPR posture.

Decision: For v1.0.0, document a SOC2-lite posture in SECURITY.md and PRIVACY.md covering access controls, audit logs, encryption at rest and in transit, and incident response runbook. No formal certification attempted; that is deferred to post-v1.1.

Rationale: Certification is expensive and premature for a v1.0.0 open source release. Document posture demonstrates seriousness without committing to the 6 to 9 month certification path. GDPR-lite also documented (data locality, right to delete, data processor vs controller distinction).

Wiki page updated: pending.

---

## D-015 | 2026-04-24 | Primary navigation reduced from 15 tabs to 5 per role

Context: Ruthless self-check severity-1 issue. Fifteen tabs exceed cognitive load thresholds for Monday-morning executive scan. Gartner research cites 5 to 7 primary nav items as the upper bound.

Decision: Primary navigation becomes role-scoped with up to 5 tabs visible per role. All 15 substantive tabs remain accessible via drill handles and a secondary More menu. Defaults per role:

| Role | Primary nav (5 tabs) |
|------|----------------------|
| Portfolio Owner | Executive, Risk and RAID, Financials, Workforce, Client Health Radar |
| Programme Manager | Delivery Health, Risk and RAID, Backlog Health, Flow and Velocity, Ops and SLA |
| Finance Lead | Financials, P and L Cockpit, Commercial Pipeline, Change Impact, Scenario Planner |
| Read Only | Executive, Delivery Health, Financials, Risk and RAID, Ops and SLA |

Rationale: Reduces decision fatigue. Personalises first-view. Preserves universal accessibility via secondary nav.

Wiki page updated: pending. Design Foundations and 16 wireframes require cascading update.

---

## D-014 | 2026-04-24 | Exports included in v1.0.0

Context: Ruthless self-check severity-1 End User issue. Lack of PowerPoint and Excel exports blocks adoption as primary governance artefact.

Decision: Include PowerPoint and Excel exports in v1.0.0. PowerPoint export pulls Executive tab into a 5-slide template. Excel export ships any table, any chart data. Adds approximately 3 days to Milestone M7 frontend build.

Rationale: Without exports, users keep using Excel alongside the tool. Primary-use adoption blocked. The 3-day schedule impact is small against the adoption risk.

Wiki page updated: pending. New PRD `20_PRD_Exports_Steerco_Pack.md` to be authored.

---

## D-013 | 2026-04-24 | RAID taxonomy aligned to industry standard

Context: Ruthless self-check severity-1 Delivery Director issue. Original data model used Risk, Action, Issue, Decision. Industry-standard taxonomy is Risk, Assumption, Issue, Dependency.

Decision: RAID type enum becomes Risk, Assumption, Issue, Dependency. Actions and decisions live in separate entities: `actions` table and `decisions` table.

Rationale: Aligns with PMI, IIBA, and delivery leadership convention. Prevents operator confusion. Separates concerns cleanly.

Wiki page updated: pending. Data Model PRD requires revision. Risk and RAID tab PRD requires note that Action and Decision types are migrated out.

---

## D-011 | 2026-04-24 | Design Foundations document signed off

Context: Design Foundations document authored at `docs/architecture/00_Design_Foundations.md` with 17 sections covering colour palette, typography, spacing, grid, components, 10 programme seed, 300-person pyramid, 25 vendors, 12-month financial shape, RAID and SLA distributions, intelligence layer voice samples (3 full examples), action verb taxonomy, cross-tab link graph, confidentiality declarations, operational readiness checklist, and wireframe review protocol.

Decision: Adi approved all recommendations from top to bottom. Design Foundations is the single source of truth for every design decision in v1. Every wireframe, PRD, and React component inherits from this document.

Rationale: Adi chose Path A (approve all). Accelerates the path to first wireframe. Prevents per-wireframe design negotiation. The 42 prerequisite items are now resolved.

Wiki page updated: pending.

---

## D-012 | 2026-04-24 | Proceed to wireframe build, git init delegated to Adi

Context: Operational readiness checklist items 3 and 4 (git init and pre-commit install) require execution on the user's Mac. Sandbox git operations would carry sandbox commit author identity rather than Adi's personal git identity.

Decision: Claude builds the first two wireframes (v1_00 Index and v1_01 Executive) in this turn without waiting for git. Adi runs the git init and pre-commit install commands in iTerm2 at his convenience. Wireframes will be committed under Adi's git identity when he runs the first commit.

Rationale: Decouples wireframe production from local git setup. Adi keeps control of git identity, signing, and history. Wireframes are ready to review regardless of git state.

Wiki page updated: pending.

---

## D-010 | 2026-04-24 | Narrative arc: mixed signal portfolio

Context: The 14 wireframes need a coherent narrative so the mock data tells a story rather than showing disconnected green lights. Three options considered: healthy portfolio (all green), stressed portfolio (majority under pressure), or mixed signal portfolio (some healthy, some under pressure, one in breach).

Decision: Mixed signal portfolio. Distribution across the ten seeded programmes to be proposed in the Design Foundations document: approximately three programmes in clear green state, four in watchful amber, two in active red risk, and one in active breach.

Rationale: This is the most LinkedIn-compelling arc. It lets the intelligence layer (What Why Act) demonstrate working on real delivery problems, it showcases drill-down from green programmes to red, and it mirrors the actual portfolio shape most delivery leaders manage. A fully green portfolio looks like a screensaver. A fully red portfolio looks pessimistic. The mix shows the product earning its keep.

Wiki page updated: pending.

---

## D-009 | 2026-04-24 | 10 programme seed authorship

Context: The 10 programme names, client attributions, geos, TCVs, and states must be set before wireframes are authored. Three options considered: Claude proposes, Adi provides, or use abstract placeholders.

Decision: Claude proposes 10 fictional programme names with full attribute set in the Design Foundations document section 6. Adi reviews and edits. All names fully fictional and public-safe (no real client names from Adi's actual engagements).

Rationale: Faster path to a consistent wireframe library. Claude uses the industry vocabulary from About_Me section 2 (BFSI, retail, manufacturing, healthcare). Adi retains approval and edit rights. Abstract placeholders (Programme 1, Programme 2) were rejected because they lose the realism that makes the LinkedIn demo compelling.

Wiki page updated: pending.

---

## D-008 | 2026-04-24 | CSS approach for wireframes

Context: Wireframe HTML files need a styling approach. Three options considered: Tailwind via CDN, raw inline CSS, or Shadcn plus Tailwind via CDN.

Decision: Tailwind via CDN inside each wireframe HTML file.

Rationale: Class names port directly to M7 React components with minimal rework. Tailwind CDN adds one small external dependency per wireframe file, which is acceptable because wireframes are reviewed in a browser with internet access, not shipped standalone. Raw inline CSS was rejected because it creates drift risk (each wireframe redefines its own style values). Shadcn plus Tailwind was rejected as too heavy for the wireframe stage.

Wiki page updated: pending.

---

## D-007 | 2026-04-24 | Colour palette direction

Context: Palette must be locked before any wireframe is authored. Three options considered: reuse v5.8 AKB1 palette, refresh for v1, or Adi provides palette directly.

Decision: Reuse v5.8 AKB1 palette. Dark navy primary, gold accent, status traffic lights (green, amber, red for healthy, watchful, breach).

Rationale: Brand continuity preserved. Adi's LinkedIn audience already associates this palette with AKB1 through v3.3 Hub, v5.8 Command Center, and the LinkedIn content pipeline S01 through S09. Refreshing the palette would reset brand equity just before the LinkedIn launch. The v5.8 palette has already been audited for status colour semantics (green for healthy, amber for watchful, red for breach) and works for delivery KPIs.

Wiki page updated: pending.

---

## D-006 | 2026-04-24 | Project root location inside AKB1 Base Cowork workspace

Context: Initial instruction was to place the project inside the Claude_Code projects folder at `/Users/adikompalli/Documents/Claude/Claude_Code/Projects/`. Adi reversed this mid-session and directed the project to live inside the AKB1 Base Chief of Staff Cowork workspace.

Decision: Project root is `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/AKB1_Delivery_Command_Center/`.

Rationale: Colocation with the Chief of Staff hub. Both paths are inside iCloud-synced Documents, so backup and recovery behaviour is identical. Placing the project inside the active Cowork workspace means every Cowork session naturally sees the project in context. When Claude Code takes over in Phase 3, it opens this folder directly.

Impact: All documentation, wireframes, and scaffold files save to this path. GitHub repo will push from this path. No change to naming, stack, or scope.

---

## D-005 | 2026-04-24 | Repo visibility strategy

Context: Decision needed on whether to build in public from day one, private until launch, or never public.

Decision: Private until v1.0.0 tag, then flip public for the LinkedIn launch.

Rationale: Controls reputation risk while the scaffold is messy. Gives a clean v1.0.0 first impression to fork visitors. Allows mistakes in the wireframe and documentation phase without audience exposure. Preserves the LinkedIn launch moment as a coordinated reveal, not a gradual leak.

Impact: `.github` workflows configured for private repo initially. Public-facing files (README, LICENSE, SECURITY, PRIVACY) produced before flip. Fork button copy and contribution guide written before flip.

---

## D-004 | 2026-04-24 | V1 scope: 14 tabs

Context: Tab scope options were 14 (12 from v5.8 plus 3 new), 12 (exact v5.8 parity), or 8 (curated lean).

Decision: 14 tabs. 12 carried from v5.8 Foil A plus Foil B, 3 new tabs added.

Rationale: The 3 new tabs close real-world delivery problem gaps that v5.8 did not address: Multi-Vendor Scorecard (partner performance visibility), Change Impact (scope creep and margin erosion), Client Health Radar (proxy NPS from escalation and ticket signal). Each new tab maps to a named problem in the 10-problem landscape that delivery leaders face. Without these, the product would ship with the same gaps v5.8 had.

Impact: Wireframe count is 16 (1 index plus 15 tab views). PRD count is 18 (1 master plus 14 tab PRDs plus 3 cross-cutting PRDs for data model, intelligence layer, security). Build effort increases versus 12-tab parity by roughly 25 percent.

---

## D-003 | 2026-04-24 | Tech stack: Next.js plus FastAPI plus Postgres plus Redis in Docker

Context: Three options evaluated: Streamlit plus SQLite in Docker (v5.8 pattern, lowest effort, poor concurrency), Next.js plus FastAPI plus Postgres plus Redis in Docker (production grade, rewrite frontend), or hybrid Next.js frontend plus v5.8 FastAPI backend with minimal changes.

Decision: Option 2. Next.js 14 App Router plus FastAPI plus Postgres 16 plus Redis 7, all containerised via Docker Compose for local use and Fly.io or Render for hosted.

Rationale: The LinkedIn launch implies strangers will concurrently open the hosted instance. Streamlit session state does not scale past tens of concurrent users before workers lock. Next.js with SSR plus stateless FastAPI containers plus Postgres plus Redis is the industry-standard production stack and scales horizontally. All components are open source, zero licence cost for initial development. Hosting cost at Phase 2 kicks in at roughly 5 to 25 USD per month on managed platforms. Local self-host is always free.

Impact: Full rewrite of the frontend versus v5.8. FastAPI patterns from v5.8 are reusable. New work: Next.js app scaffold, Tailwind or Shadcn UI, NextAuth, Postgres migrations, Redis session store, multi-stage Dockerfiles, docker-compose.yml, Fly.io or Render one-click button in README.

---

## D-002 | 2026-04-24 | Product name: AKB1 Delivery Command Center

Context: Naming proposal phase. Primary option was AKB1 Delivery Command Center. Alternatives considered: AKB1 Delivery OS, AKB1 Delivery Cockpit, AKB1 Portfolio Intelligence.

Decision: AKB1 Delivery Command Center. Repo slug `AKB1_Delivery_Command_Center`. Short code AKB1-DCC. Tagline "Portfolio intelligence for delivery leaders. Ten programmes. Three hundred people. One decision cockpit."

Rationale: Brand continuity with v5.8 akb1-command-center. Delivery leaders recognise "Command Center" as industry language (Gartner, McKinsey, Deloitte use it for portfolio governance operating models). Clean reset from v5.8.0 by dropping v6 numbering and adding "Delivery" as the explicit lens. LinkedIn searchable. Self-explanatory in a scroll.

Impact: Every filename, commit message, documentation header, and public asset uses the approved name. Prior iterations of the product carry the old repo name `akb1-command-center` in archived state.

---

## D-001 | 2026-04-24 | Project initiated

Context: v5.8.0 of AKB1 Command Center closed permanently on 2026-04-23. Adi directed the start of a new project: a delivery-specific command center, production grade, public LinkedIn launch path, intelligence layer on every tab, 10 programmes and 300 people as canonical data base.

Decision: Initiate AKB1 Delivery Command Center v1. Four phase model: wireframe, documentation, code, release. Wireframes first, no code until wireframes approved.

Rationale: v5.8 delivered a mature command center but with drill defects, seed drift, and test failures tolerated as baseline. v1 restarts with regression gates learned from v5.8, production grade tech stack, and the intelligence layer as a first-class concept rather than a retrofit.

Impact: New Cowork scaffold, new memory anchors, new milestone map. Old AKB1 Command Center repo stays frozen at v5.8.0. No cross-dependencies.

---

*Append new decisions at the top. ID pattern: D-NNN where NNN is a sequential counter. Never renumber, never delete.*
