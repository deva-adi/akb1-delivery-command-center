# 03_Playwright_E2E.md
### Playwright E2E | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 adds 3 new spec files (governance, capability, ai_governance) and 12 updated specs for rev 4 cascades. Plus 2 cross-cutting spec files (audit_trail, onboarding) and the Board Pack export spec. Total spec file count grows from approximately 17 to 22. Revision 1 content preserved below.
>
> Revision 1: User journey tests per tab per role. Rev 3 path coverage. Owner: Test runner subagent.

---

## 1. Scope

One Playwright spec file per tab. Each file covers the primary journey for the tab's primary role plus a secondary pass for Read Only. Rev 3 severity-1 and severity-2 additions are each tested with dedicated steps.

## 2. Tools

- Playwright Test with TypeScript
- playwright-axe for inline a11y assertions during journey
- pixelmatch for snapshot diffs on charts (tolerance 0.01)

## 3. Browser matrix

Chromium 122 (primary), Firefox 128, WebKit 18. Launch gate: Chromium only. Post-launch gate: all three.

## 4. Test file layout

```
frontend/tests/e2e/
  v1_01_executive.spec.ts
  v1_02_delivery_health.spec.ts
  v1_03_risk_raid.spec.ts
  v1_04_workforce.spec.ts
  v1_05_financials.spec.ts
  v1_06_pnl_cockpit.spec.ts
  v1_07_flow_velocity.spec.ts
  v1_08_ai_innovation.spec.ts
  v1_09_commercial.spec.ts
  v1_10_backlog_health.spec.ts
  v1_11_scenario_planner.spec.ts
  v1_12_ops_sla.spec.ts
  v1_13_multi_vendor.spec.ts
  v1_14_change_impact.spec.ts
  v1_15_client_health.spec.ts
  cross/search_palette.spec.ts
  cross/exports_steerco.spec.ts
  cross/history_asof.spec.ts
  cross/notifications.spec.ts
```

## 5. Critical path assertions per rev 3 severity-1 metric

### 5.1 Executive tab

Decision Latency KPI card visible with value 9.3 days and red trend. Value Realisation KPI card visible with 54 percent and amber trend. Click Decision Latency card routes to Ops and SLA tab with Decision Queue section focused.

### 5.2 Workforce Intelligence tab

Bus Factor KPI card visible showing 1.4 with Pegasus = 1 callout. Overtime Hours card shows 12.4 h/p with red trend. Team Health Index shows 6.3 of 10 amber. Team Sustainability Matrix renders six programme rows. AI Impact Pyramid Overlay renders six bands with B3 flagged red at -42 percent.

### 5.3 Ops and SLA tab

Decision Queue section renders with 5 rows. Stellar CR reprice row shows 14 days past SLA in red. Decision Velocity chart renders the rolling 12-week line ending at 9.3 days.

### 5.4 Change Impact tab

Scope Debt Register section renders 4 specific rows plus the drill summary. Undelivered Promise chip, Workaround chip, Rework Tax chip all present. Total scope debt shows 312 person-days and minus USD 680K.

### 5.5 Client Health Radar tab

Signal matrix now has 9 columns including Value Realisation. Pegasus row shows Value Realisation = Not achieved red chip. Health radar renders 5 axes. Composite score 32 on Pegasus visible.

## 6. Rev 3 severity-2 additions

Delivery Health Estimation Accuracy table with silent drift badge on Pegasus 3 deliverables. Financials Bench Tax Allocation table with Rajesh K. named in Pegasus row. P and L waterfall with 5 driver bars including Bench Tax callout. AI Innovation defect attribution table and AI-assist bars. Commercial QBR Tracker showing Helvetia 72 percent renewal probability. Scenario PERT input matrix with expected values and sigma. Multi-Vendor Rationalisation Queue with 6 vendors and gate dates.

## 7. Role pass design

Each spec file runs twice:

```typescript
test.describe("Executive tab - Portfolio Owner", () => { ... });
test.describe("Executive tab - Read Only", () => { /* no mutation, no steerco pack button visible */ });
```

## 8. Snapshot strategy

Charts asserted via DOM values plus optional pixel snapshot on an approved canonical viewport (1440x900). Tolerance 1 percent. Snapshot updates require PR review and an accompanying memo.

## 9. Runtime targets

Parallel shards of 4. Full run under 25 minutes on GitHub-hosted runner. Flaky test retry is 1.

