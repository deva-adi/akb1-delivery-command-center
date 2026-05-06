# 01_PRD_Data_Model.md
### AKB1 Delivery Command Center v1 | Data Model PRD | Revision 4 | Updated: 2026-04-25

> Revision 4 adds the data surface for the 50 use cases catalogued in `docs/state/UC_TO_DASHBOARD_MAPPING_2026-04-24.md`. Entity count grows from approximately 35 at rev 3 to approximately 85 at rev 4. Seed row count grows from approximately 8,000 at rev 3 to approximately 30,000 at rev 4. Every revision 3 entity, every revision 3 field, every revision 3 drill path, and every revision 3 seed rule is preserved unchanged. All revision 4 content is additive.
>
> Revision 3 (preserved below) added the data surface for the Hub gap-closure metrics: Decision Velocity, Bus Factor, Overtime Hours, Scope Debt, Value Realisation, Estimation Accuracy, AI-Originated Defects, Bench Tax, Vendor Rationalisation Cadence, QBR Records. Replaced revision 2.

---

## 1. Scope

Postgres 16 schema, deterministic seed generator, drill relationships, data contracts. Revision 3 adds nine new entities and expands three existing entities with Hub gap-closure dimensions.

## 2. Technology

Postgres 16, SQLAlchemy 2 async, Alembic migrations, asyncpg, Pydantic v2. Unchanged from revision 2.

## 3. Entity list (revisions 3 and 4)

> Revision 3 inventory below is preserved unchanged. Revision 4 additions follow as a separate table at section 3.1.

| Entity | Grain | v1.0.0 rows | Revision 3 change |
|--------|-------|-------------|-------------------|
| programmes | 1 per programme | 10 | + `business_case_outcome_expected` text |
| workstreams | Programme x track | 30-50 | unchanged |
| people | 1 per person | 300 | + `overtime_hours_mtd`, `last_1on1_sentiment_score` nullable |
| allocations | Person x month x programme | ~3,600 | unchanged |
| financials_monthly | Programme x month | 120 | + `bench_tax_allocation_usd`, `bench_tax_allocation_pct` |
| deliverables | Milestones | ~200 | unchanged |
| raid | RAID item | 150 | unchanged from rev 2 (R-A-I-D taxonomy locked) |
| actions | Action | ~40 | unchanged from rev 2 |
| **decisions** (revised) | Governance decision | ~30 | **+ `opened_at`, `closed_at`, `sla_target_days`, `status` Open/InProgress/Approved/Rejected/Escalated, `decision_latency_days` computed** |
| sla_metrics | Programme x SLA | 60 | unchanged |
| quality_metrics | Programme x quarter | 120 | unchanged |
| vendors | Partner firm | 25 | + `rationalisation_action` enum Keep/Review/Drop/Merge |
| vendor_engagements | Vendor x programme | ~50 | unchanged from rev 2 |
| change_requests | CR | 100 | unchanged from rev 2 |
| incidents | Production incident | ~300 | unchanged |
| clients | Client organisation | 10 | unchanged |
| client_signals | Programme signals | ~120 | unchanged |
| ai_tools | AI tool inventory | 14 | unchanged |
| ai_tool_usage | Tool x programme x month | ~120 | + `task_breakdown jsonb` with per-task-type AI assist percentage |
| opportunities | Commercial pipeline | ~70 | unchanged |
| renewals | Contract renewal | ~6 | unchanged |
| kpi_snapshots | Weekly snapshot | ~520/yr | unchanged |
| audit_log | State-changing events | grows | unchanged |
| notifications | Per-user alerts | grows | unchanged |
| **team_sustainability_signals** (NEW) | Programme x month | ~120 | NEW entity, see 4.15 |
| **scope_debt** (NEW) | Programme x debt item | ~40 | NEW entity, see 4.16 |
| **value_realisation** (NEW) | Programme x quarter | ~40 | NEW entity, see 4.17 |
| **estimation_baselines** (NEW) | Programme x baseline | 10 plus 10 plus 10 | NEW entity, see 4.18 |
| **ai_defect_attribution** (NEW) | Defect x origin | ~80 | NEW entity, see 4.19 |
| **vendor_rationalisation_queue** (NEW) | Vendor review cycle | ~25 per quarter | NEW entity, see 4.20 |
| **qbr_records** (NEW) | Programme x quarter | ~30 | NEW entity, see 4.21 |
| **decision_queue_config** (NEW) | Programme x governance | 10 | NEW entity, see 4.22 |

Seven new entities plus two field expansions.

### 3.1 Revision 4 entity list (50 new entities, two field extensions)

Grouped by cluster. Total seeded volume target approximately 22,000 new rows on top of approximately 8,000 at rev 3, bringing rev 4 total to approximately 30,000.

#### 3.1.1 Governance cluster (11 entities, 1 field extension)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **governance_cadence** (NEW) | Programme x cadence type | 40 | 4.23 |
| **raci_matrix** (NEW) | Programme x activity | 600 | 4.24 |
| **escalation_contract** (NEW) | Programme x decision class | 50 | 4.25 |
| **steerco_pre_read** (NEW) | Programme x steerco x decision | 120 | 4.26 |
| **weekly_commitment** (NEW) | Programme x team x week | 1200 | 4.27 |
| **sponsor_engagement** (NEW) | Programme x sponsor x meeting | 400 | 4.28 |
| decisions (extended) | Governance decision | grows by 120 to 150 | 4.29 (adds `category` enum column) |
| **portfolio_drift_signals** (NEW) | Daily | 365 | 4.30 |
| **threshold_calibration_register** (NEW) | Per metric | 60 | 4.31 |
| **action_playbook** (NEW) | Metric x state | 180 | 4.32 |
| **stakeholder_influence** (NEW) | Programme x stakeholder | 200 | 4.33 |

#### 3.1.2 Portfolio director cluster (4 entities)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **account_concentration** (NEW) | Per client | 10 | 4.34 |
| **portfolio_forecast** (NEW) | Weekly | 52 | 4.35 |
| **friday_forecast_commentary** (NEW) | Programme x week | 520 | 4.36 |
| **growth_expansion** (NEW) | Per client | 10 | 4.37 |

#### 3.1.3 Capability and people cluster (7 entities)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **bench_roster** (NEW) | Per person on bench plus historical | 60 | 4.38 |
| **skills_inventory** (NEW) | Person x skill | 2400 | 4.39 |
| **skill_demand_signals** (NEW) | Programme x skill | 300 | 4.40 |
| **bench_to_demand_match** (NEW) | Person x opportunity | 240 | 4.41 |
| **dm_succession_signals** (NEW) | Per DM-role person | 15 | 4.42 |
| **hiring_funnel** (NEW) | Per role | 50 | 4.43 |
| **dm_retention_conversation** (NEW) | DM x conversation | 45 | 4.44 |

#### 3.1.4 Commercial and PnL cluster (13 entities)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **evm_snapshots** (NEW) | Programme x month | 120 | 4.45 |
| **rate_card_effective** (NEW) | Programme x band | 70 | 4.46 |
| **utilization_reconciliation** (NEW) | Programme x month | 120 | 4.47 |
| **revenue_leakage_mechanism** (NEW) | Programme x mechanism x month | 600 | 4.48 |
| **urgent_request_bypass** (NEW) | Per request | 120 | 4.49 |
| **cr_processing_cost** (NEW) | Per CR | 100 | 4.50 |
| **closeout_readiness** (NEW) | Programme x checklist item | 150 | 4.51 |
| **contract_artefacts** (NEW) | Programme x artefact | 80 | 4.52 |
| **estimation_negotiation** (NEW) | Programme x negotiation | 30 | 4.53 |
| **qbr_quality_score** (NEW) | Per QBR | 50 | 4.54 |
| **five_leak_anatomy_snapshot** (NEW) | Programme x month | 120 | 4.55 |
| **scope_creep_intervention** (NEW) | Programme x intervention type | 30 | 4.56 |
| **distributed_decision_tax** (NEW) | Per decision | 50 | 4.57 |

#### 3.1.5 Delivery fundamentals cluster (5 entities)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **scope_definition_quality** (NEW) | Programme x kickoff | 10 | 4.58 |
| **over_optimism_flags** (NEW) | Programme x week | 520 | 4.59 |
| **transition_plan** (NEW) | Programme x transition | 15 | 4.60 |
| **dora_metrics** (NEW) | Programme x month | 120 | 4.61 |
| **five_why_register** (NEW) | RAID x analysis | 40 | 4.62 |

#### 3.1.6 Vendor cluster (1 entity)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **vendor_dod_matrix** (NEW) | Programme x vendor x workstream | 400 | 4.63 |

#### 3.1.7 AI Governance cluster (6 entities)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **ai_use_case** (NEW) | Per use case | 200 | 4.64 |
| **ai_quality_gate** (NEW) | Use case x gate | 600 | 4.65 |
| **ai_governance_cadence** (NEW) | Per reporting cycle | 4 | 4.66 |
| **ai_shadow_survey** (NEW) | Per quarterly survey | 4 | 4.67 |
| **ai_five_unsolvable** (NEW) | Programme x problem | 50 | 4.68 |
| **ai_delivery_speed_gap** (NEW) | Programme x month | 120 | 4.69 |

#### 3.1.8 Risk and compliance cluster (2 entities)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **escalation_timing** (NEW) | RAID x escalation | 30 | 4.70 |
| **audit_trail_entries** (NEW) | Per mutation event | 10000 | 4.71 |

#### 3.1.9 Onboarding cluster (1 entity)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **onboarding_checklist** (NEW) | User x item | 120 | 4.72 |

#### 3.1.10a Configuration cluster (1 entity, added post-Phase 1 review per Q1)

| Entity | Grain | v1.0.0 rows | Schema reference |
|--------|-------|-------------|-------------------|
| **escalation_tier_config** (NEW) | Per tier | 5 | 4.73 |

Fifty-one new entities plus one decisions extension (category enum) plus zero deletions. Approximately 22,100 new seeded rows (tier config adds 5 rows plus a small growth in sponsor_engagement and steerco_pre_read references, net negligible).

#### 3.1.10 Role access roster (rev 4)

Roles in scope for rev 4: Portfolio Owner (PO), Delivery Director (DD), Programme Manager (PM, scoped to own programmes), Finance Lead (FL), HR Business Partner (HRBP), Read Only (RO). Plus one additive permission flag: Audit Permission (AP).

Role clarifications per post-Phase 1 rulings:

- Audit Permission (AP) is an additive flag on a Portfolio Owner or Finance Lead account, not a separate user identity. Default is false. Grant is via SSO group membership or local admin provisioning for on-prem installs. When true, the account gains the `audit_trail_entries` full-read access and the AI governance read access shown under the AP column. Auth binding lives in `03_PRD_Security_Auth.md` rev 3 (Phase 2). Per Q3 ruling.
- Delivery Director (DD) and HR Business Partner (HRBP) are introduced in rev 4. Their full cross-entity access policy is written in `03_PRD_Security_Auth.md` rev 3 (Phase 2). For the Data Model PRD rev 4, DD and HRBP columns below are populated only where Q5 or subsequent rulings have been explicit. Unpopulated cells default to "none" pending Phase 2.
- PM scope is enforced by `programmes.dm_user_id` foreign key check at the row level.
- `onboarding_checklist` scope: self RW on own rows, PO R on all, DD R on all, HRBP R on all, PM R on rows where the owning user is allocated to the PM's programme. Per Q5 ruling.

| Entity | PO | DD | PM (own) | FL | HRBP | RO | AP |
|--------|----|----|----|----|----|----|----|
| governance_cadence | RW | R | RW | R | none | R | none |
| raci_matrix | RW | R | RW | R | none | R | none |
| escalation_contract | RW | R | RW | R | none | R | none |
| escalation_tier_config | RW | R | R | R | none | R | none |
| steerco_pre_read | RW | R | RW | R | none | R | none |
| weekly_commitment | R | R | RW | R | none | R | none |
| sponsor_engagement | RW | R | RW | R | none | R | none |
| portfolio_drift_signals | RW | R | R | RW | none | RW | none |
| threshold_calibration_register | R | R | R | R | none | R | none |
| action_playbook | R | R | R | R | none | R | none |
| stakeholder_influence | RW | R | RW | R | none | R | none |
| account_concentration | RW | R | none | RW | none | R | none |
| portfolio_forecast | RW | R | none | RW | none | R | none |
| friday_forecast_commentary | R | R | RW | R | none | R | none |
| growth_expansion | RW | R | none | RW | none | R | none |
| bench_roster | RW | R | R (own roll-offs) | RW | R | R | none |
| skills_inventory | R | R | R | R | R | R | none |
| skill_demand_signals | RW | R | R | R | R | R | none |
| bench_to_demand_match | RW | R | R | R | R | R | none |
| dm_succession_signals | RW | R | none | R | R | R | none |
| hiring_funnel | RW | R | R | R | R | R | none |
| dm_retention_conversation | RW | R | none | none | none | none | none |
| evm_snapshots | RW | R | R | RW | none | RW | none |
| rate_card_effective | RW | R | R | RW | none | R | none |
| utilization_reconciliation | RW | R | R | RW | none | R | none |
| revenue_leakage_mechanism | RW | R | R | RW | none | R | none |
| urgent_request_bypass | RW | R | RW | R | none | R | none |
| cr_processing_cost | RW | R | RW | RW | none | R | none |
| closeout_readiness | RW | R | RW | RW | none | R | none |
| contract_artefacts | RW | R | none | RW | none | R | none |
| estimation_negotiation | RW | R | RW | RW | none | R | none |
| qbr_quality_score | RW | R | RW | RW | none | R | none |
| five_leak_anatomy_snapshot | RW | R | R | RW | none | R | none |
| scope_creep_intervention | R | R | RW | R | none | R | none |
| distributed_decision_tax | R | R | RW | R | none | R | none |
| scope_definition_quality | R | R | RW | R | none | R | none |
| over_optimism_flags | RW | R | R | R | none | R | none |
| transition_plan | R | R | RW | R | none | R | none |
| dora_metrics | RW | R | R | R | none | R | none |
| five_why_register | R | R | RW | R | none | R | none |
| vendor_dod_matrix | RW | R | R | R | none | R | none |
| ai_use_case | RW | R | R | R | none | R | R |
| ai_quality_gate | RW | R | R | R | none | R | R |
| ai_governance_cadence | RW | R | none | RW | none | R | R |
| ai_shadow_survey | RW | R | none | none | none | R | R |
| ai_five_unsolvable | RW | R | R | R | none | R | none |
| ai_delivery_speed_gap | RW | R | R | R | none | R | none |
| escalation_timing | R | R | RW | R | none | R | none |
| audit_trail_entries | R with AP flag only | R with AP flag only | R (own actions only) | R with AP flag only | none | none | RW |
| onboarding_checklist | R (all) | R (all) | R (own programme allocatees) | none | R (all) | none | none |

