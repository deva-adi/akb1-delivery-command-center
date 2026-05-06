# 14_PRD_Tab_11_Scenario_Planner.md
### Scenario Planner Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds UC-F Portfolio Forecast Confidence mode (weekly baseline forecast with p95 range) and UC-F2 Friday Forecast Call commentary view. PERT math from rev 3 retained for what-if scenarios; UC-F adds a separate baseline-forecast mode distinct from what-if. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-2 gap: added PERT estimation math to scenario inputs so weighted averages (Optimistic, Most Likely, Pessimistic) and standard deviation produce probabilistic margin ranges, not just point estimates. Hub Proposition C Article 1: "estimation without PERT is a wish, not a plan." Replaced revision 2.

> Inherits from Master PRD, Data Model PRD, Intelligence Layer PRD, Security PRD, Design Foundations.

---

## 1. Scope and goals

Three-scenario what-if tool. Base, Recovery, Growth comparison of margin, revenue, cost, FTE. Steering committee decision artifact. **New in revision 3: PERT estimation on all scenario inputs producing weighted expected value plus confidence bands.**

## 2. Role access

| Role | Access |
|------|--------|
| Portfolio Owner | Full plus save scenario |
| Programme Manager | View only |
| Finance Lead | Full plus save scenario |
| Read Only | View only |

## 3. Data contract

Consumes: current `financials_monthly`, `allocations`, `opportunities`, **`estimation_baselines`** for baseline anchor.

Scenario inputs now captured as triples: Optimistic (O), Most Likely (M), Pessimistic (P). Expected value computed via PERT weighted formula.

Response: `ScenarioResponse` with inputs (triples), outputs (expected plus sigma), projection curves for 3 scenarios with confidence bands.

## 4. User stories

Portfolio Owner presents 3 scenarios to steerco on Thursday with clear recommendation.
Finance Lead saves "Recovery" scenario as the locked plan for the quarter.
Portfolio Owner sees Recovery scenario margin expected value 21.3 percent with 95 percent confidence band plus or minus 1.8 points (range 19.5 to 23.1 percent), enables informed commit.
Finance Lead spots that Base scenario margin standard deviation is 2.4 points, signals unacceptable volatility, escalates to steerco for tighter baselining.

## 5. KPIs (revised, seven up from five)

### 5.1 PERT formulas

```
Expected Value (E)        = (O + 4 x M + P) / 6
Standard Deviation (sigma) = (P - O) / 6
Variance                  = sigma squared
95 percent confidence band = E plus/minus 1.96 x sigma
```

| KPI | Formula | Example 1 (Base) | Example 2 (Recovery) | Target | Alert |
|-----|---------|------------------|----------------------|--------|-------|
| Scenarios Modelled | `Count of active scenarios` | 3 | 3 | 3 | N/A |
| Projected 12M Margin Expected | `(O + 4M + P) / 6 for margin` | O 19.8%, M 17.4%, P 15.0% → E = (19.8 + 69.6 + 15.0)/6 = 17.4% | O 22.9%, M 21.3%, P 19.0% → E = (22.9 + 85.2 + 19.0)/6 = 21.2% | 21% | Below 20% |
| **Projected Margin Sigma (NEW)** | `(P - O) / 6` | (19.8 - 15.0) / 6 = 0.8 points | (22.9 - 19.0) / 6 = 0.65 points | Below 1.0 point | Above 2.0 points |
| **95 Percent Confidence Band (NEW)** | `E plus/minus 1.96 x sigma` | 17.4% plus/minus 1.57 = [15.8%, 19.0%] | 21.2% plus/minus 1.27 = [19.9%, 22.5%] | Band within plus/minus 1.5 points of E | Band wider than plus/minus 3 points |
| Projected 12M Revenue Expected | `(O + 4M + P) / 6 for revenue` | USD 372M | USD 384M | Plan + 2% | Below plan |
| FTE by Q4 Expected | `(O + 4M + P) / 6 for FTE` | 300 (O 298, M 300, P 304) | 302 | Matches capacity need | Gap > 10 |
| Risk Score | `Weighted execution risk index` | 8.4 | 5.2 | Below 6.0 | Above 7.5 |

