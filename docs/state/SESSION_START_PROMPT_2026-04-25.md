# SESSION_START_PROMPT_2026-04-25.md
### Ready-to-paste opener for next session | AKB1 Delivery Command Center v1

> Copy the block below into the first message of the next session. It will orient Claude to the exact state the previous session closed in, and will not waste tokens re-discovering context.

---

## Prompt to paste (copy everything between the tripled tildes)

~~~
Good morning. This is a continuation of the AKB1 Delivery Command Center v1 build. Previous session closed end-of-day 2026-04-24 IST.

Before you respond, read these files in order (do not skip or skim):

1. `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/CLAUDE.md` (project operating rules)
2. `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/17_AKB1_Delivery_Command_Center/docs/state/SESSION_CLOSE_2026-04-24.md` (session handoff note)
3. `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/17_AKB1_Delivery_Command_Center/docs/state/BUILD_STATE.md` (current module status)
4. `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/17_AKB1_Delivery_Command_Center/docs/state/DECISION_LOG.md` (D-001 through D-026; read latest 4 entries at minimum)
5. `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/17_AKB1_Delivery_Command_Center/docs/state/UC_TO_DASHBOARD_MAPPING_2026-04-24.md` (50 UC inventory)
6. `/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/17_AKB1_Delivery_Command_Center/docs/state/IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md` (the plan awaiting my approval)

Context in one paragraph: Rev 3 is closed across 12 of 15 tab PRDs, 12 wireframes, M4 test strategy (9 docs), and M5 subagent roster (9 specs). Yesterday I asked you to do a complete Hub cross-reference. You identified 50 use cases (UC-A through UC-PP). 0 are fully covered by the current product, 22 are partial, 28 are not surfaced. You wrote a full implementation plan at `IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md` covering 3 new primary tabs (v1_16 Governance Operating Model, v1_17 Capability and Supply Chain, v1_18 AI Governance), 12 tab rev 4 cascades, 3 cross-cutting surfaces, 50 new data entities, 26 PRD files, 17 wireframe HTML files. You recommended Option 1 Full (14 turns).

My decision today is: [FILL IN ONE OF THESE BEFORE PASTING]
- A Go Option 1 Full execution in 14 turns, nothing deferred
- B Go Option 2 Compressed execution in 8 turns with brief-form PRDs
- C Go Option 3 Stage A only (6 turns, severity 1 UCs only)
- D Approve plan with scope adjustments: [NAME THE CUTS]

Hard rules still in force:
1. No em dashes, no en dashes, no emojis in product files. The workspace parent folder "AKB1 Base — Chief of Staff" is the single legitimate occurrence.
2. Never delete or execute destructive actions without my explicit consent.
3. Every revision cascades back to Data Model, Intelligence Layer, wireframe, and DECISION_LOG.
4. Hub voice: 5 locked phrases from Design Foundations rev 3, verbatim, never paraphrase.
5. Seed determinism via numpy.random.RandomState(20260424). Do not change without a D-decision.
6. Palette Option D Executive Mid is locked.
7. RAID taxonomy: Risk, Assumption, Issue, Dependency.
8. DSO formula: (AR Outstanding / Revenue Billed in Period) x Days in Period.
9. I run all git commits myself in iTerm2. Do not attempt to commit.
10. Zero tolerance on baseline test failures.
11. Always be thorough, no generic answers, no AI-sounding language.

On reading completion, acknowledge in one paragraph:
- The option I selected
- The first phase you will execute per the plan
- What you will hand back to me for review at the end of the phase

Then begin Phase 1 as described in IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md section 10.

If you find any contradiction between state files, pause and ask me before proceeding. Do not reconstruct or assume state from memory alone; trust the files on disk.
~~~

---

## How to use this prompt

1. Open next session window in Cowork mode.
2. Copy the block between the tripled tildes above.
3. Fill in the `[FILL IN ONE OF THESE BEFORE PASTING]` line with my chosen option (A, B, C, or D).
4. Paste into the first turn.
5. Claude will read the 6 files listed, acknowledge my option, and begin Phase 1.

## What this prompt does well

- Ties next-session Claude to the exact files on disk, not to half-remembered context
- Forces re-read of CLAUDE.md, SESSION_CLOSE, BUILD_STATE, DECISION_LOG, the 50-UC mapping, and the implementation plan before any action
- Surfaces the option I need to pick as a required fill-in
- Restates the 11 hard rules so no drift
- Gives Claude the acknowledgement structure I expect before work starts

## What this prompt deliberately avoids

- Does not repeat the 50 UC list inline (wastes tokens; Claude reads it from disk)
- Does not repeat wireframe rev 3 detail (Claude reads it from disk)
- Does not re-explain the Hub voice lock (that is in Design Foundations)
- Does not assume Claude's memory from this session; treats next session as cold start with file-based continuity

---

*Owner: Claude (this session). Audience: Claude (next session). Created 2026-04-24 end of day IST.*
