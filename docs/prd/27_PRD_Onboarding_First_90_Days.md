# 27_PRD_Onboarding_First_90_Days.md
### First 90 Days Onboarding | AKB1 Delivery Command Center v1 | Revision 1 | Updated: 2026-04-25

> New cross-cutting surface introduced at Master PRD revision 3. Closes UC-H. Inherits from Master PRD revision 3, Data Model PRD revision 4 (`onboarding_checklist` entity 4.72), Intelligence Layer PRD revision 2 pending rev 3 cascade, Security PRD revision 2 pending rev 3 cascade, Design Foundations revision 4 (R4.6 visibility matrix).

---

## 1. Scope and goals

Surface that renders on first login for new joiners and accompanies them through their first 13 weeks. Bridges the S10 Portfolio Desk Manifesto observation that delivery leaders lose 6 months of momentum waiting for new joiners to ramp without structure. Self-service for the joiner; oversight for Portfolio Owner, Delivery Director, HR Business Partner, and the joiner's Programme Manager.

Hub anchor: S10 Portfolio Desk Manifesto Part 13 (planned) plus S10 Part 01 (180-day gap framing). The First 90 Days is the structured countermeasure.

## 2. Role access

Per Q5 ruling and Design Foundations R4.6 visibility matrix:

| Role | Read scope | Write scope |
|------|------------|--------------|
| Self (owning user) | Own checklist | Own checklist (status updates, evidence URLs) |
| Portfolio Owner | All new joiners (portfolio scope) | None |
| Delivery Director | All new joiners in own delivery org | None |
| HR Business Partner | All new joiners (cohort scope plus band and geo filters) | None |
| Programme Manager | New joiners allocated to PM's programme | None |
| Finance Lead | None | None |
| Read Only | None | None |

API enforces scope through `user_id = current_user.id OR caller_role IN ('PO','DD','HRBP') OR (caller_role = 'PM' AND owning_user_allocated_to_caller_programme)`.

Onboarding note text (when present in `onboarding_checklist` rows) is visible to the owning user always; PO, DD, HRBP can view; PM cannot view note text (only status and completion percent).

## 3. Data contract

Consumes: `onboarding_checklist`, `people` (for owning user metadata), `programmes` (for PM scope check), `allocations` (for "joiner is on this programme" lookup).

Response: `OnboardingViewResponse` with sections: own_checklist (self only), cohort_summary (PO/DD/HRBP), programme_joiners (PM scoped), upcoming_milestones, evidence_uploads.

## 4. User stories

New joiner Anand on first login lands on onboarding view. Sees the 30 items distributed across weeks 1 to 13. Marks Week 1 Day 1 items complete (laptop received, slack joined, calendar populated) by end of day.

Portfolio Owner Monday 9 AM checks the new joiner cohort. Sees 4 joiners this quarter. Anand at 12 of 30 items, on track for Week 4. Two joiners in Week 6 are slipping behind (8 items uncompleted). Books a check-in with their PMs.

Delivery Director scopes to own delivery org. Sees 2 of the 4 joiners. Reviews completion patterns. Spots the same item (Margin Literacy 60-second test) blocked on both joiners. Escalates to HRBP for cohort intervention.

HR Business Partner reviews cohort by week_number. Sees Week 4 cohort (3 joiners) progressing well, Week 8 cohort (1 joiner) lagging. Looks at lagging joiner item-by-item, identifies that buddy assignment was missed.

Programme Manager Meera sees the 2 new joiners on her programme. One is at Week 2, on track. The second is at Week 6 with no evidence uploaded for the past 3 weeks. Meera adds that to the next 1-on-1.

## 5. KPIs

| KPI | Formula | Example | Target | Owner |
|-----|---------|---------|--------|-------|
| Cohort On-Track Percent | `Count(users WHERE completion_pct >= expected_pct_for_week) / Count(users)` | 75 percent (3 of 4 on track) | At or above 80 | HRBP |
| Items Past Due | `Count(onboarding_checklist WHERE status = Pending AND week_number < current_user_week_number)` | 8 items across cohort | Below 10 portfolio | HRBP |
| Average Completion at Week 4 | `Avg(items_complete) at Week 4 across cohort joined last 12 weeks` | 14 of 30 items | 12 or above | HRBP |
| Evidence Upload Rate | `Count(checklist WHERE evidence_url IS NOT NULL) / Count(checklist where status = Complete)` | 64 percent | At or above 50 | HRBP |
| Time-to-Productive Score | `Average week at which joiner first reaches 75 percent completion` | Week 9.5 | At or below Week 10 | PO |

Targets calibrated locally; not yet in `threshold_calibration_register` because cohort is too small at v1.0.0 launch. Added to register post-v1.

## 6. Views and interactions

Three rendering modes per caller role.

### 6.1 Self view (default for new joiners)

Large week-by-week accordion. Weeks 1 to 13 expandable. Each item shows: checklist_item title, sequence number within the week, status (Pending, InProgress, Complete, Skipped), completed_at, evidence URL upload control.

First-login modal greets the new joiner with their week 1 items pre-expanded. Action voice: direct second-person ("Complete the Finance access request by end of week 2.").

Progress bar at the top showing items_complete / 30 plus current week number.

### 6.2 Cohort view (PO, DD, HRBP)

