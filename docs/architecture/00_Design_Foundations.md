# 00_Design_Foundations.md
### AKB1 Delivery Command Center v1 | Design DNA | Revision 4 | Updated: 2026-04-25

> Revision 4 extends the design DNA to cover the 51 new data entities, 3 new primary tabs (Governance Operating Model, Capability and Supply Chain, AI Governance), 3 cross-cutting surfaces (Audit Trail Explorer, Board Pack export variant, First 90 Days Onboarding), the expanded role taxonomy (Delivery Director, HR Business Partner, Audit Permission flag), and the 60-metric threshold calibration register. Two additional locked Hub phrases added. Revision 3 content preserved verbatim below.
>
> Revision 3 aligned voice and positioning with the AKB1 LinkedIn Hub content. "Governance is a revenue lever" framing locked into product copy. "Amber equals steering" framing applied to intelligence layer voice samples. New voice samples added for Decision Velocity, Bus Factor, Scope Debt, and Value Realisation metrics. Replaced revision 2.

---

## Part 1: Visual system

### 1. Colour palette (Option D Executive Mid, locked D-018)

Unchanged from revision 2. `bg-primary #242D3D`, `bg-surface #2E3849`, `bg-surface-elevated #3A4454`, `bg-surface-subtle #2A3446`, `border-default #3A4454`, `border-strong #4A5568`, `text-primary #F1F5F9`, `text-secondary #CBD5E1`, `text-muted #A0AEC0`, `text-subtle #718096`, `accent-gold #F5B800`, `status-green #10B981`, `status-amber #F59E0B`, `status-red #EF4444`.

### 2. Typography, spacing, grid, icons, charts

Unchanged. Inter, JetBrains Mono, 4pt spacing, 12-column grid, Lucide, Recharts.

---

## Part 2: Component patterns

### 5. Core components

Unchanged from revision 2. Card, filter bar, role-scoped 5-tab nav, intelligence layer, drill affordance, role badge, status chip, empty state, error state, search palette, notifications bell, exports, as-of date picker.

### 5.4 Intelligence layer (voice revised, D-019)

Three-column What Why Act strip unchanged. Content contract unchanged. **Voice now aligned to Hub framing** per section 11 revision 3.

---

## Part 3: Data foundations

Unchanged from revision 2 plus the seven new entities per Data Model PRD revision 3 (team sustainability, scope debt, value realisation, estimation baselines, AI defect attribution, vendor rationalisation queue, QBR records).

---

## Part 4: Language and voice (revision 3, Hub-aligned)

### 11. Intelligence layer voice samples

Revised to match Hub framing. Five samples covering Executive, Delivery Health, P and L Cockpit (retained from rev 2) plus two new samples for gap-closure metrics.

#### 11.1 Executive Overview (Hub-aligned)

**What does this tell me**
Portfolio gross margin held at 19.2 percent, down 60 basis points from last month. We saw this moving into amber three weeks ago and we are steering. Three programmes dragging the blend. Decision latency at 9 days against a 2-day target is the single largest unlocked margin lever.

**Why is this happening**
1. 42 percent. Pegasus milestone slip pushed revenue recognition by 4 weeks. Steerco has been sitting on the recovery decision for 11 days.
2. 31 percent. Orion replaced two B4 Senior Managers at lower blended rates. Replacement plan approved but the hire decision pending for 7 days.
3. 27 percent. Stellar absorbed a scope expansion without price adjustment. CR reprice decision pending for 14 days, past SLA.

**What do I do this week**
1. Clear the Pegasus recovery decision in Thursday steerco. Ship 2-day decision latency discipline. Rajiv. Due Thu 30 Apr 2026.
2. Approve Orion replacement hiring immediately. Meera. Due Mon 27 Apr 2026.
3. Reprice Stellar scope. Priya. Due Tue 28 Apr 2026.

Voice note: "we saw this in amber and we are steering" reframes the decline as a signal being acted on, not a passive metric. This is the Hub thesis: amber equals steering.

#### 11.2 Delivery Health (Hub-aligned)

**What does this tell me**
Delivery is green on seven of ten programmes, amber on two, red on one. The Delivery Health Index composite at 74 is two points below target. Pegasus velocity has dropped three sprints in a row. Team sustainability on Pegasus flagged amber on bus factor and overtime hours. Green on metrics, amber on reality.

**Why is this happening**
1. 55 percent. Pegasus senior developer exited, bus factor dropped from 3 to 1 on the payment module. Overtime hours 62 percent of team above 45 hours per week.
2. 28 percent. Phoenix regulatory audit pulling two senior engineers off delivery into compliance work.
3. 17 percent. Stellar test environments unstable, blocking story closure.

