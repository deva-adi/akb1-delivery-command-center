# Claude Code Kickoff Prompt | M6 Backend Build | 2026-04-25
### Paste this verbatim into a fresh Claude Code session at /Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/17_AKB1_Delivery_Command_Center/

---

# AKB1 Delivery Command Center v1 - M6 Backend Build Kickoff

You are taking over the M6 backend build for AKB1 Delivery Command Center v1. The rev 4 cascade is complete. Your job is to implement a foolproof first vertical slice that proves the cross-cutting invariants, then scale out one entity at a time.

## Step 0: Read these files in order before writing a single line of code

Read fully. Do not skim. Track in a note what you learn from each.

1. `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/CLAUDE.md` (project operating rules across the workspace)
2. `docs/state/DECISION_LOG.md` (read entries D-027 through D-035 fully; skim D-001 through D-026)
3. `docs/state/BUILD_STATE.md` (current module status)
4. `docs/state/IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md` (the rev 4 plan that was just executed)
5. `docs/prd/00_PRD_Master.md` (Master PRD rev 3, especially R3 amendments)
6. `docs/architecture/00_Design_Foundations.md` (Design Foundations rev 4 with 13 amendments)
7. `docs/prd/01_PRD_Data_Model.md` (Data Model rev 4 with 86 entities; section 3.1.10 role matrix; section 4.71 audit_trail_entries; section 4.73 escalation_tier_config; section 5.2 60-metric threshold register seed)
8. `docs/prd/03_PRD_Security_Auth.md` rev 2 plus the rev 3 cascade notes referenced in D-027 (AP flag flow)
9. `docs/prd/26_PRD_Audit_Trail_Console.md` (Audit Trail Console PRD)
10. `docs/test/14_Audit_Trail_Tests.md` (append-only invariant, Option A full snapshot rule)
11. `docs/test/01_Test_Strategy_Master.md` (testing posture)
12. `docs/test/02_Contract_Tests.md` rev 2 (endpoint contract test approach)
13. `docs/test/05_Performance_Benchmarks.md` rev 2 (perf gates)
14. `docs/test/09_Role_Gating.md` rev 2 (access matrix encoding)

## Step 1: Confirm you understand the hard rules

These rules apply to every line of code, every commit, every test, every file you create. Internalise them.

1. No em dashes, no en dashes, no emojis in any product file. Pre-commit hook must enforce. Workspace path "AKB1 Base — Chief of Staff" is the single legitimate occurrence.
2. Never delete files or execute destructive actions without explicit consent from Adi. Always confirm before any DROP, DELETE, rm -rf, or git force operations.
3. Adi runs all git commits himself in iTerm2. Do not run `git commit`. Stage changes and report what should be committed; he commits.
4. Zero tolerance on baseline test failures. If a test fails on main, stop and fix before any new work.
5. Seed determinism via numpy.random.RandomState(20260424). The SEED constant is 20260424. Do not change it. Two runs of the seed generator must produce byte-identical output (SHA-256 hash assertion).
6. Audit trail Option A full snapshot rule (Q4): every PATCH, POST, DELETE on a sensitive resource writes a row to audit_trail_entries with both before_json and after_json populated as full snapshots, not diffs.
7. Append-only invariant on audit_trail_entries: no UPDATE, no DELETE granted to any role at the database layer. Enforce via REVOKE plus row-level constraints.
8. AP flag enforcement: full per-row read on audit_trail_entries and AI governance audit-scope entities requires Audit Permission flag true on a PO, DD, or FL account. Default false.
9. Threshold register binding: no hardcoded thresholds in tab modules. Every green/amber/red state assignment reads from threshold_calibration_register. Lint rule no-hardcoded-thresholds in CI.
10. Q1 tier rename: every escalation tier display string reads from escalation_tier_config.display_label at render time. Zero hardcoded "Programme Director" or "Sponsor" strings outside the seed and migration files.
11. Locked Hub phrases (7 total): bytewise preserved in product copy. Voice regression tests verify byte-exact match.
12. Wireframes are the visual contract. The frontend (M7) must match `docs/wireframes/v1_*.html` panel for panel.

## Step 2: Verify your environment

Before authoring code, run these commands and confirm output. Stop and report if any command fails or returns unexpected output.

```bash
# Working directory should be the project root
pwd
# Expected: /Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/17_AKB1_Delivery_Command_Center

# Python version
python3 --version
# Expected: 3.12.x

# Node version
node --version
# Expected: v20.x.x

# Docker
docker --version
docker compose version

# Postgres client
psql --version

# Git status
git status
# Expected: rev 4 changes from yesterday already committed by Adi or staged for commit
```

If any of the above fails, stop and report the gap. Do not proceed.

## Step 3: First vertical slice

