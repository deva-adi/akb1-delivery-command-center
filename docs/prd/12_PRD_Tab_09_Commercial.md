# 12_PRD_Tab_09_Commercial.md
### Commercial Pipeline Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds UC-D Account Concentration Map, UC-U Rate Card Optimisation (Arbitrage), UC-FF Growth Expansion Tracker, UC-HH QBR Quality Score. This is the largest commercial expansion since rev 1. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-2 gap: added QBR Tracker for Delivery-Led Growth. Hub Proposition E Article 1 thesis: "delivery excellence converts to expansion revenue, but only if the QBR captures outcomes the client will pay to keep getting." QBR cadence, outcome attestation, and renewal probability modelling land on this tab because commercial owns the growth motion. Replaced revision 2.

> Inherits from Master PRD, Data Model PRD, Intelligence Layer PRD, Security PRD, Design Foundations.

---

## 1. Scope and goals

Pipeline by stage, weighted TCV, win rate, commit vs capacity heat map, renewal tracker with at-risk flag. Commercial team's Monday view. **New in revision 3: QBR Tracker showing quarterly business review cadence per programme, outcome attestation status, and renewal probability lift driven by QBR health.**

## 2. Role access

| Role | Access |
|------|--------|
| Portfolio Owner | Full |
| Programme Manager | Summary plus QBR status for own programmes |
| Finance Lead | Full, primary |
| Read Only | Summary only |

## 3. Data contract

Consumes: `opportunities` with stage, TCV, probability, close date, client. Renewal flag on `programmes`. **`qbr_records` NEW revision 3** with programme_id, qbr_date, qbr_status (Scheduled, Delivered, Missed), outcome_attested, client_sponsor_signoff, next_qbr_date.

Response: `CommercialSnapshotResponse` with funnel, capacity matrix, top opportunities list, **QBR tracker section**, **renewal probability per programme**.

## 4. User stories

Practice Head sees capacity gap 6 months ahead before committing new logos.
Finance Lead tracks renewals at risk for the quarter.
Commercial Lead sees QBR cadence: 8 of 10 programmes on schedule, 2 overdue (Pegasus missed Q1 QBR, Phoenix QBR slipped twice). Escalates to delivery.
Portfolio Owner uses QBR outcome attestation plus value realisation (Client Health tab) to set renewal probability. Helvetia renewal probability lifts from 45 percent to 72 percent after Q1 QBR landed with client-confirmed outcome attestation.

## 5. KPIs (revised, seven up from five)

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| Pipeline TCV | `Sum of opportunity TCV where stage IN (Identify to Commit)` | USD 187M | USD 165M | 3x quota | Below 2x |
| Weighted Pipeline | `Sum of TCV x Stage Probability` | USD 89M | USD 72M | 1.5x quarterly target | Below 1x |
| Win Rate | `Won TCV / (Won + Lost) TCV x 100 over trailing 4 quarters` | 34% | 39% | 40% | Below 30% |
| Capacity Gap FTE | `Capacity Needed (weighted) - Capacity Available (FTE)` | 22 FTE short for Q3 | 10 FTE short | 0 | Above 10 short |
| Renewal at Risk USD | `Sum of renewal TCV where risk flag = True` | USD 42M (Helvetia) | USD 28M | 0 | Above USD 20M |
| **QBR On-Schedule Percent (NEW)** | `QBRs delivered on schedule in period / QBRs scheduled in period x 100` | 8 of 10 = 80% | 9 of 10 = 90% | At or above 90% | Below 80% |
| **QBR Outcome Attested Percent (NEW)** | `QBRs where outcome_attested = True and client_sponsor_signoff = True / QBRs delivered x 100` | 6 of 8 = 75% | 8 of 9 = 89% | At or above 85% | Below 70% |

## 6. Views and interactions (revised)

Filter bar plus Stage plus Vertical plus As-of. Intelligence layer. **Seven KPI cards** in two-row grid. Pipeline funnel 5 stages (Identify to Commit). Commit vs Capacity heat map 3 quarters. Top 10 opportunities table with type chip (Renewal, New Logo, Expand, At Risk).

**New section: QBR Tracker per programme.** Table showing every programme with QBR cadence, last delivered, next scheduled, attestation status, renewal probability influenced by QBR health.

### 6.1 QBR Tracker layout

