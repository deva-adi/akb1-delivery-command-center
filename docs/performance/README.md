# Performance Benchmark

Load test reports and performance evidence. Populated at Milestone M8.

## Planned contents

```
docs/performance/
|-- benchmark_v1.md                Master benchmark report for v1.0.0
|-- locust_profiles/               Locust test scripts
|   |-- 100_concurrent.py
|   |-- 500_concurrent.py
|   +-- 1000_concurrent.py
+-- results/
    |-- v1.0.0_100c.json
    |-- v1.0.0_500c.json
    +-- v1.0.0_1000c.json
```

## Benchmark targets

| Concurrency | Target p95 response | Target error rate | Gate |
|-------------|---------------------|-------------------|------|
| 100 concurrent users | Under 500 ms | Under 0.1 percent | Green |
| 500 concurrent users | Under 1000 ms | Under 0.5 percent | Green |
| 1000 concurrent users | Under 2000 ms | Under 1 percent | Amber allowed |

## Gate definition

Performance gate is green when the 100 and 500 concurrent tests pass both p95 and error rate thresholds. Amber on 1000 concurrent is acceptable for v1.0.0 because the primary deployment target is self-hosted or small hosted teams. Full horizontal scale to 1000+ concurrent is a Phase 2 goal.

## Status at 2026-04-24

Empty scaffold. Benchmark authored at M8 before v1.0.0 release.

---

*Folder owner: devops and qa-engineer subagents jointly.*
