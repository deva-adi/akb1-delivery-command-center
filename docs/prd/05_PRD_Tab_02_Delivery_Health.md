# 05_PRD_Tab_02_Delivery_Health.md
### Delivery Health Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds UC-P EVM section (CPI, SPI, TCPI, EAC, VAC), UC-GG estimation negotiation record, UC-V transition planning readiness, UC-S over-optimism flag on Delivery Health. Cross-links to v1_16 Governance Operating Model added. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-2 gap: added Estimation Accuracy KPI with Silent Baseline variance detection per Hub Proposition C Article 1 ("Estimation is not a guess, it is a discipline with baselines"). Estimation variance exposed at programme and portfolio level so drift is caught before it compounds. Replaced revision 2.

> Inherits from Master PRD revision 3, Data Model PRD revision 4, Intelligence Layer PRD revision 2 pending rev 3 cascade, Security PRD revision 2 pending rev 3 cascade, Design Foundations revision 4.

---

## 1. Scope and goals

Sprint cadence, milestone adherence, delivery on-time, blocker trend, CSAT per programme. Converts delivery signal into programme-level intervention actions. **New in revision 3: Estimation Accuracy KPI plus Silent Baseline variance detection.**

## 2. Role access

| Role | Access |
|------|--------|
| Portfolio Owner | Full |
| Programme Manager | Scoped to assigned programmes |
| Finance Lead | View only on headline KPIs plus estimation accuracy |
| Read Only | Full read |

## 3. Data contract

Consumes: `programmes`, `deliverables`, `allocations`, `raid`, `incidents` (P1 for blocker count), **`estimation_baselines` NEW revision 3** (baseline estimate, actual effort, variance, reason code).

Response: `DeliveryHealthResponse` with per-programme on-time percent, velocity, blockers, milestone list, **estimation accuracy per programme**, **silent baseline variance flag**.

## 4. User stories

Programme Manager opens Monday morning, sees velocity trend and slipping milestones in one view.
Portfolio Owner catches the programme with 3-sprint velocity decline before the client does.
Programme Manager sees Pegasus estimation accuracy at 63 percent (target 85 percent) and identifies systematic under-estimation of integration effort; reforms sprint planning cadence.
Portfolio Owner spots Silent Baseline drift on Phoenix: baseline was 140 person-days, current actuals trending 188 person-days with no CR raised. Flags it.

## 5. KPIs (revised, seven up from five)

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| On-Time Delivery | `Milestones Delivered On Time / Total Milestones x 100` | 87 of 100 → 87.0% | 45 of 50 → 90.0% | 92% | Below 85% |
| Sprint Velocity | `Story Points Completed / Sprint Days` | 72 points / 10 days = 7.2 pts/day | 84 points / 10 days = 8.4 pts/day | 80% of capacity | Below 70% |
| Milestone Adherence | `On-Schedule Milestones / Planned Milestones x 100` | 83 of 100 → 83.0% | 92 of 100 → 92.0% | 90% | Below 85% |
| Open Blockers | `Count of blockers age > 3 days` | 14 open, cross-team | 8 open | Below 10 | Above 15 |
| CSAT Score | `Weighted average of client survey responses` | Avg 4.2 of 5 across 8 surveys | Avg 4.5 | At or above 4.5 | Below 4.0 |
| **Estimation Accuracy (NEW)** | `1 - abs(actual_effort_days - baseline_effort_days) / baseline_effort_days, averaged across closed deliverables in period, expressed as percentage` | Pegasus: baseline 140, actual 188 → 1 - abs(188-140)/140 = 1 - 0.343 = 65.7%, rounded to **66% (below target, red)** | Helix: baseline 90, actual 96 → 1 - abs(96-90)/90 = 1 - 0.067 = 93.3%, rounded to **93% (green)** | At or above 85% | Below 75% |
| **Silent Baseline Variance (NEW)** | `Count deliverables where abs(actual - baseline) / baseline > 0.20 AND no CR raised in period` | Phoenix 3 deliverables in silent drift totalling 54 extra person-days not repriced | Orion 0 silent drifts (healthy) | 0 | At or above 2 |

Silent Baseline interpretation: when actuals diverge more than 20 percent from baseline AND no Change Request was raised, the project is absorbing scope silently. This is the margin leakage early warning.

