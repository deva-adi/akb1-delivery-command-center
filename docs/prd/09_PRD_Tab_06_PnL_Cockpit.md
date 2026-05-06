# 09_PRD_Tab_06_PnL_Cockpit.md
### P and L Cockpit Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds UC-NN Five-Leak Anatomy relabel to match S04P4 Hub framing explicitly and UC-P EVM cross-surface showing CPI and SPI alongside the margin waterfall. Rev 3 bench tax waterfall driver retained with Hub-aligned label. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-2 gap: surfaced Bench Tax on the P and L waterfall as an explicit driver of margin compression, not buried in indirect cost. Paired with Financials tab revision 3 (per-programme bench tax allocation). Hub Proposition B Article 3: "bench is a decision, not an accident." Replaced revision 2.

> Inherits from Master PRD, Data Model PRD, Intelligence Layer PRD, Security PRD, Design Foundations.

---

## 1. Scope and goals

Margin decomposition. Waterfall from last month to this month. Leakage attribution across five drivers (revision 3 expands from four). Programme P and L table with target delta, contract-type context, contingency reserve visibility, **bench tax visibility**. Primary Finance Lead workspace.

## 2. Role access

| Role | Primary nav? | Access |
|------|--------------|--------|
| Portfolio Owner | No (via More menu) | Full |
| Programme Manager | No | No |
| Finance Lead | Yes | Full, primary |
| Read Only | No | No |

## 3. Data contract

Consumes: `financials_monthly` revision 3 including contingency_reserve_usd, margin_at_approval_pct, margin_realised_pct, **bench_tax_allocated_usd**. `allocations`, `change_requests`, `people` with bench_state.

Response: `PnLCockpitResponse` with waterfall bars, **five** leakage drivers, per-programme P and L with contingency, approval-vs-realised delta, **bench tax column**.

## 4. User stories

Finance Lead prepares monthly P and L review in 15 minutes instead of 3 hours.
Delivery Director sees which five drivers are compressing margin before steerco.
Programme Manager sees contingency reserve drawdown signaling overrun risk.
Finance Lead sees bench tax as the third-largest leakage driver this month (USD 480K) and takes the rebadge decision to steerco.

## 5. KPIs (revised, seven up from six)

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| Gross Margin | `(Revenue - Direct Cost) / Revenue x 100` | 19.2% | 21.3% | 21% | Below 20% |
| Net Margin | `(Revenue - Direct Cost - Indirect Cost - Contingency Draw - Bench Tax) / Revenue x 100` | 12.6% (revised from 13.2% with bench tax separately itemised) | 14.1% | 15% | Below 12% |
| DSO | `(AR / Revenue Billed) x Days` | 47 days | 42 days | Below 45 | Above 55 |
| Unbilled WIP | `Revenue Booked - Revenue Billed` | USD 2.8M | USD 1.9M | Below USD 2M | Above USD 3M |
| Contingency Drawn MTD | `Sum of contingency_reserve_usd consumed this period` | USD 340K | USD 120K | Below 20% of monthly reserve | Above 40% |
| **Bench Tax MTD (NEW)** | `Sum of bench_tax_allocated_usd across programmes` | USD 480K (Pegasus 142K, Phoenix 98K, Stellar 72K, others 168K) | USD 210K | Below USD 300K | Above USD 500K |
| Leakage MTD | `Sum of negative margin impact events across five drivers` | USD 2.18M across 5 drivers (CR absorbed 520K, scope debt 340K, bench tax 480K, vendor overrun 310K, estimation drift 530K) | USD 1.28M | Below USD 1M | Above USD 2M |

## 6. Views and interactions (revised)

Filter bar. Intelligence layer (voice sample Design Foundations 11.3). **Seven KPI cards** in two-row grid now includes Bench Tax MTD. Margin waterfall SVG now shows **five** leakage bars (CR absorbed, scope debt, bench tax, vendor overrun, estimation drift). Leakage attribution breakdown table. Programme P and L table now includes Contingency Reserve column, Margin at Approval, Margin Realised, Delta (approval - realised), **Bench Tax column**.

### 6.1 Margin waterfall bars (revision 3, 5 drivers)

Bar 1: Last month net margin starting point.
Bar 2 (positive): Revenue improvement contribution.
Bar 3 (negative): CR absorbed contribution (Change Impact tab).
Bar 4 (negative): Scope debt contribution (Change Impact tab).
Bar 5 (negative): Bench tax contribution (Financials tab).
Bar 6 (negative): Vendor overrun contribution (Multi-Vendor tab).
Bar 7 (negative): Estimation drift contribution (Delivery Health tab).
Bar 8: This month net margin ending point.

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Waterfall bar | Driver-specific detail |
| Leakage driver | Source data by category |
| Programme row | Monthly P and L detail plus CR history |
| Contingency column | Reserve consumption timeline per programme |
| Approval-vs-Realised delta | CR list that closed the gap |
| **Bench tax column (NEW)** | Bench Tax Allocation table on Financials tab |
| **Bench tax waterfall bar (NEW)** | Named people on bench with bench_since_date |

## 8. Intelligence layer rules (revised)

`tab_pnl_cockpit.py` revision 3. Voice benchmark Design Foundations 11.3. Drivers ranked by absolute margin impact across five leakage categories. Actions from Clear, Shift, Enforce, Recognise, Reprice, Replan, **Rebadge** (new, bench tax remedy), **Release** (new, bench tax remedy) verbs. Contingency draw over threshold triggers Replan verb. Bench tax above USD 400K triggers Rebadge or Release verb.

## 9. Non-functional

