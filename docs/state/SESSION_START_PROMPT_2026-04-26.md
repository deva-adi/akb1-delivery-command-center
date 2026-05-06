# SESSION_START_PROMPT_2026-04-26.md
### Cowork session resume prompt | After 2026-04-25 close | M6 backend slice 1 in flight

> Paste this as the first turn of the next Cowork session. The Claude Code session in iTerm2 is mid-flight on slice 2.4. This Cowork agent is the proxy: read state, watch Claude Code via computer-use, answer its questions, log decisions.

---

Good morning. Resuming AKB1 Delivery Command Center v1 work. The rev 4 cascade closed yesterday end-of-day 2026-04-25 (D-035). M6 backend slice 1 launched in a fresh Claude Code session running in iTerm2 with the kickoff prompt at `docs/state/CLAUDE_CODE_KICKOFF_PROMPT_2026-04-25.md`. I proxied 4 Q&A round trips before close. The session was mid-flight on slice 2.4 seed determinism work at close.

Read in order. Do not skim:

1. `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/CLAUDE.md` (workspace operating rules)
2. `docs/state/DECISION_LOG.md` entries D-027 through D-036 fully (35 architectural decisions; D-036 contains 12 rulings made yesterday for slice 1)
3. `docs/state/BUILD_STATE.md` (M1-M4 rev 4 closed; M6 at 5 percent; slice 1 status notes)
4. `docs/state/CLAUDE_CODE_KICKOFF_PROMPT_2026-04-25.md` (the kickoff prompt Claude Code is executing)
5. `memory/session_2026_04_25.md` (yesterday closing memory with the full Q&A trail)
6. `docs/prd/01_PRD_Data_Model.md` rev 4 (especially §4.71 audit_trail_entries, §4.73 escalation_tier_config, §5.1.4 evm_snapshots distribution, §5.2 60-metric register seed)
7. `docs/test/14_Audit_Trail_Tests.md` (append-only invariant test pattern)

Hard rules carried forward:

1. No em dashes, no en dashes, no emojis. Per-file gate after each edit. Workspace path "AKB1 Base | Chief of Staff" with em dash is the single legitimate occurrence.
2. Adi runs all git commits in iTerm2. Claude Code never commits. Cowork never commits.
3. Never delete or execute destructive actions without explicit Adi consent.
4. SEED constant 20260424 locked. Two seed runs must produce SHA-256 byte-identical output. This is the slice-1 north star.
5. Audit trail Option A full snapshot per Q4. Every PATCH/POST/DELETE writes before_json plus after_json synchronously in the same transaction. No mutation without audit row.
6. Append-only invariant on audit_trail_entries: REVOKE ALL plus FORCE RLS plus INSERT-only policy. Defense-in-depth ruling per D-036.4 catches TRUNCATE bypass. akb1_owner cannot bypass via ownership.
7. AP flag enforcement on PO, DD, FL accounts. Seeded true on the PO plus 1 DD plus 1 FL.
8. Q1 tier rename: zero hardcoded tier name strings outside seed and migration files.
9. No-hardcoded-thresholds lint rule in CI.
10. RAID taxonomy Risk Assumption Issue Dependency. DSO formula `(AR Outstanding / Revenue Billed in Period) x Days in Period`.

Where M6 slice 1 stands:

- 2.1 backend scaffold: green. 23 files under backend/. /health returns 200. pytest 2/2.
- 2.2 docker compose: green. akb1_dcc_db and akb1_dcc_redis up. Two-role pattern (akb1_owner DDL, akb1_app runtime).
- 2.3 first migration 001_rev4_foundation.py: green. Four entities (programmes, people, audit_trail_entries, escalation_tier_config). Append-only invariant hardened with REVOKE ALL plus FORCE RLS.
- 2.4 seed: in flight. Parallel work on 002_threshold_register migration, ORM model, EscalationTierConfig 5-tier seed, 60-metric data table values, SHA-256 determinism harness. Programmes-and-people seed pending lock confirmation per D-036 ruling 10.
- 2.5 PATCH /admin/tier-config/{n}: pending.
- 2.6 em-dash pre-commit hook: pending.
- 2.7 no-hardcoded-thresholds lint: pending.
- 2.8 acceptance suite green: pending.

Your role this session:

1. Take a screenshot of the iTerm2 Claude Code session via computer-use to see the current state. Likely Claude Code has either reached the SHA-256 determinism gate (the slice-1 north star), or is asking another question, or is stopped on an error.
2. If Claude Code is asking a question, answer grounded in PRD rev 4 plus D-036 rulings. Produce a copy-paste reply for Adi to paste back into Claude Code.
3. If Claude Code reached slice 2.4 acceptance, the next gates are 2.5 PATCH endpoint plus 2.6 pre-commit hook plus 2.7 lint plus 2.8 suite acceptance. The whole slice closes when 2.8 is green.
4. After slice 1 closes, Adi confirms before slice 2 begins. Slice 2 likely covers v1_16 Governance Operating Model first endpoint, or v1_18 AI Governance approval endpoint with AP flag enforcement. Be ready to recommend.

Likely failure modes to watch for at slice 2.4:

- SHA-256 hash drift across two seed runs. Cause is almost always `datetime.utcnow()` calls or unseeded UUID generation. Both must derive from SEED or be excluded at seed time.
- threshold_calibration_register §5.2 transcription drift. Direction enum case (HigherIsBetter, LowerIsBetter, RangeIsBetter), owning role enum (PortfolioOwner, FinanceLead, ProgrammeManager), numeric precision must match §5.2 exactly.
- Programme seed names not matching D-036 ruling 8 (PEGASUS, PHOENIX, ORION, STELLAR, HELIX, ATLAS, DRACO, LYRA, VEGA, ANDROMEDA). State distribution must match §5.1.4 (2 Failing-equivalent + 3 Slipping + 5 Healthy/Watching).
- AP flag distribution at slice 2.5 contract test. Must be true on seeded PO, 1 DD, 1 FL per D-036 ruling 10.

After watching Claude Code:

- If it is awaiting answers, produce the copy-paste reply.
- If it is mid-execution, give Adi the option to wait or interrupt with new guidance.
- If a stop condition fired, read the report, decide whether to override, escalate, or ask Adi.

Acknowledge in one paragraph what you read, then take the screenshot and proceed.

---

*Owner: Claude (Cowork). Resume target: M6 backend slice 1 closure followed by slice 2 selection and execution. v1.0.0 launch target 2026-06-10 retained.*
