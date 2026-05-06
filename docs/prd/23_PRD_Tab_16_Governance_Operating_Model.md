# 23_PRD_Tab_16_Governance_Operating_Model.md
### Governance Operating Model Tab | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> New primary tab introduced at Master PRD revision 3. Absorbs 14 Hub use cases spanning the governance spine of the product. Inherits from Master PRD revision 3, Data Model PRD revision 4, Intelligence Layer PRD revision 2 pending rev 3 cascade, Security PRD revision 2 pending rev 3 cascade, Design Foundations revision 4.

---

## 1. Scope and goals

Primary tab for Portfolio Owner and Delivery Director. Single surface rendering the full governance operating model across the portfolio: cadence stack, RACI working matrix, escalation contracts, decision queue, sponsor engagement, weekly commitment review, stakeholder influence, over-optimism detection, escalation timing, threshold calibration register.

Hub anchor: governance is the spine that 8 of 10 LinkedIn Hub series converge on (S01P6, S02P3, S03, S04P2, S04P5, S06P4, S06P6, S07A1, S10). The tab is the product's differentiator against generic PPM. Subtitle rendered across all roles: "Governance that does not decide is theatre."

Use cases absorbed: UC-A (canvas), UC-A1 (cadence calendar), UC-A2 (RACI matrix), UC-A3 (escalation contract), UC-A4 (steerco pre-read), UC-A5 (weekly commitment review), UC-A6 (sponsor engagement), UC-Y (decision queue extended columns), UC-Z (decision category split), UC-R (stakeholder influence), UC-S (over-optimism flag cross-surface), UC-KK (escalation timing), UC-OO (action playbook threshold breach), UC-PP (threshold calibration register).

## 2. Role access

Primary: Portfolio Owner (PO), Delivery Director (DD), Programme Manager (PM, scoped to own programmes).
Secondary: Finance Lead (FL) read on financial-impact sub-panels.
Read Only (RO) read.
HR Business Partner (HRBP) no access to this tab.
Audit Permission (AP) flag adds full read on `audit_trail_entries` cross-surface links used inside the Tier Config Admin panel.

PM writes are row-level enforced by `programmes.dm_user_id` foreign key. Tier Config Admin editable only by PO. Edits to `escalation_tier_config` audit through `audit_trail_entries` with actor_role check.

## 3. Data contract

Consumes: `programmes`, `workstreams`, `decisions` revision 4 (includes `category`), `governance_cadence`, `raci_matrix`, `escalation_contract`, `escalation_tier_config`, `steerco_pre_read`, `weekly_commitment`, `sponsor_engagement`, `stakeholder_influence`, `over_optimism_flags`, `escalation_timing`, `threshold_calibration_register`, `action_playbook`, `raid`.

Response: `GovernanceOperatingModelResponse` with sections: cadence_stack, raci_integrity, escalation_contracts, decision_queue_extended, sponsor_engagement_scorecard, weekly_commitment_review, stakeholder_influence_map, over_optimism_portfolio_view, escalation_timing_distribution, threshold_register_snapshot, tier_config_admin_view (PO only).

## 4. User stories

Portfolio Owner Monday 9 AM sees the portfolio governance stack, spots 2 programmes operating with theatre cadences, clears 3 stuck decisions past SLA, and reviews escalation timing to identify which DMs are escalating late.

Delivery Director before Thursday steerco reviews the Steerco Pre-Read Kit for the three programmes on the agenda, verifies sponsor engagement is not dropping below 40, and checks the RACI matrix for new workstreams added this sprint.

Portfolio Owner renames the escalation tier "Programme Director" to "Delivery Director" through the Admin Console. The change propagates immediately across every surface rendering the tier label.

Programme Manager reviews the RACI gap and overlap flags on own programme, assigns accountable owners to the 3 open gap items, and closes the weekly commitment review for the current week.

Portfolio Owner exports the Steerco Pre-Read Kit (new export variant) for the Thursday steerco, distributes to 4 sponsors 48 hours ahead of the meeting.

