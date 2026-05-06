# 24_PRD_Tab_17_Capability_Supply_Chain.md
### Capability and Supply Chain Tab | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> New primary tab introduced at Master PRD revision 3. Absorbs 6 Hub use cases covering the strategic capability layer distinct from operational workforce. Inherits from Master PRD revision 3, Data Model PRD revision 4, Intelligence Layer PRD revision 2 pending rev 3 cascade, Security PRD revision 2 pending rev 3 cascade, Design Foundations revision 4.

---

## 1. Scope and goals

Primary tab for Portfolio Owner, Delivery Director, and HR Business Partner. Strategic capability surface distinct from v1_04 Workforce Intelligence which is operational. Answers the director-altitude questions: do we have the skills to win the pipeline, are our DMs replaceable, is the talent supply chain producing, and where are the single points of failure.

Hub anchor: S05P1 (unplanned attrition and skill-mix pressure), S08P4 (utilization truth), S08P5 (bench tax), S09C03 (bench tax), S10 Part 05 (DM succession), S10 Part 06 (capability heat map), S06P3 (best developer vs best lead), S06P5 (margin literacy per DM), S02P2 (three roles affected by AI era pyramid shift).

Use cases absorbed: UC-B (bench strength deep dive), UC-E (DM succession picture), UC-E2 (top talent retention conversations), UC-J (hiring funnel and talent supply chain), UC-BB (pyramid shift for AI era, expanded), UC-T (margin literacy per DM).

## 2. Role access

Primary: Portfolio Owner (PO), Delivery Director (DD), HR Business Partner (HRBP).
Scoped: Programme Manager (PM) read-only on own-programme roll-offs and skill-demand signals. No access to DM Succession or Retention Conversations.
Read Only (RO) read on aggregate panels, no access to DM Retention Conversations.
Finance Lead (FL) read on Bench Tax cross-link and Utilization KPI cross-link.
Audit Permission (AP) flag not required for this tab.

DM Retention Conversations panel is PO plus DD only per Q5 ruling extended to sensitive people data. The note field is encrypted at rest via pgcrypto.

## 3. Data contract

Consumes: `people`, `allocations`, `bench_roster`, `skills_inventory`, `skill_demand_signals`, `bench_to_demand_match`, `dm_succession_signals`, `hiring_funnel`, `dm_retention_conversation`, `opportunities` (for pipeline demand), `financials_monthly.bench_tax_allocation_usd` (cross-link), `team_sustainability_signals`.

Response: `CapabilitySupplyChainResponse` with sections: bench_deep_dive, skills_heat_map, bench_to_demand_match, dm_succession_picture, hiring_funnel_view, dm_retention_cadence, pyramid_shift_view, margin_literacy_distribution.

## 4. User stories

Portfolio Owner Monday 9 AM sees the bench headcount, the 3 at-risk benchings aging beyond 45 days, the 4 DMs with thin succession coverage, and the 3 senior engineering roles stalled in the hiring funnel above 90 days.

Delivery Director scopes the view to own delivery org. Sees skills heat map highlighting the programme-critical gaps on Orion and Helix. Reviews DM flight risk scores. Actions the retention conversation cadence for 3 DMs with Adjustment Requested outcomes.

HR Business Partner reviews the hiring funnel by role, band, and geo. Spots the 90+ day stall in senior engineering Hyderabad BFSI market. Escalates vendor panel expansion.

Portfolio Owner clicks into the Bench Deep Dive, sees 6 senior-band people aging on bench because of skill-mismatch with current demand. Assigns recommended action Reskill to 6, Rebadge target to 2.

Delivery Director reviews Margin Literacy distribution across the 15 DMs. Identifies 4 DMs scoring below 60 percent on the 60-second margin test. Schedules targeted margin coaching sessions.

