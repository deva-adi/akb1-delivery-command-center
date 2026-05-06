# 10_PRD_Tab_07_Flow_Velocity.md
### Flow and Velocity Tab | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 adds UC-L DORA metrics section (deployment frequency, lead time for changes, change failure rate, MTTR) per S07A1 defect-spike pattern and DORA Accelerate convention. Inherits from Master PRD revision 3, Data Model PRD revision 4, Intelligence Layer PRD revision 2 pending rev 3 cascade, Security PRD revision 2 pending rev 3 cascade, Design Foundations revision 4.

---

## 1. Scope and goals

Throughput, cycle time, WIP limits, flow efficiency, cumulative flow diagram. Sprint-level detail for Programme Manager.

## 2. Role access

| Role | Access |
|------|--------|
| Portfolio Owner | Full |
| Programme Manager | Primary, scoped |
| Finance Lead | No |
| Read Only | Full read |

## 3. Data contract

Consumes: `deliverables` (as stories), `programmes`. WIP state derived from deliverable status.
Response: `FlowSnapshotResponse` with CFD stacks, WIP vs limit, sprint table.

## 4. User stories

Scrum Master sees WIP breaches before daily standup.
Programme Manager trends velocity across 8 sprints to predict release date.

## 5. KPIs

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| Throughput | `Stories Completed / Sprint` | 84 stories | 94 stories | 85% of capacity | Below 70% |
| Cycle Time | `Avg days from Start to Done per story` | 8.2 days | 6.4 days | Below 7 | Above 10 |
| WIP Breach | `Count of programmes where WIP > limit` | 4 of 10 | 2 of 10 | 0 | At or above 3 |
| Flow Efficiency | `Active Time / (Active Time + Wait Time) x 100` | 42% | 51% | 55% | Below 40% |
| Lead Time p85 | `85th percentile of Lead Time` | 18.6 days | 12.4 days | Below 14 | Above 20 |

## 6. Views and interactions

Filter bar plus Team filter. Intelligence layer. Five KPI cards. CFD showing backlog, in-progress, review, done over 8 sprints. WIP vs limit bars per programme. Sprint-by-sprint table with velocity, cycle, flow efficiency.

## 7. Drill paths

| From | To |
|------|-----|
| CFD band | Specific state and sprint |
| WIP bar | Stories currently over limit |
| Sprint row | Sprint retrospective data |

## 8. Intelligence layer rules

`tab_flow_velocity.py`. Drivers from WIP breach, queue buildup, environment instability. Actions from Cap, Unblock, Stabilise, Replan verbs.

## 9. Non-functional

CFD aggregation under 200 ms for 8 sprints.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/flow/cfd?sprints=8` | CFD data |
| GET | `/api/v1/flow/wip-compliance` | WIP bars |
| GET | `/api/v1/flow/sprint-table` | Sprint history |
| GET | `/api/v1/intelligence/flow_velocity` | What Why Act |

## 11. Error and empty states

No sprint in progress → "Between sprints" message.

## 12. Accessibility

CFD has data table alternative. WIP breach status has text indicator.

## 13. Test acceptance

Playwright: Pegasus WIP shown over limit with red bar, CFD In-Progress band widens visibly in late sprints.

## 14. Release gating

Wireframe v1_07 parity.

---

*Wireframe: `docs/wireframes/v1_07_Flow_Velocity.html`. Owner: Claude. Signoff: Adi.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 New KPIs: DORA Metrics (UC-L)

Four new KPIs sourced from `dora_metrics` entity:

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| DORA Deployment Frequency | `deployment_frequency_per_day (latest month per programme)` | 2.4 per day on Orion (Elite), 0.3 per day on Pegasus (Medium) | 8.1 per day (Elite) | At or above 1.0 per day | Below 0.1 per day (once per 10 days) | PRD-local at v1 |
| DORA Lead Time for Changes | `lead_time_for_changes_days (latest month)` | 5.8 days on Orion (High), 28 days on Phoenix (Medium) | 2.4 days (Elite) | Below 7 | At or above 30 | `dora_lead_time_days` |
| DORA Change Failure Rate | `change_failure_rate_pct (latest month)` | 11 percent on Orion (High), 34 percent on Pegasus (Low) | 4 percent (Elite) | Below 15 | At or above 30 | `dora_change_failure_rate_pct` |
| DORA MTTR | `mttr_hours (latest month)` | 3.6 hours on Orion (Elite), 14 hours on Phoenix (Medium) | 0.8 hours (Elite) | Below 4 | At or above 24 | PRD-local at v1 |

DORA band generated column classifies each programme: Elite, High, Medium, Low per DORA Accelerate Report convention.

### R2.2 New section: DORA Metrics panel

Rendered between the existing CFD and Sprint table sections. Four-card layout with the 4 DORA KPIs. Below: a 12-month trend chart toggleable across the 4 metrics. Band chip per programme shown on the right of the panel. Drill from any card opens the programme list sorted by that metric.

Per S07A1 the defect spike at week 14 was detectable in DORA change failure rate; this surface makes that pattern visible.

### R2.3 Drill paths (revision 2 additions)

| From | To |
|------|-----|
| DORA Deployment Frequency KPI | Programme list sorted by deployment frequency |
| DORA Lead Time KPI | Programme list sorted by lead time |
| DORA Change Failure KPI | Programme list with failure rate trend; cross-link to v1_02 Delivery Health defect detail |
| DORA MTTR KPI | Programme list sorted by MTTR; cross-link to v1_12 Ops and SLA incident detail |
| DORA band chip | Programme single-view with all 4 metrics trend |

### R2.4 Endpoints (revision 2 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/flow/dora?programme={code}` | DORA metrics single programme |
| GET | `/api/v1/flow/dora-portfolio` | Portfolio DORA summary |
| GET | `/api/v1/flow/dora-trend?programme={code}&months=12` | DORA trend series |

### R2.5 Intelligence layer rules (revision 2 additions)

`tab_flow_velocity.py` revision 2. New triggers:
- DORA Lead Time red: action "Review pipeline bottleneck; unblock review queue."
- DORA Change Failure red: action "Freeze new story starts. Audit last 10 changes for common failure mode."
- DORA Band drop from Elite or High to Medium or Low: action "Escalate to Programme Manager; potential signal of underlying instability per S07A1."

### R2.6 Release gating (revision 2 additions)

Tab revision 2 ships when:
1. Wireframe cascades to rev 2 with DORA panel.
2. Three new endpoints contract-match.
3. DORA band generated column matches DORA Accelerate thresholds.
4. Playwright scenario: Orion shows Elite band on all 4 metrics, Pegasus shows Medium or Low with amber or red chips.
5. Voice regression: DORA-red actions fire correctly.

---

*Revision 2 owner: Claude. Signoff: Adi (pending). Adds UC-L DORA metrics.*
