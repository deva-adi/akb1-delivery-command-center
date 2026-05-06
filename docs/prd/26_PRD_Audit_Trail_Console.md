# 26_PRD_Audit_Trail_Console.md
### Audit Trail Explorer Console | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> New cross-cutting surface introduced at Master PRD revision 3. Closes UC-K. Inherits from Master PRD revision 3, Data Model PRD revision 4 (`audit_trail_entries` entity 4.71), Intelligence Layer PRD revision 2 pending rev 3 cascade, Security PRD revision 2 pending rev 3 cascade, Design Foundations revision 4.

---

## 1. Scope and goals

Global console accessible from every tab through the More menu. Purpose: forensic visibility into every state-changing mutation across the application. Storage pattern is Option A full snapshot per Q4 ruling. Every PATCH, POST, DELETE writes a row containing actor, role, endpoint, resource, and full before and after JSON snapshots.

Hub anchor: Implied across all governance articles plus explicit in Security PRD posture. The console makes audit a first-class operator surface, not a back-end query tool.

## 2. Role access

Visible to every role through the More menu. Aggregate counts and metadata are visible to all. Per-row detail (full before_json and after_json reveal) requires Audit Permission (AP) flag on a Portfolio Owner, Delivery Director, or Finance Lead account. Security Auditor (deprecated as separate role per Q3 ruling; retained as semantic concept) is the AP-flag-on-FL pattern. PM sees only own actions when accessing without AP.

| Role | Aggregate view | Per-row detail | Export |
|------|----------------|----------------|--------|
| PO without AP | Yes (own scope) | Own actions only | No |
| PO with AP | Yes | All rows | Yes (audit-scoped) |
| DD without AP | Yes (own scope) | Own actions only | No |
| DD with AP | Yes | All rows | Yes (audit-scoped) |
| PM | Yes (own actions only) | Own actions only | No |
| FL without AP | Yes (own scope) | Own actions only | No |
| FL with AP | Yes | All rows | Yes (audit-scoped) |
| HRBP | No access | No access | No |
| RO | No access | No access | No |

## 3. Data contract

Consumes: `audit_trail_entries` (entity 4.71). Joins to `people` (for actor name lookup), `programmes` (for resource_id lookup when resource_type is programme-scoped).

Response: `AuditTrailQueryResponse` with paginated rows. Each row contains entry_id, actor_user_id, actor_role, actor_display_name, endpoint, http_method, occurred_at, outcome, resource_type, resource_id, resource_display_name (computed), redacted_before_json (if not AP), redacted_after_json (if not AP), full before_json and after_json (if AP).

Pagination: cursor-based using occurred_at DESC plus entry_id. Page size 50 default, 200 maximum.

## 4. User stories

Portfolio Owner with AP on Monday morning queries all decision approvals from the last 7 days, sees who approved what and what the before-state was. Detects 2 approvals that bypassed the recommended pre-read process.

Finance Lead with AP investigates a margin discrepancy. Filters audit trail to `resource_type = financials_monthly` last 30 days. Sees the rate card adjustment that was made by Programme Manager mid-month and identifies the missing CR.

Programme Manager without AP reviews own scope to verify their last 5 RACI matrix edits applied correctly. Sees the before/after on each.

Portfolio Owner with AP exports the audit pack for a specific incident review. Audit-scoped export bundles 200 rows into a CSV with a digital signature for chain-of-custody.

Compliance reviewer with AP-on-FL queries all `escalation_tier_config` mutations for the last 12 months. Sees 3 tier renames with actor and timestamp. Verifies all changes audited correctly.

## 5. KPIs

Primary KPI is operational, not analytical. Surfaced metrics:

| Metric | Formula | Example | Target | Owner |
|--------|---------|---------|--------|-------|
| Audit Write Events Per Day | `Count(audit_trail_entries) for day` | 432 events on 2026-04-25 | RangeIsBetter 50 to 5000 | PO with AP |
| Mutation Coverage Percent | `Count(distinct endpoint) writing audit / Count(distinct mutating endpoint)` | 100 percent | At or above 100 | Backend lead |
| Audit Storage Footprint | `Sum(pg_total_relation_size('audit_trail_entries'))` | 2.4 GB at v1.0.0 demo | Trended only | Backend lead |
| Failed Mutation Percent | `Count(audit_trail_entries WHERE outcome = Error) / Count(audit_trail_entries)` | 0.3 percent | Below 1 | Backend lead |
| Denied Mutation Count | `Count(audit_trail_entries WHERE outcome = Denied)` last 24 hours | 7 events | Trended only | PO with AP |

## 6. Views and interactions

Single global console rendered as a full-width modal or dedicated route at `/audit`. Filter bar: Actor, Actor Role, Resource Type, Resource ID, Endpoint, HTTP Method, Outcome, Time Window, Programme Scope.

### 6.1 Audit Row component

Single-line monospaced row per Design Foundations R4.7. Columns: Timestamp (local with UTC tooltip), Actor (display name plus role chip), Method (POST/PATCH/PUT/DELETE coloured), Endpoint (truncated), Resource (type plus id), Outcome chip (Success green, Denied amber, Error red).

