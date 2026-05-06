# USE_CASE_GAP_ANALYSIS_2026-04-24.md
### Hub-to-Product Use Case Gap Analysis | AKB1 Delivery Command Center v1 | Wave 3 | Created: 2026-04-24

> Delivery-manager lens applied to the Hub source material and the current 15-tab dashboard. Identifies use cases that the articles commit to but the product does not yet surface. Produces a menu for Adi to approve before execution.

> Previous waves closed severity-1 metrics (D-019) and severity-2 metrics (D-021). Wave 3 is different: it closes **use case gaps**, not metric gaps. Metrics say "what to measure"; use cases say "what the user is trying to do when they open the app".

---

## 1. Hub content inventory referenced

Portfolio Desk series, 13 parts at `AKB1_LinkedIn_Hub/01_Content_Series/10_The_Portfolio_Desk/`:
Part 01 The 180 Day Gap, Part 02 Four Portfolio Instruments, Part 03 Forecast Confidence Interval, Part 04 Account Concentration Map, Part 05 DM Succession Picture, Part 06 Capability Heat Map, Part 07 Friday Forecast Call, Part 08 Escalation Contract, Part 09 When Portfolios Drift, Part 10 Commercial Drift, Part 11 Renewal Signal, Part 12 Board Facing Story, Part 13 First 90 Days.

When Delivery Breaks series, 5 parts at `01_Content_Series/04_When_Delivery_Breaks/`. Critical: Part 2 Steering Committee Is Theatre and Part 5 The Operating Model Failed.

Commercial Delivery Manager series, 3 parts at `01_Content_Series/05_Commercial_Delivery_Manager/`. Part 2 Margin Leak Nobody Reports and Part 3 Cost Centre to Growth Engine inform the commercial surface.

Proposition_A through Proposition_D at `02_Strategy_and_Planning/_propositions/`. Proposition A is the delivery-breakdown framing. Proposition B is the commercial delivery manager framing.

Short posts at `01_Content_Series/06_Delivery_Truths_Short_Posts`. Post 3 speaks to best-developer-not-best-team-lead (talent), Post 4 speaks to governance adding three weeks to every decision (decision latency).

## 2. Delivery-manager use case inventory

Each use case is the concrete job-to-be-done. Named, not just a metric.

### UC-A Governance Operating Model on one canvas

What the DM or director is trying to do: see the full governance stack for a programme or portfolio. Who decides what. On what cadence. With what pre-read. And where decisions are getting stuck.

Hub source: When Delivery Breaks Part 2 (steering committee theatre), Part 5 (operating model failed), Portfolio Desk Part 08 (escalation contract), short post 4 (governance adding three weeks).

Sub-use-cases:
- UC-A1 Governance Cadence Calendar per programme. Daily standup, weekly delivery forum, fortnightly sponsor review, monthly steerco.
- UC-A2 RACI Working Matrix per programme with gap and overlap flagging.
- UC-A3 Escalation Contract. Time-bound decision ladder with authority tier per decision class.
- UC-A4 Steering Committee Pre-Read Kit. Auto-assembled one-pager per steerco.
- UC-A5 Weekly Commitment Review per team. Committed vs delivered delta.
- UC-A6 Sponsor Engagement Score. Attendance, decisions made, follow-through rate.

### UC-B Bench Strength Deep Dive

What the DM or portfolio owner is trying to do: answer the question "how many people are on the bench right now, what are their skills, which programmes could absorb them, and how long have they been sitting."

Hub source: Portfolio Desk Part 06 (capability heat map), Commercial Delivery Manager Part 2 (margin leak nobody reports), Proposition B overall.

Sub-use-cases:
- UC-B1 Bench Roster (named individuals, band, skills, geo, bench-since date, bench tax allocated to which programme).
- UC-B2 Skills Heat Map (portfolio skill inventory overlaid with current demand and pipeline demand from Commercial).
- UC-B3 Bench-to-Demand Match. Which programme or opportunity could absorb each bench person based on skill fit.
- UC-B4 Bench Aging Distribution. Cohort view by bench age: fresh (under 14 days), aging (14 to 30), at-risk (30 to 60), margin drag (over 60).
- UC-B5 Bench Productivity. Training, certifications, internal projects completed during bench.

