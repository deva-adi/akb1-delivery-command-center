# 00_Design_Foundations.md
### AKB1 Delivery Command Center v1 | Design DNA for all 16 wireframes and v1 production build | Author: Claude | Created: 2026-04-24

> The single document that locks every design decision before the first wireframe is authored. Every wireframe inherits from this file. Every PRD references it. Every React component in M7 maps back to it. If something is not in this document, it is not in the product.

---

## Part 1: Visual system

---

## 1. Colour palette

Reused from v5.8 AKB1 with explicit hex values locked. Dark navy primary, gold accent, traffic-light status colours.

### 1.1 Base and surface

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0B1220` | Page background |
| `bg-surface` | `#111827` | Card background |
| `bg-surface-elevated` | `#1F2937` | Modal, popover, elevated panel |
| `bg-surface-subtle` | `#0F172A` | Section background inside cards |
| `border-default` | `#1F2937` | Card border, divider |
| `border-strong` | `#334155` | Focus ring, strong divider |

### 1.2 Text

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#F1F5F9` | Headlines, KPI numerics |
| `text-secondary` | `#CBD5E1` | Body text, labels |
| `text-muted` | `#94A3B8` | Secondary labels, help text |
| `text-subtle` | `#64748B` | Tertiary annotations |

### 1.3 Accent (gold)

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-gold` | `#F5B800` | Primary accent, brand mark, CTA |
| `accent-gold-hover` | `#FFCA40` | Hover state |
| `accent-gold-muted` | `#78350F` | Background tint |

### 1.4 Status (traffic lights)

| Token | Hex | Usage |
|-------|-----|-------|
| `status-green` | `#10B981` | Healthy, on track, within target |
| `status-amber` | `#F59E0B` | Watchful, approaching threshold |
| `status-red` | `#EF4444` | At risk, breach, critical |
| `status-blue` | `#3B82F6` | Informational, neutral callout |
| `status-purple` | `#8B5CF6` | New, emerging, experimental |

### 1.5 Chart palette (categorical)

For Recharts series colours. Six hues, accessibility-checked against dark background.

| Slot | Hex | Use for |
|------|-----|---------|
| `chart-1` | `#60A5FA` | Primary series |
| `chart-2` | `#F5B800` | Secondary series |
| `chart-3` | `#10B981` | Tertiary, healthy |
| `chart-4` | `#F87171` | Alert, loss |
| `chart-5` | `#A78BFA` | Category 4 |
| `chart-6` | `#34D399` | Category 5 |

### 1.6 Accessibility contrast summary

All foreground and background combinations above meet WCAG AA for normal text (4.5:1). Bold and large text combinations hit AAA (7:1). Status colours against `bg-surface` all clear 4.5:1.

---

## 2. Typography

### 2.1 Font stack

| Role | Family | Licence |
|------|--------|---------|
| UI and body | Inter | Open Font Licence, free for commercial and open source |
| Numeric display | Inter with `font-feature-settings: "tnum"` (tabular numerals) | Same |
| Monospace | JetBrains Mono | Apache 2.0 |

Fallback: `-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

### 2.2 Type scale

| Role | Size | Line height | Weight |
|------|------|-------------|--------|
| Display | 40px | 48px | 700 |
| H1 | 32px | 40px | 700 |
| H2 | 24px | 32px | 600 |
| H3 | 20px | 28px | 600 |
| Body large | 16px | 24px | 400 |
| Body | 14px | 20px | 400 |
| Small | 12px | 16px | 500 |
| Micro | 11px | 14px | 500 |
| KPI numeric | 36px | 40px | 600, tabular numerals |

### 2.3 Weights

400 regular, 500 medium, 600 semibold, 700 bold. No 300 or 800.

---

## 3. Spacing, grid, radius, shadow

### 3.1 Spacing scale (4-point base)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`. Tailwind equivalents `1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`.

### 3.2 Grid

12-column responsive grid. Gutter 24px. Container max-width 1440px. Page padding 32px on desktop, 16px on mobile.

