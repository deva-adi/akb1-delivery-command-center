# 20_PRD_Exports_Steerco_Pack.md
### Exports and Steerco Pack PRD | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 adds two new export variants: Board Pack (UC-G, director-facing 5-slide deck distinct from Steerco) and Steerco Pre-Read Kit (UC-A4, 4-column decision pre-read per S04P2). Audit-scoped export from Audit Trail Console (UC-K) added. Revision 1 content preserved below.
>
> Revision 1 added the cross-cutting surface per self-check D-014. Without exports the product remained a secondary tool alongside Excel. With exports it becomes the primary governance artefact.

---

## 1. Scope and goals

Every table and chart exports to CSV, Excel (`.xlsx`), and a PowerPoint slide (`.pptx`). Executive tab offers a single-button "Generate Steerco Pack" that produces a five-slide deck for the Thursday steering committee. Eliminates the hand-built deck workflow.

## 2. Role access

| Role | Exports allowed |
|------|-----------------|
| Portfolio Owner | Full including Steerco Pack |
| Programme Manager | Scoped to assigned programmes |
| Finance Lead | Full |
| Read Only | No exports in v1.0.0, allowlisted in v1.1 |

## 3. Data contract

Consumes: whatever the current tab is rendering. Uses the same API response payload. No server-side state.

Generates: CSV, XLSX, PPTX file streams returned as `Content-Disposition: attachment`.

## 4. User stories

Portfolio Owner clicks Generate Steerco Pack on Executive tab Thursday 8 AM and walks into 9 AM steerco with the deck done.
Finance Lead exports Programme P and L table to Excel for variance analysis in spreadsheet.
Programme Manager exports RAID heat map to a PowerPoint slide for the weekly governance call.

## 5. KPIs

| KPI | Formula | Example | Target | Alert |
|-----|---------|---------|--------|-------|
| Export Adoption | `Users Exporting / Active Users Weekly x 100` | 64 percent | Above 50 percent | Below 30 percent |
| Steerco Pack Usage | `Count of Steerco Pack generations / Week` | 18 | Above 10 | Below 5 |
| Export Time to Deliver | Seconds from click to file download | 2.4 | Below 5 | Above 15 |
| Export Error Rate | `Failed Exports / Total Attempts x 100` | 0.4 percent | Below 1 percent | Above 3 percent |

## 6. Views and interactions

Every table header row and every chart header shows an Export icon at top-right. Click reveals menu: Copy CSV, Download Excel, Download PPTX Slide. Executive tab shows a standalone button "Generate Steerco Pack" above the filter bar. Click opens a modal confirming current filter state plus the 5-slide template preview, then generates on confirm.

## 7. Drill paths

Exports are terminal actions. No drill required. Generated file is timestamped and contains branded footer with filter snapshot.

## 8. Steerco Pack 5-slide template

| Slide | Content | Source |
|-------|---------|--------|
| 1 Executive Summary | Portfolio margin, utilisation, forecast, headline intelligence layer What | Executive tab |
| 2 Delivery Position | On-time percent, velocity, top-3 slipping milestones | Delivery Health tab |
| 3 Financial Position | Revenue stack, margin waterfall, DSO | Financials plus P and L Cockpit tabs |
| 4 Risk Watch | Top-5 high-severity risks, SLA breaches, penalty exposure | Risk and RAID plus Ops and SLA tabs |
| 5 Action Plan | The week's nine action cards pulled from intelligence layer across the 3 tabs above | Aggregated |

Template branded with AKB1 Delivery Command Center header. Date stamp. Filter state footer.

## 9. Non-functional

