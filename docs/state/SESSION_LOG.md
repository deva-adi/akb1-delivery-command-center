## SESSION_LOG.md
### AKB1 Delivery Command Center v1 | Per-slice append log | Created: 2026-04-25 (slice 4 close)

> Append-only. One entry per slice close. Format per Adi's persistence-everything
> directive (slice 3 -> 4 transition): date, slice, scope, output, tests, decisions,
> files touched, open loops. Latest entry at the top.

---

## 2026-04-30 | M6 slice 5b | Auth-hardening (Redis lockout + per-IP rate limit + stateless CSRF)

### Scope (per kickoff)
1. Replace slice 3 in-memory per-email lockout with Redis-backed counter; remove the in-memory fallback entirely
2. Per-IP rate limit middleware (PRD 03 section 11) on /api/v1/* with tiered caps and Retry-After
3. Stateless double-submit CSRF middleware (PRD 03 section 9) verifying header against cookie on mutating requests
4. fakeredis used throughout for test isolation
5. Persistence-everything directive applied (5 state files)

### Output
- 1 new module backend/app/cache.py (process-wide async Redis singleton + FastAPI dep)
- 2 new middleware backend/app/middleware/{rate_limit,csrf}.py
- 1 module rewritten: backend/app/auth/lockout.py (Redis-backed counter; in-memory dict and threading lock removed)
- 7 new settings: rate_limit_auth_requests, rate_limit_default_requests, rate_limit_window_seconds, trusted_proxy, csrf_cookie_name, csrf_header_name, csrf_token_bytes
- 2 new runtime deps: redis 5.2.1, fakeredis 2.26.1 (test only)
- New conftest fixtures: fake_redis (per-test flushed), http_client_no_csrf (sibling without CSRF pre-seed)

### Tests
- 138 of 138 backend pytest green (slice 5b added 21: 4 Redis-lockout, 8 rate limit, 9 CSRF)
- 0 failures
- All 13 slice 3 lockout tests carried over to Redis backend unchanged
- 4 e2e tests updated with _sync_csrf helper to harvest cookie from real login response
- Em-dash and en-dash sweeps clean across slice 5b files
- no-hardcoded-thresholds lint clean (no rule modules touched)

### Decisions (D-041)
1. Redis client singleton on app.state seam shared between routes (Depends) and middleware (no Depends)
2. Counter semantics over sliding window for lockout: TTL anchored to first failure, never refreshed (Divergence 1)
3. Fail-loud on Redis unavailable, no in-memory fallback (multi-worker correctness gap visibility)
4. Tiered caps over shared per-IP-per-minute counter (Divergence 2c): auth_requests=10, default_requests=120
5. Per-minute sliding bucket retained over true token bucket (Divergence 3): documented as PRD section 11 deviation
6. TRUSTED_PROXY setting gates X-Forwarded-For trust (empty default in dev to close spoof bypass)
7. Health endpoint exempt by virtue of root-mount (no /api/v1 prefix), no special case
8. Per-test rate-limit override seam via app.state attributes
9. CSRF as defense-in-depth despite JWT-in-body auth (M7 cookie-JWT path)
10. Stateless double-submit using secrets.compare_digest, no Redis lookup
11. Token issued only on 2xx login response; 401 does not mint a token (anti-harvest)
12. Test fixture pre-seed CSRF state on default http_client; sync helper for real-login e2e tests
13. RateLimitMiddleware outermost (sheds load first), CsrfMiddleware inner
14. Slice 3 follow-up cleared (in-memory lockout removed)
15. Carried forward: deferred sentinel system user for unknown-email login audit (still no AP-observer requirement)

### Files touched
NEW (6):
- backend/app/cache.py
- backend/app/middleware/__init__.py
- backend/app/middleware/rate_limit.py
- backend/app/middleware/csrf.py
- backend/tests/integration/test_rate_limit.py
- backend/tests/integration/test_csrf.py

MODIFIED (12):
- backend/requirements.txt (+ redis, + fakeredis)
- backend/app/auth/lockout.py (in-memory removed; Redis counter)
- backend/app/services/auth_login.py (Redis client positional arg; await on lockout)
- backend/app/api/v1/auth.py (Depends(get_redis))
- backend/app/main.py (lifespan + 2 middleware registrations)
- backend/app/config.py (rate_limit_*, trusted_proxy, csrf_* settings)
- backend/tests/integration/conftest.py (fake_redis, http_client overrides, http_client_no_csrf)
- backend/tests/integration/test_auth_login.py (autouse reset removed; 4 Redis-specific tests added)
- backend/tests/integration/test_e2e_login_patch_get.py (lockout import removed; _sync_csrf after login)
- backend/tests/integration/test_e2e_audit_search.py (same)
- docs/state/BUILD_STATE.md (slice 5b row update, session log entry, checkpoint)
- docs/state/DECISION_LOG.md (D-041 prepended)
- docs/state/SESSION_LOG.md (this file)
- docs/state/MILESTONE_STATUS.md (M6 slice 5b evidence)
- PROJECT_MANIFEST.md (version line + Phase 3 paragraph refreshed)

### Open loops
- Programme scoping for DD/FL on /audit/search (still deferred; needs people-to-programmes mapping)
- GET /api/v1/audit/entry/{id} not yet shipped (PRD 26 section 10)
- Sentinel system user for unknown-email login audit (still deferred)
- PRD 03 cascade should fold in: shared-counter tiered comparison shape, TRUSTED_PROXY setting, CSRF cookie shape (HttpOnly=False per double-submit), fail-loud-on-Redis posture
- Per-tier rate limit buckets (currently shared key) when intelligence prefix arrives
- M7 frontend cookie-JWT decision: if M7 stores JWT in cookie, the CSRF defense becomes load-bearing rather than defense-in-depth

---

## 2026-04-25 | M6 slice 4 | AP flag enforcement + first AP-gated endpoint

### Scope (per kickoff)
1. require_ap_flag and require_audit_access dependencies in backend/app/auth/dependencies.py
2. Migration 004_outcome_enum_extension adds ApFlagDenied + RoleDenied to audit_trail_entries.outcome CHECK enum
3. GET /api/v1/audit/search per PRD 26 section 10: cursor pagination, filters, wrapped response, role-scoped row visibility
4. Contract tests covering every role x AP combination including denial-audit verification
5. e2e test: login -> PATCH -> /audit/search
6. Persistence-everything directive applied (5 state files)

### Output
- 1 new endpoint: GET /api/v1/audit/search (AP-gated)
- 2 new auth dependencies: require_ap_flag, require_audit_access
- 2 new migrations: 004 (outcome enum +2), 005 (http_method enum +1 GET, needed for denial audit on read endpoint)
- 2 new outcome enum values queryable: ApFlagDenied, RoleDenied
- 1 new resource_type in audit: audit_search

### Tests
- 117 of 117 backend pytest green (slice 4 added 18: 16 contract + 2 e2e)
- 0 failures
- Em-dash and en-dash sweeps clean across slice 4 files
- no-hardcoded-thresholds lint clean

### Decisions (D-040)
1. Composite require_audit_access dependency for AP-gated endpoints (role check + AP check + audit-on-denial in one place)
2. PortfolioOwner allowed through with ap_flag=false (own-actions row scope); DD and FL require ap_flag=true (matches kickoff scope)
3. Forward-only downgrade for migrations 004 and 005 (DELETE on audit_trail_entries is REVOKE'd; restrictive constraint cannot be re-applied if rows carry new values; 001 downgrade still drops the table)
4. Migration 005 adds GET to http_method enum: divergence from PRD 4.71 (read endpoints not audited at volume) needed for denial audit on read endpoints
5. Cursor pagination: urlsafe base64 JSON {ts, id} payload. Opaque to clients
6. Deferred: programme scoping for DD/FL on /audit/search (needs people-to-programmes mapping; not in slice 4 kickoff)
7. Carried forward: sentinel system user for unknown-email login audit (deferred per slice 3 close; documented in services/auth_login.py docstring)

### Files touched
NEW (5):
- backend/alembic/versions/004_outcome_enum_extension.py
- backend/alembic/versions/005_http_method_get.py
- backend/app/schemas/audit.py
- backend/app/services/audit_search.py
- backend/app/api/v1/audit.py
- backend/tests/integration/test_audit_search.py
- backend/tests/integration/test_e2e_audit_search.py
- docs/state/SESSION_LOG.md (this file)

MODIFIED (8):
- backend/app/auth/dependencies.py (+ require_ap_flag, require_audit_access)
- backend/app/models/audit_trail_entries.py (CHECK extended)
- backend/app/main.py (+ audit router)
- backend/app/services/auth_login.py (docstring update on deferred sentinel system user)
- docs/state/BUILD_STATE.md (slice 4 row update, session log entry)
- docs/state/DECISION_LOG.md (D-040 prepended)
- docs/state/MILESTONE_STATUS.md (M1-M5 closed states reflected, M6 updated)
- PROJECT_MANIFEST.md (test count, slice count, endpoint count, migration count refreshed)

### Open loops
- Programme scoping for DD/FL on /audit/search (data model needs people-to-programmes mapping)
- Slice 5 candidates: CSRF + per-IP rate limit + Redis lockout (auth hardening), OR GET /audit/entry/{id} for full diff view (PRD 26 section 10), OR programme scoping
- Sentinel system user for unknown-email login audit (still deferred)
- PRD rev 5 cascade should fold in: GET in http_method enum (PRD 4.71), AP flag denial-audit pattern as the canonical AP-gated endpoint shape

---