R is read. RW is read and write within owner scope. "none" is deny. `onboarding_checklist` is also self RW on the owning user's own row, filtered in API by `user_id = current_user.id` OR (caller role in PO, DD, HRBP) OR (caller is PM AND owning user is allocated to caller's programme). `audit_trail_entries` full read requires the Audit Permission flag on a PO, DD, or FL account; an account without AP flag retains scoped access (PM sees only own actions, PO DD FL without AP see only own actions and own-scope events). AP flag is validated on every query.

## 4. Schema per entity (revision 3 additions only; rev 2 content unchanged)

### 4.9 decisions (expanded from rev 2)

| Column | Type | Notes |
|--------|------|-------|
| decision_id | uuid pk | |
| programme_id | uuid fk nullable | |
| title | varchar(128) | |
| decided_by | varchar(64) nullable until closed | |
| `opened_at` | timestamptz NEW | When decision entered queue |
| `closed_at` | timestamptz nullable NEW | When decision was resolved |
| `sla_target_days` | smallint NEW | Target resolution SLA |
| `status` | enum Open, InProgress, Approved, Rejected, Escalated NEW | Queue state |
| `decision_latency_days` | integer generated NEW | `closed_at - opened_at`, null if open |
| rationale | text | |
| linked_raid_id | uuid fk raid nullable | |

Enables Decision Velocity KPI on Executive and Ops and SLA tabs.

### 4.4 financials_monthly (expanded)

Adds `bench_tax_allocation_usd numeric(12,2)` and `bench_tax_allocation_pct numeric(5,2) generated as (bench_tax_allocation_usd / gross_margin_usd * 100)`. Enables Bench Tax visibility on Financials and P and L Cockpit tabs.

### 4.2 people (expanded)

Adds `overtime_hours_mtd numeric(5,2)` and `last_1on1_sentiment_score smallint nullable CHECK (score between 0 and 100)`. Feeds Bus Factor and Overtime Trend on Workforce Intelligence.

### 4.13 ai_tool_usage (expanded)

Adds `task_breakdown jsonb` with schema:
```
{
  "code_authoring": { "total_hours": N, "ai_assisted_hours": N, "percent": N },
  "test_authoring": { ... },
  "documentation": { ... },
  "review": { ... }
}
```
Feeds per-programme AI-assist task percentage on AI and Innovation tab.

### 4.15 team_sustainability_signals (NEW)

| Column | Type | Notes |
|--------|------|-------|
| signal_id | uuid pk | |
| programme_id | uuid fk | |
| month | date first of month | |
| `bus_factor` | smallint CHECK between 1 and N | Number of people whose exit would halt delivery |
| `overtime_hours_pct` | numeric(5,2) | Percent of team logging over 45 hours per week |
| `avg_1on1_sentiment` | smallint nullable | Weighted average of team 1 on 1 sentiment scores |
| `team_health_index` | smallint generated | Composite 0 to 100 blending bus_factor, overtime, sentiment |
| alert_state | enum Green, Amber, Red | |

Feeds Team Sustainability section on Workforce Intelligence.

### 4.16 scope_debt (NEW)

| Column | Type | Notes |
|--------|------|-------|
| debt_id | uuid pk | |
| programme_id | uuid fk | |
| `origin` | enum UndeliveredPromise, Workaround, ReworkTax | Hub distinction from scope creep |
| title | varchar(128) | |
| effort_days | numeric(6,1) | Estimated debt load in person-days |
| opened_date | date | |
| acknowledged | boolean default false | Has client acknowledged |
| status | enum Open, PlannedToRepay, Repaid, WrittenOff | |
| margin_impact_usd | numeric(12,2) | |

Feeds Scope Debt Register on Change Impact tab, distinct from scope creep entity `change_requests`.

### 4.17 value_realisation (NEW)

| Column | Type | Notes |
|--------|------|-------|
| realisation_id | uuid pk | |
| programme_id | uuid fk | |
| captured_at | date | Typically quarterly |
| `outcome_expected` | text | Business case commitment |
| `outcome_achieved` | boolean | Did the programme deliver the outcome |
| `confidence_score` | smallint CHECK between 0 and 100 | Delivery lead confidence |
| `client_confirmed` | boolean | Client-signed attestation |
| `value_realisation_score` | smallint generated | 100 if achieved plus client_confirmed, 50 if achieved only, 25 if partial, 0 if not |
| notes | text | |

Feeds Value Realisation KPI on Executive tab and Client Health Radar composite input.

### 4.18 estimation_baselines (NEW)

| Column | Type | Notes |
|--------|------|-------|
| baseline_id | uuid pk | |
| programme_id | uuid fk | |
| `baseline_type` | enum Silent, Locked, Realised | Silent=Day15, Locked=Week3, Realised=at close |
| effort_days | numeric(8,1) | |
| cost_usd | numeric(14,2) | |
| captured_at | date | |
| locked_by | varchar(64) nullable | For Locked baseline |

Feeds Estimation Accuracy KPI on Delivery Health tab. Silent baseline protocol per Proposition A.

### 4.19 ai_defect_attribution (NEW)

| Column | Type | Notes |
|--------|------|-------|
| attribution_id | uuid pk | |
| incident_id | uuid fk incidents nullable | |
| defect_id | uuid nullable | Alternative to incident link |
| programme_id | uuid fk | |
| `origin` | enum Human, AIAssisted, AIGenerated | |
| severity | enum Critical, High, Medium, Low | |
| month | date first of month | |

Feeds AI-Originated Defect Rate on AI and Innovation tab. Gartner cited 2500 percent defect increase risk tracked here.

### 4.20 vendor_rationalisation_queue (NEW)

| Column | Type | Notes |
|--------|------|-------|
| queue_id | uuid pk | |
| vendor_id | uuid fk vendors | |
| review_quarter | varchar(8) | `2026Q2` |
| current_action | enum Keep, Review, Drop, Merge | |
| rationale | text | |
| reviewed_by | varchar(64) | |
| reviewed_at | date | |
| status | enum Pending, InReview, Decided | |

Feeds Rationalisation Cadence on Multi-Vendor Scorecard tab.

### 4.21 qbr_records (NEW)

| Column | Type | Notes |
|--------|------|-------|
| qbr_id | uuid pk | |
| programme_id | uuid fk | |
| client_id | uuid fk clients | |
| qbr_date | date | |
| `outcome_review` | text | Business outcomes discussed |
| `expansion_identified_usd` | numeric(12,2) | Expansion opportunity sized |
| `relationship_signal` | enum Strong, Neutral, AtRisk | |
| attended_by | jsonb | |
| follow_ups | jsonb | |

Feeds Delivery-Led Growth section on Commercial Pipeline tab.

### 4.22 decision_queue_config (NEW)

| Column | Type | Notes |
|--------|------|-------|
| config_id | uuid pk | |
| programme_id | uuid fk | |
| steerco_cadence | enum Fortnightly, Monthly, Quarterly | Per Proposition A Part 2 |
| decision_target_latency_days | smallint default 2 | |
| escalation_protocol_document_url | varchar(256) nullable | |

Per-programme decision governance configuration. Used by Decision Queue view on Ops and SLA tab.

## 4-A. Schema per entity (revision 4 additions; rev 3 content above unchanged)

### 4.23 governance_cadence (NEW)

| Column | Type | Notes |
|--------|------|-------|
| cadence_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| cadence_type | enum DailyStandup, WeeklyDeliveryForum, FortnightlySponsorReview, MonthlySteerco | Per S04P5 four layers |
| attendees_json | jsonb | Named roles plus user_ids when known |
| duration_min | smallint NOT NULL | |
| frequency | enum Daily, Weekly, Fortnightly, Monthly | Mirrors cadence_type semantics |
| last_held_at | timestamptz nullable | |
| next_scheduled_at | timestamptz nullable | |
| attendance_rate_pct | numeric(5,2) generated | Rolling 4-occurrence average |
| decisions_made_count | smallint generated | Last occurrence |
| commitments_made_count | smallint generated | Last occurrence |
| commitments_delivered_count | smallint generated | Subsequent occurrence |
| state | enum Healthy, AtRisk, Theatre | Theatre triggered by attendance below 60 percent and zero decisions for 3 consecutive |

Composite uniqueness: `(programme_id, cadence_type)`. Feeds Cadence Calendar surface on v1_16 Governance Operating Model. State enum drives intelligence layer flagging via `action_playbook` join.

### 4.24 raci_matrix (NEW)

| Column | Type | Notes |
|--------|------|-------|
| raci_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| workstream | varchar(64) NOT NULL | |
| activity | varchar(128) NOT NULL | |
| responsible_role | varchar(64) NOT NULL | |
| accountable_role | varchar(64) NOT NULL | |
| consulted_roles | jsonb | Array of role strings |
| informed_roles | jsonb | Array of role strings |
| gap_flag | boolean generated | True when responsible OR accountable is null or empty |
| overlap_flag | boolean generated | True when accountable count is greater than 1 |
| last_validated_at | date nullable | |

Composite uniqueness: `(programme_id, workstream, activity)`. Detects governance theatre via `gap_flag` and `overlap_flag` aggregation per programme. Surface on v1_16.

### 4.25 escalation_contract (NEW)

| Column | Type | Notes |
|--------|------|-------|
| contract_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| decision_class | enum Scope, Vendor, Resource, Commercial, Compliance | Five classes per S04P2 |
| authority_tier | smallint fk escalation_tier_config.tier_number NOT NULL CHECK between 1 and 9 | Default seed populates tiers 1 to 5 (1 DM, 2 Programme Director, 3 Portfolio Owner, 4 Sponsor, 5 Steerco). `display_label` is read from `escalation_tier_config` at render time so tier renaming propagates without schema change. Range allows up to 9 tiers for tenants that extend the ladder |
| time_bound_hours | smallint NOT NULL | SLA at this tier before auto-escalation |
| named_owner_role | varchar(64) NOT NULL | |
| named_owner_user_id | uuid nullable | |
| escalation_path_next_tier | smallint nullable | |
| document_url | varchar(256) nullable | Optional reference to signed contract |

Composite uniqueness: `(programme_id, decision_class, authority_tier)`. Surface on v1_16 Escalation Contract panel; also referenced by `decisions.category_enum` to auto-route.

### 4.26 steerco_pre_read (NEW)

| Column | Type | Notes |
|--------|------|-------|
| pre_read_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| steerco_date | date NOT NULL | |
| decision_id | uuid fk decisions NOT NULL | The decision being pre-read |
| options_text | text NOT NULL | Named options A, B, C |
| recommendation_text | text NOT NULL | The recommended option and reasoning |
| deferral_impact_text | text NOT NULL | What happens if the decision is deferred to next steerco |
| pre_read_status | enum Drafted, ReviewedByDM, IssuedToSteerco | |
| issued_at | timestamptz nullable | |

Composite uniqueness: `(programme_id, steerco_date, decision_id)`. Surface on v1_16 Steerco Pre-Read Kit panel and exported as the new Pre-Read Kit export variant (UC-A4).

### 4.27 weekly_commitment (NEW)

| Column | Type | Notes |
|--------|------|-------|
| commitment_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| team_id | varchar(64) NOT NULL | Workstream identifier |
| week_start | date NOT NULL | ISO week Monday |
| committed_points | smallint NOT NULL | At week open |
| delivered_points | smallint nullable | At week close |
| delta_points | smallint generated | `delivered - committed` |
| reason_text | text nullable | Required when `abs(delta) > 0.2 * committed` |
| programme_manager_user_id | uuid fk people NOT NULL | |

Composite uniqueness: `(programme_id, team_id, week_start)`. Feeds Weekly Commitment Review surface on v1_16.

### 4.28 sponsor_engagement (NEW)

| Column | Type | Notes |
|--------|------|-------|
| engagement_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| sponsor_user_id | uuid fk people NOT NULL | |
| meeting_id | varchar(64) NOT NULL | Internal calendar reference |
| meeting_at | timestamptz NOT NULL | |
| attended_bool | boolean NOT NULL | |
| duration_engaged_min | smallint nullable | Active participation |
| decisions_made_count | smallint NOT NULL default 0 | |
| decisions_deferred_count | smallint NOT NULL default 0 | |
| engagement_score | smallint generated | 0 to 100 composite of attendance plus engagement plus decisions made minus deferrals |

Composite uniqueness: `(programme_id, sponsor_user_id, meeting_id)`. Feeds Sponsor Engagement Score on v1_16. Feeds intelligence layer trigger when score below 40 for two consecutive months.

### 4.29 decisions (extended in rev 4)

Adds one column to the rev 3 entity:

| Column | Type | Notes |
|--------|------|-------|
| `category` | enum Scope, Vendor, Resource, Commercial, Compliance NOT NULL default Scope | New for rev 4 per S04P2 four-category split. Default is Scope for migration safety; existing rev 3 rows backfilled by category-classifier rule. |

Backfill procedure: Alembic migration scans `rationale` text for keyword matches and assigns category. Rows with no match are tagged Scope and flagged for manual review through the audit log. New writes are validated against `escalation_contract.decision_class` enum.

### 4.30 portfolio_drift_signals (NEW)

| Column | Type | Notes |
|--------|------|-------|
| drift_id | uuid pk | |
| as_of_date | date NOT NULL UNIQUE | Daily snapshot |
| all_programmes_green_flag | boolean NOT NULL | True when every programme is in green delivery state |
| portfolio_margin_pct | numeric(5,2) NOT NULL | |
| programme_margin_aggregate_pct | numeric(5,2) NOT NULL | Weighted by programme TCV |
| delta_pct | numeric(5,2) generated | `portfolio_margin_pct - programme_margin_aggregate_pct` |
| drift_state | enum Aligned, MildDrift, SevereDrift | MildDrift when abs(delta) between 1.0 and 3.0 percentage points; SevereDrift above 3.0 |
| primary_driver_text | text nullable | What is causing the drift |

Feeds Portfolio Drift overlay on v1_01 Executive rev 4 (UC-AA). The classic "every programme green, portfolio bleeding" pattern is the SevereDrift state with all_programmes_green_flag true.

### 4.31 threshold_calibration_register (NEW)

| Column | Type | Notes |
|--------|------|-------|
| metric_id | varchar(64) pk | Stable identifier (e.g. `utilization_pct`, `cpi`, `decision_latency_days`) |
| display_name | varchar(128) NOT NULL | |
| direction | enum HigherIsBetter, LowerIsBetter, RangeIsBetter | |
| green_threshold | numeric(10,2) NOT NULL | |
| amber_threshold | numeric(10,2) NOT NULL | |
| red_threshold | numeric(10,2) NOT NULL | |
| range_lower | numeric(10,2) nullable | For RangeIsBetter |
| range_upper | numeric(10,2) nullable | For RangeIsBetter |
| rationale_text | text NOT NULL | Why these thresholds (S01P6 finale references) |
| last_calibrated_at | timestamptz NOT NULL | |
| last_calibrated_by | uuid fk people NOT NULL | |
| owning_role | enum PortfolioOwner, FinanceLead, ProgrammeManager | |

Sixty metrics seeded covering rev 4 surface. Read by every intelligence-layer rule before colour assignment. Replaces hardcoded thresholds across the codebase.

### 4.32 action_playbook (NEW)

| Column | Type | Notes |
|--------|------|-------|
| playbook_id | uuid pk | |
| metric_id | varchar(64) fk threshold_calibration_register NOT NULL | |
| state | enum Green, Amber, Red NOT NULL | |
| action_name | varchar(128) NOT NULL | |
| action_text | text NOT NULL | The Act content |
| time_bound_hours | smallint NOT NULL | SLA from breach detection |
| owner_role | varchar(64) NOT NULL | |
| escalation_path_id | uuid fk escalation_contract nullable | |
| evidence_required_text | text nullable | What proof closes the action |

Composite uniqueness: `(metric_id, state)`. Drives the Act portion of every What/Why/Act intelligence-layer narrative; replaces ad hoc text per S01P6 time-bound directive.

### 4.33 stakeholder_influence (NEW)

| Column | Type | Notes |
|--------|------|-------|
| influence_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| stakeholder_user_id | uuid fk people nullable | Internal stakeholder |
| stakeholder_external_name | varchar(128) nullable | External stakeholder when no people row |
| stakeholder_external_org | varchar(128) nullable | |
| influence_score | smallint NOT NULL CHECK between 0 and 100 | Likelihood to shift programme decisions |
| support_score | smallint NOT NULL CHECK between -100 and 100 | Negative is opposing, positive is supportive |
| decision_maker_flag | boolean NOT NULL default false | |
| last_interaction_at | timestamptz nullable | |
| sentiment_trend | enum Improving, Stable, Deteriorating | Calculated rolling 60 days |

Composite uniqueness: `(programme_id, COALESCE(stakeholder_user_id, NULL), COALESCE(stakeholder_external_name, ''))`. Feeds Stakeholder Influence Map on v1_16 (cross-link from v1_15 Client Health Radar).

### 4.34 account_concentration (NEW)

| Column | Type | Notes |
|--------|------|-------|
| concentration_id | uuid pk | |
| client_id | uuid fk clients NOT NULL UNIQUE | One row per client |
| revenue_pct_of_portfolio | numeric(5,2) NOT NULL | Snapshot computed monthly |
| margin_pct_of_portfolio | numeric(5,2) NOT NULL | |
| dependency_risk_score | smallint NOT NULL CHECK between 0 and 100 | Higher means greater single-client dependency risk |
| expansion_headroom_usd | numeric(14,2) NOT NULL | Estimated additional TCV addressable |
| concentration_band | enum Low, Moderate, High, Critical generated | Critical when revenue_pct above 25 |
| as_of_month | date NOT NULL | First of month |
| narrative_text | text nullable | Why dependency risk is at this level |

Feeds Account Concentration Map on v1_09 Commercial Pipeline rev 4 (UC-D). Critical band triggers Portfolio Owner intelligence alert via `action_playbook`.

### 4.35 portfolio_forecast (NEW)

| Column | Type | Notes |
|--------|------|-------|
| forecast_id | uuid pk | |
| as_of_date | date NOT NULL UNIQUE | Friday of each ISO week |
| scenario | enum Baseline, Optimistic, Pessimistic NOT NULL | |
| p95_lower_usd | numeric(14,2) NOT NULL | 95th percentile lower confidence bound |
| expected_usd | numeric(14,2) NOT NULL | Mean forecast |
| p95_upper_usd | numeric(14,2) NOT NULL | 95th percentile upper confidence bound |
| sigma_usd | numeric(14,2) NOT NULL | Standard deviation |
| confidence_tightening_trend | enum Tightening, Stable, Widening | Rolling 8-week regression |
| inputs_count | smallint NOT NULL | Number of programme rows feeding this forecast |

Composite uniqueness: `(as_of_date, scenario)`. Surface on v1_11 Scenario Planner rev 4 (UC-F) plus the new Friday Forecast Call view.

### 4.36 friday_forecast_commentary (NEW)

| Column | Type | Notes |
|--------|------|-------|
| commentary_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| week_ending | date NOT NULL | ISO week Friday |
| dm_user_id | uuid fk people NOT NULL | |
| commentary_text | text NOT NULL | DM's narrative on the week |
| confidence_self_assessment | smallint NOT NULL CHECK between 0 and 100 | |
| variance_to_baseline_pct | numeric(5,2) NOT NULL | |
| flags_json | jsonb | Optional structured flags (overrun, scope, vendor, attrition) |

Composite uniqueness: `(programme_id, week_ending)`. Feeds Friday Forecast Call view (UC-F2) on v1_16 Governance Operating Model.

### 4.37 growth_expansion (NEW)

| Column | Type | Notes |
|--------|------|-------|
| expansion_id | uuid pk | |
| client_id | uuid fk clients NOT NULL UNIQUE | |
| baseline_tcv_usd | numeric(14,2) NOT NULL | TCV at relationship start |
| current_portfolio_tcv_usd | numeric(14,2) NOT NULL | Current sum of active TCV |
| expansion_multiple | numeric(6,3) generated | `current / baseline` |
| delivery_originated_deal_ids | jsonb | Array of opportunity_ids that originated from delivery |
| delivery_originated_tcv_usd | numeric(14,2) NOT NULL | Sum of expansion attributed to delivery quality |
| relationship_start_date | date NOT NULL | |
| narrative_text | text nullable | The expansion story (S05P3 retail 1.8 to 4.5 example pattern) |

Feeds Growth Expansion Tracker on v1_09 Commercial Pipeline rev 4 (UC-FF). Cross-link to `qbr_records.expansion_identified_usd`.

### 4.38 bench_roster (NEW)

| Column | Type | Notes |
|--------|------|-------|
| roster_id | uuid pk | |
| person_id | uuid fk people NOT NULL | |
| bench_state | enum Active, Aging, AtRisk, OffboardingPlanned NOT NULL | Aging triggered after 21 days, AtRisk after 45 days |
| bench_since | date NOT NULL | |
| source_programme_id | uuid fk programmes nullable | NULL for new hires never deployed |
| recommended_action | enum Reskill, Rebadge, Redeploy, Release | |
| rebadge_target_programme_id | uuid fk programmes nullable | When recommended_action is Rebadge |
| bench_days | smallint generated | `current_date - bench_since` |
| daily_burn_usd | numeric(8,2) NOT NULL | Cost while idle |
| cumulative_bench_cost_usd | numeric(12,2) generated | `bench_days * daily_burn_usd` |
| last_skill_refresh_at | date nullable | |

Composite uniqueness: `(person_id, bench_since)` to allow re-bench cycles. Feeds Bench Strength Deep Dive on v1_17 Capability and Supply Chain (UC-B). Cross-link to `bench_to_demand_match` for opportunity routing.

### 4.39 skills_inventory (NEW)

| Column | Type | Notes |
|--------|------|-------|
| inventory_id | uuid pk | |
| person_id | uuid fk people NOT NULL | |
| skill_code | varchar(64) NOT NULL | Stable identifier (e.g. `python`, `aws_emr`, `safe_rte`) |
| skill_level | smallint NOT NULL CHECK between 0 and 5 | 0 awareness, 5 deep specialist |
| certified_bool | boolean NOT NULL default false | |
| last_used_at | date nullable | When the skill was last applied on a billable engagement |
| last_assessed_at | date nullable | When the level was last validated |
| demand_score | smallint NOT NULL CHECK between 0 and 100 | Weighted current and forecast demand |
| skills_json | jsonb generated | Flat document for GIN-indexed search |

Composite uniqueness: `(person_id, skill_code)`. 2,400 rows seeded as 300 people times approximately 8 skills each. Feeds Skills Heat Map on v1_17.

### 4.40 skill_demand_signals (NEW)

| Column | Type | Notes |
|--------|------|-------|
| demand_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| skill_code | varchar(64) NOT NULL | |
| required_headcount | smallint NOT NULL | |
| current_headcount | smallint NOT NULL | |
| gap_headcount | smallint generated | `required - current` |
| pipeline_demand_headcount | smallint NOT NULL default 0 | Forecast demand from opportunities |
| as_of_month | date NOT NULL | First of month |
| criticality | enum Standard, Premium, ProgrammeCritical | |

Composite uniqueness: `(programme_id, skill_code, as_of_month)`. Feeds Bench-to-Demand Match algorithm on v1_17.

### 4.41 bench_to_demand_match (NEW)

| Column | Type | Notes |
|--------|------|-------|
| match_id | uuid pk | |
| person_id | uuid fk people NOT NULL | |
| opportunity_id | uuid nullable | Either opportunity or open programme demand |
| programme_id | uuid fk programmes nullable | |
| fit_score | smallint NOT NULL CHECK between 0 and 100 | Weighted skills match plus geo plus band plus availability |
| skill_match_components_json | jsonb | Per-skill score breakdown |
| availability_state | enum AvailableNow, AvailableInWeeks, BlockedByCommitment | |
| recommended_rationale_text | text | Why this person for this demand |
| status | enum Suggested, Reviewed, Confirmed, Rejected | |

Composite uniqueness: `(person_id, COALESCE(opportunity_id::text, programme_id::text))`. Feeds Recommended Redeployment widget on v1_17.

### 4.42 dm_succession_signals (NEW)

| Column | Type | Notes |
|--------|------|-------|
| signal_id | uuid pk | |
| dm_user_id | uuid fk people NOT NULL UNIQUE | Limited to people with DM-role flag |
| flight_risk_score | smallint NOT NULL CHECK between 0 and 100 | Composite of tenure, last 1on1 sentiment, market signals |
| successor_readiness_score | smallint NOT NULL CHECK between 0 and 100 | Top successor readiness |
| successor_candidate_user_ids | jsonb | Array of candidate people IDs ranked |
| single_point_of_failure_flag | boolean generated | True when successor_readiness_score below 30 |
| last_1on1_at | date nullable | |
| last_career_conversation_at | date nullable | |
| coverage_state | enum Strong, Adequate, Thin, Critical | |

Feeds DM Succession Picture on v1_17 (UC-E). Critical state triggers Portfolio Owner alert through `action_playbook`.

### 4.43 hiring_funnel (NEW)

| Column | Type | Notes |
|--------|------|-------|
| funnel_id | uuid pk | |
| role_code | varchar(64) NOT NULL | |
| band | varchar(16) NOT NULL | |
| geo | varchar(32) NOT NULL | |
| open_count | smallint NOT NULL | Currently open requisitions |
| sourced_count | smallint NOT NULL default 0 | |
| screened_count | smallint NOT NULL default 0 | |
| interviewed_count | smallint NOT NULL default 0 | |
| offered_count | smallint NOT NULL default 0 | |
| joined_count | smallint NOT NULL default 0 | |
| time_to_fill_days | numeric(5,1) generated | Average across joined cohort |
| as_of_month | date NOT NULL | |
| funnel_health | enum Healthy, Slipping, Stalled | |

Composite uniqueness: `(role_code, band, geo, as_of_month)`. Feeds Talent Supply Chain on v1_17 (UC-J).

### 4.44 dm_retention_conversation (NEW)

| Column | Type | Notes |
|--------|------|-------|
| conversation_id | uuid pk | |
| dm_user_id | uuid fk people NOT NULL | |
| conversation_at | date NOT NULL | |
| conversation_type | enum CareerPath, Compensation, Recognition NOT NULL | The three retention conversations |
| outcome | enum Aligned, AdjustmentRequested, EscalateToPO, Resigned | |
| note_text | text NOT NULL | Restricted visibility, encrypted at rest |
| follow_up_date | date nullable | |

