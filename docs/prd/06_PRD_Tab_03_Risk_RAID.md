# 06_PRD_Tab_03_Risk_RAID.md
### Risk and RAID Tab | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 adds UC-KK Escalation Timing Signal and UC-M Five-Why Register per Wave 5 mapping. RAID taxonomy at Risk, Assumption, Issue, Dependency locked in D-013 stands. Inherits from Master PRD revision 3, Data Model PRD revision 4, Intelligence Layer PRD revision 2 pending rev 3 cascade, Security PRD revision 2 pending rev 3 cascade, Design Foundations revision 4.

---

## 1. Scope and goals

150 open RAID items across the portfolio, heat-mapped by programme and severity. Severity index, aging buckets, mitigation on-time percent. Top 10 high-severity risks with owners and mitigation dates.

## 2. Role access

| Role | Access |
|------|--------|
| Portfolio Owner | Full |
| Programme Manager | Scoped |
| Finance Lead | View headline only |
| Read Only | Full read |

## 3. Data contract

Consumes: `raid`, `programmes`.
Response: `RAIDSnapshotResponse` with matrix, counts by severity, mitigation metrics, top 10 list.

## 4. User stories

PMO Head runs weekly governance review with every high-severity risk visible in 30 seconds.
Portfolio Owner tracks aging risks before they become issues.

## 5. KPIs

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| Open RAID | `Count of status IN (Open, Escalated)` | 150 items | 112 | N/A | Above 180 |
| High Severity | `Count where severity IN (Critical, High)` | 18 | 12 | Below 15 | Above 20 |
| Aging > 30 days | `Count where age > 30 and status = Open` | 7 | 4 | Below 5 | Above 10 |
| Severity Index | `(Crit x 10 + High x 5 + Med x 2 + Low x 1) / Count / 10` | `(30+75+108+78)/150/10 = 6.4` | `(10+50+80+60)/111/10 = 5.4` | Below 5.0 | At or above 7.0 |
| Mitigation On-Time | `Mitigated Before Due / Mitigated Total x 100` | 42 of 60 → 70% (dash shows 71%) | 55 of 60 → 91.7% | 85% | Below 75% |

## 6. Views and interactions

Filter bar. Intelligence layer. Five KPI cards. RAID heat map (10 programmes x High, Medium, Low). Stacked area trend 12 weeks. Top 10 high-severity risks table with age, severity chip, mitigation due.

## 7. Drill paths

| From | To |
|------|-----|
| Heat map cell | Filtered risk list |
| Risk row | Full risk drawer with history |
| Trend spike | Week detail |

## 8. Intelligence layer rules

`tab_risk_raid.py`. Drivers ranked by severity and aging. Actions from Escalate, Mitigate, Accept, Transfer verbs.

## 9. Non-functional

Heat map renders under 200 ms for 10 x 3 cells.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/raid/matrix` | Heat map |
| GET | `/api/v1/raid/trend?weeks=12` | Stacked area |
| GET | `/api/v1/raid/top?severity=High&limit=10` | Top 10 |
| GET | `/api/v1/raid/{raid_id}` | Single item detail |
| GET | `/api/v1/intelligence/risk_raid` | What Why Act |

## 11. Error and empty states

No risks for filter → "No risks in this slice" with suggestion to widen filter.

## 12. Accessibility

Heat map accessible via keyboard. Colour not sole signal (numeric values and text labels). Severity chip has text.

## 13. Test acceptance

Playwright: matrix renders, Phoenix critical cell highlighted, drill opens drawer. Contract test on `/api/v1/raid/matrix`.

## 14. Release gating

Wireframe v1_03 parity, drill integrity test green.

---

*Wireframe: `docs/wireframes/v1_03_Risk_RAID.html`. Owner: Claude. Signoff: Adi.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 New KPIs (revision 2)

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Escalation Timing Late Percent | `Count(escalation_timing WHERE category = Late) / Count(escalation_timing) x 100 trailing 90 days` | 34 percent (red) | 12 percent (green) | Below 15 | At or above 30 | `escalation_timing_late_pct` |
| Systemic Root Cause Count | `Count(five_why_register WHERE systemic_flag = true AND resolution_at IS NULL)` | 8 (red) | 1 (green) | Below 3 | At or above 6 | no register entry yet, uses PRD-local |

Thresholds source from `threshold_calibration_register` for Escalation Timing Late. Systemic Root Cause Count will be added to register in a post-v1.0.0 cycle.

### R2.2 New section: Escalation Timing Signal (UC-KK)

New section rendered below the existing heat map. Distribution bar chart with categories Early, OnTime, Late, NeverEscalated. Shows RAIDs with associated `escalation_timing` rows over trailing 90 days. Click a category bar to see the RAID list filtered. Per S06P6 framing: nobody fired for escalating early.

Layout: horizontal bar chart to the left, category counts table to the right. Trend sparkline under each category bar shows 6-month category share trend.

### R2.3 New section: Five-Why Register (UC-M)

New section rendered below Escalation Timing. Table view of all RAIDs with `five_why_register` rows. Columns: RAID Title, Severity, Why 1 Summary, Root Cause, Systemic Flag, Resolution Date. Row colour: red when systemic_flag true and resolution_at null. Click a row to see the full 5-why ladder expanded.

New row action: "Open 5-Why Analysis" on any RAID without an existing entry launches a guided workflow capturing Why 1 through Why 5 and the root cause text.

### R2.4 Drill paths (revision 2 additions)

| From | To |
|------|-----|
| Escalation Timing Late KPI | Escalation Timing section |
| Escalation Timing bar | Filtered RAID list |
| Systemic Root Cause count | Five-Why Register filtered systemic_flag true |
| 5-Why ladder row | Expanded 5-why with why_1 through why_5 text |
| RAID row in any panel | "Open 5-Why Analysis" action when no entry exists |

### R2.5 Endpoints (revision 2 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/raid/escalation-timing` | Escalation timing distribution |
| GET | `/api/v1/raid/escalation-timing?category={cat}` | Filtered by category |
| GET | `/api/v1/raid/five-why-register` | All 5-why entries |
| GET | `/api/v1/raid/five-why/{raid_id}` | Single 5-why ladder |
| POST | `/api/v1/raid/five-why/{raid_id}` | Create or update 5-why entry, audited |

### R2.6 Intelligence layer rules (revision 2 additions)

`tab_risk_raid.py` revision 2. New triggers:
- Escalation Timing Late percent red: action "Review escalation culture with DMs. Per S06P6 nobody fired for escalating early."
- Systemic Root Cause count above 3: action "Pattern detected across programmes. Open cross-programme root cause review."
- Unresolved 5-why entry older than 30 days: action "Assign resolution owner and due date."

### R2.7 Release gating (revision 2 additions)

Tab revision 2 ships when:
1. Wireframe `v1_03_Risk_RAID.html` cascades to rev 2.
2. Five new endpoints contract-match.
3. Escalation Timing distribution matches `escalation_timing` category enum.
4. 5-Why entry create audits through `audit_trail_entries`.
5. Playwright scenario: open 5-why workflow for an existing RAID, fill 5 whys and root cause, save, verify audit entry written.

---

*Revision 2 owner: Claude. Signoff: Adi (pending). Adds UC-KK escalation timing and UC-M 5-why register.*
