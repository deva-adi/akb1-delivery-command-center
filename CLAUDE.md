# CLAUDE.md
### AKB1 Delivery Command Center v1 | Project operating rules for Claude Code | Created: 2026-04-24

> This file is loaded at the start of every Claude Code session inside this project. It tells Claude how to work here. Read PROJECT_MANIFEST.md next for project state.

---

## 1. Project at a glance

AKB1 Delivery Command Center v1. Product owner: Adi Kompalli. Architect: Claude. Fourteen tabs, Next.js 14 plus FastAPI plus Postgres plus Redis in Docker, seeded with ten programmes and three hundred people. Intelligence layer on every tab: What does this tell me, Why is this happening, What do I do this week.

Repo starts private, flips public at v1.0.0. LinkedIn launch follows.

## 2. Hard rules, non-negotiable

| Rule | Why it exists |
|------|---------------|
| No em dashes in any file, commit, tag, filename, or comment | Adi's hard rule. Use commas, periods, colons, or the word "and" instead. A pre-commit hook will enforce this. |
| No emojis in source code, tests, commits, filenames, or documentation | Adi's hard rule. Emojis are AI tells. Exception: LinkedIn launch copy only, if Adi approves line by line. |
| Human voice, Adi's tone | No "genuinely", "honestly", "straightforward", no sycophancy, no pleasantries. Executive, direct, pushback-friendly. |
| No delete or execute without Adi's explicit consent | Never run destructive commands, never drop tables, never force push. Ask first. |
| Write to memory on every event | Any state change (module started, milestone gated, decision made) triggers a write to BUILD_STATE.md, DECISION_LOG.md, or MILESTONE_STATUS.md. Not optional. |
| Wireframes approved before code | No FastAPI route, no React component is written until all wireframes are signed off. |
| Senior practitioner tone | Never explain basics. Adi knows SAFe, P&L, RBAC, Docker. Write for recall and cross-reference. |
| iCloud recovery anchor current | PROJECT_MANIFEST.md must always reflect current phase, version, and module states. |
| Regression gates non-negotiable | Zero baseline test failures tolerated. v5.8 accepted 5 of 56 Playwright failures. v1 does not. |
| PRD stays in sync with code | OpenAPI spec generated from FastAPI is diffed against PRD in CI. Fail on mismatch. |
| Seed data deterministic | Single seed generator, fixed random seed. Any contributor who clones and runs make seed gets byte-identical data. |
| Drill integrity tested automatically | Every drill path (up, down, through, across) has a Playwright test that asserts data resolution from parent to child, not a mock string. |
| 10 programmes, 300 people canonical base | Any seed change must preserve this shape unless Adi approves a change. |

## 3. v5.8 lessons locked as regression gates

| v5.8 mistake | v1 gate |
|--------------|---------|
| Seed drift from schema changes | CI runs schema-vs-seed consistency check, fails on drift |
| Stale endpoint list vs PRD | OpenAPI generated, diffed against PRD §10 table, CI fails on mismatch |
| UI cards orphaned from endpoints | Contract test asserts every frontend fetch maps to a documented endpoint |
| Drill defects across tabs | Drill integrity suite walks every drill path and asserts real data resolution |
| NavLink aria-label missing | axe-core runs in CI, any WCAG AA violation fails build |
| Pre-existing baseline test failures tolerated | Zero tolerance, main branch must be fully green |
| Em dash in tag body or commit message | Pre-commit hook scans and blocks |
| Emoji in any file | Pre-commit hook blocks |
| PRD not updated with scope change | PRD update required in the same commit as the code change |

## 4. Subagent roster (planned, not yet created)

Nine specialist subagents, one Markdown file each in `.claude/agents/`. Created during M5.

| Agent | Scope |
|-------|-------|
| backend-dev | FastAPI routes, Pydantic schemas, business services |
| frontend-dev | Next.js app, components, state, Tailwind |
| data-engineer | Seed generator, migrations, fixtures, data quality |
| intelligence-engineer | What Why Act engine, per-tab rules, LLM calls |
| security-engineer | Auth, RBAC, row-level security, audit log |
| qa-engineer | pytest, Vitest, Playwright, drill integrity, contract tests |
| devops | Dockerfiles, docker-compose, CI workflows, deploy manifests |
| docs-writer | README, PRDs, wireframe copy, release notes, LinkedIn kit |
| accessibility-auditor | axe-core integration, keyboard nav checks, colour contrast |

Claude Code delegates work to the right subagent based on the milestone. Lead senior dev (Claude) orchestrates.

