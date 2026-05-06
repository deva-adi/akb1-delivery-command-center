# 25_PRD_Tab_18_AI_Governance.md
### AI Governance Tab | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> New primary tab introduced at Master PRD revision 3. Absorbs 3 Hub use cases covering AI governance as a distinct surface from AI adoption (v1_08 AI and Innovation). Inherits from Master PRD revision 3, Data Model PRD revision 4, Intelligence Layer PRD revision 2 pending rev 3 cascade, Security PRD revision 2 pending rev 3 cascade, Design Foundations revision 4.

---

## 1. Scope and goals

Primary tab for Portfolio Owner (with Audit Permission) and Delivery Director (with Audit Permission). Governance surface for AI in delivery: shadow IT inventory, risk tier classification, quality gates per tier, governance reporting cadence, agentic-era readiness. Distinct from v1_08 AI and Innovation which is adoption-tracking (tool inventory, uplift, defect rate, AI-assist task percent).

Hub anchor: S03 Governance in AI Parts 1 through 4 (4-phase rollout, 3-tier risk classification, quality gates, governance cadence), S02P3 (governing AI teams), S02P4 (AI delivery operating model), S02P1 (five problems AI cannot solve).

Use cases absorbed: UC-O (AI governance layer 4-phase), UC-LL (five problems AI cannot solve), UC-MM (AI delivery speed gap: individual productivity up, throughput flat).

## 2. Role access

Primary: Portfolio Owner (PO) and Delivery Director (DD). AI governance is PO or DD altitude.
Audit Permission (AP) flag required for full access on `ai_use_case`, `ai_quality_gate`, `ai_governance_cadence`, and `ai_shadow_survey`. PO or DD without AP sees aggregate KPIs only, not per-use-case detail.
Finance Lead (FL) read on AI Governance Cadence for reporting to Risk Committee.
Programme Manager (PM) read on own-programme AI Use Cases only. No access to Shadow Survey results or Quality Gate evidence.
HR Business Partner (HRBP) no access.
Read Only (RO) read on aggregate KPIs only.

Row-level filtering on `ai_use_case.programme_id` enforces PM scope.

## 3. Data contract

Consumes: `ai_use_case`, `ai_quality_gate`, `ai_governance_cadence`, `ai_shadow_survey`, `ai_five_unsolvable`, `ai_delivery_speed_gap`, `ai_tools` (from rev 2), `ai_defect_attribution` (from rev 3), `programmes`, `people` (for approver names and risk committee members).

Response: `AIGovernanceResponse` with sections: risk_tier_matrix, quality_gates_per_tier, governance_cadence_view, shadow_inventory_trend, five_unsolvable_panel, delivery_speed_gap_panel, pending_red_tier_backlog, approval_aging_view.

## 4. User stories

Portfolio Owner Monday 9 AM sees the AI risk tier distribution, spots 8 Red-tier use cases in Pending approval, sees the shadow IT discoveries from the last quarterly survey, checks the governance cadence next report date, and spots the Delivery Speed Gap indicator showing individual productivity up 25 percent but end-to-end throughput up only 7 percent.

Delivery Director reviews the Red-tier pending backlog. Clears 3 bias assessments for the customer-facing response generator use cases on Phoenix. Re-validates 2 stale Quality Gates on Helix. Triggers the next monthly Shadow Survey earlier than quarterly because of rising shadow IT signal.

Portfolio Owner moves governance reporting cadence for AI use cases from quarterly to monthly, audits the change to `audit_trail_entries`, and publishes the new cadence to Risk Committee.

Programme Manager reviews own-programme AI use cases, sees 3 Amber-tier cases requiring human-in-loop, verifies the evidence URLs are populated before the next programme review.

Finance Lead subscribes to the AI Governance Cadence report and sees the metrics_reported_json for the last cycle. Checks alignment with the quarterly Risk Committee agenda.

