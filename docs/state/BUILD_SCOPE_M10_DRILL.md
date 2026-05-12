# M10 Drill Interactivity -- Full Build Scope
### AKB1 Delivery Command Center v1.1 | Scoped: 2026-05-11 | Owner: Adi Kompalli

---

## 1. What This Milestone Delivers

Full drill-down, drill-up, and drill-through interactivity across all 14 tabs. Every graph, table row, chart bar, heat map cell, and matrix cell becomes a clickable trigger. User selections persist in the URL so back-navigation, sharing, and tab-switching all carry context. Filter state is visible, clearable, and consistent.

This is not cosmetic. It converts the dashboard from a read-only portfolio display into an interactive decision cockpit -- the gap between what the wireframes promised and what v1.0.0 delivered.

---

## 2. Industry Reference Pattern (BI Best Practice)

Industry-standard portfolio dashboards (Tableau, Power BI enterprise patterns, SAP Analytics Cloud) implement a three-level hierarchy with URL-driven state:

**Level 0 -- Portfolio** `/home/{tab}`
All programmes, aggregated metrics. Default on every tab load.

**Level 1 -- Programme-scoped** `/home/{tab}?p={CODE}`
One programme selected. Every component on the tab re-renders with programme-scoped data. Filter bar shows the active selection with a clear button. Breadcrumb shows `Portfolio > PEGASUS`.

**Level 2 -- Entity detail** `/home/{tab}/[code]/[entity-id]`
Single RAID item, single milestone, single audit entry. Full detail view. Breadcrumb shows `Portfolio > PEGASUS > Risk Item 12`.

**Drill-through** (cross-tab with context preserved)
Clicking "View Delivery Health" from PEGASUS executive row navigates to `/home/delivery-health?p=PEGASUS`. The programme filter carries across. Breadcrumb updates. No context loss.

**Drill-up**
Breadcrumb links: clicking "Portfolio" strips the `?p=` param and returns to Level 0. Clicking "PEGASUS" from a Level 2 entity strips the entity segment. Browser back also works correctly because state lives in the URL.

---

## 3. URL and State Architecture

All filter state lives in URL search parameters. No React state, no context, no localStorage.

```
/home/executive                          Level 0: all programmes
/home/executive?p=PEGASUS                Level 1: PEGASUS-scoped executive
/home/risk-raid?p=PEGASUS&type=Risk      Level 1 with secondary filter
/home/risk-raid/PEGASUS/[raid-id]        Level 2: RAID item detail
/home/delivery-health/PEGASUS/[ms-id]   Level 2: milestone detail
/home/audit-trail-console/[entry-id]    Level 2: audit entry detail (no programme prefix -- entries are global)
```

**Search params in use:**

| Param | Values | Applies to |
|-------|--------|------------|
| `p` | ANDROMEDA, ATLAS, DRACO, HELIX, LYRA, ORION, PEGASUS, PHOENIX, STELLAR, VEGA | All tabs |
| `health` | Failing, Red, Amber, Watching, Green | Executive, Financials |
| `type` | Risk, Assumption, Issue, Dependency | Risk and RAID |
| `severity` | Critical, High, Medium, Low | Risk and RAID |
| `band` | B1, B2, B3, B4, B5 | Workforce, Capability |
| `sla` | incident-response, availability, change-mgmt, capacity, security, compliance | Ops SLA |
| `actor` | person UUID | Audit Trail |
| `table` | table name string | Audit Trail |
| `from` | ISO date | Audit Trail |
| `to` | ISO date | Audit Trail |

**URL rules:**
- Adding a param never causes a full page reload -- Next.js router.push with scroll:false
- Clearing a param removes it from the URL entirely, not setting it to empty string
- Multiple params compose: `?p=PEGASUS&type=Risk` is PEGASUS Risks only
- Breadcrumb is always derived from current URL params, never from component state

---

## 4. Shared Infrastructure (M10-1) -- Built First

