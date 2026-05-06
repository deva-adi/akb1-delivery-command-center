# 00_PRD_Master.md
### AKB1 Delivery Command Center v1 | Master PRD | Revision 3 | Updated: 2026-04-25

> Revision 3 absorbs the 50-UC implementation plan approved as Option 1 Full. Tab inventory grows from 15 to 18 (3 new primary tabs: Governance Operating Model, Capability and Supply Chain, AI Governance). Three cross-cutting surfaces added (Audit Trail Explorer Console, Board Pack export variant, First 90 Days Onboarding). Role taxonomy expands with Delivery Director, HR Business Partner, and Audit Permission flag. PRD count grows from 23 to 28. Data Model at revision 4 with 86 total entities and the 60-metric threshold calibration register. Launch date 2026-06-10 retained. Revision 2 content preserved below unchanged.
>
> Revision 2 incorporated all self-check findings: realistic performance targets with CDN and caching enablers, observability requirement, role-scoped 5-tab primary nav, four new PRDs (Notifications, Exports, History, Search). Replaced revision 1.

---

## 1. Product vision

AKB1 Delivery Command Center is the portfolio intelligence platform for delivery leaders running multi-programme, multi-geo IT services engagements. It unifies delivery, financial, commercial, workforce, vendor, and client signals into one decision cockpit. Every tab carries a three-question intelligence layer: What does this tell me, Why is this happening, What do I do this week. Ships open source AGPL-3 at v1.0.0 with a LinkedIn launch.

### 1.1 Primary differentiator

Decision cockpit, not dashboard. Intelligence layer is the core value proposition. Every tab must convert raw metrics into a prescriptive weekly action list with named owners and explicit deadlines.

## 2. Target users and roles

Unchanged four roles from revision 1. Portfolio Owner, Programme Manager, Finance Lead, Read Only.

## 3. Real-world delivery problems solved

Ten problems unchanged. Mapped directly into tab features.

## 4. Success metrics for v1.0.0 (revised)

| Metric | Target at launch | Rationale |
|--------|------------------|-----------|
| Self-host deployment time | Under 10 minutes from `docker compose up` to first tab loaded | Lower adoption barrier |
| Intelligence layer coverage | 100 percent of tabs carry all three zones | Core value prop |
| Drill integrity | Every card drills to backed data, zero mock strings | v5.8 lesson |
| **Primary nav cognitive load** | **Maximum 5 tabs visible per role on primary nav** | Self-check severity-1 End User fix |
| Test coverage | pytest 80 percent, Vitest 80 percent, Playwright 100 percent pass | Regression gates |
| **Performance target 100 concurrent** | **p95 under 600 ms with CDN plus Redis response cache** | Realistic with architectural enablers |
| **Performance target 500 concurrent** | **p95 under 1200 ms green, under 1500 ms amber** | Measured ceiling |
| **Performance target 1000 concurrent** | **p95 under 2500 ms amber acceptable** | Self-host primary use case |
| Accessibility | axe-core zero WCAG AA violations | Enterprise adopter requirement |
| **Observability** | **Structured JSON logs, Prometheus metrics endpoint, OpenTelemetry trace hooks, error capture** | Production readiness (NEW) |
| Exports | PowerPoint and Excel export functional on every chart and table | Self-check severity-1 End User fix |
| LinkedIn launch engagement | 500+ reactions on announcement, 50+ GitHub stars first week | Reputation signal |
| First external contributor PR | Within 30 days of public flip | Open source health |

## 5. Tech stack reference

Locked in D-003 and `docs/architecture/01_ADR_Tech_Stack.md`. Next.js 14 App Router, FastAPI, Postgres 16, Redis 7, Docker with Docker Compose locally and Fly.io or Render hosted. Intelligence layer via LiteLLM proxy to local Ollama with OpenAI fallback, rules-only default.

### 5.1 Architectural enablers for performance targets (revised)

Realistic performance requires these enablers documented in `docs/architecture/`:
- CDN in front of Next.js static bundles (Cloudflare or platform CDN)
- Redis cache on all GET API responses with 60-second TTL
- HTTP/2 via Caddy in Phase 2
- Postgres connection pool sized appropriately (asyncpg)
- Tailwind production build (not CDN) to satisfy strict CSP
- Query-level indexes per PRD tab documentation

## 6. Tab library (revised, D-015)

Fifteen substantive tabs plus master index. Role-scoped primary navigation with up to 5 tabs visible per role. All 15 tabs accessible via secondary More menu and drill affordances.

