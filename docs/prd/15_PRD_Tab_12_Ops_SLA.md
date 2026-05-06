# 15_PRD_Tab_12_Ops_SLA.md
### Ops and SLA Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 extends the Decision Queue columns with Options, Recommendation, Impact of Deferral per S04P2 four-column framing (UC-Y). Adds UC-Z decision category split (Scope, Vendor, Resource, Commercial, Compliance). Establishes cross-link to v1_16 Governance Operating Model as the home surface for governance-altitude views. Revision 3 content preserved below unchanged.
>
> Revision 3 added Decision Queue and Decision Velocity detail. Per Hub Proposition A Part 2: "governance theatre detection and decision velocity reform is the #1 hidden margin lever." Ops and SLA tab is the Programme Manager view where decisions are tracked through to resolution. Replaced revision 2.

---

## 1. Scope and goals

SLA adherence, active breaches, P1 incident trend, MTTR, **decision queue and velocity per programme**. Programme Manager primary workspace for ops discipline plus governance discipline.

## 2. Role access

Unchanged from revision 2. Programme Manager primary, Portfolio Owner full, Finance Lead penalty view, Read Only full read.

## 3. Data contract

Consumes: `sla_metrics`, `incidents`, `programmes`, `decisions` revision 3, `decision_queue_config` NEW revision 3.

Response: `OpsSLAResponse` extended with `decision_queue` and `decision_velocity` sections.

## 4. User stories

Programme Manager checks decision queue before weekly ops review, identifies three stuck decisions, escalates.
Programme Manager sees decision latency at 9 days against 2-day target, flags the cadence gap to the delivery director.

## 5. KPIs (revised, seven up from five)

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| SLA Adherence | SLA Met / Total x 100 | 88.3 percent | 95.0 percent | 95 | Below 92 |
| Active Breaches | Count state = Breach | 3 | 0 | 0 | >= 1 |
| Penalty Exposure | Sum penalty_exposure_usd | USD 380K | USD 120K | 0 | Above USD 100K |
| P1 Incidents 30d | Count severity = P1 | 42 | 30 | Below 30 | Above 40 |
| MTTR | Avg resolution time P1 plus P2 | 4.2 hours | 3.4 hours | Below 4 | Above 6 |
| **Decision Latency avg (NEW)** | `Avg(decision_latency_days) where closed_at last 30 days` | 9.3 days | 2.1 days | Below 2 days | At or above 7 |
| **Decisions Past SLA (NEW)** | `Count where status in (Open, InProgress) AND opened_at + sla_target_days < now()` | 7 of 14 | 0 of 4 | 0 | At or above 3 |

## 6. Views and interactions (revised)

Filter bar plus Severity, SLA Type, As-of. Intelligence layer. **Seven KPI cards** in two-row grid. SLA Status Matrix. Incident trend. Top 10 SLA breaches table.

**New section: Decision Queue.** Table showing open decisions with age, SLA status, owner, programme.

**New section: Decision Velocity chart.** 12-week rolling average decision latency plus target band.

### 6.1 Decision Queue layout

| Decision | Programme | Opened | Age | SLA target | Status | Owner |
|----------|-----------|--------|-----|------------|--------|-------|
| Pegasus recovery plan approval | Pegasus Healthcare | 13 Apr 2026 | **11 days (past SLA)** | 2 days | Open | Rajiv |
| Stellar CR reprice | Stellar Logistics | 10 Apr 2026 | **14 days (past SLA)** | 2 days | InProgress | Priya |
| Phoenix compliance spec signoff | Phoenix Pharma | 20 Apr 2026 | 4 days | 5 days | InProgress | Kiran |
| Orion B4 hiring approval | Orion Insurance | 17 Apr 2026 | **7 days (past SLA)** | 3 days | Escalated | Meera |
| ... | ... | ... | ... | ... | ... | ... |

Age past SLA rendered in red; age under SLA in amber or green. Ordered by age descending.

### 6.2 Decision Velocity chart

Line chart of rolling-weekly average decision latency over 12 weeks with target line at 2 days. Amber band 2 to 7 days. Red band above 7 days.

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Matrix cell | SLA history for programme and metric |
| Breach row | Incident detail and recovery plan |
| Incident spike | Incidents list for that week |
| **Decision Queue row (NEW)** | Decision drawer with history, stakeholders, linked RAID, proposed resolution |
| **Decision Velocity point (NEW)** | All decisions closed that week |

## 8. Intelligence layer rules (revised)

`tab_ops_sla.py` revision 3. Drivers include decision velocity contribution (when decision-past-SLA count exceeds 3). Actions from Stabilise, Unblock, Escalate, Cap, **Clear** (decision queue), **Reform** (cadence). Hub voice from Proposition A Part 2 on governance theatre.

