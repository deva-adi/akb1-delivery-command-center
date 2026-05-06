# 04_PRD_Tab_01_Executive.md
### Executive Overview Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 closes UC-C (Four Portfolio Instruments label layer) and UC-AA (Portfolio Drift cross-link). Adds role-differentiated subtitle per Design Foundations rev 4 R4.10. All KPIs now source thresholds from `threshold_calibration_register`. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-1 gaps: added Decision Velocity KPI and Value Realisation KPI. Replaced revision 2. Inherits from Master PRD revision 3, Data Model revision 4, Intelligence Layer revision 2 pending rev 3 cascade, Security revision 2 pending rev 3 cascade, Design Foundations revision 4.

---

## 1. Scope and goals

Primary tab for Portfolio Owner. Single-view portfolio snapshot. Revision 3 adds two Hub-critical dimensions (Decision Velocity, Value Realisation) alongside the existing five KPIs.

## 2. Role access

Unchanged from revision 2. Portfolio Owner primary, Read Only full read, PM and Finance Lead via More menu.

## 3. Data contract

Consumes: `programmes`, `financials_monthly` revision 2, `allocations`, `raid`, `sla_metrics`, `deliverables`, `decisions` revision 3, `value_realisation` new.

Response: `ExecutiveSnapshotResponse` extended with `decision_velocity` and `value_realisation` sections.

## 4. User stories

Portfolio Owner Monday 9 AM sees the portfolio, the stuck decisions, and the value-realisation gap in one view.
Portfolio Owner sees a programme that is green on margin but amber on value realisation, triggers a QBR.

## 5. KPIs (revised, seven KPIs up from five)

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| Gross Margin | `(Revenue Booked - Direct Cost) / Revenue Booked x 100` | 21.15 percent on 31.2M / 24.6M, dashboard shows 19.2 blended | 21.29 percent | 21 percent | Below 20 |
| Net Margin | `(Revenue Booked - Direct Cost - Indirect Cost - Contingency Draw) / Revenue Booked x 100` | 13.2 percent | 14.1 percent | 15 percent | Below 12 |
| Utilisation | `Billable Hours / Available Hours x 100` | 82.0 percent | 77.7 percent | 80 percent | Below 78 |
| On-Time Delivery | `Milestones On Time / Total x 100` | 87.0 percent | 92.0 percent | 92 percent | Below 85 |
| RAID Severity Index | `(Crit x 10 + High x 5 + Med x 2 + Low x 1) / Count / 10` | 6.4 | 5.4 | Below 5.0 | At or above 7.0 |
| **Decision Latency (NEW)** | `Avg(closed_at - opened_at) in days for decisions closed last 30 days` | 9.3 days (14 in queue, 7 past SLA) | 2.1 days (4 in queue, 0 past SLA) | Below 2 days | At or above 7 days |
| **Value Realisation Score (NEW)** | `Avg(value_realisation_score) across programmes captured last quarter` | 62 out of 100 (6 achieved, 2 partial, 2 not) | 85 (9 achieved, 1 partial) | At or above 70 | Below 60 |

### 5.1 Decision Latency worked detail

From `decisions` table: `SELECT AVG(decision_latency_days) FROM decisions WHERE closed_at >= now() - interval '30 days'` clamped to non-negative. Open decisions ageing > SLA contribute to the count but not the average until closed.

### 5.2 Value Realisation worked detail

From `value_realisation` table: score is 100 if `outcome_achieved AND client_confirmed`, 50 if `outcome_achieved AND NOT client_confirmed`, 25 if partial outcome noted, 0 if `NOT outcome_achieved`. Portfolio score is weighted average by programme TCV.

## 6. Views and interactions (revised)

