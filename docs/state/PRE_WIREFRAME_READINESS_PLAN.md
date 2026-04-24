# PRE_WIREFRAME_READINESS_PLAN.md
### AKB1 Delivery Command Center v1 | Session 2026-04-24 | Author: Claude

> Reference artifact capturing the agreed plan to reach wireframe-ready state before the first wireframe is authored. Includes the folder structure audit, 42-item prerequisite inventory, the eight critical decisions and their resolutions, and the Design Foundations document plan. Open this file any time you need to recall what was discussed and agreed in the kickoff planning session.

---

## 1. Purpose of this document

This is a one-time reference artifact written at the close of the kickoff planning session on 2026-04-24. It records, in one place, the thinking that got us from project initiation to the point just before Milestone M1 (Wireframes) opens. If this document is re-read at any future date (after an OS restore, after a long pause, after handover), it gives the full context of what was considered, what was decided, what was deferred, and why.

## 2. Folder structure audit

### 2.1 What was proposed in the architect brainstorm

A full repository scaffold containing roughly 60 folders and placeholder files across seven top-level areas: documentation (`docs/`), backend code (`backend/`), frontend code (`frontend/`), infrastructure (`infra/`), Claude Code subagent roster (`.claude/`), GitHub workflows (`.github/`), and root-level metadata and configuration files.

### 2.2 What was actually created in the kickoff session

Thirteen write operations were executed. The subset that landed in the repo and memory stores:

| Artifact | Path | Created |
|----------|------|---------|
| Project identity and iCloud recovery anchor | `PROJECT_MANIFEST.md` | Yes |
| Claude Code operating rules for this project | `CLAUDE.md` | Yes |
| Architectural decision log | `docs/state/DECISION_LOG.md` | Yes |
| Session-level build state tracker | `docs/state/BUILD_STATE.md` | Yes |
| Milestone gate tracker | `docs/state/MILESTONE_STATUS.md` | Yes |
| Wireframes folder index stub | `docs/wireframes/README.md` | Yes |
| PRD folder index stub | `docs/prd/README.md` | Yes |
| Architecture folder index stub | `docs/architecture/README.md` | Yes |
| Test strategy folder index stub | `docs/test-strategy/README.md` | Yes |
| Cross-session project memory | Auto-memory `project_akb1_dcc_v1.md` | Yes |
| Memory index update | Auto-memory `MEMORY.md` | Yes |
| Hot cache active concepts update | `00_Wiki/hot_cache/ACTIVE_CONCEPTS.md` | Yes |
| Hot cache recent decisions update | `00_Wiki/hot_cache/RECENT_DECISIONS.md` | Yes |

### 2.3 What was deliberately not created

Roughly 85 percent of the proposed structure. Reason: these artifacts have real content dependencies that only become knowable at later milestones, and creating them speculatively generates drift risk.

| Deferred artifact | Reason for deferral | Target milestone |
|-------------------|---------------------|------------------|
| `README.md` (public-facing root) | Tone must match final product screenshots | M9 |
| `SECURITY.md`, `PRIVACY.md` | Content depends on security architecture | M3 |
| `LICENSE`, `CHANGELOG.md` | First entries land at first release | M9 |
| `.env.example` | Lists real env keys that exist only after backend build | M6 |
| `docker-compose.yml`, `docker-compose.prod.yml`, `Makefile` | Requires real image tags and service ports | M6 |
| `backend/` subtree | Opens at backend milestone | M6 |
| `frontend/` subtree | Opens at frontend milestone | M7 |
| `infra/` subtree | Opens at backend milestone | M6 |
| `.claude/agents/` (9 subagent files) | Opens at subagent roster milestone | M5 |
| `.github/workflows/`, `.github/ISSUE_TEMPLATE/` | First CI workflow lands at backend milestone | M6 |
| `docs/releases/`, `docs/linkedin/`, `docs/performance/` | Populated at release, launch, and benchmark phases | M9, M9, M8 |
| `docs/state/RISK_REGISTER.md`, `docs/state/TECH_DEBT.md` | Created when the first item is logged | On demand |

### 2.4 Prerequisites that were incorrectly deferred and now re-classified as blockers

Three artifacts originally deferred were re-examined and moved forward. They must exist before the first wireframe commit.

| Artifact | Reason for re-classification |
|----------|-----------------------------|
| `.gitignore` | Needed before first `git add`. Prevents accidental commits of OS files, IDE files, secrets. |
| `.pre-commit-config.yaml` | The em dash and emoji scanners must catch violations at commit time. Wireframes contain narrative text, which is where em dashes historically slip in. |
| Git initialisation and baseline commit | Every wireframe iteration should be a commit. Without git, iteration history is lost. Execution requires Adi's explicit consent. |

These three are referred to collectively in this document as the "operational readiness trio" and are sequenced between the Design Foundations document and the first wireframe.

## 3. Forty-two item prerequisite inventory

Each item is classified as Blocker (must be decided and landed before first wireframe), Parallel (can run alongside wireframe work without blocking it), or Defer (later phase, no wireframe impact).

### 3.1 Category A: Visual vocabulary and design tokens

