# 11_PRD_Tab_08_AI_Innovation.md
### AI and Innovation Tab | AKB1 Delivery Command Center v1 | Revision 4 | Updated: 2026-04-25

> Revision 4 adds cross-link to v1_18 AI Governance (new primary tab at Master PRD rev 3). AI Innovation remains adoption-tracking (tool inventory, uplift, defect rate, AI-assist task percent). AI governance (risk tier, quality gates, cadence, shadow survey) moves to v1_18 per Wave 5 observation 3. Adds UC-MM Delivery Speed Gap overlay chart alongside existing productivity uplift. Revision 3 content preserved below unchanged.
>
> Revision 3 closed Hub severity-2 gap: separated AI hype from AI truth by adding AI-Originated Defect Rate (quality cost of AI-assisted delivery) and AI-Assist Task Percent per programme (adoption at workstream granularity, not tool granularity). Hub Proposition C Article 2 thesis: "AI uplift without defect attribution is a vanity metric." Replaced revision 2.

> Inherits from Master PRD, Data Model PRD, Intelligence Layer PRD, Security PRD, Design Foundations.

---

## 1. Scope and goals

AI adoption percent per programme, productivity uplift on AI-augmented tasks, tool inventory with KEEP DROP MERGE recommendations, automation coverage. **New in revision 3: AI-Originated Defect Rate and AI-Assist Task Percent per programme.** Innovation investment tracker. Exposes both upside (uplift, automation) and downside (defect attribution, rework) of AI adoption so margin decisions account for full cost of code.

## 2. Role access

| Role | Access |
|------|--------|
| Portfolio Owner | Full |
| Programme Manager | Scoped |
| Finance Lead | Headline plus cost savings plus defect cost |
| Read Only | Full read |

## 3. Data contract

Consumes: `ai_tools` revision 2, `ai_tool_usage` revision 2 with task_category and defect_link_id, `ai_defect_attribution` NEW revision 3. Programme adoption derived from tool usage aggregations.

Response: `AIInnovationResponse` with adoption per programme, uplift trend, tool inventory, **defect attribution per programme**, **AI-assist task percent per programme**, actions.

## 4. User stories

COO tracks AI productivity uplift against the 25 percent target quarterly.
Procurement Lead identifies tool sprawl savings opportunities.
Delivery Director spots Phoenix AI-originated defect rate at 14 percent (target below 8) and flags the unit testing gap to the CTO.
Portfolio Owner sees that Pegasus is 62 percent AI-assisted on tasks but also showing 17 percent AI-originated defect rate, signals the rework tax is eating the productivity gain.

## 5. KPIs (revised, seven up from five)

| KPI | Formula | Example 1 | Example 2 | Target | Alert |
|-----|---------|-----------|-----------|--------|-------|
| AI Adoption | `Workstreams Using AI / Eligible Workstreams x 100` | 68% | 54% | 80% | Below 60% |
| Productivity Uplift | `(AI Output - Baseline) / Baseline x 100 on AI tasks` | +23% | +18% | +25% | Below +15% |
| Active AI Tools | `Count of distinct tools with active licences` | 14 (target 7) | 11 | 7 | Above 10 |
| AI-Skilled HC | `People with AI Skill Badge / Total Headcount x 100` | 172/300 = 57% | 195/300 = 65% | 75% | Below 50% |
| Automation Coverage | `Automated Task Volume / Total Task Volume x 100` | 42% | 38% | 60% | Below 35% |
| **AI-Originated Defect Rate (NEW)** | `Defects with root_cause_category = AI_Generated_Code / Total Defects in period x 100` | Phoenix 14%, Pegasus 17%, Orion 6%, portfolio blended 11.2% | Helix 4%, Nova 3%, Atlas 5%, portfolio blended 4.0% | Below 8% | Above 12% |
| **AI-Assist Task Percent (NEW)** | `AI-assisted tasks completed in period / Total tasks completed in period x 100 per programme` | Pegasus 62%, Phoenix 58%, Stellar 44%, portfolio blended 51% | Helix 31%, Nova 28%, Atlas 35%, portfolio blended 31% | 50% to 70% band | Below 20% or above 80% |