## 5. KPIs (ten KPIs, all sourced from threshold calibration register)

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | Owner |
|-----|---------|-----------|-----------|----------------|-------------|-------|
| Decision Latency Weighted Avg | `Avg(decision_latency_days) weighted by programme TCV for decisions closed last 30 days` | 7.4 days at 1.6B TCV weight | 2.1 days at 0.9B TCV weight | Below 2.0 | At or above 5.0 | PO |
| Decision Queue Open Count | `Count(decisions WHERE status IN Open, InProgress) per programme` | 14 on Pegasus, 9 on Phoenix | 3 on Orion, 2 on Stellar | Below 5 per programme | At or above 10 per programme | PO |
| Governance Cadence Attendance | `Avg(attendance_rate_pct) across all cadence_type rows per programme rolling 4 occurrences` | 72 on Pegasus (amber), 94 on Orion (green) | 88 on Phoenix (amber), 91 on Helix (green) | At or above 90 | Below 70 | PO |
| Cadence Theatre Count | `Count(governance_cadence WHERE state = Theatre) per programme` | 2 on Pegasus, 1 on Phoenix | 0 on Orion, 0 on Helix | 0 | 3 or more | PO |
| RACI Gap Percent | `Count(raci_matrix WHERE gap_flag) / Count(raci_matrix) x 100 per programme` | 12.3 percent on Pegasus | 2.1 percent on Orion | Below 5.0 | At or above 10.0 | PO |
| RACI Overlap Percent | `Count(raci_matrix WHERE overlap_flag) / Count(raci_matrix) x 100 per programme` | 8.5 percent on Phoenix | 3.2 percent on Helix | Below 8.0 | At or above 15.0 | PO |
| Escalation Contract Staleness | `Max(now - last_validated_at) across escalation_contract per programme in days` | 210 days on Pegasus (red), 340 on Helix (red) | 45 days on Orion (green) | Below 90 | At or above 180 | PO |
| Steerco Pre-Read Issuance | `Count(steerco_pre_read WHERE pre_read_status = IssuedToSteerco) / Count(steerco_pre_read) x 100 rolling 90 days` | 72 percent portfolio (amber) | 94 percent portfolio (green) | At or above 90 | Below 70 | PO |
| Weekly Commitment Delta | `Avg(abs(delta_points) / committed_points) x 100 across teams rolling 4 weeks per programme` | 28 percent on Pegasus (red) | 11 percent on Orion (amber) | Below 10.0 | At or above 20.0 | PM |
| Sponsor Engagement Score | `Avg(engagement_score) per sponsor rolling 60 days, lowest sponsor score per programme surfaced` | 38 on Pegasus sponsor (red) | 72 on Orion sponsor (green) | At or above 70 | Below 40 | PO |

### 5.1 Decision Latency weighted calculation worked detail

Weight is programme `financials_monthly.revenue_booked_usd` summed over trailing 12 months, normalised. Pegasus TCV weight 0.28, Phoenix 0.17, Stellar 0.14, others smaller. Decision latency on Pegasus 11.2 days x 0.28 = 3.14. Sum across programmes divided by sum of weights produces the portfolio average 7.4 days. Stops being an average-of-averages because it weights high-TCV programmes correctly.

### 5.2 Cadence Theatre detection rule

A cadence row is classified Theatre when: (`attendance_rate_pct below 60` for 3 consecutive occurrences) AND (`decisions_made_count = 0` for those same 3 occurrences). Theatre state persists until the next cadence occurs and breaks at least one condition. Portfolio count rolls up from programme count.

### 5.3 Escalation Contract Staleness worked detail

For each programme, `max(now() - escalation_contract.last_validated_at)` across all 5 decision classes. Staleness reflects the worst-maintained contract in the stack. Re-validation resets the clock and audits via `audit_trail_entries`.

## 6. Views and interactions

Filter bar: Geo, Programme, Vendor, Time Window, As-of date, Role. New filter chip "Decision Category" (Scope, Vendor, Resource, Commercial, Compliance) filters the decision queue.

Intelligence layer: three-column What Why Act per Design Foundations rev 4 R4.9.1. Voice: "Governance that does not decide is theatre."

Layout: 12-column grid. Top row is 10 KPI cards in a 5-by-2 layout on 1280px. Drill affordance on every KPI.

### 6.1 Cadence Calendar panel

Calendar-style grid. Rows are programmes, columns are weeks of current quarter. Cells show the cadence occurrences scheduled in that week. Cell colour: Healthy green, AtRisk amber, Theatre red. Click a cell to see the attendance, decisions made, and commitments captured detail. Hover shows next scheduled date and duration.

### 6.2 RACI Working Matrix panel

Per-programme grid. Rows are activities, columns are role codes. Cell content is R, A, C, I, or empty. Gap cells show a red warning triangle. Overlap cells (more than one A) show amber. Filter by workstream. Click a cell to edit (PO, DD, PM scoped). Bulk-import template downloadable by PO.

### 6.3 Escalation Contract panel

Per-programme expandable list. Each decision class is a row. Inside: tier ladder with `display_label` from `escalation_tier_config`, named owner, time-bound hours, document URL. Last validated badge in days. Tier labels read from config so rename propagates.

### 6.4 Steerco Pre-Read Kit panel

