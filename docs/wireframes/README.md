# Wireframes
### AKB1 Delivery Command Center v1

Self-contained HTML wireframes. Each file opens in a browser standalone. No build step, no external assets, no CDN dependencies in final versions.

## File list (planned)

| # | File | Tab | Source | Status |
|---|------|-----|--------|--------|
| 00 | v1_00_Index.html | Master index, links to all tabs | New | Planned |
| 01 | v1_01_Executive.html | Executive Overview | v5.8 Foil A | Planned |
| 02 | v1_02_Delivery_Health.html | Delivery Health | v5.8 Foil A | Planned |
| 03 | v1_03_Risk_RAID.html | Risk and RAID | v5.8 Foil A | Planned |
| 04 | v1_04_Workforce_Intelligence.html | Workforce Intelligence (Bench, Pyramid, Attrition) | v5.8 Foil A | Planned |
| 05 | v1_05_Financials.html | Financials | v5.8 Foil A | Planned |
| 06 | v1_06_PnL_Cockpit.html | P and L Cockpit | v5.8 Foil A, v5.8.0 module | Planned |
| 07 | v1_07_Flow_Velocity.html | Flow and Velocity | v5.8 Foil B | Planned |
| 08 | v1_08_AI_Innovation.html | AI and Innovation | v5.8 Foil B | Planned |
| 09 | v1_09_Commercial_Pipeline.html | Commercial Pipeline | v5.8 Foil B | Planned |
| 10 | v1_10_Backlog_Health.html | Backlog Health | v5.8 Foil B | Planned |
| 11 | v1_11_Scenario_Planner.html | Scenario Planner | v5.8 Foil B | Planned |
| 12 | v1_12_Ops_SLA.html | Ops and SLA | v5.8 Foil B | Planned |
| 13 | v1_13_Multi_Vendor_Scorecard.html | Multi-Vendor Scorecard | NEW | Planned |
| 14 | v1_14_Change_Impact.html | Change Impact | NEW | Planned |
| 15 | v1_15_Client_Health_Radar.html | Client Health Radar | NEW | Planned |

Total: 16 files.

## Quality benchmark

Each wireframe must match or exceed the quality of v5.8 Foil A (`v5.8_Wireframe_A_Leadership.html`, 684 lines) and Foil B (`v5.8_Wireframe_B_Operations.html`, 618 lines) in the AKB1 Base workspace at `14_Docs/`.

## Mandatory wireframe elements per tab

| Element | Purpose |
|---------|---------|
| Header with tab name, filter bar, and role indicator | Establishes tab identity and active filter context |
| What does this tell me section | Three sentence descriptive summary |
| Why is this happening section | Top three drivers ranked by contribution |
| What do I do this week section | Three prescriptive actions with owner and deadline |
| Primary KPI row | Three to five headline KPIs with sparkline and target delta |
| Charts or visualisations | Recharts-pattern mockups, never static images |
| Drill-down affordance | Every card or metric has a visible drill handle |
| Cross-tab links | Every tab links to at least two related tabs at the footer |
| Role gating indicator | Badge showing which role can see this tab |

## Constraints

No em dashes. No emojis. Typography: system font stack or Inter. Palette: AKB1 v5.8 compatible (dark navy primary, accent gold, status traffic lights). Self-contained HTML with inline CSS and inline JavaScript where necessary. No external dependencies in final versions.

## Review workflow

Wireframes are built in Cowork and presented to Adi for review. Adi signs off explicitly. Only then is Milestone M1 closed and M2 documentation work begins.

---

*Folder owner: Claude. Updated on every wireframe creation or revision.*