### 3.3 Breakpoints

| Name | Width | Typical device |
|------|-------|---------------|
| sm | 640 | Small tablet |
| md | 768 | Tablet |
| lg | 1024 | Small desktop |
| xl | 1280 | Desktop |
| 2xl | 1536 | Large desktop |

Primary target: lg and xl. Dashboard does not run on phone.

### 3.4 Border radius

| Token | Size | Usage |
|-------|------|-------|
| `radius-sm` | 4px | Buttons, chips |
| `radius-md` | 8px | Cards, inputs |
| `radius-lg` | 12px | Large cards, popovers |
| `radius-xl` | 16px | Modals, drawers |

### 3.5 Shadow

Subtle elevation. Cards do not float heavily.

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | Card default |
| `shadow-md` | `0 4px 8px rgba(0, 0, 0, 0.4)` | Hover, active card |
| `shadow-lg` | `0 12px 24px rgba(0, 0, 0, 0.5)` | Modal, drawer, dropdown |

---

## 4. Icon and chart libraries

| Library | Choice | Rationale |
|---------|--------|-----------|
| Icons | Lucide React 0.383 | v5.8 continuity, open licence, tree-shakable, 1000+ icons, consistent 24px grid |
| Charts | Recharts 2.x | v5.8 continuity, React-native, composable, Tailwind-friendly, good animation defaults |
| Motion (optional) | Framer Motion (M7) | For drill panel slide-in and chart animations |

Icon sizes: `16px` (inline), `20px` (button), `24px` (card header), `32px` (hero).

---

## Part 2: Component patterns

---

## 5. Core components

Every component follows the design system locked above. Specific behaviour and variants below.

### 5.1 Card

Container for a single logical unit of information on a tab.

Structure: header row (title, icon, status chip, drill handle), body (KPI or chart or list), optional footer (action link, last-updated timestamp).

Padding: 20px. Radius: `radius-md`. Background: `bg-surface`. Border: 1px solid `border-default`. Shadow: `shadow-sm`.

Variants: standard, compact (12px padding), hero (32px padding), inline (no border, no shadow, for grid cells).

### 5.2 Filter bar

Horizontal strip above every tab. Left-aligned filters, right-aligned role badge.

Standard filters, from left to right:
Geo (dropdown, multi-select), Programme (dropdown, multi-select), Time Window (segmented control: MTD, QTD, YTD, Rolling 12M), Role View (read-only indicator).

State: global. Changing a filter on one tab propagates to all tabs via Redux or Zustand.

Sticky at top: yes. Background: `bg-surface`. Height: 56px.

### 5.3 Tab navigation

Horizontal top bar grouped into three clusters, locked by role.

Group 1 Leadership: Executive, Delivery Health, Risk and RAID, Workforce, Financials, P and L Cockpit.
Group 2 Operations: Flow and Velocity, AI and Innovation, Commercial Pipeline, Backlog Health, Scenario Planner, Ops and SLA.
Group 3 Deep Dive (new tabs): Multi-Vendor Scorecard, Change Impact, Client Health Radar.

Visual: three cluster labels above the tabs, gold accent on the active tab, muted on inactive, hidden on role-gated tabs.

Height: 48px. Placement: below filter bar.

### 5.4 Intelligence layer (the core value prop)

Three-column strip rendered at the top of every tab, beneath the filter bar, above the first card grid.

Column 1 What does this tell me: headline size H3 in `accent-gold`, body size body in `text-secondary`, max 3 sentences descriptive.

Column 2 Why is this happening: headline size H3 in `accent-gold`, body is a numbered list of 3 drivers, each with a contribution percentage in `text-primary` and a one-line explanation in `text-secondary`.

Column 3 What do I do this week: headline size H3 in `accent-gold`, body is 3 action cards stacked, each showing verb, owner, and deadline. Verb in `text-primary`, owner as avatar chip, deadline as small text in `status-amber` if within 3 days.

