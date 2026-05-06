# IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md
### Full Implementation Plan for 50 Use Cases | AKB1 Delivery Command Center v1 | Wave 6 | Created: 2026-04-24

> Proposed plan to close every UC from the UC_TO_DASHBOARD_MAPPING_2026-04-24.md inventory. Covers architecture changes, data model expansion, PRD revisions, wireframes, tests, subagents, and risks. Plan only. No execution until Adi approves.

---

## 1. Scope under this plan

All 50 use cases from the mapping document, spanning severity 1 through severity 3. This plan assumes "nothing left behind" directive, matching previous rework cycles. If Adi prefers a phased version, option 3 in section 10 stages delivery by severity.

## 2. Architecture-level changes

### 2.1 Three new primary tabs

| Tab | Wireframe file | Absorbs UCs |
|-----|----------------|-------------|
| v1_16 Governance Operating Model | `docs/wireframes/v1_16_Governance_Operating_Model.html` | UC-A, A1, A2, A3, A4, A5, A6, Y, Z, R, S, KK, OO, PP |
| v1_17 Capability and Supply Chain | `docs/wireframes/v1_17_Capability_Supply_Chain.html` | UC-B, E, E2, J, BB (expanded), T |
| v1_18 AI Governance | `docs/wireframes/v1_18_AI_Governance.html` | UC-O, LL, MM |

Rationale: governance spans 8 of 10 Hub series and cannot fit under any existing tab. Capability and Supply Chain is distinct from Workforce Intelligence (operational) because it is strategic (skills, hiring, succession). AI Governance is distinct from AI Innovation (adoption tracking vs policy enforcement).

### 2.2 Extensions to 12 existing tabs

| Existing tab | Revision | Adds UCs |
|--------------|----------|----------|
| v1_01 Executive | rev 4 | UC-C label layer, UC-AA portfolio drift cross-link |
| v1_02 Delivery Health | rev 4 | UC-P EVM section, UC-GG estimation negotiation, UC-V transition planning, UC-S over-optimism flag |
| v1_03 Risk and RAID | rev 2 | UC-KK escalation timing score, UC-M 5-why tracker |
| v1_04 Workforce Intelligence | rev 4 | UC-CC utilization reconciliation; cross-link to v1_17 Capability |
| v1_05 Financials | rev 4 | UC-DD revenue leakage 5-mechanism expansion |
| v1_06 P and L Cockpit | rev 4 | UC-NN 5-leak anatomy relabel, UC-P EVM cross-surface |
| v1_07 Flow and Velocity | rev 2 | UC-L DORA metrics section |
| v1_08 AI Innovation | rev 4 | Cross-link to v1_18 AI Governance; rev 3 metrics retained |
| v1_09 Commercial Pipeline | rev 4 | UC-D account concentration, UC-U rate card arbitrage, UC-FF growth expansion, UC-HH QBR quality score |
| v1_10 Backlog Health | rev 2 | No UC directly. Minor cross-links |
| v1_11 Scenario Planner | rev 4 | UC-F portfolio forecast confidence mode, UC-F2 Friday forecast commentary |
| v1_12 Ops and SLA | rev 4 | UC-Y extended Decision Queue columns, UC-Z category split |
| v1_13 Multi-Vendor | rev 4 | UC-I contract lifecycle, UC-N vendor DoD matrix |
| v1_14 Change Impact | rev 4 | UC-W urgent bypass, UC-EE CR processing cost, UC-Q closeout readiness, UC-X scope definition quality, UC-II interventions checklist, UC-JJ distributed decision tax |
| v1_15 Client Health Radar | rev 4 | UC-R stakeholder influence map |

Most tabs go to rev 4. A few stay at rev 3 (no UC calls them) or go to rev 2 (originally unversioned).

### 2.3 Cross-cutting surfaces