### 6.1 Per-role primary nav

| Role | 5 primary tabs | Full library access |
|------|----------------|--------------------|
| Portfolio Owner | Executive, Risk and RAID, Financials, Workforce, Client Health Radar | Via More menu |
| Programme Manager | Delivery Health, Risk and RAID, Backlog Health, Flow and Velocity, Ops and SLA | Via More menu |
| Finance Lead | Financials, P and L Cockpit, Commercial Pipeline, Change Impact, Scenario Planner | Via More menu |
| Read Only | Executive, Delivery Health, Financials, Risk and RAID, Ops and SLA | Read-scoped via More menu |

### 6.2 Full tab catalogue

| Cluster | Tab | PRD file |
|---------|-----|---------|
| Leadership | Executive Overview | `04_PRD_Tab_01_Executive.md` |
| Leadership | Delivery Health | `05_PRD_Tab_02_Delivery_Health.md` |
| Leadership | Risk and RAID | `06_PRD_Tab_03_Risk_RAID.md` |
| Leadership | Workforce Intelligence | `07_PRD_Tab_04_Workforce.md` |
| Leadership | Financials | `08_PRD_Tab_05_Financials.md` |
| Leadership | P and L Cockpit | `09_PRD_Tab_06_PnL_Cockpit.md` |
| Operations | Flow and Velocity | `10_PRD_Tab_07_Flow_Velocity.md` |
| Operations | AI and Innovation | `11_PRD_Tab_08_AI_Innovation.md` |
| Operations | Commercial Pipeline | `12_PRD_Tab_09_Commercial.md` |
| Operations | Backlog Health | `13_PRD_Tab_10_Backlog_Health.md` |
| Operations | Scenario Planner | `14_PRD_Tab_11_Scenario_Planner.md` |
| Operations | Ops and SLA | `15_PRD_Tab_12_Ops_SLA.md` |
| Deep Dive | Multi-Vendor Scorecard | `16_PRD_Tab_13_Multi_Vendor.md` |
| Deep Dive | Change Impact | `17_PRD_Tab_14_Change_Impact.md` |
| Deep Dive | Client Health Radar | `18_PRD_Tab_15_Client_Health.md` |

### 6.3 Cross-cutting surfaces (NEW PRDs per D-014, D-015 severity-1)

| Surface | PRD file |
|---------|----------|
| Notifications and daily digest | `19_PRD_Notifications_Digest.md` |
| Exports and steerco pack | `20_PRD_Exports_Steerco_Pack.md` |
| History and point-in-time view | `21_PRD_History_Snapshots.md` |
| Search command palette | `22_PRD_Search_Command_Palette.md` |

Total PRD count: 23 (was 19 in revision 1).

## 7. Cross-cutting features inherited by every tab

Same as revision 1 plus: role-scoped primary nav (section 6.1), notifications bell, search command palette, history toggle, export menu on every table and chart, as-of date in filter bar.

## 8. Release plan summary (revised dates)

Dates shifted 3 days later to accommodate expanded scope (exports, new surfaces).

| Milestone | Revised target | Gate |
|-----------|---------------|------|
| M1 Wireframes | 2026-04-26 | All 16 wireframes signed off (revision 2) |
| M2 PRDs | 2026-04-28 | All 23 PRDs signed off |
| M3 Architecture | 2026-04-30 | 7 architecture docs signed off |
| M4 Test Strategy | 2026-05-01 | 9 test plans signed off |
| M5 Subagents | 2026-05-02 | 9 subagent spec files ready |
| M6 Backend | 2026-05-15 | FastAPI alpha, pytest green, OpenAPI generated |
| M7 Frontend | 2026-05-27 | Next.js alpha, Vitest green, 15 tabs plus new surfaces render |
| M8 Integration and QA | 2026-06-05 | Playwright, axe, benchmark, security scan green |
| M9 v1.0.0 release | 2026-06-10 | Tag, public flip, LinkedIn launch |

## 9. Data foundation (unchanged summary)

10 programmes, 300 people (pyramid B1 to B5), 25 vendors, 12 months rolling financials, 150 RAID open, 60 SLA metrics, 100 change requests. Full schema in `01_PRD_Data_Model.md` revision 2.

## 10. Dependencies (unchanged)

Python 3.12, Node 20 LTS, Postgres 16, Redis 7, Docker 26+, Playwright, pytest, Vitest, axe-core. Optional Ollama, LiteLLM proxy.

## 11. Out of scope for v1.0.0 (revised)