Height: 240px min, auto-expand. Padding 24px per column. Dividers between columns 1px `border-default`.

Copy voice: Adi executive tone. Direct, no fluff, industry vocabulary, specific names and numbers.

### 5.5 Drill affordance

Every drillable element (KPI, card, chart series, table row) has a drill handle.

Visual: right-arrow Lucide icon (`ArrowUpRight`) in the top-right corner of the element, 16px, `text-muted` by default, `accent-gold` on hover.

Interaction: click opens the drill panel as a right-side slide-in drawer. Drawer width 40 percent of viewport, max 720px. Breadcrumbs at top of drawer show the drill path.

Drill paths defined per tab in each tab PRD. Example: Executive summary KPI (portfolio margin) drills to Financials tab margin waterfall, then drills to a specific programme, then drills to a specific month, then drills to a specific leakage driver.

### 5.6 Role badge

Top-right of filter bar. Shows which role the current user is viewing as.

Format: colour-coded chip with role name. Portfolio Owner in `accent-gold`. Programme Manager in `status-blue`. Finance Lead in `status-purple`. Read Only in `text-muted`.

Click opens role switcher (in demo, switches the view). Production locks this to actual role.

### 5.7 Status chip

Inline badge used anywhere a single-value status is shown.

Format: 6px dot in status colour, plus word in `text-primary`. "Green", "Amber", "Red", "Breach", "New", "On track", "At risk".

Size: small by default (height 20px, padding 4px 8px).

### 5.8 Empty state

Shown when a tab has no data for the current filter combination.

Visual: centred, max-width 480px. Lucide icon `FolderOpen` 48px `text-muted` at top. Headline H3 `text-secondary`. Two sentence body `text-muted`. Single button in `accent-gold` with action label.

### 5.9 Error state

Shown when a data fetch fails.

Visual: similar to empty state, icon `AlertTriangle` in `status-red`. Headline in `status-red`. Body explains the error and offers retry.

---

## Part 3: Data foundations (canonical seed)

---

## 6. Ten programme seed table

All names fictional, public-safe. No resemblance to any real client or engagement.

| # | Programme name | Client (fictional) | Geo | TCV (USD M) | Contract type | Start | End | State | Why this state |
|---|----------------|--------------------|-----|-------------|---------------|-------|-----|-------|-----------------|
| 1 | Atlas Banking Transform | Helvetia BNK | EU plus India | 42 | Outcome | 2024-06 | 2027-05 | Amber | Two senior attritions this quarter, pyramid integrity at risk |
| 2 | Helix Retail OMS | Nordweave Stores | Nordics plus India | 28 | Time and Materials | 2024-09 | 2026-08 | Green | On track, 104 percent billable utilisation, CSAT 4.7 |
| 3 | Pegasus Healthcare Cloud | Meridian Health Group | US plus India | 55 | Fixed Price | 2024-03 | 2026-12 | Breach | SLA missed three months, credit exposure 380K |
| 4 | Orion Insurance Modernization | Sentinel Mutual | US plus India | 38 | Outcome | 2024-11 | 2027-10 | Amber | Scope expansion absorbed, margin down 2.4 points |
| 5 | Nova Telecom BSS | Aurora Mobile | APAC plus India | 22 | Time and Materials | 2025-01 | 2026-09 | Green | Ahead of plan, margin 28 percent, client NPS 62 |
| 6 | Quantum Manufacturing Data Platform | Ironbridge Industries | EU plus India | 18 | Fixed Price | 2024-08 | 2026-06 | Green | Tracking to plan, zero RAID items above amber |
| 7 | Vega Energy Grid Analytics | Aurora Utilities | EU plus India | 32 | Outcome | 2024-07 | 2027-03 | Amber | Regulatory scope addition pending re-pricing |
| 8 | Lyra Airlines Ops Digitization | Skybridge Airways | EU plus APAC plus India | 24 | Time and Materials | 2025-03 | 2026-10 | Amber | Three-vendor integration complexity, two open high risks |
| 9 | Phoenix Pharma Regulatory Cloud | Caelum Pharma | US plus EU plus India | 48 | Outcome | 2024-04 | 2027-06 | Red | Auditor flagged compliance gap, deadline in 45 days |
| 10 | Stellar Logistics Visibility | Globestride Cargo | Global plus India | 30 | Time and Materials | 2025-02 | 2026-11 | Red | Absorbed 3 scope changes without price adjustment, margin down 4.2 points |