| Surface | New or extended | Absorbs UCs |
|---------|------------------|-------------|
| Audit Trail Explorer console | New global console accessible from every tab More menu | UC-K |
| Board Pack export variant | New export alongside Steerco Pack | UC-G |
| Steerco Pre-Read Kit export | New export variant | UC-A4 |
| First 90 Days Onboarding flow | New first-login modal plus role-aware checklist view | UC-H |

Total new wireframe files: **3 new tabs plus 3 new cross-cutting surfaces = 6 new HTML files**.

## 3. Data model expansion

### 3.1 New entities (50 added or extended)

Grouped by cluster. Every entity lists: name, key columns, granularity level, seed row count at v1, role access posture.

#### Governance cluster (11 entities)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `governance_cadence` | programme_id, cadence_type, attendees, duration_min, frequency, last_held, next_scheduled, attendance_rate, decisions_made_count | per programme per cadence | 40 (10 programmes x 4 cadences) | PO full, PM scoped, FL full, RO full |
| `raci_matrix` | programme_id, workstream, activity, responsible, accountable, consulted, informed, gap_flag, overlap_flag | per programme per activity | 600 (10 prog x 60 activities) | PO full, PM scoped, FL read, RO read |
| `escalation_contract` | programme_id, decision_class, authority_tier, time_bound_hours, named_owner | per programme per decision class | 50 (10 prog x 5 classes) | PO full, PM scoped, FL read, RO read |
| `steerco_pre_read` | programme_id, steerco_date, decision_id, options_text, recommendation_text, deferral_impact_text | per steerco per decision | 120 (10 prog x 12 steercos) | PO full, PM scoped, FL read, RO read |
| `weekly_commitment` | programme_id, team_id, week_start, committed_points, delivered_points, delta, reason_text | per team per week | 1200 (10 prog x ~3 teams x 40 weeks) | PM full own, others read |
| `sponsor_engagement` | programme_id, sponsor_id, meeting_id, attended_bool, duration_engaged_min, decisions_made_count, deferred_count | per sponsor per meeting | 400 (10 prog x 40 meetings avg) | PO full, PM scoped, FL read, RO read |
| Extension: `decisions.category_enum` | adds column category IN (scope, vendor, resource, commercial, compliance) | row-level | 30 existing + 120 new = 150 total | unchanged |
| `portfolio_drift_signals` | as_of_date, all_green_flag, portfolio_margin, programme_margin_aggregate, delta | daily | 365 rows for 12 months | PO full, PM read, FL full, RO full |
| `threshold_calibration_register` | metric_id, green_threshold, amber_threshold, red_threshold, rationale_text, last_calibrated_at | per metric | 60 metrics | PO read, PM read, FL read, RO read |
| `action_playbook` | metric_id, state_enum, action_name, time_bound_hours, owner_role, escalation_path_id | per metric per state | 180 (60 metrics x 3 states) | PO read, PM read, FL read, RO read |
| `stakeholder_influence` | programme_id, stakeholder_id, influence_score, support_score, decision_maker_flag, last_interaction_date | per programme per stakeholder | 200 (10 prog x 20 stakeholders) | PO full, PM scoped, FL read, RO read |

#### Portfolio director cluster (4 entities)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `account_concentration` | client_id, revenue_pct_of_portfolio, margin_pct_of_portfolio, dependency_risk_score, expansion_headroom_usd | per client | 10 (one per client) | PO full, FL full, others read |
| `portfolio_forecast` | as_of_date, scenario, p95_lower, expected, p95_upper, sigma, confidence_tightening_trend | weekly | 52 weeks | PO full, FL full, others read |
| `friday_forecast_commentary` | week, programme_id, dm_id, commentary_text, confidence_self_assessment | per programme per week | 520 (10 prog x 52 weeks) | PM own, others read |
| `growth_expansion` | client_id, baseline_tcv, current_portfolio_tcv, expansion_multiple, delivery_originated_deal_ids (array) | per client | 10 | PO full, FL full, RO read, PM no |

