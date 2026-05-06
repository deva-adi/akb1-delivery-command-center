# 17_PRD_Tab_14_Change_Impact.md
### Change Impact Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds six use cases to this tab: UC-W Urgent Request Bypass (S06P8 3x multiplier), UC-EE CR Processing Cost vs Value Threshold (S08P8), UC-Q Closeout Readiness 5-component (S08P10), UC-X Scope Definition Quality at Kickoff (S06P1), UC-II Scope Creep Interventions (S04P1, S04P3), UC-JJ Distributed Delivery Decision Tax (S07A2). Largest single-tab cascade in Phase 4. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-1 gap: added Scope Debt as second tracked dimension distinct from scope creep. Scope creep equals unplanned additions. Scope debt equals undelivered promises accumulating silently. Two different margin killers, two different tracking dimensions. Replaced revision 2.

---

## 1. Scope and goals

100 change requests plus Scope Debt register. Margin before versus after per programme. Approval-margin versus realised-margin delta. Scope Debt volume and origin classification. Hub Proposition D Article 1 thesis: "scope creep gets attention; scope debt kills silently."

## 2. Role access

| Role | Primary nav? | Access |
|------|--------------|--------|
| Portfolio Owner | No (More menu) | Full |
| Programme Manager | No (More menu) | Scoped |
| Finance Lead | Yes (primary) | Full |
| Read Only | Yes | Full read |

## 3. Data contract

Consumes: `change_requests` revision 2, `scope_debt` NEW revision 3, `financials_monthly`, `programmes`.

Response: `ChangeImpactResponse` extended with `scope_debt_register` section.

## 4. User stories

Finance Lead spots scope debt accumulating on Pegasus before it compounds into margin crisis.
Portfolio Owner enforces repricing discipline (scope creep) AND debt repayment discipline (scope debt).
Finance Lead identifies the difference between "scope added and repriced" (healthy) and "promises undelivered" (unhealthy).

## 5. KPIs (revised, eight up from six)

| KPI | Formula | Example | Target | Alert |
|-----|---------|---------|--------|-------|
| Total CRs 12M | Count opened | 100 | N/A | Growth > 25 percent YoY |
| Approved Repriced | Count status Approved_Repriced | 62 (+USD 1.24M margin) | At or above 70 percent of approved | Below 60 |
| Approved Absorbed | Count status Approved_Absorbed | 18 (-USD 520K margin) | Below 5 percent of approved | Above 15 |
| Pending Approval | Count status Pending | 12 (avg age 14 days) | Below 10 and under 7d avg | Age > 14d |
| Margin Leakage MTD | Sum of negative margin_impact this month | USD 520K | Below USD 300K | Above USD 500K |
| Approval-Realised Delta | Sum(margin_at_approval_pct - margin_realised_pct) weighted | -2.4 pp (USD 480K shortfall on 62 repriced CRs) | 0 to -1.0 pp | Worse than -2.5 pp |
| **Scope Debt Volume (NEW)** | Sum of scope_debt.effort_days where status IN (Open, PlannedToRepay) | 312 person-days (Pegasus 148, Phoenix 102, Stellar 62) | Below 100 person-days portfolio | Above 400 |
| **Scope Debt Margin Impact (NEW)** | Sum of scope_debt.margin_impact_usd where status != Repaid | USD 680K across 40 debt items | Below USD 250K | Above USD 900K |

## 6. Views and interactions (revised)

Filter bar plus Status, Source, Origin (scope debt), As-of picker. Intelligence layer. Eight KPI cards. Margin before versus after per programme. CR velocity trend. Unpriced CR watchlist.

**New section: Scope Debt Register.** Table showing all scope debt items with origin chip, title, programme, effort days, margin impact, status, client acknowledgement.

**New section: Approval-Realised Delta Table.** From revision 2, unchanged.

### 6.1 Scope Debt Register layout

| Origin chip | Title | Programme | Effort days | Margin impact | Status | Client acknowledged |
|-------------|-------|-----------|-------------|---------------|--------|---------------------|
| Undelivered Promise | Legacy data migration module | Pegasus Healthcare | 84 | USD 180K | Open | No |
| Workaround | Manual reconciliation for API gap | Pegasus Healthcare | 42 | USD 95K | PlannedToRepay | Yes |
| Rework Tax | Performance tuning round 2 | Phoenix Pharma | 36 | USD 78K | Open | No |
| ... | ... | ... | ... | ... | ... | ... |