## 5. KPIs (eight KPIs)

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | Owner |
|-----|---------|-----------|-----------|----------------|-------------|-------|
| Bench Headcount | `Count(bench_roster WHERE bench_state != OffboardingPlanned)` | 30 current bench | 18 current bench | Below 25 | At or above 40 | PO |
| Bench Aging Days (max) | `Max(bench_days) across active bench` | 52 days (red) on 3 people | 34 days (amber) on 2 people | Below 21 | At or above 45 | PO |
| Cumulative Bench Cost | `Sum(cumulative_bench_cost_usd) across active bench` | 1.2M USD cumulative | 0.4M USD cumulative | Managed to portfolio target | Above target by 50 percent | FL |
| Programme-Critical Skill Gaps | `Count(skill_demand_signals WHERE gap_headcount > 0 AND criticality = ProgrammeCritical)` | 5 gaps, 2 without any match | 0 gaps | 0 | At or above 3 | PO |
| DM Succession Coverage (% Strong or Adequate) | `Count(dm_succession_signals WHERE coverage_state IN Strong, Adequate) / Count(...) x 100` | 60 percent on 15 DMs (amber) | 88 percent on 15 DMs (green) | At or above 80 | Below 60 | PO |
| DM Flight Risk (count above 70) | `Count(dm_succession_signals WHERE flight_risk_score > 70)` | 4 DMs at risk | 1 DM at risk | 0 or 1 | At or above 3 | PO |
| Hiring Funnel Time to Fill | `Avg(time_to_fill_days) across joined cohort rolling 6 months by role` | 98 days senior engineering (red) | 35 days mid-band cloud (green) | Below 45 | At or above 90 | HRBP |
| Hiring Funnel Stalled Requisitions | `Count(hiring_funnel WHERE funnel_health = Stalled)` | 12 of 50 requisitions (red) | 2 of 30 requisitions (green) | Below 5 | At or above 10 | HRBP |

### 5.1 Bench Aging Days calculation

For each person in `bench_roster` with `bench_state IN (Active, Aging, AtRisk)`, `bench_days = current_date - bench_since`. The tab surfaces `max(bench_days)` as the headline and a distribution histogram with markers at 21 and 45 days.

### 5.2 Programme-Critical Skill Gaps worked detail

Select all `skill_demand_signals` where `gap_headcount > 0` and `criticality = ProgrammeCritical`. Cross-reference with `bench_to_demand_match` to find whether any bench person has fit_score above 60 for that skill. Gaps without any match above 60 are flagged Red. Count of flagged is the KPI.

### 5.3 DM Succession Coverage worked detail

For 15 DMs: 3 Strong, 5 Adequate, 4 Thin, 2 Critical, 1 unassigned. Strong plus Adequate = 8. 8 / 15 x 100 = 53 percent. Amber threshold 60, below triggers Red. Dashboard shows coverage band distribution chart and the 4 Thin and 2 Critical DMs named.

## 6. Views and interactions

Filter bar: Geo, Delivery Org (DD scoped), Band, Skill, Programme. Role-aware filter defaults (HRBP defaults to own geo, DD defaults to own delivery org).

Intelligence layer per Design Foundations rev 4 R4.9.2. Voice: director-altitude framing. Subtitle reads "Strategic capability, not operational roster."

Layout: 8 KPI cards top row, 8 panels below.

### 6.1 Bench Deep Dive panel

Bench Aging Strip component (new per R4.11) shows distribution with 21-day and 45-day markers. Below the strip, a filterable roster table. Columns: Name, Band, Bench State, Days, Last Skill Refresh, Recommended Action, Rebadge Target. Click a row to open person drawer with skills, source programme, burn rate, bench-to-demand matches.

### 6.2 Skills Heat Map panel

Grid. Rows are skill_codes (sorted by demand_score), columns are bands. Cell shows gap_headcount. Cell colour: red above criticality threshold, amber below, green zero. Click a cell to see people with the skill at that band and matching demand.

### 6.3 Bench-to-Demand Match panel

Kanban-style. Three columns: Suggested, Reviewed, Confirmed. Cards represent person-opportunity matches. Fit score on each card. Drag-drop to progress status. Hover shows skill_match_components_json breakdown.