Distribution check against D-010 mixed signal narrative: 3 green, 4 amber, 2 red at risk, 1 in active breach. Confirmed.

Total TCV: 337 M USD. Portfolio blended margin target: 21 percent. Current actual: 19.2 percent.

---

## 7. 300-person pyramid

Standard IT services pyramid.

### 7.1 Band distribution

| Band | Level | Count | Percent | Typical blended rate USD per hour |
|------|-------|-------|---------|-----------------------------------|
| B5 | Principal / Architect | 9 | 3.0 | 180 |
| B4 | Senior Manager / Senior Architect | 21 | 7.0 | 130 |
| B3 | Manager / Tech Lead | 45 | 15.0 | 95 |
| B2 | Senior Engineer / Senior Consultant | 90 | 30.0 | 65 |
| B1 | Engineer / Consultant | 135 | 45.0 | 40 |
| **Total** | | **300** | **100.0** | **Blended 58** |

### 7.2 Geo distribution

| Geo | Count | Percent |
|-----|-------|---------|
| India | 210 | 70.0 |
| US | 45 | 15.0 |
| EU | 30 | 10.0 |
| APAC | 15 | 5.0 |

### 7.3 Role family distribution

| Family | Count | Percent |
|--------|-------|---------|
| Engineering (Dev, SRE, DevOps) | 165 | 55.0 |
| Data and analytics | 45 | 15.0 |
| Quality and testing | 30 | 10.0 |
| Delivery (PM, SM, Lead) | 30 | 10.0 |
| Architecture | 15 | 5.0 |
| Business analyst and product | 15 | 5.0 |

### 7.4 Allocation distribution

| Status | Count | Percent |
|--------|-------|---------|
| Fully allocated to one programme | 210 | 70.0 |
| Split across two programmes | 54 | 18.0 |
| Bench (available) | 30 | 10.0 |
| On leave or LOA | 6 | 2.0 |

### 7.5 Attrition rolling 12 months

Annualised attrition: 14.2 percent. Regretted: 9.1 percent. Voluntary non-regretted: 3.8 percent. Involuntary: 1.3 percent.

Hotspots: B2 Senior Engineer attrition at 18.4 percent (above portfolio average). India geo attrition at 16.1 percent.

---

## 8. Twenty-five vendor seed

Fictional partner firms. Used in Multi-Vendor Scorecard tab.

| # | Vendor | Type | Count of active programmes |
|---|--------|------|----------------------------|
| 1 | Altair Systems | Platform | 3 |
| 2 | Axiomata | Boutique consulting | 2 |
| 3 | BlueHelm Consulting | Strategy plus delivery | 4 |
| 4 | Brightforge Labs | Niche engineering | 2 |
| 5 | Cantata Digital | Design plus digital | 1 |
| 6 | Ceruleo Tech | Data platform | 3 |
| 7 | Draco Solutions | Offshore delivery | 5 |
| 8 | Elytra Services | Managed services | 2 |
| 9 | Finch Software | Product vendor | 1 |
| 10 | Glassio | SaaS platform | 2 |
| 11 | Halcyon Stack | DevOps and SRE | 2 |
| 12 | Ironclad Engineering | Niche integration | 1 |
| 13 | Kestrel Data | Analytics | 2 |
| 14 | Luminare | UX and research | 1 |
| 15 | Mistral Labs | AI and ML | 1 |
| 16 | Northwind Engineering | Staff augmentation | 4 |
| 17 | Oakstream | Security specialist | 1 |
| 18 | Plexus Works | Integration platform | 2 |
| 19 | Quartermaster IT | Infrastructure | 2 |
| 20 | Redpath Services | Managed operations | 3 |
| 21 | Stellaris Networks | Networking and cloud | 1 |
| 22 | Tarmigan Systems | Banking vertical SME | 1 |
| 23 | Vantara Stack | Cloud native | 2 |
| 24 | Vireo Cloud | Hyperscaler reseller | 1 |
| 25 | Zenith Delivery | Global delivery partner | 4 |

