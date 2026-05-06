# UC_TO_DASHBOARD_MAPPING_2026-04-24.md
### Complete Use Case Inventory and Dashboard Mapping | AKB1 Delivery Command Center v1 | Wave 5 | Created: 2026-04-24

> Exhaustive mapping of every use case extracted from the AKB1 LinkedIn Hub content against the current 15-tab dashboard at revision 3. No execution proposed. Purpose: establish the complete coverage picture before any decision on what to build next.

---

## 1. Content scanned

Every series and post inside `AKB1_LinkedIn_Hub/01_Content_Series/` plus `00_Manifesto/` and `02_Strategy_and_Planning/_propositions/`. Total items scanned in detail:

| Series | Count scanned | Status |
|--------|---------------|--------|
| S00 Manifesto | 1 article | Published 2026-04-20 |
| S01 AKB1 Command Center | 6 parts | Posted 2026-04-06 through 2026-04-15 (original v5.8.0 product origin) |
| S02 AI and Software Delivery | 4 parts | Posted 2026-04-21 through 2026-04-30 |
| S03 Governance in AI | 4 parts | Scheduled 2026-05-04 through 2026-06-10 |
| S04 When Delivery Breaks | 5 parts | Scheduled 2026-05-14 through 2026-06-11 |
| S05 Commercial Delivery Manager | 3 parts (P1, P3 drafted, P2 not yet) | Scheduled 2026-06-25 through 2026-07-09 |
| S06 Delivery Truths | 10 posts | Scheduled 2026-05-19 through 2026-07-28 |
| S07 Long-Form Articles | 2 articles | Scheduled 2026-06-18 and 2026-07-07 |
| S08 Delivery PnL Option B | 10 posts | Scheduled 2026-07-16 through 2026-08-25 |
| S09 Delivery PnL Option C | 3 carousels | Scheduled 2026-08-27 through 2026-09-03 |
| S10 Portfolio Desk | Manifesto + Part 01 drafted only; Parts 02 through 13 folder placeholders | Not yet drafted |
| Propositions A through D | 4 docs | Strategy layer |

Total drafted articles, posts, and carousels: **49**. Total Portfolio Desk placeholder future content: **12 more pieces** (design-locked by manifesto).

## 2. Complete use case inventory extracted from Hub

Each UC below cites the Hub article or articles that commit to it, names the concrete job-to-be-done, and maps to current dashboard state. UC numbering continues from waves 3 and 4.

### Governance cluster

**UC-A Governance Operating Model on one canvas**

- Source: S01P6 Operating Model Finale (4-layer framework), S04P2 Steering Committee Theatre, S04P5 Operating Model, S06P4 Governance Adds 3 Weeks.
- Job-to-be-done: See the full governance stack (cadence, decision rights, escalation path, pre-read, sponsor engagement, weekly commitment review) in one place.
- Current coverage: Partial. Ops and SLA tab at rev 3 has Decision Queue and Decision Velocity chart. No cadence calendar, no RACI matrix, no pre-read kit, no sponsor engagement score.
- Gap: **Severity 1.**

**UC-A1 Governance Cadence Calendar per programme**

- Source: S04P5 (daily standup 15 min, weekly delivery forum 60 min, fortnightly sponsor review 60 min, monthly steerco 60 min).
- Current coverage: Not surfaced.
- Gap: **Severity 1.**

**UC-A2 RACI Working Matrix per programme with gap and overlap flagging**

- Source: S04P5 (RACI as theatre vs working guide).
- Current coverage: Not surfaced.
- Gap: **Severity 1.**

**UC-A3 Escalation Contract with authority tiers and time-bound gates**

- Source: S04P2, S10 Portfolio Desk Part 08 (planned), S06P6 Escalating Early vs Late.
- Current coverage: Not surfaced as a contract. Decision Queue shows ages, not the tier.
- Gap: **Severity 1.**

**UC-A4 Steering Committee Pre-Read Kit (auto-assembled)**

- Source: S04P2 (the 4-column format: decision, options, recommendation, impact of deferral).
- Current coverage: Not surfaced. Exports has Steerco Pack (post-meeting), not pre-read.
- Gap: Severity 2.

**UC-A5 Weekly Commitment Review (committed vs delivered delta)**