| Programme | Last QBR | Status | Outcome attested | Client signoff | Next QBR | Renewal probability |
|-----------|----------|--------|------------------|----------------|----------|---------------------|
| Pegasus Healthcare | 2025-12-20 | **Missed Q1** | No | No | 2026-05-05 overdue | **38% (red)** |
| Phoenix Pharma | 2026-01-18 | Delivered (late) | Partial | No | 2026-05-12 | **52% (amber)** |
| Stellar Logistics | 2026-02-14 | Delivered | Yes | Yes | 2026-05-16 | 68% (green) |
| Helvetia Banking | 2026-03-22 | Delivered | Yes | Yes | 2026-06-22 | **72% (green, +27pp post-QBR)** |
| Helix Retail OMS | 2026-03-28 | Delivered | Yes | Yes | 2026-06-28 | 78% (green) |
| ... | ... | ... | ... | ... | ... | ... |

### 6.2 QBR health influence on renewal probability

Renewal probability formula is lifted when QBR is delivered, outcome is attested, and client sponsor has signed off. Base renewal probability is set by tenure and NPS; QBR status applies a multiplier per quarter the cadence is held or broken.

```
renewal_probability_adjusted = base x qbr_health_multiplier

qbr_health_multiplier:
  QBR delivered + outcome attested + client signoff    = 1.35
  QBR delivered + outcome partial + no client signoff  = 1.05
  QBR missed or slipped                                = 0.70
  QBR missed 2 consecutive quarters                    = 0.45

Clamped to 0.30 minimum, 0.95 maximum.
```

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Funnel stage | Opportunities in that stage |
| Capacity bar | Resource plan detail |
| Opportunity row | Full deal detail plus activity log |
| **QBR Tracker row (NEW)** | QBR detail drawer with history, outcome notes, signoff evidence, next QBR agenda template |
| **Renewal probability cell (NEW)** | Probability decomposition: base, QBR multiplier, NPS signal, value realisation signal |

## 8. Intelligence layer rules (revised)

`tab_commercial.py` revision 3. Drivers by stage conversion drop, capacity gap, renewal churn signal, **QBR cadence break, outcome attestation gap**. Actions from Renew, Upsell, Negotiate, Freeze, Recover, **Book** (new, schedule overdue QBR), **Attest** (new, drive client signoff on outcome) verbs. Hub voice from Proposition E Article 1 on delivery-led growth.

## 9. Non-functional