#### Capability and people cluster (7 entities)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `bench_roster` | person_id, bench_state, skills_json, bench_since, source_programme, recommended_action, rebadge_target_programme, bench_days | per person | 30 current bench + historical | PO full, FL full, PM read own-prog roll-offs, RO read |
| `skills_inventory` | person_id, skill_code, level (0-5), certified_bool, last_used_at, demand_score | per person per skill | 2400 (300 people x 8 skills avg) | PO read, PM scoped, FL read, RO read |
| `skill_demand_signals` | programme_id, skill_code, required_headcount, gap_headcount, pipeline_demand_headcount | per programme per skill | 300 (10 prog x 30 skills) | PO full, PM scoped, FL read, RO read |
| `bench_to_demand_match` | person_id, opportunity_id, fit_score, rationale | per person per opportunity | 240 (30 bench x 8 open opps) | PO full, others read |
| `dm_succession_signals` | person_id, flight_risk_score, successor_readiness_score, successor_candidate_ids, last_1on1_date | per DM-role person | 15 DMs | PO full, FL read, RO read, PM no |
| `hiring_funnel` | role_id, band, geo, open_count, sourced, screened, interviewed, offered, joined, time_to_fill_days | per role | 50 open roles | PO full, FL read, RO read, PM scoped |
| `dm_retention_conversation` | dm_id, conversation_date, conversation_type, outcome_enum, note_text | per DM per conversation | 45 (15 DMs x 3 conversations) | PO full, others no |

#### Commercial and PnL cluster (13 entities)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `evm_snapshots` | programme_id, as_of_date, bac, ac, ev, pv, cpi, spi, tcpi, eac, etc, vac | monthly | 120 (10 prog x 12 months) | PO full, PM scoped, FL full, RO full |
| `rate_card_effective` | programme_id, band, planned_rate, actual_blended_rate, drift_pct, margin_impact_usd | per programme per band | 70 (10 prog x 7 bands) | PO full, PM scoped, FL full, RO read |
| `utilization_reconciliation` | programme_id, as_of_date, hr_system_pct, finance_system_pct, delivery_system_pct, reconciled_pct, gap_points | monthly | 120 | PO full, PM scoped, FL full, RO read |
| `revenue_leakage_mechanism` | programme_id, mechanism_enum (5 values), usd_impact, attribution_date | per programme per mechanism per month | 600 (10 prog x 5 mech x 12 mo) | PO full, PM scoped, FL full, RO read |
| `urgent_request_bypass` | programme_id, request_id, raised_at, bypass_flag, rework_cost_usd, multiplier_applied, change_control_discipline_score | per request | 120 (avg 12 per programme) | PO full, PM scoped, FL read, RO read |
| `cr_processing_cost` | cr_id, processing_cost_usd, change_value_usd, ratio, threshold_breach_flag | per CR | 100 (rev 3 had 100 CRs) | PO full, PM scoped, FL full, RO read |
| `closeout_readiness` | programme_id, checklist_item, status, owner, completed_at, lessons_learned_link | per programme per item | 150 (10 prog x 15 items) | PO full, PM scoped, FL full, RO read |
| `contract_artefacts` | programme_id, artefact_type_enum, artefact_date, rate_card_expiry, renewal_window, sla_cliff_date, red_flag_text | per programme per artefact | 80 (10 prog x 8 artefacts) | PO full, FL full, others read |
| `estimation_negotiation` | programme_id, baseline_effort_days, agreed_effort_days, compression_pct, cost_recalc_done_bool, margin_impact_forecast_usd | per programme per negotiation | 30 (one per programme plus re-baselines) | PO full, PM scoped, FL full, RO read |
| `qbr_quality_score` | qbr_id, agenda_quality, decisions_produced, slides_count, meeting_minutes_quality, quality_score | per QBR | 50 (continues rev 3 qbr_records) | PO full, PM scoped, FL full, RO read |
| `five_leak_anatomy_snapshot` | programme_id, as_of_month, leak_1 through leak_5_usd | monthly per programme | 120 (10 x 12) | PO full, PM scoped, FL full, RO read |
| `scope_creep_intervention` | programme_id, intervention_type_enum (3 types), applied_bool, effectiveness_score | per programme per intervention | 30 (10 x 3) | PM full, others read |
| `distributed_decision_tax` | decision_id, time_zones_involved, iterations, hours_elapsed | per decision | 50 (subset of decisions) | PM full, others read |