- Source: S04P5.
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-A6 Sponsor Engagement Score**

- Source: S04P2 (sponsor on mute, decisions deferred).
- Current coverage: Not surfaced.
- Gap: Severity 2.

### Decision Velocity cluster

**UC-Y Decision Queue with options, recommendation, deferral impact fields**

- Source: S04P2 (the 4-column format).
- Current coverage: Partial. Rev 3 Decision Queue shows programme, age, SLA, status, owner. Missing: options column, recommendation column, impact-of-deferral column.
- Gap: Severity 2.

**UC-Z Decision Latency trend plus 4-category classification**

- Source: S04P2 (decisions classified by programme, vendor, resource, commercial).
- Current coverage: Partial. Rev 3 shows average latency but not category split.
- Gap: Severity 3.

### Portfolio (director altitude) cluster

**UC-C Four Portfolio Instruments (director-level framing)**

- Source: S10 Portfolio Desk Manifesto, S10 Part 01.
- Current coverage: Executive tab exists but is not labelled as four-instrument layout.
- Gap: Severity 2.

**UC-D Account Concentration Map**

- Source: S10 Portfolio Desk Part 04 (planned).
- Current coverage: Not surfaced.
- Gap: **Severity 1.**

**UC-F Portfolio Forecast Confidence Range (Friday forecast call)**

- Source: S10 Parts 03 and 07 (planned).
- Current coverage: Partial. Scenario Planner rev 3 has PERT for what-if, not for portfolio baseline forecast.
- Gap: Severity 2.

**UC-F2 Friday Forecast Call view**

- Source: S10 Part 07 (planned).
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-AA Portfolio Drift Detection (every programme green, portfolio bleeding)**

- Source: S10 Part 09 (planned).
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-G Board-Facing Story (distinct from internal steerco)**

- Source: S10 Part 12 (planned).
- Current coverage: Partial. Exports has Steerco Pack, not Board Pack.
- Gap: Severity 2.

**UC-H First 90 Days Onboarding**

- Source: S10 Part 13 (planned), S10 Part 01 (180 day gap).
- Current coverage: Not surfaced.
- Gap: Severity 3.

### Capability and People cluster

**UC-B Bench Strength Deep Dive**

- Source: S05P1 (unplanned attrition, skill-mix pressure), S08P4 Utilization Truth, S08P5 Bench Tax, S09C03 Bench Tax.
- Sub use cases: B1 named roster, B2 skills heat map, B3 bench-to-demand match, B4 bench aging distribution, B5 bench productivity.
- Current coverage: Partial. Workforce tab aggregate bench. Financials rev 3 Bench Tax Allocation table. No named roster, no skills heat map, no bench-to-demand match.
- Gap: **Severity 1.**

**UC-E DM Succession Picture**

- Source: S10 Part 05 (planned), S06P3 Best Developer vs Best Lead.
- Sub use cases: E1 per-DM flight risk, E2 successor readiness, E3 single-points-of-failure.
- Current coverage: Partial. Workforce rev 3 Bus Factor is aggregate. No per-DM view.
- Gap: **Severity 1.**

**UC-J Hiring Funnel and Talent Supply Chain**

- Source: S10 Part 06 (planned capability heat map extended to supply).
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-BB Pyramid Shift for AI Era (skill mix under AI acceleration)**

- Source: S02P2 Three Roles Affected.
- Current coverage: Workforce rev 3 has AI Impact Pyramid Overlay showing band shift. Partial.
- Gap: Severity 3 (already partially covered).

**UC-T Margin Literacy per DM (60-second test)**

- Source: S06P5 Margin Impact in 60 Seconds.
- Current coverage: Not surfaced.
- Gap: Severity 3.

**UC-E2 Top Talent Retention Conversations (the 3 conversations)**

- Source: S10 Part 05 placeholder, Portfolio Desk Manifesto reference.
- Current coverage: Not surfaced.
- Gap: Severity 3.

### Commercial and PnL cluster

**UC-P Earned Value Management (CPI, SPI, TCPI, EAC, BAC)**

- Source: S08P6 CPI SPI Reality, S09C01 Estimation (EAC prediction), S01P6 Operating Model (CPI below 1.0 is red trigger).
- Current coverage: Not surfaced. No CPI, no SPI, no EAC, no TCPI.
- Gap: **Severity 1.**

