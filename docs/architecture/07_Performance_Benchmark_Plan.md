# 07_Performance_Benchmark_Plan.md
### AKB1 Delivery Command Center v1 | Performance Benchmark Plan | Created: 2026-04-24

> Realistic performance targets with architectural enablers, Locust test scenarios, measurement methodology. Revised per ruthless self-check severity-1 to reflect what the stack actually delivers rather than aspirational numbers.

---

## 1. Scope

Defines the performance benchmark suite run at Milestone M8 before v1.0.0 release. Three concurrency tiers (100, 500, 1000), two deploy modes (self-host laptop, Fly.io small), reported in `docs/performance/benchmark_v1.md`.

## 2. Target table (realistic per revision 2)

| Concurrency | Scenario | p50 target | p95 target | p99 target | Error rate target | Verdict |
|-------------|----------|-----------|-----------|-----------|------|---------|
| 100 concurrent users | Mixed read (Executive, Financials, Risk RAID) | 180 ms | **600 ms** | 900 ms | under 0.1 percent | Green mandatory |
| 500 concurrent users | Same | 350 ms | **1200 ms** | 1800 ms | under 0.5 percent | Green mandatory |
| 500 concurrent users | Same | 420 ms | **1500 ms** | 2200 ms | under 1 percent | Amber acceptable |
| 1000 concurrent users | Same | 700 ms | **2500 ms** | 3500 ms | under 1 percent | Amber acceptable |
| 1000 concurrent users | Same | 1200 ms | **4000 ms** | 5500 ms | under 2 percent | Red blocks release |

Revision 2 change: targets revised upward from revision 1 (which called 500 ms p95 at 100 concurrent). Revision 2 targets assume the architectural enablers from ADR section 6 are in place (CDN, Redis response cache, HTTP/2, query indexes, local Tailwind build).

## 3. Architectural enablers required to hit targets

Without these, the targets are not achievable:

| Enabler | Effect |
|---------|--------|
| CDN in front of static assets | Shaves 50 to 200 ms off page load for non-authenticated surfaces |
| Redis cache on GET endpoints (60s TTL with data-epoch invalidation) | 70 percent hit rate in steady state, sub 20 ms cache reads |
| HTTP/2 via Caddy | Connection reuse, 20 to 40 percent latency improvement on multi-request pages |
| asyncpg connection pool sized 10 to 50 per replica | Prevents DB connection contention at peak |
| Database indexes per Data Model PRD section 10 | Sub 50 ms query for single-programme KPI, sub 200 ms cross-programme |
| Tailwind production build (not CDN) | Removes external dependency hop |
| Prometheus metrics scraping | Zero overhead on request path (async writes) |

## 4. Locust scenarios

### 4.1 Scenario set

| Scenario name | User action mix | Weight |
|---------------|-----------------|--------|
| `executive_browse` | Load Executive tab, change filter 3 times, drill into 1 programme | 40 |
| `financials_deep_dive` | Load Financials, switch to P and L Cockpit, drill to programme detail | 20 |
| `risk_scan` | Load Risk and RAID matrix, click 3 cells to open drill panels | 15 |
| `intelligence_hit` | Load any tab, observe intelligence layer rendered | 15 |
| `search_find` | Open Cmd-K, type query, click first result | 5 |
| `export_generate` | Click Export on a chart, download Excel | 3 |
| `scenario_save` | Open Scenario Planner, modify, save | 2 |

### 4.2 Ramp profile

| Stage | Duration | Users |
|-------|----------|-------|
| Warm-up | 30 seconds | 10 |
| Ramp to target | 2 minutes | 10 to target (100, 500, or 1000) |
| Steady state | 10 minutes | target |
| Cool-down | 1 minute | target to 0 |

Total run 13.5 minutes per tier. Three tiers times two deploy modes = six runs = roughly 90 minutes of benchmark time.

### 4.3 Think time

Users have random think time between actions. Uniform distribution 2 to 8 seconds. Reflects real dashboard browsing (not bot flooding).

## 5. Measurement methodology

### 5.1 Metrics captured