Per-programme list of upcoming steercos. Each row expandable to a 4-column pre-read layout: Decision, Options (A/B/C), Recommendation, Impact of Deferral. Export variant "Steerco Pre-Read Kit" ships the current programme as a PowerPoint.

### 6.5 Decision Queue extended panel

Rows are decisions. Columns at rev 4: Programme, Category, Title, Age, SLA, Status, Owner, Options (new), Recommendation (new), Impact of Deferral (new). Columns Options, Recommendation, Impact of Deferral pulled from `steerco_pre_read` when linked. Filter by Category.

### 6.6 Weekly Commitment Review panel

Heatmap. Rows are programmes, columns are teams, cells are current-week delta percent. Colour-graded by threshold. Click a cell to see the week's committed, delivered, and reason text.

### 6.7 Sponsor Engagement Scorecard panel

Rows are sponsors (one sponsor per programme or more). Columns: attendance rate, decisions made count, deferred count, engagement score, trend sparkline. Sponsors below 40 flagged red with a "sponsor on mute" badge.

### 6.8 Stakeholder Influence Map panel

Quadrant chart. X is influence_score, Y is support_score. Dots are stakeholders. Size by decision_maker_flag. Colour by sentiment_trend. Hover shows name, programme, last interaction. Opposition-quadrant stakeholders called out.

### 6.9 Over-Optimism Portfolio view

Line chart by programme. X is week, Y is consecutive green weeks. When green_on_green_flag fires, a red marker overlays. Link to v1_01 Executive and v1_02 Delivery Health for single-programme detail.

### 6.10 Escalation Timing Distribution panel

Bar chart. Categories: Early, OnTime, Late, NeverEscalated. Counts across RAIDs with escalation. Drill into a category opens the RAID list on v1_03 Risk and RAID.

### 6.11 Threshold Register snapshot panel

Scrollable table, read-only for most roles. Columns: metric_id, display_name, direction, green, amber, red, last_calibrated_at, owning role. Search and filter. Edit only by owning role and only via Admin Console (Tier Config Admin view).

### 6.12 Tier Config Admin view (PO only)

Rendered only when caller is PO. List of 5 seeded tiers plus any active tier additions. Each row editable: default_label (read-only), display_label (editable), description_text, sla_hint_hours, active. Save triggers audit trail entry.

## 7. Drill paths

| From | To |
|------|-----|
| Decision Latency KPI | Decision Queue extended panel |
| Decision Queue row | Single decision drawer with history, pre-read link, category, owner |
| Cadence Calendar cell | Cadence detail popover with attendance, decisions, commitments |
| RACI cell | Activity edit drawer with role assignments |
| Escalation Contract row | Tier ladder expanded view with named owners |
| Steerco Pre-Read row | 4-column pre-read expanded, export single programme |
| Weekly Commitment cell | Team-week detail with reason text |
| Sponsor score | Sponsor trend 6-month chart |
| Stakeholder dot | Stakeholder profile with interaction history |
| Over-optimism flag | v1_01 Executive over-optimism sub-panel |
| Escalation timing category | v1_03 Risk and RAID filtered RAID list |
| Threshold row | Admin Console calibration edit (owning role only) |
| Tier row | Admin Console tier edit (PO only) |

## 8. Intelligence layer rules

`tab_governance.py` revision 1. Reads thresholds from `threshold_calibration_register` for all 10 KPIs. Actions sourced from `action_playbook` matching metric_id and state. Hub voice framing "Governance that does not decide is theatre." Action verbs from Design Foundations 12 plus new verbs `Re-validate` (escalation contract), `Clear` (decision), `Move` (cadence to fortnightly), `Assign` (accountable owner).

Triggers:
- RACI gap percent red: surfaces in Why column with gap count and named workstreams.
- Cadence theatre count red: surfaces action "Move cadence from monthly to fortnightly."
- Escalation contract staleness red: surfaces action "Re-validate escalation contract before next steerco."
- Sponsor engagement score red: surfaces action "Book 1-on-1 with sponsor within 7 days."
- Weekly commitment delta red: surfaces action "Review commitment discipline with PM."
- Decision Queue count red: surfaces top 3 stuck decisions by age with named owner.

Rules-only default. LLM polish is opt-in per deployment per D-017.

## 9. Non-functional

Page load under 2.5 seconds at 500 concurrent on pre-warmed cache. Cadence Calendar rendering under 300 ms for 40 rows. RACI Matrix rendering under 400 ms for 600 cells per programme. Decision Queue extended query under 150 ms. Threshold Register snapshot under 100 ms. Tier Config Admin save under 500 ms including audit write.