**UC-U Rate Card Optimisation (skill-mix drift, effective rate per band)**

- Source: S08P3 Rate Card Arbitrage.
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-CC Utilization Reconciliation (3 systems, 3 numbers, 7-point gap)**

- Source: S08P4 Utilization Truth, S09C02 Utilization.
- Current coverage: Workforce rev 3 has Utilization KPI. Does not show the multi-system reconciliation.
- Gap: Severity 2.

**UC-DD Revenue Leakage 5-Mechanism Audit**

- Source: S08P7 Revenue Leakage.
- Current coverage: Partial. Financials has unbilled WIP; CR absorbed on Change Impact. Missing 3 of 5 mechanisms (unbilled overtime, scope creep absorbed silently, invoice timing slippage).
- Gap: Severity 2.

**UC-W Urgent Request Bypass (3x cost multiplier)**

- Source: S06P8 Every Urgent Request Costs 3x, S08P8 Change Control Money.
- Current coverage: Partial. Change Impact rev 3 has scope debt. No bypass counter.
- Gap: Severity 2.

**UC-EE CR Processing Cost vs Value Threshold**

- Source: S08P8 (CR processing often costs more than the change).
- Current coverage: Not surfaced.
- Gap: Severity 3.

**UC-Q Programme Closeout Readiness (5-component decomposition)**

- Source: S08P10 Programme Closeout.
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-I Contract Lifecycle (MSA, SOW, amendments, renewals, SLA cliffs)**

- Source: S05P1, S04P4 Margin Leak Before Project Started.
- Current coverage: Partial. Multi-Vendor has SLA pass-through. No lifecycle view.
- Gap: Severity 2.

**UC-FF Growth Expansion Tracker (cost centre to growth engine)**

- Source: S05P3 Cost Center to Growth Engine (retail $1.8M to $4.5M).
- Current coverage: Partial. Commercial Pipeline has pipeline TCV. Does not track expansion-from-delivery specifically.
- Gap: Severity 3.

**UC-GG Estimation Negotiation Record (compressed timeline without cost recalc)**

- Source: S08P1 Estimation Negotiation.
- Current coverage: Partial. Delivery Health rev 3 has Estimation Accuracy. No negotiation record.
- Gap: Severity 3.

**UC-HH QBR Quality Score (17-minute alternative to 42-slide theatre)**

- Source: S08P9 Quarterly Review Theatre.
- Current coverage: Partial. Commercial rev 3 QBR Tracker tracks cadence and attestation. Not the quality score.
- Gap: Severity 3.

### Delivery Fundamentals cluster

**UC-X Scope Definition Quality at Kickoff**

- Source: S06P1 Client Did Not Change Scope.
- Current coverage: Not surfaced.
- Gap: Severity 3.

**UC-II Scope Creep Interventions (independent baseline, change compact, week 3 lock)**

- Source: S04P1 Estimation Lie, S04P3 Scope Creep.
- Current coverage: Partial. Change Impact rev 3 has scope debt register. Does not capture the 3 named interventions as checklist items.
- Gap: Severity 3.

**UC-S Over-Optimism Detection (Green-on-Green Flag)**

- Source: S06P2 Status Report Only Goes Up, S06P9 Most Dangerous Person Says On Track, S07A1 Programme That Was Green Until Red.
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-V Transition Planning Readiness (onshore-offshore)**

- Source: S06P7 Offshore Team Did Not Fail.
- Current coverage: Not surfaced.
- Gap: Severity 3.

**UC-L Quality Management and DORA Metrics**

- Source: S07A1 (defect spike in week 14), S01P6 Operating Model thresholds.
- Current coverage: Partial. AI Innovation has AI-defect rate. No DORA, no full defect trend, no test coverage.
- Gap: Severity 2.

**UC-M Structured Problem-Solving (5-Why Tracker)**

- Source: S04P5 (5-Why on healthcare reconciliation).
- Current coverage: Not surfaced.
- Gap: Severity 3.

**UC-N Vendor Definition-of-Done Matrix**

- Source: S04P5 (vendor A vs vendor B data handoff gap).
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-JJ Distributed Delivery Decision Tax (hidden decision cost across time zones)**