Composite uniqueness: `(dm_user_id, conversation_at, conversation_type)`. Visibility limited to Portfolio Owner only (UC-E2). Feeds Retention Conversation Cadence on v1_17.

### 4.45 evm_snapshots (NEW)

| Column | Type | Notes |
|--------|------|-------|
| snapshot_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| as_of_date | date NOT NULL | First of month |
| bac_usd | numeric(14,2) NOT NULL | Budget at Completion |
| ac_usd | numeric(14,2) NOT NULL | Actual Cost cumulative |
| ev_usd | numeric(14,2) NOT NULL | Earned Value cumulative |
| pv_usd | numeric(14,2) NOT NULL | Planned Value cumulative |
| cpi | numeric(6,3) generated | `ev / ac` |
| spi | numeric(6,3) generated | `ev / pv` |
| tcpi_usd | numeric(6,3) generated | `(bac - ev) / (bac - ac)` |
| eac_usd | numeric(14,2) generated | `bac / cpi` when cpi greater than 0 |
| etc_usd | numeric(14,2) generated | `eac - ac` |
| vac_usd | numeric(14,2) generated | `bac - eac` |
| state | enum Healthy, Watching, Slipping, Failing generated | Slipping when CPI between 0.85 and 0.95 OR SPI between 0.85 and 0.95; Failing when either below 0.85 |

Composite uniqueness: `(programme_id, as_of_date)`. Feeds EVM section on v1_02 Delivery Health rev 4 (UC-P) plus v1_06 P and L Cockpit rev 4 cross-surface. CPI below 1.0 is the 3-month early warning of margin failure per S08P6.

### 4.46 rate_card_effective (NEW)

| Column | Type | Notes |
|--------|------|-------|
| rate_card_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| band | varchar(16) NOT NULL | |
| planned_rate_usd_hr | numeric(8,2) NOT NULL | From SOW |
| actual_blended_rate_usd_hr | numeric(8,2) NOT NULL | Computed monthly from allocations and finance |
| drift_pct | numeric(5,2) generated | `(actual - planned) / planned * 100` |
| margin_impact_usd | numeric(12,2) NOT NULL | Cumulative impact of drift |
| as_of_month | date NOT NULL | |
| skill_mix_drift_text | text nullable | Why drift is occurring (junior up, senior down, etc.) |

Composite uniqueness: `(programme_id, band, as_of_month)`. Feeds Rate Card Optimisation on v1_09 Commercial Pipeline rev 4 (UC-U) per S08P3.

### 4.47 utilization_reconciliation (NEW)

| Column | Type | Notes |
|--------|------|-------|
| reconciliation_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| as_of_date | date NOT NULL | First of month |
| hr_system_pct | numeric(5,2) NOT NULL | What HR reports |
| finance_system_pct | numeric(5,2) NOT NULL | What Finance reports |
| delivery_system_pct | numeric(5,2) NOT NULL | What Delivery reports |
| reconciled_pct | numeric(5,2) NOT NULL | Negotiated true number |
| max_gap_points | numeric(5,2) generated | Largest gap among the three sources |
| reconciliation_method_text | text NOT NULL | How the reconciliation was done |
| reconciled_by_user_id | uuid fk people NOT NULL | |

Composite uniqueness: `(programme_id, as_of_date)`. Feeds Utilization Reconciliation panel on v1_04 Workforce Intelligence rev 4 (UC-CC) per S08P4.

### 4.48 revenue_leakage_mechanism (NEW)

| Column | Type | Notes |
|--------|------|-------|
| leakage_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| mechanism | enum RateCardVsBlendedActual, AttritionNotRehiredAtBand, ScopeAbsorbedSilently, VendorOverrunUnmappedToPenalty, LicenseRenewalUnbudgeted NOT NULL | The five mechanisms per S08P7 |
| usd_impact | numeric(12,2) NOT NULL | Monthly impact |
| attribution_month | date NOT NULL | First of month |
| attribution_evidence_text | text nullable | Source documents |
| recoverable_flag | boolean NOT NULL default false | Can this be billed back |

Composite uniqueness: `(programme_id, mechanism, attribution_month)`. Feeds Revenue Leakage 5-Mechanism Audit on v1_05 Financials rev 4 plus v1_06 P and L Cockpit rev 4 (UC-DD).

### 4.49 urgent_request_bypass (NEW)

| Column | Type | Notes |
|--------|------|-------|
| bypass_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| request_id | varchar(64) NOT NULL | External reference |
| raised_at | timestamptz NOT NULL | |
| bypass_flag | boolean NOT NULL | True if normal change control bypassed |
| rework_cost_usd | numeric(12,2) NOT NULL default 0 | |
| multiplier_applied | numeric(4,2) NOT NULL default 1.0 | Hub commits to 3x for urgent bypass per S06P8 |
| change_control_discipline_score | smallint NOT NULL CHECK between 0 and 100 | Per programme rolling |
| status | enum Open, ProcessedNormalPath, AcceptedAsBypass, Rejected | |

Composite uniqueness: `(programme_id, request_id)`. Feeds Urgent Request Bypass tracker on v1_14 Change Impact rev 4 (UC-W).

### 4.50 cr_processing_cost (NEW)

| Column | Type | Notes |
|--------|------|-------|
| cost_id | uuid pk | |
| cr_id | uuid fk change_requests NOT NULL UNIQUE | |
| processing_cost_usd | numeric(10,2) NOT NULL | Internal cost to process the CR |
| change_value_usd | numeric(12,2) NOT NULL | Value of the underlying change |
| ratio | numeric(6,3) generated | `processing_cost / change_value` |
| threshold_breach_flag | boolean generated | True when ratio above 0.5 (processing eats half the value) |
| processing_hours | numeric(6,1) NOT NULL | |
| processed_by_role_breakdown_json | jsonb | Hours by role |

Feeds CR Processing Cost vs Value Threshold on v1_14 Change Impact rev 4 (UC-EE) per S08P8.

### 4.51 closeout_readiness (NEW)

| Column | Type | Notes |
|--------|------|-------|
| readiness_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| component | enum FinancialCloseout, ScopeCloseout, ResourceTransition, KnowledgeTransfer, LessonsLearned NOT NULL | The 5 components per S08P10 |
| checklist_item | varchar(128) NOT NULL | Specific item within the component |
| status | enum NotStarted, InProgress, Blocked, Complete, Waived NOT NULL | |
| owner_user_id | uuid fk people NOT NULL | |
| completed_at | timestamptz nullable | |
| evidence_url | varchar(256) nullable | Doc link |
| lessons_learned_link | varchar(256) nullable | |
| as_of_date | date NOT NULL | Snapshot reference |

Composite uniqueness: `(programme_id, component, checklist_item)`. Feeds Closeout Readiness panel on v1_14 Change Impact rev 4 (UC-Q). Component completion percentage rolls up to programme closeout score.

### 4.52 contract_artefacts (NEW)

| Column | Type | Notes |
|--------|------|-------|
| artefact_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| artefact_type | enum MSA, SOW, Amendment, RateCard, SLA, RenewalNotice NOT NULL | |
| artefact_date | date NOT NULL | Effective date |
| effective_until | date nullable | |
| rate_card_expiry | date nullable | |
| renewal_window_open | date nullable | |
| renewal_window_close | date nullable | |
| sla_cliff_date | date nullable | When SLA penalty kicks in |
| document_url | varchar(256) nullable | |
| red_flag_text | text nullable | Issues raised by Commercial review |

Composite uniqueness: `(programme_id, artefact_type, artefact_date)`. Feeds Contract Lifecycle on v1_13 Multi-Vendor rev 4 (UC-I) per S04P4.

### 4.53 estimation_negotiation (NEW)

| Column | Type | Notes |
|--------|------|-------|
| negotiation_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| baseline_effort_days | numeric(8,1) NOT NULL | What estimation produced |
| agreed_effort_days | numeric(8,1) NOT NULL | What was committed after negotiation |
| compression_pct | numeric(5,2) generated | `(baseline - agreed) / baseline * 100` |
| cost_recalc_done_bool | boolean NOT NULL | Did anyone recalculate cost after compression |
| margin_impact_forecast_usd | numeric(12,2) NOT NULL | Forecast margin impact of compression |
| negotiated_at | date NOT NULL | |
| negotiated_by_role | varchar(64) NOT NULL | |
| risk_acknowledged_text | text nullable | What risks were named at the time |

Feeds Estimation Negotiation Record on v1_02 Delivery Health rev 4 (UC-GG) per S08P1.

### 4.54 qbr_quality_score (NEW)

| Column | Type | Notes |
|--------|------|-------|
| quality_id | uuid pk | |
| qbr_id | uuid fk qbr_records NOT NULL UNIQUE | |
| agenda_quality | smallint NOT NULL CHECK between 0 and 100 | Was the agenda outcome-driven |
| decisions_produced_count | smallint NOT NULL | |
| slides_count | smallint NOT NULL | The 42-slide theatre flag |
| meeting_minutes_quality | smallint NOT NULL CHECK between 0 and 100 | |
| client_engagement_score | smallint NOT NULL CHECK between 0 and 100 | |
| quality_score | smallint generated | Weighted composite |
| theatre_flag | boolean generated | True when slides_count above 30 AND decisions_produced_count is 0 |

Feeds QBR Quality Score on v1_09 Commercial Pipeline rev 4 (UC-HH) per S08P9. Joins to existing rev 3 `qbr_records` entity.

### 4.55 five_leak_anatomy_snapshot (NEW)

| Column | Type | Notes |
|--------|------|-------|
| anatomy_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| as_of_month | date NOT NULL | First of month |
| leak_1_rate_card_drift_usd | numeric(12,2) NOT NULL | |
| leak_2_attrition_rehire_band_usd | numeric(12,2) NOT NULL | |
| leak_3_scope_absorbed_silently_usd | numeric(12,2) NOT NULL | |
| leak_4_vendor_overrun_usd | numeric(12,2) NOT NULL | |
| leak_5_license_renewal_usd | numeric(12,2) NOT NULL | |
| total_leak_usd | numeric(12,2) generated | Sum |
| total_leak_bps | smallint generated | Basis points of margin lost |
| largest_leak_id | smallint generated | Which of 1 through 5 dominates |

Composite uniqueness: `(programme_id, as_of_month)`. Feeds Five-Leak Anatomy on v1_06 P and L Cockpit rev 4 (UC-NN) per S04P4 810 bps compression. Aligns rev 3 5-driver waterfall labels with Hub naming.

### 4.56 scope_creep_intervention (NEW)

| Column | Type | Notes |
|--------|------|-------|
| intervention_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| intervention_type | enum IndependentBaseline, ChangeCompact, Week3Lock NOT NULL | The 3 named interventions |
| applied_bool | boolean NOT NULL default false | |
| applied_at | date nullable | |
| effectiveness_score | smallint NOT NULL CHECK between 0 and 100 default 0 | Measured by scope creep volume reduction post-intervention |
| owner_user_id | uuid fk people NOT NULL | |
| evidence_text | text nullable | |

Composite uniqueness: `(programme_id, intervention_type)`. Feeds Scope Creep Interventions checklist on v1_14 Change Impact rev 4 (UC-II) per S04P1 and S04P3.

### 4.57 distributed_decision_tax (NEW)

| Column | Type | Notes |
|--------|------|-------|
| tax_id | uuid pk | |
| decision_id | uuid fk decisions NOT NULL UNIQUE | |
| time_zones_involved | smallint NOT NULL | |
| iterations | smallint NOT NULL | Number of round-trips before resolution |
| hours_elapsed | numeric(6,1) NOT NULL | Wall-clock from raised to resolved |
| net_decision_minutes | numeric(6,1) NOT NULL | Active discussion minutes |
| tax_ratio | numeric(6,3) generated | `hours_elapsed / (net_decision_minutes / 60)` |
| narrative_text | text nullable | The S07A2 60-word requirement to 4-day debate pattern |

Feeds Distributed Decision Tax tracker on v1_14 Change Impact rev 4 (UC-JJ) per S07A2.

### 4.58 scope_definition_quality (NEW)

| Column | Type | Notes |
|--------|------|-------|
| sdq_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL UNIQUE | One row per programme kickoff |
| kickoff_date | date NOT NULL | |
| definition_score_at_kickoff | smallint NOT NULL CHECK between 0 and 100 | Rubric score |
| open_questions_count | smallint NOT NULL | Unresolved at kickoff |
| deliverables_with_dod_pct | numeric(5,2) NOT NULL | Percent of deliverables with Definition of Done |
| acceptance_criteria_present_pct | numeric(5,2) NOT NULL | |
| stakeholder_signoff_obtained_bool | boolean NOT NULL default false | |
| narrative_text | text nullable | The S06P1 "Client did not change scope, you did not define it" pattern |

Feeds Scope Definition Quality at Kickoff on v1_14 Change Impact rev 4 (UC-X). Anchors the discipline at programme inception.

### 4.59 over_optimism_flags (NEW)

| Column | Type | Notes |
|--------|------|-------|
| flag_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| as_of_week | date NOT NULL | ISO week Monday |
| consecutive_green_weeks | smallint NOT NULL | |
| prediction_vs_actual_variance_pct | numeric(5,2) NOT NULL | This week's actual vs last week's prediction |
| green_on_green_flag | boolean generated | True when consecutive_green_weeks above 8 AND prediction_vs_actual_variance_pct above 10 |
| commentary_text | text nullable | DM acknowledgement |
| flag_state | enum None, Watching, Flagged | |

Composite uniqueness: `(programme_id, as_of_week)`. Feeds Over-Optimism Flag on v1_01 Executive rev 4 and v1_02 Delivery Health rev 4 (UC-S) per S06P2 and S07A1.

