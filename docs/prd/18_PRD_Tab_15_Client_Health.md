# 18_PRD_Tab_15_Client_Health.md
### Client Health Radar Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds UC-R Stakeholder Influence Map cross-link. The full Stakeholder Influence Map lives on v1_16 Governance Operating Model; v1_15 Client Health Radar surfaces a Client-scoped subset per S06P10 "loudest stakeholder always wins" pattern. Revision 3 content preserved below unchanged.
>
> Revision 3 added Value Realisation as a fifth composite-health signal. Composite formula updated. Reflects Hub framing: delivery excellence is the retention argument; on-time on-budget is necessary but not sufficient. Replaced revision 2.

---

## 1. Scope and goals

Composite client health score from five proxy signals (escalations, missed exec meetings, ticket age, last NPS, **value realisation**). Early warning between formal NPS surveys. Intervention playbook for below-threshold programmes. Tab subtitle: "Delivery excellence is the retention argument."

## 2. Role access

Unchanged from revision 2. Portfolio Owner primary, PM scoped, Finance Lead full, Read Only full read.

## 3. Data contract

Consumes: `client_signals`, `programmes`, `clients`, `value_realisation` NEW revision 3, `qbr_records` NEW revision 3.

Response: `ClientHealthResponse` with composite scores, radar data, signal matrix, intervention playbook, **value realisation per programme**.

## 4. User stories

Portfolio Owner catches Pegasus health slide 6 weeks before formal NPS surfaces it, driven by the value realisation signal declining first.
Commercial Lead uses client health plus value realisation trajectory to inform renewal probability on Helvetia.

## 5. KPIs (revised composite)

### 5.1 Composite score formula (revision 3)

```
composite_base = 100
  - min(escalations_90d, 10) * 3              # 0 to -30
  - missed_exec_meetings_90d * 10             # 0 to -40
  + ticket_trend_adjustment                   # -5 Worsening, 0 Flat, +5 Improving
  + (nps_last_value - 60) * 0.5               # -20 to +20 around NPS 60
  + value_realisation_adjustment              # NEW: -10 if outcome not achieved, 0 if partial, +10 if client-confirmed achieved
```

Clamped 0 to 100. Intervention modifier from revision 2 applied after base.

### 5.2 Worked example Pegasus

Base calculation:
`100 - (min(7,10) * 3) - (2 * 10) + (-5) + (41 - 60) * 0.5 + (-10 for value not achieved) = 100 - 21 - 20 - 5 - 9.5 - 10 = 34.5`

Intervention modifier: -3 (stuck in intervention 45 days). Adjusted: 34.5 - 3 = 31.5. Clamped display shows **32**.

Revision 3 change: adding value realisation as a signal pulls Pegasus from 41 to 32, a 9-point drop reflecting that Pegasus is not only miss-NPS but also miss-business-outcome.

## 6. Views and interactions

Filter bar, Signal Type filter, time window. Intelligence layer per Design Foundations 11.5 revision 3 (Value Realisation voice sample). **Five KPI cards** (same as rev 2). **Signal matrix now 5 columns** (added Value Realisation). **Radar chart now 5 axes**. Intervention playbook with expanded entries.

### 6.1 Signal matrix (5 columns per revision 3)

| Programme | Escalations 90d | Missed Exec | Ticket Age | Last NPS | **Value Realisation** | Composite | State |
|-----------|-----------------|-------------|------------|----------|------------------------|-----------|-------|
| Pegasus Healthcare | 7 (red) | 2 (red) | Worsening (red) | 41 (red) | **Not achieved (red)** | 32 | Intervene |
| Phoenix Pharma | 5 (red) | 2 (red) | Worsening (red) | 44 (red) | **Partial (amber)** | 42 | Intervene |
| Stellar Logistics | 4 (amber) | 1 (amber) | Worsening (amber) | 47 (amber) | **Partial (amber)** | 47 | Intervene |
| Orion Insurance | 3 (amber) | 1 (amber) | Worsening (amber) | 52 (amber) | **Partial (amber)** | 49 | Intervene |
| ... | ... | ... | ... | ... | ... | ... | ... |
| Helix Retail OMS | 0 (green) | 0 (green) | Improving (green) | 67 (green) | **Achieved client-confirmed (green)** | 82 | Healthy |

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Matrix row | Programme health history |
| Radar polygon | Programme-specific signals |
| Intervention card | Save-plan drawer with QBR link |
| **Value Realisation cell (NEW)** | QBR record with outcome attestation |

