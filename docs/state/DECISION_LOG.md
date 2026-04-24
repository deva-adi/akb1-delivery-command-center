# DECISION_LOG.md
### AKB1 Delivery Command Center v1 | Architectural decision log | Created: 2026-04-24

> Every architectural decision with rationale. Append-only. Latest entries at the top.

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