## 6. Views and interactions (revised)

Filter bar plus As-of. Intelligence layer (voice sample from Design Foundations 11.2). **Seven KPI cards** in two-row grid. Velocity trend 8 sprints (line). On-time by programme (10 bar rows, ranked). Top 5 slipping milestones table. **New section: Estimation Accuracy per programme** showing baseline vs actual variance trend and a badge for Silent Baseline drift flag.

### 6.1 Estimation Accuracy per programme table

| Programme | Baseline days | Actual days | Variance | Accuracy | Silent drift flag |
|-----------|---------------|-------------|----------|----------|-------------------|
| Pegasus Healthcare | 1,200 | 1,616 | +34.7% | **66% (red)** | **3 deliverables unpriced** |
| Phoenix Pharma | 980 | 1,176 | +20.0% | 80% (amber) | **2 deliverables unpriced** |
| Stellar Logistics | 720 | 828 | +15.0% | 85% (green) | 0 |
| Helix Retail OMS | 450 | 482 | +7.1% | 93% (green) | 0 |
| ... | ... | ... | ... | ... | ... |

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Velocity chart | Programme sprint history |
| On-time bar | Programme milestone list |
| Slipping milestone row | Recovery plan drawer |
| **Estimation row (NEW)** | Deliverable list with baseline and actual per item |
| **Silent drift badge (NEW)** | Unpriced deliverable list with CR opportunity flag, route to Change Impact tab |

## 8. Intelligence layer rules (revised)

`tab_delivery_health.py` revision 3. Driver decomposition: velocity decline contribution, staffing gap contribution, environment instability contribution, **estimation discipline contribution**. Actions from Rebuild, Cap, Stabilise, Unblock, **Baseline** (new, establish estimation baseline), **Reprice** (new, convert silent drift to CR) verbs. Hub voice from Proposition C Article 1.

## 9. Non-functional