## 5. KPIs (four KPIs plus surfaced counts)

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | Owner |
|-----|---------|-----------|-----------|----------------|-------------|-------|
| AI Risk Red Count | `Count(ai_use_case WHERE risk_tier = Red)` | 20 at seed (10 programmes) | 5 at production | 0 | At or above 4 | PO with AP |
| AI Quality Gate Pass Rate | `Count(ai_quality_gate WHERE status = Passed) / Count(ai_quality_gate WHERE status IN Passed, Failed) x 100` | 88 percent (amber) | 97 percent (green) | At or above 95 | Below 85 | PO with AP |
| AI Shadow Discovery Count | `ai_shadow_survey.tools_previously_unknown_count (latest survey)` | 5 (quarter 4) | 2 (quarter 4) | Below 3 | At or above 10 | PO with AP |
| AI Delivery Speed Gap Points | `Avg(gap_points) across programmes last month` | 18 points (amber) | 6 points (green) | Below 10 | At or above 25 | PO |

Surfaced counts (not KPIs but shown prominently):
- Red-tier Pending approval count
- Amber-tier Pending human-in-loop verification count
- Red-tier use cases without completed bias assessment count
- AI Governance Cadence reports overdue count

### 5.1 AI Risk Red Count worked detail

Select `ai_use_case` where `risk_tier = 'Red'`. Count. The seed at v1.0.0 places 20 Red-tier across 10 programmes, concentrated on Phoenix (customer-facing generators) and Helix (clinical decision support). Production target is zero but a small Red count can be acceptable when every Red has completed quality gates.

### 5.2 AI Quality Gate Pass Rate worked detail

Pass Rate considers only gates in terminal states (Passed or Failed). In-progress, waived, and not-started gates are excluded from the denominator. 88 percent pass rate at seed means approximately 528 of 600 gates passed on terminal-state rows.

### 5.3 AI Delivery Speed Gap worked detail

For each programme monthly: `gap_points = individual_productivity_uplift_pct - delivery_speed_change_pct`. Portfolio level: mean across programmes for the current month. Per S02P4, individual productivity uplift above 20 points with delivery speed below 10 is a structural signal that productivity is being absorbed by governance, comms, handoffs, or tech debt (the five AI cannot solve).

## 6. Views and interactions

Filter bar: Programme, Tool, Task Category, Data Sensitivity, Risk Tier, Approval Status, Time Window.

Intelligence layer per Design Foundations rev 4 R4.9.3. Voice: "AI governance is distinct from AI adoption."

Layout: 4 KPI cards top row, 8 panels below.

### 6.1 AI Risk Tier Matrix panel

Grid. Rows are programmes, columns are risk tiers (Green, Amber, Red). Cells show count of use cases. Cell colour: tier colour with count overlay. Click a cell to see the use case list filtered. Red tier rows render with the 4px gold left-edge treatment per Design Foundations R4.4 if `approval_status = Pending`.

### 6.2 Quality Gates per Tier panel

Rollup by tier. Green tier shows 0 to 1 required gate per use case, Amber 1 to 2, Red 3 mandatory. For each tier: total gates, passed, failed, in-progress, waived. Waived count flagged amber (waivers require PO approval).

### 6.3 Governance Cadence view

Calendar-style. 4 cadence rows (Weekly DM, Monthly Steerco, Quarterly RiskCommittee, Annual Board). Next report date, status (OnTime, Slipping, Missed), last report date. Click a cadence to see metrics_reported_json history.

### 6.4 Shadow Inventory Trend panel

Line chart. X axis quarters, Y axis tools_previously_unknown_count. Trend shows whether shadow IT is increasing (governance immature) or decreasing (governance maturing). Recent quarter always highlighted. Drill to survey details.

### 6.5 Five Unsolvable panel

Radar chart. Five axes (Estimation, Scope, Communications, TechDebt, TeamStructure). For each axis, the count of programmes where `status = NotAddressed` is the distance from centre. Per S02P1: if you are expecting AI to solve these, you are pointing the tool at the wrong problem.

### 6.6 Delivery Speed Gap panel

