# 14_Audit_Trail_Tests.md
### Audit Trail Test Plan | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> Test plan for the Audit Trail Console (UC-K) and the cross-cutting append-only invariant on `audit_trail_entries`. Anchors PRD 26 release gating.

---

## 1. Scope

The audit trail invariants apply across the entire application: every PATCH, POST, DELETE on a sensitive resource writes a full-snapshot row. This plan validates the invariant per Q4 Option A ruling, the AP flag enforcement, the export chain-of-custody, and the console performance.

## 2. Test layers

| Layer | Coverage |
|-------|----------|
| Unit | Append-only invariant, snapshot population on every mutation, redaction logic for non-AP callers |
| Integration | All 7 endpoints in PRD 26 section 10. Cross-cutting: every rev 4 PATCH/POST writes audit row |
| E2E | 6 Playwright scenarios per PRD 26 section 13 |
| Security | Direct SQL UPDATE attempt blocked, DELETE blocked, export signature validated |
| Performance | 10,000-row query under 600 ms, single filter under 600 ms |

## 3. Append-only invariant

### 3.1 Application layer

```
test_no_update_endpoint_for_audit_trail:
  given: scan FastAPI route table for /audit/...
  expect: zero PATCH or PUT routes against audit_trail_entries
  expect: zero DELETE routes against audit_trail_entries

test_attempt_direct_orm_update_blocked:
  given: SQLAlchemy session
  when: session.query(AuditTrailEntry).update({...})
  expect: raises PermissionError or repository pattern blocks at boundary
```

### 3.2 Database layer

```
test_postgres_grants_revoke_update_delete:
  given: production-grade migration applied
  when: query pg_role_grants for audit_trail_entries
  expect: no role has UPDATE or DELETE privilege

test_direct_sql_update_attempt:
  given: superuser session
  when: UPDATE audit_trail_entries SET actor_user_id = ... WHERE entry_id = ...
  expect: rejected via REVOKE plus audit policy

test_direct_sql_delete_attempt:
  given: superuser session
  when: DELETE FROM audit_trail_entries
  expect: rejected
```

## 4. Snapshot population (Q4 Option A rule)

### 4.1 Cross-cutting invariant: every rev 4 PATCH/POST writes audit row

Test enumerates the rev 4 mutating endpoints and asserts each writes a corresponding audit_trail_entries row with full before_json and after_json populated.

```
endpoints_under_audit = [
  "/api/v1/admin/tier-config/{n}",
  "/api/v1/admin/threshold-register/{id}",
  "/api/v1/decisions",
  "/api/v1/raid/{id}",
  "/api/v1/governance/raci-matrix/{cell}",
  "/api/v1/governance/escalation-contract/{id}",
  "/api/v1/governance/steerco-pre-read",
  "/api/v1/governance/weekly-commitment",
  "/api/v1/capability/bench-roster/{id}/action",
  "/api/v1/capability/bench-to-demand-match/{id}/status",
  "/api/v1/capability/dm-retention-conversation",
  "/api/v1/ai-governance/use-case/{id}/approval",
  "/api/v1/ai-governance/quality-gate/{id}/status",
  "/api/v1/ai-governance/cadence/{id}/frequency",
  "/api/v1/ai-governance/shadow-survey/trigger",
  "/api/v1/financials/revenue-leakage/{id}/recoverable",
  "/api/v1/scenario-planner/friday-forecast/{programme}/{week}",
  "/api/v1/onboarding/item/{id}/status",
  "/api/v1/onboarding/item/{id}/evidence"
]

for endpoint in endpoints_under_audit:
  test:
    when: authorized PATCH or POST request
    expect:
      - response 200 or 201
      - audit_trail_entries row written within same transaction
      - before_json contains pre-mutation entity state
      - after_json contains post-mutation entity state
      - actor_user_id, actor_role, endpoint, http_method, occurred_at populated
```

### 4.2 Snapshot completeness

```
test_before_json_full_state_not_diff:
  given: PATCH /api/v1/decisions/{id} with status update
  expect: before_json includes ALL fields of decision row, not just changed ones

test_after_json_full_state:
  expect: after_json includes ALL fields after mutation

test_resource_id_populated:
  expect: resource_id matches the entity primary key on every row
```

### 4.3 Sensitive data redaction in snapshots

```
test_dm_retention_note_encrypted_in_after_json:
  given: PATCH dm_retention_conversation with note text
  expect: after_json.note_text is encrypted ciphertext (pgcrypto), not cleartext

test_ai_use_case_approval_full_capture:
  given: PATCH /ai-governance/use-case/{id}/approval
  expect: before_json approval_status='Pending', after_json approval_status='Approved'
  expect: approver user_id captured in after_json
```

## 5. AP flag enforcement

```
test_search_endpoint_full_visibility_AP_PO:
  given: PO with AP flag true
  when: GET /api/v1/audit/search?actor=other_user
  expect: 200, returns rows from other actors

test_search_endpoint_scoped_visibility_PO_no_AP:
  given: PO with AP flag false
  when: GET /api/v1/audit/search?actor=other_user
  expect: rows filtered to current_user_id only

test_per_row_reveal_requires_AP:
  given: PO without AP
  when: GET /api/v1/audit/entry/{id}
  expect: 403 with explanation "Audit Permission required"

test_HRBP_blocked_completely:
  given: HRBP user
  when: GET /audit (any endpoint)
  expect: 403

test_RO_blocked_completely:
  given: RO user
  when: GET /audit
  expect: 403
```

## 6. Export chain-of-custody

```
test_export_endpoint_writes_audit_row:
  given: AP user calls POST /api/v1/audit/export with filter
  expect:
    - bundle file downloads
    - audit_trail_entries row written for the export action itself
    - row resource_type='audit_export' with filter parameters in after_json

test_export_bundle_signature:
  given: downloaded bundle
  when: verify SHA-256 signature against contents
  expect: signature matches

test_export_bundle_signature_tamper_detection:
  given: bundle with one byte modified
  when: verify signature
  expect: signature mismatch detected
```

## 7. Console performance

```
test_search_under_600ms_with_single_filter:
  given: 10,000-row demo seed
  when: GET /api/v1/audit/search?actor=ANANT&time_window=7d
  expect: p95 latency under 600 ms

test_search_under_5s_unfiltered:
  given: 10,000-row demo seed
  when: GET /api/v1/audit/search (no filters)
  expect: p95 latency under 5000 ms (with explicit limit applied)

test_diff_render_under_200ms:
  given: row with 5KB before_json and 5KB after_json
  when: client-side diff render
  expect: under 200 ms
```

## 8. E2E tests

Per PRD 26 section 13. Spec file: `tests/e2e/audit_trail.spec.ts`. 6 scenarios.

## 9. Acceptance gate

Test plan ships when:
1. Append-only invariant verified at application AND database layer
2. Cross-cutting cross-cutting invariant: every rev 4 PATCH/POST endpoint tested for audit row write
3. Full-snapshot rule validated (before_json AND after_json populated per Q4)
4. AP flag enforcement validated for 5 access scenarios
5. Export bundle signature validated
6. 6 Playwright scenarios green
7. Performance gates met (10,000-row query under 600 ms with filter)

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Anchors Q4 Option A full-snapshot rule and append-only invariant.*