Each vendor carries performance scores on delivery, quality, SLA adherence, and cost. Distribution matches programme states.

---

## 9. Twelve-month financial shape template

### 9.1 Portfolio level monthly shape

| Month (rolling) | Revenue booked (USD M) | Revenue billed (USD M) | Revenue collected (USD M) | Direct cost (USD M) | Indirect cost (USD M) | Gross margin percent | Net margin percent |
|-----------------|------------------------|------------------------|---------------------------|---------------------|----------------------|----------------------|--------------------|
| M-11 | 28.1 | 26.8 | 24.9 | 20.5 | 3.2 | 23.8 | 16.4 |
| M-10 | 28.6 | 27.1 | 25.3 | 20.8 | 3.2 | 23.7 | 16.3 |
| M-9 | 29.2 | 27.6 | 25.9 | 21.3 | 3.3 | 23.6 | 16.2 |
| M-8 | 29.7 | 28.2 | 26.4 | 21.7 | 3.3 | 23.5 | 16.1 |
| M-7 | 30.1 | 28.5 | 26.8 | 22.1 | 3.3 | 23.3 | 15.9 |
| M-6 | 30.4 | 28.8 | 27.1 | 22.5 | 3.4 | 22.9 | 15.7 |
| M-5 | 30.6 | 29.0 | 27.4 | 22.9 | 3.4 | 22.4 | 15.3 |
| M-4 | 30.8 | 29.2 | 27.6 | 23.3 | 3.5 | 21.8 | 14.9 |
| M-3 | 30.9 | 29.4 | 27.8 | 23.7 | 3.5 | 21.1 | 14.4 |
| M-2 | 31.0 | 29.5 | 28.0 | 24.1 | 3.5 | 20.3 | 13.9 |
| M-1 | 31.1 | 29.6 | 28.2 | 24.4 | 3.6 | 19.6 | 13.5 |
| M (current) | 31.2 | 29.7 | 28.3 | 24.6 | 3.6 | 19.2 | 13.2 |

Narrative: portfolio revenue growing slowly. Costs rising faster. Gross margin compressing from 23.8 to 19.2 over 12 months. This is the story the intelligence layer narrates on the Executive and Financials tabs.

### 9.2 Programme level shape

Each programme gets its own 12-month shape, proportional to its TCV and state. Green programmes show stable margin. Amber programmes show declining margin. Red and breach programmes show sharp decline in the last 3 months.

Full per-programme shapes will be generated by the seed generator at M6. The shape rule: `margin(m) = base_margin + state_delta(m)`, where base_margin is derived from TCV and contract type, and state_delta reflects the programme's current state.

---

## 10. Distributions for RAID, SLA, change requests, client health

### 10.1 RAID distribution

Portfolio total open RAID items: 150.

| Severity | Open count | Aging more than 30 days |
|----------|-----------|-------------------------|
| High | 18 | 7 |
| Medium | 54 | 22 |
| Low | 78 | 30 |

By programme, the 3 red and breach programmes (Pegasus, Phoenix, Stellar) carry 42 percent of the high-severity risks.

### 10.2 SLA state

Portfolio tracks 60 SLA metrics across 10 programmes.

| Status | Count | Percent |
|--------|-------|---------|
| Green (within target, last 3 months) | 38 | 63.3 |
| Amber (threshold breached once) | 14 | 23.3 |
| Red (threshold breached twice) | 5 | 8.3 |
| Breach (threshold breached 3 plus, penalty triggered) | 3 | 5.0 |

