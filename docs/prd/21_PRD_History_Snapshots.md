# 21_PRD_History_Snapshots.md
### History and Point-in-Time View PRD | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 extends snapshot coverage to rev 4 entities: governance, capability, AI governance, audit trail summaries. Revision 1 content preserved below.
>
> Revision 1 introduced the cross-cutting surface per self-check D-015. Weekly snapshots capture every tab KPI state so the dashboard can render any past week and diff against today.

---

## 1. Scope and goals

Weekly snapshot job captures every KPI on every tab to a `kpi_snapshots` table. Users select an "As of" date in the filter bar to render the dashboard as of that date. Diff mode compares current against any selected past week. Retention 52 weeks minimum.

## 2. Role access

All roles can access history. No role-specific restriction beyond the per-tab role gate already enforced.

## 3. Data contract

Consumes: `kpi_snapshots` entity for historical reads. Falls through to live aggregation if a snapshot is missing for the requested date.

Produces: dashboard payload that looks identical to live, plus an `is_historical: true` flag and `captured_at` timestamp.

## 4. User stories

Portfolio Owner looks at what the dashboard said last Monday before the margin drop, then compares to today to understand the swing.
Finance Lead reconstructs the Q1 close state for audit purposes.
Programme Manager checks how the Pegasus milestone slip evolved week over week.

## 5. KPIs

| KPI | Formula | Example | Target | Alert |
|-----|---------|---------|--------|-------|
| Snapshot Completeness | `Snapshots Captured / Expected Weekly Snapshots x 100` | 99.2 percent | Above 98 percent | Below 95 percent |
| Historical Load Time | Seconds to render a past-week view | 1.1 | Below 2 | Above 5 |
| History Usage | Users engaging with As-of picker weekly | 28 | Above 15 | Below 5 |
| Diff Mode Usage | Count of diff-mode sessions per week | 42 | Above 20 | Below 10 |

## 6. Views and interactions

As-of date picker at the top of the filter bar. Default today. Click reveals a calendar with weeks having captured snapshots marked. On selection of a past date, the entire dashboard re-renders with that week's data. Amber banner at top: "Historical view as of 2026-04-13. Click to return to today."

Diff mode toggle switch next to the As-of picker. When on, selecting a second past date enables side-by-side or inline-delta visualisation per KPI card and table row.

## 7. Drill paths

| From | To |
|------|-----|
| As-of picker | Dashboard renders at that snapshot |
| KPI card in history mode | Historical detail drawer (no further drill to live, terminal view) |
| Diff delta on KPI | Explanation of the change (driver narrative captured at snapshot time) |

## 8. Snapshot job

Scheduled Sunday 23:59 UTC. Backend `jobs/snapshot_job.py` iterates every tab, every primary filter slice, computes KPIs plus intelligence layer driver payload, serialises as `jsonb`, inserts into `kpi_snapshots`. Duration target under 5 minutes. Idempotent via (tab_id, filter_hash, captured_at) unique constraint.

Anomaly detection piggybacks on the snapshot job. Computes week over week deltas, emits `anomaly_*` notifications where thresholds are crossed.

## 9. Non-functional

Historical load under 2 seconds p95 for a single tab. Snapshot job under 5 minutes. Table growth: approximately 100 rows per week per tenant, 5,200 per year, 26,000 at v1 five-year retention. Size manageable for Postgres with proper indexes.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/history/snapshots` | List available snapshot dates |
| GET | `/api/v1/history/{tab_id}/as-of/{date}` | Render tab payload as of date |
| GET | `/api/v1/history/{tab_id}/diff?from=<date1>&to=<date2>` | Side-by-side diff payload |
| POST | `/api/v1/history/snapshots/run-now` (admin) | Trigger manual snapshot |

## 11. Error and empty states

No snapshot for selected date → fallback to nearest earlier snapshot with a note "Snapshot for 2026-04-13 not found. Showing nearest 2026-04-06."
Snapshot job failure → system notification, next scheduled run retries.

## 12. Accessibility

Date picker keyboard navigable. Historical view banner announces via ARIA live region on activation. Diff deltas use text plus colour for direction indication.

## 13. Implementation notes

Snapshot `jsonb` payload schema versioned via `snapshot_schema_version` field. Reader tolerates older versions for 4 quarters minimum to ride through v1.x schema changes.

Redis cache on historical reads is aggressive (24 hour TTL) because historical data is immutable by definition.

## 14. Test acceptance

Playwright: select a past date from calendar, banner appears, KPIs render from snapshot. Toggle diff mode, second date picker appears, side-by-side compare works. Contract test on all endpoints. Snapshot job idempotency test.

## 15. Release gating

PRD closes when Adi approves the retention policy (52 weeks Phase 1), snapshot cadence (weekly), and the diff mode UI pattern. Snapshot job is an M6 backend deliverable. UI exposes in M7.

---

*Owner: Claude. Signoff: Adi. Depends on Data Model PRD revision 2 (kpi_snapshots entity).*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 Snapshot coverage expansion

Weekly snapshots now capture additional metrics from rev 4 entities:

| Source entity | Snapshot columns added |
|---------------|--------------------------|
| `governance_cadence` | Per programme: cadence_count_total, theatre_count, attendance_avg |
| `raci_matrix` | Per programme: gap_count, overlap_count, total_activities |
| `decisions` (rev 4) | Per category: open_count, average_latency_days |
| `bench_roster` | Portfolio: aging_count, at_risk_count, cumulative_cost_usd |
| `dm_succession_signals` | Portfolio: thin_count, critical_count, average_flight_risk |
| `evm_snapshots` | Per programme: cpi, spi, vac_usd |
| `revenue_leakage_mechanism` | Portfolio: total_usd_per_mechanism (5 mechanisms) |
| `ai_use_case` | Portfolio: red_count, amber_count, pending_red_count |
| `ai_quality_gate` | Portfolio: pass_rate_pct |
| `audit_trail_entries` | Daily roll-up only (not weekly): events_count, denied_count |

Audit trail uses daily roll-up not weekly because the row volume is too large for weekly granularity to be useful.

### R2.2 Point-in-time view enhancements

Time selector adds a "Quarter Start" preset for board-altitude reviews. Selected quarter renders the snapshot from week 1 of that quarter alongside today's values for diff comparison.

History view now exposes a "Show Audit Activity" toggle that overlays daily audit volume on any KPI trend chart. Useful for correlating governance activity spikes with metric drops.

### R2.3 Endpoints (revision 2 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/history/snapshot?week={iso}&entity={enum}` | Weekly snapshot scoped to entity |
| GET | `/api/v1/history/audit-overlay?metric_id={id}&start={d}&end={d}` | Audit volume overlay for a KPI trend |

### R2.4 Release gating (revision 2 additions)

Revision 2 ships when:
1. Snapshot coverage validated for all 10 new source entities.
2. Daily audit roll-up generation runs nightly without performance impact.
3. Point-in-time view renders quarter-start comparison correctly.
4. Audit overlay aligns timestamps correctly with KPI trend.

---

*Revision 2 owner: Claude. Signoff: Adi (pending). Extends snapshot coverage to rev 4 entities.*