**What do I do this week**
1. Rebuild Pegasus pod with 2 replacement hires starting Monday, cap overtime immediately. Rajiv. Due Mon 28 Apr.
2. Cap Phoenix compliance draw to 20 hours per week, backfill with 2 contractors. Kiran. Due Wed 29 Apr.
3. Stabilise Stellar test environments or freeze new story starts. Meera. Due Thu 30 Apr.

Voice note: "green on metrics, amber on reality" is the Hub's central warning. Team sustainability signals surface the hidden state before metrics catch up.

#### 11.3 P and L Cockpit (Hub-aligned)

Retained from revision 2. Four leakage drivers plus contingency reserve visibility. Voice unchanged.

#### 11.4 Decision Velocity section (NEW)

**What does this tell me**
Decision queue has 14 items open, 7 past the 2-day SLA target. Average decision latency at 9.3 days. The Pegasus recovery decision is stuck for 11 days and is the single biggest margin lever in the current quarter.

**Why is this happening**
1. 52 percent. Steerco meets monthly, decisions accumulate between cadence.
2. 30 percent. Decision ownership ambiguous on 4 items. No single accountable owner.
3. 18 percent. Escalation path unclear on 3 items, stuck at programme level.

**What do I do this week**
1. Move Pegasus steerco from monthly to fortnightly. Rajiv. Due Mon 27 Apr.
2. Assign single accountable owner to the 4 stuck decisions. Priya. Due Tue 28 Apr.
3. Close the Pegasus recovery decision in Thursday steerco. Rajiv. Due Thu 30 Apr.

Voice note: Hub Proposition A Part 2: "fortnightly decision forum beats monthly status review." Dashboard surface of the same operating model.

#### 11.5 Value Realisation section (NEW)

**What does this tell me**
Portfolio value realisation score at 62, against a target of 70. Three programmes delivered on time and on budget but did not achieve the business case outcome. McKinsey research cites 0.5 percent of programmes deliver intended value. The dashboard exists to avoid that trap.

**Why is this happening**
1. 45 percent. Atlas Banking: on-time at 96 percent but client NPS at 58, expansion revenue zero. Execution green, outcome amber.
2. 35 percent. Helix Retail: delivered features not aligned to current client strategy, outcome attestation declined.
3. 20 percent. Phoenix: compliance work delivered, regulatory value realised, but operational value not yet measured.

**What do I do this week**
1. Book Atlas QBR with client CFO to surface expansion opportunity. Priya. Due Fri 02 May.
2. Commission Helix outcome review. Review client strategy shifts. Rajiv. Due Wed 29 Apr.
3. Confirm Phoenix operational value measurement plan with client audit team. Kiran. Due Thu 30 Apr.

Voice note: "execution green, outcome amber" is the Hub framing. On-time on-budget is necessary but not sufficient.

### 12. Action verb taxonomy

Unchanged from revision 2.

### 12.1 Hub voice phrases locked into product copy (NEW)

These five phrases from the AKB1 LinkedIn Hub appear in the product surface where contextually appropriate:

| Phrase | Placement |
|--------|-----------|
| "Governance is a revenue lever, not overhead" | README first paragraph, About page |
| "Green on metrics, red on reality" | Executive tab intelligence layer when amber-state variance exceeds 100 bps |
| "Amber equals steering. Red means we failed to decide in amber." | Intelligence layer help text, hover tooltip |
| "Ten seconds. What is your current margin and what is driving the variance?" | Finance Lead onboarding tooltip on first login |
| "Delivery excellence is the retention argument" | Client Health Radar tab subtitle |

These phrases make the product voice feel like Adi wrote it rather than generic SaaS copy.

---

## Part 5: Structure and governance

### 13 to 17. Unchanged from revision 2

Cross-tab link graph, confidentiality, operational readiness, wireframe review protocol, exit criteria. Unchanged.

---

*Revision 3 owner: Claude. Signoff: Adi. Voice alignment with AKB1 LinkedIn Hub content complete.*

---

## Revision 4 amendments (2026-04-25)

All revision 3 content above is preserved unchanged. Revision 4 content below is additive.

### R4.1 Role taxonomy expansion

Revision 4 introduces two new named roles and one permission flag to the design system. Each inherits visual treatment and voice conventions from the existing roles. None requires a new colour or chip style; the existing role badge pattern is sufficient.