All 3 breach entries belong to Pegasus Healthcare programme. Total penalty exposure: 380K USD.

### 10.3 Change request distribution

Portfolio has 100 change requests over 12 months.

| Category | Count | Margin impact USD K |
|----------|-------|---------------------|
| Approved and repriced | 62 | Positive 1240 |
| Approved without price adjustment | 18 | Negative 520 |
| Pending approval | 12 | n/a |
| Rejected | 8 | n/a |

The 18 unpriced approvals surface on the Change Impact tab as the "scope creep eating margin silently" story.

### 10.4 Client health signals

Portfolio tracks four proxy signals per programme: escalations, missed executive meetings, ticket age trend, NPS last measured.

| Programme | Escalations (last 90 days) | Missed exec meetings | Ticket age trend | NPS last measured |
|-----------|----------------------------|---------------------|------------------|-------------------|
| Atlas Banking Transform | 2 | 0 | Flat | 58 |
| Helix Retail OMS | 0 | 0 | Improving | 67 |
| Pegasus Healthcare Cloud | 7 | 2 | Worsening | 41 |
| Orion Insurance Modernization | 3 | 1 | Worsening | 52 |
| Nova Telecom BSS | 0 | 0 | Flat | 62 |
| Quantum Manufacturing Data Platform | 1 | 0 | Flat | 64 |
| Vega Energy Grid Analytics | 2 | 0 | Flat | 55 |
| Lyra Airlines Ops Digitization | 3 | 1 | Worsening | 49 |
| Phoenix Pharma Regulatory Cloud | 5 | 2 | Worsening | 44 |
| Stellar Logistics Visibility | 4 | 1 | Worsening | 47 |

Client Health Radar tab converts these four signals into a composite health score and flags programmes where the composite drops below threshold.

---

## Part 4: Language and voice

---

## 11. Intelligence layer voice samples

Three worked examples, one per tab type, written in Adi executive tone. These set the voice for all remaining tabs.

### 11.1 Sample: Executive Overview tab

**What does this tell me**
Portfolio margin held at 19.2 percent this month against a 21 percent target. Three programmes are dragging the blended average. Utilisation is stable at 82 percent, but the billable mix is softening.

**Why is this happening**
1. Pegasus Healthcare slipped a milestone this month and pushed revenue recognition by four weeks. Contribution to variance: 42 percent.
2. Orion Insurance replaced two B4 Senior Managers at a lower blended rate after attrition. Contribution to variance: 31 percent.
3. Stellar Logistics absorbed a scope expansion without a price adjustment. Contribution to variance: 27 percent.

**What do I do this week**
1. Escalate the Pegasus milestone slip in the Thursday client steerco. Owner: Rajiv. Deadline: 2026-04-30.
2. Reprice the Stellar scope expansion and recover the margin. Owner: Priya. Deadline: 2026-04-28.
3. Move two B3 Tech Leads into Orion at blended rate parity. Owner: Meera. Deadline: 2026-04-27.

### 11.2 Sample: Delivery Health tab

**What does this tell me**
Delivery is green on seven of ten programmes. Three are off-plan. Velocity has dropped on Pegasus for three consecutive sprints. SLA breaches are concentrated in one programme.

**Why is this happening**
1. Pegasus Sprint velocity fell 28 percent after the senior developer exit. Contribution: 55 percent.
2. Phoenix regulatory audit has pulled two senior engineers off delivery into compliance work for 40 hours per week. Contribution: 28 percent.
3. Stellar integration test environments are unstable, blocking story closure. Contribution: 17 percent.

**What do I do this week**
1. Rebuild the Pegasus pod with two replacement hires starting Monday. Owner: Rajiv. Deadline: 2026-04-28.
2. Cap Phoenix compliance draw to 20 hours per week and backfill the audit work with two contractors. Owner: Kiran. Deadline: 2026-04-29.
3. Stabilise Stellar test environments or freeze new story starts until done. Owner: Meera. Deadline: 2026-04-30.