## 5. Operating flow

```
Phase 1 Wireframes ---> Phase 2 Docs ---> Phase 3 Code (Claude Code) ---> Phase 4 Release
    (Cowork)            (Cowork)           (Claude Code)                    (Claude Code + Adi)
```

Phase 1 runs in Cowork with me, not Claude Code. Phase 3 runs in Claude Code with subagents. Phases 2 and 4 can run in either.

## 6. File and naming conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| PRD | `NN_PRD_<Topic>.md` | `04_PRD_Tab_01_Executive.md` |
| Architecture | `NN_<Topic>.md` | `01_ADR_Tech_Stack.md` |
| Wireframe | `v1_NN_<Tab>.html` | `v1_06_PnL_Cockpit.html` |
| Test plan | `NN_<Topic>_Test_Plan.md` | `05_Drill_Integrity_Test_Plan.md` |
| Release | `vX.Y.Z_release_notes.md` | `v1.0.0_release_notes.md` |
| Backend module | `snake_case.py` | `margin_waterfall_service.py` |
| Frontend component | `PascalCase.tsx` | `MarginWaterfallCard.tsx` |
| Frontend page | `kebab-case/page.tsx` | `app/pnl-cockpit/page.tsx` |
| Commit message | `<type>(scope): <summary>` | `feat(backend): add margin waterfall endpoint` |
| Branch | `<type>/<slug>` | `feat/tab-01-executive-wireframe` |

Commit types: feat, fix, docs, refactor, test, chore, ci, build, perf, style, revert.

No em dashes. No emojis. Lowercase with hyphens or underscores. No spaces in filenames.

## 7. State files (always current)

| File | Updated when |
|------|--------------|
| PROJECT_MANIFEST.md | Phase transition, version bump, module status change |
| docs/state/BUILD_STATE.md | Every substantive session end |
| docs/state/DECISION_LOG.md | Any architectural decision |
| docs/state/MILESTONE_STATUS.md | Milestone opens, progresses, closes, or fails a gate |
| docs/state/RISK_REGISTER.md | New risk identified or existing risk status changes |
| docs/state/TECH_DEBT.md | Item deferred, paid down, or re-prioritised |

## 8. What does NOT get written into this repo

Session transcripts from Cowork. Chief of Staff workspace wiki pages. Temporary scratch files. Personal notes. Other Cowork projects. Anything that belongs in the parent AKB1 Base workspace.

The AKB1 Delivery Command Center repo is public-bound. Keep it clean.

## 9. Secrets and credentials

Never committed. `.env.example` lists required keys with placeholder values. Real `.env` is gitignored. On a fresh clone, contributor copies `.env.example` to `.env` and fills in values. Secret managers (1Password, Vault) to be added in Phase 2 when hosting.

Known keys at v1.0.0:
`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OLLAMA_BASE_URL` (optional), `LITELLM_API_KEY` (optional), `OPENAI_API_KEY` (optional fallback).

## 10. Testing gates for every milestone

| Gate | Tool | Threshold |
|------|------|-----------|
| Unit tests (backend) | pytest | 100 percent pass, coverage 80 percent minimum |
| Unit tests (frontend) | Vitest | 100 percent pass, coverage 80 percent minimum |
| E2E tests | Playwright | 100 percent pass, no tolerated baseline failures |
| Contract tests | pytest plus schemathesis | 100 percent pass |
| Drill integrity | Playwright suite | Every drill path resolves to real data |
| Accessibility | axe-core | Zero WCAG AA violations |
| Performance benchmark | Locust | Green at 100 and 500 concurrent, amber allowed at 1000 |
| Security scan | trivy plus bandit | No critical CVEs, no high bandit findings |
| Pre-commit hooks | custom | Em dash scan, emoji scan, lint, format all pass |

No merge to main unless all gates green.

## 11. How to resume work in a new session

Claude Code flow: open project, read this file, read PROJECT_MANIFEST.md, read docs/state/BUILD_STATE.md, read latest entry in docs/state/DECISION_LOG.md. That gives full context in under thirty seconds. No cold start.

Cowork flow: Adi loads AKB1 Base Chief of Staff, reads hot cache, sees the project listed in ACTIVE_CONCEPTS.md, opens this folder, continues.

## 12. Where to ask when uncertain

Ask Adi. Do not guess. The cost of a clarifying question is one message. The cost of building the wrong thing is a milestone.

---

*File owner: Claude. Last updated: 2026-04-24.*
