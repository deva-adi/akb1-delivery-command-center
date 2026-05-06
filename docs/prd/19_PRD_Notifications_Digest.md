# 19_PRD_Notifications_Digest.md
### Notifications and Daily Digest PRD | AKB1 Delivery Command Center v1 | Revision 2 | Updated: 2026-04-25

> Revision 2 adds notification types for the rev 4 entities: governance breaches, bench aging, AI risk tier changes, EVM threshold crossings, audit denial clusters. Revision 1 content preserved below.
>
> Revision 1 introduced the cross-cutting surface per self-check D-014. Enables push-first notifications so the dashboard no longer depends on the user pulling it open to discover anomalies.

---

## 1. Scope and goals

Notifications bell in the primary nav, scheduled daily digest email (Phase 2), anomaly-triggered alerts, scenario approval events, system events. Converts a pull-only dashboard into a push-first operating tool.

## 2. Role access

| Role | Receives |
|------|----------|
| Portfolio Owner | Daily digest, all anomaly alerts, scenario events, system events |
| Programme Manager | Daily digest (scoped), anomalies on assigned programmes, system events |
| Finance Lead | Daily digest (financial-focused), margin and DSO anomalies, scenario events |
| Read Only | System events only, no digest |

## 3. Data contract

Consumes: `notifications` entity. Produces: in-app feed plus optional email/Slack/Teams webhooks (Phase 2).

Response: `NotificationFeedResponse` with ordered notifications, unread count, mark-read endpoint.

## 4. Notification types

| Type | Trigger | Payload |
|------|---------|---------|
| `daily_digest` | Scheduled 7:00 local time per user | Top-3 changes since last login, intelligence layer What Why Act for role primary tab |
| `anomaly_margin_drop` | Portfolio margin drops more than 100 bps MoM | Programme contribution, recommended action |
| `anomaly_sla_state_change` | SLA transitions to Red or Breach | Metric, programme, penalty exposure |
| `anomaly_raid_escalation` | RAID severity raised to Critical or High | RAID item, programme, owner |
| `anomaly_attrition_spike` | Monthly regretted attrition exceeds 15 percent | Band, geo, replacement cost estimate |
| `scenario_saved` | Any role saves or modifies a scenario | Scenario id, user, summary |
| `cr_repriced` | CR status changes to Approved_Repriced | CR id, margin delta |
| `system` | Seed regenerated, maintenance window, upgrade available | Short message |

## 5. KPIs

| KPI | Formula | Example | Target | Alert |
|-----|---------|---------|--------|-------|
| Notification Relevance Score | `User-clicked Notifications / Delivered x 100` | 62 percent | Above 50 percent | Below 30 percent |
| Digest Open Rate | `Digest Opened / Digest Delivered x 100` | 78 percent | Above 60 percent | Below 40 percent |
| Alert-to-Action Time | Avg minutes between anomaly alert delivered and related action created or scenario run | 24 minutes | Below 60 minutes | Above 120 minutes |
| Mute Rate | `Notifications Muted by User / Total Delivered x 100` | 12 percent | Below 20 percent | Above 35 percent |

## 6. Views and interactions

Notifications bell in primary nav top-right shows unread badge count. Click opens right-side drawer listing notifications (reverse chronological, grouped by day). Each notification card has type icon, title, one-line body, timestamp, related tab link. Mark as read on open, mark all read button, mute-by-type menu.

## 7. Drill paths

| From | To |
|------|-----|
| Notification card | Source tab with filter pre-applied to the relevant programme or entity |
| Daily digest section header | Intelligence layer of the relevant tab |
| Anomaly alert action button | Scenario Planner pre-seeded with the anomaly context |

## 8. Intelligence layer rules

Daily digest composition uses the per-tab intelligence rules already defined. Aggregates top changes across tabs relevant to the user role. Anomaly alerts use threshold rules from the data model.

## 9. Non-functional

