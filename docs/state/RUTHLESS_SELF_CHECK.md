# RUTHLESS_SELF_CHECK.md
### AKB1 Delivery Command Center v1 | Three-Persona Ruthless Review | Created: 2026-04-24

> Self-evaluation of the M1 wireframes plus M2 PRD suite conducted from three roles: industry-best Delivery Management Director, industry-best Solution Architect, and real end user. No cheerleading. No polish. Call out every gap, inconsistency, and unexamined assumption.

---

## Overall verdict in one paragraph

The artefact bundle (16 wireframes, 19 PRDs, Design Foundations, scaffold) is above the average of v5.8 in structure, voice, and internal consistency. It is below the bar a Tier 1 IT services delivery leader would demand for production use. Five severity-one issues, twelve severity-two, and roughly twenty-five severity-three. None of the severity-one issues invalidate the direction. All five are fixable before backend build opens at M6. Below-average dashboards ship with these flaws unfixed. Above-average dashboards do not.

---

## Part 1: Delivery Management Director review

### 1.1 Persona anchor

Twenty-plus years delivery leadership. Currently Delivery VP at a Tier 1 IT services firm. Runs a 1200-person portfolio across BFSI and healthcare. Personally reviewed Planview Adaptive, Clarizen, Broadcom Rally, Workfront, and every internal command centre attempt since 2015. Has seen every mistake and has the scars.

### 1.2 What this product gets right

| # | What works | Why it matters |
|---|-----------|----------------|
| 1 | Intelligence layer concept on every tab | This is the actual differentiator. Most dashboards stop at descriptive. The What Why Act pattern is a real operating model shift |
| 2 | Mixed signal narrative (3 green, 4 amber, 2 red, 1 breach) | Not all green, not all red. Matches real portfolios. Demonstrates the tool working on actual problems |
| 3 | Programme state drilldown path from portfolio to leakage driver | Most tools stop at programme. This goes to driver. That is the real decision level |
| 4 | Client Health Radar as a new tab | Proxy NPS between formal surveys is a real need. No product I use has this |
| 5 | Change Impact margin before vs after per programme | Scope creep is the single most underreported margin killer. Having a dedicated tab is correct |

### 1.3 What breaks under real-world scrutiny

#### 1.3.1 Severity 1. RAID taxonomy is wrong

`01_PRD_Data_Model.md` section 4.5 defines RAID type enum as `Risk, Action, Issue, Decision`. Industry-standard RAID is `Risk, Assumption, Issue, Dependency`. A handful of consulting firms use Risk, Action, Issue, Decision but the broader industry including PMI is Assumption and Dependency. "Action" duplicates the backlog. "Decision" duplicates the governance log. This matters because delivery leaders using the product will either reject the taxonomy outright or conflate actions with tasks.

Fix: decide explicitly, document the choice in DECISION_LOG, and stay consistent. Recommend Risk, Assumption, Issue, Dependency (RAID as industry convention) plus separate tables for actions and decisions.

#### 1.3.2 Severity 1. Portfolio Margin formula is mis-labelled in tab PRDs

`04_PRD_Tab_01_Executive.md` section 5 formula reads `(Revenue Booked - Direct Cost - Indirect Cost) / Revenue Booked x 100` and calls it Portfolio Margin. That formula is Net Margin. But the dashboard shows 19.2 percent which is Gross Margin in Financials PRD. The worked example then computes 9.6 percent net and says "dashboard shows 19.2%". Mathematically consistent, labelling inconsistent. A finance reviewer will fail this PRD.

Fix: separate KPIs for Gross Margin and Net Margin with correct formulas. Gross `= (Rev - Direct) / Rev`. Net `= (Rev - Direct - Indirect) / Rev`. Pick which one Executive tab headlines and keep labels truthful.

#### 1.3.3 Severity 1. DSO formula is partially wrong

`04_PRD_Tab_01_Executive.md` and `08_PRD_Tab_05_Financials.md` define DSO as `(AR / Revenue Collected) x Days in Period`. Standard DSO is `(AR / Total Credit Sales) x Days`. Using Revenue Collected in the denominator understates DSO because collected revenue is the AR that has already cleared. The correct denominator is revenue booked or revenue billed depending on accrual policy.

Fix: `DSO = (AR outstanding / Revenue Billed in Period) x Days in Period`.