#### Delivery fundamentals cluster (5 entities)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `scope_definition_quality` | programme_id, kickoff_date, definition_score_at_kickoff, open_questions_count, deliverables_with_dod_pct | per programme per kickoff | 10 | PM full, others read |
| `over_optimism_flags` | programme_id, as_of_date, consecutive_green_weeks, prediction_vs_actual_variance, red_amber_flag | weekly | 520 (10 prog x 52 weeks) | PO full, PM scoped, FL read, RO read |
| `transition_plan` | programme_id, transition_date, onshore_count_pre, offshore_count_post, readiness_checklist_complete_pct, post_transition_defect_rate | per programme per transition | 15 (3 programmes x 2 transitions avg) | PM full, others read |
| `dora_metrics` | programme_id, as_of_month, deployment_frequency, lead_time_for_changes_days, change_failure_rate_pct, mttr_hours | monthly per programme | 120 | PO full, PM scoped, FL read, RO read |
| `five_why_register` | raid_id, why1 through why5, root_cause, resolution_date | per RAID item with root-cause analysis | 40 (subset of RAIDs) | PM full, others read |

#### Vendor cluster (1 entity)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `vendor_dod_matrix` | programme_id, vendor_id, workstream, responsibility_type_enum, gap_flag, overlap_flag, handoff_sla_hours | per programme per vendor per workstream | 400 (10 prog x 4 vendors avg x 10 workstreams) | PO full, PM scoped, FL read, RO read |

#### AI governance cluster (6 entities)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `ai_use_case` | use_case_id, programme_id, tool_id, task_category, risk_tier_enum (green, amber, red) | per use case | 200 (10 prog x 20 use cases) | PO full, PM scoped, FL read, RO read |
| `ai_quality_gate` | ai_use_case_id, gate_name, gate_policy_text, evidence_required, last_verified_at | per use case per gate | 600 (200 x 3 gates avg) | PO full, PM scoped, FL read, RO read |
| `ai_governance_cadence` | reporting_cycle_enum, last_report_date, next_report_date, metrics_reported_json | per cycle | 4 cycles | PO full, FL full, others read |
| `ai_shadow_survey` | survey_id, run_date, programmes_covered, tools_disclosed, tools_previously_unknown | per survey | 4 (quarterly) | PO full, others read |
| `ai_five_unsolvable` | programme_id, problem_enum (5 values), status, note | per programme per problem | 50 (10 x 5) | PO full, PM scoped, others read |
| `ai_delivery_speed_gap` | programme_id, as_of_month, individual_productivity_uplift_pct, delivery_speed_pct, gap_points | monthly per programme | 120 | PO full, PM scoped, FL read, RO read |

#### Risk and compliance cluster (2 entities)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `escalation_timing` | raid_id, escalated_at, first_detection_at, timing_score, category_early_on_time_late | per RAID with escalation | 30 (subset of RAIDs) | PM full, others read |
| `audit_trail_entries` | actor_user_id, actor_role, endpoint, method, timestamp, outcome, resource_id, before_json, after_json | per mutation event | 10,000 seeded for demo | Security Auditor + Portfolio Owner + Finance Lead read; PM scoped to own actions |

#### Onboarding cluster (1 entity)