Memory budget: 30 MB per session (governance surface is largest in the product).

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/governance/snapshot` | Full tab payload with all 10 panels |
| GET | `/api/v1/governance/cadence-calendar` | Cadence calendar grid |
| GET | `/api/v1/governance/raci-matrix?programme={code}` | RACI matrix for one programme |
| GET | `/api/v1/governance/escalation-contracts?programme={code}` | Escalation contract list |
| GET | `/api/v1/governance/steerco-pre-read?programme={code}` | Pre-read list |
| GET | `/api/v1/governance/decision-queue?category={cat}&programme={code}` | Extended decision queue |
| GET | `/api/v1/governance/sponsor-scorecard?programme={code}` | Sponsor engagement |
| GET | `/api/v1/governance/weekly-commitment?programme={code}` | Commitment review |
| GET | `/api/v1/governance/stakeholder-influence?programme={code}` | Influence map |
| GET | `/api/v1/governance/over-optimism-portfolio` | Portfolio over-optimism |
| GET | `/api/v1/governance/escalation-timing` | Escalation timing distribution |
| GET | `/api/v1/governance/threshold-register` | Threshold register snapshot |
| GET | `/api/v1/intelligence/governance` | What Why Act |
| PATCH | `/api/v1/admin/tier-config/{tier_number}` | Update tier display label (PO only, audited) |
| PATCH | `/api/v1/admin/threshold-register/{metric_id}` | Update threshold (owning role only, audited) |
| POST | `/api/v1/exports/pptx/steerco-pre-read?programme={code}` | Steerco Pre-Read Kit export |
| POST | `/api/v1/exports/pptx/board-pack` | Board Pack variant (governance view) |

Total: 15 endpoints. Six are PATCH or POST requiring Audit trail writes.

## 11. Error and empty states

No decisions in queue (healthy state): "Decision queue clear. 0 past SLA. Governance is deciding." Celebration card.
No RACI gaps or overlaps: "RACI working matrix clean. Zero gaps. Zero overlaps." Celebration card.
No cadence theatre: "All governance cadences active and deciding. No theatre detected this quarter." Celebration card.
No stakeholder data seeded: "Start mapping stakeholders to populate" prompt.
Sponsor on mute (red state): "Sponsor engagement below 40. Recover with 1-on-1 this week." Action prompt with pre-filled calendar link.

## 12. Accessibility

Keyboard nav across all 12 panels. Cadence Calendar cells navigable with arrow keys. RACI matrix cells navigable with arrow keys, A/R/C/I keyboard shortcuts to toggle values when edit enabled. Quadrant chart in Stakeholder Influence has a table alternative view for screen readers. All colour-coded states carry a text label alongside.

axe-core: zero WCAG AA violations required at release gate. Contrast on amber and red tokens verified against Option D palette base colours.

## 13. Test acceptance

Playwright scenarios:
- Login as PO, verify 10 KPIs render with threshold colours, verify all 12 panels render.
- Filter by Decision Category = Vendor, verify queue filters to vendor decisions.
- Edit display_label for tier 2 from "Programme Director" to "Delivery Director", verify change propagates to Escalation Contract panel within one render cycle.
- Click RACI gap cell, verify edit drawer opens with workstream and activity pre-filled.
- Export Steerco Pre-Read Kit for Pegasus, verify PPTX downloads with 4-column layout per decision.
- Login as PM, verify Tier Config Admin view is hidden.
- Login as DD, verify all panels render but Admin panel is hidden.
- Login as HRBP, verify this tab is not accessible.

Contract tests: all 15 endpoints have Pydantic models validated via schemathesis.

Voice regression: What Why Act golden snapshot matches Hub voice phrase "Governance that does not decide is theatre." in header and subtitle.

Role gating: RLS verified for PM own-programme scope on RACI, Escalation Contract, Steerco Pre-Read, Weekly Commitment, Stakeholder Influence panels.

Intelligence layer unit tests: each of the 6 threshold triggers in section 8 has a rule test asserting correct action selection.

## 14. Release gating

Tab ships when:
1. Wireframe `v1_16_Governance_Operating_Model.html` signed off by Adi.
2. 15 endpoints contract-match.
3. Intelligence voice regression green on Hub phrase assertion.
4. Playwright green on all 8 scenarios listed in section 13.
5. Role gating tests green for all 6 roles plus AP flag.
6. Threshold register snapshot matches `01_PRD_Data_Model.md` section 5.2 seed.
7. Tier Config Admin audit trail writes verified on `audit_trail_entries`.
8. RACI Matrix performance benchmark under 400 ms at 600 cells.
9. Cadence Theatre detection unit test passes with 3-consecutive-occurrence rule.

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Absorbs UC-A, A1, A2, A3, A4, A5, A6, Y, Z, R, S, KK, OO, PP. Governance is the product's spine per Wave 5 observation 1.*