Everything else depends on this. Nothing in M10-2 through M10-8 ships without this slice complete.

### 4.1 Frontend components

**`components/drill/ProgrammeFilterBar.tsx`**
Dropdown with 11 options: "All Programmes" (clears `?p=`) plus the 10 codes in alphabetical order. When a programme is active, shows a gold chip with the code and a clear X. Renders at the top of every tab content area, below the intelligence card, above the first data section. Visible to all roles. Hidden on pages where programme context does not apply (login, /home root).

**`components/drill/Breadcrumb.tsx`**
Renders `Portfolio > {Programme} > {Entity}` from URL. Each segment is a link that navigates to that level. "Portfolio" always links to the current tab with all params stripped. Programme segment links to `?p={code}` with entity segment stripped. Rendered in the page header area on every tab.

**`components/drill/DrillRow.tsx`**
Wrapper component: takes `href` (the drill URL) and renders its children inside a clickable div with hover state (cursor-pointer, subtle highlight on hover). Used to wrap any table row, chart bar, or matrix cell that should trigger drill navigation.

**`components/drill/FilterChip.tsx`**
Displays an active filter as a pill: label + clear button. Clears the specific search param on click. Used inside ProgrammeFilterBar and beside secondary filters.

**`components/drill/DrillDetailLayout.tsx`**
Shell layout for Level 2 entity detail pages: back button (goes to Level 1 URL), breadcrumb, entity title, two-column detail grid. Reused across RAID detail, milestone detail, audit entry detail.

### 4.2 Frontend hooks and utilities

**`lib/drill.ts`**

```typescript
// Read current programme filter from URL
export function useProgrammeFilter(): string | null

// Build a URL for a drill navigation target
export function buildDrillUrl(base: string, params: Record<string, string | null>): string

// Return a drill-through URL: current tab -> target tab, carrying ?p= if set
export function buildDrillThroughUrl(targetTab: string, currentParams: URLSearchParams): string

// Strip all drill params and return Level 0 URL for current tab
export function buildPortfolioUrl(currentPath: string): string
```

### 4.3 Backend additions (M10-1 backend)

**`GET /api/v1/programmes`**
Returns all 10 programmes with current health state from the latest health snapshot. Does not exist yet. Needed by ProgrammeFilterBar to populate the dropdown with health-coloured badges.

Response shape:
```json
{
  "items": [
    { "programme_code": "PEGASUS", "programme_name": "Project Pegasus", "health_state": "Red" },
    ...
  ],
  "count": 10
}
```

**`GET /api/v1/programmes/{code}`**
Single programme detail: code, name, current health state, raid summary (count by type and severity), milestone summary (total, completed, on-time percentage), latest health snapshot timestamp. Role-scoped same as existing programme endpoints.

**`GET /api/v1/programmes/{code}/raids/{raid_id}`**
Single RAID item detail: all fields including full description, created_by, updated_at, escalation_tier, linked decisions. Returns 404 if not in this programme.

**`GET /api/v1/programmes/{code}/milestones/{milestone_id}`**
Single milestone detail: all fields including owner, baseline date, actual/forecast date, variance days, linked health state.

**`GET /api/v1/people?programme={code}&band={band}&role={role}`**
Filtered people list. `programme` joins through `person_programme_assignments`. `band` and `role` filter directly on people columns. All params optional; without any params returns all 300 (existing behaviour). Returns same PersonItem schema.

### 4.4 Layout integration

`frontend/app/home/layout.tsx` -- add `<Breadcrumb />` in the header section. Add `<ProgrammeFilterBar />` as a slot that each tab's page.tsx opts into via a layout prop. The filter bar renders between the page title and the intelligence card.

---

## 5. Tab-by-Tab Drill Specification