| Role | Badge label | Badge colour token | Scope notes |
|------|-------------|--------------------|--------------|
| Portfolio Owner | PO | accent-gold | Existing, unchanged |
| Delivery Director | DD | text-primary on bg-surface-elevated | New, senior-across role. Directly above PM in the ladder |
| Programme Manager | PM | text-primary on bg-surface | Existing, unchanged. Own-programme scope |
| Finance Lead | FL | text-primary on bg-surface | Existing, unchanged |
| HR Business Partner | HRBP | text-primary on bg-surface | New, scoped to people and capability surfaces |
| Read Only | RO | text-muted on bg-surface | Existing, unchanged |
| Audit Permission (flag) | AP (added to PO, DD, or FL badge as a small gold dot) | accent-gold dot | Not a role, a flag. Visual: the carrying role's badge plus a 4px gold dot in upper-right corner. Hover tooltip reads "Audit permission enabled" |

Roles that do not carry Audit Permission show no dot. The AP dot is the only visual cue that a calling user can read `audit_trail_entries` in full.

### R4.2 Threshold calibration register (60 metrics)

Source of truth: `docs/prd/01_PRD_Data_Model.md` section 5.2 (Threshold calibration register seed). The 60 metrics and their green, amber, and red thresholds are locked into the seed at v1.0.0. Every intelligence layer rule reads thresholds from `threshold_calibration_register` rather than hardcoding values. Calibration edits happen through the Admin Console and audit through `audit_trail_entries`.

Design rule: no tab-level code or component may embed a threshold value. If a surface renders a green, amber, or red state, the state assignment must originate from a register lookup. This is enforceable via a lint rule (`no-hardcoded-thresholds`) in M4 test strategy rev 2.

The 60 metrics break down as 8 Executive and Portfolio, 10 Governance, 10 Delivery Health, 8 Financials and PnL, 6 Commercial, 8 People and Capability, 6 Risk and SLA and Client Health, 4 AI and Innovation. Ownership of calibration changes follows the role column in the seed table.

### R4.3 Hub phrases locked into product copy (revision 4 additions)

The revision 3 table in section 12.1 lists 5 phrases. Revision 4 adds 2 more, bringing the total to 7:

| Phrase | Placement |
|--------|-----------|
| "Governance that does not decide is theatre" | v1_16 Governance Operating Model tab subtitle. Also the header of the Cadence Theatre Detection panel |
| "The director sees across. The delivery manager walks each one" | v1_01 Executive tab rev 4 subtitle when rendered in Portfolio Owner or Delivery Director role. PM role still sees the rev 3 subtitle |

These phrases are verbatim, never paraphrased, never re-ordered. Voice regression tests in M4 test strategy rev 2 add golden snapshots that assert the phrases appear unchanged in the product surface.

### R4.4 AI governance tier visual treatment

The rev 4 entity `ai_use_case.risk_tier` uses the same Green, Amber, Red chip as status-green, status-amber, status-red. No new colour tokens. Risk tier drives the visual state of the AI Use Case chip and the row-level row-strip accent on v1_18 AI Governance.

One addition: the AI Governance tab uses a small 4px gold accent-gold border on the left edge of every row that has `approval_status = Pending AND risk_tier = Red`. This draws the eye to the governance-critical backlog without introducing a new colour. No other tab uses this treatment.

### R4.5 Tier label rendering (per Q1 ruling)

Every surface that shows an escalation tier (escalation contract panel, escalation timing chip, decision routing tooltip) reads `display_label` from `escalation_tier_config` at render time. Factory default labels ("DM", "Programme Director", "Portfolio Owner", "Sponsor", "Steerco") render until a tenant edits them through the Admin Console.

Design rule: no component hardcodes a tier name. The tier number can be used internally but the display string is always a register lookup.

Deactivated tiers render greyed-out in the Admin Console tier list but do not appear in escalation contract dropdowns.

### R4.6 Onboarding visibility (per Q5 ruling)

The First 90 Days Onboarding surface renders differently depending on caller:

| Caller | View |
|--------|------|
| Owning user (self) | Own checklist, editable. Primary self-service view. Large week-by-week accordion |
| Portfolio Owner | All new joiners this quarter plus progress summary. Click a user to see their checklist read-only. Can filter by programme and by DD |
| Delivery Director | Same as Portfolio Owner but default filter is scoped to programmes the DD is accountable for |
| HR Business Partner | Same as Portfolio Owner with an additional filter for band and geo; used for cohort pacing |
| Programme Manager | Only new joiners allocated to the PM's programme. Read-only. Indicator of checklist completion used in 1 on 1 preparation |