### 4.60 transition_plan (NEW)

| Column | Type | Notes |
|--------|------|-------|
| transition_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| transition_at | date NOT NULL | Planned cutover |
| transition_type | enum OnshoreToOffshore, OffshoreToOnshore, VendorToVendor, VendorToInternal NOT NULL | |
| pre_count | smallint NOT NULL | Headcount before |
| post_count | smallint NOT NULL | Headcount after |
| readiness_checklist_total | smallint NOT NULL | |
| readiness_checklist_complete | smallint NOT NULL default 0 | |
| readiness_pct | numeric(5,2) generated | |
| post_transition_defect_rate_pct | numeric(5,2) nullable | Measured 30 days post-transition |
| dwell_time_days | smallint nullable | Knowledge transfer dwell pre-cutover |
| state | enum Planning, Executing, Validated, RolledBack | |

Composite uniqueness: `(programme_id, transition_at, transition_type)`. Feeds Transition Planning Readiness on v1_02 Delivery Health rev 4 (UC-V) per S06P7.

### 4.61 dora_metrics (NEW)

| Column | Type | Notes |
|--------|------|-------|
| dora_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| as_of_month | date NOT NULL | First of month |
| deployment_frequency_per_day | numeric(5,2) NOT NULL | |
| lead_time_for_changes_days | numeric(6,1) NOT NULL | |
| change_failure_rate_pct | numeric(5,2) NOT NULL | |
| mttr_hours | numeric(6,1) NOT NULL | Mean Time To Restore |
| dora_band | enum Elite, High, Medium, Low generated | DORA Accelerate banding |

Composite uniqueness: `(programme_id, as_of_month)`. Feeds DORA Metrics section on v1_07 Flow and Velocity rev 2 (UC-L) per S07A1 defect spike pattern.

### 4.62 five_why_register (NEW)

| Column | Type | Notes |
|--------|------|-------|
| five_why_id | uuid pk | |
| raid_id | uuid fk raid NOT NULL UNIQUE | The RAID item being analysed |
| why_1_text | text NOT NULL | |
| why_2_text | text nullable | |
| why_3_text | text nullable | |
| why_4_text | text nullable | |
| why_5_text | text nullable | |
| root_cause_text | text NOT NULL | |
| systemic_flag | boolean NOT NULL default false | True when root cause applies beyond this RAID |
| resolution_at | date nullable | |
| validated_by_user_id | uuid fk people nullable | |

Feeds 5-Why Tracker on v1_03 Risk and RAID rev 2 (UC-M) per S04P5 healthcare reconciliation example.

### 4.63 vendor_dod_matrix (NEW)

| Column | Type | Notes |
|--------|------|-------|
| dod_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| vendor_id | uuid fk vendors NOT NULL | |
| workstream | varchar(64) NOT NULL | |
| responsibility_type | enum DesignedAndBuilt, OperatedAndSupported, IntegratedHandedOff, AdvisoryOnly NOT NULL | |
| handoff_sla_hours | smallint nullable | When responsibility transfers |
| acceptance_criteria_text | text NOT NULL | What done looks like |
| gap_flag | boolean NOT NULL default false | True when responsibility is unassigned |
| overlap_flag | boolean NOT NULL default false | True when more than one vendor claims this workstream |
| last_validated_at | date nullable | |

Composite uniqueness: `(programme_id, vendor_id, workstream)`. Feeds Vendor Definition-of-Done Matrix on v1_13 Multi-Vendor rev 4 (UC-N) per S04P5 vendor A vs vendor B handoff gap example.

### 4.64 ai_use_case (NEW)

| Column | Type | Notes |
|--------|------|-------|
| use_case_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| tool_id | uuid fk ai_tools NOT NULL | |
| task_category | varchar(64) NOT NULL | (e.g. `code_authoring`, `customer_facing_response`, `clinical_decision_support`) |
| risk_tier | enum Green, Amber, Red NOT NULL | Per S03 Series 4-tier classification |
| human_in_loop_required_bool | boolean NOT NULL | |
| data_sensitivity | enum Public, Internal, Confidential, Restricted | |
| approval_status | enum Approved, Pending, Rejected, Revoked | |
| approved_by_user_id | uuid fk people nullable | |
| approved_at | timestamptz nullable | |
| narrative_text | text NOT NULL | What the use case does |

Composite uniqueness: `(programme_id, tool_id, task_category)`. Feeds Risk Tier Matrix on v1_18 AI Governance (UC-O O2). Red tier triggers mandatory quality gate before approval.

### 4.65 ai_quality_gate (NEW)

| Column | Type | Notes |
|--------|------|-------|
| gate_id | uuid pk | |
| ai_use_case_id | uuid fk ai_use_case NOT NULL | |
| gate_name | varchar(128) NOT NULL | (e.g. `data_classification_review`, `prompt_injection_test`, `bias_assessment`) |
| gate_policy_text | text NOT NULL | What the gate enforces |
| evidence_required_text | text NOT NULL | What proves the gate is passed |
| evidence_url | varchar(256) nullable | |
| last_verified_at | timestamptz nullable | |
| verified_by_user_id | uuid fk people nullable | |
| status | enum NotStarted, InProgress, Passed, Failed, Waived | |

Composite uniqueness: `(ai_use_case_id, gate_name)`. Feeds Quality Gates per Tier panel on v1_18 (UC-O O3).

### 4.66 ai_governance_cadence (NEW)

| Column | Type | Notes |
|--------|------|-------|
| cadence_id | uuid pk | |
| reporting_cycle | enum Weekly, Monthly, Quarterly, Annual NOT NULL | |
| last_report_date | date NOT NULL | |
| next_report_date | date NOT NULL | |
| metrics_reported_json | jsonb NOT NULL | Which metrics were captured this cycle |
| audience | varchar(128) NOT NULL | (e.g. `Steerco`, `RiskCommittee`, `Board`) |
| owner_user_id | uuid fk people NOT NULL | |
| status | enum OnTime, Slipping, Missed | |

Feeds Governance Reporting Cadence on v1_18 (UC-O O4). Four cycles seeded.

### 4.67 ai_shadow_survey (NEW)

| Column | Type | Notes |
|--------|------|-------|
| survey_id | uuid pk | |
| run_at | date NOT NULL UNIQUE | Quarterly survey snapshot |
| programmes_covered_count | smallint NOT NULL | |
| respondents_count | smallint NOT NULL | |
| tools_disclosed_count | smallint NOT NULL | |
| tools_previously_unknown_count | smallint NOT NULL | Shadow IT discovered |
| net_new_use_cases_count | smallint NOT NULL | |
| risk_red_use_cases_count | smallint NOT NULL | |
| follow_up_owner_user_id | uuid fk people NOT NULL | |
| narrative_text | text nullable | |

Feeds Shadow IT Inventory on v1_18 (UC-O O1). Four quarters seeded.

### 4.68 ai_five_unsolvable (NEW)

| Column | Type | Notes |
|--------|------|-------|
| unsolvable_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| problem | enum Estimation, Scope, Communications, TechDebt, TeamStructure NOT NULL | The 5 per S02P1 |
| status | enum Acknowledged, BeingAddressed, NotAddressed | Whether the programme is actively addressing this without expecting AI to solve it |
| note_text | text nullable | |
| as_of_month | date NOT NULL | First of month |

Composite uniqueness: `(programme_id, problem, as_of_month)`. Feeds Five Problems AI Cannot Solve panel on v1_18 (UC-LL).

### 4.69 ai_delivery_speed_gap (NEW)

| Column | Type | Notes |
|--------|------|-------|
| gap_id | uuid pk | |
| programme_id | uuid fk programmes NOT NULL | |
| as_of_month | date NOT NULL | First of month |
| individual_productivity_uplift_pct | numeric(5,2) NOT NULL | Tool-reported productivity gain |
| delivery_speed_change_pct | numeric(5,2) NOT NULL | End-to-end delivery throughput change |
| gap_points | numeric(5,2) generated | `individual_productivity_uplift_pct - delivery_speed_change_pct` |
| primary_constraint_text | text nullable | What is absorbing the productivity (handoffs, governance, comms, etc.) |

Composite uniqueness: `(programme_id, as_of_month)`. Feeds Delivery Speed Gap chart on v1_18 (UC-MM) per S02P4. The pattern is "individual up, delivery flat" as a structural signal that productivity is being absorbed somewhere.

### 4.70 escalation_timing (NEW)

| Column | Type | Notes |
|--------|------|-------|
| timing_id | uuid pk | |
| raid_id | uuid fk raid NOT NULL UNIQUE | |
| first_detection_at | timestamptz NOT NULL | When the signal was first visible |
| escalated_at | timestamptz nullable | When escalation actually happened |
| timing_score | smallint generated | 100 minus elapsed days between detection and escalation, floored at 0 |
| category | enum Early, OnTime, Late, NeverEscalated NOT NULL | |
| escalator_user_id | uuid fk people nullable | |
| outcome_text | text nullable | What happened post-escalation |

Feeds Escalation Timing Signal on v1_03 Risk and RAID rev 2 (UC-KK) per S06P6 nobody-fired-for-escalating-early principle.

### 4.71 audit_trail_entries (NEW)

| Column | Type | Notes |
|--------|------|-------|
| entry_id | uuid pk | |
| actor_user_id | uuid fk people NOT NULL | |
| actor_role | varchar(64) NOT NULL | |
| endpoint | varchar(256) NOT NULL | (e.g. `/api/v1/decisions/{id}`) |
| http_method | enum POST, PUT, PATCH, DELETE NOT NULL | Read endpoints not audited at this volume |
| occurred_at | timestamptz NOT NULL | |
| outcome | enum Success, Denied, Error NOT NULL | |
| resource_type | varchar(64) NOT NULL | (e.g. `decision`, `raid`, `escalation_contract`) |
| resource_id | uuid nullable | The record being mutated |
| before_json | jsonb nullable | Pre-mutation state |
| after_json | jsonb nullable | Post-mutation state |
| ip_address | varchar(64) nullable | |
| user_agent | varchar(256) nullable | |
| session_id | varchar(64) nullable | |

10,000 rows seeded for demo. Indexes on `(occurred_at DESC)`, `(actor_user_id, occurred_at DESC)`, `(resource_type, resource_id, occurred_at DESC)`. Append-only at the application layer; no UPDATE or DELETE granted to any role. Feeds Audit Trail Explorer console (UC-K).

### 4.72 onboarding_checklist (NEW)

| Column | Type | Notes |
|--------|------|-------|
| checklist_id | uuid pk | |
| user_id | uuid fk people NOT NULL | |
| role | varchar(64) NOT NULL | Snapshot of role at onboarding start |
| checklist_item | varchar(128) NOT NULL | |
| status | enum Pending, InProgress, Complete, Skipped NOT NULL default Pending | |
| week_number | smallint NOT NULL CHECK between 1 and 13 | First 90 days mapped to weeks 1 through 13 |
| completed_at | timestamptz nullable | |
| evidence_url | varchar(256) nullable | |
| sequence | smallint NOT NULL | Order within the week |

Composite uniqueness: `(user_id, checklist_item)`. Visibility list per Q5 ruling: owning user read and write on own row (self checklist progress), Portfolio Owner read on all, Delivery Director read on all, HR Business Partner read on all, Programme Manager read scoped to rows where the owning user is allocated to the PM's programme. Full access policy for Delivery Director and HR Business Partner across the rest of the Data Model is deferred to `03_PRD_Security_Auth.md` rev 3 in Phase 2. Feeds First 90 Days Onboarding flow (UC-H). 30 items seeded across 4 sample users.

### 4.73 escalation_tier_config (NEW, added per Q1 ruling)

| Column | Type | Notes |
|--------|------|-------|
| tier_number | smallint pk CHECK between 1 and 9 | Tier 1 is lowest authority, higher numbers escalate up |
| default_label | varchar(64) NOT NULL | Factory default, immutable (DM, Programme Director, Portfolio Owner, Sponsor, Steerco for seeded tiers) |
| display_label | varchar(64) NOT NULL | Tenant-editable name. Starts equal to `default_label`. Changeable by Portfolio Owner via Admin Console |
| description_text | text nullable | Optional context on what this tier means in the tenant's operating model |
| sla_hint_hours | smallint nullable | Optional default SLA suggestion for this tier, overridden per-contract in `escalation_contract.time_bound_hours` |
| role_mapping | jsonb | Array of internal role codes that populate this tier by default; used by PRD 03 auth mapping |
| active | boolean NOT NULL default true | A tenant can deactivate tiers they do not use (e.g. no Steerco in a lean org) |
| last_edited_at | timestamptz NOT NULL | |
| last_edited_by_user_id | uuid fk people NOT NULL | Must be a Portfolio Owner |

Five rows seeded at v1.0.0 (tier 1 DM, tier 2 Programme Director, tier 3 Portfolio Owner, tier 4 Sponsor, tier 5 Steerco) with `display_label` equal to `default_label` and `active = true`. `escalation_contract.authority_tier` references `escalation_tier_config.tier_number` via FK NOT NULL. Renaming a tier in `display_label` propagates automatically to every surface that shows the tier because UI reads the label at render time. Feeds Tier Configuration pane on v1_16 Governance Operating Model Admin subsurface. Edit audit flows through `audit_trail_entries` (`resource_type = 'escalation_tier_config'`).

## 5. Seed generator (updated)

Fixed seed `SEED = 20260424`. Adds generation for the seven new entities. Validator expanded to assert new distributions:

| Entity | Target seeded count | Distribution |
|--------|---------------------|---------------|
| decisions | 30 (15 open, 10 closed, 5 escalated) | decision latency 0 to 21 days |
| team_sustainability_signals | 120 (12 months x 10 programmes) | 3 Red, 4 Amber, 3 Green per month trend |
| scope_debt | 40 total | concentrated on Pegasus, Phoenix, Stellar |
| value_realisation | 40 (quarterly x 10 programmes) | 25 percent achieved, 50 partial, 25 not |
| estimation_baselines | 30 (Silent, Locked, Realised for each) | realised vs locked variance 0 to 25 percent |
| ai_defect_attribution | 80 | 60 percent Human origin, 30 percent AIAssisted, 10 percent AIGenerated |
| vendor_rationalisation_queue | 25 per quarter | 60 Keep, 15 Review, 5 Drop, 5 Merge |
| qbr_records | 30 (quarterly x 10 programmes) | 3 Strong, 5 Neutral, 2 AtRisk |

### 5.1 Seed generator additions (revision 4)

Same fixed seed `SEED = 20260424`. Validator extended to assert the rev 4 distributions below. Determinism rule unchanged: same seed produces byte-identical seed dataset across machines.

#### 5.1.1 Governance cluster seed targets

| Entity | Target seeded count | Distribution |
|--------|---------------------|---------------|
| governance_cadence | 40 (10 programmes x 4 cadences) | Daily 100 percent attended for healthy programmes; Steerco 70 to 95 percent; 3 cadences flagged Theatre |
| raci_matrix | 600 (10 programmes x 60 activities) | 5 percent gap_flag, 8 percent overlap_flag |
| escalation_contract | 50 (10 programmes x 5 decision classes) | Tiers 1 to 4 represented; tier 5 reserved for portfolio escalation only |
| steerco_pre_read | 120 (10 programmes x 12 monthly steercos) | 70 percent IssuedToSteerco, 20 percent ReviewedByDM, 10 percent Drafted |
| weekly_commitment | 1200 (10 programmes x 3 teams x 40 weeks) | Healthy programmes deliver between 90 and 110 percent of committed; stressed programmes between 65 and 95 percent |
| sponsor_engagement | 400 (10 programmes x 40 meetings avg) | Healthy sponsors attend 90 percent plus; stressed sponsors attend 50 to 70 percent with mute pattern |
| portfolio_drift_signals | 365 (daily for 12 months) | 30 days SevereDrift, 60 days MildDrift, 275 Aligned |
| threshold_calibration_register | 60 metrics | Each metric calibrated by Portfolio Owner or Finance Lead with rationale |
| action_playbook | 180 (60 metrics x 3 states) | Time-bound hours: Green null, Amber 24, Red 4 to 8 |
| stakeholder_influence | 200 (10 programmes x 20 stakeholders) | 30 percent decision_maker_flag true; 5 percent support_score below minus 50 |
| escalation_tier_config | 5 (tier 1 through tier 5) | default_label and display_label seeded identical (DM, Programme Director, Portfolio Owner, Sponsor, Steerco); all active true; role_mapping populated with rev 4 role codes |

#### 5.1.2 Portfolio director cluster seed targets

| Entity | Target seeded count | Distribution |
|--------|---------------------|---------------|
| account_concentration | 10 (one per client) | 1 Critical, 2 High, 4 Moderate, 3 Low |
| portfolio_forecast | 156 (52 weeks x 3 scenarios) | Confidence band tightens through the year |
| friday_forecast_commentary | 520 (10 programmes x 52 weeks) | Variance distribution centred at minus 5 percent |
| growth_expansion | 10 | Expansion multiple distribution from 1.0x to 4.5x; one anchor at S05P3 retail pattern |

#### 5.1.3 Capability cluster seed targets

| Entity | Target seeded count | Distribution |
|--------|---------------------|---------------|
| bench_roster | 60 (30 currently bench plus 30 historical) | Bench days distribution mean 28 with 25 percent above 45 |
| skills_inventory | 2400 (300 people x 8 skills) | Levels 0 to 5 distribution centred at 2.5; 15 percent certified |
| skill_demand_signals | 300 (10 programmes x 30 skills) | 5 ProgrammeCritical gaps surfaced |
| bench_to_demand_match | 240 (30 bench x 8 open opportunities) | Top match per person fit_score above 75; long tail below 30 |
| dm_succession_signals | 15 (one per DM-role person) | 2 Critical coverage, 4 Thin, 6 Adequate, 3 Strong |
| hiring_funnel | 50 open roles | 12 Stalled, 18 Slipping, 20 Healthy |
| dm_retention_conversation | 45 (15 DMs x 3 conversation types) | 5 EscalateToPO outcomes, 0 Resigned at v1.0.0 baseline |

#### 5.1.4 Commercial and PnL cluster seed targets

| Entity | Target seeded count | Distribution |
|--------|---------------------|---------------|
| evm_snapshots | 120 (10 programmes x 12 months) | 2 Failing programmes (CPI below 0.85), 3 Slipping, 5 Healthy or Watching |
| rate_card_effective | 70 (10 programmes x 7 bands) | Drift distribution mean minus 4 percent (junior creep) |
| utilization_reconciliation | 120 | Max gap distribution: 30 percent of rows have gap above 5 points |
| revenue_leakage_mechanism | 600 (10 programmes x 5 mechanisms x 12 months) | RateCardVsBlendedActual is dominant leak in 4 programmes |
| urgent_request_bypass | 120 (avg 12 per programme) | 25 percent bypass_flag true; multiplier 3.0 applied to those |
| cr_processing_cost | 100 (one per existing CR) | 15 percent threshold_breach_flag true |
| closeout_readiness | 150 (10 programmes x 15 items) | 1 programme nearing closeout 80 percent complete; remainder under 30 percent |
| contract_artefacts | 80 (10 programmes x 8 artefacts) | 4 with red_flag_text populated |
| estimation_negotiation | 30 (one per programme plus re-baselines) | Compression distribution mean 20 percent; cost_recalc_done_bool true in 30 percent |
| qbr_quality_score | 50 | 6 theatre_flag true (slides above 30 AND 0 decisions) |
| five_leak_anatomy_snapshot | 120 (10 programmes x 12 months) | Total leak bps distribution centred at 250 with two outliers above 800 |
| scope_creep_intervention | 30 (10 programmes x 3 intervention types) | IndependentBaseline applied in 4 programmes; ChangeCompact in 6; Week3Lock in 3 |
| distributed_decision_tax | 50 | Iterations distribution mean 4; one decision at 15 iterations across 6 timezones |

#### 5.1.5 Delivery fundamentals seed targets

| Entity | Target seeded count | Distribution |
|--------|---------------------|---------------|
| scope_definition_quality | 10 | Score distribution: 3 below 50 (poor kickoff), 4 between 50 and 75, 3 above 75 |
| over_optimism_flags | 520 (10 programmes x 52 weeks) | green_on_green_flag true in 8 percent of weeks across 3 programmes |
| transition_plan | 15 (3 programmes x avg 5 transitions) | 1 RolledBack; 1 with elevated post_transition_defect_rate |
| dora_metrics | 120 | 1 programme Elite, 3 High, 4 Medium, 2 Low |
| five_why_register | 40 (subset of RAIDs with root-cause analysis) | systemic_flag true in 8 entries |

#### 5.1.6 Vendor, AI, Risk, Onboarding seed targets

| Entity | Target seeded count | Distribution |
|--------|---------------------|---------------|
| vendor_dod_matrix | 400 (10 programmes x 4 vendors avg x 10 workstreams) | 3 percent gap_flag, 5 percent overlap_flag |
| ai_use_case | 200 (10 programmes x 20 use cases) | 130 Green, 50 Amber, 20 Red |
| ai_quality_gate | 600 (200 use cases x 3 gates avg) | Red tier use cases require 3 mandatory gates; Amber 1 to 2; Green 0 to 1 |
| ai_governance_cadence | 4 cycles | Weekly DM, Monthly Steerco, Quarterly RiskCommittee, Annual Board |
| ai_shadow_survey | 4 (quarterly) | tools_previously_unknown_count: 12, 8, 5, 2 (decreasing as governance matures) |
| ai_five_unsolvable | 50 (10 programmes x 5 problems) | Distribution skewed toward Acknowledged with TechDebt and Communications most often NotAddressed |
| ai_delivery_speed_gap | 120 | Gap distribution mean 18 points (productivity up 25, throughput up 7) |
| escalation_timing | 30 (subset of RAIDs that escalated) | 8 Early, 12 OnTime, 8 Late, 2 NeverEscalated |
| audit_trail_entries | 10000 | 12 months of synthetic activity, distributed across 4 sample users |
| onboarding_checklist | 120 (4 sample users x 30 items) | 1 user fully complete, 1 mid-flight, 2 just started |

Approximate rev 4 new seeded row total: 22,090. Approximate rev 4 grand total including rev 3: 30,090.

### 5.2 Threshold calibration register seed (60 metrics)

The 60 metrics below populate `threshold_calibration_register` at rev 4 seed. Direction encodes comparison semantics: HigherIsBetter green is at or above the green threshold; LowerIsBetter green is at or below the green threshold; RangeIsBetter green is inside `range_lower` and `range_upper`. Rationale lines cite the Hub article that anchors the threshold or the industry convention used where no Hub article is specific. Owning role is the accountable role for calibration changes through the Admin Console. Every metric has exactly one row per `metric_id`.

#### 5.2.1 Executive and Portfolio cluster (8 metrics)

| metric_id | Direction | Green | Amber | Red | Rationale | Owner |
|-----------|-----------|-------|-------|-----|-----------|-------|
| portfolio_margin_pct | HigherIsBetter | above 28.0 | 25.0 to 27.99 | below 25.0 | Services industry target blended margin; below 25 triggers commercial review | FinanceLead |
| portfolio_drift_delta_points | LowerIsBetter | below 1.0 | 1.0 to 2.99 | at or above 3.0 | Every-programme-green-portfolio-bleeding pattern flagged at 3.0 pp gap per S10 Portfolio Desk manifesto | PortfolioOwner |
| account_concentration_revenue_pct | LowerIsBetter | below 15.0 | 15.0 to 24.99 | at or above 25.0 | Above 25 percent means one client drop exceeds recoverable window | PortfolioOwner |
| portfolio_forecast_p95_spread_pct | LowerIsBetter | below 10.0 | 10.0 to 19.99 | at or above 20.0 | Wider than 20 percent p95 spread indicates forecast is not actionable | FinanceLead |
| growth_expansion_multiple | HigherIsBetter | at or above 1.5 | 1.1 to 1.49 | below 1.1 | Delivery-led growth multiple target from S05P3 retail pattern | PortfolioOwner |
| value_realisation_score | HigherIsBetter | at or above 75 | 50 to 74 | below 50 | Client-confirmed 100 outcomes weighted; below 50 means business case unfulfilled | PortfolioOwner |
| over_optimism_green_streak_weeks | LowerIsBetter | below 8 | 8 to 11 | at or above 12 | Per S06P2 and S07A1 green-until-red pattern | PortfolioOwner |
| stakeholder_decision_maker_support_score | HigherIsBetter | at or above 50 | 0 to 49 | below 0 | Negative means opposing decision-maker; below zero blocks progress | PortfolioOwner |

#### 5.2.2 Governance cluster (10 metrics)

| metric_id | Direction | Green | Amber | Red | Rationale | Owner |
|-----------|-----------|-------|-------|-----|-----------|-------|
| decision_latency_days | LowerIsBetter | below 2.0 | 2.0 to 4.99 | at or above 5.0 | S04P2 decision velocity target; above 5 days indicates theatre | PortfolioOwner |
| decision_queue_open_count | LowerIsBetter | below 5 | 5 to 9 | at or above 10 | More than 10 open decisions per programme signals governance overload | PortfolioOwner |
| governance_cadence_attendance_pct | HigherIsBetter | at or above 90 | 70 to 89 | below 70 | S04P5 attendance threshold for working cadence | PortfolioOwner |
| cadence_theatre_count_per_programme | LowerIsBetter | 0 | 1 to 2 | 3 or more | More than 2 cadences classified Theatre signals stack collapse | PortfolioOwner |
| raci_gap_pct | LowerIsBetter | below 5.0 | 5.0 to 9.99 | at or above 10.0 | Gap above 10 percent means responsibility holes in working grid | PortfolioOwner |
| raci_overlap_pct | LowerIsBetter | below 8.0 | 8.0 to 14.99 | at or above 15.0 | Overlap above 15 percent means competing accountability | PortfolioOwner |
| escalation_contract_staleness_days | LowerIsBetter | below 90 | 90 to 179 | at or above 180 | Contract older than 180 days without re-validation is unenforceable | PortfolioOwner |
| steerco_pre_read_issuance_pct | HigherIsBetter | at or above 90 | 70 to 89 | below 70 | Pre-read issuance below 70 percent means steerco becomes post-read | PortfolioOwner |
| weekly_commitment_delta_abs_pct | LowerIsBetter | below 10.0 | 10.0 to 19.99 | at or above 20.0 | Commitment delta above 20 percent indicates planning dysfunction per S04P5 | ProgrammeManager |
| sponsor_engagement_score | HigherIsBetter | at or above 70 | 40 to 69 | below 40 | S04P2 sponsor-on-mute pattern triggers below 40 | PortfolioOwner |

#### 5.2.3 Delivery Health cluster (10 metrics)