### 11.3 Sample: P and L Cockpit tab

**What does this tell me**
Gross margin this month at 19.2 percent, down 60 basis points from last month and 460 basis points from the trailing high 12 months ago. Revenue is stable. Cost is rising faster than revenue. Margin waterfall shows leakage concentrated in four drivers.

**Why is this happening**
1. Direct cost grew 3.1 percent month on month due to replacement hires at higher blended rates. Contribution: 48 percent.
2. Unbilled WIP rose to 2.8 M USD, up from 1.9 M last month, due to milestone slips. Contribution: 29 percent.
3. Non-billable training and bench days rose 17 percent as bench hit 10 percent. Contribution: 23 percent.

**What do I do this week**
1. Clear the 2.8 M unbilled WIP with client sign-off on delayed milestones by Friday. Owner: Rajiv. Deadline: 2026-04-30.
2. Shift 30 percent of bench resources to two new commercial opportunities in the pipeline. Owner: Priya. Deadline: 2026-04-29.
3. Enforce blended rate ceiling on replacement hires across India geo. Owner: Meera. Deadline: 2026-04-30.

### 11.4 Voice rules (for all remaining tabs)

No em dashes. No emojis. No pleasantries. No "we need to" unless followed by specific action. No "key takeaways" or "synergies" or "leverage." Always specific numbers, specific names, specific deadlines. Contribution percentages in the Why column sum to 100. Action verbs in the Act column are imperative (Escalate, Reprice, Move, Rebuild, Cap, Stabilise, Clear, Shift, Enforce).

---

## 12. Action verb taxonomy

Every "What do I do this week" action uses one of the locked verbs.

| Category | Verbs |
|----------|-------|
| Commercial | Reprice, Recover, Hold, Negotiate, Renew, Upsell |
| Delivery | Replan, Rebuild, Stabilise, Freeze, Unblock, Cap |
| Financial | Clear, Recognise, Accrue, Writeoff, Defer |
| People | Move, Backfill, Promote, Reassign, Release, Hire |
| Governance | Escalate, Enforce, Audit, Approve, Reject |
| Client | Escalate, Align, Realign, Apologise (rarely), Commit |

Never use: "explore", "consider", "look into", "investigate further" unless paired with a deadline and owner.

---

## Part 5: Structure and governance

---

## 13. Cross-tab link graph

Every tab links to at least two other tabs through the drill affordance or through contextual "related" links in the footer.

```
Executive ---> Delivery Health, Risk RAID, Financials, P and L Cockpit
Delivery Health ---> Risk RAID, Workforce, Flow and Velocity, Ops and SLA
Risk RAID ---> Delivery Health, Client Health Radar, Scenario Planner
Workforce ---> Delivery Health, Financials, Flow and Velocity
Financials ---> P and L Cockpit, Commercial Pipeline, Change Impact
P and L Cockpit ---> Financials, Commercial Pipeline, Change Impact
Flow and Velocity ---> Delivery Health, Backlog Health, Workforce
AI and Innovation ---> Commercial Pipeline, Backlog Health
Commercial Pipeline ---> P and L Cockpit, Change Impact, Multi-Vendor Scorecard
Backlog Health ---> Flow and Velocity, Scenario Planner
Scenario Planner ---> Financials, Commercial Pipeline, Risk RAID
Ops and SLA ---> Delivery Health, Multi-Vendor Scorecard, Client Health Radar
Multi-Vendor Scorecard ---> Commercial Pipeline, Ops and SLA
Change Impact ---> P and L Cockpit, Commercial Pipeline, Financials
Client Health Radar ---> Risk RAID, Ops and SLA, Commercial Pipeline
```

Every tab footer carries three "Related" links. Chosen from the graph above.

---

## 14. Confidentiality and legal declarations

### 14.1 All mock data is fictional

