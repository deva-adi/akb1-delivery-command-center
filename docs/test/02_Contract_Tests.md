# 02_Contract_Tests.md
### Contract Tests | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 expands endpoint inventory from approximately 92 to approximately 135 to cover rev 4 surfaces (governance, capability, AI governance, audit trail, onboarding, plus rev 4 additions on existing tabs). Adds role shape tests for the 6-role taxonomy plus AP flag. Revision 1 content preserved below.
>
> Revision 1: OpenAPI conformance plus per-role response shape tests. Runs on every PR and on nightly. Owner: Backend subagent.

---

## 1. Scope

Every endpoint listed across 15 tab PRDs plus 4 cross-cutting surface PRDs. Revision 3 PRDs count 72 endpoints total at the time of writing.

## 2. Tools

- `schemathesis` for property-based OpenAPI conformance fuzzing
- `pytest-httpx` for explicit happy-path and role-shape assertions
- `openapi-spec-validator` for spec validity in pre-commit

## 3. Test classes

### 3.1 Schema conformance

Every endpoint response body validated against the OpenAPI schema. Strict types, strict required fields, strict enums. No extra fields permitted in production schema mode.

### 3.2 Role shape tests

Each endpoint tested four times (Portfolio Owner, Programme Manager, Finance Lead, Read Only). The response shape must match the documented role-scoped PRD section. Programme Manager must see only assigned programmes. Finance Lead response must include cost fields. Read Only must never see a mutation link.

### 3.3 Error path tests

401 without token, 403 with wrong role, 404 on non-existent resource, 422 on malformed payload, 429 on rate limit, 500 never seen in tests (surface any as P0).

### 3.4 Pagination and filter contract

Every list endpoint tested with page 1 and 2. Filter combinations tested per the filter bar in the relevant tab wireframe.

## 4. Endpoint inventory rev 3

| Tab | Endpoint count |
|-----|----------------|
| Executive | 5 |
| Delivery Health | 7 (rev 3 includes estimation-accuracy plus silent-drifts) |
| Risk and RAID | 4 |
| Workforce Intelligence | 7 (rev 3 includes sustainability-signals plus ai-impact-overlay) |
| Financials | 6 (rev 3 includes bench-tax-allocation) |
| P and L Cockpit | 7 (rev 3 includes bench-tax-breakdown) |
| Flow and Velocity | 4 |
| AI and Innovation | 6 (rev 3 includes defect-attribution plus assist-task-percent) |
| Commercial Pipeline | 7 (rev 3 includes qbr-tracker plus renewal-probability) |
| Backlog Health | 4 |
| Scenario Planner | 7 (rev 3 includes sensitivity plus triple-update) |
| Ops and SLA | 8 (rev 3 includes decisions queue plus velocity-trend) |
| Multi-Vendor Scorecard | 7 (rev 3 includes rationalisation-queue plus advance plus off-board) |
| Change Impact | 7 (rev 3 includes scope-debt-register plus scope-debt-summary) |
| Client Health Radar | 5 (rev 3 includes value-realisation/per-programme) |
| Notifications | 3 |
| Exports | 2 |
| History | 2 |
| Search | 1 |

Total at rev 3: approximately 92 endpoints. Recount on each rev update.

## 5. Test code structure

```
backend/tests/contract/
  conftest.py            # shared fixtures: seeded client, auth helpers
  test_executive.py
  test_delivery_health.py
  ... one file per tab
  test_role_matrix.py    # 4-role x all-endpoint combinatorial
  test_openapi_spec.py   # spec validity
```

## 6. Example assertion

```python
def test_decisions_queue_po_role(po_client):
    r = po_client.get("/api/v1/decisions/queue")
    assert r.status_code == 200
    body = r.json()
    assert "items" in body
    assert all("sla_target_days" in it for it in body["items"])
    assert all("decision_latency_days" in it for it in body["items"] if it["status"] == "Closed")

def test_decisions_queue_ro_no_mutation(ro_client):
    r = ro_client.post("/api/v1/decisions/D-001/close")
    assert r.status_code == 403
```

## 7. CI integration

PR checks run the full contract suite. Failure blocks merge. Nightly runs schemathesis with 500 property-based tests per endpoint.

## 8. Reporting

Summary posted to PR as markdown table. Coverage reported to Codecov. Failure aggregator routes by endpoint owner.

