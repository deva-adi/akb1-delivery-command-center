# CODEX HANDOFF -- M10-9 Governance KPI Cell Drill
### AKB1 Delivery Command Center v1.1 | Closed: 2026-05-18

---

## 1. Scope

Final M10 gap closed: the Governance KPI grid (10 cards) is now interactive.
Clicking any KPI card sets `?kpi=<slug>` in the URL and applies a gold
`ring-2 ring-accent-gold ring-inset` highlight on the active card. Pattern A:
'use client' + useRouter only, no useSearchParams (no Suspense boundary).

Implements BUILD_SCOPE_M10_DRILL.md Section 5.9 row:
`KPI grid cell | Click | ?kpi=decision-velocity; that KPI highlighted across programmes`.

---

## 2. Files Modified

| File | Change |
|------|--------|
| `frontend/lib/governance.ts` | Added `KPI_SLUGS` (label -> slug) and `KPI_SLUG_TO_LABEL` (slug -> label), 10 entries each. |
| `frontend/components/GovKPIGrid.tsx` | Rewrote as `"use client"` component. Added `activeKpi: string \| null` prop. Each card is clickable, keyboard-activatable (Enter/Space), aria-labelled, carries `data-testid="gov-kpi-card-{slug}"`, and applies `ring-2 ring-accent-gold ring-inset` when active. Display labels preserved verbatim (e.g. "Decisions Open (Pegasus)") -- slugs are passed in as props from `KPI_SLUGS`. |
| `frontend/app/home/governance-operating-model/page.tsx` | Added `kpi?: string` to searchParams type, derived `activeKpi`, passed it to `GovKPIGrid`. |
| `frontend/tests/unit/gov-kpi-drill.test.ts` | New: 12 unit tests (1 length check, 10 per-KPI slug round-trip + pattern, 1 round-trip-all + length check on reverse map). |
| `frontend/tests/e2e/full_drill_suite.spec.ts` | Appended 3 governance KPI drill tests under a new "Governance: KPI cell drill (M10-9)" section. |

No other component or page touched. GovStakeholderSection, GovAdminSection, etc.
are unchanged.

---

## 3. Test Counts

| Suite | Count | Result |
|-------|-------|--------|
| Vitest (before M10-9) | 636 | green |
| Vitest (after M10-9) | **648** | **green, 0 failures** |
| New unit tests | +12 | all green |
| New E2E tests | +3 | not executed in this slice (requires live stack) |

Vitest gate output:
```
 Test Files  51 passed (51)
      Tests  648 passed (648)
   Duration  10.95s
```

The 3 new Playwright tests are appended to the existing `full_drill_suite.spec.ts`
and will run as part of the standard E2E gate. They are data-independent
(no backend fetch required for the KPI grid -- all 10 cards are stub-valued),
so they should be reliable in full suite runs without rate-limit pressure.

---

## 4. Gate Result

`npx vitest run` -> 648 passed, 0 failed.
Hard rules respected: no em dashes added to source, no emojis, no destructive
changes, no modifications outside the five files listed.

---

## 5. Deviations From Spec

None of substance. One minor judgement call worth noting:

- **Display labels kept with parentheticals.** The grid still shows
  "Decisions Open (Pegasus)", "Contract Staleness (max)", and
  "Sponsor Engagement (min)" exactly as M10-7 had them. The slug map
  (`KPI_SLUGS`) keys use the cleaner labels per spec
  (`"Decisions Open" -> "decisions-open"`), and the cleaner label is what
  the test asserts. The displayed label is a separate concern, passed to
  the KpiCard `label` prop; the slug is passed independently from
  `KPI_SLUGS`. This is the minimal change: keeps M10-7 visual identical
  and isolates the drill mechanic.

- **12-test count interpretation.** The 4 bullets in the spec resolve to
  12 concrete tests as follows: 1 length check on `KPI_SLUGS`, 10
  per-KPI tests that each assert the slug equals the expected value AND
  matches the lowercase-hyphenated pattern (this subsumes both the
  "non-empty lowercase-hyphenated" requirement and both spot checks), and
  1 round-trip-all + length check on `KPI_SLUG_TO_LABEL`. 12 tests total,
  no missing coverage.

---

## 6. Next Step

`git commit -m 'feat(m10-9): governance KPI cell drill -- activeKpi prop, 12 unit tests, 3 E2E scenarios'`
then update `MILESTONE_STATUS.md` to mark M10-9 closed and bump the
"M10 COMPLETE" anchor accordingly. v1.1.0 tag already in place; no
re-tag needed for this micro-slice unless Adi wants a v1.1.1 cut.

---

*Owner: Claude. Last updated: 2026-05-18.*
