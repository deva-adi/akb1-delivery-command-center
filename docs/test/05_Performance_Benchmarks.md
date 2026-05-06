# 05_Performance_Benchmarks.md
### Performance Benchmarks | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 adds 5 new hot-path endpoints (cadence-calendar, skills-heat-map, risk-tier-matrix, evm-snapshot, audit-search) per IMPLEMENTATION_PLAN section 7.3. Plus per-tab performance gates from rev 4 PRDs. Revision 1 content preserved below.
>
> Revision 1: Load profiles, SLAs, regression gates. Owner: Perf benchmarker subagent. Aligned to Architecture doc 07 revision 2.

---

## 1. SLA targets

| Concurrent users | p50 | p95 | p99 | State |
|------------------|-----|-----|-----|-------|
| 100 | Under 250 ms | Under 600 ms | Under 1200 ms | Green. Hard gate for v1.0.0. |
| 500 | Under 500 ms | Under 1200 ms | Under 2500 ms | Green. Target for v1.0.0. |
| 1000 | Under 1000 ms | Under 2500 ms | Under 5000 ms | Amber. Acceptable for v1.0.0 with a Known Limits note. |

Above 1000 concurrent is considered "scale out region" and is tracked post-v1.

## 2. Load profiles

### 2.1 Profile A: steady state 100 concurrent

100 virtual users, each making a request every 8 seconds, 15 minute duration. Represents a Monday morning rush for a typical deployment.

### 2.2 Profile B: ramped 500 concurrent

Ramp from 0 to 500 over 5 minutes, hold for 10 minutes, ramp down over 5 minutes. Represents a steerco Monday across a multi-portfolio deployment.

### 2.3 Profile C: burst 1000 concurrent

Ramp 0 to 1000 over 2 minutes, hold for 5 minutes, ramp down over 2 minutes. Represents a quarterly portfolio review burst.

## 3. Tooling

- `k6` for load generation (JS scripts per profile)
- Prometheus plus Grafana for metrics capture
- Locust only for exploratory if needed

## 4. Request mix

Weighted by typical user behaviour captured in Architecture doc 05:

| Endpoint pattern | Weight |
|------------------|--------|
| `/api/v1/*/snapshot` (tab load) | 40% |
| `/api/v1/intelligence/*` (intel layer) | 20% |
| `/api/v1/*/per-programme` (drill) | 15% |
| `/api/v1/decisions/queue` (R3 hot path) | 8% |
| `/api/v1/exports/steerco` (heavy) | 5% |
| `/api/v1/search` (Cmd-K) | 7% |
| Other | 5% |

## 5. Regression gates

Any p95 regression greater than 15 percent vs the previous release blocks merge. Any endpoint breaching the absolute SLA blocks merge.

## 6. Database tests

EXPLAIN ANALYZE on the 12 heaviest queries captured in a nightly snapshot. Query plan change triggers an alert. Index coverage review required every minor release.

## 7. Cache behaviour

Data epoch invalidation tested under profile B. Cache hit rate expected at 70 percent on steady state, 55 percent on profile C burst. Below 40 percent flags a regression.

## 8. Observability requirements

Each load run produces:
- Prometheus snapshot zipped
- Grafana dashboard URL
- p50/p95/p99 per endpoint CSV
- Top 10 slow queries from pg_stat_statements
- Memory and CPU utilisation per service

## 9. Scheduling

Profile A on every main-branch merge. Profile B weekly. Profile C monthly plus pre-release.

## 10. Failure response

Any red gate opens a post-mortem ticket. Perf benchmarker subagent owns the investigation.

---

*Owner: Perf benchmarker subagent. Signoff: Claude.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 New hot-path endpoints

| Endpoint | Target p95 | Source PRD | Cohort |
|----------|-----------|------------|--------|
| GET /api/v1/governance/cadence-calendar | 300 ms | PRD 23 sec 9 | 500 concurrent, 40 cadences |
| GET /api/v1/capability/skills-heat-map | 300 ms | PRD 24 sec 9 | 500 concurrent, 30 skills x 7 bands |
| GET /api/v1/ai-governance/risk-tier-matrix | 200 ms | PRD 25 sec 9 | 500 concurrent, 10 programmes x 3 tiers |
| GET /api/v1/delivery-health/evm-snapshot | 100 ms | PRD 05 R4.7 plus Test Plan 13 | 500 concurrent, single programme |
| GET /api/v1/audit/search | 600 ms | PRD 26 sec 9 plus Test Plan 14 | 100 concurrent, 10000-row seed with single filter |

### R2.2 Per-tab full snapshot gates (rev 4)

Full tab payload first paint targets at 500 concurrent on pre-warmed cache:

| Endpoint | Target |
|----------|--------|
| GET /governance/snapshot | 800 ms |
| GET /capability/snapshot | 800 ms |
| GET /ai-governance/snapshot | 800 ms |
| GET /executive/snapshot (rev 4) | 600 ms |
| GET /delivery-health/snapshot (rev 4) | 700 ms |
| GET /commercial/snapshot (rev 4) | 800 ms |
| GET /change-impact/snapshot (rev 4) | 900 ms |
| GET /pnl-cockpit/snapshot (rev 4) | 700 ms |

### R2.3 Tier rename invalidation (Q1 acceptance)

```
benchmark_tier_rename_propagation_latency:
  given: tier display_label change applied
  when: subsequent GET on any escalation_contract endpoint
  expect: new label visible within 250 ms (cache invalidation)
```

### R2.4 Audit trail write throughput

```
benchmark_audit_write_under_load:
  given: 1000 concurrent mutations across mixed endpoints
  expect:
    - p99 audit row write latency under 200 ms
    - zero dropped audit writes (write reliability 100 percent)
    - synchronous write to ensure invariant (Option A rule)
```

### R2.5 Audit search at scale

```
benchmark_audit_search_50k_rows:
  given: production-sized seed at 50000 rows (extrapolated from 10000 demo seed)
  expect: filtered search under 1000 ms p95
  monitor: index hit rate above 95 percent
```

### R2.6 Threshold register lookup performance

```
benchmark_threshold_lookup:
  given: every intelligence layer call includes a register lookup
  expect: cached lookup under 5 ms p99
  expect: cold cache lookup under 50 ms
  rationale: 60 metrics in register; each tab snapshot triggers 8-15 lookups
```

### R2.7 Release gating (revision 2 additions)

Revision 2 ships when:
1. 5 new hot-path endpoints meet p95 targets
2. 8 tab snapshot gates met
3. Audit write throughput verified under 1000-concurrent load
4. Audit search benchmark green at 50k rows (extrapolation)
5. Tier rename propagation under 250 ms
6. Threshold lookup under 5 ms cached, 50 ms cold

---

*Revision 2 owner: Claude. Signoff: Adi (pending). 5 new hot paths plus per-tab snapshot gates plus audit throughput.*