### 5.1 Executive (`/home/executive`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Programme state row (PEGASUS) | Click | `?p=PEGASUS` set; all metrics filter to PEGASUS |
| Health state chip (Red) | Click | `?health=Red`; programme list filters to Red only |
| "View Delivery Health" cross-link on programme row | Click | `/home/delivery-health?p=PEGASUS` |
| "View RAID" cross-link on programme row | Click | `/home/risk-raid?p=PEGASUS` |

**Level 1 (`?p=PEGASUS`):**
Programme state list collapses to 1 row (PEGASUS). Intelligence card What/Why/Act re-renders for PEGASUS context. Health KPI shows PEGASUS health state, not portfolio distribution.

**Drill-up:**
Breadcrumb "Portfolio" link strips `?p=`. Health chip clear button strips `?health=`.

**No Level 2 on Executive** -- the detail view lives in the tab-specific pages.

---

### 5.2 Delivery Health (`/home/delivery-health`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| On-time chart bar (PEGASUS) | Click | `?p=PEGASUS`; milestone list and EVM section filter to PEGASUS |
| Milestone table row | Click | `/home/delivery-health/PEGASUS/[milestone-id]` |
| Intelligence card programme reference | Click | `?p=PEGASUS` |

**Level 1 (`?p=PEGASUS`):**
On-time chart highlights PEGASUS bar. Milestone table shows only PEGASUS milestones (from existing `GET /programmes/{code}/milestones`). EVM stub section shows PEGASUS placeholder.

**Level 2 (milestone detail):**
`/home/delivery-health/[code]/[milestone-id]/page.tsx`
Shows: milestone name, baseline date, actual/forecast date, variance in days, status (on-time/late/at-risk), owner (stub -- person entity not linked yet), linked programme health state. Back button returns to Level 1.

**Backend needed:** `GET /api/v1/programmes/{code}/milestones/{milestone_id}` (M10-1).

---

### 5.3 Risk and RAID (`/home/risk-raid`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Heat map cell (High Risk) | Click | `?severity=High&type=Risk`; top-10 list filters |
| Top-10 RAID row | Click | `/home/risk-raid/[programme-code]/[raid-id]` |
| Programme filter bar | Select PEGASUS | `?p=PEGASUS`; heat map and top-10 filter to PEGASUS items |
| Type tabs (Risk / Assumption / Issue / Dependency) | Click | `?type=Risk`; heat map recalculates for that type only |

**Level 1 (`?p=PEGASUS`):**
Heat map shows only PEGASUS items. Top-10 shows only PEGASUS items. Count changes from 150 to 15 (15 RAID items per programme from seed).

**Level 2 (RAID item detail):**
`/home/risk-raid/[code]/[raid-id]/page.tsx`
Shows: item type (Risk/Assumption/Issue/Dependency), severity, title, full description, owner (stub), created date, updated date, escalation tier if escalated, linked programme name and health state. Status badge. Back button to Level 1.

**Backend needed:** `GET /api/v1/programmes/{code}/raids/{raid_id}` (M10-1).

---

### 5.4 Workforce Intelligence (`/home/workforce`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Pyramid bar (B3) | Click | `?band=B3`; people list below pyramid filters to B3 |
| Programme filter bar | Select PEGASUS | `?p=PEGASUS`; headcount KPI and pyramid show PEGASUS-assigned people only |
| Band + Programme | Both set | `?p=PEGASUS&band=B3`; 300 total narrows to PEGASUS B3 subset |

**Level 1 people list:**
Rendered below the pyramid when any filter is active. Columns: full name, role, band, programme assignment. Uses `GET /api/v1/people?band=B3` or `?programme=PEGASUS&band=B3`.

**No Level 2** on people -- person detail is a v1.2 item (person profile page not in scope).

**Drill-up:** Clear filter chips individually or via breadcrumb.

---

### 5.5 Financials (`/home/financials`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Programme table row (PEGASUS) | Click | `?p=PEGASUS`; table highlights row, financial KPI section filters |
| Health state column chip | Click | `?health=Red`; table filters to Red programmes |
| Drill-through link | Click | `/home/delivery-health?p=PEGASUS` |