Three origin types: Undelivered Promise (committed but not delivered), Workaround (technical debt masking a gap), Rework Tax (rework beyond initial estimate).

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Programme delta bar | CRs for that programme |
| CR watchlist row | Full CR detail |
| Velocity point | CRs in that month |
| Approval-Realised row | CR decomposition |
| **Scope Debt item (NEW)** | Debt item drawer with origin, impact, repayment plan |
| **Scope Debt Origin chip (NEW)** | All items of that origin across portfolio |

## 8. Intelligence layer rules (revised)

`tab_change_impact.py` revision 3. Drivers include scope debt volume growth, unacknowledged debt percentage, rework tax trend. Actions from Reprice, Escalate, Replan, Tighten, **Repay** (new for scope debt), **Acknowledge** (new for client-acknowledgement gap). Hub voice: "scope creep gets tracked; scope debt kills silently."

## 9. Non-functional

Before-after query under 200 ms. Scope debt register under 150 ms.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/change-impact/margin-delta-per-programme` | Before-after |
| GET | `/api/v1/change-impact/velocity?months=12` | Trend |
| GET | `/api/v1/change-impact/unpriced-watchlist` | Top absorbed |
| GET | `/api/v1/change-impact/approval-vs-realised` | Delta table |
| GET | `/api/v1/change-impact/scope-debt-register` | NEW. Debt items with origin, impact, status |
| GET | `/api/v1/change-impact/scope-debt-summary` | NEW. Aggregated per programme and origin |
| GET | `/api/v1/intelligence/change_impact` | What Why Act |

## 11. Error and empty states

No scope debt → "No scope debt recorded. Confirm with programme managers weekly" prompt.
No unpriced CRs → healthy state.

## 12. Accessibility

Origin chips have text plus colour. Debt status chips same.

## 13. Test acceptance

Playwright: Pegasus scope debt 148 person-days visible, Phoenix 102, debt register filters by origin, margin impact totals USD 680K.

## 14. Release gating

Wireframe v1_14 revision 3 parity. Scope debt entity seeded with the 40 items defined in Data Model revision 3 section 5.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-1 Scope Debt gap.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 New KPIs

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Urgent Bypass Rate | `Count(urgent_request_bypass WHERE bypass_flag) / Count(urgent_request_bypass) x 100 trailing 90 days per programme` | 32 percent on Pegasus (red), 18 percent on Phoenix (amber) | 4 percent (green) | Below 10 | At or above 25 | `urgent_bypass_rate_pct` |
| CR Processing Ratio (avg) | `Avg(cr_processing_cost.ratio) trailing 90 days per programme` | 0.58 on Pegasus (red) | 0.18 (green) | Below 0.25 | At or above 0.50 | `cr_processing_ratio` |
| Closeout Readiness Percent | `Sum(closeout_readiness WHERE status IN Complete, Waived) / Sum(closeout_readiness) x 100 per programme (active programmes)` | 42 percent on Stellar (red, early) | 86 percent (green) | At or above 85 | Below 60 | `closeout_readiness_pct` |
| Scope Definition Score | `scope_definition_quality.definition_score_at_kickoff per programme` | 48 on Pegasus (red), 72 on Phoenix (amber) | 82 (green) | At or above 75 | Below 50 | `scope_definition_score` |

### R4.2 New section: Urgent Bypass Tracker (UC-W)

Rendered below the existing scope creep section. List of urgent requests where `bypass_flag = true`. Columns: Programme, Request ID, Raised At, Rework Cost USD, Multiplier Applied, Status. Multiplier column visually prominent (3.0x chip per S06P8). Total rework cost for the quarter called out as a headline above the list.

Per S06P8: "every urgent request costs 3x." This surface quantifies the pattern.

### R4.3 New section: CR Processing Cost vs Value (UC-EE)

Scatter plot. X is change_value_usd. Y is processing_cost_usd. Diagonal line y = 0.5x drawn. Dots above the line are threshold_breach_flag true (processing eats more than half the change value). Hover shows CR ID, processing hours, role-hours breakdown. Click opens CR detail.

Per S08P8: a CR that costs more than it is worth. Dot cluster above the diagonal surfaces the pattern.

### R4.4 New section: Closeout Readiness (UC-Q)

5-component panel. One component per S08P10 framing: FinancialCloseout, ScopeCloseout, ResourceTransition, KnowledgeTransfer, LessonsLearned. Each component shows progress percent per programme. Click a component to see the checklist items with status, owner, evidence.

Programmes nearing closeout are filterable. Portfolio-level closeout readiness percent rolls up.

### R4.5 New section: Scope Definition Quality at Kickoff (UC-X)

Per-programme card. Shows definition_score_at_kickoff, open_questions_count, deliverables_with_dod_pct, acceptance_criteria_present_pct, stakeholder_signoff_obtained_bool. Low scores (below 50) flagged red; narrative_text surfaces as a tooltip with the S06P1 "client did not change scope, you did not define it" voice.

Rendered at the top of the tab as a signal strip per programme because kickoff quality predicts downstream scope chaos.

### R4.6 New section: Scope Creep Interventions Checklist (UC-II)

Per-programme checklist with the three named interventions:
1. Independent Baseline (applied at kickoff)
2. Change Compact (agreed with client)
3. Week 3 Lock (scope frozen at week 3)

Each row: applied boolean, applied_at, effectiveness_score, owner, evidence. Applied green, not applied red. Click a row to see evidence text.

Per S04P1 and S04P3: the three interventions, measurable.

### R4.7 New section: Distributed Delivery Decision Tax (UC-JJ)

Table. Rows are decisions with `distributed_decision_tax` entries. Columns: Decision Title, Time Zones Involved, Iterations, Hours Elapsed, Net Decision Minutes, Tax Ratio, Narrative. Sorted by tax_ratio descending. The S07A2 60-word requirement to 4-day debate pattern is the worst-case row at the top.

### R4.8 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Urgent Bypass Rate KPI | Urgent Bypass Tracker |
| Tracker row | CR detail with multiplier applied |
| CR Processing Ratio KPI | CR Processing scatter |
| Scatter dot above line | CR detail with role-hours breakdown |
| Closeout Readiness KPI | 5-component panel |
| Component | Checklist with items |
| Checklist item | Evidence, owner, completed_at |
| Scope Definition KPI | Per-programme signal strip |
| Strip card | Kickoff narrative detail |
| Scope Creep Interventions row | Evidence text |
| Decision Tax row | Iteration log and narrative |

### R4.9 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/change-impact/urgent-bypass?programme={code}` | Tracker list |
| GET | `/api/v1/change-impact/cr-processing-cost` | Scatter data |
| GET | `/api/v1/change-impact/closeout-readiness?programme={code}` | 5-component panel |
| GET | `/api/v1/change-impact/scope-definition-quality` | Strip cards |
| GET | `/api/v1/change-impact/scope-creep-interventions?programme={code}` | Checklist |
| GET | `/api/v1/change-impact/distributed-decision-tax` | Tax table |