| Item | Rationale |
|------|-----------|
| Predictive ML models beyond rule-based | v2, needs historic data |
| Mobile app | Not a phone product |
| Multi-tenant SaaS operation | v2, infrastructure hardening |
| Real integrations (Jira, Salesforce, Workday) | Seed only in v1 |
| Custom dashboard builder | v2 |
| Internationalisation beyond English | v1.1 |
| Formal SOC2 / ISO / HIPAA certification | Post-v1.1. SOC2-lite documented per D-016. |
| Light mode toggle | v1.1. Default palette Option D per D-018. |
| Collaboration (comments, annotations) | v1.1 |
| Mobile-responsive below tablet 768px | Desktop first |

## 12. Open questions

Unchanged. Shadcn UI scope, Postgres managed service recommendation, telemetry policy.

## 13. Acceptance criteria for v1.0.0

Revision 2 criteria:
All 15 tabs render with intelligence layer on every tab.
Role-scoped primary nav at 5 tabs per role, More menu functional.
Seed generator produces identical output across machines.
Four roles enforce view access correctly.
Playwright E2E 100 percent pass.
axe-core zero WCAG AA violations.
Locust 100 and 500 concurrent green, 1000 amber allowed.
Security scan no critical CVEs.
Docker compose up completes in under 60 seconds.
Public README, SECURITY, PRIVACY, LICENSE in place.
LinkedIn launch kit complete.
**Audit log writes observable in Phase 1.**
**CSRF, CORS, rate limiting active in Phase 1.**
**Observability endpoints (`/metrics`, structured logs, trace hooks) functional.**
**Exports (PowerPoint and Excel) functional on every chart and table.**
**Notifications, search, history functional.**

## 14. Release gating

Milestone M9 closes when all criteria in section 13 are met and Adi signs off the release notes.

---

*Revision 2 owner: Claude. Signoff: Adi. Depends on Design Foundations revision 2 and PRDs 01 through 22 revision 2.*

---

## Revision 3 amendments (2026-04-25)

Revision 2 content above is preserved. Revision 3 additions follow.

### R3.1 Target users and roles (revised)

| Role | Scope | New at rev 3 |
|------|-------|---------------|
| Portfolio Owner (PO) | Full cross-portfolio read and write within own remit | No |
| Delivery Director (DD) | Read across all programmes in own delivery org; write scoped to delivery governance artefacts | Yes |
| Programme Manager (PM) | Read and write scoped to own programmes | No |
| Finance Lead (FL) | Read and write on financial and commercial entities | No |
| HR Business Partner (HRBP) | Read on people and capability surfaces plus First 90 Days Onboarding | Yes |
| Read Only (RO) | Read-only scoped | No |
| Audit Permission (AP, flag) | Additive flag on PO, DD, or FL. Grants full read on `audit_trail_entries` plus AI governance audit-scope entities | Yes |

The AP flag is provisioned through SSO group membership or local admin provisioning for on-prem installs. Auth binding detailed in `03_PRD_Security_Auth.md` rev 3.

### R3.2 Tab library (revised, 18 primary tabs)

Three new primary tabs added. Total tab count grows from 15 to 18.

| Cluster | Tab | PRD file | Status at rev 3 |
|---------|-----|---------|-----------------|
| Leadership | Executive Overview | `04_PRD_Tab_01_Executive.md` | Rev 4 cascade in Phase 4 |
| Leadership | Delivery Health | `05_PRD_Tab_02_Delivery_Health.md` | Rev 4 cascade |
| Leadership | Risk and RAID | `06_PRD_Tab_03_Risk_RAID.md` | Rev 2 cascade |
| Leadership | Workforce Intelligence | `07_PRD_Tab_04_Workforce.md` | Rev 4 cascade |
| Leadership | Financials | `08_PRD_Tab_05_Financials.md` | Rev 4 cascade |
| Leadership | P and L Cockpit | `09_PRD_Tab_06_PnL_Cockpit.md` | Rev 4 cascade |
| Operations | Flow and Velocity | `10_PRD_Tab_07_Flow_Velocity.md` | Rev 2 cascade |
| Operations | AI and Innovation | `11_PRD_Tab_08_AI_Innovation.md` | Rev 4 cascade (cross-links to AI Governance tab) |
| Operations | Commercial Pipeline | `12_PRD_Tab_09_Commercial.md` | Rev 4 cascade |
| Operations | Backlog Health | `13_PRD_Tab_10_Backlog_Health.md` | Unchanged (no UC calls for expansion) |
| Operations | Scenario Planner | `14_PRD_Tab_11_Scenario_Planner.md` | Rev 4 cascade |
| Operations | Ops and SLA | `15_PRD_Tab_12_Ops_SLA.md` | Rev 4 cascade |
| Deep Dive | Multi-Vendor Scorecard | `16_PRD_Tab_13_Multi_Vendor.md` | Rev 4 cascade |
| Deep Dive | Change Impact | `17_PRD_Tab_14_Change_Impact.md` | Rev 4 cascade |
| Deep Dive | Client Health Radar | `18_PRD_Tab_15_Client_Health.md` | Rev 4 cascade |
| **Governance** | **Governance Operating Model (NEW)** | **`23_PRD_Tab_16_Governance_Operating_Model.md`** | **Phase 3 authoring** |
| **Governance** | **Capability and Supply Chain (NEW)** | **`24_PRD_Tab_17_Capability_Supply_Chain.md`** | **Phase 3 authoring** |
| **Governance** | **AI Governance (NEW)** | **`25_PRD_Tab_18_AI_Governance.md`** | **Phase 3 authoring** |

