# 16_PRD_Tab_13_Multi_Vendor.md
### Multi-Vendor Scorecard Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds UC-I Contract Lifecycle view (MSA, SOW, amendments, renewals, SLA cliffs) and UC-N Vendor Definition-of-Done Matrix. Rationalisation Queue from rev 3 retained. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-2 gap: added Vendor Rationalisation Queue with explicit cadence per Hub Proposition D Article 2 ("vendor sprawl compounds unless rationalisation is on a clock, not a mood"). Tracks underperformers and concentration offenders through a 90-day rationalisation window with named owners and decision gates. Replaced revision 2.

> Inherits from Master PRD, Data Model PRD, Intelligence Layer PRD, Security PRD, Design Foundations.

---

## 1. Scope and goals

25 partner firms scored across delivery, quality, SLA, cost. Performance matrix, concentration risk card, spend tracker, SLA pass-through modelling (revision 2), **Vendor Rationalisation Queue (revision 3)**. New in v1, solves problem 6 multi-vendor blind spots plus problem 7 vendor sprawl compounding.

## 2. Role access

| Role | Primary nav? | Access |
|------|--------------|--------|
| Portfolio Owner | No (via More menu) | Full |
| Programme Manager | No (via More menu) | Scoped to vendors on own programmes |
| Finance Lead | No (via More menu) | Full, spend focus |
| Read Only | No (via More menu) | Full read |

## 3. Data contract

Consumes: `vendors`, `vendor_engagements` revision 3 with sla_pass_through, penalty_allocation_pct, **rationalisation_stage, rationalisation_entered_at, rationalisation_owner, rationalisation_gate_date**.

Response: `MultiVendorResponse` with vendor scorecard rows, concentration risk blocks, spend rollup, SLA pass-through summary, **rationalisation queue**.

## 4. User stories

Portfolio Owner identifies 4 underperformers for formal notice.
Procurement Lead spots concentration risk on Pegasus before it becomes dependency crisis.
Finance Lead sees USD 380K client-side penalty exposure and the portion allocatable to Draco Solutions via contract SLA pass-through clause.
Portfolio Owner runs weekly Vendor Rationalisation Review and sees 6 vendors in queue: 2 at Observe stage, 3 at Formal Notice, 1 at Exit. Next decision gate is 2026-05-09 for Draco Solutions.
Procurement Lead sees Halcyon crossed from Observe to Formal Notice at day 34 of the 90-day window and the exit decision gate lands 2026-06-18.

## 5. KPIs (revised, seven up from six)

| KPI | Formula | Example | Target | Alert |
|-----|---------|---------|--------|-------|
| Active Vendors | `Count where active = True` | 25 | N/A | Sudden drop |
| Total Spend MTD | Sum of vendor spend current month | USD 2.9M | At or below plan | Above +10% |
| Top Performers | `Count overall score > 8.5` | 6 | At or above 5 | Below 4 |
| Underperformers | `Count overall score < 6.0` | 4 | 0 | At or above 3 |
| Vendor Risk Score | Weighted concentration plus performance plus compliance | 7.2 | Below 7.0 | At or above 7.5 |
| SLA Pass-Through Allocation | `Sum of penalty_exposure x penalty_allocation_pct where sla_pass_through = True` | USD 180K of the USD 380K portfolio penalty allocatable to 2 vendors | Maximum recovery | N/A |
| **Rationalisation Queue Depth (NEW)** | `Count vendors in queue where rationalisation_stage IN (Observe, FormalNotice, Exit)` | 6 vendors in queue (2 Observe, 3 FormalNotice, 1 Exit); next gate 2026-05-09 | Below 5 | At or above 8 |
| **Avg Days in Queue (NEW)** | `Avg(now - rationalisation_entered_at) for vendors in queue` | 42 days avg, 2 vendors past 60-day mark | Below 60 days | Above 75 days |

## 6. Views and interactions (revised)

Filter bar (Programme, Vendor Type, Score Range, Time Window, As-of date, **Rationalisation Stage**). Intelligence layer. **Seven KPI cards** in two-row grid. Vendor performance matrix (top 12 by spend x 4 score columns plus overall). Concentration risk card per programme. SLA Pass-Through Summary (revision 2).

