# 13_PRD_Tab_10_Backlog_Health.md
### Backlog Health Tab | AKB1 Delivery Command Center v1

> Inherits from Master PRD, Data Model PRD, Intelligence Layer PRD, Security PRD, Design Foundations.

---

## 1. Scope and goals

Backlog aging histogram, Definition of Ready compliance per programme, epic readiness score, groom cadence tracking. Programme Manager's backlog grooming companion.

## 2. Role access

| Role | Access |
|------|--------|
| Portfolio Owner | Full |
| Programme Manager | Primary |
| Finance Lead | No |
| Read Only | Full read |

## 3. Data contract

Consumes: new entity `backlog_items` with status, age, DoR compliant flag, epic link, programme.
Response: `BacklogHealthResponse` with aging buckets, DoR per programme, groom status, summary table.

## 4. User stories

Scrum Master sees backlog health score before sprint planning.
Programme Manager catches stale epics before the client PO notices.

## 5. KPIs

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| Total Backlog | `Count of items status != Done` | 1,847 | 1,520 | N/A | Growth > 20% MoM |
| Aging > 60 days | `Count where age > 60 / Total x 100` | 312 / 1847 = 16.9% | 220 / 1520 = 14.5% | Below 12% | Above 20% |
| DoR Compliance | `Items Meeting DoR / Top-of-Backlog Items x 100` | 68% | 75% | 85% | Below 65% |
| Epic Readiness | `Weighted score across epic DoR, dependencies, sized` | 7.1/10 | 7.8/10 | 8.0 | Below 6.5 |
| Groom Cadence Missed | `Count of programmes missing groom last sprint` | 3 of 10 | 1 of 10 | 0 | At or above 3 |

## 6. Views and interactions

Filter bar plus Item Type. Intelligence layer. Five KPI cards. Backlog aging histogram 4 buckets. DoR compliance bars per programme ranked. Programme backlog summary table with total, epics, ready count, DoR percent, groom status, health chip.

## 7. Drill paths

| From | To |
|------|-----|
| Aging bucket | Items in that bucket |
| DoR bar | Items failing DoR criteria |
| Programme row | Backlog kanban for that programme |

## 8. Intelligence layer rules

`tab_backlog_health.py`. Drivers by grooming saturation, epic blockers, cadence drift. Actions from Cap, Escalate, Enforce, Replan verbs.

## 9. Non-functional

Histogram aggregation under 100 ms for 1,847 items.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/backlog/aging-histogram` | 4 buckets |
| GET | `/api/v1/backlog/dor-compliance` | Per programme |
| GET | `/api/v1/backlog/programme-summary` | Full table |
| GET | `/api/v1/intelligence/backlog_health` | What Why Act |

## 11. Error and empty states

Fresh programme with no backlog → "Start grooming" empty state.

## 12. Accessibility

Aging histogram data table alternative. Status chips have text.

## 13. Test acceptance

Playwright: Pegasus backlog at 342 items with 25 percent aging, DoR at 41 percent, critical health chip shown.

## 14. Release gating

Wireframe v1_10 parity.

---

*Wireframe: `docs/wireframes/v1_10_Backlog_Health.html`. Owner: Claude. Signoff: Adi.*