New cluster "Governance" introduced for the 3 new tabs. Distinct from Operations because director-altitude surfaces, not operational workstream views.

### R3.3 Per-role primary nav (revised for rev 3)

The rev 2 nav in section 6.1 stands for PO, PM, FL, RO. Revision 3 updates PO and RO primary nav to surface Governance Operating Model and Capability and Supply Chain. Adds primary nav for DD and HRBP.

| Role | 5 primary tabs |
|------|----------------|
| Portfolio Owner | Executive, Governance Operating Model, Financials, Capability and Supply Chain, Client Health Radar |
| Delivery Director | Executive, Governance Operating Model, Delivery Health, Capability and Supply Chain, Ops and SLA |
| Programme Manager | Delivery Health, Flow and Velocity, Governance Operating Model, Risk and RAID, Ops and SLA |
| Finance Lead | Financials, P and L Cockpit, Commercial Pipeline, Scenario Planner, Change Impact |
| HR Business Partner | Capability and Supply Chain, Workforce Intelligence (scoped), Executive (read-only), First 90 Days Onboarding surface, Notifications |
| Read Only | Executive, Delivery Health, Financials, Governance Operating Model, Client Health Radar |

All 18 tabs accessible via More menu regardless of role, subject to access matrix in `01_PRD_Data_Model.md` section 3.1.10.

### R3.4 Cross-cutting surfaces (revised, 7 total)

Revision 2 named 4 cross-cutting surfaces. Revision 3 adds 3 more.

| Surface | PRD file | New at rev 3 |
|---------|----------|---------------|
| Notifications and daily digest | `19_PRD_Notifications_Digest.md` | No (rev up to 2) |
| Exports and steerco pack | `20_PRD_Exports_Steerco_Pack.md` | No (rev up to 2, adds Board Pack and Pre-Read Kit variants) |
| History and point-in-time view | `21_PRD_History_Snapshots.md` | No (rev up to 2) |
| Search command palette | `22_PRD_Search_Command_Palette.md` | No (rev up to 2) |
| **Audit Trail Explorer Console** | **`26_PRD_Audit_Trail_Console.md`** | **Yes** |
| **First 90 Days Onboarding** | **`27_PRD_Onboarding_First_90_Days.md`** | **Yes** |
| **Board Pack export variant** | Folded into `20_PRD_Exports_Steerco_Pack.md` rev 2 | Partial (same PRD file, new variant) |

Total PRD count at rev 3: **28** (was 23 in revision 2).

PRD inventory:
- `00_PRD_Master.md` (this file, rev 3)
- `01_PRD_Data_Model.md` (rev 4)
- `02_PRD_Intelligence_Layer.md` (rev 3 in Phase 2 follow-up)
- `03_PRD_Security_Auth.md` (rev 3 in Phase 2 follow-up)
- `04` through `18` are the 15 existing tab PRDs (12 at rev 4 cascade, 2 at rev 2 cascade, 1 unchanged)
- `19` through `22` are cross-cutting surfaces (all rev 2)
- `23`, `24`, `25` are new tab PRDs for v1_16, v1_17, v1_18 (Phase 3)
- `26`, `27` are new cross-cutting PRDs (Phase 3 or Phase 7)

### R3.5 Data foundation at rev 3 of Master PRD

