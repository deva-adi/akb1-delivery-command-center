# AKB1 Delivery Command Center
### Portfolio intelligence for delivery leaders. Ten programmes. Three hundred people. One decision cockpit.

> Public README placeholder. The production-quality README is authored at M9 before the repo flips public. This file exists to establish the repo identity and protect the filename.

---

## Status

**Private development. v0.1.0-wireframe.**

This project is in active development. It will flip public at the v1.0.0 tag with a coordinated LinkedIn launch.

## What this is

An enterprise-grade portfolio intelligence platform for delivery leaders managing multi-programme, multi-geo IT services engagements. Fourteen tabs, role-gated for Portfolio Owner, Programme Manager, Finance Lead, and Read Only. Every tab carries a three-question intelligence layer: What does this tell me. Why is this happening. What do I do this week.

## Tech stack

Frontend: Next.js 14 (App Router).
Backend: FastAPI.
Database: Postgres 16.
Cache and session store: Redis 7.
Container: Docker and Docker Compose.
Intelligence layer: local Ollama via LiteLLM proxy, with OpenAI-compatible fallback.

## Data foundation

Ten programmes. Three hundred people. Twelve months of financials. Deterministic seed generator, any contributor runs `make seed` and gets byte-identical data.

## Where things live

Documentation at `docs/`. Backend code at `backend/` (M6). Frontend code at `frontend/` (M7). Infrastructure at `infra/`. Claude Code subagents at `.claude/agents/`. GitHub workflows at `.github/workflows/`.

## State and recovery

If you are reading this after an OS restore or cold start, begin with `PROJECT_MANIFEST.md` in the project root. That file is the recovery anchor.

## Licence

To be finalised at M9. Proposed: AGPL-3.

## Author

Adi Kompalli (deva.adi@gmail.com). Architect: Claude.

---

*Full public README replaces this file at M9.*