---

*Owner: Backend subagent. Signoff: Claude.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 Endpoint inventory growth

Endpoint count grows from approximately 92 (rev 3 set) to approximately 135 at rev 4. New endpoints by surface:

| Surface | New endpoints | Source PRD |
|---------|---------------|--------------|
| v1_16 Governance Operating Model | 15 | PRD 23 |
| v1_17 Capability and Supply Chain | 14 | PRD 24 |
| v1_18 AI Governance | 17 | PRD 25 |
| v1_01 Executive (rev 4 additions) | 3 | PRD 04 R4.8 |
| v1_02 Delivery Health (rev 4) | 6 | PRD 05 R4.7 |
| v1_03 Risk and RAID (rev 2) | 5 | PRD 06 R2.5 |
| v1_04 Workforce (rev 4) | 2 | PRD 07 R4.5 |
| v1_05 Financials (rev 4) | 4 | PRD 08 R4.4 |
| v1_06 PnL Cockpit (rev 4) | 3 | PRD 09 R4.5 |
| v1_07 Flow and Velocity (rev 2) | 3 | PRD 10 R2.4 |
| v1_08 AI Innovation (rev 4) | 2 | PRD 11 R4.5 |
| v1_09 Commercial (rev 4) | 7 | PRD 12 R4.7 |
| v1_11 Scenario Planner (rev 4) | 5 | PRD 14 R4.6 |
| v1_12 Ops and SLA (rev 4) | 3 | PRD 15 R4.5 |
| v1_13 Multi-Vendor (rev 4) | 4 | PRD 16 R4.5 |
| v1_14 Change Impact (rev 4) | 6 | PRD 17 R4.9 |
| v1_15 Client Health (rev 4) | 2 | PRD 18 R4.4 |
| Audit Trail Console (new) | 7 | PRD 26 |
| Onboarding (new) | 8 | PRD 27 |
| Cross-cutting rev 2 (Notifications, Exports, History, Search) | 11 | PRDs 19-22 |

Approximate new endpoints total: 127 (rounded). Combined with rev 1 inventory minus retired endpoints, target ~135.

### R2.2 Role-shape tests at rev 4

Contract tests now run per role per endpoint. Roles in test matrix: PO, DD, PM, FL, HRBP, RO. Plus AP flag variants on PO, DD, FL.

```
roles_under_test = [
  ('PO', ap=False), ('PO', ap=True),
  ('DD', ap=False), ('DD', ap=True),
  ('PM', ap=False),
  ('FL', ap=False), ('FL', ap=True),
  ('HRBP', ap=False),
  ('RO', ap=False)
]
```

Total contract test combinations: 135 endpoints x 9 role variants ~= 1,215 test cases (auto-generated via parametrization).

### R2.3 New schema validation libraries

- Schemathesis 3.x for OpenAPI conformance
- Pydantic v2 stricter mode for response model validation
- Hypothesis for property-based testing on calculated fields (CPI, SPI, gap_points, etc.)

### R2.4 Tier label propagation contract test

Per Q1 ruling and PRD 23 R2 acceptance:

```
test_tier_label_returned_in_escalation_contract_response:
  given: PATCH /admin/tier-config/2 sets display_label='Delivery Director'
  when: GET /governance/escalation-contracts?programme=PEGASUS
  expect: response.contracts[*].tier_2.display_label == 'Delivery Director'
  rationale: render-time read from escalation_tier_config
```

### R2.5 Audit trail invariant contract test

```
test_every_PATCH_endpoint_writes_audit:
  for each PATCH or POST endpoint in inventory_under_audit:
    capture audit_trail_entries count before
    issue authorized request
    expect: count after == count before + 1
    expect: latest row resource_type matches endpoint mapping
```

### R2.6 Release gating (revision 2 additions)

Revision 2 ships when:
1. ~135 endpoints have schemathesis green
2. 1,215 role-variant test cases green or properly skipped
3. Audit invariant cross-cutting test green
4. Tier label propagation test green
5. Pydantic v2 response models match OpenAPI spec exactly
6. Property-based tests on computed columns green (Hypothesis fuzzing)

---

*Revision 2 owner: Claude. Signoff: Adi (pending). Endpoint inventory at rev 4: approximately 135.*
