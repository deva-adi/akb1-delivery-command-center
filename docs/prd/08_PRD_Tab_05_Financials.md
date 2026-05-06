# 08_PRD_Tab_05_Financials.md
### Financials Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds UC-DD Revenue Leakage 5-Mechanism audit per S08P7. Extends the existing unbilled-WIP and CR-absorbed coverage from rev 3 to cover all five mechanisms named in the Hub. Revenue recoverability flagged per mechanism. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-2 gap: added Bench Tax Allocation line on the per-programme P and L so the margin absorbing idle bench cost is visible per programme, not hidden in indirect cost pool. Hub Proposition B Article 3 thesis: "bench is not overhead, it is a cost centre with owners and decisions." Replaced revision 2.

> Inherits from Master PRD, Data Model PRD, Intelligence Layer PRD, Security PRD, Design Foundations.

---

## 1. Scope and goals

Revenue booked vs billed vs collected, cost breakdown by category and geo, programme P and L summary, DSO, margin percent per programme. Primary tab for Finance Lead. Financial tab structured to support contract-type breakdown so fixed-price, T and M, outcome dynamics are visible. **New in revision 3: bench tax allocation per programme.**

## 2. Role access

| Role | Primary nav? | Access |
|------|--------------|--------|
| Portfolio Owner | No (via More menu) | Full |
| Programme Manager | No | Scoped |
| Finance Lead | Yes | Full, primary |
| Read Only | Yes | Full read |

## 3. Data contract

Consumes: `financials_monthly` revision 3 with contingency_reserve_usd, margin_at_approval_pct, margin_realised_pct, recognition_method, **bench_tax_allocated_usd (NEW)**. `programmes` with contract_type and methodology. `people` with bench_state and bench_since_date for allocation source.

Response: `FinancialsSnapshotResponse` with revenue stack, cost buckets, per-programme rollup, DSO, contract-type breakdown, **bench tax allocation section**.

## 4. User stories

Finance Lead reconciles MTD revenue booked vs billed before month-end close.
Portfolio Owner identifies DSO outlier programmes.
Finance Lead compares Fixed Price versus T and M contribution to portfolio margin.
Finance Lead sees that Pegasus absorbs USD 142K bench tax this month (Java architect Rajesh idle 34 days since Phoenix roll-off) and assigns clear owner for rebadge or release.

## 5. KPIs (revised, six up from five)

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| Revenue Booked MTD | `Sum(revenue_booked_usd) where month = current` | USD 31.2M | USD 30.6M | Plan +0 to 3% | Below plan -2% |
| Bill Ratio | `Revenue Billed / Revenue Booked x 100` | `29.7 / 31.2 x 100 = 95.2%` | `27.1 / 28.6 x 100 = 94.8%` | At or above 97% | Below 93% |
| DSO | `(AR Outstanding / Revenue Billed in Period) x Days in Period` | AR 44M, Revenue Billed 29.7M → `(44 / 29.7) x 30 = 44.4 days`, dashboard shows 47 | AR 38M, Revenue Billed 28.6M → `(38 / 28.6) x 30 = 39.9 days`, dashboard shows 42 | Below 45 | Above 55 |
| Unbilled WIP | `Revenue Booked - Revenue Billed` | USD 2.8M | USD 1.9M | Below USD 2M | Above USD 3M |
| Gross Margin | `(Revenue - Direct Cost) / Revenue x 100` | `(31.2 - 24.6) / 31.2 x 100 = 21.2%`, blended 19.2% displayed | 21.3% | 21% | Below 20% |
| **Bench Tax Total MTD (NEW)** | `Sum of bench_tax_allocated_usd across programmes this month` | USD 480K total, Pegasus 142K, Phoenix 98K, Stellar 72K, other 7 programmes 168K | USD 210K total, distributed across 10 | Below USD 300K | Above USD 500K |

Margin-at-approval vs margin-realised per programme available as drill-down comparison.

## 6. Views and interactions (revised)

Filter bar (Geo, Programme, Currency, Contract Type, Time Window, As-of date). Intelligence layer. **Six KPI cards** in two-row grid. Revenue stack line 12 months. Cost breakdown bar 7 categories (delivery, infrastructure, travel, tools, overhead, vendor, **bench**) plus geo split sub-view. Programme revenue table with DSO, gross margin, net margin, margin delta (approval vs realised), contract type chip, **bench tax absorbed column**.

**New section: Contract Type Breakdown.** Stacked bar showing Fixed Price, T and M, Outcome revenue contribution plus margin percent per type. Drill to contract-type detail.

**New section: Bench Tax Allocation.** Per-programme table showing bench tax absorbed this month, bench days driving it, named people on bench with roll-off source programme and days on bench. Makes the hidden margin drag visible.

### 6.1 Bench Tax Allocation table

| Programme | Bench tax MTD | Bench days | People | Source roll-off | Action |
|-----------|---------------|------------|--------|-----------------|--------|
| Pegasus Healthcare | USD 142K | 34 | Rajesh K. (Java arch) | Phoenix hand-off | Rebadge or release by 2026-05-15 |
| Phoenix Pharma | USD 98K | 22 | Priya S. (DevOps), Anil V. (QA) | Orion ramp-down | Rebadge to Commercial growth pipeline |
| Stellar Logistics | USD 72K | 18 | Kiran M. (BA) | Stellar Phase-2 slip | Hold for Phase-3 start 2026-06-01 |
| ... | ... | ... | ... | ... | ... |

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Revenue stack | P and L Cockpit decomposition |
| Cost bucket | Cost category detail by vendor, geo |
| Programme row | Programme monthly detail plus margin-at-approval comparison |
| Contract type stack | Detail by contract type across programmes |
| DSO | AR aging view (post-v1 addition) |
| **Bench tax row (NEW)** | Named people on bench with bench_since_date and recommended action |
| **Bench days count (NEW)** | Workforce Intelligence view filtered to bench cohort |