| metric_id | Direction | Green | Amber | Red | Rationale | Owner |
|-----------|-----------|-------|-------|-----|-----------|-------|
| cpi | HigherIsBetter | at or above 0.95 | 0.85 to 0.949 | below 0.85 | S08P6 EVM CPI below 0.95 triggers 48-hour scope review per S01P6 | FinanceLead |
| spi | HigherIsBetter | at or above 0.95 | 0.85 to 0.949 | below 0.85 | S08P6 EVM SPI below 0.85 triggers planning reset per S01P6 | ProgrammeManager |
| tcpi | RangeIsBetter | 0.95 to 1.05 | 0.90 to 0.949 OR 1.051 to 1.10 | below 0.90 OR above 1.10 | TCPI outside 0.95 to 1.05 signals EAC divergence | FinanceLead |
| estimation_variance_pct | LowerIsBetter | below 10.0 | 10.0 to 19.99 | at or above 20.0 | S04P1 silent baseline threshold for re-estimate | ProgrammeManager |
| over_optimism_variance_pct | LowerIsBetter | below 5.0 | 5.0 to 9.99 | at or above 10.0 | Prediction vs actual divergence above 10 percent is unreliable reporting | ProgrammeManager |
| transition_readiness_pct | HigherIsBetter | at or above 85 | 70 to 84 | below 70 | Below 70 percent readiness is a cutover risk per S06P7 | ProgrammeManager |
| closeout_readiness_pct | HigherIsBetter | at or above 85 | 60 to 84 | below 60 | S08P10 closeout discipline threshold | ProgrammeManager |
| scope_definition_score | HigherIsBetter | at or above 75 | 50 to 74 | below 50 | S06P1 kickoff-quality benchmark | ProgrammeManager |
| dora_lead_time_days | LowerIsBetter | below 7.0 | 7.0 to 29.99 | at or above 30.0 | DORA Accelerate High band upper bound | ProgrammeManager |
| dora_change_failure_rate_pct | LowerIsBetter | below 15.0 | 15.0 to 29.99 | at or above 30.0 | DORA Accelerate High band upper bound | ProgrammeManager |

#### 5.2.4 Financials and PnL cluster (8 metrics)

| metric_id | Direction | Green | Amber | Red | Rationale | Owner |
|-----------|-----------|-------|-------|-----|-----------|-------|
| programme_margin_pct | HigherIsBetter | above 28.0 | 22.0 to 27.99 | below 22.0 | Programme-level floor; below 22 percent triggers recovery protocol | FinanceLead |
| dso_days | LowerIsBetter | below 45 | 45 to 59 | at or above 60 | Industry DSO convention; above 60 days is working-capital risk | FinanceLead |
| rate_card_drift_pct | RangeIsBetter | minus 2.0 to 2.0 | minus 5.0 to minus 2.01 OR 2.01 to 5.0 | below minus 5.0 OR above 5.0 | S08P3 rate card arbitrage threshold | FinanceLead |
| utilization_max_gap_points | LowerIsBetter | below 3.0 | 3.0 to 6.99 | at or above 7.0 | Multi-system gap above 7 points indicates data-integrity issue per S08P4 | FinanceLead |
| revenue_leakage_usd_per_month | LowerIsBetter | below 15000 | 15000 to 49999 | at or above 50000 | Five-mechanism cumulative floor per S08P7 | FinanceLead |
| five_leak_anatomy_bps | LowerIsBetter | below 150 | 150 to 399 | at or above 400 | S04P4 margin leak compression threshold; 810 bps is the extreme example | FinanceLead |
| cr_processing_ratio | LowerIsBetter | below 0.25 | 0.25 to 0.49 | at or above 0.50 | S08P8 CR processing cost exceeds change value beyond 0.5 | ProgrammeManager |
| urgent_bypass_rate_pct | LowerIsBetter | below 10.0 | 10.0 to 24.99 | at or above 25.0 | S06P8 3x multiplier applied; above 25 percent bypass indicates broken change control | ProgrammeManager |

#### 5.2.5 Commercial cluster (6 metrics)

| metric_id | Direction | Green | Amber | Red | Rationale | Owner |
|-----------|-----------|-------|-------|-----|-----------|-------|
| pipeline_coverage_ratio | HigherIsBetter | at or above 3.0 | 2.0 to 2.99 | below 2.0 | Pipeline to quota coverage industry convention | PortfolioOwner |
| qbr_cadence_on_time_pct | HigherIsBetter | at or above 90 | 75 to 89 | below 75 | QBR slippage threshold per S08P9 | PortfolioOwner |
| qbr_quality_score | HigherIsBetter | at or above 75 | 50 to 74 | below 50 | Hub 17-minute QBR quality benchmark | PortfolioOwner |
| qbr_theatre_flag_count | LowerIsBetter | 0 | 1 to 2 | 3 or more | More than 2 theatre-flag QBRs per quarter is systemic | PortfolioOwner |
| renewal_probability_pct | HigherIsBetter | at or above 80 | 60 to 79 | below 60 | Renewal probability floor to avoid revenue cliff | FinanceLead |
| contract_renewal_window_days_to_close | LowerIsBetter | below 30 | 30 to 59 | at or above 60 | Artefact expiring in more than 60 days window is low-priority; inside 30 is act-now | FinanceLead |

#### 5.2.6 People and Capability cluster (8 metrics)

| metric_id | Direction | Green | Amber | Red | Rationale | Owner |
|-----------|-----------|-------|-------|-----|-----------|-------|
| utilization_pct | HigherIsBetter | at or above 80.0 | 72.0 to 79.99 | below 72.0 | S01P6 utilization floor; below 72 compounds bench cost | FinanceLead |
| overtime_hours_pct | LowerIsBetter | below 10.0 | 10.0 to 19.99 | at or above 20.0 | Workforce sustainability threshold per rev 3 | PortfolioOwner |
| bus_factor | HigherIsBetter | at or above 4 | 2 to 3 | 1 or 0 | Bus factor 1 is a single point of failure | PortfolioOwner |
| team_health_index | HigherIsBetter | at or above 70 | 50 to 69 | below 50 | Composite of bus factor, overtime, sentiment | PortfolioOwner |
| attrition_rate_pct_ttm | LowerIsBetter | below 12.0 | 12.0 to 17.99 | at or above 18.0 | Industry attrition floor for sustained delivery | PortfolioOwner |
| bench_aging_days | LowerIsBetter | below 21 | 21 to 44 | at or above 45 | Rev 4 bench aging bands per 4.38 entity design | PortfolioOwner |
| dm_succession_readiness_score | HigherIsBetter | at or above 60 | 30 to 59 | below 30 | Below 30 means no ready successor per S10 Part 05 | PortfolioOwner |
| hiring_funnel_time_to_fill_days | LowerIsBetter | below 45 | 45 to 89 | at or above 90 | 90 days open role signals funnel break | PortfolioOwner |

#### 5.2.7 Risk, SLA, and Client Health cluster (6 metrics)

| metric_id | Direction | Green | Amber | Red | Rationale | Owner |
|-----------|-----------|-------|-------|-----|-----------|-------|
| raid_risk_count_high | LowerIsBetter | below 3 | 3 to 5 | at or above 6 | High-severity risk count per programme; above 6 is overload | ProgrammeManager |
| escalation_timing_late_pct | LowerIsBetter | below 15.0 | 15.0 to 29.99 | at or above 30.0 | S06P6 escalate-early principle; late above 30 percent is culture issue | PortfolioOwner |
| sla_tier1_breach_count_mtd | LowerIsBetter | 0 | 1 | 2 or more | S01P6 SLA Tier 1 breach triggers escalation | ProgrammeManager |
| incident_p1_mttr_hours | LowerIsBetter | below 4.0 | 4.0 to 7.99 | at or above 8.0 | P1 incident recovery time industry convention | ProgrammeManager |
| client_health_composite | HigherIsBetter | at or above 70 | 50 to 69 | below 50 | Rev 3 composite signal floor | PortfolioOwner |
| audit_trail_write_events_per_day | RangeIsBetter | 50 to 5000 | 10 to 49 OR 5001 to 20000 | below 10 OR above 20000 | Range detects both silent governance (too low) and incident storm (too high) | PortfolioOwner (AP) |

#### 5.2.8 AI and Innovation cluster (4 metrics)

| metric_id | Direction | Green | Amber | Red | Rationale | Owner |
|-----------|-----------|-------|-------|-----|-----------|-------|
| ai_risk_red_count | LowerIsBetter | 0 | 1 to 3 | 4 or more | Red-tier AI use cases without mitigations per S03 | PortfolioOwner (AP) |
| ai_quality_gate_pass_rate_pct | HigherIsBetter | at or above 95.0 | 85.0 to 94.99 | below 85.0 | S03 quality-gate rigor | PortfolioOwner (AP) |
| ai_shadow_discovery_count | LowerIsBetter | below 3 | 3 to 9 | at or above 10 | Shadow IT count from quarterly survey per S03 Part 1 | PortfolioOwner (AP) |
| ai_delivery_speed_gap_points | LowerIsBetter | below 10 | 10 to 24 | at or above 25 | S02P4 productivity-vs-throughput gap threshold | PortfolioOwner |

Total: 8 + 10 + 10 + 8 + 6 + 8 + 6 + 4 = 60. Every metric maps to a rev 3 or rev 4 entity's generated column or computed aggregate. Ownership of calibration changes follows the owning role; all edits audit through `audit_trail_entries`. Design Foundations rev 4 locks the list; changes post-signoff require a D-decision.

## 6. Drill paths (revision 3 additions)

| New drill | L1 | L2 | L3 |
|-----------|-----|-----|----|
| Decision velocity | Portfolio decision queue | Programme decisions | Single decision with resolution history |
| Team sustainability | Portfolio bus factor | Programme sustainability | Person-level factors (role-gated) |
| Scope debt | Portfolio debt USD | Programme debt items | Debt item with origin and margin impact |
| Value realisation | Portfolio score | Programme realisation | Business case outcome attestation detail |
| Estimation variance | Portfolio average | Programme Silent vs Locked vs Realised | Explanation of variance |

### 6.1 Drill paths (revision 4 additions)

| New drill | L1 | L2 | L3 |
|-----------|-----|-----|----|
| Governance health | Portfolio cadence health | Programme cadence calendar with attendance and decision counts | Single cadence occurrence with attendees, decisions made, commitments captured |
| RACI integrity | Portfolio gap and overlap counts | Programme RACI matrix grid | Single activity row with role assignments, gap or overlap reason |
| Escalation contract | Portfolio decision class authority map | Programme escalation contract per class | Tier ladder with named owners and SLAs |
| Sponsor engagement | Portfolio sponsor engagement scorecard | Per-sponsor trend over last 6 months | Single meeting attendance and decision count |
| Weekly commitment | Portfolio commitment-vs-delivery trend | Programme weekly commitment table | Single team-week with reason text when delta exceeds threshold |
| Account concentration | Portfolio concentration band | Single client revenue and margin contribution | Programme list under that client with status |
| Friday forecast | Portfolio forecast confidence | Programme commentary with self-assessment | Single week commentary text plus flags |
| Bench deep dive | Portfolio bench USD and headcount | Bench roster table with state and recommended action | Single person with skills, days on bench, last refresh, recommended redeployment match |
| Skills heat map | Portfolio skills coverage | Skill demand vs supply by skill | Person list at requested level for that skill |
| DM succession | Portfolio coverage state distribution | Per-DM signal panel | Successor candidates ranked with readiness scores |
| Hiring funnel | Portfolio open requisitions | Funnel by role x band x geo | Single requisition with stage counts and time-to-fill |
| EVM | Portfolio CPI and SPI distribution | Programme EVM time series | Snapshot detail with EAC, ETC, VAC, TCPI |
| Rate card drift | Portfolio drift average | Programme drift by band | Single band rate plan vs actual with skill-mix narrative |
| Utilization reconciliation | Portfolio reconciliation max-gap distribution | Programme three-system view | Reconciliation method narrative |
| Revenue leakage | Portfolio leakage USD by mechanism | Programme leakage by mechanism by month | Single attribution with evidence text |
| Urgent bypass | Portfolio bypass count and rework cost | Programme bypass list | Single request with multiplier applied and rework cost |
| CR processing cost | Portfolio threshold breach count | Programme CRs ranked by ratio | Single CR with role-hours breakdown |
| Closeout readiness | Portfolio closeout score | Programme closeout component breakdown | Single checklist item status and evidence |
| Contract lifecycle | Portfolio renewal calendar | Programme artefact list with cliff dates | Single artefact red-flag text |
| QBR quality | Portfolio QBR quality score distribution | Per-QBR detail | Theatre flag with slide count and decisions made |
| Five-leak anatomy | Portfolio bps lost view | Programme month-by-month leak split | Largest-leak narrative for the month |
| Scope intervention | Portfolio interventions applied count | Programme intervention checklist | Single intervention effectiveness score and evidence |
| Distributed decision tax | Portfolio worst-tax decisions | Programme list of decisions with elevated tax | Single decision iteration log |
| Scope definition quality | Portfolio average kickoff quality | Programme single kickoff snapshot | Open questions list at kickoff |
| Over-optimism | Portfolio green-on-green count | Programme weekly streak chart | Week with prediction-vs-actual variance and DM commentary |
| Transition planning | Portfolio transition state distribution | Programme transitions list | Single transition with checklist completion and post-transition defects |
| DORA | Portfolio DORA banding | Programme DORA quartet trend | Monthly snapshot with all 4 metrics |
| Five-why | Portfolio root-cause systemic flag count | RAID list with root-cause analysis | Single 5-why ladder |
| Vendor DoD | Portfolio gap and overlap count | Programme matrix grid | Single workstream row with handoff SLA |
| AI risk tier | Portfolio risk tier mix | Programme AI use case list | Single use case with quality gates and approval status |
| AI quality gate | Portfolio gate pass rate | Programme gates per use case | Single gate evidence and verification record |
| AI shadow IT | Portfolio shadow tools discovered | Quarter-over-quarter trend | Single survey result detail |
| AI delivery speed gap | Portfolio gap distribution | Programme gap trend | Constraint narrative for the month |
| Escalation timing | Portfolio Early vs Late distribution | Programme RAIDs with escalation | Single timing record with outcome |
| Audit trail | Activity volume by endpoint | Filter by user, role, resource, time window | Single mutation entry with before and after JSON |
| Onboarding | Self-only progress view | Week-by-week checklist | Single item with evidence link |