Funnel render under 150 ms. Capacity calc across 3 quarters under 250 ms. QBR tracker query under 150 ms for 10 programmes.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/commercial/funnel` | Stage counts and TCV |
| GET | `/api/v1/commercial/capacity-vs-commit?quarters=3` | Heat map |
| GET | `/api/v1/commercial/top-opportunities?limit=10` | List |
| GET | `/api/v1/commercial/qbr-tracker` | NEW. Per-programme QBR cadence |
| GET | `/api/v1/commercial/renewal-probability` | NEW. Programme probability with decomposition |
| POST | `/api/v1/commercial/qbr-records` | NEW. Capture QBR outcome and signoff |
| GET | `/api/v1/intelligence/commercial` | What Why Act |

## 11. Error and empty states

Pipeline below 2x quota → red banner with capacity recommendation. No QBR records for programme → "No QBR history. Schedule first QBR within 30 days" prompt with template link.

## 12. Accessibility

Funnel has data table alternative. Renewal-at-risk chip has text label, not colour only. QBR status chips have text plus colour. Attestation status has text plus icon.

## 13. Test acceptance

Playwright: Helvetia renewal appears at risk, Q3 capacity gap shown as 22 FTE short, drill to opportunity works. QBR tracker shows Pegasus missed Q1, Helvetia attestation lifts renewal probability to 72 percent. POST QBR record works. Contract test on all endpoints.

## 14. Release gating

Wireframe v1_09 revision 3 parity. QBR outcome attestation workflow validated by Commercial Lead. Renewal probability decomposition formula signed off by Finance Lead.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-2 QBR Tracker for Delivery-Led Growth gap. Wireframe: `docs/wireframes/v1_09_Commercial_Pipeline.html` revision 3 pending cascade.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 New KPIs

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Account Concentration Revenue Percent | `Max(account_concentration.revenue_pct_of_portfolio)` | 28 percent (red, one client) | 14 percent (green) | Below 15 | At or above 25 | `account_concentration_revenue_pct` |
| Rate Card Drift Percent | `Avg(rate_card_effective.drift_pct) weighted by programme TCV` | minus 6.2 percent (red junior creep) | 0.8 percent (green) | minus 2 to 2 | Outside minus 5 to 5 | `rate_card_drift_pct` |
| Growth Expansion Multiple | `Avg(growth_expansion.expansion_multiple) weighted by baseline_tcv_usd` | 2.1x (green) | 0.9x (red) | At or above 1.5 | Below 1.1 | `growth_expansion_multiple` |
| QBR Quality Score | `Avg(qbr_quality_score.quality_score) trailing 90 days` | 68 (amber) | 84 (green) | At or above 75 | Below 50 | `qbr_quality_score` |

### R4.2 New section: Account Concentration Map (UC-D)

Bubble chart. X is revenue_pct_of_portfolio, Y is margin_pct_of_portfolio. Bubble size by expansion_headroom_usd. Bubble colour by concentration_band (Low, Moderate, High, Critical). Critical clients (above 25 percent revenue) labelled with client name.

Below the chart, a table with columns: Client, Revenue Percent, Margin Percent, Dependency Risk Score, Expansion Headroom, Band, Narrative. Sort by revenue_pct_of_portfolio descending by default.

### R4.3 New section: Rate Card Optimisation (UC-U)

Grid. Rows are programmes, columns are bands (B1 through B5 or equivalent). Cell shows drift_pct with colour band per `threshold_calibration_register` RangeIsBetter posture. Below the grid, a narrative panel shows skill_mix_drift_text for the programme with the largest absolute drift. Margin impact USD cumulative called out.

Per S08P3: rate card arbitrage compresses margin silently through skill-mix drift.

### R4.4 New section: Growth Expansion Tracker (UC-FF)

Table view. Rows are clients. Columns: Baseline TCV, Current TCV, Expansion Multiple, Delivery-Originated TCV, Narrative. Sort by expansion multiple descending. S05P3 retail 1.8 to 4.5 pattern highlighted when a client crosses 2.5x.

### R4.5 New section: QBR Quality Score (UC-HH)

Bar chart per QBR. X is QBR date, Y is quality_score. Bar colour: red below 50, amber 50 to 74, green above 75. Below the bars, a filter to show only QBRs with theatre_flag true (42-slide theatre pattern per S08P9). Click a bar to see agenda_quality, decisions_produced_count, slides_count, client_engagement_score decomposition.

### R4.6 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Account Concentration KPI | Account Concentration Map section |
| Bubble in Map | Client detail with programmes list |
| Rate Card Drift KPI | Rate Card Optimisation grid |
| Grid cell | Programme-band rate narrative |
| Growth Expansion KPI | Growth Expansion Tracker |
| Tracker row | Client expansion story and delivery-originated deal detail |
| QBR Quality KPI | QBR Quality Score section |
| QBR bar | QBR decomposition with the 4 components |
| Theatre flag filter | QBRs where slides above 30 AND decisions 0 |

### R4.7 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/commercial/account-concentration` | Map data |
| GET | `/api/v1/commercial/account-concentration/{client_id}` | Client detail |
| GET | `/api/v1/commercial/rate-card-optimisation` | Grid |
| GET | `/api/v1/commercial/rate-card-optimisation?programme={code}` | Programme rows |
| GET | `/api/v1/commercial/growth-expansion` | Expansion table |
| GET | `/api/v1/commercial/qbr-quality` | QBR quality series |
| GET | `/api/v1/commercial/qbr-quality/{qbr_id}` | QBR decomposition |

### R4.8 Intelligence layer rules (revision 4 additions)

`tab_commercial.py` revision 4. New triggers:
- Account Concentration Critical band (revenue above 25 percent): action "Open diversification conversation with Portfolio Owner within 30 days."
- Rate Card Drift red (below minus 5 or above 5): action "Review skill-mix with Delivery; rebalance seniors vs juniors."
- Growth Expansion below 1.1 for client: action "Book QBR with client sponsor to identify expansion opportunity."
- QBR Quality below 50: action "Re-plan next QBR around 3 outcome decisions, not 42 slides. Per S08P9."
- QBR theatre_flag fires: action "Cap slide count at 20 and require at least 2 decisions per QBR."

### R4.9 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with all 4 new sections.
2. Seven new endpoints contract-match.
3. Account Concentration band generation matches seed distribution (1 Critical, 2 High, 4 Moderate, 3 Low).
4. Rate Card Drift aggregates match `rate_card_effective` generated column.
5. Growth Expansion Multiple matches `growth_expansion` generated column.
6. QBR Quality theatre_flag correct when `slides_count above 30 AND decisions_produced_count = 0`.
7. Playwright scenario: Critical band client surfaces on Account Concentration map, Pegasus shows rate card drift red, 6 QBRs flag theatre.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-D, U, FF, HH. Largest commercial tab expansion since rev 1.*