| # | Item | Classification |
|---|------|---------------|
| 1 | Colour palette locked (primary, accent, status traffic lights, dark or light default) | Blocker |
| 2 | Typography stack locked (font family, sizes, weights, line heights) | Blocker |
| 3 | Spacing scale locked (4pt, 8pt, or 16pt base) | Blocker |
| 4 | Grid system locked (12-column responsive, breakpoints) | Blocker |
| 5 | Icon library locked (Lucide from v5.8, Phosphor, or Heroicons) | Blocker |
| 6 | Elevation and shadow scale | Blocker |
| 7 | Border radius scale | Blocker |
| 8 | Brand mark (wordmark only, or logo) | Parallel |

### 3.2 Category B: Component patterns

| # | Item | Classification |
|---|------|---------------|
| 9 | Tab navigation pattern (horizontal, sidebar, grouped top bar) | Blocker |
| 10 | Filter bar standard (which filters, shared state) | Blocker |
| 11 | Card pattern (header, KPI, sparkline, footer action) | Blocker |
| 12 | Intelligence layer visual template (card, strip, collapsible panel) | Blocker |
| 13 | Drill affordance pattern (icon, hover, click, breadcrumbs) | Blocker |
| 14 | Role indicator badge (placement, colour coding) | Blocker |
| 15 | Empty state pattern | Parallel |
| 16 | Error state pattern | Parallel |
| 17 | Loading state pattern | Defer |
| 18 | Toast or notification pattern | Defer |

### 3.3 Category C: Data foundations for wireframe mocks

| # | Item | Classification |
|---|------|---------------|
| 19 | 10 programme names with client, geo, TCV, contract type, dates (fictional) | Blocker |
| 20 | 300-person pyramid shape (bands, roles, geo split) | Blocker |
| 21 | 25 vendor names (fictional) | Blocker |
| 22 | 12-month financial shape per programme | Blocker |
| 23 | RAID state distribution | Blocker |
| 24 | SLA breach state | Blocker |
| 25 | Change request distribution | Blocker |
| 26 | Client health signals | Blocker |
| 27 | Edge case mock data | Parallel |

### 3.4 Category D: Language and tone

| # | Item | Classification |
|---|------|---------------|
| 28 | Intelligence layer voice calibration (Adi executive tone for What Why Act) | Blocker |
| 29 | Action verb taxonomy (escalate, reassign, freeze, replan) | Blocker |
| 30 | KPI naming conventions (About_Me section 10 vocabulary) | Blocker |
| 31 | Narrative arc across wireframes (mixed signal portfolio) | Blocker |

### 3.5 Category E: Confidentiality, legal, brand

| # | Item | Classification |
|---|------|---------------|
| 32 | Confirm no real client or programme names leak into mock data | Blocker |
| 33 | "Demo data. Fictional." disclaimer footer on every wireframe | Blocker |
| 34 | Attribution footer ("Built by Adi Kompalli") | Parallel |
| 35 | Trademark check on "AKB1" | Defer |
| 36 | Font licence check (Inter is open, safe) | Safe by default |
| 37 | Accessibility colour contrast check | Parallel |

### 3.6 Category F: Operational readiness

| # | Item | Classification |
|---|------|---------------|
| 38 | `.gitignore` at project root | Blocker |
| 39 | Git initialisation and baseline commit | Blocker (execution requires consent) |
| 40 | `.pre-commit-config.yaml` with em dash and emoji scanners | Blocker |
| 41 | Wireframe review protocol (batch vs one by one, approval format) | Blocker |
| 42 | Cross-tab link graph | Blocker |

## 4. Eight critical decisions and resolutions

Four of these were resolved in the kickoff planning session. Four were posed and answered in the prerequisite decision round at 2026-04-24.

### 4.1 Decisions resolved in the kickoff round

| ID | Decision | Resolution |
|----|----------|------------|
| D-001 | Project initiation | AKB1 Delivery Command Center v1 initiated 2026-04-24 |
| D-002 | Product name | AKB1 Delivery Command Center |
| D-003 | Tech stack | Next.js 14 plus FastAPI plus Postgres 16 plus Redis 7 in Docker |
| D-004 | Scope | 14 tabs (12 from v5.8 plus 3 new: Multi-Vendor Scorecard, Change Impact, Client Health Radar) |
| D-005 | Repo visibility | Private until v1.0.0, then public |
| D-006 | Project root location | Inside AKB1 Base Cowork workspace at `AKB1_Delivery_Command_Center/` |

### 4.2 Decisions resolved in the prerequisite round

| ID | Decision | Resolution |
|----|----------|------------|
| D-007 | Colour palette direction | Reuse v5.8 AKB1 palette. Dark navy primary, gold accent, status traffic lights. Brand continuity preserved. |
| D-008 | CSS approach for wireframes | Tailwind via CDN inside each wireframe HTML. Class names port directly to M7 React components. |
| D-009 | 10 programme seed authorship | Claude proposes 10 fictional programme names with client, geo, TCV, and state. Adi reviews and edits. All names fully fictional and public-safe. |
| D-010 | Narrative arc across 14 wireframes | Mixed signal portfolio. Some programmes healthy, some under pressure, one in breach. This lets the intelligence layer demonstrate What Why Act working on real delivery problems and showcases drill-down from green to red. |

