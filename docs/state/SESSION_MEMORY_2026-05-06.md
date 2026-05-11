# Session Memory | 2026-05-06
### AKB1 Delivery Command Center v1 | End-of-session snapshot

---

## What happened this session

Three M7 tab slices closed plus a full git commit.

**Session start state:** D-050 latest (M7-7 Audit Trail Console had just been closed).
**Session end state:** D-052 latest (M7-9 Workforce Intelligence closed). 297 vitest. 221 pytest. 16 routes.

### M7-7 Audit Trail Console (D-050)

Cross-cutting surface. Zero backend lift. Two Route Handler proxies added:
- `/api/audit/search` -- forwards query params to backend GET /audit/search
- `/api/audit/entry/[id]` -- forwards to GET /audit/entry/{id}

Key component: `AuditActivityStream.tsx` ("use client"): filter bar (time_window/method/outcome), activity stream table, row-expand with before/after diff view, load-more cursor pagination, AP-required inline message, empty state. `buildDiffLines` in lib/audit-console.ts maps AuditEntryDiff to DiffLine arrays for the split-diff renderer.

PM backend gap noted and logged: PRD 26 grants PM own-action visibility but backend 403s PM on /audit/search (D-040). Deferred.

57 new vitest. audit-trail-console route added (was 14, became 14... actually +3 routes total with 2 Route Handlers + 1 page).

### M7-8 Capability and Supply Chain (D-051)

New backend endpoint required: `GET /api/v1/people`.
- `backend/app/schemas/people.py` -- PersonItem (excludes email, password_hash), PeopleListResponse
- `backend/app/services/people_service.py` -- list_people ordered by band ASC NULLS LAST, full_name ASC
- `backend/app/api/v1/people.py` -- all 6 roles; reads not audited
- main.py modified to register people_router
- 12 integration tests (ran after Docker was unpaused; 221/221 green)
- OpenAPI regenerated: PersonItem + PeopleListResponse in openapi.json + schema.ts

Frontend: `buildPyramidBands` (lib/capability.ts) produces band distribution (B1=90/B2=90/B3=60/B4=36/B5=24 from seed). `CapabilityPyramidShift` is the one real frontend section. `buildCapabilityWhat` derives headcount + band line for the intelligence card.

Seed reality discovered: `overtime_hours_mtd` and `last_1on1_sentiment_score` are NULL for all 300 seeded people. Both Capability and Workforce handle this gracefully (null sentimentLine, stub notes).

34 new vitest.

### M7-9 Workforce Intelligence (D-052)

Zero new backend. GET /api/v1/people reused.

`lib/workforce.ts` imports `buildPyramidBands` + `PersonItem` from `lib/capability.ts` directly. No new abstraction, no duplication. Key exports: `isWorkforceAllowed` (PO/DD/HRBP), `BAND_LABELS` (B5=Principal/Architect through B1=Engineer/Consultant -- display constants, confirmed correct by Adi), `buildWorkforceWhat`.

One genuinely real section: `WorkforcePyramid` -- horizontal bars B5 to B1 with real counts, BAND_LABELS for row titles, attrition column stub. Headcount KPI card also real (300).

Nine stub sections: 7 KPI cards, Team Sustainability Matrix, AI Impact Overlay, Attrition Radar, Attrition Watchlist, Rev 4 Utilization Reconciliation (gold border, cross-link to Capability).

40 new vitest.

### Git commit

`b9261cc feat(M7): M7-4 through M7-8, full backend auth and audit surface, GET /people`

220 files, 31,953 insertions. Pre-commit hooks caught trailing whitespace in 7 wireframes and an em dash in CLAUDE_CODE_KICKOFF_PROMPT_2026-04-25.md (description of the check itself). Both fixed before landing.

Workforce (M7-9) files are in the working tree but NOT in this commit.

---

## State at session close

| Field | Value |
|---|---|
| Latest decision | D-052 |
| Latest commit | b9261cc (M7-4 through M7-8) |
| Uncommitted | Workforce tab (M7-9): lib/workforce.ts, 9 components, page.tsx, 3 test files, BUILD_STATE, DECISION_LOG updates |
| Frontend vitest | 297 of 297 green |
| Backend pytest | 221 of 221 green |
| Routes | 16 |
| Migration head | 009_programme_health_snapshots |
| Seed SHA-256 | 338ee06b723de32d78684b4b1c8c49c9ee5aec8687487d61c3f2c1cbcbfe24e9 |

---

## M7 progress at session close

Closed: scaffold, M7-2 backend, Risk/RAID, Delivery Health, Executive, Governance, Audit Trail, Capability, Workforce (8 of ~14 slices).

Primary nav completion:
- PO: 3 of 5 (Executive, Governance, Capability -- missing Financials, Client Health)
- DD: 4 of 5 (Executive, Governance, Delivery Health, Capability -- missing Ops/SLA)
- PM: 3 of 5 (Delivery Health, Governance, Risk/RAID -- missing Flow/Velocity, Ops/SLA)
- FL: 0 of 5 (entire FL cluster needs new migrations)
- HRBP: 3 of 5 (Capability, Governance, Workforce -- missing Onboarding, Notifications)
- RO: 3 of 5 (Executive, Delivery Health, Governance -- missing Financials, Client Health)

---

## Decisions to carry forward

- Overtime hours and 1-on-1 sentiment are NULL in the current seed for all 300 people. Any tab section that relies on either field will stub at runtime until the seed generator is extended.
- `buildPyramidBands` in lib/capability.ts is the canonical band-grouping utility. Import from there, do not duplicate.
- BAND_LABELS are display constants (not seeded). Agreed approach confirmed by Adi.
- PM backend gap on /audit/search (D-040): PM gets 403 from backend despite PRD granting own-action visibility. Deferred to future backend slice.
- The Capability and Workforce tabs share the same 3-role gate (PO/DD/HRBP). PM/RO/FL partial access deferred until allocations/attrition/utilization entities land.

---

## Next session first action

Run `git commit` for Workforce (M7-9) before starting any new code. Then proceed to Flow and Velocity (PM pos 2) -- milestones data is live and can proxy velocity, following the pattern established in Delivery Health EVM section.