Voice treatment: the PO, DD, HRBP, and PM views use neutral third-person reporting voice ("Kiran has completed 12 of 30 items, on track for Week 4"). The self view uses direct second-person action voice ("Complete the Finance access request by end of week 2").

### R4.7 Audit trail voice and visual treatment

Audit Trail Explorer surface is monospaced-first and purpose-dense. Rows are single-line by default with hover-expand to full before/after JSON. Visual treatment: `bg-surface-subtle` row background, JetBrains Mono font for method, endpoint, and resource_id. Timestamp in local timezone with UTC hover tooltip.

Voice: no intelligence-layer narrative on this surface. Audit is factual and terse. If a row needs additional context it is surfaced as a technical note on hover, not as a What/Why/Act narrative.

### R4.8 Confidentiality rules (revision 4 additions)

Revision 3 confidentiality rules in section 14 stand. Revision 4 adds the following entity classifications:

| Entity | Classification | Notes |
|--------|---------------|-------|
| `dm_retention_conversation` | Restricted | Visible only to the row's Portfolio Owner and the originating DD. Note text is encrypted at rest via Postgres pgcrypto column-level encryption. Never exported |
| `audit_trail_entries` | Confidential | Visible to AP-flag holders only. Included in exports only when the caller has AP true and the export is explicitly audit-scoped |
| `ai_shadow_survey` | Confidential | Visible to PO with AP flag, DD with AP flag, or Risk Committee role. Not included in standard Steerco Pack export |
| `onboarding_checklist` | Restricted per-row | Self and PO and DD and HRBP and own-programme PM only. Not exported in any standard pack |
| `sponsor_engagement` | Internal | Sponsor names and scores visible to PO, DD, PM, FL. Not exported outside steerco pack |

### R4.9 Voice samples for new tabs

Three new tab-level voice samples follow. Each follows the What Why Act pattern and cites the Hub article that anchors it.

#### R4.9.1 Governance Operating Model (v1_16)

**What does this tell me**
Four of ten programmes are operating with stale or theatre cadences. RACI gap percent at 12 on the portfolio. Decision latency weighted average at 7.4 days, past the 2-day target. Escalation contracts on Pegasus and Helix last validated more than 180 days ago and are effectively unenforceable.

**Why is this happening**
1. 48 percent. Monthly steerco cadence on Pegasus and Phoenix means decisions accumulate between meetings. Both crossed the Theatre threshold this quarter.
2. 32 percent. RACI gaps concentrated in vendor handoff workstreams on Pegasus and Stellar. Three activities have no named accountable.
3. 20 percent. Escalation contract staleness on Pegasus and Helix means tier authority defaults to steerco, lengthening resolution time.

**What do I do this week**
1. Move Pegasus and Phoenix to fortnightly steerco. Rajiv. Due Mon 27 Apr.
2. Assign accountable owners to the 3 vendor-handoff RACI gaps on Pegasus and Stellar. Priya. Due Tue 28 Apr.
3. Re-validate escalation contracts on Pegasus and Helix. Meera. Due Thu 30 Apr.

Voice note: "Governance that does not decide is theatre." Anchored by S04P2 and S04P5. The tab exists to make theatre visible.

#### R4.9.2 Capability and Supply Chain (v1_17)

**What does this tell me**
Bench headcount at 30, of which 12 are aging beyond 21 days and 3 are at risk above 45 days. Two programme-critical skill gaps on Orion and Helix with no bench-to-demand match above 60. DM succession coverage is thin on 4 of 15 DMs. Hiring funnel for 3 senior engineering roles is stalled past 90 days.

**Why is this happening**
1. 42 percent. Pegasus roll-off of 4 engineers last month created a bench cluster at senior band, but the demand is for mid-band cloud skills. Skill mismatch.
2. 33 percent. DM succession gap on Meera, Kiran, Rajiv, and Priya is not backfilled. Single point of failure across 6 programmes.
3. 25 percent. Senior engineering hiring in Hyderabad BFSI market is slow; time to fill above 90 days.

**What do I do this week**
1. Reskill 6 senior-band bench to cloud SRE via 3-week intensive. Priya. Due kickoff Mon 27 Apr.
2. Open formal DM succession programme with 4 named ready candidates as successors. Rajiv. Due Wed 29 Apr.
3. Escalate hiring vendor panel expansion to bring 2 more search firms into the senior engineering funnel. Kiran. Due Thu 30 Apr.

Voice note: bench and capability are strategic, not operational. Per Portfolio Desk Part 05 and S05P1.

