# 10_Governance_Tests.md
### Governance Operating Model Test Plan | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> Test plan for v1_16 Governance Operating Model tab. Inherits from `01_Test_Strategy_Master.md`. Covers PRD 23 release gating items 1 through 9.

---

## 1. Scope

Validation of all 12 panels on v1_16 plus the 14 use cases absorbed (UC-A through UC-A6, UC-Y, UC-Z, UC-R, UC-S cross-link, UC-KK, UC-OO, UC-PP). Includes the new `escalation_tier_config` admin flow per Q1 ruling and the Tier Config Admin audit trail.

## 2. Test layers

| Layer | Coverage |
|-------|----------|
| Unit | Cadence theatre detection rule, RACI gap and overlap calculation, decision latency weighted average, sponsor engagement composite formula, threshold register lookup |
| Integration | All 15 endpoints in PRD 23 section 10, threshold register binding for 10 KPIs |
| E2E | 8 Playwright scenarios per PRD 23 section 13 |
| Voice | "Governance that does not decide is theatre." subtitle and Why-column phrase assertions |
| Role gating | 7-role matrix per PRD 23 section 2 |
| Performance | RACI matrix render under 400 ms, decision queue under 150 ms, threshold register snapshot under 100 ms |

## 3. Unit tests

### 3.1 Cadence theatre detection (UC-OO trigger logic)

```
test_theatre_detection_three_consecutive_low_attendance_zero_decisions:
  given: governance_cadence with 3 consecutive occurrences attendance_rate_pct=55, decisions_made_count=0
  expect: state == 'Theatre'

test_theatre_detection_breaks_on_attendance_recovery:
  given: 3 Theatre occurrences then 1 occurrence attendance_rate_pct=70
  expect: state transitions to 'AtRisk' on the new occurrence

test_theatre_detection_breaks_on_decisions_made:
  given: 3 occurrences attendance_rate_pct=55 but decisions_made_count=2 on the latest
  expect: state == 'AtRisk' not 'Theatre'

test_theatre_detection_two_consecutive_insufficient:
  given: 2 occurrences attendance_rate_pct=50, decisions_made_count=0
  expect: state == 'Healthy' (3-occurrence rule not yet met)
```

### 3.2 RACI gap and overlap calculation

```
test_raci_gap_flag_when_no_responsible:
  given: raci_matrix row with responsible_role=null and accountable_role='PD'
  expect: gap_flag == true

test_raci_gap_flag_when_no_accountable:
  given: raci_matrix row with responsible_role='DM' and accountable_role=null
  expect: gap_flag == true

test_raci_overlap_flag_when_two_accountables:
  given: raci_matrix row with accountable_role='PD' and a second row same activity with accountable_role='DM'
  expect: both rows overlap_flag == true

test_raci_gap_pct_calculation:
  given: 600 raci_matrix rows with 73 gap_flag true
  expect: gap_pct == 12.17 rounded
```

### 3.3 Decision latency weighted average

```
test_decision_latency_weighted_by_programme_tcv:
  given: 3 programmes, latencies [11.2, 7.5, 3.4], TCVs [400M, 280M, 220M]
  expect: weighted_avg == ((11.2*400 + 7.5*280 + 3.4*220) / (400+280+220)) ~= 7.85

test_decision_latency_excludes_open_decisions:
  given: 5 closed decisions and 3 open decisions
  expect: latency calc uses 5 closed only

test_decision_latency_30_day_window:
  given: decisions closed at varying dates including 35 days ago
  expect: closed_at >= now() - interval '30 days' filter applied
```

### 3.4 Sponsor engagement composite

```
test_sponsor_engagement_score_full_attendance_full_decisions:
  given: meeting attended=true, duration_engaged_min=55 of 60, decisions_made=3, deferred=0
  expect: engagement_score in range 90 to 100

test_sponsor_engagement_score_attended_but_silent:
  given: attended=true, duration_engaged_min=10, decisions_made=0, deferred=2
  expect: engagement_score in range 25 to 40 (sponsor on mute)

test_sponsor_engagement_score_no_show:
  given: attended=false
  expect: engagement_score == 0
```

### 3.5 Threshold register lookup

```
test_threshold_register_returns_metric_with_color_band:
  given: metric_id='decision_latency_days', value=7.4
  expect: lookup returns 'Red' (above 5.0)

test_threshold_register_lookup_higher_is_better:
  given: metric_id='governance_cadence_attendance_pct', value=82
  expect: lookup returns 'Amber' (between 70 and 89)

test_threshold_register_lookup_range_is_better:
  given: metric_id='audit_trail_write_events_per_day', value=400
  expect: lookup returns 'Green' (in 50 to 5000 range)

test_threshold_register_no_hardcoded_thresholds_lint:
  given: scan tab_governance.py source
  expect: zero hardcoded threshold literals (lint rule no-hardcoded-thresholds)
```

## 4. Integration tests

### 4.1 Endpoint contract