## 6. Views and interactions (revised)

Filter bar plus Horizon plus New Scenario button. Intelligence layer. Three scenario cards (Base, Recovery, Growth) with status chips. Margin projection line chart 12 months with target band showing all 3 trajectories **plus 95 percent confidence shaded band around each**. Scenario inputs and outputs matrix comparing across 11 dimensions **with O M P triple inputs captured per dimension**.

**New section: PERT Summary panel.** Expected value, sigma, and confidence band rendered prominently for each scenario. Surfaces volatility as explicit decision input.

### 6.1 Scenario input capture

For each of the 11 scenario dimensions (revenue base, rate card, attrition, hiring, bench rate, pipeline close rate, renewal rate, contingency draw, CR absorption, bench tax, vendor cost), user captures:

| Dimension | Optimistic (O) | Most Likely (M) | Pessimistic (P) | Expected (E) | Sigma |
|-----------|----------------|-----------------|------------------|--------------|-------|
| Revenue base | USD 385M | USD 372M | USD 355M | (385 + 1488 + 355) / 6 = 371.3M | (385-355)/6 = 5M |
| Rate card uplift | 6% | 4% | 1% | (6 + 16 + 1)/6 = 3.83% | 0.83 points |
| Attrition | 12% | 16% | 22% | (12 + 64 + 22) / 6 = 16.3% | 1.67 points |
| Hiring velocity | 28/mo | 22/mo | 15/mo | (28 + 88 + 15) / 6 = 21.8 | 2.17 |
| ... | ... | ... | ... | ... | ... |

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Scenario card | Edit assumptions drawer with O M P triples |
| Projection point | Monthly detail for that scenario |
| Matrix row | Input source (e.g. pipeline, hiring plan) |
| **Confidence band shading (NEW)** | Sensitivity breakdown: which input contributes most to volatility |
| **Sigma value (NEW)** | Inputs ranked by variance contribution |

## 8. Intelligence layer rules (revised)

`tab_scenario.py` revision 3. Drivers by scenario sensitivity (which assumption moves outcome most, now quantified via variance contribution). Actions from Commit, Freeze, Package, **Tighten** (new, reduce O-P range on the highest-variance input). Hub voice from Proposition C Article 1.

## 9. Non-functional

