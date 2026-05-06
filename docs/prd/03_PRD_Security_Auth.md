# 03_PRD_Security_Auth.md
### AKB1 Delivery Command Center v1 | Security and Auth PRD | Revision 2 | Updated: 2026-04-24

> Revision 2 incorporates all severity-1 security findings: audit log moved to Phase 1, CSRF explicit, CORS explicit, basic rate limiting in Phase 1, data retention policy, SOC2-lite posture documented. Replaces revision 1.

---

## 1. Scope

Auth, RBAC, row-level security, audit logging, compliance posture, hardening. Phase 1 for self-host. Phase 2 for hosted internet deploys. Revision 2 closes five severity-1 architect findings from the ruthless self-check.

## 2. Phase 1 versus Phase 2 (revised, D-016)

| Capability | Phase 1 (self-host) | Phase 2 (hosted) |
|------------|---------------------|------------------|
| Tenancy | Single tenant | Multi tenant with data isolation |
| Auth | NextAuth credentials with `users.json` bcrypt-hashed | NextAuth OAuth Google and Microsoft |
| RBAC | Hardcoded 4 roles | Same plus admin tenant management |
| **Audit log** | **Phase 1 required (revised)** | Same plus per-tenant filtering |
| RLS (Postgres) | Disabled | Enabled, tenant_id on every row |
| Rate limiting | Basic per-IP, 100 req/min | Per-user token bucket |
| CSRF protection | Required (double-submit cookie) | Required |
| CORS | Strict allowlist | Strict allowlist plus per-tenant override |
| HTTPS | Operator responsibility | Caddy/managed platform TLS |
| Secrets manager | `.env` file | Vault or platform secret store |
| Security scanning | CI every PR | CI every PR |
| Data retention | Policy documented, applied manually | Policy enforced by schedule |
| Compliance posture | SOC2-lite documented | Certification path opened |

## 3. Roles (unchanged)

Four roles: Portfolio Owner, Programme Manager, Finance Lead, Read Only. Access matrix in `backend/app/auth/access_matrix.py`.

## 4. Access matrix (unchanged from revision 1)

Same four-role structure.

## 5. Auth flow

### 5.1 Phase 1 credentials

1. User opens login
2. Enters email plus password (seeded `users.json` with bcrypt hashes)
3. NextAuth validates, issues signed JWT
4. JWT stored in httpOnly, SameSite=Strict cookie
5. Refresh token issued separately in httpOnly cookie with 7-day expiry, rotating on use
6. Backend validates JWT on every request

### 5.2 Phase 2 OAuth

Same pattern with Google and Microsoft as providers. Role mapping via email domain allowlist configurable, default Read Only.

## 6. RBAC implementation

FastAPI dependency `require_role(*allowed_roles)` gates every route. Frontend conditionally renders. Backend enforces regardless of frontend state.

## 7. Row-level security (Phase 2)

Postgres RLS enabled per tenant. Unchanged design.

## 8. Audit log (Phase 1 required, D-017)

**Every state-changing action writes to `audit_log` table synchronously within the request transaction.** Table schema in `01_PRD_Data_Model.md` section 4.11.

Events logged:
- `auth.login`, `auth.logout`, `auth.failed_login`
- `scenario.create`, `scenario.update`, `scenario.delete`
- `cr.reprice`, `cr.approve`, `cr.reject`
- `raid.open`, `raid.mitigate`, `raid.escalate`
- `user.role_change`, `user.disable`
- `settings.change`
- `export.generate` (per export trigger)
- `notification.send`

Retention minimum 1 year Phase 1, 7 years Phase 2 for financial compliance.

Admin audit viewer UI in post-v1 release. Phase 1 is write-plus-query via SQL.

## 9. CSRF protection (NEW, severity-2)

Double-submit cookie pattern. Frontend reads CSRF token from `Set-Cookie: csrf_token=...; SameSite=Strict` on login. Every state-changing request (POST, PUT, DELETE, PATCH) includes header `X-CSRF-Token: <same-value>`. Backend rejects mismatched or missing token with 403.

