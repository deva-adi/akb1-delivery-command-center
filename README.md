# AKB1 Delivery Command Center
### Governance is a revenue lever, not overhead. Delivery excellence is the retention argument. On-time on-budget is necessary but not sufficient.

> Open-source portfolio intelligence platform for delivery leaders. Fifteen role-gated tabs. Intelligence layer on every tab. Self-hostable in one `docker compose up`. AGPL-3 licensed.

---

## What this is

A decision cockpit for portfolio owners, programme managers, finance leads, and audit readers who run multi-programme IT services engagements. Built on the thesis that governance is a revenue lever, not a reporting overhead.

Every tab converts raw metrics into a prescriptive weekly action list with named owners and explicit deadlines. Every tab surfaces the hidden levers the AKB1 LinkedIn Hub content has documented for three years: decision velocity, team sustainability, scope debt, value realisation, margin leakage, client health, multi-vendor concentration risk.

## Status

**Private development. v0.1.0-wireframe. Revision 3.**

Flips public at the v1.0.0 tag with a coordinated LinkedIn launch on or about 2026-06-10.

## Why this exists

Most PPM tools stop at descriptive: "here is what happened." This product goes to prescriptive: "here is what to do this week, by whom, by when." On every tab.

The Hub's central observation, and this product's central feature: decision latency is the single largest hidden margin lever. A steering committee that takes 14 days to make a decision is not governing; it is performing governance. This product tracks decision latency as a headline KPI and surfaces the queue of stuck decisions on the Ops and SLA tab.

## Tech stack

Next.js 14 App Router. FastAPI. Postgres 16. Redis 7. Docker and Docker Compose. Intelligence layer via local Ollama (optional) with OpenAI-compatible fallback. Rules-only intelligence by default; LLM polish opt-in per deployment.

## Data foundation

Ten programmes. Three hundred people. Twenty-five vendors. Twelve months of financials. Deterministic seed generator. Any contributor who clones and runs `make seed` gets byte-identical demo data.

## Fifteen tabs plus four cross-cutting surfaces

Leadership cluster: Executive, Delivery Health, Risk and RAID, Workforce Intelligence, Financials, P and L Cockpit.

Operations cluster: Flow and Velocity, AI and Innovation, Commercial Pipeline, Backlog Health, Scenario Planner, Ops and SLA.

Deep Dive (new in v1): Multi-Vendor Scorecard, Change Impact, Client Health Radar.

Cross-cutting surfaces on every tab: search command palette (Cmd-K), notifications bell, exports (CSV, Excel, PowerPoint Steerco Pack), history (point-in-time as-of date).

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

---

*Revision 1 owner: Claude. Signoff: Adi. Full public-launch README replaces this file at M9.*
