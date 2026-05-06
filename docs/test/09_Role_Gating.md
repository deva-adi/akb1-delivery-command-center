# 09_Role_Gating.md
### Role Gating | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 expands role taxonomy from 4 to 6 roles plus AP permission flag. Total access matrix grows from approximately 92 rows to approximately 135 rows (one per endpoint). Adds Q5 onboarding visibility and Q1 tier rename audit. Revision 1 content preserved below.
>
> Revision 1: Authorisation matrix tests per role per endpoint. Owner: Security auditor subagent. Enforces D-015 role-scoped primary nav plus PRD-documented access rules.

---

## 1. Role inventory

Four roles at v1:

| Role | Description |
|------|-------------|
| Portfolio Owner | Full read plus mutation on portfolio decisions |
| Programme Manager | Scoped read to assigned programmes plus mutation on own programmes |
| Finance Lead | Full read on financials plus mutation on scenario lock |
| Read Only | Full read on audit-visible surfaces, zero mutation |

## 2. Authorisation matrix

One row per endpoint from the rev 3 PRD set. Columns are the four roles. Cell is Read, Write, Scoped, or Denied. Matrix lives in `backend/app/auth/access_matrix.json` and is the single source of truth. Tests read this file to generate role-gating tests.

## 3. Test pattern

```python
@pytest.mark.parametrize("endpoint,role,expected", matrix_rows())
def test_role_gating(client_factory, endpoint, role, expected):
    c = client_factory(role)
    method = endpoint["method"]
    path = endpoint["path"]
    body = endpoint.get("sample_body") or {}
    r = c.request(method, path, json=body)
    if expected == "Denied":
        assert r.status_code == 403
    elif expected == "Read" and method in ("POST", "PUT", "PATCH", "DELETE"):
        assert r.status_code == 403
    else:
        assert r.status_code in (200, 201, 204)
```

## 4. Scoped-programme test

Programme Manager sees only assigned programmes. Test seeds 10 programmes, assigns 2 to a test Programme Manager, asserts the `/api/v1/delivery/on-time` response contains only those 2 programme keys.

## 5. Rev 3 specific gating rules

| Endpoint | PO | PM | FL | RO |
|----------|----|----|----|----|
| `POST /api/v1/decisions/{id}/close` | Write | Scoped | Denied | Denied |
| `POST /api/v1/vendors/{id}/rationalisation-advance` | Write | Denied | Denied | Denied |
| `POST /api/v1/vendors/{id}/off-board` | Write | Denied | Denied | Denied |
| `POST /api/v1/commercial/qbr-records` | Write | Scoped | Write | Denied |
| `PATCH /api/v1/scenario/{id}/inputs` | Write | Denied | Write | Denied |
| `GET /api/v1/financials/bench-tax-allocation` | Read | Scoped (own programmes) | Read | Read |
| `GET /api/v1/ai/defect-attribution-per-programme` | Read | Scoped | Read | Read |
| `GET /api/v1/client-health/value-realisation-per-programme` | Read | Scoped | Read | Read |

## 6. Primary nav role-scoping

Per D-015, the primary nav is 5 tabs per role. Test verifies the returned nav list matches the documented set exactly. Extras are P0 bugs.

| Role | Primary 5 tabs |
|------|----------------|
| Portfolio Owner | Executive, Risk and RAID, Financials, Workforce, Client Health Radar |
| Programme Manager | Delivery Health, Flow and Velocity, Risk and RAID, Backlog Health, Ops and SLA |
| Finance Lead | Financials, P and L Cockpit, Commercial Pipeline, Change Impact, Scenario Planner |
| Read Only | Executive, Delivery Health, Financials, Risk and RAID, Client Health Radar |

## 7. JWT and session tests

- Valid token with correct role passes
- Valid token with role mismatch for endpoint fails with 403
- Expired token fails with 401
- Malformed token fails with 401
- Replay of old token after logout fails with 401

## 8. Audit log

Every mutation writes an audit log entry with actor, role, endpoint, timestamp, outcome. Test verifies audit row is written for successful mutations and for denied attempts.

## 9. CI integration

Role gating suite runs on every PR. Cannot be skipped. Failure blocks merge.

---

*Owner: Security auditor subagent. Signoff: Claude.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 Role taxonomy expansion

Roles in test matrix at rev 2 per Master PRD R3.1 and Data Model rev 4 section 3.1.10:

| Role | Code | Scope semantics |
|------|------|-------------------|
| Portfolio Owner | PO | Full cross-portfolio |
| Delivery Director | DD (NEW) | Full cross-delivery-org |
| Programme Manager | PM | Own-programme only |
| Finance Lead | FL | Financial and commercial entities |
| HR Business Partner | HRBP (NEW) | People and capability surfaces |
| Read Only | RO | Read-only scoped |