- Source: S07A2 Six Timezones (60-word requirement became 4-day debate).
- Current coverage: Not surfaced.
- Gap: Severity 3.

### Stakeholder and Risk cluster

**UC-R Stakeholder Influence Map**

- Source: S06P10 Loudest Stakeholder Always Wins.
- Current coverage: Not surfaced.
- Gap: Severity 2.

**UC-KK Escalation Timing Signal (escalating early vs late)**

- Source: S06P6 Nobody Fired for Escalating Early.
- Current coverage: Partial. Risk and RAID tab has RAID items. Does not score escalation timing.
- Gap: Severity 3.

### AI Governance cluster (distinct from AI adoption)

**UC-O AI Governance Layer (4-phase rollout)**

- Source: S03 Governance in AI Parts 1 through 4, S02P3 Governing AI Teams, S02P4 AI Delivery Operating Model.
- Sub use cases: O1 shadow-IT inventory survey, O2 risk tiering Green/Amber/Red, O3 quality gates per tier, O4 governance reporting cadence, O5 agentic era readiness.
- Current coverage: Partial. AI and Innovation rev 3 has tool inventory and KEEP DROP MERGE. No risk tiering, no quality gates, no governance cadence.
- Gap: **Severity 1.**

**UC-LL Five Problems AI Cannot Solve (estimation, scope, comms, tech debt, team structure)**

- Source: S02P1 What AI Changes.
- Current coverage: Distributed across tabs but not framed as "the five AI cannot solve".
- Gap: Severity 3.

**UC-MM AI Delivery Speed Gap (individual productivity up, delivery speed flat)**

- Source: S02P4.
- Current coverage: Partial. AI Innovation has productivity uplift. No delivery-speed overlay to show the gap.
- Gap: Severity 3.

### Compliance and Audit cluster

**UC-K Audit Trail Explorer**

- Source: Implied across all governance articles; explicit in Security PRD rev 2.
- Current coverage: Backend has audit logging. No UI console.
- Gap: Severity 2.

### Margin Leak Anatomy cluster (cross-cutting)

**UC-NN Five-Leak Margin Anatomy (the 5 leak points with 810 bps compression)**

- Source: S04P4 Margin Leak Before Project Started.
- 5 leak points named: rate card vs blended actual, attrition not rehired at band, scope absorbed silently, vendor overruns unmapped to penalty, license renewal unbudgeted.
- Current coverage: Partial. PnL Cockpit rev 3 has 5-driver waterfall (CR absorbed, scope debt, bench tax, vendor overrun, estimation drift). Maps 4 of 5 leak points but in different framing.
- Gap: Severity 3 (coverage is close enough; a labelling alignment would close it).

### Operating Model Thresholds cluster

**UC-OO Pre-Defined Action Playbook per Threshold Breach**

- Source: S01P6 Operating Model (amber utilisation triggers 24-hour redeployment conversation; CPI red triggers 48-hour scope review; SPI red triggers planning reset; SLA Tier 1 breach-risk triggers escalation).
- Current coverage: Partial. Intelligence layer per tab has What/Why/Act. Actions are named but not the time-bound playbook structure.
- Gap: Severity 2.

**UC-PP Threshold Calibration Register (green/amber/red per metric, with rationale)**

- Source: S01P6 (utilization above 85 percent green because below that bench cost compounds; CPI below 1.0 red because cost overrun becomes structural).
- Current coverage: Design Foundations has palette and state definitions. No register with thresholds and rationale.
- Gap: Severity 3.

## 3. Complete UC inventory count

| Category | Total UCs |
|----------|-----------|
| Governance cluster | UC-A, A1 through A6, Y, Z = 9 |
| Portfolio director cluster | UC-C, D, F, F2, AA, G, H = 7 |
| Capability and people | UC-B, E, E2, J, BB, T = 6 |
| Commercial and PnL | UC-P, U, CC, DD, W, EE, Q, I, FF, GG, HH = 11 |
| Delivery fundamentals | UC-X, II, S, V, L, M, N, JJ = 8 |
| Stakeholder and risk | UC-R, KK = 2 |
| AI governance | UC-O, LL, MM = 3 |
| Compliance and audit | UC-K = 1 |
| Margin leak anatomy | UC-NN = 1 |
| Operating model thresholds | UC-OO, PP = 2 |
| **Total distinct UCs** | **50** |