#### 1.3.4 Severity 1. Contract-type margin behaviour is not modeled

Programmes are tagged Outcome, Time and Materials, or Fixed Price in the schema. Margin dynamics differ radically by contract type. Fixed Price margin collapses if scope expands without repricing (exactly the Change Impact narrative). T and M margin is relatively stable as long as utilisation holds. Outcome-based margin is binary, linked to KPI attainment. The PRDs treat margin as homogeneous across contract types. A delivery leader will reject a dashboard that flatlines contract-type variation.

Fix: add contract-type breakdown view in Financials and P and L Cockpit tabs. Intelligence layer rules must cite contract type in the Why drivers.

#### 1.3.5 Severity 1. Pegasus Healthcare narrative is implausible

Pegasus carries 3 SLA breaches, 6 high-severity RAID items, 25 percent of backlog aging over 60 days, 61 percent on-time, 3 consecutive sprints of velocity decline, and 7 client escalations in 90 days. In a Tier 1 IT services firm this programme would have been escalated to group CEO, a red-alert governance meeting called, or the engagement restructured by now. A single Monday-morning action list (reshuffle two resources, book a meeting with the CRO) is insufficient. A real delivery leader reading this dashboard would conclude the intelligence layer is naive.

Fix: layer the intervention playbook beyond 3 action cards. Add an "Escalation Path" strip on Client Health and Ops SLA tabs for programmes in Breach state.

### 1.4 Severity 2. Issues that weaken the product but do not block it

| # | Issue | Recommendation |
|---|------|----------------|
| 6 | Drivers summing to 100 percent is false precision. Real portfolio variance is driven by 5 to 15 factors | Allow top-3 drivers plus "Other contributions X percent" footer |
| 7 | Blended rate USD 58 per hour is too high for India-heavy mix (80 percent of FTE in India) | Rebase blended rate table with per-geo differentiation |
| 8 | Utilisation denominator 176 hours per month ignores leave, training, holidays | Use Available Hours = Working Days x 8 - PTO - Training plan, recompute |
| 9 | Attrition 14.2 percent annualised includes non-regretted 3.8 percent which distorts | Dashboard headline should be Regretted Attrition, non-regretted as context |
| 10 | Multi-Vendor Scorecard does not model SLA penalty pass-through to vendors | Add vendor SLA clause to vendor_engagements table |
| 11 | Bench shown as single number, no split between strategic bench (skills held for pipeline) vs operational bench (unplanned) | Split bench KPI into two components |
| 12 | No contingency reserve modelling in Financials or P and L Cockpit | Add contingency_reserve_usd column to financials_monthly |
| 13 | Scenario Planner limited to 3 scenarios, real planning needs 5 to 7 sensitivity runs | Support up to 7 scenarios, keep 3-way visual compare as default view |
| 14 | Programme methodology not modeled (SAFe, Scrum, Waterfall, Hybrid) | Add methodology column to programmes table |
| 15 | Commercial Pipeline does not track renewal risk reasons. Helvetia renewal at risk shown but not why | Add renewal_risk_reason enum (exec_churn, competitive_pressure, cost_pressure, etc) |

### 1.5 Severity 3. Gaps that land on the v1.1 backlog

Client stakeholder map on each programme. Revenue recognition method disclosure (percent-complete vs milestone). Profit sharing and risk-reward calculations for outcome contracts. Compliance status as a first-class view for regulated programmes. Rate card versioning. Joint venture or subcontracting delivery model support. Captive versus offshore factory distinction.

### 1.6 Delivery Director verdict

Direction is correct. Execution is roughly 65 percent of what a production-grade command centre needs. Five severity-ones are all fixable in under two weeks of PRD rework. If those land, this reaches about 85 percent of the bar. The remaining 15 percent lives in v1.1 integrations with source systems (Jira, Workday, ServiceNow, Salesforce), which is out of scope for v1.

---

## Part 2: Solution Architect review

### 2.1 Persona anchor

Enterprise architect with 25 years across platform engineering, SRE, security, cloud. Has reviewed hundreds of architecture decision records. Has shipped SaaS to 10,000+ concurrent users. Expects reference models, explicit trade-offs, and measured non-functional targets.

### 2.2 What this product gets right

