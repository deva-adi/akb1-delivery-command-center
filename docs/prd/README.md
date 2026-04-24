# Product Requirements Documents
### AKB1 Delivery Command Center v1

Eighteen PRD files planned. One master, fourteen tab PRDs, three cross-cutting PRDs.

## File list (planned)

| # | File | Scope | Status |
|---|------|-------|--------|
| 00 | 00_PRD_Master.md | Product vision, target users, success metrics, high-level architecture | Planned |
| 01 | 01_PRD_Data_Model.md | Schema, 10 programmes and 300 people seed, drill paths, data contracts | Planned |
| 02 | 02_PRD_Intelligence_Layer.md | What Why Act engine, rules per tab, LLM fallback policy | Planned |
| 03 | 03_PRD_Security_Auth.md | Four roles, RBAC, row-level security, audit log, phase 1 versus phase 2 | Planned |
| 04 | 04_PRD_Tab_01_Executive.md | Executive Overview tab | Planned |
| 05 | 05_PRD_Tab_02_Delivery_Health.md | Delivery Health tab | Planned |
| 06 | 06_PRD_Tab_03_Risk_RAID.md | Risk and RAID tab | Planned |
| 07 | 07_PRD_Tab_04_Workforce.md | Workforce Intelligence tab | Planned |
| 08 | 08_PRD_Tab_05_Financials.md | Financials tab | Planned |
| 09 | 09_PRD_Tab_06_PnL_Cockpit.md | P and L Cockpit tab | Planned |
| 10 | 10_PRD_Tab_07_Flow_Velocity.md | Flow and Velocity tab | Planned |
| 11 | 11_PRD_Tab_08_AI_Innovation.md | AI and Innovation tab | Planned |
| 12 | 12_PRD_Tab_09_Commercial.md | Commercial Pipeline tab | Planned |
| 13 | 13_PRD_Tab_10_Backlog_Health.md | Backlog Health tab | Planned |
| 14 | 14_PRD_Tab_11_Scenario_Planner.md | Scenario Planner tab | Planned |
| 15 | 15_PRD_Tab_12_Ops_SLA.md | Ops and SLA tab | Planned |
| 16 | 16_PRD_Tab_13_Multi_Vendor.md | Multi-Vendor Scorecard tab | Planned |
| 17 | 17_PRD_Tab_14_Change_Impact.md | Change Impact tab | Planned |
| 18 | 18_PRD_Tab_15_Client_Health.md | Client Health Radar tab | Planned |

## PRD template (every file follows this)

Each PRD contains the following sections in order:

Section 1 Scope and goals. Section 2 Target user and role access. Section 3 Data contract (endpoints consumed, shapes). Section 4 User stories. Section 5 KPIs, formulas, with two worked examples each. Section 6 Views and interactions. Section 7 Drill paths (up, down, through, across) with data resolution. Section 8 Intelligence layer rules (What Why Act). Section 9 Non-functional requirements. Section 10 Endpoints and OpenAPI references. Section 11 Error and empty states. Section 12 Accessibility requirements. Section 13 Test acceptance criteria. Section 14 Release gating.

## Constraints

PRD and OpenAPI stay in lockstep. Any endpoint change requires PRD update in the same commit. CI diffs OpenAPI against PRD Section 10 and fails on mismatch.

---

*Folder owner: Claude. Populated during Milestone M2 after wireframe signoff.*
