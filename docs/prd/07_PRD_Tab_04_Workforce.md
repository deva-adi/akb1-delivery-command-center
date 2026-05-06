# 07_PRD_Tab_04_Workforce.md
### Workforce Intelligence Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds UC-CC Utilization Reconciliation (3-system gap per S08P4) plus explicit cross-link to v1_17 Capability and Supply Chain for strategic-capability depth. Workforce Intelligence remains operational; strategic capability moves to v1_17 per Wave 5 observation 4. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-1 gap: added Bus Factor per programme, Overtime Hours Trend, and optional 1:1 Sentiment Score. Added AI-impact overlay to the pyramid. Replaced revision 2. Inherits from Master PRD revision 3, Data Model revision 4.

---

## 1. Scope and goals

300-person pyramid, utilisation, bench, attrition radar, flight-risk watchlist, **team sustainability signals**, AI-impact pyramid overlay. Hub framing: "green on metrics, red on reality" is specifically what this tab is designed to detect.

## 2. Role access

| Role | Primary nav? | Access |
|------|--------------|--------|
| Portfolio Owner | Yes | Full |
| Programme Manager | No (via More menu) | Scoped |
| Finance Lead | No | Headline only |
| Read Only | No | Masked (band aggregates only) |

## 3. Data contract

Consumes: `people` revision 3 (with overtime_hours_mtd, last_1on1_sentiment), `allocations`, `programmes`, `team_sustainability_signals` new, `ai_tool_usage` revision 3.

Response: `WorkforceSnapshotResponse` extended with `sustainability` and `ai_pyramid_overlay` sections.

## 4. User stories

Delivery Director spots bus factor declining on Pegasus before the senior exit creates a crisis.
Portfolio Owner sees a programme with green attrition numbers but amber overtime trend and intervenes early.

## 5. KPIs (revised, eight KPIs up from five)

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| Headcount | Count where status = Active | 300 | 275 | N/A | Material week-on-week variance |
| Utilisation | Billable / Available x 100 | 82.0 percent | 77.7 percent | 80 | Below 78 |
| Bench Percent | Bench / Total x 100 | 30 of 300 = 10 percent | 18 of 275 = 6.5 percent | 8 percent | Above 12 |
| Attrition Annualised (Regretted only) | `(Regretted Exits Last 12M / Avg Headcount) x 100` | 9.1 percent | 11.2 percent | Below 10 percent | Above 12 |
| Pyramid Integrity | `1 - abs(actual mix - target mix) x 10` | 8.2 | 7.5 | At or above 8.0 | Below 7.0 |
| **Bus Factor (NEW)** | `Count of people whose simultaneous exit would halt any critical workstream`. Per-programme min | Portfolio min 2 (Pegasus at 1 critical, Phoenix at 2, others 3 or higher) | Portfolio min 3 | At or above 3 per programme | Below 2 on any programme |
| **Overtime Hours Trend (NEW)** | `% of team logging more than 45 hrs/week avg over last 4 weeks` | 18 percent portfolio (Pegasus 62 percent, others less than 25) | 11 percent | Below 20 percent | Above 30 |
| **Team Health Index (NEW)** | Composite: `100 - (Bus Factor penalty x 25) - (Overtime penalty x 15) - (Sentiment penalty x 10)` | 68 on Pegasus, 82 portfolio | 88 | At or above 75 | Below 65 |

Regretted-only attrition (not blended) is the headline. Non-regretted shown as context per Hub framing.

## 6. Views and interactions (revised)

Filter bar plus Band filter, As-of picker. Intelligence layer. Eight KPI cards in 2-row grid. **New Team Sustainability section** surfacing bus factor and overtime per programme. **Pyramid chart with AI-impact overlay** showing which bands are being compressed by AI adoption. Attrition radar 12-month. Watchlist table.

### 6.1 Team Sustainability section layout

| Programme | Bus Factor | Overtime Hours 4W | Sentiment | Health Index | State |
|-----------|-----------|--------------------|-----------|--------------|-------|
| Pegasus Healthcare | 1 (payment module critical) | 62 percent team over 45 hrs | 52 | 41 | Red Intervene |
| Phoenix Pharma | 2 | 31 percent | 58 | 62 | Amber |
| Stellar Logistics | 2 | 24 percent | 61 | 68 | Amber |
| Orion Insurance | 3 | 18 percent | 64 | 78 | Green |
| ... | ... | ... | ... | ... | ... |

### 6.2 AI-Impact Pyramid Overlay

Standard pyramid (B1 to B5 headcount and attrition) with a secondary overlay showing:
- Which bands are being compressed by AI (typically B2 middle tier per Hub Series 2 Part 1)
- AI-assist percentage per band (how much of their work is AI-augmented)
- Band-specific productivity uplift

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Band row | Persons at that band |
| Attrition spike | Exits in that month |
| Watchlist row | Person detail (role-gated) |
| **Bus Factor flag (NEW)** | Programme workstreams with single-point dependencies |
| **Overtime percent (NEW)** | Per-person overtime hours log |
| **Team Health Index (NEW)** | Contributing signal breakdown |
| **AI-impact overlay band (NEW)** | Task-level AI adoption for that band |