### 6.4 DM Succession Picture panel

Grid. Rows are DMs (15). Columns: Programmes Managed, Flight Risk Score, Coverage State, Successor Candidate Readiness (top 3 listed), Last 1-on-1, Last Career Conversation. Click a DM to see expanded succession profile. Single Point of Failure flag shown as red chip.

### 6.5 Hiring Funnel panel

Funnel chart by role_code + band + geo. Stages: Open, Sourced, Screened, Interviewed, Offered, Joined. Horizontal bars. Time to fill displayed under each funnel. Filter controls shift the rendering. Stalled requisitions called out with amber or red badge.

### 6.6 DM Retention Cadence panel (PO and DD only)

Table of 15 DMs with conversation cadence: count of each of the 3 conversation types in last 90 days. Outcome distribution per DM. Red indicator when no conversation of a given type in 60+ days. Note content masked by default, revealed on explicit per-row reveal action which audits through `audit_trail_entries`.

### 6.7 Pyramid Shift view

Two overlaid pyramids. Current vs 12-month projection under AI acceleration assumption (from rev 3 AI Impact Pyramid Overlay). Bands B1 through B5 with headcount at each. Deltas called out. Cross-link to v1_04 Workforce.

### 6.8 Margin Literacy Distribution panel

Bar chart of 15 DMs. X is DM name, Y is margin literacy score (0 to 100). Red zone below 60. Click a DM to see the 60-second test detail (what the DM answered vs correct for their programme's current P and L). UC-T surfaced here.

## 7. Drill paths

| From | To |
|------|-----|
| Bench Headcount KPI | Bench Deep Dive panel |
| Bench Aging Days KPI | Bench Deep Dive filtered Aging and AtRisk |
| Cumulative Bench Cost KPI | v1_05 Financials Bench Tax Allocation line |
| Programme-Critical Skill Gaps KPI | Skills Heat Map filtered to gaps |
| DM Succession Coverage KPI | DM Succession Picture panel |
| DM Flight Risk KPI | DM Succession Picture filtered flight_risk above 70 |
| Hiring Funnel Time to Fill KPI | Hiring Funnel panel |
| Hiring Funnel Stalled KPI | Hiring Funnel filtered Stalled |
| Bench roster row | Person drawer with matches and history |
| Skill heat map cell | People list filtered to skill + band |
| Bench-to-demand card | Match detail with full rationale |
| DM row | Succession profile with successor rankings |
| DM retention cadence row | Conversation list (PO and DD only, note-reveal audited) |
| Funnel stage | Requisition list filtered to that stage |
| Pyramid band delta | v1_04 Workforce pyramid tab view |
| Margin literacy score | 60-second test detail with correct answers |

## 8. Intelligence layer rules

`tab_capability.py` revision 1. Reads thresholds from `threshold_calibration_register`. Actions sourced from `action_playbook` matching metric_id and state. Hub voice framing: strategic not operational.

Triggers:
- Bench aging days red: action "Reskill or Rebadge bench aging above 45 days within 30 days."
- Programme-critical skill gaps red: action "Open panel expansion for the named skill plus internal reskill intensive."
- DM succession coverage red: action "Open formal succession programme with named ready successors for the 4 Thin DMs."
- DM flight risk above 70: action "Portfolio Owner 1-on-1 with the DM within 7 days."
- Hiring funnel stalled red: action "Escalate vendor panel expansion or review role requirements."
- Margin literacy below 60: action "Targeted margin coaching with the DM within 14 days."

Rules-only default. LLM polish opt-in per deployment.

## 9. Non-functional

Page load under 2.5 seconds at 500 concurrent on pre-warmed cache. Skills Heat Map rendering under 300 ms for 30 skills x 7 bands grid. Bench-to-Demand Match kanban render under 200 ms for 240 cards. DM Succession grid under 150 ms for 15 rows. Hiring Funnel chart under 300 ms for 50 requisitions.

Person drawer load under 400 ms including skills, allocations, and 5 top matches.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/capability/snapshot` | Full tab payload |
| GET | `/api/v1/capability/bench-roster?state={state}` | Bench list filtered |
| GET | `/api/v1/capability/skills-heat-map` | Skills grid |
| GET | `/api/v1/capability/bench-to-demand-match?status={status}` | Kanban cards |
| GET | `/api/v1/capability/dm-succession` | Succession grid |
| GET | `/api/v1/capability/hiring-funnel?role={code}&band={band}&geo={geo}` | Funnel filtered |
| GET | `/api/v1/capability/dm-retention-cadence` | Cadence view (PO and DD only) |
| GET | `/api/v1/capability/dm-retention-conversation/{id}/reveal` | Note reveal, audited |
| GET | `/api/v1/capability/pyramid-shift` | Pyramid view |
| GET | `/api/v1/capability/margin-literacy` | Distribution view |
| GET | `/api/v1/capability/person/{id}/drawer` | Person drawer |
| PATCH | `/api/v1/capability/bench-roster/{id}/action` | Set recommended_action, audited |
| PATCH | `/api/v1/capability/bench-to-demand-match/{id}/status` | Kanban update, audited |
| GET | `/api/v1/intelligence/capability` | What Why Act |

Total: 14 endpoints. DM Retention endpoints log reveal events. PATCH endpoints audit.

## 11. Error and empty states

Bench empty (healthy): "Zero bench aging above 21 days. Capability utilisation clean." Celebration card.
No skill gaps: "All programme-critical skills covered by current supply." Celebration card.
No DMs at flight risk: "DM base stable. No flight-risk signals above 70 this quarter." Celebration card.
HRBP view without hiring funnel data: "No open requisitions in your scope. Hiring funnel empty."
DM Retention Conversation note not revealed: "Note masked. Click reveal to view. Reveal is audited."
Margin literacy test not taken: "DM has not completed the 60-second margin test. Assign test to populate."

## 12. Accessibility

Skills Heat Map offers a table alternative view for screen readers with the same data. Bench-to-Demand kanban supports keyboard drag-drop via context menu. DM Succession grid navigable with arrow keys. Pyramid chart has a table alternative. All colour-coded states carry text labels.

axe-core zero WCAG AA violations required at release gate.

## 13. Test acceptance

Playwright scenarios:
- Login as PO, verify 8 KPIs render with threshold colours, verify 8 panels render.
- Filter Skills Heat Map by skill = aws_emr, verify heat map filters to that skill row.
- Drag a bench-to-demand card from Suggested to Confirmed, verify status patch and audit entry.
- Click DM retention row, click reveal note, verify audit entry written with resource_id.
- Login as HRBP, verify hiring funnel filter defaults to own geo.
- Login as DD, verify scope is own delivery org.
- Login as PM, verify DM Succession and DM Retention panels are hidden.
- Click pyramid band delta, verify drill lands on v1_04 Workforce pyramid view.

Contract tests: all 14 endpoints validated.

Voice regression: intelligence layer voice matches Design Foundations rev 4 R4.9.2 sample.

Role gating: PM scope enforced, HRBP no access to DM retention conversations, DM retention note reveal requires PO or DD and audits.

Intelligence layer unit tests: each of 6 triggers tested.

## 14. Release gating

Tab ships when:
1. Wireframe `v1_17_Capability_Supply_Chain.html` signed off by Adi.
2. 14 endpoints contract-match.
3. Intelligence voice regression green on strategic-capability framing.
4. Playwright green on all 8 scenarios.
5. Role gating verified for PM restricted scope and HRBP retention conversation block.
6. Bench-to-Demand Match audit trail verified for status changes.
7. DM Retention Conversation note encryption verified at rest.
8. Skills Heat Map rendering benchmark under 300 ms.
9. Pyramid Shift view cross-link to v1_04 verified.
10. Margin Literacy 60-second test fixture complete and scoring correct.

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Absorbs UC-B, E, E2, J, BB expanded, T. Strategic capability is distinct from operational workforce per Wave 5 observation 4.*