Exempt: idempotent GET requests, public auth endpoints.

## 10. CORS (NEW, severity-2)

Strict allowlist. Phase 1 default: `http://localhost:3000` only. Phase 2 hosted: env-configurable list of origins. `Access-Control-Allow-Credentials: true` only when explicitly needed. Preflight cached 600 seconds.

## 11. Rate limiting (Phase 1 revised, severity-2)

Phase 1 basic per-IP token bucket in Redis:

| Surface | Limit |
|---------|-------|
| `/auth/*` | 10 req/min per IP |
| `/api/v1/intelligence/*` | 30 req/min per IP |
| `/api/v1/*` other | 120 req/min per IP |
| Static assets | No limit |

Phase 2 adds per-user limits and tenant-level caps.

## 12. Secrets management (expanded)

`.env` gitignored. `.env.example` with placeholders. Required keys:

`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `CSRF_SECRET`, `OLLAMA_BASE_URL`, `LITELLM_API_KEY`, `OPENAI_API_KEY` (optional), `FEATURE_LLM_POLISH`, `GOOGLE_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET`.

Phase 2 integrates with Vault, Fly.io secrets, Railway variables. Secrets rotation policy: JWT_SECRET rotated quarterly, refresh tokens revoked on rotation.

## 13. Transport security

Phase 1: operator responsibility (local loopback). Phase 2: Caddy sidecar with Let's Encrypt, TLS 1.3 preferred, 1.2 minimum, HSTS 1 year with preload.

## 14. Security headers

Every response:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:4000 http://localhost:11434; font-src 'self' data:; frame-ancestors 'none'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload (Phase 2)
```

CSP tightened from revision 1 by removing Tailwind CDN allowance; production ships with locally-built Tailwind.

## 15. Vulnerability scanning

Unchanged. trivy, bandit, npm audit, schemathesis. CI fail on critical or high.

## 16. Data retention policy (NEW, severity-2)

| Data | Retention | Rationale |
|------|-----------|-----------|
| Application logs | 30 days | Operational debugging |
| Audit log | 1 year Phase 1, 7 years Phase 2 | Compliance and forensics |
| KPI snapshots | 52 weeks rolling | History tab requirement |
| Seed data | Indefinite, regeneratable | Demo purpose |
| User sessions (Redis) | 7 days | Refresh token life |
| Cache entries | Event-driven plus 60 min safety TTL | Intelligence layer design |
| Notifications | 90 days | Reasonable time window |
| Exports generated | Not stored server-side | Privacy, generated on-demand |

Right-to-delete endpoints provided for Phase 2 GDPR compliance. User-initiated data export available via profile page.

## 17. SOC2-lite posture (NEW, D-016)

Documented in `SECURITY.md`. Covers:
- Access control (4-role RBAC, least privilege)
- Audit trail (audit_log writes on state change)
- Encryption (at rest via Postgres TDE in Phase 2, in transit via TLS 1.3)
- Incident response runbook (template in `docs/runbooks/incident_response.md`)
- Change management (git, PR review, CI gates)
- Vulnerability management (CI scanners, patch cadence)
- Business continuity (Docker reproducibility, seed regeneration)

No certification attempted for v1.0.0. Framework documented so adopters pursuing certification can layer their own audit on top.

## 18. GDPR-lite posture (NEW)

Documented in `PRIVACY.md`. Data locality (all storage on operator infrastructure), right to export, right to delete. Zero telemetry default. Data processor vs controller distinction clarified.

## 19. Acceptance criteria and release gating

Security PRD closes when Adi approves Phase 1 audit log, CSRF, CORS, rate limiting, data retention policy, SOC2-lite documentation. For v1.0.0:
- Phase 1 auth works end-to-end
- No secrets committed
- All scanners green (no critical/high)
- Security headers present
- CSP strict without unsafe-inline where possible
- Audit log writes observable
- Penetration test scope documented for Phase 2 hosted deploy (not required for v1.0.0 self-host)

---

*Revision 2 owner: Claude, reviewed at M5 by security-engineer subagent. Signoff: Adi.*