## 7 to 13. Unchanged from revision 2

Data refresh cadence, data quality rules, migration strategy, indexes, OpenAPI contract, non-functional requirements, test acceptance.

New indexes added in revision 3:

| Index | Rationale |
|-------|-----------|
| `decisions (programme_id, status, opened_at DESC)` | Decision queue view |
| `team_sustainability_signals (programme_id, month DESC)` | Trend query |
| `scope_debt (programme_id, origin, status)` | Register view |
| `value_realisation (programme_id, captured_at DESC)` | Quarterly view |
| `estimation_baselines (programme_id, baseline_type)` | Variance compare |
| `ai_defect_attribution (programme_id, origin, month)` | Attribution chart |
| `qbr_records (programme_id, qbr_date DESC)` | QBR history |

New indexes added in revision 4:

| Index | Rationale |
|-------|-----------|
| `governance_cadence (programme_id, cadence_type)` UNIQUE | Cadence calendar view, integrity |
| `raci_matrix (programme_id, workstream, activity)` UNIQUE | Matrix render and gap detection |
| `raci_matrix (programme_id, gap_flag, overlap_flag)` partial WHERE gap_flag OR overlap_flag | Theatre detection scan |
| `escalation_contract (programme_id, decision_class, authority_tier)` UNIQUE | Contract render |
| `steerco_pre_read (programme_id, steerco_date, decision_id)` UNIQUE | Pre-read kit render |
| `weekly_commitment (programme_id, team_id, week_start)` UNIQUE | Commitment review |
| `weekly_commitment (programme_id, week_start DESC)` | Trend query |
| `sponsor_engagement (programme_id, sponsor_user_id, meeting_id)` UNIQUE | Per-meeting lookup |
| `sponsor_engagement (programme_id, meeting_at DESC)` | Trend query |
| `decisions (programme_id, category, status, opened_at DESC)` | Category-split decision queue |
| `portfolio_drift_signals (as_of_date DESC)` UNIQUE | Daily snapshot integrity |
| `threshold_calibration_register (metric_id)` PK | Lookup by metric |
| `action_playbook (metric_id, state)` UNIQUE | Lookup by metric and state |
| `stakeholder_influence (programme_id, decision_maker_flag, influence_score DESC)` | Influence map |
| `account_concentration (client_id)` UNIQUE | Per-client lookup |
| `account_concentration (concentration_band, revenue_pct_of_portfolio DESC)` | Risk view |
| `portfolio_forecast (as_of_date, scenario)` UNIQUE | Forecast view |
| `friday_forecast_commentary (programme_id, week_ending)` UNIQUE | Commentary lookup |
| `growth_expansion (client_id)` UNIQUE | Expansion tracker lookup |
| `bench_roster (person_id, bench_since)` UNIQUE | Per-cycle lookup |
| `bench_roster (bench_state, bench_days DESC)` partial WHERE bench_state IN ('Aging','AtRisk') | Aging report |
| `skills_inventory (person_id, skill_code)` UNIQUE | Person-skill lookup |
| `skills_inventory USING GIN (skills_json)` | Fuzzy skill search |
| `skill_demand_signals (programme_id, skill_code, as_of_month)` UNIQUE | Demand snapshot |
| `bench_to_demand_match (person_id, fit_score DESC)` | Best-match query |
| `dm_succession_signals (dm_user_id)` UNIQUE | Per-DM lookup |
| `dm_succession_signals (coverage_state, flight_risk_score DESC)` | Risk roll-up |
| `hiring_funnel (role_code, band, geo, as_of_month)` UNIQUE | Funnel snapshot |
| `dm_retention_conversation (dm_user_id, conversation_at DESC)` | Conversation history (PO-only RLS) |
| `evm_snapshots (programme_id, as_of_date DESC)` | Time series |
| `evm_snapshots (state, as_of_date DESC)` partial WHERE state IN ('Slipping','Failing') | Risk dashboard |
| `rate_card_effective (programme_id, band, as_of_month)` UNIQUE | Drift lookup |
| `utilization_reconciliation (programme_id, as_of_date DESC)` | Trend |
| `revenue_leakage_mechanism (programme_id, mechanism, attribution_month)` UNIQUE | Mechanism snapshot |
| `urgent_request_bypass (programme_id, raised_at DESC)` | Bypass list |
| `cr_processing_cost (cr_id)` UNIQUE | Per-CR lookup |
| `cr_processing_cost (threshold_breach_flag, ratio DESC)` partial WHERE threshold_breach_flag | Breach scan |
| `closeout_readiness (programme_id, component, checklist_item)` UNIQUE | Checklist lookup |
| `contract_artefacts (programme_id, artefact_type, artefact_date DESC)` | Lifecycle view |
| `contract_artefacts (renewal_window_close ASC)` partial WHERE renewal_window_close IS NOT NULL | Renewal calendar |
| `estimation_negotiation (programme_id, negotiated_at DESC)` | Negotiation history |
| `qbr_quality_score (qbr_id)` UNIQUE | Per-QBR lookup |
| `five_leak_anatomy_snapshot (programme_id, as_of_month DESC)` | Trend |
| `scope_creep_intervention (programme_id, intervention_type)` UNIQUE | Per-intervention lookup |
| `distributed_decision_tax (decision_id)` UNIQUE | Per-decision lookup |
| `scope_definition_quality (programme_id)` UNIQUE | Per-programme kickoff |
| `over_optimism_flags (programme_id, as_of_week DESC)` | Streak chart |
| `over_optimism_flags (green_on_green_flag, as_of_week DESC)` partial WHERE green_on_green_flag | Risk scan |
| `transition_plan (programme_id, transition_at DESC)` | Transition history |
| `dora_metrics (programme_id, as_of_month DESC)` | DORA trend |
| `five_why_register (raid_id)` UNIQUE | Per-RAID lookup |
| `vendor_dod_matrix (programme_id, vendor_id, workstream)` UNIQUE | Matrix lookup |
| `ai_use_case (programme_id, tool_id, task_category)` UNIQUE | Use case lookup |
| `ai_use_case (risk_tier, approval_status)` partial WHERE risk_tier IN ('Amber','Red') | Risk scan |
| `ai_quality_gate (ai_use_case_id, gate_name)` UNIQUE | Gate lookup |
| `ai_governance_cadence (next_report_date ASC)` | Upcoming report scan |
| `ai_shadow_survey (run_at DESC)` UNIQUE | Survey snapshot |
| `ai_five_unsolvable (programme_id, problem, as_of_month)` UNIQUE | Per-problem lookup |
| `ai_delivery_speed_gap (programme_id, as_of_month DESC)` | Gap trend |
| `escalation_timing (raid_id)` UNIQUE | Per-RAID lookup |
| `audit_trail_entries (occurred_at DESC)` | Most-recent activity |
| `audit_trail_entries (actor_user_id, occurred_at DESC)` | Per-user audit |
| `audit_trail_entries (resource_type, resource_id, occurred_at DESC)` | Per-resource audit |
| `audit_trail_entries (endpoint, occurred_at DESC)` | Per-endpoint audit |
| `onboarding_checklist (user_id, checklist_item)` UNIQUE | User checklist lookup |
| `onboarding_checklist (user_id, week_number, sequence)` | Weekly view |
| `escalation_tier_config (tier_number)` PK | Tier lookup |
| `escalation_tier_config (active, tier_number)` partial WHERE active | Active-tier ladder render |

FK constraint posture for revision 4: every FK declared NOT NULL except where business case for NULL is explicit (`bench_roster.source_programme_id` for new hires never deployed, `growth_expansion.delivery_originated_deal_ids` array can be empty, `friday_forecast_commentary.flags_json` optional, `audit_trail_entries.resource_id` allowed NULL for global actions). Every NULL allowance is documented in the entity schema notes column above.

## 14. Release gating

Revision 3 signed off when Adi approves the seven new entities, two field expansions, and the gap-closure drill paths. Schema changes post-signoff require a DECISION_LOG entry.

### 14.1 Revision 4 release gating

Revision 4 signs off when Adi approves all of the following, in order:

1. The 50 new entities listed in section 3.1, schema-by-schema in sections 4.23 through 4.72.
2. The decisions extension (`category` enum) with backfill procedure as described in section 4.29.
3. The role access matrix in section 3.1.10 covering Portfolio Owner, Programme Manager, Finance Lead, Read Only, and the new Security Auditor role.
4. The seed determinism rule unchanged at `SEED = 20260424` and the rev 4 distributions in section 5.1.
5. The rev 4 drill paths in section 6.1 covering all 36 new drills.
6. The rev 4 indexes in the section preceding 14, including FK NOT NULL posture and named NULL allowances.
7. Approximate volumes confirmed: 50 new entities, ~22,000 new seeded rows, ~85 entities total at rev 4, ~30,000 seeded rows total at rev 4.

Revision 4 schema changes post-signoff require a DECISION_LOG entry under a D-NNN identifier and cascade to the corresponding tab PRD rev 4, the wireframe rev 4, the intelligence layer module, and the test plan in `docs/test/`.

Cascade dependencies on revision 4 closure:
- M2 PRD suite revision 4: 13 existing tab PRDs to rev 4, 3 new tab PRDs (v1_16, v1_17, v1_18), 4 cross-cutting PRDs to rev 2, 2 new cross-cutting PRDs (Audit Trail Console, Onboarding First 90 Days), Master PRD to rev 3, Intelligence Layer PRD to rev 3, Security Auth PRD to rev 3, Design Foundations to rev 4 (adds 2 new locked Hub phrases per IMPLEMENTATION_PLAN section 9.2). 26 PRD files in total.
- M1 wireframe rev 4: 3 new HTML files plus 12 existing HTML files to rev 4 plus 3 cross-cutting wireframes (audit trail console, board pack preview, onboarding first 90 days). 17 wireframe files in total.
- M4 test strategy rev 2: 5 new test plan documents (10 Governance Tests, 11 Capability Tests, 12 AI Governance Tests, 13 EVM Tests, 14 Audit Trail Tests) plus 4 existing rev 2 (Contract Tests, Playwright E2E, Voice Regression, Role Gating).
- M5 subagent roster rev 2: 9 specs updated for rev 4 entity scope.
- Voice golden snapshots: 45 at rev 3 to 54 at rev 4 (3 new tabs x 3 states).
- Endpoint inventory: ~92 at rev 3 to ~135 at rev 4.

Open assumptions and post-Phase 1 resolutions:

A. RESOLVED per Q1 ruling. The 5-tier default taxonomy (tier 1 DM, tier 2 Programme Director, tier 3 Portfolio Owner, tier 4 Sponsor, tier 5 Steerco) is retained as factory default. Tenant-level rename capability is added via the new `escalation_tier_config` table (entity 4.73) which exposes `display_label` editable by Portfolio Owner through the Admin Console on v1_16. Check constraint widens to CHECK between 1 and 9 to permit extension by tenants that run a deeper ladder. No display change is a schema change; renames propagate at render time because surfaces read `display_label` from the config table.

B. OPEN. The 60 metrics seeded into `threshold_calibration_register` will be enumerated early on Adi's preference per Q2 ruling: full list to be surfaced before Phase 2 begins, then formally locked inside Design Foundations rev 4 during Phase 2 turn 3. List draws from rev 3 metric inventory plus the rev 4 new metrics.

C. RESOLVED per Q3 ruling. Security Auditor is not a separate user identity. Replaced by Audit Permission (AP) flag on Portfolio Owner, Delivery Director, or Finance Lead accounts. Default false. Grant path is both SSO group membership and local admin provisioning for on-prem installs. `audit_trail_entries` full-read requires AP flag true on the calling account; `ai_governance` entity reads retain the AP grant for audit-scope queries. Role access matrix in 3.1.10 updated. Auth binding lives in `03_PRD_Security_Auth.md` rev 3 Phase 2.

D. RESOLVED per Q4 ruling. Option A (full `before_json` and `after_json` per event) locked for v1.0.0. `audit_trail_entries` stores complete pre- and post-mutation state per event. Storage growth factor of 1.0x accepted as the baseline. Forensic completeness and reconstruction-free querying are the deciding criteria. Post-v1 storage review can re-open to Option B (diff plus nightly snapshot compaction) as a D-decision if production row count materially exceeds the rev 4 10,000-event demo seed, but until then Option A is the rule. No schema change required from the rev 4 default.

E. RESOLVED per Q5 ruling. `onboarding_checklist` row visibility expanded to: self read and write on own rows; Portfolio Owner read on all; Delivery Director read on all; HR Business Partner read on all; Programme Manager read scoped to rows where the owning user is allocated to the PM's programme. Two new roles introduced in rev 4 (Delivery Director, HR Business Partner) with full cross-entity access policy deferred to `03_PRD_Security_Auth.md` rev 3 in Phase 2. Data Model PRD rev 4 populates DD and HRBP columns in 3.1.10 only where rulings are explicit; other cells default to "none" pending Phase 2.

F. RESOLVED per Q6 ruling. `GENERATED ALWAYS AS ... STORED` is retained on all 5 tables (`evm_snapshots`, `cr_processing_cost`, `utilization_reconciliation`, `portfolio_drift_signals`, `five_leak_anatomy_snapshot`). Data accuracy is the priority. Virtual computed columns rejected because API-layer duplication introduces drift risk and forfeits direct index support. If physical row size becomes a measured issue in production, the decision is re-opened as a D-decision against this ruling. Until then, STORED is the rule for every rev 4 derived column.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes all severity-1 data gaps identified in GAP_ANALYSIS_DCC_vs_Hub_2026-04-24.md plus multiple severity-2.*

*Revision 4 owner: Claude. Signoff: Adi (pending Phase 1 close review). Closes all 50 use cases catalogued in `docs/state/UC_TO_DASHBOARD_MAPPING_2026-04-24.md` per IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md Option 1 Full execution.*