## 4. Severity distribution across 50 UCs

| Severity | Count | IDs |
|----------|-------|-----|
| 1 | 8 | UC-A (governance canvas), UC-A1 (cadence), UC-A2 (RACI), UC-A3 (escalation contract), UC-B (bench deep dive), UC-D (account concentration), UC-E (DM succession), UC-O (AI governance layer), UC-P (EVM) |
| 2 | 22 | UC-A4, A5, A6, Y, C, F, F2, AA, G, J, U, CC, DD, W, Q, I, S, L, N, R, K, OO |
| 3 | 20 | UC-Z, H, BB, T, E2, EE, FF, GG, HH, X, II, V, M, JJ, KK, LL, MM, NN, PP, Z |

(Severity 1 count changed slightly because UC-A broke into A1/A2/A3/A4/A5/A6 sub-cases. UC-A1, A2, A3 carry severity 1 individually because they are the hardest governance primitives to build. A4/A5/A6 are severity 2 because they are follow-ons.)

## 5. Dashboard coverage map per UC

| UC | Home tab or section | Coverage state at rev 3 | Gap |
|----|---------------------|--------------------------|-----|
| UC-A | Ops and SLA partial; no home | Partial | Sev 1 |
| UC-A1 Cadence Calendar | None | Not surfaced | Sev 1 |
| UC-A2 RACI Matrix | None | Not surfaced | Sev 1 |
| UC-A3 Escalation Contract | Ops and SLA partial | Decision Queue exists, not escalation contract | Sev 1 |
| UC-A4 Steerco Pre-Read | Exports | Steerco Pack is post-meeting; no pre-read | Sev 2 |
| UC-A5 Weekly Commitment Review | None | Not surfaced | Sev 2 |
| UC-A6 Sponsor Engagement Score | None | Not surfaced | Sev 2 |
| UC-Y Decision Queue columns | Ops and SLA | Missing options, recommendation, deferral impact | Sev 2 |
| UC-Z Decision Category split | Ops and SLA | Missing | Sev 3 |
| UC-C Four Instruments | Executive | Not labelled | Sev 2 |
| UC-D Account Concentration | Commercial | Not surfaced | Sev 1 |
| UC-F Portfolio Forecast | Scenario | PERT for what-if only | Sev 2 |
| UC-F2 Friday Forecast Call | None | Not surfaced | Sev 2 |
| UC-AA Portfolio Drift | Executive | Not surfaced | Sev 2 |
| UC-G Board Pack | Exports | Not surfaced (Steerco only) | Sev 2 |
| UC-H First 90 Days Onboarding | None | Not surfaced | Sev 3 |
| UC-B Bench Deep Dive | Workforce plus Financials | Aggregate and Bench Tax exist; no roster | Sev 1 |
| UC-E DM Succession | Workforce | Aggregate Bus Factor only | Sev 1 |
| UC-E2 Retention Conversations | None | Not surfaced | Sev 3 |
| UC-J Hiring Funnel | None | Not surfaced | Sev 2 |
| UC-BB Pyramid AI Shift | Workforce | AI Impact Pyramid Overlay present | Sev 3 (partial) |
| UC-T Margin Literacy per DM | None | Not surfaced | Sev 3 |
| UC-P EVM CPI SPI | Delivery Health or PnL | Not surfaced | Sev 1 |
| UC-U Rate Card Optimisation | Commercial | Not surfaced | Sev 2 |
| UC-CC Utilization Reconciliation | Workforce | Single number only | Sev 2 |
| UC-DD Revenue Leakage 5-mechanism | Financials or PnL | 2 of 5 covered | Sev 2 |
| UC-W Urgent Request Bypass | Change Impact | Not surfaced | Sev 2 |
| UC-EE CR Processing Cost vs Value | Change Impact | Not surfaced | Sev 3 |
| UC-Q Closeout Readiness | Delivery Health or Change Impact | Not surfaced | Sev 2 |
| UC-I Contract Lifecycle | Multi-Vendor | Partial | Sev 2 |
| UC-FF Growth Expansion Tracker | Commercial | Pipeline TCV exists; not expansion-from-delivery | Sev 3 |
| UC-GG Estimation Negotiation Record | Delivery Health | Estimation Accuracy exists, not negotiation record | Sev 3 |
| UC-HH QBR Quality Score | Commercial | QBR cadence exists, not quality score | Sev 3 |
| UC-X Scope Definition Quality | None | Not surfaced | Sev 3 |
| UC-II Scope Creep Interventions | Change Impact | Scope Debt Register exists; no interventions checklist | Sev 3 |
| UC-S Over-Optimism Flag | Executive or Delivery Health | Not surfaced | Sev 2 |
| UC-V Transition Planning | Delivery Health | Not surfaced | Sev 3 |
| UC-L DORA Metrics | Flow and Velocity | Not surfaced | Sev 2 |
| UC-M 5-Why Tracker | Risk and RAID or Change Impact | Not surfaced | Sev 3 |
| UC-N Vendor DoD Matrix | Multi-Vendor | Not surfaced | Sev 2 |
| UC-JJ Distributed Delivery Decision Tax | None | Not surfaced | Sev 3 |
| UC-R Stakeholder Influence Map | Client Health or new governance | Not surfaced | Sev 2 |
| UC-KK Escalation Timing Signal | Risk and RAID | RAID list exists, no timing score | Sev 3 |
| UC-O AI Governance Layer | AI Innovation | Tool Inventory exists; no risk tier, quality gate, cadence | Sev 1 |
| UC-LL Five Problems AI Cannot Solve | None | Distributed, not labelled | Sev 3 |
| UC-MM Delivery Speed Gap | AI Innovation | Productivity uplift only, no delivery-speed overlay | Sev 3 |
| UC-K Audit Trail Console | None | Backend logs exist; no UI | Sev 2 |
| UC-NN Five-Leak Margin Anatomy | PnL Cockpit | 4 of 5 covered in different framing | Sev 3 |
| UC-OO Pre-Defined Action Playbook per Threshold | Intelligence layer per tab | Actions exist, not time-bound playbook | Sev 2 |
| UC-PP Threshold Calibration Register | Design Foundations | Palette and states defined, no register | Sev 3 |

