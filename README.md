# AKB1 Delivery Command Center
### Governance is a revenue lever, not overhead. Delivery excellence is the retention argument. On-time on-budget is necessary but not sufficient.

> Open-source portfolio intelligence platform for delivery leaders. Fourteen role-gated tabs. Intelligence layer on every tab. Self-hostable in one `docker compose up`. AGPL-3 licensed.

---

## What this is

A decision cockpit for portfolio owners, programme managers, finance leads, and audit readers who run multi-programme IT services engagements. Built on the thesis that governance is a revenue lever, not a reporting overhead.

Every tab converts raw metrics into a prescriptive weekly action list with named owners and explicit deadlines. Every tab surfaces the hidden levers the AKB1 LinkedIn Hub content has documented for three years: decision velocity, team sustainability, scope debt, value realisation, margin leakage, client health, multi-vendor concentration risk.

## Status

**v1.0.0 | Public release | 2026-05-11**

814 tests green (252 backend pytest, 511 Vitest, 51 Playwright). Zero critical CVEs. All 14 tabs role-gated and rendering real seed data. Self-hostable with one `docker compose up`.

## Why this exists

Most PPM tools stop at descriptive: "here is what happened." This product goes to prescriptive: "here is what to do this week, by whom, by when." On every tab.

The Hub's central observation, and this product's central feature: decision latency is the single largest hidden margin lever. A steering committee that takes 14 days to make a decision is not governing; it is performing governance. This product tracks decision latency as a headline KPI and surfaces the queue of stuck decisions on the Ops and SLA tab.

## Tech stack

Next.js 14 App Router. FastAPI. Postgres 16. Redis 7. Docker and Docker Compose. Intelligence layer via local Ollama (optional) with OpenAI-compatible fallback. Rules-only intelligence by default; LLM polish opt-in per deployment.

## Data foundation

Ten programmes. Three hundred people. Twenty-five vendors. Twelve months of financials. Deterministic seed generator. Any contributor who clones and runs `make seed` gets byte-identical demo data.

## Fourteen tabs at v1.0.0

Built and role-gated: Executive, Delivery Health, Risk and RAID, Workforce Intelligence, Financials, Flow and Velocity, Ops and SLA, Client Health, Governance Operating Model, Capability and Supply Chain, AI Governance, Audit Trail Console, Backlog Health, home shell.

Deferred to v1.1 (wireframes exist, not yet built): P and L Cockpit, AI Innovation, Commercial Pipeline, Scenario Planner, Multi-Vendor Scorecard, Change Impact.

## Hub voice in the product

Five phrases from the AKB1 LinkedIn Hub content appear in the product where contextually appropriate, so delivery leaders using the dashboard feel the same voice they read on LinkedIn:

| Phrase | Where it appears |
|--------|------------------|
| "Governance is a revenue lever, not overhead" | This README, About page |
| "Green on metrics, red on reality" | Executive tab amber-state intelligence layer |
| "Amber equals steering. Red means we failed to decide in amber." | Intelligence layer tooltip |
| "Ten seconds. What is your current margin and what is driving the variance?" | Finance Lead onboarding |
| "Delivery excellence is the retention argument" | Client Health Radar subtitle |

## Where things live

Documentation at `docs/`. State and decision log at `docs/state/`. Architecture at `docs/architecture/`. PRDs at `docs/prd/`. Wireframes at `docs/wireframes/`. Backend code at `backend/` (M6 onward). Frontend code at `frontend/` (M7 onward). Infrastructure at `infra/`. Claude Code subagent specs at `.claude/agents/`. GitHub workflows at `.github/workflows/`.

## State and recovery

If you are reading this after an OS restore or cold start, begin with `PROJECT_MANIFEST.md` in the project root. That file is the recovery anchor.

## Licence

AGPL-3 at v1.0.0.

## Author

Adi Kompalli (deva.adi@gmail.com). Built as an open-source demonstration of the AKB1 delivery operating model. Architect: Claude.

## Quick start

```bash
git clone https://github.com/deva-adi/akb1-delivery-command-center.git
cd akb1-delivery-command-center
cp backend/.env.example backend/.env
docker compose up -d
# in a second terminal
cd backend && python -m app.seed.generator
```

Navigate to `http://localhost:3000`. Login with the seeded demo account (see `backend/app/seed/generator.py` for credentials).

---

*v1.0.0 | Author: Adi Kompalli | Architect: Claude*