Every programme name, client name, vendor name, person name, financial number, RAID item, SLA breach, and change request in this project is fully fictional. Nothing in this product references or resembles any real engagement, client, colleague, or dataset from Adi Kompalli's actual professional history. Any resemblance to real entities is coincidental.

### 14.2 Fictional data footer

Every wireframe and every production page renders a persistent footer:

```
Demo data. All programmes, clients, vendors, and people in this application are fictional.
```

Position: page footer, small text, `text-muted`.

### 14.3 Attribution footer

Every wireframe and every production page renders an attribution line:

```
Built by Adi Kompalli | AKB1 Delivery Command Center | Open source at github.com/deva-adi/AKB1_Delivery_Command_Center (from v1.0.0)
```

Position: page footer, small text, `text-muted`.

### 14.4 Font and icon licences

Inter font: SIL Open Font Licence. Commercial use allowed. Redistribution allowed.

Lucide icons: ISC Licence. Free for commercial and open source.

Recharts: MIT Licence.

No licence conflicts with the proposed AGPL-3 project licence.

---

## 15. Operational readiness checklist

Before the first wireframe commit, these items must be landed.

| # | Item | Status | Responsible |
|---|------|--------|-------------|
| 1 | `.gitignore` with Python, Node, OS, secrets rules | Done 2026-04-24 | Claude |
| 2 | `.pre-commit-config.yaml` with em dash and emoji scanners | Done 2026-04-24 | Claude |
| 3 | Git init and baseline commit | Pending Adi consent | Adi executes |
| 4 | pre-commit hooks installed in the git repo | Pending | Adi executes |
| 5 | First wireframe authored | Pending Design Foundations signoff | Claude |

### 15.1 Git init command (requires Adi consent)

```bash
cd "/Users/adikompalli/Documents/Claude/Cowork/Projects/AKB1 Base — Chief of Staff/AKB1_Delivery_Command_Center"
git init -b main
git add .
git commit -m "chore(scaffold): initial project scaffold at v0.1.0-wireframe"
```

### 15.2 Pre-commit install command

```bash
pip install pre-commit --break-system-packages
pre-commit install
pre-commit run --all-files
```

The second command registers the hooks. The third runs them once to verify. Any em dash or emoji currently in the repo surfaces here and gets fixed before the first wireframe commit.

---

## 16. Wireframe review protocol

### 16.1 Review unit

One wireframe at a time. Adi reviews, provides feedback, signoff or revision cycle. Next wireframe not started until the current one is approved, for the first two wireframes only (00 Index and 01 Executive). After that, batches of three wireframes reviewed together.

### 16.2 Approval format

Adi writes one of three signals:
- "Approved" means ship it, move to next.
- "Approved with notes" means ship it, but apply the listed notes before moving on.
- "Revise" means the wireframe does not meet the bar, iterate and resubmit.

### 16.3 Iteration budget

Three revisions per wireframe maximum. If the fourth revision still does not meet the bar, pause and hold a design review discussion. This prevents endless tweaking.

### 16.4 Delivery channel

Wireframe HTML files saved to `docs/wireframes/`. Adi opens in browser (Preview in Finder or Safari). Feedback delivered in the Cowork chat session.

---

## 17. Exit criteria for Design Foundations

This document is signed off when Adi confirms:
The colour palette, typography, spacing, and component patterns are acceptable.
The 10 programme seed table is accepted or edited to final form.
The 300-person pyramid is accepted.
The 25 vendor list is accepted.
The 12-month financial shape is accepted.
The RAID, SLA, change, and client health distributions are accepted.
The three intelligence layer voice samples capture Adi executive tone.
The cross-tab link graph is approved.
The confidentiality and legal declarations are acceptable.
The operational readiness checklist is acceptable.

Once signed off, no further design negotiation is needed for individual wireframes. They inherit from this document.

---

*Document owner: Claude. Last updated: 2026-04-24. This file is the single source of truth for design decisions. Any deviation in a wireframe, PRD, or code file must either update this file first or be logged as an exception in DECISION_LOG.md.*
