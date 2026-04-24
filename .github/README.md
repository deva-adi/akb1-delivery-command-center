# GitHub Configuration

Workflows, issue templates, PR template. Populated at Milestone M6.

## Planned structure

```
.github/
|-- workflows/
|   |-- ci.yml                     pytest, Vitest, Playwright, axe-core on every PR
|   |-- release.yml                Tag-triggered release builds
|   +-- benchmark.yml              Performance benchmark on schedule
|-- ISSUE_TEMPLATE/
|   |-- bug_report.md
|   |-- feature_request.md
|   +-- security_report.md
+-- pull_request_template.md       Merge checklist
```

## Workflow gates planned

CI runs on every PR:
- pytest (backend, 100 percent pass, 80 percent coverage minimum)
- Vitest (frontend, 100 percent pass, 80 percent coverage minimum)
- Playwright (E2E, 100 percent pass)
- axe-core (zero WCAG AA violations)
- Schemathesis (contract tests)
- Pre-commit hooks
- Em dash scanner
- Emoji scanner

Merge to main is blocked until all gates are green.

## Status at 2026-04-24

Empty scaffold. Real workflows land at M6 when backend CI is needed, extended at M7 for frontend, M8 for E2E.

---

*Folder owner: devops subagent (M6 onward).*