Build a single end-to-end vertical slice that proves the stack and the cross-cutting invariants. The slice covers four entities: `escalation_tier_config`, `audit_trail_entries`, `programmes`, `people`. One endpoint demonstrates the full audit chain and Q1 tier rename pattern.

Order of work, with verification gate after each step:

### 3.1 Backend scaffold

Create `backend/` directory if not present. Author:
- `backend/pyproject.toml` with FastAPI, asyncpg, SQLAlchemy 2 async, Alembic, Pydantic v2, pytest, schemathesis, hypothesis
- `backend/app/__init__.py`
- `backend/app/main.py` with FastAPI app instance, /health endpoint
- `backend/app/database.py` with async engine and session factory
- `backend/app/models/` directory for SQLAlchemy models
- `backend/app/schemas/` directory for Pydantic v2 models
- `backend/app/routes/` directory for FastAPI route modules
- `backend/app/intelligence/` directory for tab intelligence modules
- `backend/alembic.ini` and `backend/alembic/env.py`
- `backend/tests/` with pytest config

**Verification gate 3.1**: `pytest --collect-only` returns zero errors. `uvicorn app.main:app --reload` starts and `/health` returns 200. STOP and confirm with Adi before proceeding.

### 3.2 Docker Compose

Author `docker-compose.yml` at project root with services:
- `db`: postgres:16, env vars from `.env.example`, healthcheck
- `redis`: redis:7, healthcheck
- `backend`: depends on db and redis, mounts backend code

**Verification gate 3.2**: `docker compose up -d db redis` brings up green. `docker compose ps` shows healthy. Stop and confirm.

### 3.3 First migration: foundation entities

Author Alembic migration `001_rev4_foundation.py` covering:
- `programmes` table per Data Model PRD rev 2 schema
- `people` table with rev 3 additions (`overtime_hours_mtd`, `last_1on1_sentiment_score`)
- `audit_trail_entries` table per Data Model rev 4 section 4.71 with append-only enforcement
- `escalation_tier_config` table per Data Model rev 4 section 4.73

Apply append-only enforcement on audit_trail_entries via:
```sql
REVOKE UPDATE, DELETE ON audit_trail_entries FROM PUBLIC;
ALTER TABLE audit_trail_entries ENABLE ROW LEVEL SECURITY;
-- No UPDATE policy; only INSERT allowed
```

**Verification gate 3.3**:
- `alembic upgrade head` succeeds
- `alembic downgrade -1` succeeds
- `alembic upgrade head` succeeds again (idempotent)
- Test: attempt direct SQL `UPDATE audit_trail_entries SET ...` rejected
- Test: attempt direct SQL `DELETE FROM audit_trail_entries` rejected

### 3.4 Seed generator

Author `backend/app/seed/generator.py` with:
- `SEED = 20260424` constant
- `numpy.random.RandomState(SEED)` as the only entropy source
- Functions to seed 10 programmes, 300 people, 5 escalation_tier_config rows (DM, Programme Director, Portfolio Owner, Sponsor, Steerco from Data Model rev 4 section 5.1.1)
- audit_trail_entries left empty at seed time (events written by mutations only)

Author seed determinism test in `backend/tests/test_seed_determinism.py`:
```python
def test_seed_byte_identical_across_runs():
    output_1 = run_seed_to_temp_db()
    output_2 = run_seed_to_temp_db()
    assert sha256(output_1) == sha256(output_2)
```

**Verification gate 3.4**:
- `make seed` populates 10 programmes, 300 people, 5 tier configs
- `pytest backend/tests/test_seed_determinism.py` green on two runs
- SHA-256 hash of programmes table matches expected fixture (capture once on first run)
- Manual check: programmes table contains 10 rows with names from Design Foundations section 6 seed list

### 3.5 First endpoint: PATCH /admin/tier-config/{n}

Author the tier rename endpoint. This single endpoint exercises every cross-cutting invariant.

Endpoint signature:
- Path: PATCH /api/v1/admin/tier-config/{tier_number}
- Body: `{ "display_label": "string", "description_text": "string optional", "active": "bool optional" }`
- Auth: requires Portfolio Owner role
- Response: 200 with updated tier_config row
- Audit: writes audit_trail_entries row with full before_json and after_json synchronously in the same transaction

Author the audit-write helper as a SQLAlchemy event hook or middleware:
- Captures before-state via SELECT FOR UPDATE in same transaction
- Applies UPDATE
- Writes audit_trail_entries row
- Commits transaction
- If audit write fails, rolls back the UPDATE (audit invariant: no mutation without audit row)

**Verification gate 3.5**:
- Contract test: PATCH responds with 200 for PO, 403 for non-PO
- Audit invariant test: capture audit_trail_entries count before, call PATCH, count after equals before plus 1
- Snapshot test: audit row before_json and after_json both populated as full row state, not diffs
- Q1 acceptance test: PATCH tier 2 display_label, immediately GET escalation_tier_config returns new label
- Atomic rollback test: simulate audit write failure, confirm UPDATE rolled back (no orphan mutation)