All 15 endpoints in PRD 23 section 10 contract-tested via schemathesis against Pydantic v2 models.

### 4.2 Tier rename propagation (Q1 acceptance)

```
test_tier_rename_propagates_to_escalation_contract_render:
  given: escalation_tier_config tier 2 display_label='Programme Director'
  when: PATCH /admin/tier-config/2 with display_label='Delivery Director'
  expect:
    - PATCH returns 200
    - audit_trail_entries row written with before/after JSON
    - GET /governance/escalation-contracts?programme=PEGASUS returns tier 2 with new label
```

### 4.3 Decision pre-read join

```
test_decision_queue_extended_columns_when_pre_read_linked:
  given: decision with linked steerco_pre_read row
  expect: GET /governance/decision-queue returns options_text, recommendation_text, deferral_impact_text fields populated

test_decision_queue_no_pre_read_chip:
  given: decision without linked steerco_pre_read row
  expect: response includes pre_read_status='missing' marker
```

### 4.4 Cadence theatre alert chain

```
test_theatre_state_fires_action_playbook:
  given: cadence transitions to Theatre state
  expect:
    - intelligence layer query returns action from action_playbook for cadence_theatre_count metric_id
    - notification 'governance.cadence.theatre' emits to PO, DD, PM per PRD 19 rev 2
```

## 5. E2E (Playwright) tests

Per PRD 23 section 13, 8 scenarios. Spec file: `tests/e2e/governance.spec.ts`.

```
test "PO sees 10 KPIs and 12 panels":
  login as Portfolio Owner with AP
  visit /governance
  assert 10 KPI cards rendered with threshold colours
  assert 12 panels visible (cadence calendar, RACI, escalation contract, etc.)

test "Decision Category filter":
  login as PO
  visit /governance
  click Decision Category chip "Vendor"
  assert decision queue rows all have category=Vendor

test "Tier rename propagates":
  login as PO
  open Tier Config Admin
  edit tier 2 display_label "Programme Director" to "Delivery Director"
  click Save
  visit Escalation Contract panel
  assert tier 2 row shows "Delivery Director"
  assert audit log entry written

test "RACI gap edit drawer":
  login as PO
  click red gap cell on RACI matrix
  assert edit drawer opens with workstream and activity pre-filled

test "Steerco Pre-Read Kit export":
  login as PO
  select Pegasus
  click Export Pre-Read Kit
  assert PPTX downloads with 4-column layout per decision

test "PM does not see Tier Config Admin":
  login as Programme Manager
  visit /governance
  assert Tier Config Admin panel not in DOM

test "DD sees all panels except Admin":
  login as Delivery Director
  visit /governance
  assert all 11 read panels visible
  assert Tier Config Admin panel hidden

test "HRBP cannot access tab":
  login as HR Business Partner
  visit /governance
  assert redirect or 403 with explanation
```

## 6. Voice regression

| Snapshot | Phrase |
|----------|--------|
| `governance_subtitle.snap` | "Governance that does not decide is theatre." (Hub locked R4.3) |
| `governance_drift_action.snap` | "Every programme is green. The portfolio is bleeding." (when drift fires) |
| `governance_theatre_action.snap` | "Move cadence from monthly to fortnightly." |
| `governance_contract_stale_action.snap` | "Re-validate escalation contract before next steerco." |

Snapshots use `pytest-regressions` or equivalent. Comparison is byte-exact; a single character drift fails the test.

## 7. Role gating

Per PRD 23 section 2 access matrix, 7 roles tested. Test matrix encoded in `tests/role_gating/governance.py` mirroring Data Model rev 4 section 3.1.10.

```
roles_with_full_access = [PO, PM (own scope), DD]
roles_with_read_access = [FL, RO]
roles_blocked = [HRBP]
roles_with_audit_permission = [PO_AP, DD_AP, FL_AP]

for each entity in [governance_cadence, raci_matrix, escalation_contract, escalation_tier_config, ...]:
  for each role in roles:
    expect: API response matches role-access matrix cell
```

## 8. Performance benchmarks

Performance gates added to `05_Performance_Benchmarks.md` rev 2:

| Endpoint | Target | Cohort |
|----------|--------|--------|
| GET /governance/snapshot | p95 under 800 ms | 500 concurrent |
| GET /governance/cadence-calendar | p95 under 300 ms | 500 concurrent |
| GET /governance/raci-matrix | p95 under 400 ms | 600 cells per programme |
| GET /governance/decision-queue | p95 under 150 ms | 100 decisions |
| GET /governance/threshold-register | p95 under 100 ms | 60 metrics |

## 9. Acceptance gate

Test plan ships when:
1. 21 unit tests green
2. 8 Playwright scenarios green
3. 4 voice snapshots locked
4. Role-gating matrix verified for 7 roles plus AP flag
5. Performance gates met
6. Lint rule no-hardcoded-thresholds enforced in CI
7. Tier Config Admin audit trail verified end-to-end

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Anchors PRD 23 Governance Operating Model release gating.*