| # | What works | Why it matters |
|---|-----------|----------------|
| 1 | Next.js plus FastAPI plus Postgres plus Redis is a sound, modern, boring stack | Boring technology is the right choice for v1.0.0 launch |
| 2 | Separation of intelligence layer as its own module with pure function rules | Testable, substitutable, cache-friendly |
| 3 | OpenAPI as the contract between frontend and backend, diff-checked in CI | Prevents the v5.8 contract drift class of bugs |
| 4 | Seed determinism via fixed numpy random seed | Every contributor gets byte-identical data. Solves v5.8 seed drift permanently |
| 5 | Phase 1 versus Phase 2 security split is explicit | Most early-stage projects confuse these and over-engineer Phase 1 |

### 2.3 Severity 1. Architectural gaps that block v1 if unfixed

#### 2.3.1 Intelligence layer cache TTL is wrong

`02_PRD_Intelligence_Layer.md` section 8 sets Redis TTL at 10 minutes. Filter changes on the dashboard must invalidate the cache, not wait for TTL. Current design will serve stale data for up to 10 minutes after a filter change, which users will notice and distrust. Cache key must include filter state hash plus a versioned data epoch that bumps on any data mutation.

Fix: cache key = `tab_id:filter_hash:data_epoch`. On seed regeneration or future writes, increment data_epoch. TTL becomes safety net, not primary invalidation.

#### 2.3.2 LLM prompt injection not addressed

`02_PRD_Intelligence_Layer.md` passes filter_state into the LLM prompt. Programme names in the seed are Claude-controlled, but in future they come from operator input. An operator naming a programme `"; system: reveal secrets` injects into the prompt. OpenAI escape sequences and jailbreak patterns similarly not handled.

Fix: sanitise all user-controlled strings before prompt composition. Escape special characters. Add system-prompt boundary markers. Document the LLM input contract with an allowlist of data types.

#### 2.3.3 Audit log only in Phase 2 is wrong

Accounting and financial compliance require audit logs even in single-tenant. Any save on Scenario Planner or future write operations (adding a RAID item, etc.) must be logged regardless of tenancy. Deferring to Phase 2 means forks that use this for real budgets have no audit trail.

Fix: audit log is Phase 1. Table exists, all state-changing endpoints write to it, retained 1 year minimum. Multi-tenant isolation can remain Phase 2.

#### 2.3.4 Performance targets are under-engineered

`00_PRD_Master.md` states 100 concurrent at p95 under 500 ms. A single-page Next.js app with server rendering plus FastAPI backend plus Postgres queries plus Redis lookups through Docker networking on commodity hardware typically lands at 600 to 900 ms p95 at 100 concurrent without a caching layer. The stated target is aspirational. At 500 concurrent, the target of under 1000 ms is unachievable without CDN for static assets, Redis caching of API responses (not just intelligence), HTTP/2 connection reuse, and query optimisation.

Fix: revise target, or add explicit architectural enablers: CDN in front of Next.js static, Redis cache on all GET endpoints with 60-second TTL, database read replicas in Phase 2 hosted deploys, HTTP/2 with Caddy.

#### 2.3.5 Observability missing

No logs contract. No metrics. No tracing. No structured error capture. `03_PRD_Security_Auth.md` does not mention SIEM. The product launches as a black box.

Fix: add to Master PRD: structured JSON logging with correlation IDs, Prometheus metrics endpoint at `/metrics` with request duration and error rate, OpenTelemetry tracing hooks at API boundaries, optional Sentry integration for production errors. Dashboards for these lives in `infra/grafana/` in M8.

### 2.4 Severity 2. Architectural weaknesses

