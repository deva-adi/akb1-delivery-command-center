# Frontend

Next.js 14 App Router on TypeScript strict. Tailwind on Option D Executive Mid palette tokens (Design Foundations rev 4 section 1, locked D-018). M7 scaffold landed at v0.4.0; tab content fills in subsequent slices.

## Layout

```
frontend/
|-- app/
|   |-- layout.tsx                Root html shell + globals.css
|   |-- page.tsx                  Root: redirect to /home or /login
|   |-- login/
|   |   |-- page.tsx              Login page
|   |   +-- LoginForm.tsx         Client form
|   |-- home/
|   |   |-- layout.tsx            Protected layout (header + role nav)
|   |   +-- page.tsx              Landing with TierConfigCard
|   +-- api/auth/
|       |-- login/route.ts        Route Handler proxy to backend
|       +-- logout/route.ts       Clear cookies
|-- components/
|   |-- RoleAwareNav.tsx          Per-role primary 5-tab nav (Master PRD R3.3)
|   |-- RoleBadge.tsx             Role label + AP gold dot
|   +-- TierConfigCard.tsx        PO populated, non-PO stub
|-- lib/
|   |-- env.ts                    BACKEND_API_URL only
|   |-- auth/
|   |   |-- role-nav.ts           5-tab map per role
|   |   |-- cookies.ts            akb1_session + csrf_token shape
|   |   +-- session.ts            JWT decode via jose
|   +-- api-client/
|       |-- fetcher.ts            Server-side fetch wrapper (Bearer + CSRF)
|       +-- schema.ts             Generated types from openapi.json
|-- middleware.ts                 Edge middleware: /login + /home/* gating
|-- openapi.json                  Snapshot of backend OpenAPI spec
|-- scripts/gen-openapi.sh        Regenerate openapi.json + schema.ts
+-- tests/unit/                   Vitest unit suite (40 tests)
```

## Quick start

Backend must be running on http://localhost:8000 (see project root README).

```
cd frontend
npm install
JWT_SECRET=$(grep JWT_SECRET ../.env.example | cut -d= -f2) \
  BACKEND_API_URL=http://localhost:8000 \
  npm run dev
```

Open http://localhost:3000. Login with any seeded user; the canonical demo password is `akb1_demo_password`. Find a PO email via:

```
docker exec akb1_dcc_db psql -U akb1_owner -d akb1_dcc -t \
  -c "SELECT email FROM people WHERE role='PortfolioOwner' AND ap_flag=true LIMIT 1;"
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | next lint |
| `npm run typecheck` | tsc --noEmit |
| `npm test` | vitest run |
| `npm run test:watch` | vitest in watch mode |
| `npm run gen:openapi` | Regenerate openapi.json from backend, then schema.ts from openapi.json |
| `npm run gen:openapi:check` | Same in CI mode; fails on backend drift or stale schema.ts |

## Auth flow (scaffold)

Per Q2 ruling at M7 kickoff. NextAuth deferred to Phase 2 OAuth.

1. User posts email + password to `POST /api/auth/login` (Next.js Route Handler proxy).
2. Proxy forwards to backend `POST /api/v1/auth/login`.
3. Backend returns `{access_token: <JWT>}` and sets `csrf_token` cookie.
4. Proxy plants `akb1_session` (httpOnly, SameSite=Strict) and forwards `csrf_token` (HttpOnly=False, SameSite=Strict).
5. Subsequent server-side fetches via `lib/api-client/fetcher.callBackend` attach Bearer header from `akb1_session` and `X-CSRF-Token` header from `csrf_token` on mutating methods.
6. Edge middleware on `/login` and `/home/*` redirects accordingly.

## Role nav

Per Master PRD revision 3 section R3.3. Six roles, each with exactly 5 primary tabs. All 18 tabs reachable via a More menu in subsequent slices. Backend access matrix (01_PRD_Data_Model.md section 3.1.10) is authoritative; this map is layout-only.

## Palette

Semantic tokens in `tailwind.config.ts`. No inline hex in component files. Per Q4 ruling. Tokens: `bg-base`, `bg-surface`, `bg-surface-elevated`, `bg-surface-subtle`, `border-subtle`, `border-strong`, `text-primary`, `text-secondary`, `text-muted`, `text-subtle`, `accent-gold`, `status-red`, `status-amber`, `status-green`, plus `role-pm` and `role-fl` supplementals.

## OpenAPI codegen

Per Q3 ruling and CLAUDE.md hard rule. `scripts/gen-openapi.sh` snapshots the backend OpenAPI spec to `openapi.json` and runs `openapi-typescript` to generate `lib/api-client/schema.ts`. Both files committed; CI runs `npm run gen:openapi:check` and fails on drift.

---

*Folder owner: frontend-next subagent (M7 onward).*