**New section: Vendor Rationalisation Queue.** Table showing vendors in the 90-day rationalisation window with stage, owner, entry date, days in queue, decision gate, recommended action.

### 6.1 Rationalisation Queue cadence (revision 3)

Three stages in a 90-day window:

```
Day 0   Trigger:        Overall score < 6.0 for 2 consecutive months OR concentration > 35%
Day 0   Stage:          Observe (formal notice NOT yet sent)
Day 30  Decision gate:  Exit or continue. If continue, progress to FormalNotice
Day 30  Stage:          FormalNotice (letter issued)
Day 60  Decision gate:  Exit or retain. If exit, progress to Exit stage
Day 60  Stage:          Exit (exit plan drafted)
Day 90  Decision gate:  Vendor off-boarded OR retained with steerco override
```

### 6.2 Rationalisation Queue table

| Vendor | Stage | Owner | Entered | Days in | Gate date | Recommended |
|--------|-------|-------|---------|---------|-----------|-------------|
| Draco Solutions | FormalNotice | Rajiv | 2026-03-24 | 31 | 2026-05-09 | Exit |
| Halcyon Cloud | FormalNotice | Priya | 2026-03-19 | 36 | 2026-05-04 | Retain with remediation |
| Atlas Integration | Observe | Kiran | 2026-04-10 | 14 | 2026-05-10 | Continue observe |
| Nova Data | Observe | Meera | 2026-04-15 | 9 | 2026-05-15 | Continue observe |
| Pinnacle Test | FormalNotice | Rajiv | 2026-03-01 | 54 | 2026-04-30 | Exit |
| Vertex Infra | Exit | Priya | 2026-02-20 | 63 | 2026-05-20 | Off-board complete |

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Vendor row | Full scorecard with history |
| Score cell | Metric-level detail |
| Concentration block | Vendor and programme detail |
| Pass-through vendor row | Penalty allocation breakdown with contract clause reference |
| **Rationalisation queue row (NEW)** | Vendor drawer with full rationalisation history, performance trend since queue entry, exit plan if drafted |
| **Rationalisation stage filter (NEW)** | All vendors at that stage |

## 8. Intelligence layer rules (revised)

`tab_multi_vendor.py` revision 3. Drivers by quality drop, rate escalation, onboarding overhead, pass-through allocation opportunity, **rationalisation gate approaching**. Actions from Issue (formal notice), Renegotiate, Standardise, Consolidate, Recover, **Advance** (new, move vendor to next rationalisation stage), **Off-board** (new, final exit) verbs. Hub voice from Proposition D Article 2 on vendor sprawl.

## 9. Non-functional