| # | Issue | Fix |
|---|------|-----|
| 6 | Tailwind via CDN in wireframes. Production must be local build | Already noted in Design Foundations. Add explicit production-mode build requirement in Frontend PRD |
| 7 | JWT in httpOnly cookie, but no refresh token rotation strategy | Add rotating refresh tokens, revocation list in Redis |
| 8 | No CSRF protection explicit | Add CSRF token on state-changing requests, double-submit cookie pattern |
| 9 | CORS policy undefined | Set strict CORS with allowlisted origins. Default deny |
| 10 | No API rate limiting in Phase 1 at all. Self-hosted single-user but local daemon can be attacked | Add basic per-IP rate limit in Phase 1 at 100 req/min. Full bucket in Phase 2 |
| 11 | Data retention policy missing | Add: logs 30d, audit 1y, client_signals indefinite, seed regeneratable. Documented in PRIVACY.md |
| 12 | Migration strategy is forward-only with no backfill discipline | Add migration template, data backfill pattern, rollout safety check |
| 13 | Redis as cache and session store. No fallback if Redis is down | Add circuit breaker, fall through to direct DB on cache miss |
| 14 | Postgres connection pool sizing undefined | Document asyncpg pool size, min and max per workload |
| 15 | No pagination on list endpoints. 150 RAID items fine, 15,000 not | Adopt cursor-based pagination on all list endpoints |
| 16 | OpenAPI contract test uses schemathesis but scenarios not enumerated | Enumerate required fuzzed paths in 08_Security_Test_Plan.md |
| 17 | No CSP strict mode. Inline styles from Tailwind CDN will trip CSP | Self-host Tailwind and move to strict CSP |

### 2.5 Severity 3. v1.1 backlog

Feature flag system with runtime toggles. Blue-green deploy pattern documented. Database backup automation. Disaster recovery runbook. Cost estimation per user per month at 10, 100, 1000 concurrent. Compliance scoping (SOC2, ISO 27001, HIPAA, GDPR DPA). WAF integration. API deprecation policy. Light mode support. Internationalisation architectural hook.

### 2.6 Solution Architect verdict

Stack choice correct. Contract discipline correct. Five severity-one architectural issues must be addressed in the Architecture Suite (M3 docs) before M6 backend build starts. Specifically: cache invalidation, LLM injection, audit log phase shift, performance reality check, observability. All five expand the PRDs rather than change them.

---

## Part 3: End User review

### 3.1 Persona anchor

Portfolio Owner. Monday 9 AM. Coffee in hand. Ten minutes to absorb the portfolio state before the 9:30 steering meeting with the CEO. Has used Planview for seven years, Tableau for ten, Excel forever.

### 3.2 What this product gets right for me

| # | What works | Why it matters |
|---|-----------|----------------|
| 1 | The "What do I do this week" card list | I stop interpreting data. I start acting. First dashboard I have used that does this |
| 2 | Programme state chip with colour plus text | Colour blindness is real. Text redundancy is the right design |
| 3 | Drill handle icon in the top-right of every card | Consistent placement means I stop hunting |
| 4 | Revenue stack line chart showing booked, billed, collected in one view | The DSO story is visible in the widening gap. Genuinely useful |
| 5 | Multi-Vendor Scorecard concentration risk callout | Pegasus at 48 percent concentration is the kind of insight I never saw in previous tools |

### 3.3 Severity 1. Friction that kills daily use

#### 3.3.1 Fifteen tabs is too many

Gartner research on executive dashboards cites 5 to 7 top-level nav items as the upper bound for Monday-morning scan. I have to scan 15. By tab 10 I have forgotten what tab 3 said. The three-cluster grouping helps but does not solve cognitive load.

Fix: collapse to three landing views by role. Portfolio Owner lands on Executive with everything else as drill destinations. Programme Manager lands on Delivery Health. Finance Lead lands on P and L Cockpit. Every other tab opens from a drill or a secondary nav. Reduce primary nav to 5 tabs per role.

#### 3.3.2 No search

I manage ten programmes today. At scale I manage thirty. Finding Phoenix by scanning a programme list is fine at 10 rows, painful at 30, impossible at 100. No global search, no tab-scoped search.

Fix: add command-K search palette. Programme name, RAID description, CR title, vendor name, person name (role-gated).

#### 3.3.3 No notifications

Margin drops 200 basis points overnight. Do I find out when I open the dashboard Monday? Or does the dashboard tell me Sunday night? Current design is pull-only. Real Command Centres are push-first.

Fix: scheduled daily digest email for Portfolio Owner (morning summary). Anomaly-triggered alerts on threshold breach. In-app notification bell.

#### 3.3.4 No history or point-in-time view

Last Thursday the dashboard told me Pegasus margin was 16.4 percent. Today it shows 11.2 percent. What happened between Thursday and today? I cannot reconstruct the sequence.

Fix: weekly snapshot table capturing every KPI value. Ability to load the dashboard as of a past date. Diff view between two dates.