Plus one additive flag: Audit Permission (AP). AP is true or false per user. Granted via SSO group or local admin per Q3 ruling.

### R2.2 Access matrix size at rev 2

Total endpoints in scope: approximately 135 (per Contract Tests rev 2 R2.1).
Total roles in matrix: 6.
Total AP variants: 3 (PO, DD, FL can hold AP).

Effective combinations: 135 endpoints x 9 role-AP variants = 1,215 access policy assertions.

Encoded in `tests/role_gating/access_matrix.py` as a 2D dictionary indexed by `(endpoint_path, role_with_ap)`.

### R2.3 Verification approach

```
class AccessMatrixTest:
  for endpoint in all_endpoints:
    for role_variant in role_variants:
      expected_outcome = ACCESS_MATRIX[(endpoint, role_variant)]
      actual_outcome = call_endpoint_as(role_variant, endpoint)
      assert actual_outcome == expected_outcome
```

Outcomes: 200 OK (allowed), 200 Filtered (allowed but row-scoped), 403 Forbidden (denied).

### R2.4 Q5 onboarding visibility tests

Per Q5 ruling and Design Foundations R4.6:

```
test_self_can_read_own_onboarding:
  given: joiner Anand with onboarding_checklist rows
  when: Anand calls GET /api/v1/onboarding/me
  expect: 200 with own checklist

test_PO_can_read_all_joiner_checklists:
  given: PO and 4 joiners
  when: PO calls GET /api/v1/onboarding/cohort
  expect: 200 with all 4 joiners

test_DD_scoped_to_own_delivery_org:
  given: DD with 2 of 4 joiners in own org
  when: DD calls GET /api/v1/onboarding/cohort
  expect: 200 with 2 joiners

test_HRBP_full_cohort_visibility:
  given: HRBP
  when: GET /api/v1/onboarding/cohort
  expect: 200 with all joiners (cohort-wide)

test_PM_scoped_to_own_programme:
  given: PM Meera with programme Phoenix; joiner Nisha allocated to Phoenix
  when: PM calls GET /api/v1/onboarding/programme/Phoenix
  expect: 200 with Nisha visible
  when: PM calls GET /api/v1/onboarding/joiner/anand_id (different programme)
  expect: 403

test_PM_cannot_view_note_text:
  given: PM Meera viewing Nisha checklist item with note_text populated
  expect: response includes status, completed_at, evidence_url; note_text omitted

test_FL_no_access:
  given: FL
  when: any onboarding endpoint
  expect: 403

test_RO_no_access:
  given: RO
  when: any onboarding endpoint
  expect: 403
```

### R2.5 Q1 tier rename audit test

```
test_tier_rename_requires_PO:
  given: PM attempts PATCH /api/v1/admin/tier-config/2
  expect: 403

test_tier_rename_writes_audit:
  given: PO renames tier 2
  expect: audit_trail_entries row written with full before/after JSON
  expect: actor_role='PO' and resource_type='escalation_tier_config'
```

### R2.6 AP flag matrix tests

Verifies AP flag enforcement across all 30+ AP-gated endpoints (Audit Trail Console, AI Governance per-row detail, Audit-scoped Export):

```
test_AP_required_for_audit_search_full:
  given: PO without AP
  when: GET /api/v1/audit/search?actor=other_user
  expect: rows filtered to current_user_id only (not 403; degraded scope)

test_AP_required_for_audit_entry_detail:
  given: PO without AP
  when: GET /api/v1/audit/entry/{id}
  expect: 403

test_AP_required_for_ai_use_case_drawer:
  given: DD without AP
  when: GET /api/v1/ai-governance/use-case/{id}/drawer
  expect: 403

test_AP_required_for_audit_export:
  given: FL without AP
  when: POST /api/v1/audit/export
  expect: 403
```

### R2.7 Tenant configurability gate (Q1 acceptance)

Per Q1 ruling, tier rename should propagate without code change:

```
test_no_hardcoded_tier_label_anywhere:
  given: scan codebase
  when: grep for hardcoded "Programme Director" or "Sponsor" outside escalation_tier_config seed
  expect: zero matches in app source code; only matches in escalation_tier_config seed and migration
```

### R2.8 Release gating (revision 2 additions)

Revision 2 ships when:
1. 1,215 access policy assertions verified (auto-generated from access_matrix.py)
2. Q5 onboarding visibility (8 scenarios) green
3. Q1 tier rename audit invariant green
4. AP flag matrix (30+ endpoints) green
5. No hardcoded tier label gate green

---

*Revision 2 owner: Claude. Signoff: Adi (pending). 6 roles plus AP flag. ~135 access policy rows.*
