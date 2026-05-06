# 01_Test_Strategy_Master.md
### Test Strategy Master | AKB1 Delivery Command Center v1 | Revision 1 | Created: 2026-04-24

> Master test plan. Orchestrates eight specialised test plans beneath it. Owner: Claude. Signoff: Adi.

---

## 1. Testing objectives

Ship v1.0.0 on the LinkedIn launch date (target 2026-06-10) with zero functional regressions against the rev 3 PRD set, with governance credibility preserved by the Hub voice tests, and with the performance envelope green at 100 concurrent and amber at 1000 concurrent per the v1 performance plan.

## 2. Test pyramid

| Layer | Target count | Tooling | Latency SLA |
|-------|--------------|---------|-------------|
| Unit (backend) | 800 at v1 | pytest, httpx | Under 5 min full suite |
| Unit (frontend) | 400 at v1 | Vitest, Testing Library | Under 3 min full suite |
| Contract | 72 endpoints x 4 role shapes = 288 | schemathesis, openapi-test | Under 10 min |
| Integration | 120 | pytest plus dockerised Postgres and Redis | Under 15 min |
| E2E Playwright | 15 tabs x critical path | Playwright parallel | Under 25 min |
| Voice regression | 15 tabs x 3 states (green, amber, red) | Pytest plus voice golden snapshots | Under 8 min |
| Perf benchmark | 3 load profiles | k6, Prometheus | 45 min per profile |
| Accessibility | WCAG 2.1 AA on 15 tabs | axe-playwright | Under 12 min |

## 3. Coverage gates

Unit coverage at or above 80 percent for backend, 70 percent for frontend. Contract coverage 100 percent of endpoints. Critical path E2E 100 percent of role-tab combinations. Voice regression 100 percent of tabs x states. Accessibility zero critical violations.

## 4. Test data

Deterministic seed via `numpy.random.RandomState(20260424)`. Ten programmes, 300 people, 25 vendors, 40 scope debt items, 30 decisions, 12 months financials. Any contributor running `make seed` produces byte-identical data. Seed determinism test described in `08_Seed_Determinism.md`.

## 5. Environments

Local (docker compose up), CI (GitHub Actions with spinup postgres plus redis services), Preview (Vercel plus Fly.io ephemeral), Staging (full stack on shared host), Production (v1.0.0 onward).

## 6. Gating matrix

| Milestone | Unit | Contract | E2E | Voice | Perf | A11y |
|-----------|------|----------|-----|-------|------|------|
| M6 backend | Required | Required | NA | NA | Smoke | NA |
| M7 frontend | NA | NA | Required | NA | NA | Required |
| M8 intelligence | Required | NA | Required | Required | NA | NA |
| M9 launch | Required | Required | Required | Required | Required | Required |

## 7. Failure disposition

Any critical bug, any voice regression, any a11y critical, any perf regression greater than 15 percent blocks launch. Minor bugs tracked against first post-v1 patch window.

## 8. Test plan files

| File | Purpose |
|------|---------|
| `01_Test_Strategy_Master.md` | This file |
| `02_Contract_Tests.md` | OpenAPI schema conformance plus per-role response shape tests |
| `03_Playwright_E2E.md` | User journey tests per tab per role |
| `04_Voice_Regression.md` | Hub voice golden snapshots per tab per state |
| `05_Performance_Benchmarks.md` | Load profiles, SLAs, and regression gates |
| `06_Accessibility.md` | WCAG 2.1 AA test plan |
| `07_Intelligence_Layer_Rules.md` | Rules engine tests plus LLM polish injection defence |
| `08_Seed_Determinism.md` | Data seeding byte-identicality test |
| `09_Role_Gating.md` | Authorisation matrix tests per role per endpoint |

## 9. Ownership

Test runner subagent owns automation orchestration. Voice QA subagent owns Hub voice regression. Perf benchmarker subagent owns load tests. Security auditor subagent owns role gating plus LLM injection defence.

---

*Owner: Claude. Signoff: Adi.*