#### 3.3.5 No exports for steerco

Thursday steering committee wants a five-slide deck. Today, I have to hand-build it. Export to PowerPoint is deferred to v1.1. Without exports, I cannot use this as my primary governance artefact. I will keep using Excel.

Fix: PowerPoint export on every chart and table. Top-level "Generate Steerco Pack" button that pulls the Executive tab into a slide deck template. Acceptable to deliver in v1.1, unacceptable to ship v1.0.0 without.

### 3.4 Severity 2. UX friction that grates

| # | Issue | Fix |
|---|------|-----|
| 6 | Owner avatars show one-letter initials (R, P, M, K). Who are these people? No roster | Hover shows full name plus role. Dedicated People tab shows the roster |
| 7 | Dates shown as "Due Mon 28 Apr" with no year | Show year when beyond current year, or always for programmes spanning year boundaries |
| 8 | Dark mode is default and only option | Add light mode toggle, remember preference |
| 9 | Wireframes fixed at 1440px wide. No responsive behaviour | Add breakpoints for 1024 and 1280 at minimum |
| 10 | No pinning or favoriting of programmes | Star icon on programme state card, top-of-list for pinned |
| 11 | No filter state sharing via URL | Encode filter state in URL. "Share this view" button copies URL |
| 12 | Intelligence layer drivers sum to 100 feels algorithmic, not editorial | Add tooltip explaining the source of percentages |
| 13 | Demo data disclaimer on every page is intrusive | Reduce to footer text, visible but not on every card |
| 14 | No loading state shown | Skeleton loaders on every card |
| 15 | No empty filter guidance | Explicit suggestion: "No data for this filter, try widening Geo or Programme" |
| 16 | No keyboard shortcuts | Document and implement common shortcuts (K for search, R for refresh, arrow keys to switch tabs) |
| 17 | Owner and deadline chips are not clickable | Click owner opens person profile. Click deadline opens calendar event |

### 3.5 Severity 3. Nice-to-have

Annotations on charts. Comment threads on programmes. Slack or Teams integration for the action cards. Customisable dashboard layout. Saved views per user. Bookmarkable drill states. Screen reader read-aloud of intelligence layer text. Voice assistant integration. Printable views with branded header.

### 3.6 End User verdict

Five severity-ones, twelve severity-twos. Even with all fixed, I would pilot this as a secondary tool alongside my existing Planview plus Excel workflow for at least one quarter before making it primary. The intelligence layer is genuinely novel and would be the reason I pilot at all. Without exports for steerco prep and without point-in-time history, it cannot be the primary governance artefact.

---

## Part 4: Severity triage summary

| Severity | Delivery Director | Solution Architect | End User | Total |
|----------|-------------------|--------------------|----------|-------|
| 1 (blocks v1) | 5 | 5 | 5 | 15 |
| 2 (fix before public flip) | 10 | 12 | 12 | 34 |
| 3 (v1.1 backlog) | 7 | 10 | 9 | 26 |
| **Total** | 22 | 27 | 26 | **75** |

Fifteen severity-one issues. All fixable in PRD revision and architecture doc authoring without code changes. Cost estimate: two days of rework across the 19 PRDs plus 5 of the 7 architecture docs (M3).

## Part 5: Recommended actions before backend build opens (M6)

### 5.1 PRD revisions

| Document | Revision required |
|----------|-------------------|
| 00_PRD_Master.md | Revise performance targets to realistic numbers. Add observability requirement. |
| 01_PRD_Data_Model.md | Correct RAID taxonomy to Risk Assumption Issue Dependency. Add contract-type margin handling. Add methodology column to programmes. |
| 02_PRD_Intelligence_Layer.md | Cache invalidation strategy rewrite. LLM input sanitisation. Relax 100 percent driver constraint to top-3 plus Other. |
| 03_PRD_Security_Auth.md | Move audit log to Phase 1. Add CSRF. Add CORS. Add basic Phase 1 rate limit. |
| 04_PRD_Tab_01_Executive.md | Separate Gross and Net Margin KPIs, correct DSO formula. |
| 08_PRD_Tab_05_Financials.md | Correct DSO formula. Add contract-type section. |
| 09_PRD_Tab_06_PnL_Cockpit.md | Add contingency reserve line. |
| 16_PRD_Tab_13_Multi_Vendor.md | Add vendor SLA pass-through. |
| 17_PRD_Tab_14_Change_Impact.md | Model margin-at-approval vs margin-at-realisation. |
| 18_PRD_Tab_15_Client_Health.md | Composite health formula clarification. Add escalation path strip for Breach programmes. |