### 3.6 Em-dash pre-commit hook

Author `.pre-commit-config.yaml` (or update existing) with a hook that scans all staged files for em dashes outside the workspace path. Hook fails the commit on any non-legitimate em dash.

```yaml
- repo: local
  hooks:
    - id: no-em-dash
      name: Block em dashes outside workspace path
      entry: scripts/check_em_dash.sh
      language: script
      pass_filenames: true
```

`scripts/check_em_dash.sh` greps for the em dash character (U+2014) and excludes any line containing the literal workspace path. Exit non-zero on match.

**Verification gate 3.6**:
- Stage a file with an em dash: pre-commit blocks
- Stage a file with the workspace path containing em dash: pre-commit allows
- Stage a clean file: pre-commit allows

### 3.7 Threshold register seed

Seed the 60 metrics from Data Model PRD rev 4 section 5.2 into threshold_calibration_register. Even though no tab module consumes them yet, the seed must be in place for downstream slices.

**Verification gate 3.7**:
- 60 rows in threshold_calibration_register
- Each row has direction, green, amber, red, rationale_text, owning_role
- Lint rule no-hardcoded-thresholds runs against tab modules (no-op at this point but the rule must exist)

### 3.8 Slice acceptance

When 3.1 through 3.7 are all green, the slice is complete. Run the full pytest suite and confirm zero failures.

```bash
cd backend
pytest -v
# Expected: all tests pass
# Specifically confirm:
# - test_seed_determinism (3.4)
# - test_audit_append_only (3.3)
# - test_tier_rename_with_audit (3.5)
# - test_q1_propagation (3.5)
# - test_atomic_rollback (3.5)
```

**Stop here and report to Adi.** Do not proceed to additional entities until Adi confirms the slice is acceptable.

## Step 4: Hand-back format

At the end of your session, produce a hand-back report containing:

1. List of files created or modified, with one-line description each
2. Test count per category (unit, integration, contract): X green, 0 failed
3. Migrations applied: list of revision IDs
4. Seed run output (10 programmes, 300 people, 5 tier configs, 60 thresholds): row counts confirmed
5. Endpoint demonstration: curl example showing PATCH /admin/tier-config/2, response, and audit row written
6. Open questions for Adi: any architectural choice you made that diverged from PRD or any clarification needed
7. Recommended next slice: with rationale (likely v1_16 Governance Operating Model first endpoint, or v1_18 AI Governance approval endpoint)
8. Update `docs/state/BUILD_STATE.md` with M6 progress percent and current session log entry
9. Append a D-036 entry to `docs/state/DECISION_LOG.md` if you made any architectural decision (auth library choice, ORM pattern, etc.)
10. Em-dash gate confirmation: zero non-legitimate em dashes across files touched

## Step 5: Stop conditions

Stop and report immediately, do not continue, on any of the following:

- Any test failure that you cannot resolve in 15 minutes
- Any schema deviation between your migration and the Data Model PRD rev 4
- Any need to delete a file or drop a table
- Any need to install a Python or Node package not already in the lockfile
- Any need to change the SEED constant
- Any need to grant UPDATE or DELETE on audit_trail_entries
- Any em dash you find in a non-legitimate location
- Any uncertainty about role access policy or AP flag interpretation
- Any need to commit or push to git
- Any docker compose container that fails health check after 60 seconds

For each stop, report: what you found, what you tried, what you need from Adi.

## Step 6: Forbidden actions in this session

You may NOT:
- Run `git commit` or `git push` (Adi's domain)
- Run `rm -rf` on anything outside `backend/__pycache__` or `.pytest_cache`
- Run `DROP TABLE` or `DROP DATABASE` without confirmation
- Modify files in `01_Knowledge/` (immutable)
- Modify files in `docs/wireframes/` (visual contract; M7 will reference)
- Modify files in `docs/prd/` (signed-off spec)
- Change the SEED constant
- Add em dashes anywhere
- Disable any test
- Skip any verification gate
- Author code in `frontend/` (that is M7)
- Begin a second vertical slice before Adi confirms slice 1

## Project context: who you are working for

Adi Kompalli, Associate Director, Delivery, on a CTO trajectory. He runs the project, writes commits himself, and treats this as a flagship career artefact. Production-grade quality bar. Hub-aligned voice. v1.0.0 LinkedIn launch target 2026-06-10.

Tone: terse, factual, no AI-sounding language, no emoji, no em dashes. Use pipes or hyphens. Use "and" or sentences. Direct.

## Begin

Acknowledge in one short paragraph what you understand of the slice. Then begin Step 0 (read the source files). Do not write code until you have read all 14 source files in order.

---

*Prompt authored 2026-04-25 by Claude (Cowork) for Claude Code session handoff. Anchors D-035 closure of rev 4 cascade.*
