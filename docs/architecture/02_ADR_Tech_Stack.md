# 02_ADR_Tech_Stack.md
### Architecture Decision Record: Core Tech Stack | Status: Accepted 2026-04-24 | Supersedes: none

> Formal ADR for the core technology choices. Locks the stack for v1.0.0. Any material change post-signoff requires a superseding ADR.

---

## 1. Status

Accepted 2026-04-24 via D-003 and ruthless self-check revision 2 reaffirmation. Effective for v1.0.0.

## 2. Context

The product is a public-facing, open-source, self-hostable portfolio intelligence platform. It must:

- Handle 100 concurrent users at p95 under 600 ms with CDN plus Redis response caching, 500 at 1200 ms green, 1000 at 2500 ms amber
- Ship with `docker compose up` working in under 10 minutes on a fresh host
- Be forkable by enterprise adopters without licence entanglement
- Support a LinkedIn launch where hundreds of strangers may open the hosted demo concurrently
- Have an intelligence layer that works offline via local Ollama and gracefully falls back to OpenAI or rules-only
- Survive in the open-source ecosystem for at least three years without the primary author shepherding every PR

Three stack families were evaluated in April 2026.

## 3. Decision

Adopt **Next.js 14 App Router on the frontend, FastAPI on the backend, Postgres 16 as the primary datastore, Redis 7 for session and cache, all packaged in Docker and Docker Compose.**

Optional intelligence providers: local Ollama via LiteLLM proxy, OpenAI-compatible API as fallback. Rules-only output is the default.

## 4. Alternatives considered

### 4.1 Streamlit plus SQLite plus FastAPI in Docker (v5.8 pattern)

| Dimension | Score |
|-----------|-------|
| Development speed | High (reuse v5.8 learnings) |
| Concurrency ceiling | Low (Streamlit session state collapses past ~50 concurrent) |
| LinkedIn launch fit | Poor |
| Maintenance | Medium |

Rejected because v5.8 already exposed the concurrency weakness. Public launch will exceed 50 concurrent easily.

### 4.2 Next.js plus Supabase (Postgres plus Auth plus Realtime)

| Dimension | Score |
|-----------|-------|
| Development speed | Very high |
| Vendor lock-in | Medium to high |
| Self-host | Possible but non-trivial |
| Cost at scale | Higher |

Rejected because self-host simplicity is a core value. Supabase self-host is less proven than vanilla Postgres.

### 4.3 Next.js plus FastAPI plus Postgres plus Redis in Docker (chosen)

| Dimension | Score |
|-----------|-------|
| Development speed | High |
| Concurrency ceiling | High (stateless containers) |
| Self-host | Excellent (single docker compose up) |
| Vendor lock-in | Near zero (all open source) |
| Team familiarity | High |
| LinkedIn launch fit | Excellent |

Accepted.

## 5. Consequences

### 5.1 Positive

- Boring technology: every layer is battle-tested, documented, hireable
- Stateless app containers scale horizontally
- Postgres plus Redis separation simplifies the operational mental model
- Zero licensing cost for every component
- Open-source community contributions have low onboarding friction
- Docker guarantees reproducibility across adopters
- Ollama plus OpenAI fallback covers local-first and hosted use cases

### 5.2 Negative

- Five running containers locally (frontend, backend, Postgres, Redis, Caddy in Phase 2) is heavier than a single-process app
- Next.js plus FastAPI means two languages in the codebase (Python and TypeScript). Increases cognitive load on solo maintainers
- Real-time features (WebSocket, SSE) require explicit integration. Not included in v1.0.0
- Performance targets require CDN plus Redis response cache. Without those, targets slip

### 5.3 Neutral

- Postgres 16 has excellent JSONB support. Mixed relational plus document patterns are expected for intelligence payloads and audit logs
- Redis 7 covers session plus cache plus rate limit plus intelligence data-epoch tracking. One tool, multiple jobs

## 6. Architectural enablers baked in

To hit the revised (realistic) performance targets, the following enablers are non-negotiable:

| Enabler | Implementation | Phase |
|---------|---------------|-------|
| CDN for static assets | Cloudflare or platform CDN in front of Next.js | Phase 2 |
| Redis response cache on GET endpoints | 60-second TTL, busted on data epoch change | Phase 1 and 2 |
| HTTP/2 | Caddy reverse proxy enables HTTP/2 keepalive | Phase 2 |
| Connection pool sizing | asyncpg pool 10 to 50 per replica | Phase 1 and 2 |
| Tailwind production build (no CDN) | Local build via PostCSS | Phase 1 and 2 |
| Postgres query indexes per PRD tab | Documented in each tab PRD | Phase 1 and 2 |
| Observability | Prometheus endpoint, OpenTelemetry hooks, structured JSON logs | Phase 1 and 2 |

## 7. Compliance with ruthless self-check findings

| Self-check severity-1 (Solution Architect) | Addressed by this ADR |
|---------------------------------------------|-----------------------|
| Cache TTL as primary invalidation | Cache key includes `data_epoch`, TTL is safety net only |
| LLM prompt injection unaddressed | Rules-only default, sanitisation and boundary markers when LLM enabled |
| Audit log deferred to Phase 2 | Audit log Phase 1 required, synchronous write to state-changing actions |
| Performance targets without enablers | CDN plus Redis plus HTTP/2 plus local Tailwind build made mandatory |
| Observability missing | Prometheus and OpenTelemetry required from M6 |

## 8. Revision policy

This ADR is locked for v1.0.0. Any change to a component, version, or major pattern requires a new ADR that supersedes this one. Minor version bumps (Next.js 14.1 to 14.2) do not require a new ADR.

## 9. Reviewers

| Reviewer | Role | Status |
|----------|------|--------|
| Claude | Architect | Authored |
| Adi Kompalli | Product owner | Pending signoff |

---

*Owner: Claude. Signoff: Adi. Next ADR will be authored when a material change to the stack is proposed.*