| Entity | Key columns | Granularity | Seed rows | Role access |
|--------|-------------|-------------|-----------|-------------|
| `onboarding_checklist` | user_id, role, checklist_item, status, completed_at, week_number | per user per item | 120 (4 sample users x 30 items) | Self-visible only |

### 3.2 Entity count

- Rev 3 data model: approximately 35 entities
- New in rev 4: **50 entities**
- Rev 4 total: approximately 85 entities

### 3.3 Seed row volume

Estimated total seeded rows: approximately **22,000** new rows added to rev 4 seed, on top of approximately 8,000 rows at rev 3.

### 3.4 Data granularity principle

Four granularity levels enforced:

1. **Time-series monthly**: evm_snapshots, dora_metrics, revenue_leakage_mechanism, ai_delivery_speed_gap, utilization_reconciliation, five_leak_anatomy_snapshot, over_optimism_flags (weekly)
2. **Event-level**: audit_trail_entries, weekly_commitment, sponsor_engagement, urgent_request_bypass, steerco_pre_read, friday_forecast_commentary, distributed_decision_tax
3. **Per-entity snapshots**: account_concentration, bench_roster, dm_succession_signals, hiring_funnel, growth_expansion, escalation_contract
4. **Configuration**: threshold_calibration_register, action_playbook, governance_cadence, raci_matrix, contract_artefacts, ai_quality_gate

### 3.5 Index strategy

Every time-series table: composite index on (programme_id, as_of_date).
Every per-programme table: single index on programme_id.
Audit trail: composite (timestamp, actor_user_id) plus (resource_id, timestamp).
Skills inventory: GIN index on skills_json.

### 3.6 FK constraints

Every FK enforced NOT NULL unless business case for NULL (e.g. bench_roster.source_programme can be NULL for a new hire).

## 4. PRD changes

### 4.1 Master PRDs to revise

| PRD | Current rev | Target rev | Scope of change |
|-----|-------------|------------|-----------------|
| `00_PRD_Master.md` | 2 | 3 | Update tab inventory from 15 to 18. Update scope. Reference new cross-cutting surfaces. |
| `01_PRD_Data_Model.md` | 3 | 4 | Add 50 new entities with full field-level spec. |
| `02_PRD_Intelligence_Layer.md` | 2 | 3 | Add threshold calibration register and action playbook framework. |
| `03_PRD_Security_Auth.md` | 2 | 3 | Add Audit Trail Explorer access policy. Add new roles if needed (Security Auditor). |

### 4.2 New tab PRDs to write

| PRD file | Tab | Target rev | Lines est |
|----------|-----|------------|-----------|
| `23_PRD_Tab_16_Governance_Operating_Model.md` | v1_16 | 1 | ~250 lines |
| `24_PRD_Tab_17_Capability_Supply_Chain.md` | v1_17 | 1 | ~220 lines |
| `25_PRD_Tab_18_AI_Governance.md` | v1_18 | 1 | ~200 lines |

### 4.3 Existing tab PRDs to revise to rev 4

12 tab PRDs require rev 4 rewrites: v1_01, v1_02, v1_03, v1_04, v1_05, v1_06, v1_07, v1_09, v1_11, v1_12, v1_13, v1_14, v1_15 (plus v1_08 AI Innovation rev 4 for cross-linking). That is **13 PRD revisions**.

v1_10 Backlog Health stays at rev 1 (no UC calls it).

### 4.4 Cross-cutting PRDs to revise

| PRD | Current rev | Target rev | Scope |
|-----|-------------|------------|-------|
| `19_PRD_Notifications_Digest.md` | 1 | 2 | Add notifications for new entities (governance breaches, bench-aging, AI risk tier changes) |
| `20_PRD_Exports_Steerco_Pack.md` | 1 | 2 | Add Board Pack variant, Pre-Read Kit variant |
| `21_PRD_History_Snapshots.md` | 1 | 2 | Add history for new entities |
| `22_PRD_Search_Command_Palette.md` | 1 | 2 | Add search for new entities (decisions by category, stakeholders, AI use cases) |