Same as Executive. Velocity chart aggregation under 150 ms. Estimation accuracy query under 200 ms for 10 programmes.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/delivery/snapshot` | Tab payload |
| GET | `/api/v1/delivery/velocity?programme=X&sprints=8` | Velocity chart |
| GET | `/api/v1/delivery/on-time` | Ranked on-time per programme |
| GET | `/api/v1/delivery/slipping-milestones` | Top 5 ranked by slip days |
| GET | `/api/v1/delivery/estimation-accuracy-per-programme` | NEW. Accuracy plus silent drift |
| GET | `/api/v1/delivery/silent-baseline-drifts` | NEW. Unpriced variance list |
| GET | `/api/v1/intelligence/delivery_health` | What Why Act |

## 11. Error and empty states

No sprint data for filter → show skeletal sprint row with message. No baselines captured → "No estimation baselines recorded. Establish baselines at sprint 0" prompt.

## 12. Accessibility

Velocity chart has table alternative. Status badges announce. Trend arrows have text labels. Estimation variance uses text plus colour.

## 13. Test acceptance

Playwright: filter changes rebuild the chart, Pegasus 3-sprint decline visible, drill to milestone works. Pegasus estimation accuracy 66 percent in red, silent drift badge shows 3 deliverables, drill routes to Change Impact filtered view.

## 14. Release gating

Wireframe v1_02 revision 3 parity. Estimation baselines entity seeded per Data Model revision 3.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-2 Estimation Accuracy plus Silent Baseline gap. Wireframe: `docs/wireframes/v1_02_Delivery_Health.html` revision 3 pending cascade.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 New KPIs from rev 4 data model

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| CPI | `ev_usd / ac_usd from latest evm_snapshots per programme` | 0.92 on Pegasus (amber), 1.04 on Orion (green) | 0.82 on Phoenix (red) | At or above 0.95 | Below 0.85 | `cpi` |
| SPI | `ev_usd / pv_usd from latest evm_snapshots per programme` | 0.88 on Pegasus (amber) | 0.82 on Phoenix (red) | At or above 0.95 | Below 0.85 | `spi` |
| Transition Readiness | `readiness_pct on latest transition_plan per programme` | 78 on Stellar (amber), 92 on Helix (green) | 64 on Pegasus (red) | At or above 85 | Below 70 | `transition_readiness_pct` |
| Over-Optimism Flag count | `Count(over_optimism_flags WHERE green_on_green_flag = true AND as_of_week within trailing 8 weeks)` | 3 programmes fired (red), 1 fired (amber) | 0 fired (green) | 0 | 3 or more | `over_optimism_green_streak_weeks` (count proxy) |

All source from `threshold_calibration_register`. Per S08P6 CPI is the 3-month early warning of margin failure; per S01P6 CPI below 0.95 triggers 48-hour scope review.

### R4.2 New section: EVM (UC-P)

New mid-tab section titled "Earned Value" renders a 4-up EVM Quartet (per Design Foundations R4.11 new component). Cards: CPI, SPI, TCPI, EAC. Below, a 12-month line chart per programme toggleable across CPI and SPI with amber and red bands from the register. BAC, AC, EV, PV numeric table for the selected programme. Drill path from any card opens v1_06 P and L Cockpit EVM cross-surface.

### R4.3 New section: Estimation Negotiation Record (UC-GG)

Adds to the existing Estimation Accuracy rev 3 section. Table with columns: Programme, Baseline Effort, Agreed Effort, Compression Percent, Cost Recalc Done, Margin Impact Forecast, Risks Acknowledged. Sorted by compression_pct descending. Rows where cost_recalc_done_bool is false rendered with amber row-strip.

### R4.4 New section: Transition Planning Readiness (UC-V)

New section "Transition Planning". Table row per active transition. Columns: Programme, Transition Type, Transition Date, Readiness Percent, Dwell Time Days, Post-Transition Defect Rate, State. State pill: Planning, Executing, Validated, RolledBack. Drill to single-transition detail with checklist completion breakdown.

### R4.5 New section: Over-Optimism Flag (UC-S)

Rendered as a compact signal strip at the top of the tab above the intelligence layer. Shows count of programmes currently firing green_on_green_flag. Click opens programme list with consecutive_green_weeks and prediction_vs_actual_variance. Cross-link to v1_16 Governance Operating Model Over-Optimism Portfolio view.

### R4.6 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| CPI card | v1_06 P and L Cockpit EVM cross-surface |
| SPI card | Programme milestone schedule detail |
| Transition Readiness card | Transition Planning section |
| Over-Optimism strip | v1_16 Governance Operating Model Over-Optimism Portfolio view |
| Estimation Negotiation row | Single-negotiation detail with risks acknowledged text |
| Transition row | Single-transition detail with checklist breakdown |

### R4.7 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/delivery-health/evm-snapshot?programme={code}` | EVM Quartet for a programme |
| GET | `/api/v1/delivery-health/evm-portfolio` | Portfolio EVM roll-up |
| GET | `/api/v1/delivery-health/estimation-negotiations` | Negotiation record list |
| GET | `/api/v1/delivery-health/transitions` | Active and recent transitions |
| GET | `/api/v1/delivery-health/transition/{id}` | Single transition detail |
| GET | `/api/v1/delivery-health/over-optimism-strip` | Signal strip payload |

### R4.8 Intelligence layer rules (revision 4 additions)

`tab_delivery_health.py` revision 4. New triggers:
- CPI below 0.85 OR SPI below 0.85: action "Open scope review within 48 hours per S01P6 threshold."
- Transition readiness below 70: action "Delay cutover or add 2 week dwell extension."
- Over-optimism flag fires: action "DM review of weekly variance; acknowledge green-on-green pattern with evidence or reset baseline."
- Estimation compression above 20 percent without cost_recalc: action "Recalc cost and forecast margin impact within 5 business days."

### R4.9 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with EVM Quartet, Transition Planning, Over-Optimism strip.
2. Six new endpoints contract-match.
3. EVM computation matches Data Model rev 4 generated-column formula (CPI, SPI, TCPI, EAC, VAC from `evm_snapshots`).
4. Transition plan readiness_pct generated column matches derivation.
5. Over-optimism strip fires correctly per `green_on_green_flag` logic.
6. Playwright scenario: login as PO, see 3 programmes with over-optimism flag, drill to v1_16 Governance.
7. Voice regression: "Open scope review within 48 hours" action appears on CPI-red cards.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-P EVM, UC-GG estimation negotiation, UC-V transition planning, UC-S over-optimism flag. Wireframe cascade pending Phase 6.*