#### R4.9.3 AI Governance (v1_18)

**What does this tell me**
200 AI use cases across 10 programmes. 20 classified Red risk tier, of which 8 are Pending approval. Shadow IT survey this quarter discovered 5 previously undisclosed tools in use on Phoenix and Helix. Quality gate pass rate is 88 percent, below the 95 percent target.

**Why is this happening**
1. 45 percent. The 8 Pending Red-tier cases lack completed bias assessments. 5 of them are customer-facing response generators on Phoenix.
2. 35 percent. Shadow tools on Phoenix and Helix surfaced through the survey, not through proactive governance. Current onboarding of AI tools is team-initiated.
3. 20 percent. Quality gate drift on Helix: two approved use cases have not been re-validated in 90 days.

**What do I do this week**
1. Complete bias assessments on the 8 Pending Red-tier cases. Kiran. Due Fri 02 May.
2. Move from quarterly shadow survey to monthly, and publish the survey results to steerco. Rajiv. Due Mon 27 Apr.
3. Re-validate the 2 stale Helix quality gates. Priya. Due Wed 29 Apr.

Voice note: AI governance is distinct from AI adoption. Per S03 Parts 1 through 4 and S02P3.

### R4.10 First-view treatment for Portfolio Owner and Delivery Director

Per R4.3, the v1_01 Executive tab subtitle for PO and DD roles reads "The director sees across. The delivery manager walks each one." This replaces the rev 3 subtitle for those two roles only. PM role retains the rev 3 subtitle ("What has changed and what do I do this week").

The v1_16 Governance Operating Model subtitle reads "Governance that does not decide is theatre." unchanged across all roles.

### R4.11 Component additions for rev 4

| Component | New or extended | Purpose |
|-----------|------------------|---------|
| Cadence Card | New | Summarises a single governance cadence (type, attendance, decisions made, state). Used on v1_16 |
| RACI Cell | New | Single-cell renderer for the RACI matrix; colour-codes responsible, accountable, consulted, informed; gap and overlap state |
| EVM Quartet | New | Renders CPI, SPI, TCPI, EAC in a 4-up mini-chart layout. Used on v1_02 and v1_06 |
| Bench Aging Strip | New | Horizontal strip showing bench days distribution with 21-day and 45-day markers |
| Risk Tier Chip (AI) | New | Green, Amber, Red chip variant applied to AI use cases. Same palette as status chip |
| Audit Row | New | Monospaced single-line row with hover-expand to full JSON pre- and post-state |
| Audit Permission Dot | New | 4px gold dot overlay on the role badge when AP flag is true |
| Tier Label Display | Extended | Reads `display_label` from `escalation_tier_config` at render time |

All new components inherit Inter, JetBrains Mono, 4pt spacing, and the Option D palette. No new typography or spacing tokens introduced.

### R4.12 Voice hold-outs

The following are NOT part of the locked Hub phrase list and can be rephrased by developers if the product voice needs to adjust at implementation time:

- Intelligence layer action verbs (clear, approve, ship, close, cap, stabilise, book, commission, confirm, reskill, open, escalate, move, re-validate). Section 12 action verb taxonomy still governs.
- Numeric thresholds shown in text (e.g. "2-day SLA", "90 days"). These derive from `threshold_calibration_register` and will update automatically when the register changes.
- Programme names (Pegasus, Phoenix, Orion, Stellar, Helix, etc.) remain fictional and are shared across voice samples and seed data per D-009.

### R4.13 Exit criteria (revision 4 addition)

Revision 4 signoff requires:
1. Adi approves the 60-metric threshold calibration register seed as locked for v1.0.0 (contents in Data Model PRD section 5.2).
2. Adi approves the two new Hub phrases at R4.3.
3. Adi approves the role taxonomy additions (DD, HRBP, AP flag) as named in R4.1.
4. Adi approves the tab subtitle rendering rule (R4.10).
5. Adi approves the three new tab voice samples at R4.9.
6. Adi approves the confidentiality classifications at R4.8.

On signoff, the next Phase 3 action writes the three new tab PRDs (v1_16, v1_17, v1_18) citing this Design Foundations revision 4 as the voice and component anchor. Phase 4 then cascades 12 existing tab PRDs to rev 4. Phase 5 and 6 author and cascade wireframes.

---

*Revision 4 owner: Claude. Signoff: Adi (pending Phase 2 close review). Voice and visual additions cover 51 new entities, 3 new tabs, 3 cross-cutting surfaces, expanded role taxonomy, and the 60-metric threshold register.*