### 4.5 New cross-cutting PRDs to write

| PRD | Rev | Scope |
|-----|-----|-------|
| `26_PRD_Audit_Trail_Console.md` | 1 | Global audit console (UC-K) |
| `27_PRD_Onboarding_First_90_Days.md` | 1 | First-login modal plus role-aware checklist (UC-H) |

### 4.6 Total PRD work

- 4 master PRDs to rev up
- 3 new tab PRDs
- 13 existing tab PRDs to rev 4
- 4 cross-cutting PRDs to rev up
- 2 new cross-cutting PRDs

**Total: 26 PRD files touched.**

## 5. Wireframe changes

### 5.1 New wireframes

| File | UCs |
|------|-----|
| `v1_16_Governance_Operating_Model.html` | UC-A, A1, A2, A3, A4, A5, A6, Y, Z, R, S, KK, OO, PP |
| `v1_17_Capability_Supply_Chain.html` | UC-B, E, E2, J, BB-expanded, T |
| `v1_18_AI_Governance.html` | UC-O, LL, MM |
| `v1_audit_trail_console.html` | UC-K (modal or standalone) |
| `v1_board_pack_preview.html` | UC-G (export preview) |
| `v1_onboarding_first_90_days.html` | UC-H |

### 5.2 Existing wireframes to update to rev 4

12 HTML files in `docs/wireframes/` to modify with new sections per tab PRD rev 4.

### 5.3 Nav update

Index file `v1_00_Index.html` gets 3 new tabs added. More menu gets updated per role.

Role-scoped primary nav remains 5 tabs per role. New tabs land in role-specific primary nav as follows:

| Role | Primary 5 tabs at rev 4 |
|------|--------------------------|
| Portfolio Owner | Executive, Governance Operating Model (NEW), Financials, Capability and Supply Chain (NEW), Client Health Radar |
| Programme Manager | Delivery Health, Flow and Velocity, Governance Operating Model (NEW), Risk and RAID, Ops and SLA |
| Finance Lead | Financials, P and L Cockpit, Commercial Pipeline, Scenario Planner, Change Impact |
| Read Only | Executive, Delivery Health, Financials, Governance Operating Model (NEW), Client Health Radar |

## 6. Intelligence layer expansion

### 6.1 New intelligence modules

Three new `backend/app/intelligence/tab_*.py` modules:

- `tab_governance.py` (for v1_16)
- `tab_capability.py` (for v1_17)
- `tab_ai_governance.py` (for v1_18)

### 6.2 Updated modules

12 existing tab intelligence modules updated for rev 4 rules.

### 6.3 New rule primitives

- Threshold calibration engine: every metric reads its green/amber/red from `threshold_calibration_register` rather than hardcoded
- Action playbook engine: every What/Why/Act cites the time-bound action from `action_playbook`
- Decision categorisation rules: decisions tagged to category drive different action paths

### 6.4 Voice golden snapshots

New golden snapshot files:
- 3 new tabs x 3 states = 9 new golden files
- 12 existing tabs x 3 states = 36 updated golden files due to new rules

Total voice snapshot files: 45 at rev 3 to 54 at rev 4.

## 7. Test strategy updates

### 7.1 New test plan docs

| File | Scope |
|------|-------|
| `docs/test/10_Governance_Tests.md` | v1_16 tab plus escalation contract plus RACI gap detection |
| `docs/test/11_Capability_Tests.md` | v1_17 tab plus skills inventory plus bench-to-demand match |
| `docs/test/12_AI_Governance_Tests.md` | v1_18 tab plus risk tier classification plus quality gate evidence |
| `docs/test/13_EVM_Tests.md` | CPI, SPI, TCPI, EAC calculations |
| `docs/test/14_Audit_Trail_Tests.md` | Audit immutability, search, export |

