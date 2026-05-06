# 12_AI_Governance_Tests.md
### AI Governance Test Plan | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> Test plan for v1_18 AI Governance. Inherits from `01_Test_Strategy_Master.md`. Anchors PRD 25 release gating including AP flag enforcement.

---

## 1. Scope

Validation of all 8 panels on v1_18. Covers UC-O 4-phase rollout (shadow inventory, risk tier, quality gates, governance cadence), UC-LL Five Problems AI Cannot Solve, UC-MM Delivery Speed Gap. AP flag enforcement is the central security invariant.

## 2. Test layers

| Layer | Coverage |
|-------|----------|
| Unit | Risk tier classification, quality gate pass rate calculation, gap_points formula |
| Integration | All 17 endpoints in PRD 25 section 10, AP flag gating, audit trail on every PATCH and POST |
| E2E | 9 Playwright scenarios per PRD 25 section 13 |
| Voice | "AI governance is distinct from AI adoption." subtitle |
| Role gating | AP flag matrix, PM programme scope, HRBP block |
| Performance | Risk tier matrix render under 200 ms, quality gate query under 250 ms |

## 3. Unit tests

### 3.1 Risk tier classification triggers

```
test_red_tier_requires_three_quality_gates:
  given: ai_use_case with risk_tier='Red'
  expect: ai_quality_gate count >= 3 (mandatory gates) per use case

test_amber_tier_one_to_two_gates:
  given: risk_tier='Amber'
  expect: ai_quality_gate count in range 1 to 2

test_green_tier_zero_or_one_gate:
  given: risk_tier='Green'
  expect: ai_quality_gate count in range 0 to 1

test_red_tier_pending_blocks_use:
  given: risk_tier='Red' AND approval_status='Pending'
  expect: use case marked unavailable until approved
```

### 3.2 Quality gate pass rate

```
test_pass_rate_excludes_in_progress:
  given: 600 gates: 528 Passed, 18 Failed, 36 InProgress, 18 Waived
  expect: pass_rate_pct == 528 / (528+18) * 100 ~= 96.7 percent
  assert: InProgress and Waived excluded from denominator per PRD 25 section 5.2

test_pass_rate_zero_when_only_in_progress:
  given: 5 gates all InProgress
  expect: pass_rate_pct returns null or 100 with sentinel; not divide by zero
```

### 3.3 Delivery Speed Gap formula

```
test_gap_points_calculation:
  given: individual_productivity_uplift_pct=25, delivery_speed_change_pct=7
  expect: gap_points == 18

test_gap_points_negative_clamped:
  given: productivity_uplift=5, delivery_speed=12
  expect: gap_points == -7 (negative allowed; signals delivery faster than productivity)

test_gap_band_red_above_25:
  given: gap_points == 27
  expect: classification == 'Red' per threshold register
```

### 3.4 Shadow survey trend

```
test_shadow_decreasing_trend:
  given: 4 quarters with tools_previously_unknown=[12, 8, 5, 2]
  expect: trend classification == 'Decreasing' (governance maturing)

test_shadow_increasing_trend:
  given: 4 quarters with [2, 5, 8, 12]
  expect: trend classification == 'Increasing' (alert)
```

## 4. Integration tests

### 4.1 Endpoint contract

All 17 endpoints validated via schemathesis.

### 4.2 AP flag gating

```
test_PO_with_AP_can_view_use_case_detail:
  given: user PO with audit_read_permission=true
  when: GET /ai-governance/use-case/{id}/drawer
  expect: 200 with full payload

test_PO_without_AP_blocked_from_detail:
  given: user PO with audit_read_permission=false
  when: GET /ai-governance/use-case/{id}/drawer
  expect: 403 Forbidden with explanation

test_PO_without_AP_sees_aggregate_KPIs:
  given: user PO without AP
  when: GET /ai-governance/snapshot
  expect: 200 with aggregate counts but per-row detail blocked

test_DD_with_AP_can_approve:
  given: DD with AP, ai_use_case in Pending
  when: PATCH /ai-governance/use-case/{id}/approval with body status=Approved
  expect: 200, audit_trail_entries row written

test_FL_without_AP_no_access:
  given: user FL with AP=false
  when: GET /ai-governance/snapshot
  expect: 403
```

### 4.3 Audit trail on every PATCH and POST

```
test_audit_entry_on_approval:
  given: PATCH /ai-governance/use-case/{id}/approval
  expect: audit_trail_entries row with before_json including approval_status='Pending', after_json with approval_status='Approved'

test_audit_entry_on_gate_status:
  given: PATCH /ai-governance/quality-gate/{id}/status
  expect: audit row with before/after JSON

test_audit_entry_on_cadence_change:
  given: PATCH /ai-governance/cadence/{id}/frequency
  expect: audit row

test_audit_entry_on_shadow_survey_trigger:
  given: POST /ai-governance/shadow-survey/trigger
  expect: audit row recording trigger event
```

### 4.4 Five Unsolvable counts

```
test_five_unsolvable_count_per_problem:
  given: 50 ai_five_unsolvable rows across 10 programmes and 5 problems
  expect: portfolio aggregate returns 5-problem distribution
```

## 5. E2E tests

Per PRD 25 section 13. Spec file: `tests/e2e/ai_governance.spec.ts`. 9 scenarios.

## 6. Voice regression

| Snapshot | Phrase |
|----------|--------|
| `ai_governance_subtitle.snap` | "AI governance is distinct from AI adoption." |
| `ai_governance_red_pending_action.snap` | "Clear the N Pending Red-tier backlog; assign bias assessments within 7 days." |
| `ai_governance_speed_gap_action.snap` | "Individual productivity is up but throughput is flat." |
| `ai_governance_unsolvable_action.snap` | references the five-problem framing per S02P1 |

## 7. Role gating

```
roles_with_ap_full_access = [PO_AP, DD_AP]
roles_with_ap_partial = [FL_AP] (audit_trail and ai_governance reads)
roles_without_ap = [PO, DD, FL] (aggregate KPIs only)
roles_blocked = [HRBP, RO]
roles_scoped = [PM] (own-programme ai_use_case read only)

test: ai_shadow_survey blocked for PM regardless of AP
test: ai_quality_gate evidence reveal requires AP
test: PM cannot trigger shadow survey
```

## 8. Performance benchmarks

| Endpoint | Target |
|----------|--------|
| GET /ai-governance/risk-tier-matrix | p95 under 200 ms |
| GET /ai-governance/quality-gates | p95 under 250 ms (600 gates) |
| GET /ai-governance/shadow-inventory | p95 under 150 ms |
| GET /ai-governance/use-case/{id}/drawer | p95 under 400 ms |

## 9. Acceptance gate

Test plan ships when:
1. 14 unit tests green
2. 9 Playwright scenarios green
3. 4 voice snapshots locked
4. AP flag enforcement verified end-to-end (positive and negative cases)
5. Audit trail Option A full snapshot verified on every mutation
6. Performance gates met
7. Five Problems radar renders correctly

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Anchors PRD 25 AI Governance release gating with AP flag invariant.*
