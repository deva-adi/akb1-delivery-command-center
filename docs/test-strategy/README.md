# Test Strategy
### AKB1 Delivery Command Center v1

Nine test plan documents. Created during Milestone M4.

## File list (planned)

| # | File | Scope | Status |
|---|------|-------|--------|
| 00 | 00_Test_Strategy_Master.md | Test pyramid, coverage targets, gate definitions, tooling | Planned |
| 01 | 01_Unit_Test_Plan.md | Backend pytest plan, frontend Vitest plan, 80 percent coverage minimum | Planned |
| 02 | 02_Integration_Test_Plan.md | API plus DB integration, Redis integration, LLM fallback path | Planned |
| 03 | 03_E2E_Test_Plan.md | Playwright scenarios per tab, multi-role flows | Planned |
| 04 | 04_Regression_Test_Plan.md | Full regression run on every PR, gates for main branch | Planned |
| 05 | 05_Drill_Integrity_Test_Plan.md | Every drill path (up, down, through, across) asserted with real data | Planned |
| 06 | 06_Accessibility_Test_Plan.md | axe-core in CI, keyboard navigation, colour contrast, screen reader cases | Planned |
| 07 | 07_Performance_Test_Plan.md | Locust load test, 100 plus 500 plus 1000 concurrent, p95 response time targets | Planned |
| 08 | 08_Security_Test_Plan.md | trivy, bandit, dependency scan, OWASP top 10 review, penetration test scope | Planned |

## Gate summary

No merge to main unless: unit tests 100 percent pass, E2E 100 percent pass, drill integrity 100 percent pass, axe-core zero WCAG AA violations, contract tests 100 percent pass, security scan no critical CVEs, performance benchmark green at 100 and 500 concurrent and amber allowed at 1000.

Zero tolerance on baseline test failures. v5.8 accepted 5 of 56 Playwright failures as baseline. v1 does not.

---

*Folder owner: Claude. Populated during Milestone M4.*