## 9. Non-functional

Matrix aggregation under 200 ms. Decision Queue under 100 ms. Velocity chart under 150 ms.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/sla/matrix` | Programme x category grid |
| GET | `/api/v1/sla/breaches?limit=10` | Top breaches |
| GET | `/api/v1/sla/incident-trend?weeks=12` | Stacked area |
| GET | `/api/v1/decisions/queue` | NEW. Open decisions with age plus SLA status |
| GET | `/api/v1/decisions/velocity-trend?weeks=12` | NEW. Rolling average decision latency |
| GET | `/api/v1/decisions/{decision_id}` | NEW. Single decision detail |
| POST | `/api/v1/decisions/{decision_id}/close` | NEW. Mark decision closed |
| GET | `/api/v1/intelligence/ops_sla` | What Why Act |

## 11. Error and empty states

No decisions in queue (healthy) → "Decision queue clear" celebration.
No decisions closed yet → "Awaiting first closures" prompt.

## 12. Accessibility

Decision Queue keyboard-accessible. Past SLA indicator uses text plus colour.

## 13. Test acceptance

Playwright: Decision Queue shows 14 open, 7 past SLA, avg latency 9.3 days. Drill from queue row opens decision drawer. Close decision action works, latency recalculates.

## 14. Release gating

Wireframe v1_12 revision 3 parity. Decisions entity seeded with 30 records per Data Model revision 3.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-1 Decision Velocity gap (primary surface on Ops and SLA, KPI headline on Executive).*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 Decision Queue extended columns (UC-Y)

Rev 3 Decision Queue shows Programme, Age, SLA, Status, Owner. Rev 4 adds three columns sourced from `steerco_pre_read` join:

| Column | Source | Rendering |
|--------|--------|-----------|
| Options | `steerco_pre_read.options_text` | Truncated to 60 chars, hover for full text |
| Recommendation | `steerco_pre_read.recommendation_text` | Truncated to 60 chars, hover for full text |
| Impact of Deferral | `steerco_pre_read.deferral_impact_text` | Truncated to 60 chars, hover for full text |

Rows without linked pre-read show empty cells with an amber "No pre-read" chip. Per S04P2 the 4-column format is the governance standard; pre-read generation is on the PM as part of the governance cadence.

### R4.2 Decision Category filter and split (UC-Z)

New filter chip in the filter bar: Decision Category. Values: Scope, Vendor, Resource, Commercial, Compliance. Multi-select. Default all five.

Decision Queue also gets a category split view: 5 sub-tabs one per category. Each sub-tab shows only decisions of that category with their own latency average and count. Category column now visible in the main table.

### R4.3 Governance cross-link banner

Banner at top of tab for PO and DD: "For full governance operating model including cadence calendar, RACI, escalation contracts, and sponsor engagement, see Governance Operating Model." Click navigates to v1_16.

Decision Queue remains primary on Ops and SLA because PMs live here. Governance-altitude views (cadence, RACI, escalation contract) live on v1_16 to avoid duplicating surfaces.

### R4.4 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Decision Queue Options cell | Hover popover with full options text |
| Decision Queue Recommendation cell | Hover popover with full recommendation |
| Decision Queue Impact of Deferral cell | Hover popover with full impact text |
| Amber "No pre-read" chip | Prompt to PM to create pre-read; links to Steerco Pre-Read Kit on v1_16 |
| Category filter chip | Filtered queue view |
| Category sub-tab | Category-scoped decision list with own latency average |
| Governance cross-link banner | v1_16 Governance Operating Model |

### R4.5 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/ops-sla/decision-queue?category={cat}` | Extended queue filtered |
| GET | `/api/v1/ops-sla/decision-queue-by-category` | Category splits with counts |
| GET | `/api/v1/ops-sla/decision/{id}/pre-read` | Linked pre-read content |

### R4.6 Intelligence layer rules (revision 4 additions)

`tab_ops_sla.py` revision 4. New triggers:
- Decision without linked pre-read for more than 3 days: action "PM to create pre-read using the 4-column format."
- Vendor category latency above portfolio average by 50 percent: action "Escalate to Commercial for vendor arbitration."
- Compliance category decision past SLA: action "Escalate to legal or risk committee within 24 hours."
- Commercial category decision open more than 14 days: action "Bring to next QBR agenda."

### R4.7 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with extended queue columns, category filter, category sub-tabs.
2. Three new endpoints contract-match.
3. Decision-to-PreRead join returns correct text when linked; empty when not.
4. Category filter persists across session refreshes.
5. Governance cross-link banner visible for PO and DD; hidden for PM.
6. Playwright scenario: filter by category Vendor, verify only vendor-category decisions render; click "No pre-read" chip, verify prompt opens.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-Y extended columns and UC-Z category split.*