Table view. Rows are joiners. Columns: Name, Programme, Manager, Joined Week (relative), Items Complete / 30, Current-Week Pace, Status (OnTrack, Slipping, Stalled), Last Activity. Filter bar: Geo, Programme, Band, Cohort Quarter.

Click a row opens that joiner's checklist read-only with the same week-by-week accordion structure.

Voice: third-person reporting ("Anand has completed 12 of 30 items, on track for Week 4.").

### 6.3 Programme view (PM)

Subset of cohort view filtered to PM's programme allocations. PM cannot view note text. Shows status and completion percent only.

### 6.4 First-login modal

Triggers when `current_user.created_at within last 13 weeks AND has_seen_onboarding_modal = false`. Welcomes the joiner, lists week 1 items, explains the surface. Dismissible. Re-accessible from the user menu.

## 7. Drill paths

| From | To |
|------|-----|
| Cohort row | Joiner detail (read-only checklist) |
| Slipping status chip | Filter cohort to slipping joiners |
| Items Past Due KPI | Items list across cohort sorted by overdue weeks |
| Evidence URL | Open document in new tab |
| Margin Literacy test item | Cross-link to v1_17 Margin Literacy section (cohort blocking pattern surfaced there) |
| Joiner detail Programme | Programme detail in v1_01 or v1_02 |

## 8. Intelligence layer rules

`tab_onboarding.py` revision 1. Lighter than other tabs because the surface is process-driven, not analytical.

Triggers:
- Cohort On-Track Percent below 80: action "Identify lagging joiners and assign HR Business Partner check-in within 7 days."
- Items Past Due above 10: action "Cohort-wide intervention. HRBP reviews common blockers."
- Joiner with 0 activity for 14 days: alert "Joiner Anand has logged no activity for 14 days. PM Meera to check in."
- Same item blocked across more than 2 joiners: action "Item-level blocker detected. Cross-link to fix at source (e.g. access provisioning, training availability)."

Self view does not render intelligence layer. Action voice for joiners is item-level prompts inside the accordion.

## 9. Non-functional

Self view first paint under 600 ms with 30 items.
Cohort view first paint under 800 ms with 4 joiners default.
HRBP cohort view at 50 joiners under 1.2 seconds.
Evidence URL upload control supports common cloud doc types (Drive, OneDrive, Notion, Confluence) with link validation.

Self-only writes audit through `audit_trail_entries` for status changes and evidence uploads.

## 10. Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/onboarding/me` | Self view payload |
| GET | `/api/v1/onboarding/cohort` | Cohort view (PO, DD, HRBP) |
| GET | `/api/v1/onboarding/programme/{code}` | PM-scoped joiner list |
| GET | `/api/v1/onboarding/joiner/{user_id}` | Single joiner detail (scope-checked) |
| PATCH | `/api/v1/onboarding/item/{checklist_id}/status` | Self status update, audited |
| PATCH | `/api/v1/onboarding/item/{checklist_id}/evidence` | Self evidence URL upload, audited |
| GET | `/api/v1/onboarding/operational-metrics` | KPI payload |
| POST | `/api/v1/onboarding/me/dismiss-modal` | Mark first-login modal seen |

Total: 8 endpoints. PATCH and POST endpoints audit. Self-only writes verified by `user_id = current_user.id` invariant.

## 11. Error and empty states

New joiner lands and sees own checklist: "Welcome to AKB1 Delivery. Your First 90 Days starts here." with week 1 items pre-expanded.
PO with empty cohort: "No new joiners this quarter. The cohort view will populate as new hires are activated."
PM with no own-programme joiners: "No new joiners on your programme right now. You will be notified when one joins."
HRBP attempting to view note text on a programme they do not partner with: not blocked at v1; HRBP has full read on notes (per Q5 ruling) regardless of programme.

## 12. Accessibility

Self view accordion expandable via keyboard. Cohort table sortable via keyboard. Status chips carry text labels. Evidence URL field announces upload progress to screen readers. First-login modal traps focus correctly and dismissible via Escape.

axe-core zero WCAG AA violations required at release gate.

## 13. Test acceptance

Playwright scenarios:
- New joiner first login, modal renders with week 1 items.
- Self marks 3 items complete, verify status patches and audit entries written.
- PO views cohort, sees 4 joiners with statuses.
- DD scopes to own delivery org, sees 2 of the 4.
- HRBP filters by Geo = Hyderabad, sees 3 of the 4.
- PM Meera views own-programme joiners, sees 2 names with completion percent but no note text.
- Joiner uploads evidence URL, verify URL appears on cohort view for PO.

Contract tests: 8 endpoints validated.

Role gating: self-only-writes invariant verified. Note text visibility verified for self, PO, DD, HRBP. Note text hidden for PM and unscoped roles.

Audit trail: status patch and evidence upload write to `audit_trail_entries` with full before_json and after_json.

## 14. Release gating

Surface ships when:
1. Wireframe `v1_onboarding_first_90_days.html` signed off.
2. 8 endpoints contract-match.
3. Self-only-writes invariant verified.
4. Note text visibility verified across 5 roles.
5. First-login modal dismissal persists per user.
6. Evidence URL upload validates link format.
7. Playwright green on all 7 scenarios.
8. axe-core zero violations.
9. 30-item self view first paint under 600 ms.

---

*Revision 1 owner: Claude. Signoff: Adi (pending). Closes UC-H. Visibility matrix per Q5 ruling and Design Foundations R4.6.*