## 6. Coverage statistics

- **Fully covered UCs**: 0 of 50
- **Partially covered UCs**: 22 of 50 (44 percent)
- **Not covered UCs**: 28 of 50 (56 percent)

Of the 8 severity-1 gaps, **zero are fully covered and 3 are partially covered** (UC-A via Decision Queue, UC-B via Workforce aggregates, UC-E via Bus Factor). The other 5 severity-1 gaps (UC-A1, A2, A3, UC-D, UC-O, UC-P) are not surfaced at all.

## 7. Current 15-tab dashboard coverage scorecard

| Tab | UCs fully covered | UCs partially covered | UCs named for this tab but missing |
|-----|-------------------|------------------------|--------------------------------------|
| Executive | 0 | UC-C (as label) | UC-AA, UC-S |
| Delivery Health | 0 | UC-GG (Estimation Accuracy) | UC-P EVM, UC-V Transition, UC-S, UC-Q Closeout |
| Risk and RAID | 0 | UC-KK (RAID list) | UC-M 5-Why, UC-KK timing |
| Workforce Intelligence | 0 | UC-B aggregate, UC-BB overlay, UC-CC (single number) | UC-B roster, UC-E per-DM, UC-T, UC-E2, UC-J |
| Financials | 0 | UC-B Bench Tax, UC-DD unbilled WIP | UC-CC full reconciliation, UC-DD mechanisms 3 to 5 |
| P and L Cockpit | 0 | UC-NN 4 of 5 leak points | UC-P EVM surface, UC-NN label |
| Flow and Velocity | 0 | none | UC-L DORA |
| AI and Innovation | 0 | UC-O tool inventory, UC-MM uplift only | UC-O risk tier, gates, cadence; UC-LL, UC-MM overlay |
| Commercial Pipeline | 0 | UC-HH QBR cadence, UC-FF pipeline TCV | UC-D, UC-U, UC-FF expansion-from-delivery, UC-HH quality score |
| Backlog Health | 0 | none | (no UC specifically home here) |
| Scenario Planner | 0 | UC-F (PERT for what-if) | UC-F portfolio baseline, UC-F2 Friday forecast |
| Ops and SLA | 0 | UC-A3 Decision Queue, UC-Y columns | UC-A1, A2, A4, A5, A6, UC-Y full columns, UC-Z |
| Multi-Vendor | 0 | UC-I partial | UC-I lifecycle, UC-N DoD Matrix |
| Change Impact | 0 | UC-II Scope Debt | UC-W bypass, UC-EE CR cost, UC-Q closeout, UC-X definition |
| Client Health Radar | 0 | Value Realisation | UC-R stakeholder influence |
| Cross-cutting Exports | 0 | UC-A4 Steerco post-meeting | UC-A4 pre-read, UC-G Board Pack |
| Cross-cutting Search | NA | NA | NA |
| Cross-cutting Notifications | NA | NA | NA |
| Cross-cutting History | NA | NA | NA |