## 8. Intelligence layer rules (revised)

`tab_financials.py` revision 3. Drivers by cost category rise, unbilled WIP growth, bench tax drag, contract-type margin squeeze. Actions from Recognise, Accrue, Clear, Shift, Reprice, **Rebadge** (new, move bench person to billable), **Release** (new, exit bench person from payroll) verbs. Hub voice from Proposition B Article 3 on bench cost ownership.

## 9. Non-functional

Revenue stack under 150 ms p95. Contract type breakdown under 200 ms. Bench tax allocation query under 150 ms for 10 programmes.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/financials/snapshot` | Tab payload |
| GET | `/api/v1/financials/revenue-stack?months=12` | Booked billed collected trend |
| GET | `/api/v1/financials/cost-breakdown` | Category bar (7 cats with bench) |
| GET | `/api/v1/financials/per-programme` | Programme table with contract type and bench tax |
| GET | `/api/v1/financials/contract-type-breakdown` | Per-contract-type rollup |
| GET | `/api/v1/financials/bench-tax-allocation` | NEW. Per-programme bench tax with named people |
| GET | `/api/v1/intelligence/financials` | What Why Act |

## 11. Error and empty states

Month with no revenue recognised → placeholder. Historical view banner when not today. No bench this month → "No bench tax this period" healthy state.

## 12. Accessibility

Revenue stack has data table alternative. Currency switch preserves filter state. Numeric cells use tabular numerals. Contract type chips have text plus colour. Bench tax column has text plus colour.

## 13. Test acceptance

Contract test on all endpoints. Playwright: filter change refreshes revenue stack, programme row drill opens correct drawer with margin-at-approval vs realised, contract-type stack drill works, Pegasus bench tax row shows USD 142K with Rajesh K., bench days drill routes to Workforce Intelligence.

## 14. Release gating

Wireframe v1_05 revision 3 parity, OpenAPI matches, DSO formula verified by Finance Lead reviewer, bench tax allocation method signed off by Finance Controller.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-2 Bench Tax Allocation gap. Wireframe: `docs/wireframes/v1_05_Financials.html` revision 3 pending cascade.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 New KPI: Revenue Leakage USD per Month (UC-DD)

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Revenue Leakage USD per Month | `Sum(revenue_leakage_mechanism.usd_impact) for latest attribution_month per programme; portfolio sum` | 62,400 portfolio (red, dominant on RateCardVsBlendedActual), 8,200 portfolio (green) | 18,900 portfolio (amber) | Below 15,000 | At or above 50,000 | `revenue_leakage_usd_per_month` |

### R4.2 New section: Revenue Leakage 5-Mechanism Audit (UC-DD)

New section rendered after the existing Bench Tax Allocation section. Five-bar horizontal stacked chart showing the 5 mechanisms per S08P7:

1. RateCardVsBlendedActual
2. AttritionNotRehiredAtBand
3. ScopeAbsorbedSilently
4. VendorOverrunUnmappedToPenalty
5. LicenseRenewalUnbudgeted

Each bar shows USD impact across current month. Recoverable flag renders as a small check-dot next to the mechanism label. Below the bars, a table with columns: Mechanism, Programme, USD Impact, Attribution Month, Recoverable, Evidence.

Filter bar chip allows filtering by programme. Default view is portfolio aggregate.

### R4.3 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Revenue Leakage KPI | 5-Mechanism Audit section |
| Mechanism bar | Mechanism-filtered programme list |
| Programme row | Single-programme 12-month leakage trend by mechanism |
| Evidence link | Source document or attestation text |
| Recoverable dot | Action drawer to initiate billback |

### R4.4 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/financials/revenue-leakage-portfolio` | Portfolio 5-mechanism current month |
| GET | `/api/v1/financials/revenue-leakage?programme={code}&months=12` | Programme time series |
| GET | `/api/v1/financials/revenue-leakage/mechanism/{enum}` | Filtered by mechanism |
| PATCH | `/api/v1/financials/revenue-leakage/{id}/recoverable` | Update recoverable flag, audited |

### R4.5 Intelligence layer rules (revision 4 additions)

`tab_financials.py` revision 4. New triggers:
- Revenue leakage USD per month red: action "Audit the dominant mechanism and scope recovery within 14 days."
- RateCardVsBlendedActual dominant in 3+ programmes: action "Run rate card drift review across affected programmes; escalate to Commercial."
- LicenseRenewalUnbudgeted fires: action "Commercial recheck of renewal calendar. Add to next steerco."

### R4.6 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with 5-Mechanism Audit section.
2. Four new endpoints contract-match.
3. 5-mechanism USD sum matches Data Model rev 4 seeded distribution (portfolio total ~30,000 to 60,000 per month across 10 programmes).
4. Recoverable flag update audits through `audit_trail_entries` with before/after.
5. Playwright scenario: portfolio view shows RateCardVsBlendedActual dominant, click the bar, filter to affected programmes.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-DD revenue leakage 5-mechanism audit extending rev 3 unbilled-WIP coverage.*
