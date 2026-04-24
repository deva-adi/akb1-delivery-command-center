# SECURITY.md
### AKB1 Delivery Command Center v1 | Security Policy | Placeholder authored 2026-04-24

> Full security policy authored at M3 alongside `03_PRD_Security_Auth.md` and `03_Security_Architecture.md`. This file exists to protect the filename and establish the policy at repo creation time.

---

## Supported versions

| Version | Supported |
|---------|-----------|
| v1.0.0 and above | Will be supported once released |
| v0.x (pre-release) | Not supported for security reports |

## Reporting a vulnerability

Until M9 public release, this repository is private. If you have received access and identify a vulnerability, email Adi Kompalli at deva.adi@gmail.com with subject line "AKB1 DCC security disclosure".

From v1.0.0 onward, the public vulnerability disclosure process will be published here.

## Security architecture summary

Full architecture authored at M3. Key principles:

Four-role access control: Portfolio Owner, Programme Manager, Finance Lead, Read Only. Row-level security in Postgres. Per-tenant data isolation in Phase 2. Audit log of all state-changing actions. Rate limiting at the API gateway. HTTPS in Phase 2 via Caddy or managed platform.

No secrets committed. All environment variables loaded from `.env` (gitignored).

## Phase 1 versus Phase 2

Phase 1 is local-only self-host. Single tenant. Simple credentials auth.

Phase 2 is internet-published. Full OAuth via Google and Microsoft. Per-tenant isolation. Audit log. Rate limiting. HTTPS.

---

*Full policy authored at M3. Last updated: 2026-04-24.*