Scorecard matrix aggregation under 200 ms for 25 vendors. Rationalisation queue under 150 ms.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/vendors/scorecard?limit=12` | Top by spend |
| GET | `/api/v1/vendors/concentration-risk` | Per-programme |
| GET | `/api/v1/vendors/sla-pass-through` | Pass-through clause vendors |
| GET | `/api/v1/vendors/{vendor_id}` | Vendor detail |
| GET | `/api/v1/vendors/rationalisation-queue` | NEW. All vendors in queue with gates |
| POST | `/api/v1/vendors/{vendor_id}/rationalisation-advance` | NEW. Advance vendor to next stage |
| POST | `/api/v1/vendors/{vendor_id}/off-board` | NEW. Final exit |
| GET | `/api/v1/intelligence/multi_vendor` | What Why Act |

## 11. Error and empty states

No vendors engaged on filter → "No vendors for this slice". No SLA pass-through clauses active → "No pass-through recovery opportunities" healthy state. Empty rationalisation queue → "Queue clear. Next weekly rationalisation review scheduled" celebration state.

## 12. Accessibility

Score cells keyboard navigable. Colour backed by numeric score. Pass-through allocation column has aria labels. Rationalisation stage chips have text plus colour.

## 13. Test acceptance

Playwright: Draco shows 5.4 overall with DROP chip, Pegasus concentration card shows 48 percent, SLA pass-through summary shows USD 180K allocatable, rationalisation queue shows 6 vendors, Draco gate date 2026-05-09 visible, advance action moves vendor stage. Contract test.

## 14. Release gating

Wireframe v1_13 revision 3 parity. Contract parser for SLA pass-through clauses validated by Finance. Rationalisation stage enum and gate date logic validated by Procurement.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-2 Vendor Rationalisation Queue gap. Wireframe: `docs/wireframes/v1_13_Multi_Vendor_Scorecard.html` revision 3 pending cascade.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 New KPIs

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Contract Renewal Window Days | `Min(renewal_window_close - current_date) across contract_artefacts WHERE renewal_window_close is not null` | 45 days (amber, planning needed) | 120 days (green) | Below 30 | At or above 60 | `contract_renewal_window_days_to_close` |
| Vendor DoD Gap Percent | `Count(vendor_dod_matrix WHERE gap_flag) / Count(vendor_dod_matrix) x 100 per programme` | 6.5 percent (amber) | 1.2 percent (green) | Below 5.0 | At or above 10.0 | PRD-local at v1 |
| Vendor DoD Overlap Percent | `Count(vendor_dod_matrix WHERE overlap_flag) / Count(vendor_dod_matrix) x 100 per programme` | 8.2 percent (amber) | 3.1 percent (green) | Below 8.0 | At or above 15.0 | PRD-local at v1 |

### R4.2 New section: Contract Lifecycle (UC-I)

Timeline view. Rows are programmes, columns are months. Artefact chips rendered on the timeline: MSA (long bar), SOW (shorter bar), Amendments (small markers), Rate Card (dotted line), SLA (underline below bar). Chip colour:
- Green for active and not near expiry
- Amber when within 60 days of `renewal_window_close` or `sla_cliff_date`
- Red when within 30 days or red_flag_text populated

Click a chip to see artefact detail (type, effective date, window close, red flag text if any).

Below the timeline, a table of upcoming renewal windows sorted by days to close ascending. Rows with red_flag_text surface at the top.

### R4.3 New section: Vendor Definition-of-Done Matrix (UC-N)

Grid. Rows are vendors, columns are workstreams. Each cell shows the `responsibility_type` enum code (DesignedAndBuilt, OperatedAndSupported, IntegratedHandedOff, AdvisoryOnly) or is empty. Gap cells (no vendor claims) render red with a warning. Overlap cells (multiple vendors claim) render amber. Hover shows handoff_sla_hours and acceptance_criteria_text.

Per S04P5: vendor A did not know vendor B was not doing the reconciliation. The DoD matrix forces this out.

### R4.4 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Contract Renewal Window KPI | Contract Lifecycle timeline filtered to upcoming windows |
| Timeline chip | Artefact detail with red flag text |
| Renewal table row | Programme detail with full artefact list |
| Vendor DoD Gap KPI | DoD Matrix filtered to gap cells |
| Vendor DoD Overlap KPI | DoD Matrix filtered to overlap cells |
| Matrix cell | Workstream detail with handoff SLA and acceptance criteria |
| Red flag chip | Commercial escalation with red flag context |

### R4.5 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/multi-vendor/contract-lifecycle?programme={code}` | Timeline data |
| GET | `/api/v1/multi-vendor/contract-lifecycle-portfolio` | Portfolio renewal calendar |
| GET | `/api/v1/multi-vendor/dod-matrix?programme={code}` | Matrix data |
| GET | `/api/v1/multi-vendor/dod-matrix/cell/{id}` | Cell detail |

### R4.6 Intelligence layer rules (revision 4 additions)

`tab_multi_vendor.py` revision 4. New triggers:
- Contract renewal window red (below 30 days): action "Commercial to complete renewal decision within 7 days."
- Contract artefact with red_flag_text: action "Review flagged artefact with Legal before renewal."
- Vendor DoD Gap red (above 10 percent): action "Assign workstream ownership to a single vendor within 14 days."
- Vendor DoD Overlap red (above 15 percent): action "Commercial arbitration between vendors. Define single accountable."
- SLA cliff within 60 days: action "Prepare SLA renewal or negotiate extension."

### R4.7 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with Contract Lifecycle timeline and DoD Matrix.
2. Four new endpoints contract-match.
3. Timeline chip colours match threshold logic in R4.2.
4. DoD Matrix gap and overlap computation verified against `vendor_dod_matrix` flags.
5. Playwright scenario: login as PO, see 2 programmes with red renewal windows, click chip to see red flag text; open DoD Matrix for Pegasus, verify 3 gap cells rendered red.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-I contract lifecycle and UC-N vendor DoD matrix.*