### R4.10 Intelligence layer rules (revision 4 additions)

`tab_change_impact.py` revision 4. New triggers:
- Urgent Bypass Rate red: action "Audit change control discipline. Per S06P8 the 3x multiplier is real."
- CR Processing Ratio red: action "Review CR intake rules. Processing cost exceeding change value signals broken process."
- Closeout Readiness below 60 with programme within 60 days of go-live: action "Escalate to Portfolio Owner; closeout will slip."
- Scope Definition Score red at kickoff: action "Cancel sprint 1, redo requirements workshop. Per S06P1 this is the cheapest fix point."
- Scope Creep Intervention not applied at week 3: action "Apply Week 3 Lock intervention before scope drifts further."
- Distributed Decision Tax Ratio above 10: action "Reduce round-trip count with async decision template."

### R4.11 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with all 6 new sections.
2. Six new endpoints contract-match.
3. Urgent Bypass 3.0x multiplier applied consistently to rework_cost_usd calculations.
4. CR Processing scatter diagonal drawn at y = 0.5x.
5. Closeout 5-component roll-up matches `closeout_readiness.component` enum.
6. Scope Definition Score threshold bands match register.
7. Scope Creep Interventions capture applied boolean and evidence.
8. Distributed Decision Tax ratio formula matches Data Model section 4.57 generated column.
9. Playwright scenario: Pegasus shows all 6 sections populated; Stellar closeout at 42 percent red; Pegasus scope definition score 48 red.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Largest Phase 4 cascade: adds UC-W, EE, Q, X, II, JJ.*