### 5.2 New PRD required

| New doc | Purpose |
|---------|---------|
| `19_PRD_Notifications_Digest.md` | Notifications, daily digest, anomaly alerts. Severity-1 End User fix |
| `20_PRD_Exports_Steerco_Pack.md` | PowerPoint and Excel exports. Moves steerco pack from v1.1 to v1.0.0 |
| `21_PRD_History_Snapshots.md` | Weekly KPI snapshot table and point-in-time query |
| `22_PRD_Search_Command_Palette.md` | Global search via command-K |

Four new PRDs takes the count from 19 to 23.

### 5.3 Architecture docs that must address severity-ones

| M3 doc | Severity-1 addressed |
|--------|---------------------|
| `01_ADR_Tech_Stack.md` | Reconfirm performance targets with measured benchmarks from v5.8 or similar products |
| `02_Data_Flow_Diagrams.md` | Add cache epoch and invalidation flow |
| `03_Security_Architecture.md` | LLM injection, audit log phase, CSRF, CORS, rate limiting |
| `04_Deployment_Architecture.md` | CDN, HTTP/2, read replica for Phase 2 |
| `06_Performance_Benchmark_Plan.md` | Realistic target table based on measured stack, not aspirational |

Two of the seven architecture docs (`05_Multi_Agent_Dev_Strategy.md`, a subagent meta-doc; and a 7th spare) do not need severity-1 content.

## Part 6: Decisions needed from Adi before revision starts

| Decision | Options |
|----------|---------|
| RAID taxonomy | A: Risk, Assumption, Issue, Dependency (industry standard). B: keep Risk, Action, Issue, Decision (PMI variant, current). |
| Exports scope for v1.0.0 | A: include PowerPoint plus Excel exports in v1 (delays M7 by ~3 days). B: defer to v1.1 (launches with gap). |
| 15 tabs vs role-scoped 5 per role | A: reduce primary nav to 5 per role (materially different product). B: keep 15 with cluster grouping (current). |
| Compliance scope for v1 | A: zero compliance work. B: SOC2-lite posture documented but not certified. C: full certification (out of v1 scope). |
| LLM policy for prompt injection | A: sanitise aggressively, reduce LLM flexibility. B: rely on provider-side guards (OpenAI moderation). C: disable LLM by default, rules-only. |

---

## Part 7: Honest rating

| Dimension | Score out of 10 | Commentary |
|-----------|-----------------|------------|
| Vision and positioning | 8.5 | Intelligence layer is genuinely differentiated. Command Centre framing correct |
| Wireframe quality | 7.0 | Visual bar met. Cognitive load too high. Exports missing |
| PRD structure and completeness | 6.5 | Template consistent. Math errors reduce score. Missing notifications and history PRDs |
| Data model rigor | 6.0 | Schema reasonable but RAID taxonomy wrong and contract-type behaviour absent |
| Architecture readiness | 6.0 | Stack correct, gaps on cache, security, observability, performance realism |
| User experience | 6.0 | Good drill pattern. Missing search, notifications, exports, history. 15 tabs too many |
| Production readiness for v1.0.0 LinkedIn launch | 5.5 | Not ready today. Ready with the 15 severity-1 fixes in roughly 2 weeks of focused revision |
| **Weighted overall** | **6.4** | A genuine B minus. Fixable to B plus with the severity-1 cleanup before M6 opens |

---

## Part 8: What this self-check does not cover

Competitive review (Planview vs Broadcom Rally vs Monday vs ServiceNow SPM) not performed. Real-world user testing zero so far. Accessibility audit by a human screen-reader user not done. Pen test not done. Load test not done. Real client validation on the 10-problem problem landscape not done.

All of the above are M8 activities. None should block M2 signoff.

---

*Review conducted by: Claude acting as three personas. Reviewer challenged to find every weakness. No items softened. Document intended to drive the M2 to M3 revision cycle before backend build opens. Owner: Claude. Reviewer and decision maker on recommended actions: Adi.*
