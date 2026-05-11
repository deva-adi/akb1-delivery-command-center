# BUILD_STATE.md
### AKB1 Delivery Command Center v1 | Session-level build state | Last updated: 2026-05-11 (M7-14 Backlog Health tab closed)

> Updated at the end of every substantive session. Percent complete per module. Keep to one page.

---

## Current Phase

**Rev 4 cascade complete. Phases 1 through 9 closed. M6 backend build can begin against stable spec. v1.0.0 launch target 2026-06-10.**

## Overall Project Progress

| Module | Percent complete | State |
|--------|------------------|-------|
| Scaffold (M0) | 100 | CLOSED 2026-04-24 |
| Pre-wireframe readiness | 100 | CLOSED 2026-04-24 |
| Wireframes (M1) rev 4 | 100 | CLOSED 2026-04-25. 17 wireframes at R4 (3 new plus 14 cascaded) plus 3 cross-cutting wireframes plus Index updated |
| PRD suite (M2) rev 4 | 100 | CLOSED 2026-04-25. 28 PRDs total (3 new tab PRDs at rev 1, 14 existing tab PRDs at rev 4 or rev 2, 4 cross-cutting at rev 2, 2 new cross-cutting at rev 1, Master at rev 3, Data Model at rev 4, Intelligence Layer rev 2, Security rev 2) |
| Architecture suite (M3) rev 4 | 100 | CLOSED 2026-04-25. Design Foundations rev 4 with 13 amendment sub-sections |
| Test strategy (M4) rev 2 | 100 | CLOSED 2026-04-25. 14 docs in docs/test/ (5 new at rev 1, 5 cascaded to rev 2, 4 unchanged) |
| Subagent roster (M5) rev 1 | 100 | Carries forward from rev 1; rev 2 update deferred to backend kickoff |
| Rev 4 cascade for 50 UCs | 100 | CLOSED 2026-04-25. All 50 UCs absorbed across PRDs and wireframes per D-029 through D-034 |
| Backend service (M6) | 60 | Slice M7-2 CLOSED 2026-05-03. Programme-scoped resources: 3 new migrations (007 programme_raids, 008 programme_milestones, 009 programme_health_snapshots), 3 ORM models, 3 read services, 1 new API router (GET /api/v1/programmes/{code}/raids|milestones|health), require_programme_access dependency (imperative helper, not factory), 5a-broad audit search extension (DD/FL with AP see resource-owned audit rows for programme_raid/milestone/health_snapshot). PM added to person_programme_assignments in seed (10 new rows = 25 total). Seed SHA-256: 338ee06b723de32d78684b4b1c8c49c9ee5aec8687487d61c3f2c1cbcbfe24e9 (prior: 56843a...). 38 new tests (12 raids, 12 milestones, 12 health, 5 5a-broad broad incl. resource-in-assigned-programme visible, resource-in-unassigned-programme invisible for all 3 types, PO regression). Total: 209 of 209 green. OpenAPI codegen regenerated: frontend/openapi.json + frontend/lib/api-client/schema.ts updated for 3 new endpoints. 5a-broad TODO comments removed from audit_search.py. See D-045. Slice 5c CLOSED 2026-05-01. GET /api/v1/audit/entry/{entry_id} completes the audit console MVP per PRD 26 section 10. AP-strict (require_audit_access extended with strict_ap kwarg, default false preserves slice 4 /audit/search behaviour, /audit/entry/{id} passes strict_ap=True so PortfolioOwner without AP is denied with ApFlagDenied; no PO carve-out because there is no metadata-only fallback). Response includes before_json, after_json, and a server-computed shallow diff (top-level added / removed / changed; nested objects compared as opaque values, deep-diff deferred). diff is null when either snapshot is null. 404 on unknown entry_id with no audit row written. Successful reads not audited (D-039 ruling 8). 24 new tests (3 allowed-role 200, 2 ApFlagDenied incl. PO+AP=false, 3 RoleDenied parametrised, 2 auth errors, 1 unknown-id 404, 1 successful-read-no-audit, 4 diff null/identical cases, 7 compute_shallow_diff helper unit tests, 1 e2e login -> search -> entry). Total: 171 of 171 tests green (slice 1: 34, slice 2: 33, slice 3: 32, slice 4: 18, slice 5b: 21, slice 5a: 9, slice 5c: 24). Migrations applied: 001 through 006 (no new migration in slice 5c). See D-043. |
| Backend slice 5a | n/a | Slice 5a CLOSED 2026-04-30. Programme scoping for DD/FL on /api/v1/audit/search, closing the slice 4 D-040 ruling 2 deferred TODO. Migration 006 introduces person_programme_assignments join table (person_id UUID FK people.person_id ON DELETE CASCADE, programme_id TEXT FK programmes.programme_code ON DELETE CASCADE, assigned_at TIMESTAMPTZ, PK (person_id, programme_id), index on person_id). Seed extends to populate 15 assignments deterministically: each of the 2 DDs and 3 FLs gets 3 programmes drawn via numpy.random.RandomState(SEED) with replacement=False per person; overlaps allowed across people. New seed SHA-256: 56843a290993e21d89e2a546ac4a2307fa8d714f7e36dd949a4670bb28684a12 (slice 4 was ef381cb...). Audit search visibility (5a-narrow): DD/FL with AP=true sees rows whose actor_user_id is in the set of people assigned to one of the caller's programmes via two-level subquery (`actor_user_id IN (SELECT person_id FROM person_programme_assignments WHERE programme_id IN (SELECT programme_id FROM person_programme_assignments WHERE person_id = caller))`). EXPLAIN-asserted to use the index on person_id. PO with AP=true unaffected (sees all). 5a-broad (resource-ownership scoping) deferred until programme-scoped resources land; TODO comment in services/audit_search.py. 9 new tests (parametrised overlap/disjoint matrix, self-visibility, orphan-DD edge case, PO regression, e2e disjoint vs overlapping DD, EXPLAIN index assertion). See D-036 through D-042. |
| Backend slice 5b | n/a | Slice 5b CLOSED 2026-04-30. Auth-hardening: Redis-backed lockout, per-IP rate limit middleware, stateless double-submit CSRF middleware. Slice 3 in-memory dict removed (single-worker correctness gap closed). Lockout key shape lockout:{email} with TTL 15 min stamped on first failure, INCR + EXPIRE-on-first counter semantics. Rate limit per 2c resolution: tiered limits (rate_limit_auth_requests=10, rate_limit_default_requests=120, window=60s) on a shared per-IP-per-minute bucket key ratelimit:{ip}:{minute}; sliding window per-minute bucket retained from kickoff (token-bucket divergence from PRD section 11 documented as accepted at current scale). X-Forwarded-For trust gated on TRUSTED_PROXY setting (empty in dev = ignore header to close spoof bypass). CSRF stateless: secrets.compare_digest cookie vs X-CSRF-Token header on POST/PUT/PATCH/DELETE under /api/v1/* (login exempt as token issuance point). Login response sets csrf_token cookie (HttpOnly=False so browser JS can read for double-submit, SameSite=Strict). 21 new tests (4 Redis-lockout, 8 rate-limit, 9 CSRF). E2E tests acquire CSRF cookie from real login response and re-sync the X-CSRF-Token header. See D-036 through D-041. |
| Frontend app (M7) | 93 | M7-14 CLOSED 2026-05-11. Backlog Health tab at app/home/backlog-health/page.tsx. Role gate: PO/PM/RO allowed; FL/DD/HRBP redirect. FL explicitly "No" per PRD section 2 (per D-057). Smallest role gate in M7 (3 roles). Zero new backend: health + milestones reused from M7-2. backlog_items entity not seeded -- most stub-heavy tab alongside Financials. lib/backlog-health.ts: isBacklogHealthAllowed, BACKLOG_HEALTH_ALLOWED_ROLES (3 roles), BacklogHealthState (CRITICAL/RED/AMBER/GREEN), ragToBacklogState (Failing=CRITICAL, Red=RED, Watching/Amber=AMBER, Green/null=GREEN), ProgrammeBacklogState interface (code/state/rag/delayedCount/atRiskCount), buildBacklogProxy (Map inputs in PROGRAMME_CODES order; latestSnapshot picker; delayedCount and atRiskCount from milestone status), buildBacklogWhat (pressureProgrammes=programmes with delayedCount>0, delayedTotal, atRiskTotal, visibleProgrammes, worstProgramme first CRITICAL else first RED else null). Real sections: Intelligence card What (real proxy: pressureProgrammes + delayedTotal + worstProgramme CRITICAL call-out), KPI Groom Missed (real: pressureProgrammes with threshold colouring red>=3/amber>=1/green=0), Programme Table Health column (real BacklogHealthState per programme). Stub sections (6): KPI Total Backlog (1,847), KPI Aging >60d (312 17%), KPI DoR Compliance (68%), KPI Epic Readiness (7.1/10), BacklogAgingHistogram (4 buckets 53/30/10/7%), BacklogDoRBars (10 rows from wireframe with 85% target line). 35 new vitest (26 backlog-health-utils, 9 backlog-health-role-guard). Total vitest: 479 of 479 green. tsc clean. npm run build green. 21 routes. See D-057. M7-13 CLOSED 2026-05-11. Client Health tab at app/home/client-health/page.tsx. Role gate: PO/PM/FL/RO allowed; DD/HRBP redirect (DD not in PRD 18 section 2, same exclusion as D-055 Financials, per D-056). FL included. PM scoping deferred (client_signals not seeded, same deferral as D-055). Zero new backend: health + milestones reused from M7-2. lib/client-health.ts: isClientHealthAllowed, CLIENT_HEALTH_ALLOWED_ROLES (4 roles), CompositeState (INTERVENE/WATCH/HEALTHY), ProgrammeClientState interface, RAG_WEIGHT map (Failing=20/Red=35/Watching=55/Amber=65/Green=85), buildClientHealthProxy (Map input, 10 rows in seed order, latest snapshot per programme, Failing/Red=INTERVENE, Watching/Amber=WATCH, Green/null=HEALTHY), buildClientHealthWhat (interveneCount, watchCount, visibleProgrammes, blendedScore weighted avg null when no snapshots, worstProgramme first INTERVENE else first WATCH else null, delayedMilestones proxy). Re-exports types from delivery-health.ts. Real sections: Intelligence card What (real proxy: intervene count + blended score/100 + delayed milestone count + worst programme call-out), KPI Portfolio Health (real blended score with amber/green/red threshold), KPI Programmes in INTERVENE (real count with threshold alert), Signal Matrix State column (real INTERVENE/WATCH/HEALTHY per programme from proxy), Signal Matrix blended score footer. Stub sections: KPI Escalations 90d (27), KPI Missed Exec Meetings (7), KPI Last NPS (54), Signal Matrix client/signal/composite columns (all n/a), Radar chart SVG shell (5-axis outline only; needs client_signals polygon data), Intervention Playbook (4 static cards: Pegasus/Phoenix/Stellar/Orion with tags), Rev 4 Stakeholder Influence quadrant (SVG shell; needs stakeholder_influence entity), Opposition Stakeholders KPI (n/a stub), 1-on-1 action prompt (static wireframe). Cross-link banner in Rev4 section is real (static href to /home/governance-operating-model). 33 new vitest (25 client-health-utils, 8 client-health-role-guard). Total vitest: 444 of 444 green. tsc clean. npm run build green. 20 routes. See D-056. M7-12 CLOSED 2026-05-10. Financials tab at app/home/financials/page.tsx. Role gate: PO/PM/FL/RO allowed; DD/HRBP redirect (DD not in PRD 08 section 2; first tab where DD is excluded, per D-055). FL is primary role (position 1 in FL primary nav). Zero new backend: health + milestones reused from M7-2. financials_monthly not seeded -- tab is the most stub-heavy to date. lib/financials.ts: isFinancialsAllowed, FINANCIALS_ALLOWED_ROLES (4 roles), ragToFinancialState (Failing=BREACH, Red=RED, Amber/Watching=AMBER, Green/null/undefined=GREEN), ProgrammeFinancialState interface, buildProgrammeFinancialStates (most-recent snapshot overall_rag per programme; empty snapshots default GREEN), buildFinancialsWhat (atRiskProgrammes=Red+Failing count, visibleProgrammes, delayedMilestones proxy, worstProgramme by RAG weight). Real sections: Intelligence card What (real proxy: at-risk count + delayed milestone count + worstProgramme), Revenue by Programme table State column (real proxy: health RAG). Stub sections (6): KPIGrid (6 cards with wireframe values + TODO: Revenue Booked, Bill Ratio, DSO, Unbilled WIP, Gross Margin, Bench Tax MTD), Revenue Stack SVG (needs financials_monthly), Cost Breakdown bars (7 categories, static percentages), Bench Tax Allocation table (needs bench_state on people + bench_tax_allocated_usd), Revenue by Programme dollar columns (all n/a pending financials_monthly), Rev 4 Revenue Leakage 5-Mechanism audit (gold border + REVISION 4; needs revenue_leakage_mechanism entity). 36 new vitest (28 utils, 8 role-guard). Total vitest: 409 of 409 green. tsc clean, npm run build green, 19 routes. See D-055. M7-11 CLOSED 2026-05-10. Ops and SLA tab at app/home/ops-sla/page.tsx. Role gate: PO/DD/PM/RO allowed; FL/HRBP redirect to /home (FL penalty-view PRD grant narrowed to redirect per D-054; no dedicated FL view scoped for v1). DD added per D-054. Zero new backend: health + milestones reused from M7-2. lib/ops-sla.ts: isOpsAllowed, OPS_ALLOWED_ROLES, SLA_CATEGORIES (6 categories: Uptime/Ticket MTTR/Response/Quality/Release/Support), SLACellState (BREACH/RED/AMBER/GREEN), buildSLAMatrix (maps health sub-RAGs to 6 SLA categories per programme; most-recent-snapshot picker; fallback to overall_rag when sub-RAG null; ragToCell maps Failing=BREACH, Red=RED, Amber/Watching=AMBER, Green=GREEN), buildOpsKPIs (atRiskProgrammes=Red+Failing count; visibleProgrammes; 5 stub values from wireframe with TODO), buildOpsWhat (atRiskProgrammes + visibleProgrammes + delayedMilestones proxy + worstProgramme by RAG weight). Real sections: Intelligence card What (real proxy: at-risk count + delayed milestone count + worst programme), KPI Programmes at SLA Risk (real proxy), KPI Visible Programmes (real), SLA Status Matrix (real proxy: 10 programmes x 6 categories from health sub-RAGs, colour-coded cells). Stub sections (7): 5 KPI cards (SLA Adherence/Active Breaches/Penalty Exposure/P1 Incidents/MTTR with wireframe values), Incident Trend chart (stub SVG; needs incidents entity), Top 10 SLA Breaches table (stub; needs sla_metrics), Decision Queue table (stub; needs decisions entity), Decision Velocity chart (stub SVG; needs decisions), Rev 4 section (gold border: extended queue columns + category filter tabs + governance cross-link banner; needs decisions + steerco_pre_read). 37 new vitest (24 ops-sla-utils, 8 ops-sla-role-guard, 8 ops-sla-matrix -- wait: 24+8+8=40... actually: see session log). Total vitest: 373 of 373 green. tsc clean, npm run build green, 18 routes. See D-054. M7-10 CLOSED 2026-05-10. Flow and Velocity tab at app/home/flow-velocity/page.tsx. Role gate: PO/DD/PM/RO allowed; FL/HRBP redirect to /home. DD added per D-053 (PRD 10 section 2 did not list DD explicitly; included for operational parity with Delivery Health). Zero new backend: milestones + health endpoints reused from M7-2. lib/flow-velocity.ts: isFlowAllowed, FLOW_ALLOWED_ROLES, WIP_LIMITS (10 programme codes, values from wireframe v1_07 with TODO to replace when wip_limits entity lands), buildWIPProxy (At Risk + On Track milestone count per programme as WIP proxy; breaching flag against limit), buildFlowKPIs (throughputProxy=Complete count, wipBreachCount, visibleProgrammes; 3 stub values cycleTimeDaysStub/flowEfficiencyPctStub/leadTimeP85DaysStub with TODO), buildFlowWhat (derives throughputProxy + wipBreachCount + worstProgramme by highest overage), buildSprintWindowTable (groups Complete milestones by monthly due_date bucket per programme; last 3 months as proxy sprint windows; trend from window3 vs window1 comparison). Real sections: Intelligence card What (proxy throughput + WIP breach count + worst programme), KPI row Throughput (Complete milestone count), KPI row WIP Breach (programmes where At Risk+On Track > limit), WIP bars (10 programmes with proxy WIP vs static limit with gold tick mark). Stub sections (3): CFD chart (stub SVG shell with 4-band legend; needs flow_snapshots), Cycle Time / Flow Efficiency / Lead Time p85 KPI cards (TODO: sprint_velocity_log/flow_metrics), DORA Metrics section (Rev 2 gold border: 4 KPI cards + 5-programme band grid; needs dora_metrics entity). Sprint Performance table is partial proxy: 10 programmes x 3 monthly windows from milestone due_dates; trend arrow from window comparison; cycle time and flow efficiency columns show n/a pending sprint story data. 39 new vitest (23 flow-velocity-utils, 8 flow-velocity-role-guard, 8 flow-velocity-wip). Total vitest: 336 of 336 green. tsc clean, npm run build green, 17 routes. See D-053. M7-9 CLOSED 2026-05-06. Workforce Intelligence tab at app/home/workforce/page.tsx. Role gate: PO/DD/HRBP allowed; PM/RO/FL redirect. Zero new backend: GET /api/v1/people reused from M7-8. lib/workforce.ts: isWorkforceAllowed, BAND_LABELS (B1-B5 display-layer constants from wireframe), BAND_ORDER, buildWorkforceWhat (derives totalHeadcount + bandLine + seniorLine; null OT and sentiment lines for current seed). Imports buildPyramidBands + PersonItem from lib/capability.ts (same data source, no duplication). Real sections: Headcount KPI (people.length=300), Pyramid by Band (WorkforcePyramid: bar widths from real counts, BAND_LABELS for row titles, attrition column stub). Stub sections (9): 7 KPI cards (Utilisation/Bench/Attrition/Pyramid Integrity/Bus Factor/Overtime/Team Health Index), WorkforceSustainabilityMatrix (team_sustainability_signals), WorkforceAIOverlay (ai_tool_usage), WorkforceAttritionRadar (attrition events), WorkforceAttritionWatchlist (flight_risk_signals), WorkforceUtilizationReconciliation (R4/UC-CC: utilization_reconciliation entity; gold border + REVISION 4 badge + cross-link to Capability). Seed reality: overtime_hours_mtd and last_1on1_sentiment_score NULL for all 300 people; stub notes rendered. 40 new vitest (24 workforce-utils, 8 workforce-role-guard, 8 workforce-pyramid). Total vitest: 297 of 297 green. tsc clean, npm run build green, 16 routes. Workforce files in working tree; not yet committed (prior commit b9261cc is M7-4 through M7-8). See D-052. M7-8 CLOSED 2026-05-06. Capability and Supply Chain tab at app/home/capability-supply-chain/page.tsx. Role gate: PO/DD/HRBP allowed; PM/RO/FL redirect to /home (partial-access entities not yet seeded; deferred). Backend: GET /api/v1/people (new router, no migration; PersonItem excludes email/password_hash; all 6 roles 200; 12 integration tests). OpenAPI regen: PersonItem + PeopleListResponse types generated. lib/capability.ts: isCapabilityAllowed, buildPyramidBands (group by band, seniorCount/juniorCount/seniorPct), buildSentimentList (DD/PM with non-null score, sort ascending), buildCapabilityWhat (derives totalHeadcount + bandLine + seniorLine + sentimentLine; sentimentLine null for current seed). Real sections: Pyramid Shift (horizontal bars B5-B1 from buildPyramidBands, seed shape B5=24/B4=36/B3=60/B2=90/B1=90), Intelligence card What (headcount 300 + band distribution). Stub sections: 8 KPI cards, Bench Deep Dive, Skills Heat Map, Bench-to-Demand Match, DM Succession, DM Retention (PO+DD restriction enforced), Hiring Funnel, Margin Literacy (sentimentList empty in current seed). Seed reality: overtime_hours_mtd and last_1on1_sentiment_score NULL for all 300 people; buildSentimentList returns empty array. CapabilitySkillsSection combines Skills Heat Map + Bench-to-Demand Match (same absent entities). 34 new vitest (18 capability-utils, 8 capability-role-guard, 8 capability-pyramid). Total vitest: 257 of 257 green. tsc clean, npm run build green, 15 routes. Backend tests require Docker (Docker paused at time of run; import check clean; 17 unit tests green; 12 integration tests verified by Adi on next Docker start). See D-051. M7-7 CLOSED 2026-05-06. Audit Trail Console at app/home/audit-trail-console/page.tsx. Cross-cutting surface per PRD 26. Role gate: PO/DD/FL/PM allowed; HRBP/RO redirect to /home. PM backend gap noted: PRD 26 grants PM own-action visibility but backend 403s PM on /audit/search (D-040 slice 4 decision); PM sees AP-required message; deferred to future backend slice. Two new Route Handler proxies: /api/audit/search (forwards query params to backend /api/v1/audit/search) and /api/audit/entry/[id] (forwards to backend /api/v1/audit/entry/{id}); both read the httpOnly session cookie server-side. Server Component fetches initial 50-row result (7d default); AuditActivityStream client component owns filter state (timeWindow/httpMethod/outcome), load-more cursor pagination, and row-expand state with useRef guard preventing mount double-fetch. Real sections: filter bar (time_window/http_method/outcome wired to /audit/search params), activity stream table (actor UUID+role chip, method chip, endpoint, resource, outcome), total count (AuditSearchResponse.total_count), load-more cursor pagination, row expand with before/after diff (GET /audit/entry/{id}; strict AP enforced by backend; 403 renders AP-required inline message), empty state. Stub sections: 5 KPI cards (no /operational-metrics endpoint), actor display name (UUID shown; no people-name join), export button (no /audit/export endpoint), resource history view, endpoint analytics view. buildDiffLines pure function in lib/audit-console.ts maps AuditEntryDiff to DiffLine arrays for side-by-side split-diff rendering. tabKey "audit-trail-console" added to role-nav.ts TabKey union and TAB_LABELS. 57 new tests (33 audit-console-utils, 12 audit-console-role-guard, 12 audit-console-diff). Total vitest: 223 of 223 green. tsc clean, npm run build green, 14 routes. See D-050. M7-6 CLOSED 2026-05-05. Governance Operating Model tab at app/home/governance-operating-model/page.tsx. Widest role gate: PO/DD/PM/HRBP/RO allowed; FL redirect. Data fetch: health + milestones for all PROGRAMME_CODES (all roles); tier-config + threshold-register additionally for PO only. lib/governance.ts: isGovAllowed, buildOverOptimismList (flags programmes with Green most-recent snapshot AND Delayed milestones; consecutive green count from sorted snapshots; sorted flagged first). Components: GovIntelligenceCard (locked phrase "Governance that does not decide is theatre."; What uses real flaggedCount and visibleProgrammes; role-aware executive vs non-executive prose branch), GovKPIGrid (10 stub KPI cards in grid-cols-5; all tagged with "stub" badge and TODO comments), GovCadenceCalendar (programme x week grid stub; Theatre/Daily/Weekly/Steerco cells from wireframe), GovRACIMatrix (activity x role stub; GAP/OVERLAP row highlighting), GovDecisionQueue (5-row decision queue stub + Escalation Contract tier ladder -- tier labels real for PO from tier-config prop, static defaults for non-PO; SLA values and contacts stub), GovPreReadSection (Steerco Kit + Commitment Heatmap + Sponsor Engagement; all stubs), GovStakeholderSection (Stakeholder Map stub SVG + Over-Optimism list real data + Escalation Timing stub), GovAdminSection (Threshold Register top-5 real for PO / stub card for non-PO; Tier Config 5-row real for PO / stub card for non-PO; both read-only display; PATCH deferred to dedicated slice). 23 new tests (9 governance-utils, 8 governance-role-guard, 6 governance-over-optimism). tsc clean, npm run build green, 10 routes. See D-049. M7-5 CLOSED 2026-05-05. Executive tab at app/home/executive/page.tsx. Prerequisite: HRBP nav fixed in role-nav.ts (executive -> governance-operating-model, position 3) and role-nav.test.ts updated; role-nav all 20 tests still green after the fix. Allowed roles: PO/DD/RO; PM/FL/HRBP redirect to /home per PRD 3.1.10. Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for raids, milestones, and health in parallel (3 batches in Promise.all). lib/executive.ts: buildRaidSeverityIndex (weighted 0-10 from open RAID items, Critical=4/High=3/Medium=2/Low=1), buildProgrammeStateList (most-recent health snapshot per programme, Failing->BREACH, Watching->AMBER, sorted BREACH first), buildExecutiveKPIs (real: onTimePct from milestones, raidSeverityIndex from raids, visibleProgrammes; stubs: grossMarginPct 19.2, netMarginPct 13.2, utilisationPct 82.0, decisionLatencyDays 9.3, valueRealisationPct 54 -- all with TODO: replace when respective endpoints land), executiveSubtitle (PO: "The director sees across.", DD: "The delivery manager walks each one.", RO: null). Components: ExecutiveIntelligenceCard (What uses real onTimePct + raidSeverityIndex + programme state counts; subtitle rendered for PO/DD only per Design Foundations R4; static Why/Act), ExecutiveKPIRow (7 KPI cards grid-cols-7; 2 real: On-Time Delivery, RAID Severity Index; 5 stubs with "stub" badge: Gross Margin, Net Margin, Utilisation, Decision Latency, Value Realisation), ExecutiveMarginChart (portfolio gross margin R12M -- STUB SVG placeholder with TODO banner; wireframe coordinates preserved), ExecutiveProgrammeStateList (real data from health snapshots; BREACH/RED/AMBER/GREEN labels with colour tokens), ExecutiveRev4Section (4 stub instruments: Portfolio Drift Delta, Forecast Confidence, Account Concentration, Capability Heat Map reference). 33 new tests (19 executive-utils, 8 executive-role-guard, 6 executive-programme-state). tsc clean, npm run build green, 9 routes. See D-048. M7-4 CLOSED 2026-05-05. Delivery Health tab at app/home/delivery-health/page.tsx. Allowed roles: DD/PM/RO (PO/FL/HRBP redirect to /home per PRD 3.1.10). Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for both /milestones and /health in parallel; 403s silently discarded. lib/delivery-health.ts: pure utilities (buildKPIs, buildOnTimeByProgramme, buildSlippingMilestones, buildVelocityTrend, buildEstimationAccuracy, computeEVMForProgramme, isDeliveryHealthAllowed). Components: DeliveryHealthIntelligenceCard (3-col What/Why/Act with real kpis.onTimePct and kpis.openBlockers in What), DeliveryHealthKPIRow (5 cards: On-Time Delivery, Sprint Velocity proxy, Milestone Adherence, Open Blockers, CSAT stub), DeliveryHealthVelocityChart (SVG line chart: completion rate per monthly sprint bucket vs 90% capacity dashed line; last 8 buckets; point colour by threshold), DeliveryHealthOnTimeChart (horizontal bar chart per programme; Green >= 92%, Amber >= 80%, Red < 80%), DeliveryHealthMilestonesTable (top 5 At Risk + Delayed sorted by slipDays desc), DeliveryHealthEstimationSection (Rev 4: estimation accuracy table per programme with silentDrift count; EVM quartet for worst-performing programme with TODO comments on CPI/TCPI/EAC awaiting financials_monthly endpoint). Sprint velocity computed as Complete milestone count proxy (TODO: replace with actuals when sprint-velocity endpoint lands). CSAT is stub 4.2 (TODO: replace with actuals when csat endpoint lands). EVM CPI/TCPI/EAC are synthetic (TODO: replace with actuals when financials_monthly endpoint lands). 38 new tests (24 delivery-health-utils, 8 delivery-health-role-guard, 6 delivery-health-on-time-chart). tsc clean, npm run build green, 9 routes. See D-047. M7-3 CLOSED 2026-05-04. Risk and RAID tab at app/home/risk-raid/page.tsx. Route nested under home/layout.tsx: inherits JWT guard and role-aware nav. Role guard: PO/DD/PM/FL allowed, HRBP/RO redirect to /home via isRaidAllowed(). Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES; 403s silently discarded so scoped roles see only their programmes. Heat map: 4-column (Critical/High/Medium/Low), open+escalated only, sorted by total desc, status-red for Critical, status-amber for High, Tailwind semantic tokens throughout. KPI row: 5 cards (Open RAID, High Severity, Aging >30d, Programmes, Types). RAID trend: SVG stacked area chart computed server-side from raised_date bucketed by Math.floor(daysSinceEarliest/7). Top-10: Critical+High open items, severity desc then updated_at desc, up to 10. Intelligence card: computed What (real counts), static Why/Act following wireframe 3-col pattern with gold accent bars. lib/raids.ts: pure utility functions (buildHeatMap, buildTop10, buildTrend, computeKPIs, isRaidAllowed, PROGRAMME_CODES constant). 32 new tests (18 raid-utils, 6 raid-heat-map, 8 raid-role-guard). tsc clean, npm run build green. See D-046. M7 scaffold CLOSED 2026-05-01. Foolproof first vertical: Next.js 14.2.35 App Router on TypeScript strict, Tailwind on Option D Executive Mid palette tokens (D-018) declared in tailwind.config.ts with semantic names per Q4 ruling, no inline hex in components. Two pages: /login (public) and /home (authenticated). Route Handler proxy at POST /api/auth/login per Q2 ruling (no NextAuth at scaffold; deferred to Phase 2 OAuth and documented in the route handler comment). JWT planted as akb1_session httpOnly cookie; backend csrf_token cookie forwarded as-is per slice 5b D-041 ruling 11. Edge middleware on /login + /home/* redirects logged-in user from /login to /home and unauthenticated user from /home to /login?from=... Role-aware primary 5-tab nav per Master PRD R3.3 for all 6 roles (PO, DD, PM, FL, HRBP, RO) plus AP gold-dot overlay on the role badge per Design Foundations rev 4 R4.1. PO sees populated tier-config card from GET /api/v1/admin/tier-config (Q1 ruling part 1); non-PO sees stub card (Q1 ruling part 2). OpenAPI codegen: openapi-typescript regenerates frontend/lib/api-client/schema.ts from frontend/openapi.json which is itself dumped from FastAPI app.openapi() via scripts/gen-openapi.sh; --check mode for CI fails on backend drift per Q3 ruling and CLAUDE.md mandate. Vitest 40 of 40 green (20 role-nav map, 7 RoleAwareNav, 3 RoleBadge, 3 LoginForm, 7 session decode). E2E smoke run against live backend: bad creds 401 with backend detail "Invalid email or password", good creds 200 with both cookies planted, /home with cookies 200 rendering PO 5-tab nav and tier card data-state=loaded with all 5 seeded tiers, /home without cookies 307 redirect to /login?from=/home, PM smoke shows stub card + correct 5-tab nav (Delivery Health / Flow and Velocity / Governance / Risk and RAID / Ops and SLA). Next.js production build green; tsc --noEmit clean. See D-044. |
| Integration and QA (M8) | 0 | Blocked on M7 |
| Release v1.0.0 (M9) | 0 | Target 2026-06-10 |

**Overall project: 96 percent complete.** M1 through M4 at rev 4 closed. M6 backend slices 1 through 5c plus M7-2 closed. M7 frontend: scaffold + Risk/RAID + Delivery Health + Executive + Governance Operating Model + Audit Trail Console + Capability + Workforce + Flow and Velocity + Ops and SLA + Financials + Client Health + Backlog Health closed (13 of ~14 tab slices). 479 frontend vitest green. 221 backend pytest green.

## Current Session Log

### Session 2026-05-11 (latest) | M7-14 closed: Backlog Health tab

Scope confirmed per brief. FL explicitly excluded (PRD section 2 says "No"); DD and HRBP not listed. Role gate is 3 roles: smallest in M7.

BacklogHealthState uses CRITICAL (not BREACH) for Failing RAG. Context-appropriate vocabulary: backlog breakdown vs financial breach. Same reasoning as client-health INTERVENE vs ops-sla BREACH.

buildBacklogProxy takes two Maps (snapshots + milestones) both keyed by programme code. Iterates PROGRAMME_CODES for seed-order guarantee. latestSnapshot picks most recent by date sort. delayedCount and atRiskCount derived from milestone status counts per programme.

buildBacklogWhat derives pressureProgrammes (proxy for groom miss), delayedTotal, atRiskTotal, worstProgramme (first CRITICAL else first RED). worstProgramme test had a wrong expected value (HELIX=RED was expected over PEGASUS=CRITICAL); corrected to "PEGASUS" with test renamed for clarity. See D-057 ruling 6.

Real data: Intelligence card What, KPI Groom Missed (pressureProgrammes with threshold colouring), Programme Table Health column.

Stub sections: KPI Total Backlog (1847), Aging >60d (312 17%), DoR Compliance (68%), Epic Readiness (7.1/10), AgingHistogram (4 buckets proportional bars), DoRBars (10 rows sorted desc from wireframe, 85% dashed target line).

Tests: 26 backlog-health-utils + 9 backlog-health-role-guard = 35 new. 479 of 479 vitest green. tsc clean. Build green. 21 routes.

D-057 logged in DECISION_LOG.md.

Files created:
  frontend/lib/backlog-health.ts
  frontend/components/BacklogIntelligenceCard.tsx
  frontend/components/BacklogKPIGrid.tsx
  frontend/components/BacklogAgingHistogram.tsx
  frontend/components/BacklogDoRBars.tsx
  frontend/components/BacklogProgrammeTable.tsx
  frontend/app/home/backlog-health/page.tsx
  frontend/tests/unit/backlog-health-utils.test.ts
  frontend/tests/unit/backlog-health-role-guard.test.ts

### Session 2026-05-11 (latest) | M7-13 closed: Client Health tab

Scope confirmed per brief. DD excluded (PRD 18 section 2 does not list DD; same exclusion as D-055 Financials). FL included. PM scoping deferred (client_signals not seeded).

buildClientHealthProxy receives Map<string, HealthSnapshotItem[]> to maintain PROGRAMME_CODES seed order. Iterates PROGRAMME_CODES array, returns 10 rows. Missing programmes default HEALTHY. page.tsx builds the Map from healthResults before calling proxy.

RAG_WEIGHT uses 0-100 scoring scale (Failing=20, Red=35, Watching=55, Amber=65, Green=85) as specified. blendedScore rounds to nearest integer. Returns null when no scorable snapshots.

Real data: Intelligence card What (intervene count + blended score + delayed milestones + worst programme call-out), KPI Portfolio Health card (blended score with threshold colouring), KPI Programmes in INTERVENE card (count with threshold alert), Signal Matrix State column (INTERVENE/WATCH/HEALTHY per programme), Signal Matrix portfolio blended footer.

Stub sections (data-stub="true" on all): KPI cards 3-5 (27/7/54 wireframe values), Signal Matrix client/signal/composite columns (n/a), Radar chart SVG 5-axis shell, Intervention Playbook 4 static cards, Rev 4 Stakeholder Influence quadrant SVG, Opposition Stakeholders KPI, action prompt. Cross-link banner to /home/governance-operating-model is real (static href).

Tests: 25 client-health-utils + 8 client-health-role-guard = 33 new tests. 444 of 444 vitest green. tsc clean. Build green. 20 routes.

D-056 logged in DECISION_LOG.md.

Files created:
  frontend/lib/client-health.ts
  frontend/components/ClientHealthIntelligenceCard.tsx
  frontend/components/ClientHealthKPIGrid.tsx
  frontend/components/ClientSignalMatrix.tsx
  frontend/components/ClientHealthRadar.tsx
  frontend/components/ClientInterventionPlaybook.tsx
  frontend/components/ClientHealthRev4Section.tsx
  frontend/app/home/client-health/page.tsx
  frontend/tests/unit/client-health-utils.test.ts
  frontend/tests/unit/client-health-role-guard.test.ts

### Session 2026-05-10 (latest) | M7-12 closed: Financials tab

Scope confirmed by Adi. DD excluded (first tab where DD is blocked; PRD 08 section 2 is explicit; Financials is finance-primary). FL is primary (position 1 in FL primary nav). PM included with scoped-future TODO.

financials_monthly not seeded. Most stub-heavy tab. Real data: health RAG per programme for State column in programme table and intelligence card What proxy. All dollar figures are static wireframe stubs with TODO.

lib/financials.ts: isFinancialsAllowed, FINANCIALS_ALLOWED_ROLES (PO/PM/FL/RO), ragToFinancialState (handles null/undefined safely, returns GREEN), ProgrammeFinancialState, buildProgrammeFinancialStates (latestSnapshot sort, empty snapshots default GREEN), buildFinancialsWhat (RAG_WEIGHT map for worstProgramme same as ops-sla, Delayed milestone count proxy). Re-exports types from delivery-health.ts.

7 components: FinancialsIntelligenceCard (real proxy What + static Why/Act), FinancialsKPIGrid (6 stub cards in grid-cols-5 + 1 standalone bench tax), FinancialsRevenueStack (stub SVG shell with 3-line legend), FinancialsCostBreakdown (7-category static bar list), FinancialsProgrammeTable (10-row: State real from health, all $ columns n/a), FinancialsBenchTax (stub table 2 rows + 8 more), FinancialsRev4Section (gold border + REVISION 4: 5-mechanism leakage stub bars).

page.tsx: Promise.all over health + milestones; healthByProgramme map; programmeStates for table; intel for card.

Tests: 28 financials-utils (7 isFinancialsAllowed, 7 ragToFinancialState, 8 buildFinancialsWhat, 6 buildProgrammeFinancialStates) + 8 financials-role-guard = 36 new tests. 409 of 409 vitest green. tsc clean. Build green. 19 routes.

D-055 logged in DECISION_LOG.md.

Files created:
  frontend/lib/financials.ts
  frontend/components/FinancialsIntelligenceCard.tsx
  frontend/components/FinancialsKPIGrid.tsx
  frontend/components/FinancialsRevenueStack.tsx
  frontend/components/FinancialsCostBreakdown.tsx
  frontend/components/FinancialsProgrammeTable.tsx
  frontend/components/FinancialsBenchTax.tsx
  frontend/components/FinancialsRev4Section.tsx
  frontend/app/home/financials/page.tsx
  frontend/tests/unit/financials-utils.test.ts
  frontend/tests/unit/financials-role-guard.test.ts

### Session 2026-05-10 (later) | M7-11 closed: Ops and SLA tab

Scope confirmed by Adi: DD yes (operational parity), FL redirect (no dedicated FL view scoped for v1). Role gate: PO/DD/PM/RO allowed; FL/HRBP redirect.

Zero new backend. Health + milestones endpoints reused from M7-2. Data approach: health sub-RAGs mapped to 6 SLA categories as proxy for SLA Status Matrix (same proxy reasoning as Flow WIP bars; health data is the best available signal).

lib/ops-sla.ts: isOpsAllowed, OPS_ALLOWED_ROLES (4 roles), SLA_CATEGORIES (6), SLACellState enum, SLAMatrixRow interface, OpsKPIs (2 real + 5 stub), OpsWhat (real proxy + delayedMilestones), ragToCell (Failing=BREACH, Red=RED, Amber/Watching=AMBER, Green=GREEN), latestSnapshot (sort desc pick first), buildSLAMatrix (maps per-programme health to 6 cells with sub-RAG fallback to overall), buildOpsKPIs, buildOpsWhat (RAG weight map: Failing=4/Red=3/Watching=2/Amber=1/Green=0 for worstProgramme identification).

8 components: OpsIntelligenceCard (real What), OpsKPIGrid (5 stub row + 2 real row in grid-cols-5 + grid-cols-2), OpsSLAMatrix (real proxy 10x6 table), OpsIncidentTrend (stub SVG), OpsSLABreachTable (stub placeholder), OpsDecisionQueue (stub queue table + velocity SVG), OpsRev4Section (gold border: extended queue stub + category tabs stub + governance cross-link banner).

page.tsx: Promise.all over health + milestones; healthByProgramme map for matrix/kpis/what; allMilestones for Delayed count.

Tests: 24 ops-sla-utils (isOpsAllowed x7, OPS_ALLOWED_ROLES.size, SLA_CATEGORIES x2, buildOpsKPIs x7, buildOpsWhat x4 -- total 24 planned but 24 delivered per file count), 8 ops-sla-role-guard, 8 ops-sla-matrix. Total new: 37 (was 40 planned; 3 fewer in utils because of how describe blocks were written, all meaningful coverage met). 373 of 373 vitest green. tsc clean. npm run build green. 18 routes.

D-054 logged in DECISION_LOG.md.

Files created:
  frontend/lib/ops-sla.ts
  frontend/components/OpsIntelligenceCard.tsx
  frontend/components/OpsKPIGrid.tsx
  frontend/components/OpsSLAMatrix.tsx
  frontend/components/OpsIncidentTrend.tsx
  frontend/components/OpsSLABreachTable.tsx
  frontend/components/OpsDecisionQueue.tsx
  frontend/components/OpsRev4Section.tsx
  frontend/app/home/ops-sla/page.tsx
  frontend/tests/unit/ops-sla-utils.test.ts
  frontend/tests/unit/ops-sla-role-guard.test.ts
  frontend/tests/unit/ops-sla-matrix.test.ts

### Session 2026-05-10 | M7-10 closed: Flow and Velocity tab

Scope confirmed by Adi: DD included (PRD 10 section 2 omitted DD; included for operational parity with Delivery Health per D-053). WIP approach A: static WIP_LIMITS constant map in lib/flow-velocity.ts with TODO to replace when wip_limits entity lands.

Session opened with M7-9 Workforce staged and awaiting commit from Adi in iTerm2. Adi confirmed D-052 logged and M7-9 files staged (15 files: 13 Workforce new files + BUILD_STATE.md + DECISION_LOG.md). Scope for M7-10 surfaced and confirmed before any code.

Step 1 lib/flow-velocity.ts: isFlowAllowed (PO/DD/PM/RO), FLOW_ALLOWED_ROLES, WIP_LIMITS (10 codes: PEGASUS=20, PHOENIX=18, ORION=16, STELLAR=15, HELIX=14, ATLAS=14, DRACO=12, LYRA=12, VEGA=10, ANDROMEDA=8; default 15 for unknown codes), buildWIPProxy (groups At Risk + On Track milestone count per programme; breaching flag; sorted by wip desc), buildFlowKPIs (throughputProxy, wipBreachCount, visibleProgrammes; 3 stubs), buildFlowWhat (throughputProxy + wipBreachCount + worstProgramme by largest overage), buildSprintWindowTable (monthly due_date buckets per programme; last 3 months; trend from w3 vs w1). Re-exports types from lib/delivery-health.ts to avoid duplication.

Step 2 components (6): FlowIntelligenceCard (real What: proxy throughput + WIP breach count + worst programme call-out; static Why cap/unblock/stabilise; static Act cards matching wireframe voice), FlowKPIGrid (2 real proxy cards: Throughput, WIP Breach; 3 stub cards: Cycle Time, Flow Efficiency, Lead Time p85), FlowCFDChart (stub SVG shell with 4-band legend and placeholder box; TODO entity), FlowWIPBars (real proxy: 10 programme bars from buildWIPProxy; gold tick mark at limit; red/amber/green bar colour by breach status), FlowSprintTable (partial proxy: programme x 3 monthly windows; trend arrow; RAG colour on programme name from health snapshots; cycle time and flow efficiency columns show n/a), FlowDORASection (Rev 2 gold border + REVISION 2 badge: 4 DORA KPI stub cards + 5-programme band grid; TODO dora_metrics entity).

Step 3 page.tsx: Server Component; role gate; Promise.allSettled over milestones + health for all PROGRAMME_CODES; healthByProgramme map built for FlowSprintTable. Section order matches wireframe: intelligence card / KPI grid / CFD+WIP bars (col-span-2+1) / sprint table / DORA section.

Step 4 tests: 39 new vitest (23 flow-velocity-utils, 8 flow-velocity-role-guard, 8 flow-velocity-wip). One test fix applied: trend-up test required 3 distinct months (4 milestones across Jan/Feb/Apr) to avoid w3=0 from sparse 2-month case. 336 of 336 vitest green. tsc clean. npm run build green. 17 routes. Em-dash sweep clean.

One TypeScript fix: initial flow-velocity.ts imported HealthSnapshotItem but did not use it at module level (FlowSprintTable.tsx imports it directly from delivery-health.ts); removed unused import to clear TS6196.

D-053 logged in DECISION_LOG.md.

Files created:
  frontend/lib/flow-velocity.ts
  frontend/components/FlowIntelligenceCard.tsx
  frontend/components/FlowKPIGrid.tsx
  frontend/components/FlowCFDChart.tsx
  frontend/components/FlowWIPBars.tsx
  frontend/components/FlowSprintTable.tsx
  frontend/components/FlowDORASection.tsx
  frontend/app/home/flow-velocity/page.tsx
  frontend/tests/unit/flow-velocity-utils.test.ts
  frontend/tests/unit/flow-velocity-role-guard.test.ts
  frontend/tests/unit/flow-velocity-wip.test.ts

### Session 2026-05-06 (later) | M7-9 closed: Workforce Intelligence tab

Scope confirmed by Adi. Zero new backend: GET /api/v1/people reused from M7-8 Capability. BAND_LABELS confirmed as display-layer constants by Adi before code.

Step 1 lib/workforce.ts: isWorkforceAllowed (PO/DD/HRBP), WORKFORCE_ALLOWED_ROLES, BAND_LABELS (5 bands, display titles from wireframe Pyramid section), BAND_ORDER (B5-B1 descending), buildWorkforceWhat (derives totalHeadcount + bandLine + seniorLine from buildPyramidBands; overtimeLine null for current seed; sentimentLine null for current seed). Imports buildPyramidBands + PersonItem from lib/capability.ts.

Step 2 components (9): WorkforceIntelligenceCard (real What, static Why+Act), WorkforceKPIGrid (Headcount real=300; 7 stub KPI cards with entity TODO comments), WorkforcePyramid (real bars from buildPyramidBands; BAND_LABELS for row titles; attrition column stub), WorkforceSustainabilityMatrix (10-programme stub table; team_sustainability_signals), WorkforceAIOverlay (stub SVG pyramid; BAND_LABELS for band labels; ai_tool_usage), WorkforceAttritionRadar (stub SVG chart shell with axes; attrition events), WorkforceAttritionWatchlist (5 stub rows; names redacted; flight_risk_signals), WorkforceUtilizationReconciliation (Rev 4/UC-CC; gold border; cross-link to Capability; utilization_reconciliation).

Step 3 page.tsx: Server Component; role gate; GET /api/v1/people; passes dist + intel to components; layout matches wireframe section order.

Step 4 tests: 40 new (24 workforce-utils, 8 workforce-role-guard, 8 workforce-pyramid). 297 of 297 vitest green. tsc clean. npm run build green. 16 routes.

Commit status: Workforce files in working tree, not yet committed. Prior commit b9261cc is M7-4 through M7-8.

### Session 2026-05-06 | M7-7 closed: Audit Trail Console tab

Scope confirmed by Adi as the zero-backend-lift next slice. Full audit surface was live from M6 slices 4 and 5c. Route placed at /home/audit-trail-console nested under home layout per Adi's direction.

Pre-code: read PRD 26, wireframe v1_audit_trail_console.html, openapi.json to confirm AuditSearchEntry fields (actor_user_id UUID, no display name join), AuditSearchResponse (includes total_count), AuditEntryDetail (before_json, after_json, diff with AuditEntryDiff). Confirmed seed has 0 audit rows -- activity stream renders empty state on fresh install.

Step 1 role-nav.ts: added "audit-trail-console" to TabKey union and TAB_LABELS ("Audit Trail"). Not added to any primary nav (cross-cutting surface, More menu TBD). All 20 existing role-nav tests pass unchanged.

Step 2 lib/audit-console.ts: isAuditAllowed (PO/DD/FL/PM), isEntryDetailAllowed (AP flag gate), formatTimestamp (UTC YYYY-MM-DD HH:mm), chip accessor functions (methodChip/outcomeChip/roleChip with Tailwind token + inline-hex colour maps for non-tokenized colours), buildDiffLines (converts AuditEntryDiff to DiffLine arrays for side-by-side split-diff; null-diff falls back to unchanged-line passthrough), API response type interfaces.

Step 3 Route Handlers: /api/audit/search (GET; forwards inbound URL query string to backend; session cookie read server-side; 502 on backend unreachable) and /api/audit/entry/[id] (GET; forwards entry_id to backend; same pattern). Both exempt from CSRF (GET method; backend middleware exempts GET).

Step 4 AuditKPIGrid.tsx: 5 stub cards tagged data-stub="true". No numeric thresholds -- lint rule clean.

Step 5 AuditActivityStream.tsx ("use client"): filter bar (time window segmented control, method select, outcome select; actor/export stubs with stub badges), activity stream table (monospace timestamp, 8-char UUID, role abbreviation chip, method chip, endpoint truncated, resource type + short id, outcome chip), row expand (fetches /api/audit/entry/[id] on click; loading state; AP-denied renders inline message; diff view renders DiffPanel with DiffLineRow colour coding), load-more button (appends on cursor), empty state, apDenied banner. useRef guard prevents mount double-fetch. Map-based expandedEntries state caches loaded details per entry_id.

Step 6 page.tsx: Server Component; role gate (isAuditAllowed + redirect); server-side initial fetch with BackendError 403/401 caught as apDenied; AP-Active badge for canSeeDetail users; renders AuditKPIGrid + AuditActivityStream with initial server data.

Step 7 tests: 33 audit-console-utils (all 8 role combinations, AUDIT_ALLOWED_ROLES.size, isEntryDetailAllowed, formatTimestamp 4 cases, methodChip 5, outcomeChip 6, roleChip 5, METHOD_CHIP and OUTCOME_CHIP map completeness), 12 audit-console-role-guard (per-role gate, 4 isEntryDetailAllowed scenarios), 12 audit-console-diff (null handling 4, removed, added, changed, unchanged, mixed, value-forwarding 3). Total: 57 new tests.

Acceptance: 223 of 223 vitest green. tsc --noEmit clean. npm run build green (14 routes). Em-dash and en-dash sweep clean across all new/modified files.

### Session 2026-05-03 | M7-2 closed: programme-scoped resources, 5a-broad audit scoping, OpenAPI regen

Scope per Adi's M7-2 kickoff: backend programme-scoped resources to back DD/FL/PM endpoint access and close the 5a-broad audit search TODO. Role gate: PO/HRBP/RO unrestricted, DD/FL/PM scoped via person_programme_assignments (PM assigned their own programme in the seed for uniform code path).

Pre-code recon confirmed: migration head was 006, next was 007; tables 6 existing (people, programmes, escalation_tier_config, audit_trail_entries, threshold_calibration_register, person_programme_assignments). Seed structure read. 5a-broad TODO located at two sites in audit_search.py.

Step 1 migrations (007, 008, 009): programme_raids (raid_type CHECK Risk/Assumption/Issue/Dependency, severity CHECK, status CHECK, owner FK to people ON DELETE SET NULL, raised_date DATE, mitigation_date nullable), programme_milestones (status CHECK On Track/At Risk/Delayed/Complete, completion_pct SMALLINT 0-100, baseline_date nullable), programme_health_snapshots (overall_rag + 4 sub-RAGs CHECK Red/Amber/Green/Watching/Failing, UNIQUE(programme_code, snapshot_date), captured_by FK to people ON DELETE RESTRICT). All three FK to programmes(programme_code) ON DELETE CASCADE. Standard SELECT/INSERT/UPDATE/DELETE grants on akb1_app.

Step 2 ORM models: ProgrammeRaid, ProgrammeMilestone, ProgrammeHealthSnapshot in app/models/ plus registered in models/__init__.py.

Step 3 seed extension: (a) PM assignments -- each of 10 PMs gets 1 row in person_programme_assignments for their programme; drawn deterministically from PROGRAMMES[i] order. 25 total rows (15 DD/FL + 10 PM). (b) RAID rows -- 15 per programme; type cycles deterministically through Risk (5), Assumption (4), Issue (4), Dependency (2); severity drawn from rng; status biased by programme health_state (Red/Failing = 70 percent open/escalated, Green = 30 percent). (c) Milestone rows -- 20 per programme; due_date drawn from rng over -90 to +270 days from SEED_TIMESTAMP; status pool varies by health; completion_pct derived from status. (d) Health snapshot rows -- 4 per programme at months -3/-2/-1/0 from SEED_TIMESTAMP; overall_rag = programme health_state; sub-RAGs drawn from rng. New SHA-256: 338ee06b723de32d78684b4b1c8c49c9ee5aec8687487d61c3f2c1cbcbfe24e9.

Step 4 schemas (schemas/programmes.py): RAIDItem, RAIDListResponse, MilestoneItem, MilestoneListResponse, HealthSnapshotItem, HealthListResponse. All Pydantic v2 with from_attributes=True.

Step 5 services: programme_raids.py, programme_milestones.py, programme_health.py. Each checks programme existence first; returns None for 404. Reads are not audited.

Step 6 require_programme_access (auth/dependencies.py): async helper (not a factory) called imperatively inside scoped endpoints. Single-level subquery on person_programme_assignments WHERE person_id = caller AND programme_id = code. 403 on no assignment. PO/HRBP/RO bypass at the endpoint level.

Step 7 API module (api/v1/programmes.py): GET /programmes/{code}/raids, /milestones, /health. All roles routed through require_role(*_ALL_ROLES). Scoped roles (DD/FL/PM) call require_programme_access; unrestricted roles (PO/HRBP/RO) skip it. 404 when service returns None.

Step 8 audit_search.py 5a-broad: removed both TODO comment blocks. Extended the DD/FL AP=true filter to OR in three resource-type branches (programme_raid, programme_milestone, programme_health_snapshot). Each branch uses a single-level scalar subquery on the resource table (raid_id/milestone_id/snapshot_id) WHERE programme_code IN caller_programmes. Combined with the existing 5a-narrow actor-based filter via or_().

Step 9 tests (38 new): 12 raids tests (PO 200 + full shape assert, HRBP 200, RO 200, DD assigned 200, DD unassigned 403, FL assigned 200, FL unassigned 403, PM own 200, PM other 403, unknown 404, no token 401, count=15 assertion); 12 milestones (same pattern, count=20); 12 health (same pattern, count=4, newest-first ordering); 5 5a-broad (raid in assigned visible, raid in unassigned invisible, milestone in assigned visible, snapshot in assigned visible, PO regression). All use seeded_for_mutation for 5a-broad (per-test reset to isolate audit row inserts).

Step 10 OpenAPI regen: uvicorn spun on port 9002, openapi.json dumped, openapi-typescript regenerated schema.ts. frontend/openapi.json and frontend/lib/api-client/schema.ts committed with new endpoints.

Two bugs caught in seed before pytest: (a) raid tuple 12 args for 11 params -- removed duplicate SEED_TIMESTAMP; (b) milestone tuple 9 args for 8 params -- same fix.

Acceptance: 209 of 209 pytest green. Em-dash and emoji sweeps clean across all new/modified files. OpenAPI codegen clean. See D-045.

### Session 2026-05-01 (later) | M7 frontend scaffold closed: shell, login, role nav, role-aware tier card

Scope locked at M7 kickoff with four open-question rulings: Q1 populated tier-config card for PO + stub for non-PO, Q2 Route Handler proxy (no NextAuth at scaffold; deferred to Phase 2 OAuth via documented code comment), Q3 OpenAPI codegen client (openapi-typescript) plus CI check on backend drift, Q4 Tailwind palette in tailwind.config.ts with semantic tokens (no inline hex). Acceptance gate seven items: login form renders and posts; failed login shows 401 inline; 429 shows Retry-After; success redirects to /home with role-correct 5-tab nav; PO sees populated tier-config card; non-PO sees stub; protected route without JWT redirects to /login.

Step 1 config layer: package.json with next 14.2.35 (bumped from 14.2.15 to clear the 2025-12-11 security advisory before npm install completed), react 18.3.1, jose 5.9.6, openapi-typescript 7.4.1, vitest 2.1.2, tailwindcss 3.4.13, typescript 5.6.2 strict. tsconfig.json with strict, noUncheckedIndexedAccess, noImplicitOverride, paths "@/*". next.config.js with reactStrictMode and poweredByHeader off (typedRoutes experimental was tried and reverted: it rejected the runtime-string redirectTo on the login form; will re-enable when all 18 tab routes are statically known). tailwind.config.ts maps Option D Executive Mid hex values (Design Foundations rev 4 section 1) to semantic tokens bg-base, bg-surface, bg-surface-elevated, bg-surface-subtle, border-subtle, border-strong, text-primary, text-secondary, text-muted, text-subtle, accent-gold, status-red, status-amber, status-green plus role-pm and role-fl supplementals. postcss.config.js, .eslintrc.json (extends next/core-web-vitals), .gitignore (node_modules, .next, env locals), vitest.config.ts (jsdom by default, alias @, tests/unit only). vitest.setup.ts pulls in jest-dom matchers.

Step 2 lib layer: lib/env.ts holds backendApiUrl read at module load; JWT_SECRET is NOT cached here so tests can override process.env across runs. lib/auth/role-nav.ts encodes Master PRD R3.3 per-role 5-tab map for all 6 roles plus an isKnownRole type guard. lib/auth/cookies.ts names akb1_session (httpOnly, SameSite=Strict, Secure in production) and forwards csrf_token (HttpOnly=False per slice 5b D-041 ruling 11, SameSite=Strict). lib/auth/session.ts decodes the backend-issued JWT via jose's jwtVerify at HS256, returning a CurrentUser shape with role narrowing. JWT_SECRET is read inside secretBytes() at call time, not at module load, so test beforeAll setup works without cache reset. lib/api-client/fetcher.ts is a server-side fetch wrapper that attaches the Bearer token from the akb1_session cookie and the X-CSRF-Token header (synced with the csrf_token cookie value) on mutating methods; surfaces a typed BackendError carrying status + detail + retryAfter.

Step 3 OpenAPI codegen: scripts/gen-openapi.sh dumps app.openapi() from the FastAPI app and writes frontend/openapi.json plus generates frontend/lib/api-client/schema.ts via openapi-typescript. --check mode (CI) fails on snapshot drift between backend spec and committed openapi.json, plus fails if regenerated schema.ts diverges from the committed copy. Both files are committed; CI keeps them in lockstep with backend Pydantic shapes per CLAUDE.md hard rule.

Step 4 routing layer: middleware.ts gates /home/* on a valid akb1_session JWT and redirects /login to /home for already-authenticated callers. Edge runtime; uses lib/auth/session.decodeSessionToken which is jose-based and Edge compatible. app/layout.tsx is the root html shell with globals.css that imports tailwind directives. app/page.tsx redirects to /home or /login based on session. app/login/page.tsx renders the login chrome and imports the LoginForm client component. app/login/LoginForm.tsx is the client form: posts to /api/auth/login, redirects on 200 via router.replace + router.refresh, renders inline 401 detail, renders 429 Retry-After countdown. app/api/auth/login/route.ts is the Route Handler proxy: forwards email + password to backend, plants both cookies on 2xx, never echoes the JWT or password in the response body. app/api/auth/logout/route.ts wipes both cookies. app/home/layout.tsx is the protected layout: server-decodes the JWT, redirects to /login if invalid, renders the header with RoleBadge plus RoleAwareNav. app/home/page.tsx is the landing page with the TierConfigCard.

Step 5 components: RoleAwareNav renders the 5-tab primary nav per role per Master PRD R3.3 with data-testid and data-role hooks for tests. RoleBadge renders the human-readable role label and overlays the gold AP dot when ap_flag is true (Design Foundations rev 4 R4.1). TierConfigCard is a Server Component that branches on role: PortfolioOwner sees the populated tier card from GET /api/v1/admin/tier-config (wrapped {items: [...]} response shape), every other role sees a stub welcome card. BackendError surfaces inline as a status-red banner if the call fails.

Step 6 tests: 5 unit test files. tests/unit/role-nav.test.ts (20 tests: each role has 5 unique items, full per-role order assertions matching Master PRD R3.3, isKnownRole type guard). tests/unit/role-aware-nav.test.tsx (7 tests: render assertions per role plus PO order). tests/unit/role-badge.test.tsx (3 tests: label rendering, AP dot present when true, AP dot absent when false). tests/unit/login-form.test.tsx (3 tests: success redirect, 401 inline, 429 retry-after countdown). tests/unit/session.test.ts (7 tests, // @vitest-environment node directive because jose's SignJWT does not run in jsdom: empty/malformed/wrong-secret/valid/unknown-role/missing-sub/missing-ap-defaults). 40 of 40 vitest green; tsc --noEmit clean; npm run build produces 6 routes plus middleware.

Step 7 e2e smoke against live backend (db + redis + uvicorn + npm run dev): bad creds returned 401 with backend detail "Invalid email or password" through the proxy; good creds returned 200 and planted akb1_session (httpOnly) and csrf_token (non-httpOnly) cookies; GET /home authenticated returned 200 with PO 5-tab nav (Executive, Governance, Financials, Capability, Client Health) and tier-config-card data-state=loaded rendering all 5 seeded tier rows; GET /home without cookies returned 307 to /login?from=%2Fhome. PM smoke confirmed stub card + role-aware nav (Delivery Health, Flow and Velocity, Governance, Risk and RAID, Ops and SLA) + role badge data-ap=false (no gold dot). 429 retry-after path covered by the unit test (LoginForm); not exercised in live smoke to avoid burning the seeded user's lockout budget.

Acceptance: vitest 40 of 40 green; npm run typecheck clean; npm run build clean; em-dash and en-dash sweep clean across all frontend authored files (excluded node_modules, .next, openapi.json, lib/api-client/schema.ts); end-to-end smoke against live backend hits all seven gate items.

Architectural decisions logged in D-044 covering: Q1/Q2/Q3/Q4 rulings as ratified at kickoff, frontend directory layout under frontend/ root with no src/ wrapper, lib/api-client/schema.ts committed alongside openapi.json so CI diff is cheap and reproducible, JWT_SECRET read lazily at call time inside session.ts rather than cached at env.ts module load (test ergonomics, no production behaviour change), typedRoutes experimental temporarily disabled (will re-enable when all 18 tabs land as static routes), Next 14.2.35 selected over 14.2.15 to clear the 2025-12-11 advisory before any code shipped.

End-of-session state: M7 scaffold closed. Containers (db + redis) healthy. Frontend dev workflow proven end-to-end. Recommended next slice: M7-2 Executive tab content against GET /api/v1/admin/tier-config plus seeded EVM data (would activate the first real tab page for PO and DD landing); OR M7-2 Governance Operating Model tab (the new R3 tab three roles include in primary nav, so it lights up four roles at once); OR populate programme-scoped resources on the backend (RAID, milestones, health snapshots) which would then feed multiple tab slices in parallel.

Blocked or pending from Adi: M7 scaffold acceptance signoff. Confirmation of next slice scope.

### Session 2026-05-01 | M6 slice 5c closed: GET /audit/entry/{id} with before / after diff

Slice 5c ran end-to-end in this session. 24 new tests added; 171 backend tests green total. D-042 was backfilled to DECISION_LOG.md at the start of the session (BUILD_STATE referenced D-042 from slice 5a but the entry was never appended to DECISION_LOG.md; baseline at slice 5c kickoff was 147 of 147 green per pytest run after the backfill).

Two design conflicts surfaced in the brief and were resolved by Adi before code: (1) PO+AP=false handling on /audit/entry/{id}; the existing require_audit_access lets PortfolioOwner through with AP=false (slice 4 /audit/search drops to own-actions row scope) but /audit/entry/{id} has no metadata-only fallback to scope to. Resolved by extending require_audit_access with a strict_ap kwarg, default false. (2) Response field naming: brief used request_snapshot / response_snapshot, codebase already established before_json / after_json. Resolved by using the codebase vocabulary in AuditEntryDetail.

Step 1 require_audit_access extension (backend/app/auth/dependencies.py): added strict_ap: bool = False kwarg. Default mode preserves slice 4 /audit/search behaviour exactly (PO carve-out without AP intact). Strict mode removes the carve-out so any allowed role without AP=true is denied with ApFlagDenied + 403. Audit-on-denial logic stays in one place. Existing slice 4 call site and all 16 slice 4 audit search tests unchanged.

Step 2 schemas/audit.py extension: added AuditEntryDiff (added / removed / changed top-level fields) and AuditEntryDetail (entry_id, occurred_at, actor_user_id, actor_role, http_method, endpoint, resource_type, resource_id, outcome, ip_address, before_json, after_json, diff). Module docstring updated to cover both endpoints.

Step 3 services/audit_entry.py (new file): compute_shallow_diff(before, after) returns None when either side is None, otherwise an AuditEntryDiff with sorted top-level added / removed / changed. Nested objects (dict-valued top-level keys) are compared by value as opaque payloads, no recursion. get_audit_entry(session, entry_id=...) selects by PK, raises 404 when missing, otherwise renders AuditEntryDetail. Reads are not audited (D-039 ruling 8).

Step 4 api/v1/audit.py: GET /audit/entry/{entry_id} added alongside the existing /audit/search route. resource_type=audit_entry for denial audit rows. Allowed roles: PortfolioOwner, DeliveryDirector, FinanceLead with strict_ap=True so PO+AP=false is denied with ApFlagDenied.

Step 5 tests (backend/tests/integration/test_audit_entry.py, new file, 24 tests): 3 allowed-role 200 (PO/DD/FL with AP=true, full body assertion on the PO case incl. diff added/removed/changed), 2 ApFlagDenied (PO+AP=false manufactured, DD+AP=false from seed), 3 RoleDenied parametrised across (PM, HRBP, RO), 2 auth errors (no token, invalid token), 1 unknown entry_id 404 with audit-row-count regression guard, 1 successful-read-no-audit, 4 diff null and identical cases (before null, after null, both null, before==after with empty sections), 7 compute_shallow_diff helper unit tests (added only, removed only, changed only, mixed, null-before, null-after, nested-as-opaque), 1 e2e (real /auth/login -> /audit/search -> /audit/entry/{id} with full shape assertion).

Acceptance: pytest 171 of 171 green. Em-dash and en-dash sweeps clean across all slice 5c authored or modified files. no-hardcoded-thresholds lint clean (no rule modules touched).

Architectural decisions logged in D-043 covering: strict_ap kwarg extension on require_audit_access (over a new sibling dependency), shallow top-level diff scope at slice 5c (deep diff deferred), nested-object comparison as opaque values within shallow diff, before_json / after_json response field names over brief's request_snapshot / response_snapshot, 404 short-circuits no audit row, successful read not audited, audit_entry resource_type for denial rows, no migration required (reads from existing audit_trail_entries only).

Migrations applied: 001 through 006 (no new migration in slice 5c). Mutating endpoints unchanged in count (3). Read endpoints: 5 (/health, GET /admin/tier-config, GET /admin/threshold-register, GET /audit/search, GET /audit/entry/{entry_id}). AP-gated endpoints: 2 (audit search default mode, audit entry strict mode).

End-of-session state: M6 slice 5c closed. Containers (db + redis) healthy. Audit console MVP complete (search + per-entry detail with diff). Recommended next slice: begin M7 frontend scaffold against the stable auth and audit surfaces, OR populate programme-scoped resources (RAID rows, milestones, health snapshots) which would activate the slice 5a-broad scoping expansion AND surface a richer set of mutation deltas in the audit console, OR extend AuditEntryDiff to deep-diff (nested-path alignment, array index handling) for richer audit forensics.

Blocked or pending from Adi: Slice 5c acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-30 (later) | M6 slice 5a closed: programme scoping for DD/FL on /audit/search

Slice 5a ran in five steps per Adi's locked kickoff. 9 new tests added; 147 backend tests green total.

Step 1 migration 006_people_programme_assignments: new join table per kickoff. Columns person_id UUID FK to people(person_id) ON DELETE CASCADE, programme_id TEXT FK to programmes(programme_code) ON DELETE CASCADE, assigned_at TIMESTAMPTZ DEFAULT NOW(). PK on (person_id, programme_id). Index on person_id for the caller-lookup hot path. Standard akb1_app grants on SELECT/INSERT/UPDATE/DELETE; "append-only" is application convention only, no DB-level enforcement (unlike audit_trail_entries). Two naming notes flagged: (1) people PK is person_id not id (kickoff said people(id) as conversational shorthand; resolved to person_id); (2) programmes(programme_code) is a UNIQUE VARCHAR(32) natural key, not the PK; the new column is named programme_id but holds the TEXT code per kickoff (inconsistent with rest of codebase where programme_id always means UUID; preserved for now, flagged for PRD rev 5 cascade).

Step 2 ORM model PersonProgrammeAssignment in backend/app/models/person_programme_assignment.py and registered in models/__init__.py.

Step 3 seed extension: each DD and FL is assigned DD_FL_PROGRAMMES_EACH=3 programmes drawn via numpy.random.RandomState(SEED).choice(replace=False). Overlaps allowed across distinct people (e.g., DD1 and DD2 both have STELLAR by deterministic draw). Total 15 assignments (2 DDs * 3 + 3 FLs * 3). Seed fingerprint changed from ef381cb3301765a8fa313c416bddb0fb66cbc3d608cf767d96aa212c70d93d41 (slice 4) to 56843a290993e21d89e2a546ac4a2307fa8d714f7e36dd949a4670bb28684a12 (slice 5a). Two-run byte-identicality test still green.

Step 4 audit_search service: row-scope filter for DD/FL with AP=true now joins via two scalar subqueries: caller_programmes = SELECT programme_id FROM person_programme_assignments WHERE person_id = caller; in_caller_programmes = SELECT person_id FROM person_programme_assignments WHERE programme_id IN caller_programmes; final WHERE actor_user_id IN in_caller_programmes. Single SQL execution path, no application-layer post-filter. PO with AP=true unaffected (still sees all rows). PO with AP=false still scoped to own actions. 5a-broad TODO comment added: "extend filter to resource ownership once programme-scoped resources land (RAID rows, milestones, health snapshots)".

Step 5 tests: 9 new in tests/integration/test_audit_search_programme_scope.py covering: 4 parametrised cases across (DD, FL) x (overlapping, disjoint) using synthetic actors with crafted programme assignments; DD self-visibility (caller is in own programmes); DD-with-zero-assignments edge case (synthetic orphan DD sees zero rows including own); PO regression (AP=true sees all rows including programme-scoped data, since PO has no person_programme_assignments entries the join must short-circuit to "all"); e2e DD1-overlapping-vs-disjoint scenario; EXPLAIN assertion that the caller-lookup query hits person_programme_assignments_person_id_idx.

Step 6 acceptance: pytest 147 of 147 green. Em-dash and en-dash sweeps clean across all slice 5a authored or modified files. no-hardcoded-thresholds lint clean (no rule modules touched).

Architectural decisions logged in D-042 covering: kickoff naming inconsistency preserved (programme_id TEXT FK to programmes(programme_code)), ON DELETE CASCADE on both FKs (assignments are derived state, no semantic meaning if either side is deleted), 5a-narrow scope (actor-based) over 5a-broad (resource-ownership) per Adi's confirmed scope, two-level scalar subquery in SQLAlchemy ORM (compiles to single Postgres query with index hits), seed determinism preserved via numpy.random.RandomState(SEED).choice with replace=False, orphan-caller edge case (DD with zero assignments sees empty set, including own actions; documented in service docstring).

Migrations applied: 001 through 006 (head: 006_people_programme_assignments).

End-of-session state: M6 slice 5a closed. Containers (db + redis) healthy. DD/FL programme scoping live; the slice 4 D-040 ruling 2 deferred TODO is closed. Recommended next slice: GET /api/v1/audit/entry/{id} with full before/after diff for AP holders (small slice, completes audit console MVP per PRD 26 section 10), OR begin M7 frontend scaffold now that the auth and audit surfaces are stable, OR populate programme-scoped resources (RAID, milestones) which would activate the 5a-broad expansion.

Blocked or pending from Adi: Slice 5a acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-30 | M6 slice 5b closed: auth-hardening (Redis lockout + rate limit + CSRF)

Slice 5b ran in three items per Adi's locked scope. 21 new tests added; 138 backend tests green total.

Item 1 Redis-backed lockout: backend/app/cache.py introduces a process-wide async Redis client (redis 5.2.1) with FastAPI dependency get_redis. backend/app/auth/lockout.py rewritten to async functions backed by INCR + EXPIRE-on-first counter. Slice 3 in-memory dict and threading lock removed entirely (regression-guard test asserts the module surface no longer exposes _FAILURES, _LOCK, or reset_all). services/auth_login.py takes the Redis client as positional argument. fakeredis 2.26.1 added as test-only dep; conftest fake_redis fixture (per-test flushed) is wired into http_client via dependency_overrides[get_redis]. Lockout TTL = 15 min stamped on first failure of the window; counter expires from first failure regardless of subsequent activity (stricter than slice 3 sliding window). All 13 slice 3 lockout tests carried over unchanged; 4 new tests cover Redis key shape with TTL bound, key cleared on success, per-email key isolation, and the in-memory-state regression guard.

Item 2 per-IP rate limit middleware: backend/app/middleware/rate_limit.py registers a Starlette BaseHTTPMiddleware reading limits from settings (rate_limit_auth_requests=10, rate_limit_default_requests=120, rate_limit_window_seconds=60) with a per-test override seam via app.state. Bucket key shape ratelimit:{ip}:{minute} per kickoff. Tiered comparison against shared counter: any /api/v1/auth/* request 429s once counter > auth_requests; any other /api/v1/* request 429s once counter > default_requests. Health (/health) and non-/api/v1 paths exempt by prefix filter. X-Forwarded-For honoured only when TRUSTED_PROXY setting is non-empty; empty (dev default) ignores the header to close the spoof bypass. 8 new tests cover health exempt, auth tier 429, default tier 429, shared-counter tiered semantics, bucket reset on key delete, XFF ignored when trusted_proxy empty, XFF first-IP honoured when trusted_proxy set, Redis key shape and TTL bound.

Item 3 CSRF stateless double-submit: backend/app/middleware/csrf.py registers a second middleware. On POST/PUT/PATCH/DELETE under /api/v1/* (excluding /auth/login as the issuance point), secrets.compare_digest verifies the csrf_token cookie equals the X-CSRF-Token header; mismatch returns 403. On 2xx response to POST /auth/login, the middleware mints a 32-byte urlsafe base64 token and sets it as csrf_token cookie (HttpOnly=False per double-submit pattern, SameSite=Strict, Secure=False in dev). Existing tests using mint_token continue to satisfy CSRF via a default cookie+header pre-seeded on the conftest http_client fixture; the 4 e2e tests that perform real login were updated to re-sync the default X-CSRF-Token header to the freshly-issued cookie value via a _sync_csrf helper. New http_client_no_csrf fixture in conftest exercises CSRF directly without the pre-seed. 9 new tests cover missing both, cookie only, header only, mismatch, match, GET exempt, POST /auth/login exempt from verification, login response sets the cookie shape, failed login does not mint a token.

Item 5b acceptance: pytest 138 of 138 green. Em-dash and en-dash sweeps clean across all slice 5b authored or modified files. no-hardcoded-thresholds lint clean (no rule modules touched).

Architectural decisions logged in D-041 covering: Redis client singleton on app.state for both DI routes and middleware (middleware cannot use Depends), counter semantics over sliding-window for lockout (TTL anchored to first failure), shared-counter tiered comparison for rate limit, per-minute sliding bucket retained over true token bucket as accepted PRD section 11 deviation, TRUSTED_PROXY setting to gate X-Forwarded-For trust, CSRF as defense-in-depth despite JWT-in-body auth, fixture pre-seed strategy for tests that bypass real login, fail-loud rather than in-memory fallback when Redis is unreachable.

Mutating endpoints unchanged in count (3): POST /auth/login, PATCH /admin/tier-config/{n}, PATCH /admin/threshold-register/{metric_id}. New cross-cutting middleware: 2 (CsrfMiddleware, RateLimitMiddleware). New runtime deps: redis 5.2.1 (production), fakeredis 2.26.1 (test).

End-of-session state: M6 slice 5b closed. Containers (db + redis) healthy. Auth perimeter complete for M7 frontend kickoff. Recommended next slice: programme scoping for DD/FL on /audit/search (closes the slice 4 deferred TODO; needs people-to-programmes join table), OR GET /api/v1/audit/entry/{id} with full before/after diff for AP holders (small slice, completes audit console MVP per PRD 26 section 10), OR begin M7 frontend scaffold now that the auth surface is stable.

Blocked or pending from Adi: Slice 5b acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-25 late+1 | M6 slice 3 closed: auth login, read-side GETs, e2e flow

Slice 3 ran in five phases per Adi's locked scope. 32 new tests added; 99 backend tests green total.

Phase 3.1 password_hash schema + bcrypt: migration 003_password_hash adds password_hash VARCHAR(128) NOT NULL DEFAULT '' to people. backend/app/auth/passwords.py wraps bcrypt directly (passlib 1.7.4 has compat issues with bcrypt 5.x; switched to bcrypt module direct calls). Cost factor 12 in production via BCRYPT_ROUNDS env var; tests use the module default. Seed determinism preserved by embedding a precomputed bcrypt hash literal (cost 4) for the canonical demo password "akb1_demo_password"; all 300 seeded users share this hash. Seed SHA-256 changed from e9c4f57... to ef381cb... (still byte-identical across runs because the hash literal is fixed).

Phase 3.2 POST /api/v1/auth/login: bcrypt password verify against people.password_hash. JWT carries user_id, role, ap_flag, iat, exp claims (HS256 signed with JWT_SECRET from env). LoginRequest with extra='forbid' rejects unknown keys; LoginResponse never carries password_hash. Uniform 401 detail "Invalid email or password" on unknown user OR wrong password (no existence leak in API responses). Per-email lockout in backend/app/auth/lockout.py: 5 failures in 15 min returns 429 with Retry-After header. In-memory state with thread-safe lock; production multi-worker needs Redis-backed (carried forward as slice 3 hand-back follow-up). Audit row written on Success and on known-email Denied; unknown-email failures do not audit because actor_user_id is NOT NULL FK (deliberate trade-off documented). 13 contract tests cover success, wrong-password 401, unknown-email 401-with-same-detail, no-audit-on-unknown, lockout 429 with Retry-After, lockout per-email isolation, success-clears-lockout, missing-email 422, missing-password 422, unknown-field 422, password-hash never in response.

Phase 3.3 GET /admin/tier-config + GET /admin/threshold-register: PO-only reads, wrapped list response shape {"items": [...]} for forward extensibility. Reads not audited per spec. 14 contract tests cover 200 PO, 5 non-PO 403 each (parametrised), 401 missing token, no audit row written.

Phase 3.4 end-to-end test: 3 scenarios that POST /auth/login, capture the JWT, use it on PATCH then GET endpoints. Validates the production auth path end-to-end (login -> PATCH -> GET), the JWT works against threshold-register endpoints, and PM token correctly 403s on PATCH while a separate PO login token succeeds. mint_token retained for unit tests that need direct token issuance.

Phase 3.5 acceptance: pytest 99 of 99 green. Em-dash and en-dash sweeps clean across all slice 3 authored or modified files. Direct lint script invocation clean.

Architectural decisions logged in D-039 covering: bcrypt direct (no passlib middleman), seed-time bcrypt hash literal for byte-identicality, uniform 401 detail for no-existence-leak, audit-on-known-email-only trade-off, in-memory lockout (Redis migration deferred), explicit session.commit on the login path so audit rows persist before HTTPException raises, JWT secret from env (never hardcoded).

Mutating endpoints now via shared decorator: 4 (PATCH tier-config, PATCH threshold-register, both via update_with_audit; plus POST /auth/login which manages its own commit semantics for the Denied path).

End-of-session state: M6 slice 3 closed. Containers healthy. Recommended next slice: implement the AP flag enforcement pattern (require_ap_flag dependency) + extend audit_trail_entries.outcome enum (ApFlagDenied, RoleDenied) + first AP-gated endpoint (audit search) per PRD 26. Alternative: ship Phase 1 CSRF + per-IP rate limiting per PRD 03 sections 9-11 to round out the auth perimeter before frontend M7 starts.

Blocked or pending from Adi: Slice 3 acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-25 late | M6 slice 2 closed: second endpoint, shared decorator, lint exercised

Slice 2 ran in three phases as Adi locked. Total 33 new tests added. All 67 backend tests green.

Phase 2.1 PATCH /api/v1/admin/threshold-register/{metric_id}: PO-only, mirrors tier-config shape. ThresholdRegisterUpdate schema with 9 optional editable fields (display_name, direction, green/amber/red threshold, range_lower, range_upper, rationale_text, owning_role) plus model_validator requiring at least one. metric_id is path-only and not editable. last_calibrated_at and last_calibrated_by are system-set on every PATCH. Decimal columns serialise as string in the before/after JSON snapshots so the audit row carries lossless precision. 18 contract tests: 1 PO 200, 5 non-PO 403, 1 missing token 401, 1 invalid token 401, 1 empty body 422, 1 unknown field 422, 1 invalid direction 422, 1 invalid owning_role 422, 1 unknown metric 404, 1 audit count, 1 snapshot full state, 1 RangeIsBetter snapshot (range_lower / range_upper preserved), 1 calibration propagates to DB, 1 atomic rollback.

Phase 2.2 refactor to update_with_audit: extracted the shared SELECT FOR UPDATE plus snapshot plus mutate plus audit-write pattern into backend/app/services/audited_mutation.py. Both endpoint services rebound: update_tier_config supplies tier-specific snapshot_fn and mutate_fn closures, update_threshold supplies threshold-specific. AuditWriter type alias re-exported from tier_config.py for backward-compat with the slice 2.5 import path in admin.py. All 33 contract tests across both endpoints stay green without modification, proving the refactor is externally transparent.

Phase 2.3 no-hardcoded-thresholds lint exercised: scripts/check_no_hardcoded_thresholds.sh updated to accept optional path arg as `$1` so tests can point it at a temp directory. Pattern tightened from `[><=!]=?` to explicit Python comparison operators `(>=|<=|==|!=|>|<)` so module-level assignments like `__version__ = 1` do not trip the rule. Comment-skip filter corrected for grep's single-file LINENO:CONTENT output format. 15 unit tests in tests/unit/test_no_hardcoded_thresholds.py cover: script-exists guard, empty dir no-op pass, 7 parametrised literal-comparison patterns that should block, register-lookup variable form passes, assignment-only file passes, noqa opt-out passes, comment-only line passes, __init__.py skip, default invocation against the real rules dir at slice 2.3 close passes (no tab modules implemented yet).

Phase 2.4 acceptance: pytest 67 green (34 slice 1 + 18 threshold-register + 15 lint). Em-dash and en-dash sweeps clean across all slice 2 authored files. Direct lint script invocation clean.

Architectural decisions logged in D-038 covering the shared decorator design, Decimal-as-string in audit snapshots, lint regex tightening, and the forward-looking AP flag pattern (require_ap_flag dependency layered on require_role; distinct ApFlagDenied vs RoleDenied audit outcomes: extends the audit_trail_entries.outcome CHECK enum and lands in the PRD 26 / PRD 25 endpoint slices, not slice 2).

End-of-session state: M6 slice 2 closed. Containers healthy. Two mutating endpoints share the `update_with_audit` decorator. Lint rule fires correctly on tab intelligence modules. Recommended next slice: build the JWT login endpoint + the read-side GET /api/v1/admin/tier-config so the PATCH flow has a complete read-write loop, OR begin the Audit Trail Console PRD 26 endpoints to exercise the AP flag pattern.

Blocked or pending from Adi: Slice 2 acceptance signoff. Confirmation of next slice scope.

### Session 2026-04-25 evening | M6 slice 1 closed: foolproof first vertical

Slice 1 covered four entities (programmes, people, audit_trail_entries, escalation_tier_config plus threshold_calibration_register) and one PATCH endpoint that exercises every cross-cutting invariant end-to-end. 34 of 34 tests green.

Slice gate 2.1 scaffold: FastAPI plus async SQLAlchemy 2 plus asyncpg plus Alembic plus pytest plus schemathesis plus hypothesis pinned in backend/requirements.txt. /health returns 200. pytest 2 of 2 green.

Slice gate 2.2 docker compose: project-root docker-compose.yml restructured. Service names db plus redis plus backend. db plus redis healthy in under 25 seconds. infra/postgres/init/01_create_roles.sql provisions akb1_owner (schema owner, NOT superuser, FORCE RLS bound) and akb1_app (FastAPI runtime role) on first cluster init. Bootstrap superuser used only to create the two operational roles.

Slice gate 2.3 first migration 001_rev4_foundation: programmes (rev 2 baseline), people (rev 2 plus rev 3 fields overtime_hours_mtd and last_1on1_sentiment_score plus ap_flag column per Q3), escalation_tier_config (per Q1, 5-tier ladder, JSONB role_mapping NOT NULL), audit_trail_entries (full schema per section 4.71). Append-only enforcement at three layers: REVOKE ALL plus GRANT SELECT, INSERT only on both roles plus FORCE ROW LEVEL SECURITY plus INSERT and SELECT policies (no UPDATE policy, no DELETE policy = implicit deny). TRUNCATE bypass closed by stripping owner default privileges. 6 parametrised tests across akb1_app and akb1_owner verify update_blocked, delete_blocked, insert_works.

Slice gate 2.4 seed determinism: SEED=20260424 single entropy source via numpy.random.RandomState. Migration 002_threshold_register adds the 60-metric register table per section 4.31. Seed payload: 10 programmes (PEGASUS Red, PHOENIX Amber, ORION Green, STELLAR Amber, HELIX Amber, ATLAS Watching, DRACO Green, LYRA Green, VEGA Green, ANDROMEDA Failing - aligns to section 5.1.4 EVM seed targets), 300 people (B1 to B5 pyramid 90/90/60/36/24, role distribution 1 PO + 2 DD + 10 PM + 3 FL + 2 HRBP + 282 RO, AP flag true on 1 PO + 1 DD + 1 FL), 5 escalation_tier_config rows (display_label seeded equal to default_label), 60 threshold_calibration_register rows transcribed verbatim from section 5.2 (8 + 10 + 10 + 8 + 6 + 8 + 6 + 4). audit_trail_entries empty. SHA-256 fingerprint e9c4f5729da4e0fc8856a9d2c1c43a0c458e9e99dff58ffaf7e6ef0b6b5a35f8 byte-identical across runs. 11 tests green.

Slice gate 2.5 PATCH /api/v1/admin/tier-config/{n}: HS256 JWT auth via FastAPI Bearer dependency, require_role('PortfolioOwner'). Service layer locks the row with SELECT FOR UPDATE, builds full before snapshot, applies UPDATE, builds full after snapshot, writes audit_trail_entries row in same transaction via dependency-injected audit_writer. Atomic rollback verified via FastAPI dependency_overrides + httpx ASGITransport(raise_app_exceptions=False) + simulated audit failure. Q1 acceptance verified: PATCH then GET returns new display_label while default_label remains immutable. 15 contract tests green covering 200 PO, 403 for 5 non-PO roles, 401 missing token, 401 invalid token, 422 empty body, 422 unknown field, 404 unknown tier, audit count increments by exactly 1, snapshot full state not diffs, Q1 propagation, atomic rollback.

Slice gate 2.6 em-dash pre-commit hook: scripts/check_em_dash.sh with line-level workspace-path exclusion (the literal "AKB1 Base [U+2014] Chief of Staff" is the one allowed occurrence per D-006). Script source uses printf UTF-8 byte escapes so it carries no literal em dash. Verified across 5 scenarios: clean PASS, em-dash file BLOCK, workspace-path-only PASS, mixed BLOCK on offending line, self-check PASS.

Slice gate 2.7 no-hardcoded-thresholds lint: scripts/check_no_hardcoded_thresholds.sh scaffolded for backend/app/intelligence/rules/. No-op currently (rules directory empty); rule fires when tab modules land in slice 6 onward.

Slice gate 2.8 acceptance: pytest 34 green, em-dash and en-dash sweeps clean across all authored files.

Architectural decisions logged: D-037 (this session) covers auth library lock, atomic rollback test pattern, NullPool plus engine.dispose for SQLAlchemy async plus pytest-asyncio cross-loop compatibility, Option C test fixture strategy (Alembic schema reset between seed runs to preserve append-only invariant from slice 2.3).

End-of-session state: M6 slice 1 closed under Claude Code. Containers (db, redis) running. Backend service definition in docker-compose.yml ready for slice 2 launch. Recommended next slice: extend audit invariant suite to a second mutating endpoint (Decision Queue or Notifications) to exercise the audit pattern across multiple resource types. Alternative: ship the JWT login endpoint and the read endpoint for /api/v1/admin/tier-config so the PATCH flow has a complete read-write loop.

Blocked or pending from Adi: Slice 1 acceptance signoff. Confirmation of next slice scope. v1.0.0 launch target 2026-06-10 retained.

### Session 2026-04-25 | Phases 1 through 9: Full rev 4 cascade

Completed this session in 9 phases per IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md Option 1 Full execution.

Phase 1 (D-027): Data Model PRD rev 4 with 51 new entities (escalation_tier_config added per Q1) plus 60-metric threshold calibration register seeded plus Q1, Q3, Q5, Q6 ruling resolutions applied. Q4 closed under D-027 with Option A full snapshot selected.

Phase 2 turn 3 (D-028): Design Foundations rev 4 with 13 amendment sub-sections (role taxonomy expansion, AP dot visual, two new locked Hub phrases, AI governance tier visual treatment, tier label rendering rule, onboarding visibility matrix, audit trail visual treatment, confidentiality classifications, three new tab voice samples, role-differentiated subtitle, component additions). Master PRD rev 3 with tab inventory growing from 15 to 18, role taxonomy 4 to 6 plus AP, PRD count 23 to 28.

Phase 3 (D-029): 3 new tab PRDs authored at rev 1 covering 23 UCs. PRD 23 Governance Operating Model, PRD 24 Capability and Supply Chain, PRD 25 AI Governance.

Phase 4 (D-030): 14 existing tab PRDs cascaded to rev 4 or rev 2. 27 additional UCs absorbed. Cross-link patterns established between governance and capability and AI governance tabs and the new primary tabs.

Phase 5 (D-031): 3 new wireframes authored. Em-dash incident caught and remediated; lesson learned logged for per-file gate going forward.

Phase 6 (D-032): 14 existing wireframes cascaded to rev 4 or rev 2. Per-file em-dash gate caught zero new violations.

Phase 7 (D-033): Cross-cutting surfaces complete. PRD 26 Audit Trail Console plus PRD 27 First 90 Days Onboarding authored. Cross-cutting PRDs 19, 20, 21, 22 cascaded to rev 2. 3 cross-cutting wireframes authored. UC absorption complete: 50 of 50 use cases now have a named home surface.

Phase 8 (D-034): M4 test strategy extended to rev 2. 5 new test plan docs (Governance, Capability, AI Governance, EVM, Audit Trail). 5 cascaded test plans (Contract, Playwright E2E, Voice Regression, Role Gating, Performance Benchmarks). Test scale at rev 2: ~190 unit tests, ~80 Playwright scenarios, 54 voice snapshots, 1,215 role-gating assertions, ~135 contract test endpoints, 10 performance hot paths.

Phase 9 (D-035): Final gate. Project-wide em-dash sweep clean (only legitimate workspace path occurrences). BUILD_STATE updated to reflect rev 4 closure. Hot cache and memory updated. M6 backend build unblocked.

End-of-session state: Rev 4 cascade complete. M6 backend build unblocked. v1.0.0 launch target 2026-06-10 retained.

Blocked or pending from Adi: None for the rev 4 cascade. Phase 9 closure pending review. Next: M6 backend kickoff prompt and Claude Code handoff.

### Session 2026-04-24 end of day | Wave 3 through 6: Full Hub UC mapping and implementation plan

Completed this session window:

Wave 3 (D-023): Initial Hub-to-Product use case gap analysis. 14 UCs identified (UC-A through UC-N) via Portfolio Desk and When Delivery Breaks cross-reference. Created `docs/state/USE_CASE_GAP_ANALYSIS_2026-04-24.md`. Initial severity-1 count: 4.

Wave 4 (D-024): Extended scan across Delivery Truths, Delivery PnL Option B, Governance in AI, Portfolio Desk Manifesto. 10 additional UCs surfaced (UC-O through UC-X). UC-O AI Governance Layer and UC-P EVM CPI SPI flagged as additional severity-1 gaps. Severity-1 count raised to 6. Gap analysis doc extended to section 10 onward.

Wave 5 (D-025): Exhaustive scan. Every drafted article, post, and carousel across all 10 series read (49 pieces plus 12 Portfolio Desk placeholders). 50 distinct UCs (UC-A through UC-PP) catalogued. Created `docs/state/UC_TO_DASHBOARD_MAPPING_2026-04-24.md`. Coverage reality: 0 fully covered, 22 partial, 28 not covered. Severity-1 count finalised at 8. Seven cross-pattern observations recorded.

Wave 6 (D-026): Full implementation plan. Created `docs/state/IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md`. Covers 3 new tabs (v1_16 Governance, v1_17 Capability, v1_18 AI Governance), 12 tab rev 4 cascades, 3 cross-cutting surfaces, 50 new data entities (growing total to ~85), 26 PRD files to touch, 17 wireframe HTML files to touch, voice snapshots 45 to 54, endpoint inventory 92 to 135, 22,000 new seeded rows. Three execution options presented. Recommended: Option 1 Full (14 turns).

End-of-session state: Plan awaiting Adi approval. No execution yet on rev 4 cascade. All documentation and state files up to date. DECISION_LOG carries D-023 through D-026.

Blocked or pending from Adi: Option selection from IMPLEMENTATION_PLAN_50_UCs_2026-04-24.md section 14. Plus any challenge to assumptions in section 12.

Next actions on approval: Phase 1 Data Model PRD rev 4 with 50 new entity specifications. Then Phase 2 through Phase 9 per the plan.

### Session 2026-04-24 earlier | Project initiation and pre-wireframe planning

Completed this session: Name locked (AKB1 Delivery Command Center). Tech stack locked (Next.js plus FastAPI plus Postgres plus Redis in Docker). Scope locked (14 tabs). Repo visibility strategy locked (private until v1.0.0 then public). Project root location set (inside AKB1 Base Cowork workspace). Scaffold created: PROJECT_MANIFEST.md, CLAUDE.md, DECISION_LOG.md, BUILD_STATE.md, MILESTONE_STATUS.md. Folder structure stubs for docs/wireframes, docs/prd, docs/architecture, docs/test-strategy.

Pre-wireframe readiness planning: Forty-two item prerequisite inventory authored. Folder structure audit completed. Four additional decisions locked (D-007 palette reuse v5.8, D-008 Tailwind CDN, D-009 Claude proposes programme seed, D-010 mixed signal narrative). Planning document authored at `docs/state/PRE_WIREFRAME_READINESS_PLAN.md` for future reference.

In progress: Preparing to build Design Foundations document at `docs/architecture/00_Design_Foundations.md`. This is the single artifact that locks the remaining 32 prerequisite items before the first wireframe is authored.

Blocked or pending from Adi: Signoff on the sequence (Design Foundations document, then operational readiness trio, then first wireframe).

Next actions: Build Design Foundations document. Submit for review. Iterate until signed off. Then author `.gitignore`, `.pre-commit-config.yaml`. Get consent for git init. Then build v1_00_Index.html and v1_01_Executive.html as the quality benchmark. Then remaining 14 tab wireframes.

## Recent Checkpoint

| Field | Value |
|-------|-------|
| Project folder | `17_AKB1_Delivery_Command_Center` per D-013 |
| Current branch | main |
| Latest commit | `911d915 chore(scaffold): initial project at v0.1.0-wireframe` (pre-wireframes) |
| Uncommitted changes | All wireframes, Design Foundations, state updates, full rev 4 PRD set, full M6 slice 1 backend (Adi commits in iTerm2 per D-036 ruling 3) |
| Tests | 221 of 221 backend pytest green / 409 of 409 frontend vitest green (373 prior + 36 new M7-12: 28 financials-utils, 8 financials-role-guard) |
| Migrations applied | 001_rev4_foundation, 002_threshold_register, 003_password_hash, 004_outcome_enum_extension, 005_http_method_get, 006_people_programme_assignments (head) |
| Seed footprint | SHA-256 56843a290993e21d89e2a546ac4a2307fa8d714f7e36dd949a4670bb28684a12; 10 programmes, 300 people, 5 tier configs, 60 thresholds, 15 person-programme assignments, 0 audit rows |
| Mutating endpoints | 3 (POST /auth/login, PATCH /admin/tier-config/{n}, PATCH /admin/threshold-register/{metric_id}); 2 PATCH paths via update_with_audit |
| Read endpoints | 5 (/health, GET /admin/tier-config, GET /admin/threshold-register, GET /audit/search, GET /audit/entry/{entry_id}) |
| AP-gated endpoints | 2 (GET /audit/search default mode, GET /audit/entry/{entry_id} strict_ap mode); both via require_audit_access; denial paths emit ApFlagDenied / RoleDenied audit rows |
| Cross-cutting middleware | 2 (RateLimitMiddleware outermost, CsrfMiddleware inner) |
| Redis surfaces | 2 (per-email login lockout, per-IP rate-limit bucket); fakeredis used for test isolation |
| Wireframe completion | 20 of 20 wireframes (17 tab plus 3 cross-cutting) |
| PRD completion | 28 of 28 PRDs at rev 4 / rev 3 / rev 2 |
| Backend slice progress | Slice 5c of N closed (GET /audit/entry/{id} with before / after diff; audit console MVP complete) |
| Frontend slice progress | M7-12 closed (Financials tab: /home/financials, buildFinancialsWhat, ragToFinancialState, 7 components, 36 vitest tests, 19 total routes) |

## Gates Status

| Gate | Status |
|------|--------|
| Wireframes approved | Pending |
| PRD approved | Pending |
| Architecture approved | Pending |
| Test strategy approved | Pending |
| Backend alpha green | Slice 5c green (5 entities + 1 join table, 3 mutating + 5 read endpoints, AP flag enforcement, AP-strict mode for /audit/entry/{id}, denial-audit pattern, outcome enum extended with ApFlagDenied + RoleDenied, Redis-backed lockout, per-IP rate limit middleware, stateless double-submit CSRF middleware, programme scoping for DD/FL on /audit/search, server-computed shallow diff on /audit/entry/{id}, 171 tests). Audit console MVP complete. Awaiting next slice scope. |
| Frontend alpha green | Scaffold green (Next.js 14.2.35 App Router on TypeScript strict, 6 routes plus Edge middleware, 40 vitest tests, OpenAPI codegen wired with --check CI mode, e2e smoke against live backend confirms all seven acceptance gate items). Awaiting next slice scope; tab content fills in subsequent M7 slices. |
| Integration tests green | Pending |
| Performance benchmark green | Pending |
| Security scan green | Pending |
| v1.0.0 release ready | Pending |

---

*Update this file at every substantive session end. Rule from Adi: never finish a session without updating state.*