### UC-C Director-Level Portfolio Instruments

What the newly-promoted director is trying to do: see the four things no single delivery manager can see, per Portfolio Desk Part 02.

Hub source: Portfolio Desk Part 01 (180 day gap), Part 02 (four instruments).

Sub-use-cases:
- UC-C1 Forecast Confidence Range across portfolio (not per programme)
- UC-C2 Account Concentration Map (which clients dominate revenue, margin, dependency risk)
- UC-C3 DM Succession Picture (which delivery managers are 90 days from resigning, with successor readiness)
- UC-C4 Capability Heat Map (skill gaps across portfolio vs demand)

These four are the same DNA as UC-B2 and UC-D and UC-E, but the director-level labelling matters. Proposition D: a new "Portfolio Director" surface unifying them.

### UC-D Account Concentration Map

What the portfolio owner is trying to do: see which clients carry the bulk of revenue and margin, identify concentration risk, and plan expansion vs diversification.

Hub source: Portfolio Desk Part 04.

Sub-use-cases:
- UC-D1 Revenue concentration per client (top 3, top 5, top 10 percent of revenue)
- UC-D2 Margin concentration per client
- UC-D3 Dependency risk (if the top client walks, what percent revenue is at risk)
- UC-D4 Expansion headroom per client (pipeline plus whitespace)

### UC-E DM Succession Picture

What the portfolio owner is trying to do: know which delivery managers are flight risks, see who could step up, and avoid single-points-of-failure.

Hub source: Portfolio Desk Part 05, short post 3 (best developer is not best team lead), When Delivery Breaks Part 5 (operating model rework).

Sub-use-cases:
- UC-E1 Per-DM flight risk score (tenure, overtime, 1on1 sentiment, compensation ratio, last promotion date)
- UC-E2 Successor readiness map per DM role
- UC-E3 Critical single-points-of-failure flagged

Distinct from Workforce Tab's aggregate Bus Factor because UC-E is personnel-named, not numeric.

### UC-F Forecast Confidence Interval (portfolio, weekly)

What the director is trying to do: at the Friday forecast call, see the portfolio forecast with confidence band, not point estimate.

Hub source: Portfolio Desk Part 03 (forecast confidence interval), Part 07 (Friday forecast call).

Sub-use-cases:
- UC-F1 Portfolio revenue forecast with 95 percent confidence band, weekly refresh
- UC-F2 Friday Forecast Call view with commentary from each DM
- UC-F3 Confidence shrinking trend (is the range tightening as weeks pass)

### UC-G Board-Facing Story

What the director is trying to do: build the narrative for a quarterly board meeting. Different from steerco (internal to delivery org). Board audience is outside the delivery org and wants strategic context.

Hub source: Portfolio Desk Part 12.

Sub-use-cases:
- UC-G1 Board Pack export variant (different slide template vs Steerco Pack)
- UC-G2 Narrative assembly with the "What, So What, Now What" structure
- UC-G3 YoY comparison, not just MTD or QTD

### UC-H First 90 Days Onboarding

What the new director is trying to do: learn the dashboard on day 1, not day 90.

Hub source: Portfolio Desk Part 13.