**Level 1 (`?p=PEGASUS`):**
Programme table shows only PEGASUS row expanded. Revenue, margin, DSO columns remain stub-labelled but PEGASUS health state (real) is prominent. Intelligence card What/Why/Act re-renders for PEGASUS context.

**No Level 2** on Financials -- financial entity detail requires `financials_monthly` which is a v1.1 data entity, not this milestone.

---

### 5.6 Flow and Velocity (`/home/flow-velocity`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| WIP bar (PEGASUS) | Click | `?p=PEGASUS`; WIP detail section shows PEGASUS WIP limit and current count |
| Programme filter bar | Select PEGASUS | `?p=PEGASUS`; all flow components filter |
| Sprint window selector | Click period | `?sprint=N` (stub -- DORA and velocity not seeded) |

**Level 1 (`?p=PEGASUS`):**
WIP bars highlight PEGASUS. WIP limit vs actual for PEGASUS (uses `WIP_LIMITS` constant map already in lib). DORA metrics remain stub-labelled for PEGASUS. Intelligence card filters to PEGASUS.

---

### 5.7 Ops and SLA (`/home/ops-sla`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Matrix cell (PEGASUS x Incident Response) | Click | `?p=PEGASUS&sla=incident-response`; cell highlighted, detail panel opens |
| Programme row header | Click | `?p=PEGASUS`; entire PEGASUS row highlighted, other rows dim |
| SLA category column header | Click | `?sla=incident-response`; that column highlighted across all programmes |

**Level 1 (`?p=PEGASUS`):**
Matrix shows only PEGASUS row (or PEGASUS row highlighted with others dimmed, configurable). SLA status derived from health sub-RAGs (same proxy logic as v1.0).

**No Level 2** -- SLA detail entity (`sla_metrics`) not seeded.

---

### 5.8 Client Health (`/home/client-health`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Signal matrix row (PEGASUS) | Click | `?p=PEGASUS`; all signals for PEGASUS highlighted, detail panel |
| Signal column header | Click | `?signal=escalation-risk`; that signal column for all programmes |
| Programme filter bar | Select PEGASUS | `?p=PEGASUS`; matrix filters to PEGASUS row |

**Level 1 (`?p=PEGASUS`):**
Signal matrix collapses to PEGASUS row with all 6 signal categories expanded. Signal values derived from health proxy (same as v1.0). Intelligence card for PEGASUS context.

---

### 5.9 Governance Operating Model (`/home/governance-operating-model`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Over-optimism flag row (PEGASUS) | Click | `?p=PEGASUS`; governance metrics for PEGASUS |
| Tier config section (PO only) | Read-only | No drill -- admin surface, no programme scoping |
| KPI grid cell | Click | `?kpi=decision-velocity`; that KPI highlighted across programmes |

**Level 1 (`?p=PEGASUS`):**
Over-optimism section shows PEGASUS consecutive-green analysis. Governance KPI grid shows PEGASUS values (health proxy for non-seeded KPIs).

---

### 5.10 Capability and Supply Chain (`/home/capability-supply-chain`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Pyramid bar (B4) | Click | `?band=B4`; people list filters to B4 |
| Programme filter bar | Select PEGASUS | `?p=PEGASUS`; headcount and pyramid show PEGASUS-assigned people |
| Band + Programme | Both set | Intersection subset |

**Level 1:** Identical pattern to Workforce. Reuses `GET /api/v1/people?programme=PEGASUS&band=B4`.

---

### 5.11 AI Governance (`/home/ai-governance`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Risk tier matrix cell | Click | `?tier=1&p=PEGASUS`; cell highlighted |
| Programme filter bar | Select PEGASUS | `?p=PEGASUS`; AI risk tier and governance cadence filter |
| AP-gated sections | PO/AP only | Audit entries for AI decisions; links to audit trail detail |