## 8. Intelligence layer rules (revised)

`tab_client_health.py` revision 3. Drivers now include value realisation signal. Actions from Align, Realign, Commit, **Book** (QBR), **Recover** (outcome plan). Hub voice: "delivery excellence is the retention argument. Execution green and outcome amber is still amber."

## 9. Non-functional

Composite calc under 50 ms. Radar SVG under 150 ms.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/client-health/signal-matrix` | 5-signal matrix including value realisation |
| GET | `/api/v1/client-health/radar` | 5-axis radar data |
| GET | `/api/v1/client-health/intervention-playbook` | Below-threshold programmes |
| GET | `/api/v1/value-realisation/per-programme` | NEW. Programme-level value realisation detail |
| GET | `/api/v1/intelligence/client_health` | What Why Act |

## 11. Error and empty states

No value realisation captured yet → "Start quarterly value reviews" prompt with QBR template link.

## 12. Accessibility

Radar data table alternative. State chips HEALTHY, WATCH, INTERVENE. Value realisation cell uses text plus colour.

## 13. Test acceptance

Playwright: Pegasus composite 32 INTERVENE, 5-signal matrix displays, radar polygon with 5 axes, intervention card flags SLA breach plus value-not-achieved. Formula reproducibility test.

## 14. Release gating

Wireframe v1_15 revision 3 parity. Composite formula revision 3 validated.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-1 Value Realisation gap as composite input plus standalone drill.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 New section: Client-scoped Stakeholder Influence (UC-R)

Rendered below the existing composite-health panels. Per-client filtered view of `stakeholder_influence` rows. Quadrant chart same pattern as v1_16 Governance Operating Model but filtered to client-external stakeholders only (rows where `stakeholder_external_org IS NOT NULL`).

X is influence_score, Y is support_score. Bubble size by decision_maker_flag. Bubble colour by sentiment_trend. Hover shows name, external org, last interaction, narrative.

Cross-link banner: "For the full cross-programme Stakeholder Influence Map including internal stakeholders, see Governance Operating Model v1_16."

### R4.2 New KPI: Client-Stakeholder Opposition Count

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Opposition Stakeholders Count | `Count(stakeholder_influence WHERE support_score below 0 AND decision_maker_flag AND stakeholder_external_org IS NOT NULL) per client` | 2 on Atlas (red) | 0 (green) | 0 | At or above 2 | PRD-local at v1 |

### R4.3 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Opposition Stakeholders KPI | Client-scoped Stakeholder Influence panel |
| Quadrant bubble | Stakeholder detail with interaction history |
| Opposition bubble (support below 0 AND decision_maker) | Action drawer "Book 1-on-1 with the sponsor" prompt |
| Banner link | v1_16 Governance Operating Model Stakeholder Influence Map (full view) |

### R4.4 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/client-health/stakeholder-influence?client_id={id}` | Client-scoped external stakeholders |
| GET | `/api/v1/client-health/opposition-count?client_id={id}` | Opposition stakeholders count |

### R4.5 Intelligence layer rules (revision 4 additions)

`tab_client_health.py` revision 4. New trigger:
- Opposition stakeholders count above 1 for a client: action "Per S06P10, loudest stakeholder wins. Book 1-on-1 with each opposition decision-maker within 14 days."

### R4.6 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with Client-scoped Stakeholder Influence panel.
2. Two new endpoints contract-match.
3. Client filter correctly scopes external stakeholders only.
4. Cross-link banner navigates to v1_16.
5. Playwright scenario: Atlas Banking client view shows 2 opposition stakeholders in red, drill opens stakeholder detail.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Adds UC-R client-scoped stakeholder influence with cross-link to v1_16.*