Export generation for a standard tab table (up to 1,000 rows) under 2 seconds. Steerco Pack generation under 8 seconds. File size targets: CSV under 5 MB, XLSX under 15 MB, PPTX under 3 MB for a 5-slide pack.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/exports/csv` | Export request for table data |
| POST | `/api/v1/exports/xlsx` | Export as Excel |
| POST | `/api/v1/exports/pptx/chart` | Single chart as PowerPoint slide |
| POST | `/api/v1/exports/pptx/steerco-pack` | 5-slide Steerco Pack |

Request body includes tab_id, filter_state, entity_id (if single chart). Response is a signed URL valid 5 minutes for download, or streamed file directly.

## 11. Error and empty states

Empty data → export disabled with tooltip "No data to export for this filter".
Generation failure → toast "Export failed, try again. Error ref: XYZ" plus audit_log entry with user plus error.

## 12. Accessibility

Export menu keyboard accessible. Generated files include accessible alt text where relevant (PowerPoint) and proper header rows (CSV, Excel).

## 13. Implementation notes

| Library | Purpose |
|---------|---------|
| `python-pptx` | PowerPoint generation |
| `openpyxl` | Excel writing with formatting |
| `Jinja2` | Slide template composition |
| `matplotlib` or Recharts SVG export | Chart rendering for PPTX |

Each export writes an `export.generate` audit_log entry.

## 14. Test acceptance

Playwright: click Export on Programme revenue table, Excel file downloads with filter state in footer. Generate Steerco Pack from Executive tab, PPTX has 5 slides with correct content. Contract test on each export endpoint.

## 15. Release gating

PRD closes when Adi approves the Steerco Pack template layout and the PPTX branding. Ships at M7 alongside frontend.

---

*Owner: Claude. Signoff: Adi. Schedule: M7 adds approximately 3 days for exports. Accepted per D-014.*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 New export variant: Board Pack (UC-G)

5-slide director-facing PowerPoint distinct from the rev 1 Steerco Pack.

| Slide | Content |
|-------|---------|
| 1 Title | Quarter, portfolio name, presenter (rendering caller's name) |
| 2 Portfolio Health | Four Portfolio Instruments (Forecast Confidence, Account Concentration, DM Succession, Capability Heat Map) per Master PRD R3.2 framing |
| 3 Margin and EVM | Portfolio margin trend with EVM CPI/SPI overlay. Top 3 leak drivers from `five_leak_anatomy_snapshot` |
| 4 Strategic Risks | Top 3 strategic risks plus AI Governance Red Pending Backlog count plus DM Critical succession count |
| 5 Decisions Required | 3-5 board-altitude decisions surfaced from `decisions WHERE category IN (Commercial, Compliance) AND opened_at >= now() - interval '60 days'` |

Voice: director-altitude. No operational detail. Board Pack subtitle reads "The director sees across" per Design Foundations R4.10 phrase.

Endpoint: `POST /api/v1/exports/pptx/board-pack`. Caller: PO or DD. Audit entry written.

### R2.2 New export variant: Steerco Pre-Read Kit (UC-A4)

PowerPoint export of the `steerco_pre_read` rows for one programme's upcoming steerco. Layout: cover slide plus one slide per decision in 4-column format (Decision, Options, Recommendation, Impact of Deferral) per S04P2.

Endpoint: `POST /api/v1/exports/pptx/steerco-pre-read?programme={code}`. Caller: PO, DD, PM (own programme). Audit entry written.

### R2.3 Audit-scoped export (UC-K cross-cutting)

CSV plus JSON bundle from Audit Trail Console with digital signature for chain-of-custody. Per PRD 26 section 10.

Endpoint: `POST /api/v1/audit/export`. Caller: PO, DD, FL with AP flag. Bundle includes audit_trail_entries rows matching the active filter, a manifest JSON with query parameters, and a SHA-256 signature over the bundle. Itself writes an audit entry recording the export action.

### R2.4 Endpoints (revision 2 additions)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/exports/pptx/board-pack` | Board Pack 5-slide deck |
| POST | `/api/v1/exports/pptx/steerco-pre-read?programme={code}` | Pre-Read Kit |
| GET | `/api/v1/exports/board-pack/preview` | HTML preview before generation |
| POST | `/api/v1/audit/export` | Audit-scoped CSV/JSON bundle (delegates to PRD 26) |

### R2.5 Release gating (revision 2 additions)

Revision 2 ships when:
1. Board Pack 5-slide template renders correctly with seeded data.
2. Pre-Read Kit cover and per-decision slides match S04P2 4-column layout.
3. Wireframe `v1_board_pack_preview.html` signed off.
4. All export endpoints write audit entries.
5. Board Pack restricted to PO and DD callers.
6. Audit-scoped export bundle includes signature for chain-of-custody.
7. Voice regression: Board Pack slide 2 subtitle uses Design Foundations R4.10 phrase verbatim.

---

*Revision 2 owner: Claude. Signoff: Adi (pending). Adds Board Pack (UC-G), Pre-Read Kit (UC-A4), audit-scoped export (UC-K cross-link).*