Data Model PRD is at revision 4. Entity count approximately 86. Seed row count approximately 30,100. 60-metric threshold calibration register seeded. Schema in `01_PRD_Data_Model.md` revision 4 sections 3.1 and 4.23 through 4.73.

### R3.6 Success metrics additions at rev 3

Revision 2 success metrics table stands. Revision 3 adds the following:

| Metric | Target at launch | Rationale |
|--------|------------------|-----------|
| Governance cadence coverage | 100 percent of programmes carry 4 seeded cadences in `governance_cadence` | UC-A1 compliance |
| Escalation contract freshness | Zero programmes with contracts older than 180 days at launch | R4 threshold calibration |
| EVM coverage | CPI and SPI computed for every programme every month | S08P6 Hub commitment |
| AI risk tier classification | Every AI use case tagged Green, Amber, or Red at launch seed | S03 governance spine |
| Audit trail coverage | Every mutation on governance, escalation, financial, and AI entities writes to `audit_trail_entries` | Full forensic posture |
| Threshold register coverage | 60 metrics seeded with green, amber, red thresholds; no hardcoded thresholds in code | Lint rule enforces |
| First 90 Days Onboarding coverage | Surface renders for every seeded user with at least one week of items | UC-H |

### R3.7 Release plan updated dates

Milestone dates shift slightly to accommodate Phase 3 through Phase 9 work but 2026-06-10 launch is preserved.

| Milestone | Revision 3 target | Gate |
|-----------|-------------------|------|
| M1 Wireframes (rev 4) | 2026-05-02 | All 19 wireframes signed off (16 existing to rev 4 plus 3 new tabs plus 3 new cross-cutting wireframes) |
| M2 PRDs (rev 4) | 2026-05-04 | All 28 PRDs signed off |
| M3 Architecture | 2026-05-05 | 7 architecture docs plus Design Foundations rev 4 signed off |
| M4 Test Strategy (rev 2) | 2026-05-07 | 14 test plan docs (9 existing plus 5 new) signed off |
| M5 Subagents (rev 2) | 2026-05-08 | 9 subagent specs updated for rev 4 scope |
| M6 Backend | 2026-05-22 | FastAPI alpha, pytest green, approximately 135 endpoints, OpenAPI generated |
| M7 Frontend | 2026-06-02 | Next.js alpha, Vitest green, 18 tabs plus 7 cross-cutting surfaces render |
| M8 Integration and QA | 2026-06-07 | Playwright, axe, benchmark, security scan green |
| M9 v1.0.0 release | 2026-06-10 | Tag, public flip, LinkedIn launch |

### R3.8 Acceptance criteria additions at rev 3

Revision 2 criteria stand. Revision 3 adds:

- All 18 tabs render with intelligence layer on every tab (was 15 at rev 2).
- Governance Operating Model tab surfaces Cadence Calendar, RACI Matrix, Escalation Contract, Steerco Pre-Read Kit, Weekly Commitment Review, Sponsor Engagement Score, Decision Queue with extended columns, Stakeholder Influence Map.
- Capability and Supply Chain tab surfaces Bench Deep Dive, Skills Heat Map, Bench-to-Demand Match, DM Succession Picture, Hiring Funnel.
- AI Governance tab surfaces AI Risk Tier Matrix, Quality Gates per tier, Governance Cadence, Shadow IT Survey, Five Problems AI Cannot Solve, Delivery Speed Gap.
- Audit Trail Explorer Console is accessible from every tab More menu and renders the append-only audit log with filters.
- First 90 Days Onboarding surface is accessible on first login for new users and visible to PO, DD, HRBP, and own-programme PM for other users.
- Board Pack export variant generates a 5-slide director-facing deck distinct from the Steerco Pack.
- Steerco Pre-Read Kit export generates a 4-column decision pre-read per programme.
- DD and HRBP roles and Audit Permission flag are auth-gated correctly per role access matrix.
- Tier display labels in every escalation surface read from `escalation_tier_config` at render time.
- 60-metric threshold calibration register is seeded and every intelligence layer rule reads from it.

### R3.9 Revision 3 closure

Revision 3 signs off when the tab inventory at 18 is accepted, the 7 cross-cutting surface list is accepted, the role taxonomy with DD and HRBP and AP flag is accepted, and the release plan dates in R3.7 are approved. Once signed off, Phase 3 authors the three new tab PRDs citing Data Model rev 4 and Design Foundations rev 4 as authoritative sources.

---

*Revision 3 owner: Claude. Signoff: Adi (pending Phase 2 close review). Depends on Design Foundations revision 4 and Data Model PRD revision 4.*