Sub-use-cases:
- UC-H1 Guided tour on first login (role-aware)
- UC-H2 "First 90 Days" checklist view (what a new director should review each week)
- UC-H3 Calibration mode (contrast a new director's mental model against the Hub definitions)

### UC-I Contract Lifecycle

What the finance lead or commercial lead is trying to do: see the contractual health of each programme. MSAs, SOWs, amendments, renewals, rate card expiry, SLA cliff dates.

Hub source: When Delivery Breaks Part 5 (commercial health check), Commercial Delivery Manager Part 1 and 2.

Sub-use-cases:
- UC-I1 Contract artefact register per programme (MSA, SOW, CRs, amendments)
- UC-I2 Renewal timeline with risk flags
- UC-I3 Rate card expiry tracker
- UC-I4 SLA pass-through clauses catalogued

### UC-J Hiring Funnel and Talent Supply Chain

What the workforce lead is trying to do: see the talent pipeline against pipeline demand. Open positions, candidates, offers, joiners, ramp-up.

Hub source: Portfolio Desk Part 06 (capability heat map extended to supply side), Proposition B.

Sub-use-cases:
- UC-J1 Open positions by band, skill, geo
- UC-J2 Candidate funnel (sourced, screened, interviewed, offered, joined)
- UC-J3 Offer acceptance rate trend
- UC-J4 Ramp-up tracking for new joiners
- UC-J5 Time-to-fill by role

### UC-K Audit Trail Explorer

What the auditor, security auditor, or compliance officer is trying to do: see every mutation, export, role change, decision closure. Searchable, filterable, exportable as evidence.

Hub source: Implied by governance theme, not direct in Hub.

Sub-use-cases:
- UC-K1 Global audit log console with filters (actor, endpoint, outcome, time range)
- UC-K2 Decision closure audit trail (who closed, when, with what rationale)
- UC-K3 Export trail (what was exported, by whom, to which destination)
- UC-K4 Role change history (every role promotion or demotion)

### UC-L Quality Management + DORA Metrics

What the delivery lead is trying to do: see the engineering health signals. Not just AI-originated defects, but full QMS and DORA.

Hub source: Commercial Delivery Manager Part 2 (margin leak from rework), short post 2 (status report that only goes up is a lie).

Sub-use-cases:
- UC-L1 Defect trends per programme (severity, age, root cause distribution)
- UC-L2 DORA metrics per programme (deployment frequency, lead time for changes, change failure rate, MTTR)
- UC-L3 Test coverage trend
- UC-L4 Code review metrics (review time, reviewer distribution)

### UC-M Structured Problem-Solving Tracker

What the delivery lead is trying to do: run a 5-Why or fishbone on a recurring issue, attach it to a RAID item, track it to resolution.

Hub source: When Delivery Breaks Part 5 (5-Why on the healthcare reconciliation).

Sub-use-cases:
- UC-M1 5-Why register per programme
- UC-M2 Root cause category distribution (process, tool, people, environment, governance)
- UC-M3 Resolution time from 5-Why to fix

### UC-N Vendor Definition-of-Done Matrix

What the programme manager is trying to do: see shared definition-of-done between vendors on a multi-vendor programme, flag gaps and overlaps, assign handoff SLAs.

Hub source: When Delivery Breaks Part 5 (vendor A vs vendor B data handoff gap).

Sub-use-cases:
- UC-N1 DoD matrix per programme with vendor rows and workstream columns
- UC-N2 Gap detection (no vendor owns a cell) and overlap detection (two vendors claim the same cell)
- UC-N3 Handoff SLA between vendors

## 3. Coverage map: current 15 tabs vs use cases

| Use case | Current coverage | Gap severity |
|----------|------------------|--------------|
| UC-A Governance Operating Model | Partial. Ops SLA has Decision Queue. No cadence calendar, no RACI, no sponsor engagement score. | **Severity 1** |
| UC-B Bench Strength Deep Dive | Partial. Workforce aggregate bench. Financials has Bench Tax. No named roster, no skills heat map, no bench-to-demand match. | **Severity 1** |
| UC-C Four Portfolio Instruments (director) | Implicit on Executive tab but not labelled as four. | Severity 2 |
| UC-D Account Concentration Map | Not surfaced. | **Severity 1** |
| UC-E DM Succession Picture | Partial. Workforce Bus Factor is aggregate. No per-DM. | **Severity 1** |
| UC-F Portfolio Forecast Confidence | Partial. Scenario Planner has PERT but on what-if scenarios, not on portfolio baseline forecast. | Severity 2 |
| UC-G Board-Facing Story | Partial. Exports has Steerco Pack, not Board Pack. | Severity 2 |
| UC-H First 90 Days Onboarding | Not surfaced. | Severity 3 |
| UC-I Contract Lifecycle | Partial. Multi-Vendor has contract references. No lifecycle view. | Severity 2 |
| UC-J Hiring Funnel | Not surfaced. | Severity 2 |
| UC-K Audit Trail Explorer | Mentioned in Security PRD. No UI. | Severity 2 |
| UC-L QMS plus DORA | Partial. AI Defect rate on AI tab. No DORA. | Severity 2 |
| UC-M Structured Problem-Solving Tracker | Not surfaced. | Severity 3 |
| UC-N Vendor Definition-of-Done Matrix | Not surfaced. | Severity 2 |

**Severity 1 count: 4.** These materially break the Hub promise. UC-A and UC-E are particularly acute because the Hub content puts them at the centre of proposition A (when delivery breaks) and the Portfolio Desk manifesto (four instruments, DM succession).

## 4. Architectural options

Adding 14 use cases as tabs would bloat the UX to 29 tabs. The right pattern is a mix: new tabs only for use cases that deserve their own primary surface, and drill-down sections for the rest. Four architectural patterns:

### Pattern 1: New primary tab

Use when the use case is a daily or weekly repeat visit with its own distinct decision rhythm. Qualifies: UC-A Governance Operating Model, UC-B Bench Strength Deep Dive.

### Pattern 2: New section on existing tab

Use when the use case extends an existing tab's theme. Qualifies: UC-C on Executive, UC-D on Commercial, UC-E on Workforce, UC-F on Scenario, UC-I on Multi-Vendor, UC-J on Workforce, UC-L on Flow and Velocity, UC-M on Change Impact, UC-N on Multi-Vendor.

### Pattern 3: New cross-cutting surface

Use when the use case is available from every tab, not one. Qualifies: UC-G (new export variant), UC-H (onboarding flow), UC-K (global console accessible from any tab).

### Pattern 4: Defer to post-v1

Candidates that could be argued down to post-v1: UC-H First 90 Days Onboarding, UC-M Structured Problem-Solving Tracker. Low Hub-promise weight, high build cost.

## 5. Options for closure

### Option A Conservative: close severity-1 only

Scope:
- New tab: Governance Operating Model (UC-A1 through UC-A6)
- Expand Workforce Intelligence tab: Bench Roster drill-down (UC-B1 through UC-B5), DM Succession Picture section (UC-E)
- Expand Commercial Pipeline tab: Account Concentration Map section (UC-D)
- Expand Executive tab: label existing KPI grid as Four Portfolio Instruments explicitly (UC-C)

Total new surfaces: 1 tab, 3 sections, 1 label change.
Token and build cost: moderate. About 2 session turns to wireframe and PRD.

### Option B Balanced: severity-1 plus high-value severity-2

Scope:
- Everything in Option A
- New tab: Capability and Supply Chain (UC-B2 skills heat map, UC-J hiring funnel) as distinct from Workforce Intelligence which stays operational
- Expand Scenario Planner: Portfolio Forecast Confidence (UC-F) as a dedicated mode separate from scenario what-if
- Expand Multi-Vendor: Vendor Definition-of-Done Matrix (UC-N) and Contract Lifecycle (UC-I)
- Expand Flow and Velocity: DORA metrics section (UC-L)
- New cross-cutting: Audit Trail Explorer console (UC-K) and Board Pack export variant (UC-G)

Total new surfaces: 2 tabs, 6 sections, 2 cross-cutting.
Token and build cost: high. About 4 session turns.

### Option C Strategic: close everything

Scope:
- Everything in Option B
- Add UC-H First 90 Days Onboarding (role-aware tour plus checklist)
- Add UC-M Structured Problem-Solving Tracker (section on Change Impact with 5-Why register)
- Rework Executive tab into an explicit "Four Portfolio Instruments" layout per Portfolio Desk Part 02

Total new surfaces: 2 tabs, 8 sections, 3 cross-cutting.
Token and build cost: very high. About 6 session turns.

## 6. Recommendation

**Option B Balanced.**

Reasons:

First, the four severity-1 gaps (UC-A governance, UC-B bench, UC-D account concentration, UC-E DM succession) directly contradict the Hub promise. The Hub article "Your Steering Committee Is Theatre" asserts that governance is trackable; the dashboard must be able to show a steering committee being theatrical. The Hub article "DM Succession Picture" asserts the director sees who is 90 days from resigning; the dashboard must show that person. Leaving these unclosed would make the v1.0.0 LinkedIn launch a credibility risk.

Second, Option B also picks up the three severity-2 items with the highest Hub weight: UC-F portfolio forecast (Portfolio Desk Parts 03 and 07), UC-G board pack (Portfolio Desk Part 12), and UC-N vendor DoD (When Delivery Breaks Part 5). These are named in standalone articles, not buried. Leaving them unclosed would produce the same credibility risk.

Third, Option B defers UC-H Onboarding and UC-M 5-Why tracker to post-v1 because they are enablers, not core. A user who understands the dashboard from the LinkedIn article does not need the onboarding to get value. A delivery lead can run a 5-Why outside the app and attach notes to a RAID item.

## 7. Execution plan if Option B approved

**Phase 1 (turn 1)**: Wireframe and PRD for the two new tabs.
- New tab v1_16 Governance Operating Model with six sections
- New tab v1_17 Capability and Supply Chain with five sections (skills heat map, hiring funnel, capacity forecast)
- Data Model PRD revision 4 adding new entities: `governance_cadence`, `raci_matrix`, `sponsor_engagement`, `dm_succession_signals`, `skills_inventory`, `hiring_funnel`, `contract_artefacts`, `dora_metrics`, `vendor_dod_matrix`, `commitment_review`, `five_why_register` (postponed)

**Phase 2 (turn 2)**: Expand existing tabs.
- Executive tab rev 4: Four Portfolio Instruments label layer
- Workforce Intelligence rev 4: Bench Roster drill plus DM Succession section
- Commercial Pipeline rev 4: Account Concentration Map section
- Scenario Planner rev 4: Portfolio Forecast Confidence mode
- Multi-Vendor rev 4: Vendor DoD Matrix plus Contract Lifecycle
- Flow and Velocity rev 2: DORA metrics

**Phase 3 (turn 3)**: Cross-cutting surfaces.
- Audit Trail Explorer console (global, accessible from every tab via More menu)
- Board Pack export variant with distinct template

**Phase 4 (turn 4)**: Test strategy and subagent updates.
- M4 test doc 10: Governance and Capability test plan
- M5 subagent update: add `governance-rules` and `capability-rules` to intel-rules specialisation
- DECISION_LOG D-023 closure entry

## 8. What does not change

Existing 12 tabs at rev 3 are not revised for rev 4 except the five listed above. Rev 3 stays the baseline for the 7 unchanged tabs. No re-work on the PRDs, wireframes, tests, or subagents already shipped.

## 9. Hub voice locks for new tabs

Two new Hub phrases proposed for lock into Design Foundations revision 4:

- "Governance that does not decide is theatre" (from When Delivery Breaks Part 2)
- "The director sees across. The delivery manager walks each one" (from Portfolio Desk Part 01)

Both would appear in their respective new tab subtitles.

## 10. Wave 4 extended scan, 2026-04-24 end of session

After submitting sections 1 through 9 to Adi, he asked for one more pass. Wave 4 covered:
- Delivery Truths short posts 1 through 10 (publishing schedule May through July 2026)
- Delivery PnL Option B 10-post series (publishing schedule July through August 2026)
- Governance in AI 4-part series (AI governance distinct from AI adoption)
- Portfolio Desk Manifesto
- AI and Software Delivery Part 4 (Delivery Operating Model for AI era)

Wave 4 surfaced **10 additional use cases (UC-O through UC-X)** and **2 more severity-1 gaps**. Revised totals:

### Wave 4 additions

| ID | Use case | Hub source | Severity |
|----|----------|------------|----------|
| UC-O | AI Governance Layer (shadow IT inventory, risk tiering Green/Amber/Red, quality gates per tier, governance cadence) | Governance in AI Parts 1 to 4, especially Part 2 | **Severity 1** |
| UC-P | Earned Value Management: CPI (Cost Performance Index), SPI (Schedule Performance Index), TCPI, EAC vs BAC per programme | Delivery PnL Option B Post 06 CPI/SPI Reality | **Severity 1** |
| UC-Q | Programme Closeout Readiness (checklist, lessons learned, revenue recognition finalisation, resource demobilisation) | Delivery PnL Option B Post 10 Programme Closeout | Severity 2 |
| UC-R | Stakeholder Influence Map (influence x support grid per programme, sponsor availability, decision-maker shift detection) | Delivery Truths Post 10 Loudest Stakeholder Always Wins | Severity 2 |
| UC-S | Over-Optimism Detection (Green-on-Green Flag for programmes reporting only green for too many cycles, prediction vs actual variance) | Delivery Truths Post 02 Status Report That Only Goes Up, Post 09 Most Dangerous Person Says On Track | Severity 2 |
| UC-T | Margin Literacy per DM (60-second margin-narrative test score per delivery manager) | Delivery Truths Post 05 Margin Impact in 60 Seconds | Severity 3 |
| UC-U | Rate Card Optimisation (effective rate card per programme per band, arbitrage opportunity, expiry cascade) | Delivery PnL Option B Post 03 Rate Card Arbitrage | Severity 2 |
| UC-V | Transition Planning Readiness (onshore-offshore checklist, post-transition defect rate) | Delivery Truths Post 07 Offshore Team Did Not Fail | Severity 3 |
| UC-W | Urgent Request Bypass (count of bypasses, 3x cost multiplier, change-control discipline score) | Delivery Truths Post 08 Every Urgent Request Costs 3x | Severity 2 |
| UC-X | Scope Definition Quality at Kickoff (definition-of-done per deliverable, open scope question count entering discovery) | Delivery Truths Post 01 Client Did Not Change Scope | Severity 3 |

### Revised severity inventory across waves 3 and 4

**Severity 1 (6 items, was 4):** UC-A Governance Operating Model, UC-B Bench Deep Dive, UC-D Account Concentration, UC-E DM Succession, **UC-O AI Governance Layer (new)**, **UC-P EVM CPI SPI (new)**

**Severity 2 (12 items, was 8):** UC-C Four Portfolio Instruments, UC-F Portfolio Forecast Confidence, UC-G Board-Facing Story, UC-I Contract Lifecycle, UC-J Hiring Funnel, UC-K Audit Trail, UC-L QMS and DORA, UC-N Vendor DoD, **UC-Q Closeout (new)**, **UC-R Stakeholder Map (new)**, **UC-S Over-Optimism Flag (new)**, **UC-U Rate Card (new)**, **UC-W Urgent Bypass (new)**

**Severity 3 (5 items, was 2):** UC-H Onboarding, UC-M 5-Why, **UC-T Margin Literacy (new)**, **UC-V Transition Planning (new)**, **UC-X Scope Definition Quality (new)**

## 11. Why the wave 4 severity-1 additions matter

### UC-O AI Governance Layer

The Hub dedicates a 4-part standalone series to AI governance. That is more runway than any other theme except the Portfolio Desk. Current DCC covers AI **adoption** (tools inventory, productivity uplift, AI-assist percent, AI defect rate). It does not cover AI **governance** (who sanctioned the tool, what risk tier is it, what quality gate applies, is there a survey-based shadow-IT inventory). Leaving this unclosed means a LinkedIn reader who reads the Governance in AI series and then downloads the dashboard finds the governance layer missing.

### UC-P EVM CPI SPI

CPI and SPI are the two fundamental financial-operational delivery metrics. The fact that DCC has 12 tabs and no CPI or SPI is a structural hole. The Hub's Delivery PnL series Post 06 is dedicated to this. A delivery governance product without CPI and SPI is incomplete at the fundamentals layer.

## 12. Revised architecture recommendation

Given 6 severity-1 gaps (up from 4), the right structural move is:

**New tabs: 2** (same as before)
- v1_16 Governance Operating Model (absorbs UC-A plus UC-R Stakeholder Map plus UC-S Over-Optimism Flag, because these all live at the governance layer)
- v1_17 Capability and Supply Chain (absorbs UC-B plus UC-E plus UC-J Hiring Funnel)

**Tab expansions: 7** (up from 5)
- Executive tab: Four Portfolio Instruments label layer (UC-C)
- Workforce: cross-link to the new Capability tab
- Commercial Pipeline: Account Concentration Map (UC-D) plus Rate Card Optimisation (UC-U)
- AI and Innovation: AI Governance section with 3-tier risk classification (UC-O)
- Delivery Health: EVM section with CPI plus SPI plus TCPI (UC-P)
- Multi-Vendor: DoD Matrix (UC-N) plus Contract Lifecycle (UC-I)
- Change Impact: Urgent Request Bypass tracker (UC-W) plus Closeout Readiness (UC-Q) plus Scope Definition Quality (UC-X)
- Flow and Velocity: DORA metrics (UC-L)

**Cross-cutting surfaces: 2** (same as before)
- Audit Trail Explorer console (UC-K)
- Board Pack export variant (UC-G)

**Scenario Planner expansion** (portfolio forecast confidence UC-F) ships as part of Phase 2.

## 13. Revised options

### Option A Conservative: close 6 severity-1 only

Scope:
- New tab: Governance Operating Model (UC-A plus UC-R plus UC-S)
- New tab: Capability and Supply Chain (UC-B plus UC-E)
- Expand AI and Innovation: AI Governance section (UC-O)
- Expand Delivery Health: EVM CPI SPI section (UC-P)
- Expand Commercial Pipeline: Account Concentration Map (UC-D)

Count: 2 new tabs, 3 section expansions.
Cost: about 3 session turns.

### Option B Balanced: severity-1 plus high-weight severity-2 (recommended revision)

Scope:
- Everything in Option A
- Expand Executive: Four Portfolio Instruments label layer (UC-C)
- Expand Scenario Planner: Portfolio Forecast Confidence mode (UC-F)
- Expand Multi-Vendor: DoD Matrix (UC-N) and Contract Lifecycle (UC-I)
- Expand Flow and Velocity: DORA metrics (UC-L)
- Expand Change Impact: Urgent Request Bypass (UC-W) and Closeout Readiness (UC-Q)
- Expand Commercial: Rate Card Optimisation (UC-U) alongside Account Concentration
- Expand Workforce: Hiring Funnel cross-section (UC-J)
- New cross-cutting: Audit Trail Explorer (UC-K)
- New export variant: Board Pack (UC-G)

Count: 2 new tabs, 10 section expansions, 2 cross-cutting surfaces.
Cost: about 5 session turns.

### Option C Strategic: close everything including severity-3

Scope:
- Everything in Option B
- UC-H First 90 Days Onboarding
- UC-M 5-Why Tracker
- UC-T Margin Literacy per DM
- UC-V Transition Planning
- UC-X Scope Definition Quality at Kickoff

Count: 2 new tabs, 14 section expansions, 3 cross-cutting surfaces.
Cost: about 7 session turns.

## 14. My revised recommendation after wave 4

**Option B Balanced, with UC-O and UC-P promoted to phase 1 because both are severity-1.**

Rationale:

Option A leaves the board pack export, DORA, and audit trail unclosed. For a product launching publicly on LinkedIn, not having an audit trail UI is a credibility risk; the Hub promises governance visibility. DORA is the industry-standard engineering health language; its absence signals shallow engineering maturity.

Option C over-builds for v1.0.0. Onboarding, 5-Why tracker, and margin literacy testing are post-launch optimisations. The first 1000 users will forgive their absence.

Option B adds four more severity-2 closures beyond A (Account Concentration was already in A; B adds Four Portfolio Instruments labelling, Portfolio Forecast Confidence, DORA, Urgent Bypass, Closeout, Rate Card, Hiring Funnel, Audit Trail, Board Pack). These are the items most often named explicitly in Hub standalone articles.

## 15. Final decision needed

Adi to approve one of:

- A Conservative (6 severity-1 only)
- **B Balanced (recommended, closes severity-1 plus 9 high-weight severity-2)**
- C Strategic (closes everything)
- Custom (pick specific items)

Once approved, Data Model PRD revision 4 will cover approximately 14 new entities, 2 new tab PRDs, 7 tab PRD revision 4 rewrites, 2 cross-cutting PRDs, 2 new wireframes and 7 wireframe revision 4 edits, plus M4 and M5 updates.

---

*Wave 4 owner: Claude. Signoff pending: Adi.*