## 8. Intelligence layer rules (revised)

`tab_workforce.py` revision 3. Drivers now include team sustainability signals. Actions from Cap (overtime), Backfill (single-point), Rotate (sustainability), Promote, Reassign, Release, Hire. Hub voice: "standard KPIs stay green while the team is failing. Bus factor shrinking is the #1 most-expensive miss."

## 9. Non-functional

Pyramid render under 100 ms. Sustainability section under 150 ms. AI overlay calc under 200 ms.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/workforce/pyramid` | Band breakdown |
| GET | `/api/v1/workforce/pyramid/ai-overlay` | NEW. AI compression per band |
| GET | `/api/v1/workforce/attrition-trend?months=12` | Trend chart |
| GET | `/api/v1/workforce/watchlist?threshold=70` | Flight risk |
| GET | `/api/v1/workforce/utilisation` | Utilisation |
| GET | `/api/v1/workforce/sustainability` | NEW. Bus factor and overtime per programme |
| GET | `/api/v1/intelligence/workforce` | What Why Act |

## 11. Error and empty states

No bus factor data → "Not yet assessed" prompt.
All programmes healthy → "All programmes above bus factor 3 threshold" celebration.

## 12. Accessibility

Pyramid bar chart has data table alternative. Names never rendered for Read Only. AI overlay colour plus icon redundancy.

## 13. Test acceptance

Playwright: Pegasus bus factor 1 flagged red, overtime 62 percent red, Team Health Index 41, sustainability section visible. AI-impact overlay shows B2 compression of 30 percent on ai-active programmes.

## 14. Release gating

Wireframe v1_04 revision 3 parity. Role masking preserved. Team sustainability signals seeded deterministically.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-1 gaps Bus Factor and Overtime Trend, plus severity-2 AI-specific pyramid modelling.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 New KPI: Utilization Max Gap (UC-CC)

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Utilization Max Gap (points) | `max(abs(hr_system_pct - finance_system_pct), abs(hr_system_pct - delivery_system_pct), abs(finance_system_pct - delivery_system_pct))` per programme latest month | 7.2 pts on Pegasus (red), 3.8 pts on Phoenix (amber) | 1.4 pts on Orion (green) | Below 3.0 | At or above 7.0 | `utilization_max_gap_points` |

Sources from `utilization_reconciliation` table. Threshold from `threshold_calibration_register`.

### R4.2 New section: Utilization Reconciliation (UC-CC)

New section below the existing Utilization KPI card. Per-programme three-column view showing HR System, Finance System, Delivery System percent. Reconciled percent and max gap in points called out. Reconciliation method text and reconciled_by name displayed on expand. Per S08P4: three systems, three numbers, 7-point gap is the pattern.

Layout: list by programme, sortable by max_gap_points descending. Red zebra-stripe on rows with gap above 7. Click a row to see 12-month trend of the 3 system values.

### R4.3 Cross-link to v1_17 Capability and Supply Chain

Workforce Intelligence at rev 4 remains operational (headcount, utilisation, bench aggregate, team sustainability, AI pyramid overlay). Strategic capability (bench deep dive by person, skills heat map, DM succession, hiring funnel, margin literacy) moves to v1_17. Cross-link banner at the top of v1_04 for PO, DD, HRBP roles: "For strategic capability depth including bench roster, DM succession, and hiring funnel, see Capability and Supply Chain."

Bench aggregate KPI cross-link drills to v1_17 Bench Deep Dive panel. AI Impact Pyramid cross-link drills to v1_17 Pyramid Shift view.

### R4.4 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Utilization Max Gap KPI | Utilization Reconciliation section |
| Reconciliation row | Three-system 12-month trend |
| Bench Aggregate KPI | v1_17 Bench Deep Dive |
| AI Impact Pyramid Overlay | v1_17 Pyramid Shift view |
| Team Sustainability card | Unchanged rev 3 drill |

### R4.5 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/workforce/utilization-reconciliation?programme={code}` | Per-programme reconciliation |
| GET | `/api/v1/workforce/utilization-reconciliation/{programme}/trend?months=12` | 3-system trend |

### R4.6 Intelligence layer rules (revision 4 additions)

`tab_workforce.py` revision 4. New trigger:
- Utilization max gap above 7 points: action "Run reconciliation between HR, Finance, and Delivery within 7 days. Log reconciliation method and reconciled percent."

### R4.7 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with Utilization Reconciliation section and cross-link banner.
2. Two new endpoints contract-match.
3. Max gap calculation matches worked example in R4.1.
4. Cross-link to v1_17 verified for PO, DD, HRBP roles; hidden for PM role.
5. Playwright scenario: login as PO, Pegasus utilization gap card reads 7.2 points red, drill opens Reconciliation section.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-CC utilization reconciliation and establishes strategic-capability cross-link to v1_17.*