### 7.2 Updated test plan docs

- `02_Contract_Tests.md` rev 2: endpoint inventory grows from 92 to approximately 135. Add role shape tests for new endpoints.
- `03_Playwright_E2E.md` rev 2: 3 new spec files plus 12 updated spec files.
- `04_Voice_Regression.md` rev 2: 54 golden snapshots.
- `09_Role_Gating.md` rev 2: access matrix grows to approximately 135 rows.

### 7.3 Performance profile updates

- `05_Performance_Benchmarks.md` rev 2: add hot-path endpoints: `/api/v1/governance/cadence-calendar`, `/api/v1/capability/skills-heat-map`, `/api/v1/ai-governance/risk-tier-matrix`, `/api/v1/evm/snapshot`, `/api/v1/audit/search`.

## 8. Subagent roster updates

### 8.1 Existing subagents to update

- `data-modeller`: absorb 50 new entities, new migration scripts, new seed generators
- `backend-fastapi`: approximately 45 new endpoints, new Pydantic models
- `frontend-next`: 3 new tab implementations, 12 tab expansions, 3 cross-cutting surfaces
- `intel-rules`: 3 new modules plus threshold calibration engine plus action playbook engine
- `voice-qa`: 54 golden snapshots plus 2 new locked Hub phrases
- `exports-engineer`: Board Pack template, Pre-Read Kit template
- `security-auditor`: audit console access policy, 45 new access_matrix rows
- `test-runner`: absorbs 5 new test plans
- `perf-benchmarker`: 5 new hot paths

### 8.2 Potential new subagent

**portfolio-director-rules** subagent specialising in director-altitude intelligence (Executive tab UC-C, UC-AA, governance tab board-facing story). Optional; could fold into `intel-rules`.

## 9. Deliverable checklist

### 9.1 Source of truth updates

- DECISION_LOG adds D-023 (this wave closure)
- MILESTONE_STATUS adds M6 readiness gate
- Design Foundations rev 3 to rev 4 (adds 2 new locked phrases)
- Memory file `project_akb1_dcc_v1.md` updated with rev 4 state

### 9.2 New locked Hub phrases for Design Foundations rev 4

Two phrases to lock per wave 3 recommendation:
- "Governance that does not decide is theatre" (appears on v1_16 subtitle)
- "The director sees across. The delivery manager walks each one" (appears on v1_01 rev 4 subtitle)

## 10. Execution options

### Option 1: Full execution in 14 session turns

Phase 1 (turns 1 to 2): Data Model PRD rev 4 with 50 new entities.
Phase 2 (turn 3): Design Foundations rev 4, Master PRD rev 3.
Phase 3 (turns 4 to 5): 3 new tab PRDs written.
Phase 4 (turns 6 to 7): 13 existing tab PRDs to rev 4.
Phase 5 (turns 8 to 9): 3 new wireframes built.
Phase 6 (turns 10 to 11): 12 existing wireframes to rev 4.
Phase 7 (turn 12): Cross-cutting surfaces (audit console, board pack, onboarding).
Phase 8 (turn 13): M4 test docs 10 through 14 plus subagent updates.
Phase 9 (turn 14): Final quality gate plus DECISION_LOG D-023 plus memory update.

Risk: very high token consumption. Consistent voice across 26 PRDs requires fresh attention each turn.

### Option 2: Compressed execution in 8 session turns

Combine phases:
- Turn 1: Data Model PRD rev 4 (all 50 entities in one doc)
- Turn 2: Design Foundations plus Master plus 3 new tab PRDs (brief-form)
- Turn 3: 13 existing tab PRD rev 4 rewrites (brief-form per tab)
- Turn 4: 3 new wireframes
- Turn 5: 12 existing wireframe rev 4 cascades (scripted bulk)
- Turn 6: Cross-cutting surfaces
- Turn 7: Test docs 10 to 14 plus subagent roster
- Turn 8: Quality gate plus D-023 plus memory