Digest composition for a single user under 800 ms. Anomaly detection runs on a 5-minute scheduler loop. Bell unread count query under 50 ms.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/notifications` | Feed for current user |
| POST | `/api/v1/notifications/mark-read` | Batch mark read |
| POST | `/api/v1/notifications/mute` | Mute a notification type |
| GET | `/api/v1/notifications/preferences` | Current user preferences |
| PUT | `/api/v1/notifications/preferences` | Update preferences |
| GET | `/api/v1/notifications/digest/preview` | Preview next digest for current user |

## 11. Error and empty states

Empty feed → "No new notifications. Check back tomorrow morning for your daily digest."
Digest failure → Fallback digest template with rules-only content, mark failure in system events.

## 12. Accessibility

Bell keyboard accessible (Tab plus Enter). Drawer trap focus while open. ARIA live region announces new notifications arriving during session. Role-appropriate colour plus icon redundancy.

## 13. Test acceptance

Playwright: simulated margin drop triggers anomaly alert, clicking navigates to source tab with filter applied. Digest generation for each role covers expected KPIs. Mute-by-type persists per user.

## 14. Release gating

PRD closes when Adi approves notification types, anomaly thresholds, and the scheduled digest cadence. Phase 1 ships with in-app bell and digest. Email and webhook channels in Phase 2.

---

*Owner: Claude. Signoff: Adi. Depends on Data Model PRD revision 2 (notifications entity, audit_log for alert emission).*

---

## Revision 2 amendments (2026-04-25)

Revision 1 content above preserved. Revision 2 additions follow.

### R2.1 New notification types

Eleven new notification types added covering rev 4 entities. Every type has trigger condition, target roles, channel default, and intelligence layer cross-link.

| Type | Trigger condition | Target role | Channel default | Cross-link |
|------|-------------------|-------------|-----------------|------------|
| `governance.cadence.theatre` | `governance_cadence.state` transitions to Theatre | PO, DD, PM | In-app + digest | v1_16 Cadence Calendar |
| `governance.escalation.contract.stale` | `escalation_contract.last_validated_at` exceeds 180 days | PO, PM | In-app + digest | v1_16 Escalation Contract panel |
| `governance.steerco.preread.missing` | Decision aged 3+ days without linked `steerco_pre_read` | PM | In-app | v1_16 Steerco Pre-Read panel |
| `governance.sponsor.engagement.low` | `sponsor_engagement.engagement_score` below 40 for 2 consecutive periods | PO | In-app + digest | v1_16 Sponsor Engagement Scorecard |
| `capability.bench.aging` | `bench_roster.bench_state` transitions to AtRisk | PO, DD, HRBP | In-app + digest | v1_17 Bench Deep Dive |
| `capability.dm.flight_risk` | `dm_succession_signals.flight_risk_score` crosses 70 | PO | In-app + email | v1_17 DM Succession Picture |
| `ai_governance.risk.red.pending` | `ai_use_case.risk_tier = Red AND approval_status = Pending` for 14+ days | PO with AP, DD with AP | In-app + digest | v1_18 Pending Red Backlog |
| `ai_governance.shadow.discovered` | `ai_shadow_survey.tools_previously_unknown_count` returns above 3 | PO with AP | In-app + email | v1_18 Shadow Inventory Trend |
| `ai_governance.gate.stale` | `ai_quality_gate.last_verified_at` exceeds 90 days for active use case | PO with AP, DD with AP | In-app | v1_18 Quality Gates panel |
| `delivery.evm.cpi.red` | `evm_snapshots.cpi` crosses below 0.85 | PO, FL, PM | In-app + email | v1_02 Delivery Health EVM section |
| `audit.denial.cluster` | More than 20 `audit_trail_entries.outcome = Denied` in 24 hours | PO with AP, FL with AP | In-app + email | v1_audit_trail_console.html |

### R2.2 Daily digest extensions

Daily digest at 8 AM IST per user preference. Rev 2 adds three new sections:

- **Governance pulse**: Decision Latency portfolio average, Cadence Theatre count, RACI gap percent.
- **Capability watch**: Bench aging count, DM flight risk count, hiring funnel stalled count.
- **AI governance**: Pending Red backlog count, Shadow discoveries this period, Quality gate pass rate.

Sections render only when the caller has access to the underlying entities. HRBP digest does not include AI governance section.

### R2.3 Notification preferences expansion

User preferences UI gains 11 new toggle rows (one per new notification type). Each can be set to In-app, Digest, Email, Off. Email channel still Phase 2 per rev 1.

### R2.4 Endpoints (revision 2 additions)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/notifications/types` | List all notification types with descriptions |
| PATCH | `/api/v1/notifications/preferences` | Update user preferences |

### R2.5 Release gating (revision 2 additions)

Revision 2 ships when:
1. 11 new notification types fire correctly per trigger conditions.
2. Daily digest 3 new sections render with role-aware visibility.
3. AP-flag-required notifications gate correctly (audit denial cluster, AI shadow discovery, etc.).
4. Preferences UI honors per-type per-channel toggles.

---

*Revision 2 owner: Claude. Signoff: Adi (pending). Adds 11 new notification types covering rev 4 entities.*