**Level 1 (`?p=PEGASUS`):**
AI risk tier assessment for PEGASUS. Governance cadence stub with PEGASUS context. Intelligence card PEGASUS-scoped.

---

### 5.12 Audit Trail Console (`/home/audit-trail-console`)

**This tab has the most complete backend support for drill.** `GET /api/v1/audit/entry/{id}` already exists and returns before/after JSON diff.

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Entry row | Click | `/home/audit-trail-console/[entry-id]` → full entry detail |
| Actor filter | Select person | `?actor={uuid}`; entries filtered by that actor |
| Table filter | Select table | `?table=threshold_calibration_register`; filtered |
| Date from/to | Set | `?from=2026-05-01&to=2026-05-11`; date-scoped |
| Outcome filter | Select | `?outcome=Updated`; filter by outcome type |

**Level 2 (audit entry detail):**
`/home/audit-trail-console/[entry-id]/page.tsx`
Backend is fully built. Frontend detail view renders: actor, action timestamp, table_name, record_id, outcome, before JSON panel, after JSON panel (syntax-highlighted), shallow diff highlighted in amber. Back button to filtered Level 1.

**Note:** Audit trail is global, not programme-scoped. No `?p=` filter on this tab -- audit entries are not linked to programmes in the current schema.

---

### 5.13 Backlog Health (`/home/backlog-health`)

**Drill triggers:**

| Element | Action | Result |
|---------|--------|--------|
| Programme table row | Click | `?p=PEGASUS`; backlog metrics filter |
| Groom pressure indicator | Click | `?p=PEGASUS&view=groom`; backlog detail (stub) |
| Programme filter bar | Select PEGASUS | `?p=PEGASUS` |

**Level 1 (`?p=PEGASUS`):**
Backlog programme table highlights PEGASUS. Groom pressure and DoR compliance show PEGASUS values (stub -- backlog entity not seeded). Intelligence card PEGASUS-scoped.

---

## 6. Build Slices

### M10-1 | Shared infrastructure + Backend additions
**Duration:** 1 Claude Code session
**Output:**
- `components/drill/ProgrammeFilterBar.tsx`
- `components/drill/Breadcrumb.tsx`
- `components/drill/DrillRow.tsx`
- `components/drill/FilterChip.tsx`
- `components/drill/DrillDetailLayout.tsx`
- `lib/drill.ts` (useProgrammeFilter, buildDrillUrl, buildDrillThroughUrl, buildPortfolioUrl)
- `frontend/app/home/layout.tsx` updated with breadcrumb slot
- Backend: `GET /api/v1/programmes` (list with health state)
- Backend: `GET /api/v1/programmes/{code}` (single programme detail)
- Backend: `GET /api/v1/programmes/{code}/raids/{raid_id}`
- Backend: `GET /api/v1/programmes/{code}/milestones/{milestone_id}`
- Backend: `GET /api/v1/people` updated to accept `?programme=`, `?band=`, `?role=` query params
- New Alembic migration: none (schema unchanged; service-layer query changes only)
- Tests: 20+ vitest for drill utilities, 15+ integration for new backend endpoints, 4 Playwright for filter bar interaction
**Gate:** Filter bar renders on executive tab, ?p=PEGASUS sets URL, breadcrumb shows "Portfolio > PEGASUS", back clears to Level 0.

### M10-2 | Executive + Financials
**Duration:** 1 Claude Code session
**Output:** Programme row clickable on Executive, health chip filter, drill-through links to delivery-health and risk-raid. Financials table row clickable, health state filter.
**Tests:** 15+ vitest, 6+ Playwright
**Gate:** Click PEGASUS on Executive → URL shows ?p=PEGASUS → intelligence card re-renders for PEGASUS → breadcrumb shows PEGASUS → click Portfolio breadcrumb → URL clears → portfolio view restores.