Risk: brief-form PRDs may miss detail. Some PRDs stay thinner than the rev 3 set.

### Option 3: Staged by severity

- Stage A (6 turns): Close 8 severity-1 UCs only. New governance tab, new capability tab, AI governance section, EVM section, account concentration section, plus supporting entities.
- Stage B (5 turns): Close 22 severity-2 UCs. All remaining tab expansions, cross-cutting Audit Trail and Board Pack.
- Stage C (3 turns): Close 20 severity-3 UCs. Onboarding, 5-Why tracker, margin literacy, scope definition quality, stakeholder lesser features.

Advantage: Adi can stop after Stage A or B if launch date pressure increases.

## 11. Recommendation

**Option 1: Full execution in 14 turns.**

Reasons:

First, we are past milestone M5 and pre-M6 backend build. Backend construction cannot begin until the data model and PRDs are final. Ending at Stage A or B of Option 3 leaves M6 blocked on incomplete spec. Building backend now against a spec that changes in Stage B forces rework.

Second, the voice test suite requires stable golden snapshots. 54 snapshots is only stable if the PRD and intelligence-layer rules are final. Closing in stages produces multiple snapshot churn cycles.

Third, the decision quality is highest when the complete picture is committed once. Partial commits produce architectural drift (e.g. UC-O AI Governance under v1_08 in Stage A becomes v1_18 tab in Stage B; that is two structural decisions).

Fourth, token budget is manageable at 14 turns. Recent turns have each absorbed roughly one full rev cycle.

## 12. Assumptions this plan makes

1. Adi accepts 18 primary tabs (from 15). Role-scoped nav still limits to 5 per role.
2. Adi accepts seed row volume growing to approximately 30,000.
3. Adi accepts data model growing to approximately 85 entities.
4. LinkedIn launch target stays at 2026-06-10. This plan fits with approximately 6 weeks before launch, leaving M6 backend and M7 frontend for the remaining window.
5. No new Hub series is drafted before launch that adds further UCs.
6. Existing rev 3 work is treated as baseline and not re-opened.

## 13. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 18 tabs creates UX bloat | Medium | Medium | Role-scoped nav keeps primary at 5; More menu absorbs overflow |
| Data model hits 85 entities, becomes unwieldy | Medium | Medium | Schema diagrams per cluster; foreign-key enforcement; domain-bounded microservices posture post-v1 |
| Voice golden regeneration cycles multiply | Medium | Medium | Generate stubs from rules engine; snapshot freeze after Phase 6 |
| Subagent specialisation insufficient for governance domain | Low | Medium | Add portfolio-director-rules subagent if voice quality dips |
| Token budget exhausts before Phase 9 | Medium | High | Phases checkpoint; session continuation with memory |
| Adi changes priorities mid-execution | Medium | High | Plan document is the contract; any change is a D-decision against it |

## 14. What I need from Adi to start

One of:

- **A Go Option 1** (full 14-turn execution, nothing deferred)
- **B Go Option 2** (compressed 8-turn execution, brief-form PRDs)
- **C Go Option 3 Stage A** (6 turns, severity 1 only, defer rest)
- **D Approve plan as-is and go Option 1 with scope adjustments** (name the cuts)

Plus any adjustments to assumptions in section 12.

## 15. What happens on approval

On approval:

1. DECISION_LOG D-023 entered with chosen option
2. Data Model PRD rev 4 authored (Phase 1 starts immediately)
3. `docs/state/BUILD_STATE.md` updated to reflect "M1 through M5 closed, M5.5 UC rev 4 in progress"
4. Pre-flight tasks created and in_progress set for Phase 1
5. Memory file updated with rev 4 state start

---

*Owner: Claude. Status: plan complete, no changes made. Awaiting Adi approval of option A through D.*
