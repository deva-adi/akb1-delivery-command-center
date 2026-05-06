# 22_PRD_Search_Command_Palette.md
### Search Command Palette PRD | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 adds search coverage for rev 4 entities. Stakeholders, AI use cases, governance cadences, escalation contracts, and decisions-by-category become first-class search targets. Revision 1 content preserved below.
>
> Revision 1 introduced the Command-K pattern. Enables instant programme and entity discovery at scale.

---

## 1. Scope and goals

Global command palette triggered by Cmd-K (macOS) or Ctrl-K (Windows, Linux), or a visible search input in the primary nav. Searches across programmes, RAID items, change requests, vendors, people (role-gated), tab names, and saved scenarios. Results keyboard-navigable with Enter-to-open.

## 2. Role access

Searchable surfaces are filtered through role access at query time. A Read Only role cannot find a person by name; the result set excludes person entities.

## 3. Data contract

Consumes: indexed tables via Postgres `pg_trgm` fuzzy match. Single unified search endpoint.

## 4. User stories

Portfolio Owner presses Cmd-K, types "pega", picks Pegasus Healthcare, drills straight to the programme.
Finance Lead presses Cmd-K, types "DSO", picks the Financials tab.
Programme Manager presses Cmd-K, types "helvetia renewal", picks the Helvetia renewal opportunity.

## 5. KPIs

| KPI | Formula | Example | Target | Alert |
|-----|---------|---------|--------|-------|
| Search Usage | Users opening palette at least once daily / Daily Actives | 68 percent | Above 50 percent | Below 25 percent |
| Query to Result Latency | Milliseconds from keystroke to results render p95 | 140 | Below 200 | Above 400 |
| Zero Result Rate | `Queries Returning Zero / Total Queries x 100` | 6 percent | Below 10 percent | Above 20 percent |
| Top Result Click Through | `Clicks on First Result / Total Queries x 100` | 71 percent | Above 60 percent | Below 40 percent |

## 6. Views and interactions

Trigger: Cmd-K, Ctrl-K, or click search entry in nav. Full-screen modal opens (blurred background behind). Input field autofocused. Results appear as user types (debounced 120 ms). Results grouped by type (Programme, RAID, CR, Vendor, Person, Tab, Scenario). Keyboard navigation: arrow keys, Enter to select, Escape to close. Recent searches list appears when input empty (last 10, per-user).

## 7. Drill paths

| Result type | Target |
|-------------|--------|
| Programme | Programme summary drawer on current tab or Executive tab if current not programme-aware |
| RAID | RAID detail drawer on Risk and RAID tab |
| CR | CR detail on Change Impact tab |
| Vendor | Vendor scorecard detail on Multi-Vendor tab |
| Person | Person detail on Workforce tab (role-gated) |
| Tab | Navigate to that tab |
| Scenario | Open that scenario in Scenario Planner |

## 8. Matching strategy

`pg_trgm` similarity on programme_name, raid description, cr_title, vendor_name, person_name, tab_name, scenario_name. Weighted scoring: exact prefix match = 100, fuzzy match = similarity score times 80, recency boost on recent searches = plus 10.

Per-query result limit 20. Loaded incrementally if user scrolls.

## 9. Non-functional

Query latency under 200 ms p95 at a database size of 10,000 rows per entity type. Modal open under 100 ms. Debounce 120 ms. Cache recent results in browser memory for 30 seconds.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/search?q=<query>&limit=20` | Unified search results |
| GET | `/api/v1/search/recent` | Current user's last 10 queries |
| POST | `/api/v1/search/log` | Record a query and the selected result, for ranking |

## 11. Error and empty states

Empty query → show recent searches and quick access links (current role primary tabs).
Zero results → "No matches. Try shorter keywords or broaden the filter." plus link to filter bar.
Query too short (less than 2 chars) → "Keep typing..."

## 12. Accessibility

ARIA combobox pattern. Input has `role="combobox"`, results list has `role="listbox"`, each item has `role="option"`. Arrow keys move `aria-activedescendant`. Screen reader announces result count and current selection.

## 13. Implementation notes

Indexes per table: `CREATE INDEX programmes_trgm ON programmes USING gin (programme_name gin_trgm_ops);` and equivalent on each searchable column. Sanitise query input (same rules as intelligence layer per Security PRD 8).

Command palette component based on cmdk or Downshift for accessibility pattern compliance. Optional shadcn Dialog for shell.

## 14. Test acceptance

Playwright: open palette via Cmd-K, type "peg", first result is Pegasus Healthcare, Enter navigates to programme view. Type "dso", Tab result shows Financials tab. Accessibility test via axe-core.

## 15. Release gating

PRD closes when Adi approves keyboard shortcut, matching strategy, and role-gating behaviour. Ships at M7.

---

*Owner: Claude. Signoff: Adi.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 New search index entities

Postgres trigram plus full-text search extended to cover rev 4 entities:

| Entity | Indexed columns | Result rendering |
|--------|------------------|---------------------|
| `stakeholder_influence` | stakeholder_external_name, stakeholder_external_org, decision_maker_flag | Stakeholder name with org and influence/support score chips |
| `ai_use_case` | tool_id (joined to ai_tools.name), task_category, programme_id (joined to programmes.code), risk_tier | Use case label with tier chip and programme |
| `governance_cadence` | programme_id, cadence_type, state | Cadence label with state chip and programme |
| `escalation_contract` | programme_id, decision_class, named_owner_role | Contract label with tier and programme |
| `decisions` (rev 4) | title, category, status (extended for category) | Decision title with category chip and age |
| `bench_roster` | person_id (joined to people.name), bench_state | Person name with bench state chip |
| `dm_succession_signals` | dm_user_id (joined to people.name), coverage_state | DM name with coverage chip (PO and DD only) |
| `qbr_records` plus `qbr_quality_score` | client_id (joined), qbr_date, theatre_flag | QBR label with quality score |
| `cr_processing_cost` | cr_id (joined to change_requests), threshold_breach_flag | CR title with breach chip |

### R2.2 Smart filters in palette

Type a word that matches a filter syntax to scope search. Examples:

- `decision category:vendor` filters decisions to category Vendor
- `tier:Critical concentration` filters account_concentration to Critical band
- `risk:red ai` filters ai_use_case to Red tier
- `cadence:theatre` filters governance_cadence to Theatre state
- `bench:atrisk` filters bench_roster to AtRisk state

Filter syntax documented in palette help (Cmd-K then ?).

### R2.3 Recently visited section

Palette now shows "Recently visited" entities at the top when opened with empty query. Top 10 entities the user navigated to in the last 30 days. Per-user state stored in `notifications` entity (extended) or a dedicated `user_recent_visits` table.

### R2.4 Endpoints (revision 2 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/search?q={text}&types={csv}` | Multi-entity search with type filter |
| GET | `/api/v1/search/recent` | Recently visited entities for current user |
| POST | `/api/v1/search/track-visit` | Record user navigation event |

### R2.5 Release gating (revision 2 additions)

Revision 2 ships when:
1. 9 new entity types are searchable.
2. Smart filter syntax parses correctly for the 5 examples in R2.2.
3. Recently visited returns up to 10 deduplicated entities.
4. Search latency under 250 ms across all entity types at demo seed scale.
5. Role gating: stakeholder, DM succession, audit-related results filtered by access matrix.

---

*Revision 2 owner: Claude. Signoff: Adi (pending). Extends search to rev 4 entities including stakeholders, AI use cases, governance cadences.*