### M10-3 | Delivery Health + Risk and RAID + Level 2 routes
**Duration:** 1 Claude Code session
**Output:** On-time bar click on Delivery Health, milestone table drill to Level 2 route, milestone detail page. RAID heat map cell click, top-10 drill to Level 2 route, RAID item detail page. Type and severity filter chips.
**Tests:** 20+ vitest, 10+ Playwright
**Gate:** Click PEGASUS bar → milestone list shows 20 PEGASUS milestones → click first milestone → Level 2 milestone detail renders → back button returns to PEGASUS-scoped list.

### M10-4 | Workforce + Capability
**Duration:** 1 Claude Code session
**Output:** Pyramid bar click on both tabs, people list rendered below pyramid on filter, `?band=` and `?p=` composing correctly, GET /api/v1/people filter params consumed.
**Tests:** 12+ vitest, 6+ Playwright
**Gate:** Click B3 bar on Workforce → people list renders with B3 people → also set ?p=PEGASUS → list narrows to PEGASUS B3 people → count shown in breadcrumb context.

### M10-5 | Flow and Velocity + Ops and SLA
**Duration:** 1 Claude Code session
**Output:** WIP bar click on Flow, PEGASUS WIP detail panel. Matrix cell click on Ops SLA, programme row highlight, SLA category column highlight, `?sla=` param.
**Tests:** 12+ vitest, 6+ Playwright
**Gate:** Click PEGASUS WIP bar → ?p=PEGASUS → WIP bar highlighted, limit vs actual for PEGASUS shown. Click PEGASUS x Incident Response cell → both filters set in URL → cell highlighted.

### M10-6 | Client Health + Backlog Health + AI Governance
**Duration:** 1 Claude Code session
**Output:** Signal matrix row click on Client Health, signal column filter. Programme row click on Backlog. Risk tier cell click on AI Governance, AP-gated audit cross-link.
**Tests:** 12+ vitest, 6+ Playwright
**Gate:** Click PEGASUS signal row → ?p=PEGASUS → PEGASUS signals shown → click signal column header → ?signal=escalation-risk → column highlighted across programmes.

### M10-7 | Governance + Audit Trail Console (Level 2 + filters)
**Duration:** 1 Claude Code session
**Output:** Over-optimism row click on Governance, KPI cell highlight. Audit Trail entry row click → Level 2 detail route, before/after diff view, actor/table/date/outcome filter chips.
**Tests:** 12+ vitest, 8+ Playwright
**Gate:** Click audit entry row → Level 2 route renders → before/after JSON diff visible → back button returns to filtered Level 1. Actor filter → ?actor={uuid} → entries show only that actor's actions.

### M10-8 | Full E2E drill suite + Performance + Integration gate
**Duration:** 1 Claude Code session
**Output:** Complete Playwright drill suite covering all 14 tabs. Drill-down, drill-up, drill-through, filter composition, breadcrumb navigation, back-button correctness. Updated contract tests for 5 new backend endpoints. Locust re-run with drill patterns. WCAG re-scan with new interactive elements.
**Tests target:** 100+ new tests (bringing total from 814 to 950+)
**Gate:** All drill paths covered by Playwright. Zero regressions on existing 814 tests. Contract tests green for all new endpoints. WCAG AA clean on all new interactive elements (DrillRow must have correct aria-role and keyboard support).

---

## 7. Acceptance Criteria (Gate for M10 Complete)

1. Every tab has a visible programme filter bar with 11 options.
2. Selecting a programme sets `?p=CODE` in the URL. Clearing it removes the param.
3. All data-rendering components on each tab respect the `?p=` param and re-render scoped data.
4. Breadcrumb renders on every tab, shows correct level, and each segment is navigable.
5. Level 2 detail routes exist for: RAID items, milestones, and audit trail entries.
6. Drill-through cross-tab links carry `?p=` across navigation.
7. Browser back button correctly restores previous Level with its URL state.
8. Keyboard navigation: DrillRow elements are reachable via Tab key and activatable via Enter/Space (WCAG 2.1 AA).
9. All 5 new backend endpoints return correct data, are role-gated, and have contract tests.
10. No existing test regresses. All 814 v1.0.0 tests remain green.
11. Locust p95 at 500 concurrent with drill endpoints: under 200ms.
12. WCAG AA axe-core clean on all tabs including new interactive elements.