| Metric | Source | Purpose |
|--------|--------|---------|
| Response time p50, p95, p99 | Locust | SLO tracking |
| Error rate | Locust | Correctness signal |
| Requests per second | Locust | Throughput |
| Backend CPU per container | Prometheus | Bottleneck detection |
| Backend memory per container | Prometheus | Bottleneck detection |
| Postgres active connections | pg_stat_activity | Pool sizing validation |
| Postgres slow query log | log_min_duration_statement 100 ms | Index gap detection |
| Redis ops per second | Redis INFO | Cache health |
| Redis hit rate | Redis INFO | Cache effectiveness |
| Intelligence layer LLM calls | Custom metric | LLM overhead visibility (if enabled) |

### 5.2 Report format

Each benchmark run produces `docs/performance/benchmark_v1_<tier>_<mode>_<date>.md` containing:

- Scenario config
- Ramp profile actual vs target
- Metrics table
- Bottleneck analysis (which resource saturated first)
- Regressions vs previous benchmark
- Architectural recommendation if target missed

Consolidated report at `docs/performance/benchmark_v1.md`.

## 6. Baseline establishment

First benchmark run at M8 establishes the v1.0.0 baseline. Every subsequent release must maintain or improve on the baseline for the same scenario and tier, else a release-gate explanation is required in CHANGELOG.md.

## 7. Regression detection

Automated in CI weekly (scheduled) via `benchmark.yml` GitHub Actions workflow:

| Detection | Threshold |
|-----------|-----------|
| p95 regression | More than 20 percent worse than baseline |
| Error rate regression | Absolute increase above 0.1 percent |
| Throughput regression | More than 15 percent lower RPS |
| Cache hit rate regression | Below 60 percent in steady state |

Any regression posts an issue to GitHub and notifies operator.

## 8. Capacity planning

From benchmark results, capacity planning table published alongside the benchmark report:

| Users | Frontend replicas | Backend replicas | Postgres size | Redis size |
|-------|-------------------|------------------|----------------|-------------|
| 10 (self-host) | 1 | 1 | shared-cpu 256 MB | 128 MB |
| 100 (small hosted) | 2 | 2 | shared-cpu-2x | 256 MB |
| 500 (medium hosted) | 3 | 4 | dedicated-cpu 4GB with read replica | 512 MB |
| 1000 (enterprise) | 4 | 6 | dedicated-cpu 8GB primary plus 2 read replicas | 1 GB |

Numbers refined by actual M8 benchmark results.

## 9. Honest target realism

Revision 1 claimed 100 concurrent at p95 under 500 ms. Revision 2 revises to 600 ms. The extra 100 ms reflects:

- Realistic asyncpg connection acquisition time (5 to 15 ms)
- Realistic Pydantic serialisation cost for a 50 KB payload (10 to 30 ms)
- Realistic Redis round-trip (2 to 5 ms per lookup, multiple lookups per request)
- Realistic network overhead even on CDN (50 to 100 ms from edge to user)
- Realistic Intelligence Engine rule execution (50 to 150 ms even without LLM)

Adding these realistic lower bounds, sub-500 ms at 100 concurrent would require measurably better engineering than the stack delivers by default. Target 600 ms is achievable with the enablers documented.

## 10. Test data

Locust tests run against seeded demo data (10 programmes, 300 people, 150 RAID). Data size representative of typical adopter scale at the low end. Larger-scale data profiles added in v1.1 if adopters request.

## 11. Acceptance criteria

Performance benchmark signed off when:
- 100 concurrent green on self-host and hosted
- 500 concurrent green on hosted, amber acceptable on self-host
- 1000 concurrent amber acceptable on hosted
- No regression versus previous release baseline
- Report committed to `docs/performance/benchmark_v1.md`

## 12. Release gating

v1.0.0 release blocks if:
- 100 concurrent red on hosted
- 500 concurrent red on hosted
- Regressions of more than 30 percent in p95 vs previous release

Other severity regressions trigger a CHANGELOG.md explanation but do not block release at the maintainer's discretion.

---

*Owner: Claude, reviewed by devops and qa-engineer subagents jointly. Signoff: Adi.*