Scenario compute under 500 ms for 12 months across all 3 scenarios. PERT recalculation on input change under 100 ms.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/scenario/list` | Active scenarios |
| GET | `/api/v1/scenario/{id}` | Single scenario detail with PERT triples |
| POST | `/api/v1/scenario` | Create new scenario (role-gated) with triples |
| PATCH | `/api/v1/scenario/{id}/inputs` | NEW. Update O M P triple for a dimension |
| GET | `/api/v1/scenario/comparison` | Side-by-side matrix |
| GET | `/api/v1/scenario/{id}/sensitivity` | NEW. Variance contribution per input |
| GET | `/api/v1/intelligence/scenario` | What Why Act |

## 11. Error and empty states

No saved scenarios → prompt to create the first. Calculation error → fallback to rules-only warning. Single point estimate provided (no triple) → compute with sigma 0 and display warning chip.

## 12. Accessibility

Projection chart has data table alternative. Scenario cards keyboard navigable. Confidence bands rendered with text labels not colour only. PERT summary panel uses numeric values plus text.

## 13. Test acceptance

Playwright: create new scenario with O M P triples, modify Pegasus recovery flag, see margin expected and sigma update, save scenario, compare to Base. Confidence band visually renders. Sensitivity drill shows top 3 variance contributors. Contract test on POST and PATCH endpoints.

## 14. Release gating

Wireframe v1_11 revision 3 parity. Save scenario enforces role. PERT formula verified by Finance Lead.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-2 PERT Estimation gap. Wireframe: `docs/wireframes/v1_11_Scenario_Planner.html` revision 3 pending cascade.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 Two modes

Revision 4 establishes two distinct modes in Scenario Planner:

| Mode | Purpose | Source | Rev |
|------|---------|--------|-----|
| What-if (rev 3 existing) | User-driven hypothetical scenario composition with PERT on 11 inputs | User inputs in session | Rev 3 |
| Baseline Forecast (NEW rev 4) | System-generated weekly portfolio-forecast with p95 confidence range | `portfolio_forecast` table, daily seeded | Rev 4 |

Mode switcher at the top of the tab. Default is What-if for Finance Lead, Baseline Forecast for Portfolio Owner.

### R4.2 New KPIs (Baseline Forecast mode)

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Portfolio Forecast p95 Spread | `(p95_upper - p95_lower) / expected x 100` | 22 percent (red) | 8 percent (green) | Below 10 | At or above 20 | `portfolio_forecast_p95_spread_pct` |
| Forecast Confidence Trend | `confidence_tightening_trend from latest portfolio_forecast` | Widening (red) | Tightening (green) | Tightening or Stable | Widening for 4 consecutive weeks | PRD-local |

### R4.3 New section: Baseline Forecast view (UC-F)

Fan chart. X is week, Y is portfolio revenue USD. Three bands: p95_lower (dashed), expected (solid), p95_upper (dashed). Bands shaded to show confidence width. Toggle scenarios: Baseline, Optimistic, Pessimistic. Below the chart, numeric display of this week's p95_lower, expected, p95_upper, sigma, and tightening trend.

Per S10 Part 03 and Part 07 the Friday Forecast Call reviews baseline forecast with p95 ranges; this is that view.

### R4.4 New section: Friday Forecast Call Commentary (UC-F2)

Table. Rows are programmes. Columns: Week Ending, DM Commentary, Confidence Self-Assessment (0 to 100), Variance to Baseline Percent, Flags. Sort by week_ending descending. Filter by programme. Programmes with no commentary this week flagged amber.

Click a row to see DM commentary text in full. Commentary is written weekly by the Programme Manager as a narrative of the week's forecast confidence.

### R4.5 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Baseline Forecast KPI | Baseline Forecast fan chart |
| Fan chart band | Programme-level drill-down showing which programmes widen or tighten the band |
| Friday Forecast KPI | Friday Forecast Call Commentary table |
| Commentary row | DM commentary text and flags_json |
| Missing commentary amber | Prompt to PM to submit commentary |

### R4.6 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/scenario-planner/baseline-forecast?weeks=52` | Baseline forecast series |
| GET | `/api/v1/scenario-planner/baseline-forecast?scenario={Baseline,Optimistic,Pessimistic}` | Scenario-filtered |
| GET | `/api/v1/scenario-planner/friday-forecast` | Commentary table |
| GET | `/api/v1/scenario-planner/friday-forecast/{programme}/{week}` | Single commentary |
| POST | `/api/v1/scenario-planner/friday-forecast/{programme}/{week}` | Submit commentary, audited |

### R4.7 Intelligence layer rules (revision 4 additions)

`tab_scenario_planner.py` revision 4. New triggers:
- Portfolio Forecast p95 Spread red: action "Forecast is not actionable. Review programme inputs driving variance with PMs by Friday."
- Forecast Confidence Widening for 4 consecutive weeks: action "Trend is degrading. Book cross-programme Forecast Call with Portfolio Owner."
- Friday Forecast Commentary missing: action "PM to submit commentary within 48 hours."

### R4.8 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with Mode switcher, Baseline Forecast fan chart, Friday Forecast table.
2. Five new endpoints contract-match.
3. Fan chart reflects `portfolio_forecast` weekly seed.
4. Commentary submit audits through `audit_trail_entries` with actor and week.
5. Playwright scenario: PO default lands on Baseline Forecast, switch to What-if, verify mode state is preserved per user.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-F Baseline Forecast mode and UC-F2 Friday Forecast Call commentary.*