Band interpretation for AI-Assist Task Percent: below 20 percent is underadoption, above 80 percent is overadoption with quality risk, the 50 to 70 percent band is the productivity sweet spot based on Hub Proposition C Article 2.

## 6. Views and interactions (revised)

Filter bar plus Tool Type filter plus As-of. Intelligence layer. **Seven KPI cards** in two-row grid. AI adoption per programme ranked bars. Productivity uplift trend 12 months. Tool inventory table. **New section: AI Defect Attribution per programme** showing AI-originated defect count, non-AI defect count, AI defect rate percent, linked rework effort days, linked margin impact. **New section: AI-Assist Task Percent per programme** ranked bars showing adoption at workstream granularity.

### 6.1 AI Defect Attribution table

| Programme | AI-origin defects | Non-AI defects | AI defect rate | Rework days | Margin impact |
|-----------|-------------------|----------------|----------------|-------------|---------------|
| Phoenix Pharma | 22 | 134 | **14% (amber)** | 48 | USD 112K |
| Pegasus Healthcare | 34 | 166 | **17% (red)** | 72 | USD 168K |
| Orion Insurance | 9 | 141 | 6% (green) | 18 | USD 42K |
| Stellar Logistics | 18 | 152 | **11% (amber)** | 34 | USD 78K |
| ... | ... | ... | ... | ... | ... |

### 6.2 AI-Assist Task Percent ranked bars

Horizontal bars per programme sorted descending, with coloured band overlay showing below-20 red, 20-to-50 amber, 50-to-70 green, 70-to-80 amber, above-80 red.

## 7. Drill paths (revised)

| From | To |
|------|-----|
| Programme adoption bar | Tool usage by workstream |
| Tool row | Licence consumption detail |
| Uplift trend spike | Category breakdown |
| **AI Defect row (NEW)** | Defect list filtered to AI-origin for that programme with rework cost link |
| **AI-Assist bar (NEW)** | Task list showing AI-assisted vs non-AI-assisted split |

## 8. Intelligence layer rules (revised)

`tab_ai_innovation.py` revision 3. Drivers now include AI defect rate contribution and AI over-adoption contribution. Actions from Consolidate, Launch, Upskill, **Attribute** (new, assign defects to AI origin with code review evidence), **Rebalance** (new, flag programmes above 80 percent AI-assist for quality review). Hub voice from Proposition C Article 2 on AI uplift vs rework tax.

## 9. Non-functional

Tool inventory query under 150 ms for 14 tools. AI defect attribution query under 200 ms for 10 programmes.

## 10. Endpoints (revised)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/ai/adoption-per-programme` | Ranked bars |
| GET | `/api/v1/ai/productivity-uplift?months=12` | Trend |
| GET | `/api/v1/ai/tool-inventory` | Tool table |
| GET | `/api/v1/ai/defect-attribution-per-programme` | NEW. AI-origin defect rate with rework cost |
| GET | `/api/v1/ai/assist-task-percent-per-programme` | NEW. Adoption at workstream granularity |
| GET | `/api/v1/intelligence/ai_innovation` | What Why Act |

## 11. Error and empty states

No AI usage data yet → "AI tooling not yet onboarded" state.
No defect attribution captured → "Enable AI defect attribution in code review workflow" prompt with integration link.

## 12. Accessibility

Adoption bars have text value and aria labels. Action chips have text. AI defect rate cells use text plus colour. AI-assist bars have numeric value plus band indicator.

## 13. Test acceptance

Playwright: 3 programmes flagged below 40 percent AI adoption, tool inventory shows DROP chip on 3 tools, consolidation saves dollar amount visible, Phoenix AI-originated defect rate 14 percent visible, Pegasus AI-assist task percent 62 percent in green band.

## 14. Release gating