Click expands to show full JSON pre- and post-state side-by-side with diff highlighting. Diff renderer uses `bg-[#10B981]/10` for added lines, `bg-[#EF4444]/10` for removed lines.

### 6.2 Activity stream view

Default landing view. Reverse-chronological scroll. Continuous fetch on scroll. Date dividers separate days.

### 6.3 Resource history view

Selected from any row by clicking Resource. Shows all mutations on that single resource_id in chronological order. Useful for "who changed this decision" investigations.

### 6.4 Endpoint analytics view

Toggleable from the filter bar. Bar chart showing mutation count per endpoint over time window. Drill into endpoint shows the underlying activity stream.

### 6.5 Approval Aging view (cross-link)

Audit trail entries where `endpoint LIKE '/api/v1/.*/approval'` filtered to occurred_at minus opened_at greater than 14 days. Cross-link to v1_18 AI Governance Pending Red Backlog where this overlaps.

## 7. Drill paths

| From | To |
|------|-----|
| Audit Row click | Expanded row with before/after diff |
| Resource cell | Resource history view filtered to that resource_id |
| Actor cell | Activity stream filtered to that actor |
| Endpoint cell | Endpoint analytics for that endpoint |
| Outcome Denied chip | Denied mutations stream (security review) |
| Activity stream row link to v1_16 cadence | Cadence detail on Governance tab |
| Activity stream row link to v1_18 use case | Use case detail on AI Governance tab |

## 8. Intelligence layer rules

`tab_audit_console.py` revision 1. Per Design Foundations R4.7 the console does not carry standard What/Why/Act narrative. Audit is factual and terse. Intelligence layer surfaces only operational alerts:

- Audit Write Events Per Day below 10: alert "Suspiciously low audit volume. Verify mutation endpoints are writing correctly."
- Audit Write Events Per Day above 20000: alert "Activity storm detected. Review for incident or runaway integration."
- Denied mutation count above 20 in 24 hours: alert "Access denial cluster. Review for permission misconfiguration or attempted compromise."
- Failed mutation rate above 1 percent: alert "Mutation reliability degraded. Open with backend lead."

## 9. Non-functional

Console first paint under 800 ms with an empty filter on 10,000-row demo seed. Filter application under 600 ms for any single filter. Full diff render under 200 ms per row.

Storage: Option A full snapshot (Q4 ruling). 10,000 events at demo seed. Production sizing trended only at v1.0.0 launch.

Append-only at the application layer: no UPDATE or DELETE granted to any role on `audit_trail_entries`. Database-level: row-level enforced through `REVOKE UPDATE, DELETE ON audit_trail_entries FROM ALL`.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/audit/search` | Filtered search with cursor pagination |
| GET | `/api/v1/audit/entry/{id}` | Single entry detail with full JSON |
| GET | `/api/v1/audit/resource/{type}/{id}` | Resource history |
| GET | `/api/v1/audit/actor/{user_id}` | Actor activity |
| GET | `/api/v1/audit/endpoint?path={path}` | Endpoint analytics |
| GET | `/api/v1/audit/operational-metrics` | KPI payload (Section 5 metrics) |
| POST | `/api/v1/audit/export` | Audit-scoped export bundle (AP required) |

Total: 7 endpoints. Export endpoint requires AP flag and itself writes an audit entry recording the export request.

## 11. Error and empty states

Filter returns zero rows: "No audit events match this filter. Try widening the time window or removing one filter."
User without AP attempting per-row reveal: "Audit Permission required to view full pre- and post-state. Aggregate metadata visible above."
HRBP or RO attempting access: "Audit Trail Console is not available for your role." with link back to previous tab.
Database query timeout: "Query exceeded 5 seconds. Add a programme or actor filter to narrow results."

## 12. Accessibility

Activity stream rows are keyboard-navigable with arrow keys. Diff view has table alternative for screen readers. Outcome chips carry text labels alongside colours. Monospaced font for endpoint and resource_id improves screen-reader pronunciation.

axe-core zero WCAG AA violations required at release gate.

## 13. Test acceptance

Playwright scenarios:
- Login as PO with AP, open console from More menu, verify activity stream loads.
- Filter by actor, verify rows narrow.
- Click a row, verify full diff opens with before and after JSON visible.
- Login as PM, attempt to view another user's row, verify access denied.
- Login as PO with AP, export audit bundle, verify file downloads and an audit entry is written for the export action.
- Login as HRBP, attempt to access /audit, verify redirect with explanation.

Contract tests: 7 endpoints validated.

Append-only invariant test: attempt PATCH on existing audit row, expect 403 Forbidden.

Performance test: 10,000-row seed query with single filter under 600 ms.

## 14. Release gating

Console ships when:
1. Wireframe `v1_audit_trail_console.html` signed off.
2. 7 endpoints contract-match.
3. Append-only invariant verified at database and API level.
4. AP flag gating verified end-to-end.
5. Full-snapshot storage verified (Option A rule, before_json and after_json populated on every event).
6. Export bundle includes digital signature for chain-of-custody.
7. Playwright green on all 6 scenarios.
8. axe-core zero violations.
9. 10,000-row demo seed query benchmark under 600 ms.

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Closes UC-K. Implements Q4 Option A full-snapshot rule.*