### 4.3 Decisions still open, to be resolved in the Design Foundations round

Four decisions did not need answering in the prerequisite round because they can be proposed by Claude inside the Design Foundations document and reviewed by Adi in a single pass.

| Item | Owner | Target resolution |
|------|-------|-------------------|
| Chart library choice (Recharts v5.8 continuity or Apache ECharts or Chart.js) | Claude proposes, Adi approves | In Design Foundations section 4 |
| Icon library (Lucide v5.8 continuity or alternative) | Claude proposes, Adi approves | In Design Foundations section 4 |
| Tab navigation style (horizontal top bar, sidebar, or grouped top bar) | Claude proposes, Adi approves | In Design Foundations section 5 |
| Intelligence layer voice (Claude drafts in Adi tone from About_Me section 8) | Claude drafts, Adi approves | In Design Foundations section 11 |

## 5. Design Foundations document plan

The single artifact that locks items 1 through 42 before the first wireframe is written. This is the next document to be produced.

### 5.1 Proposed path

`AKB1_Delivery_Command_Center/docs/architecture/00_Design_Foundations.md`

### 5.2 Proposed structure

| Section | Contents |
|---------|----------|
| 1 | Colour palette and dark or light default |
| 2 | Typography stack |
| 3 | Spacing, grid, border radius, shadow scales |
| 4 | Icon library and chart library locked |
| 5 | Component patterns: card, filter bar, tab nav, intelligence layer template, drill affordance, role badge, empty state, error state |
| 6 | 10 programme seed table (name, client, geo, TCV, contract type, start date, end date, state) |
| 7 | 300-person pyramid shape, band distribution, role distribution, geo distribution |
| 8 | 25 vendor seed table |
| 9 | 12-month financial shape template (revenue, cost, margin curves with example numbers) |
| 10 | RAID, SLA, change request, client health signal distributions |
| 11 | Intelligence layer voice samples: three worked examples of What Why Act blocks in Adi tone |
| 12 | Cross-tab link graph |
| 13 | Confidentiality and legal declarations |
| 14 | Operational readiness checklist |

### 5.3 Effort estimate

Build time by Claude: approximately 45 minutes. Review time by Adi: 20 to 30 minutes. Iteration rounds expected: one to two.

### 5.4 Why this document earns its keep

Without it, every wireframe becomes a fresh design negotiation. The Foil A and Foil B consistency in v5.8 came from their shared author maintaining consistency by memory. For 16 wireframes authored over multiple sessions, written policy beats remembered policy every time.

## 6. Operational readiness trio

Three files and one execution that must land between Design Foundations signoff and the first wireframe commit.

| # | Artifact | Path | Effort | Needs consent |
|---|----------|------|--------|---------------|
| 1 | `.gitignore` | Project root | 5 minutes | No (file creation only) |
| 2 | `.pre-commit-config.yaml` | Project root | 15 minutes | No (file creation only) |
| 3 | Git initialisation and baseline commit | Project root | 2 minutes | Yes (execution) |

## 7. Sequence to first wireframe

The agreed path from this point to wireframe v1_01_Executive.html:

Step 1. Claude authors `00_Design_Foundations.md` containing all forty-two prerequisite items resolved. Submit for Adi review.

Step 2. Adi reviews. Iterate until signed off.

Step 3. Claude authors `.gitignore` and `.pre-commit-config.yaml`.

Step 4. Adi consents to git init and baseline commit. Claude runs the commands.

Step 5. Claude authors `v1_00_Index.html` (master index) and `v1_01_Executive.html` (quality benchmark wireframe). Submit both for Adi review.

Step 6. Adi reviews. Iterate until signed off.

Step 7. Claude authors the remaining 14 tab wireframes in sequence, each following the pattern from step 5.

Step 8. Adi signs off all 16 wireframes. M1 closes. M2 documentation phase opens.

## 8. Exit criteria for this planning phase

Planning phase closes when:

Items 1 through 42 in section 3 are either resolved, classified as Parallel, or classified as Defer with a target milestone. The four open decisions in section 4.3 are resolved inside the Design Foundations document. The Design Foundations document is signed off. The operational readiness trio is landed. The first wireframe (Executive Overview) is authored and signed off.

At that point, planning is complete and wireframe production runs to full completion against a known pattern.

## 9. Living document note

This file is a reference artifact. It is not updated as the project progresses. It captures a moment in time: the end of the kickoff planning session on 2026-04-24. The living state files are `PROJECT_MANIFEST.md`, `docs/state/BUILD_STATE.md`, `docs/state/DECISION_LOG.md`, and `docs/state/MILESTONE_STATUS.md`. If you want the current state of the project, read those files. If you want to recall what was discussed and agreed at kickoff, read this file.

---

*Session author: Claude acting as enterprise-wide solution architect. Product owner: Adi Kompalli. Session date: 2026-04-24. File immutable except for correction of factual errors.*