Waterfall renders under 200 ms. Per-programme table under 150 ms for 10 programmes with expanded columns.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/pnl/margin-waterfall` | Bridge bars (5 drivers) |
| GET | `/api/v1/pnl/leakage-attribution` | 5 driver breakdown |
| GET | `/api/v1/pnl/per-programme` | Programme P and L with bench tax column |
| GET | `/api/v1/pnl/contingency-timeline?programme={code}` | Reserve consumption over time |
| GET | `/api/v1/pnl/approval-vs-realised?programme={code}` | Margin delta with CR attribution |
| GET | `/api/v1/pnl/bench-tax-breakdown` | NEW. Bench tax by programme on the waterfall |
| GET | `/api/v1/intelligence/pnl_cockpit` | What Why Act |

## 11. Error and empty states

No prior month → "First month of data" state. No contingency reserve defined → hide the column with helper tooltip. No bench this month → waterfall bar omitted with healthy badge.

## 12. Accessibility

Waterfall data table alternative. Contingency bar has text value. Colour-coded bars include text labels. Bench tax bar has aria label naming it.

## 13. Test acceptance

Playwright: waterfall shows 5-driver bridge, bench tax bar present at USD 480K, contingency column populated, approval-vs-realised delta visible for absorbed CRs. Contract test on all endpoints.

## 14. Release gating

Wireframe v1_06 revision 3 parity. Finance Lead approves 5-driver waterfall methodology. Bench tax methodology shared with Financials tab revision 3.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-2 Bench Tax visibility gap. Wireframe: `docs/wireframes/v1_06_PnL_Cockpit.html` revision 3 pending cascade.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 Five-Leak Anatomy relabel (UC-NN)

Rev 3 waterfall identified 5 drivers (CR absorbed, scope debt, bench tax, vendor overrun, estimation drift). Revision 4 relabels these to match Hub S04P4 naming explicitly:

| Rev 3 label | Rev 4 label (Hub-aligned) | Source column |
|-------------|----------------------------|------------------|
| CR absorbed | Scope Absorbed Silently | `revenue_leakage_mechanism.mechanism = ScopeAbsorbedSilently` |
| Scope debt | Scope Absorbed Silently (consolidated) | `scope_debt` cross-reference |
| Bench tax | Attrition Not Rehired At Band | `revenue_leakage_mechanism.mechanism = AttritionNotRehiredAtBand` |
| Vendor overrun | Vendor Overrun Unmapped To Penalty | `revenue_leakage_mechanism.mechanism = VendorOverrunUnmappedToPenalty` |
| Estimation drift | Rate Card vs Blended Actual | `revenue_leakage_mechanism.mechanism = RateCardVsBlendedActual` |
| (new) | License Renewal Unbudgeted | `revenue_leakage_mechanism.mechanism = LicenseRenewalUnbudgeted` |

Waterfall grows from 5 to 6 drivers at rev 4 to cover all 5 Hub mechanisms plus Scope Absorbed as a named driver. Chart sourced from `five_leak_anatomy_snapshot` for aggregate view and `revenue_leakage_mechanism` for detail.

### R4.2 New KPI: Five-Leak Anatomy BPS (UC-NN)

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Five-Leak Anatomy BPS | `five_leak_anatomy_snapshot.total_leak_bps (latest per programme); portfolio sum-weighted` | 410 bps on Pegasus (red; near S04P4 810 bps example), 180 bps portfolio (amber) | 95 bps portfolio (green) | Below 150 | At or above 400 | `five_leak_anatomy_bps` |

### R4.3 New section: EVM cross-surface (UC-P)

EVM Quartet (CPI, SPI, TCPI, EAC) added as a side panel next to the margin waterfall. Cross-surface from v1_02 Delivery Health rev 4. Shows portfolio aggregate EVM alongside margin. Per S08P6: CPI is the 3-month leading indicator of margin failure. Rendering the two side-by-side makes the causal chain visible.

Click any EVM card opens v1_02 Delivery Health at the programme-level EVM section.

### R4.4 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Five-Leak Anatomy BPS KPI | Five-Leak waterfall |
| Waterfall driver | Programme list filtered by dominant driver |
| License Renewal driver | v1_13 Multi-Vendor contract_artefacts renewal window |
| EVM cross-surface cards | v1_02 Delivery Health EVM section |
| Largest leak narrative | Month detail with dominant mechanism text |

### R4.5 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/pnl/five-leak-anatomy?programme={code}` | Programme-level anatomy |
| GET | `/api/v1/pnl/five-leak-anatomy-portfolio` | Portfolio anatomy summary |
| GET | `/api/v1/pnl/evm-cross-surface` | EVM portfolio roll-up |

### R4.6 Intelligence layer rules (revision 4 additions)

`tab_pnl_cockpit.py` revision 4. New triggers:
- Five-Leak BPS red: action "Audit the largest leak driver named in the month. Per S04P4 compression patterns compound."
- EVM CPI below 0.95 correlated with Five-Leak BPS above 150: action "Margin variance has a measured delivery antecedent. Review with Delivery Director."

### R4.7 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with Hub-aligned 6-driver waterfall and EVM side panel.
2. Three new endpoints contract-match.
3. Waterfall labels match the R4.1 mapping exactly.
4. Five-Leak BPS calculation matches Data Model rev 4 generated column `total_leak_bps`.
5. EVM cross-surface values match v1_02 Delivery Health rev 4 EVM snapshot values (same source row).
6. Playwright scenario: Pegasus programme view shows 410 bps leak anatomy with dominant driver labelled, EVM side panel shows CPI 0.92 and SPI 0.88.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-NN relabel and UC-P EVM cross-surface.*
