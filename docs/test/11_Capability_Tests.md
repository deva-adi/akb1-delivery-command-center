# 11_Capability_Tests.md
### Capability and Supply Chain Test Plan | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> Test plan for v1_17 Capability and Supply Chain. Inherits from `01_Test_Strategy_Master.md`. Anchors PRD 24 release gating.

---

## 1. Scope

Validation of all 8 panels on v1_17. Covers UC-B (bench deep dive), UC-E (DM succession), UC-E2 (retention conversation note encryption per Q5), UC-J (hiring funnel), UC-BB (pyramid shift overlay), UC-T (margin literacy 60-second test).

## 2. Test layers

| Layer | Coverage |
|-------|----------|
| Unit | Bench aging band classification, fit_score calculation, DM coverage state derivation, hiring funnel time-to-fill aggregation |
| Integration | All 14 endpoints in PRD 24 section 10, dm_retention_conversation note encryption verification |
| E2E | 8 Playwright scenarios per PRD 24 section 13 |
| Voice | "Strategic capability, not operational roster." subtitle |
| Role gating | 7-role matrix with HRBP-specific access plus PM-restricted scope |
| Performance | Skills heat map under 300 ms, kanban under 200 ms, succession grid under 150 ms |

## 3. Unit tests

### 3.1 Bench aging band classification

```
test_bench_state_active_below_21_days:
  given: bench_since == today - 14 days
  expect: bench_state == 'Active'

test_bench_state_aging_at_22_days:
  given: bench_since == today - 22 days
  expect: bench_state == 'Aging'

test_bench_state_at_risk_above_45:
  given: bench_since == today - 47 days
  expect: bench_state == 'AtRisk'

test_bench_aging_strip_distribution:
  given: 30 bench rows with varied bench_since dates
  expect: counts in buckets [under 21, 21 to 44, above 45] sum to 30
```

### 3.2 Fit score calculation (bench-to-demand match)

```
test_fit_score_full_skill_match_same_band:
  given: person with skills [aws_emr at 4, python at 5], opportunity demanding aws_emr at 3 and python at 4, both at B3
  expect: fit_score >= 80

test_fit_score_partial_skill_match:
  given: person matches 1 of 3 required skills, same band and geo
  expect: fit_score in range 30 to 50

test_fit_score_band_mismatch:
  given: full skill match but person at B2 demand at B4
  expect: fit_score reduced by band penalty
```

### 3.3 DM coverage state derivation

```
test_dm_succession_critical_when_low_readiness:
  given: dm_succession_signals.successor_readiness_score == 22
  expect: coverage_state == 'Critical'

test_dm_succession_thin_at_50:
  given: successor_readiness_score == 50
  expect: coverage_state == 'Thin'

test_dm_succession_strong_at_85:
  given: successor_readiness_score == 85
  expect: coverage_state == 'Strong'

test_single_point_of_failure_flag:
  given: successor_readiness_score == 25
  expect: single_point_of_failure_flag == true
```

### 3.4 Hiring funnel aggregation

```
test_time_to_fill_average_excludes_open:
  given: 10 requisitions, 6 joined, 4 still open
  expect: time_to_fill_days uses 6 joined rows only

test_funnel_health_stalled_when_open_above_90:
  given: requisition open 92 days
  expect: funnel_health == 'Stalled'
```

## 4. Integration tests

### 4.1 Endpoint contract

All 14 endpoints in PRD 24 section 10 contract-tested via schemathesis.

### 4.2 DM Retention Conversation note encryption

```
test_dm_retention_note_encrypted_at_rest:
  given: POST /capability/dm-retention-conversation with note_text
  when: query Postgres directly with admin user
  expect: stored value is bytea ciphertext, not cleartext

test_dm_retention_note_visible_to_PO:
  given: PO calls GET /capability/dm-retention-conversation/{id}/reveal
  expect: response includes decrypted note_text
  expect: audit_trail_entries row written with resource_id

test_dm_retention_note_blocked_for_PM:
  given: PM calls GET /capability/dm-retention-conversation
  expect: 403 Forbidden
```

### 4.3 Bench-to-demand kanban status patch

```
test_kanban_status_progression:
  given: match in 'Suggested' state
  when: PATCH /capability/bench-to-demand-match/{id}/status with status='Confirmed'
  expect:
    - 200 response
    - audit_trail_entries row with before status='Suggested' and after status='Confirmed'
```

## 5. E2E tests

Per PRD 24 section 13. Spec file: `tests/e2e/capability.spec.ts`. 8 scenarios.

## 6. Voice regression

| Snapshot | Phrase |
|----------|--------|
| `capability_subtitle.snap` | "Strategic capability, not operational roster." |
| `capability_dm_action.snap` | "Open formal succession programme with named ready successors." |
| `capability_bench_action.snap` | "Reskill or Rebadge bench aging above 45 days within 30 days." |

## 7. Role gating

7-role matrix per PRD 24 section 2.

```
expect_PO_full: bench_roster, skills_inventory, skill_demand_signals, ..., dm_retention (with view but no write)
expect_DD_full_org_scope: same as PO but filtered to delivery_org
expect_HRBP_partial: full access to bench, skills, hiring funnel, dm_succession; no access to dm_retention
expect_PM_restricted: read-only on own-programme bench rolloffs and skill_demand
expect_FL_minimal: bench_tax cross-link only
expect_RO_aggregate: aggregate panels only, no per-person detail
```

## 8. Performance benchmarks

| Endpoint | Target |
|----------|--------|
| GET /capability/skills-heat-map | p95 under 300 ms (30 skills x 7 bands) |
| GET /capability/bench-to-demand-match | p95 under 200 ms (240 cards) |
| GET /capability/dm-succession | p95 under 150 ms |
| GET /capability/hiring-funnel | p95 under 300 ms |
| GET /capability/person/{id}/drawer | p95 under 400 ms (skills plus matches) |

## 9. Acceptance gate

Test plan ships when:
1. 16 unit tests green
2. 8 Playwright scenarios green
3. 3 voice snapshots locked
4. DM retention encryption verified at rest
5. PM scope restriction verified
6. HRBP retention block verified
7. Performance gates met

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Anchors PRD 24 Capability and Supply Chain release gating.*