Dual-line chart. X is month, Y is percent. Two lines: Individual Productivity Uplift and Delivery Speed Change. Gap shaded. When gap exceeds 25 points, the gap is highlighted red. Per-programme detail on click. Narrative text box shows the primary_constraint_text from the latest row.

### 6.7 Pending Red-Tier Backlog panel

Table. Red-tier use cases where `approval_status = Pending`. Columns: Programme, Tool, Task Category, Data Sensitivity, Open Gates, Oldest Gate Days, Assigned Approver. Sorted by Oldest Gate Days descending. Action button "Schedule Bias Assessment" for use cases with bias_assessment gate not started.

### 6.8 Approval Aging view

Histogram. X is days since use case submission. Y is count. Bucket colours shift from green (under 14 days) to amber (14 to 30) to red (above 30). Surfaces governance throughput bottlenecks.

## 7. Drill paths

| From | To |
|------|-----|
| AI Risk Red Count KPI | Risk Tier Matrix filtered Red |
| AI Quality Gate Pass Rate KPI | Quality Gates per Tier panel |
| AI Shadow Discovery KPI | Shadow Inventory Trend panel plus latest survey detail |
| AI Delivery Speed Gap KPI | Delivery Speed Gap panel |
| Risk Tier Matrix cell | Use case list filtered to programme and tier |
| Quality Gate row | Gate evidence drawer with URL, verifier, last verified date |
| Cadence row | Historical metrics_reported_json browser |
| Shadow Survey data point | Survey detail with disclosures and newly discovered tools |
| Five Unsolvable axis | Programme list where problem_enum is NotAddressed for that axis |
| Delivery Speed Gap month | Programme detail with primary_constraint_text |
| Pending Red-tier row | Use case detail with all gates, approver chain, and evidence |
| Approval Aging bucket | Use case list filtered to that age bucket |
| Governance Cadence OnTime or Slipping badge | `ai_governance_cadence` row with next_report_date |

## 8. Intelligence layer rules

`tab_ai_governance.py` revision 1. Reads thresholds from `threshold_calibration_register` for the 4 cluster metrics. Actions sourced from `action_playbook`. Hub voice framing: "AI governance is distinct from AI adoption."

Triggers:
- AI Risk Red Count red: action "Clear the N Pending Red-tier backlog; assign bias assessments within 7 days."
- Quality Gate Pass Rate red: action "Re-validate stale gates on the named programmes within 14 days."
- Shadow Discovery Count red: action "Move Shadow Survey from quarterly to monthly and publish results to steerco."
- Delivery Speed Gap above 25 points: action "Identify primary_constraint_text dominant pattern and book a cross-programme review on handoffs or tech debt."
- Governance cadence status Missed: action "Escalate missed report to Risk Committee chair."
- AI Unsolvable NotAddressed count above 3: action "Re-plan programme against the five problems AI cannot solve."

Rules-only default. LLM polish opt-in.

## 9. Non-functional

Page load under 2.5 seconds at 500 concurrent on pre-warmed cache. Risk Tier Matrix render under 200 ms for 10 programmes x 3 tiers. Quality Gate rollup query under 250 ms for 600 gates. Shadow Inventory Trend chart under 150 ms for 4 quarters. Delivery Speed Gap chart under 250 ms for 12 months x 10 programmes.