Filter bar with Geo, Programme, Vendor, Time Window, As-of date. Intelligence layer per Design Foundations 11.1 revision 3 (Hub-aligned). **Seven KPI cards** in a 7-column layout on wider viewports or 4-and-3 rows on 1280px. **New Decision Queue section** showing top 5 stuck decisions with age and owner. **New Value Realisation section** showing per-programme score with QBR link. Charts: portfolio gross margin line 12 months, programme state grid. Top 5 high-severity risks. Related tabs row.

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Gross Margin KPI | Financials margin decomposition |
| Net Margin | P and L Cockpit waterfall |
| Utilisation | Workforce utilisation by programme |
| On-Time | Delivery Health milestone detail |
| RAID Index | Risk and RAID matrix |
| **Decision Latency (NEW)** | Ops and SLA Decision Queue section |
| **Value Realisation (NEW)** | Client Health Radar intervention playbook |
| Decision Queue row | Single decision drawer with history |
| Value Realisation per programme | QBR detail on Commercial Pipeline |
| Steerco Pack | 5-slide PowerPoint export |

## 8. Intelligence layer rules (revised)

`tab_executive.py` revision 3. Drivers now include decision latency contribution and value realisation contribution when they exceed 10 percent of margin variance. Hub voice framing: "we saw this in amber and we are steering". Action cards use verbs from Design Foundations 12 including new verb `Clear` (decision queue) and `Book` (QBR).

## 9. Non-functional