---

## 8. What Remains Stub After M10

These will not be interactive even after M10 because their underlying data entities are not seeded:

- Financial detail (revenue, margin, DSO) -- awaits `financials_monthly` entity (v1.2)
- Sprint velocity detail -- awaits `sprint_velocity_log` entity (v1.2)
- DORA metrics detail -- awaits `dora_metrics` entity (v1.2)
- Attrition detail -- awaits `attrition_events` entity (v1.2)
- Client signal values (actual scores) -- awaits `client_signals` entity (v1.2)
- Decision queue items -- awaits `decisions` entity (v1.2)
- Person detail page -- v1.2

Stubs remain clearly labelled in UI and code per v1.0 convention. Drill triggers are not added to stub sections.

---

## 9. DECISION LOG Entries to Create at M10 Close

- D-061: URL-driven filter state architecture (search params over React state, rationale)
- D-062: Level 2 routes only for entities with backend support (no Level 2 for stub entities)
- D-063: `GET /api/v1/people` filter extension approach (query params, no new endpoint)
- D-064: Audit trail no programme filter (schema decision -- entries not linked to programmes)
- D-065: Keyboard accessibility for DrillRow (aria-role=button pattern chosen over anchor)

---

## 10. Start Prompt for Tomorrow's Claude Code Session

Copy this verbatim to start M10-1:

```
Read docs/state/BUILD_SCOPE_M10_DRILL.md in full. Then read:
  - frontend/app/home/layout.tsx
  - frontend/lib/drill.ts (does not exist yet -- create it)
  - backend/app/api/v1/programmes.py
  - backend/app/api/v1/people.py
  - backend/app/schemas/programmes.py

You are building M10-1: Shared Drill Infrastructure. Scope is section 4 of BUILD_SCOPE_M10_DRILL.md.

Deliver in this order:
1. lib/drill.ts -- useProgrammeFilter, buildDrillUrl, buildDrillThroughUrl, buildPortfolioUrl
2. components/drill/ProgrammeFilterBar.tsx
3. components/drill/Breadcrumb.tsx
4. components/drill/DrillRow.tsx
5. components/drill/FilterChip.tsx
6. components/drill/DrillDetailLayout.tsx
7. frontend/app/home/layout.tsx -- add breadcrumb slot
8. Backend: GET /api/v1/programmes (list with health state)
9. Backend: GET /api/v1/programmes/{code} (single programme detail)
10. Backend: GET /api/v1/programmes/{code}/raids/{raid_id}
11. Backend: GET /api/v1/programmes/{code}/milestones/{milestone_id}
12. Backend: GET /api/v1/people updated with ?programme=, ?band=, ?role= query params
13. Vitest tests for lib/drill.ts (all four functions)
14. Integration tests for all 5 new/updated backend endpoints
15. Playwright: filter bar renders, ?p= sets URL, breadcrumb shows programme, clear returns to Level 0

Hard rules in force: no em dashes, no emojis, no inline hex (use Tailwind tokens), no commits (Adi commits in iTerm2), zero tolerance on test regressions.

Gate: filter bar renders on executive tab, ?p=PEGASUS sets URL, breadcrumb shows "Portfolio > PEGASUS", click Portfolio breadcrumb clears ?p= and returns to portfolio view.

Do not start M10-2 until M10-1 gate is confirmed.
```

---

*Scope owner: Claude | Reviewed by: Adi Kompalli | Build starts: 2026-05-12 IST morning*
*Update this file at every M10 slice close with actual vs planned.*