Use case drawer load under 400 ms including gates, evidence URLs, approver chain.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/ai-governance/snapshot` | Full tab payload |
| GET | `/api/v1/ai-governance/risk-tier-matrix` | Risk grid |
| GET | `/api/v1/ai-governance/quality-gates` | Gates rollup |
| GET | `/api/v1/ai-governance/cadence` | Cadence view |
| GET | `/api/v1/ai-governance/shadow-inventory` | Trend data |
| GET | `/api/v1/ai-governance/shadow-survey/{survey_id}` | Survey detail |
| GET | `/api/v1/ai-governance/five-unsolvable` | Radar data |
| GET | `/api/v1/ai-governance/delivery-speed-gap` | Gap time series |
| GET | `/api/v1/ai-governance/pending-red-backlog` | Pending Red list |
| GET | `/api/v1/ai-governance/approval-aging` | Aging histogram |
| GET | `/api/v1/ai-governance/use-case/{id}/drawer` | Use case drawer |
| GET | `/api/v1/ai-governance/quality-gate/{id}/evidence` | Gate evidence |
| PATCH | `/api/v1/ai-governance/use-case/{id}/approval` | Approve or reject, audited |
| PATCH | `/api/v1/ai-governance/quality-gate/{id}/status` | Update gate status, audited |
| PATCH | `/api/v1/ai-governance/cadence/{id}/frequency` | Change cadence frequency, audited |
| POST | `/api/v1/ai-governance/shadow-survey/trigger` | Trigger ad-hoc shadow survey, audited |
| GET | `/api/v1/intelligence/ai-governance` | What Why Act |

Total: 17 endpoints. PATCH and POST endpoints audit. Approval endpoint requires PO or DD with AP flag.

## 11. Error and empty states

No Red-tier use cases (healthy): "Zero Red-tier AI use cases in Pending. AI governance is deciding." Celebration card.
No shadow discoveries: "Shadow survey this quarter found zero undisclosed tools. Governance is current." Celebration card.
No delivery speed gap: "Individual productivity and delivery throughput are aligned. No absorption signal." Celebration card.
Non-AP user viewing Red count: aggregate number shown, detail drill blocked with "Audit Permission required to view per-use-case detail."
Governance cadence missed: "Weekly DM report missed. Reassign owner and escalate to Risk Committee."

## 12. Accessibility

Risk Tier Matrix has table alternative for screen readers. Radar chart in Five Unsolvable has tabular alternative. Histograms and line charts carry data labels visible to screen readers. Gate evidence drawer is keyboard-navigable.

axe-core zero WCAG AA violations required at release gate.

## 13. Test acceptance

Playwright scenarios:
- Login as PO with AP, verify 4 KPIs render, verify 8 panels render.
- Login as PO without AP, verify aggregate KPIs render, verify Red tier detail drill is blocked with explanation.
- Filter Risk Tier Matrix by Risk Tier = Red, verify grid filters.
- Click Pending Red-tier row, verify drawer opens with gates, evidence, approver chain.
- Click Quality Gate evidence, verify URL is rendered and last verified metadata shown.
- Change cadence frequency from Quarterly to Monthly, verify audit trail entry written with actor and before/after.
- Trigger ad-hoc Shadow Survey, verify survey_id returned and audit trail entry written.
- Login as PM, verify Shadow Survey results are hidden, verify own-programme AI use cases visible.
- Login as DD with AP, approve a Red-tier use case, verify audit entry.

Contract tests: all 17 endpoints validated.

Voice regression: intelligence layer voice matches Design Foundations rev 4 R4.9.3 sample.

Role gating: AP flag verified for per-use-case detail, PM programme scope verified, HRBP blocked.

Intelligence layer unit tests: each of 6 triggers tested.

Audit trail: every PATCH and POST endpoint test asserts a row is written to `audit_trail_entries` with full before_json and after_json (Option A rule).

## 14. Release gating

Tab ships when:
1. Wireframe `v1_18_AI_Governance.html` signed off by Adi.
2. 17 endpoints contract-match.
3. Intelligence voice regression green.
4. Playwright green on all 9 scenarios.
5. AP flag gating verified end-to-end including denied drill on non-AP users.
6. Audit trail full-snapshot rule verified on all PATCH and POST endpoints.
7. Risk Tier Matrix rendering benchmark under 200 ms.
8. Shadow Inventory Trend correct across 4 quarterly data points.
9. Five Unsolvable radar renders with correct per-problem counts.
10. Delivery Speed Gap calculation matches worked detail in section 5.3.
11. Quality Gate Pass Rate excludes non-terminal states from denominator per section 5.2.

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Absorbs UC-O, LL, MM. AI governance is distinct from AI adoption per Wave 5 observation 3.*