Page load under 2 seconds at 500 concurrent. Decision Queue query under 100 ms. Value Realisation calc under 100 ms.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/executive/snapshot` | Full tab payload including decision velocity and value realisation |
| GET | `/api/v1/intelligence/executive` | What Why Act |
| GET | `/api/v1/decisions/queue?limit=5` | NEW. Top stuck decisions |
| GET | `/api/v1/value-realisation/portfolio` | NEW. Current value realisation score |
| GET | `/api/v1/financials/margin-decomposition` | Drill target |
| GET | `/api/v1/programmes/{code}/summary` | Programme drawer |
| POST | `/api/v1/exports/pptx/steerco-pack` | Steerco Pack |

## 11. Error and empty states

Decision queue empty (healthy state) → "Decision queue clear, 0 items past SLA" celebration card.
No value realisation captured yet → "Start quarterly value reviews to populate" prompt.

## 12. Accessibility

Decision queue row keyboard-accessible. Value realisation state chip uses text plus colour.

## 13. Test acceptance

Playwright: login as Portfolio Owner, verify 7 KPIs render, Decision Queue shows 14 open with 7 past SLA, Value Realisation section shows 62 score, drill from Decision Latency opens Ops and SLA queue, drill from Value Realisation opens Client Health.

## 14. Release gating

Tab ships when wireframe v1_01 revision 3 parity matches, seven endpoints contract-match, intelligence voice test green with Hub framing, Playwright green on new scenarios.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-1 gaps Decision Velocity (KPI plus surface) and Value Realisation (KPI plus surface).*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 Role access

Primary now includes Delivery Director (DD) alongside Portfolio Owner. DD sees the same surface with scope limited to own delivery org. HR Business Partner (HRBP) has no access. Audit Permission (AP) flag does not affect this tab.

### R4.2 Subtitle rendering (per Design Foundations R4.10)

For Portfolio Owner and Delivery Director roles, the tab subtitle reads "The director sees across. The delivery manager walks each one." For Programme Manager role, the rev 3 subtitle stands ("What has changed and what do I do this week"). Role-aware render is client-side.

### R4.3 Four Portfolio Instruments label layer (UC-C)

The Executive rev 3 surface already carries the four primary instruments. Revision 4 labels them explicitly per Portfolio Desk Manifesto framing. Labels rendered as a small header above each instrument group:

| Instrument label | Rev 3 source surface | Entity dependency |
|------------------|----------------------|---------------------|
| Forecast Confidence | Scenario Planner cross-link on the Executive | `portfolio_forecast` |
| Account Concentration | New card group added at R4.5 below | `account_concentration` |
| DM Succession | Workforce Intelligence cross-link on the Executive | `dm_succession_signals` |
| Capability Heat Map | New card group added at R4.5 below | `skill_demand_signals`, `skills_inventory` |

Labels are not interactive; they anchor the cognitive model that the Hub Portfolio Desk Manifesto commits to.

### R4.4 Portfolio Drift cross-link (UC-AA)

New KPI card added for Portfolio Drift. Formula sourced from `portfolio_drift_signals` daily snapshot. Cross-link drills to v1_16 Governance Operating Model which homes the full Portfolio Drift view.

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) |
|-----|---------|-----------|-----------|----------------|-------------|
| Portfolio Drift Delta | `portfolio_drift_signals.delta_pct (latest as_of_date)` | 2.4 pp (amber) with all_programmes_green flag true | 0.6 pp (green) | Below 1.0 | At or above 3.0 |

Thresholds source from `threshold_calibration_register` metric_id `portfolio_drift_delta_points`.

### R4.5 New Executive card groups

Two new card groups introduced as part of UC-C label layer:

| Card group | Cards |
|-----------|-------|
| Account Concentration (NEW) | Concentration Band distribution, top 3 clients by revenue share, Expansion Headroom USD, Dependency Risk Score portfolio average |
| Capability Heat Map summary (NEW) | Programme-Critical Skill Gap count, Bench Headcount, DM Succession Coverage percent |

Both card groups cross-link: Account Concentration to v1_09 Commercial Pipeline rev 4; Capability Heat Map to v1_17 Capability and Supply Chain.

### R4.6 KPI threshold register binding

All seven rev 3 KPIs plus the rev 4 Portfolio Drift KPI now source green, amber, red thresholds from `threshold_calibration_register`. Hardcoded thresholds removed. The metric_id binding is:

| KPI | metric_id |
|-----|-----------|
| Gross Margin | `portfolio_margin_pct` |
| Net Margin | `programme_margin_pct` (cross-refs) |
| Utilisation | `utilization_pct` |
| On-Time Delivery | no direct register entry; retains PRD-local rev 3 threshold |
| RAID Severity Index | no direct register entry; retains PRD-local rev 3 threshold |
| Decision Latency | `decision_latency_days` |
| Value Realisation Score | `value_realisation_score` |
| Portfolio Drift Delta (NEW) | `portfolio_drift_delta_points` |

On-Time Delivery and RAID Severity Index will be added to the register in a post-v1.0.0 cycle; they retain local thresholds until then.

### R4.7 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Portfolio Drift Delta KPI | v1_16 Governance Operating Model Portfolio Drift view |
| Account Concentration card group | v1_09 Commercial Pipeline rev 4 Account Concentration Map |
| Capability Heat Map card group | v1_17 Capability and Supply Chain Skills Heat Map |
| Four Instrument labels | Anchor only, not clickable |

### R4.8 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/executive/portfolio-drift-summary` | Headline drift KPI value |
| GET | `/api/v1/executive/account-concentration-summary` | Card group payload |
| GET | `/api/v1/executive/capability-summary` | Card group payload |

Total endpoints at rev 4: 10 (was 7 at rev 3).

### R4.9 Intelligence layer rules (revision 4 additions)

`tab_executive.py` revision 4. Drivers now include Portfolio Drift contribution when delta_pct exceeds 1.0 percentage points. When `all_programmes_green_flag = true` AND `delta_pct >= 3.0`, the Why column opens with "Every programme is green. The portfolio is bleeding." per S10 Portfolio Desk.

### R4.10 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe `v1_01_Executive.html` cascades to rev 4 with the four labels and new cards.
2. Three new endpoints contract-match.
3. Portfolio Drift Delta KPI renders with register-sourced thresholds.
4. Playwright scenario added: login as PO, see Portfolio Drift amber with all_programmes_green flag, drill to v1_16.
5. Role-aware subtitle render verified for PO, DD, and PM.
6. Voice regression asserts "Every programme is green. The portfolio is bleeding." appears when drift condition fires.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-C label layer, UC-AA portfolio drift cross-link, role-aware subtitle, threshold register binding.*