Notable vacancy: **no tab currently homes the Governance Operating Model canvas**. The closest is Ops and SLA but it is scoped to SLA and incident ops, not governance as a system.

**No tab currently homes Capability (skills) or Talent Supply Chain (hiring funnel)**. Workforce Intelligence is workforce-operational, not capability-strategic.

## 8. Cross-pattern observations

### Observation 1: 8 of 10 Hub series converge on governance

When you count articles that deal with governance directly or as a root cause, 8 of the 10 drafted series have governance as the theme: S01 (operating model finale), S02P3 (governing AI teams), S03 (governance in AI), S04P2 (steering committee), S04P5 (operating model), S06P4 (governance adds 3 weeks), S07A1 (green until red is a governance failure), S10 (portfolio desk is director-altitude governance). **Governance is the product's spine.** It should arguably be a primary tab, not distributed.

### Observation 2: EVM (CPI, SPI) is absent from a P and L product

The dashboard has P and L Cockpit, Financials, and Scenario Planner. None of them carry CPI or SPI. Delivery PnL Option B Post 06 and Option C Carousel 01 both commit to CPI as a 3-month early warning of margin failure. This is a structural omission at the fundamentals layer.

### Observation 3: AI Governance is not the same as AI Adoption

Current AI and Innovation tab is AI adoption (tool inventory, adoption rate, uplift, defect rate, AI-assist task percent). AI governance (shadow-IT inventory via survey, 3-tier risk classification, quality gates, governance cadence) is a distinct surface. The Hub dedicates a full 4-part Series 03 to AI governance.

### Observation 4: Director altitude is undersupplied

Portfolio Desk Manifesto commits to "the chair where the question is not what to ship next sprint but which of your seven programs will move the quarter". The current Executive tab is useful but does not explicitly render the four portfolio instruments (forecast confidence, account concentration, DM succession, capability heat map).

### Observation 5: Closeout discipline is completely missing

Delivery PnL Option B Post 10 commits to a 5-component closeout decomposition that teaches the next team. There is no closeout surface, no lessons-learned register, no post-mortem capture. A delivery product without closeout discipline is incomplete.

### Observation 6: Intelligence layer is generic, not threshold-specific

S01P6 Operating Model Finale commits to pre-defined time-bound actions per threshold breach (24 hours for utilisation amber, 48 hours for CPI red, etc). Current Intelligence Layer PRD gives tabs What/Why/Act. The time-bound ladder is not structurally surfaced.

### Observation 7: 8 severity-1 gaps are clustered in three themes

The 8 sev-1 items cluster into:
- Governance primitives: UC-A, A1, A2, A3 (4 items)
- People fundamentals: UC-B, E (2 items)
- Missing fundamentals: UC-P EVM, UC-O AI Governance (2 items)
- Strategic-altitude: UC-D Account Concentration (1 item)

If these 8 are closed, the product credibility gate for v1.0.0 launch is met.

## 9. What this document does NOT do

This document does not propose what to build, when, or in what order. It establishes the complete coverage picture. Proposals will follow in a separate document after discussion.

## 10. Next step per Adi's instruction

This is the mapping, complete. The decision on what to build next is deferred to a conversation after review.

---

*Owner: Claude. Status: mapping complete, no changes proposed. Input expected from Adi before wave 6 execution plan.*