Wireframe v1_08 revision 3 parity. AI defect attribution entity seeded per Data Model revision 3. Code review workflow defect tagging integration stubbed for M7.

---

*Revision 3 owner: Claude. Signoff: Adi. Closes Hub severity-2 AI-Originated Defect Rate and AI-Assist Task Percent gap.*

---

## Revision 4 amendments (2026-04-25)

Revision 3 content above preserved. Revision 4 additions follow.

### R4.1 Scope boundary clarification

v1_08 AI Innovation is adoption-tracking. v1_18 AI Governance is policy-enforcement. The two tabs are distinct and cross-link:

| Lives in v1_08 AI Innovation | Lives in v1_18 AI Governance |
|------------------------------|-------------------------------|
| AI tool inventory | AI risk tier classification |
| Tool adoption rate | Quality gates per use case |
| Productivity uplift percent | Governance reporting cadence |
| AI-Originated Defect Rate | Shadow IT survey |
| AI-Assist Task Percent | Five Problems AI Cannot Solve |
| (new) Delivery Speed Gap overlay | (duplicates surface) Delivery Speed Gap |

Banner at top of v1_08 for PO and DD: "AI governance (risk tier, quality gates, shadow survey) lives on AI Governance tab. See v1_18 for audit-scoped detail."

### R4.2 New KPI: Delivery Speed Gap Points (UC-MM overlay)

Added to v1_08 with shared source to v1_18. The Hub pattern (S02P4) is that AI productivity is up but delivery speed is flat. Same metric, two surfaces: v1_08 shows it in the adoption context, v1_18 shows it in the governance context.

| KPI | Formula | Example 1 | Example 2 | Target (Green) | Alert (Red) | metric_id |
|-----|---------|-----------|-----------|----------------|-------------|-----------|
| Delivery Speed Gap Points | `ai_delivery_speed_gap.gap_points (latest month portfolio average)` | 18 points (amber; productivity up 25, delivery up 7) | 6 points (green) | Below 10 | At or above 25 | `ai_delivery_speed_gap_points` |

### R4.3 New section: Productivity vs Delivery Speed Overlay

New chart rendered above the existing Productivity Uplift card. Dual-line 12-month time series. Line 1 is individual productivity uplift percent. Line 2 is delivery speed change percent. Gap between lines shaded. When gap exceeds 25 points, shading turns red.

Click the chart opens v1_18 AI Governance Delivery Speed Gap panel with programme detail.

### R4.4 Drill paths (revision 4 additions)

| From | To |
|------|-----|
| Banner link "See v1_18 for audit-scoped detail" | v1_18 AI Governance tab |
| Delivery Speed Gap KPI | Overlay chart |
| Overlay chart | v1_18 Delivery Speed Gap panel with programme detail |
| AI-Originated Defect row | v1_02 Delivery Health defect detail for the programme |

### R4.5 Endpoints (revision 4 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/ai-innovation/delivery-speed-gap` | Overlay chart data |
| GET | `/api/v1/ai-innovation/delivery-speed-gap?programme={code}&months=12` | Single-programme trend |

### R4.6 Intelligence layer rules (revision 4 additions)

`tab_ai_innovation.py` revision 4. New trigger:
- Delivery Speed Gap above 25 points: action "Individual productivity is up but throughput is flat. Review handoffs, governance, communications, tech debt, and team structure per the five AI cannot solve. Details on v1_18."

### R4.7 Release gating (revision 4 additions)

Tab revision 4 ships when:
1. Wireframe cascades to rev 4 with banner and overlay chart.
2. Two new endpoints contract-match.
3. Delivery Speed Gap numeric matches v1_18 AI Governance source.
4. Cross-link verified; clicks on banner open v1_18.
5. Playwright scenario: login as PO, overlay chart shows gap 18 points amber, click opens v1_18.

---

*Revision 4 owner: Claude. Signoff: Adi (pending). Cross-link to v1_18 AI Governance; adds UC-MM overlay chart.*