---

*Owner: Test runner subagent. Signoff: Claude.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 New spec files (rev 4 surfaces)

| Spec file | Tab | Scenarios | Source |
|-----------|-----|-----------|--------|
| `tests/e2e/governance.spec.ts` | v1_16 Governance Operating Model | 8 | PRD 23 sec 13, Test Plan 10 |
| `tests/e2e/capability.spec.ts` | v1_17 Capability and Supply Chain | 8 | PRD 24 sec 13, Test Plan 11 |
| `tests/e2e/ai_governance.spec.ts` | v1_18 AI Governance | 9 | PRD 25 sec 13, Test Plan 12 |
| `tests/e2e/audit_trail.spec.ts` | Audit Trail Console | 6 | PRD 26 sec 13, Test Plan 14 |
| `tests/e2e/onboarding.spec.ts` | First 90 Days Onboarding | 7 | PRD 27 sec 13 |

### R2.2 Updated spec files (rev 4 cascades)

12 existing spec files updated to add rev 4 scenarios:

| Spec file | New scenarios |
|-----------|---------------|
| `tests/e2e/executive.spec.ts` | Portfolio Drift drill, role-aware subtitle render, Account Concentration cross-link |
| `tests/e2e/delivery_health.spec.ts` | EVM Quartet render, Transition Planning detail, Over-Optimism strip drill |
| `tests/e2e/risk_raid.spec.ts` | Escalation Timing distribution, 5-Why workflow open and save |
| `tests/e2e/workforce.spec.ts` | Utilization Reconciliation table, v1_17 cross-link banner navigation |
| `tests/e2e/financials.spec.ts` | 5-Mechanism Revenue Leakage filter |
| `tests/e2e/pnl_cockpit.spec.ts` | Hub-aligned 5-leak labels, EVM cross-surface render |
| `tests/e2e/flow_velocity.spec.ts` | DORA Quartet render with band chips |
| `tests/e2e/ai_innovation.spec.ts` | Delivery Speed Gap overlay, v1_18 cross-link click |
| `tests/e2e/commercial.spec.ts` | Account Concentration map, Rate Card grid, Growth Tracker, QBR Quality, theatre flag filter |
| `tests/e2e/scenario_planner.spec.ts` | Mode switcher, Baseline Forecast fan, Friday Forecast Call submit |
| `tests/e2e/ops_sla.spec.ts` | Decision Queue extended columns, category filter persistence, v1_16 cross-link |
| `tests/e2e/multi_vendor.spec.ts` | Contract Lifecycle timeline, DoD Matrix gap detection |
| `tests/e2e/change_impact.spec.ts` | 6 new sections (Bypass, CR Cost, Closeout, Definition, Interventions, Decision Tax) |
| `tests/e2e/client_health.spec.ts` | Stakeholder Influence quadrant, Opposition action |

### R2.3 Cross-cutting test additions

```
test "Tier rename propagates across surfaces":
  login as PO
  open Tier Config Admin in v1_16
  rename tier 2 to "Delivery Director"
  visit v1_03 Risk and RAID
  assert escalation context shows "Delivery Director" not "Programme Director"
  rationale: render-time read from escalation_tier_config

test "Audit row written for every mutation":
  login as PO with AP
  perform 5 mutations across different tabs (decision approve, raid edit, raci edit, gate approval, tier rename)
  visit /audit
  assert 5 new audit rows visible in last 5 minutes
  click each: verify before/after JSON populated
```

### R2.4 Run profile

E2E runs on:
- Every PR (smoke subset, ~20 scenarios, under 10 minutes)
- Nightly (full suite, ~80 scenarios across 22 spec files, under 60 minutes)
- Pre-release (full suite plus performance profiling)

Browsers: Chromium and Firefox. WebKit deferred to post-v1.0.0.

Headless on CI; headed locally for debugging.

### R2.5 Release gating (revision 2 additions)

Revision 2 ships when:
1. 5 new spec files green
2. 14 updated spec files green
3. Cross-cutting tier propagation and audit invariant tests green
4. Total scenario count: approximately 80, all green
5. Smoke run under 10 minutes; full run under 60 minutes
6. Both Chromium and Firefox green

---

*Revision 2 owner: Claude. Signoff: Adi (pending). Spec file count: 22. Scenario count: ~80.*
