/**
 * Pure utility functions for the Governance Operating Model tab.
 *
 * All functions are side-effect-free and independently unit-testable.
 *
 * Data sources:
 *   GET /api/v1/programmes/{code}/health       (all roles)
 *   GET /api/v1/programmes/{code}/milestones   (all roles)
 *   GET /api/v1/admin/tier-config              (PO only)
 *   GET /api/v1/admin/threshold-register       (PO only)
 */

import type { HealthSnapshotItem, MilestoneItem } from "@/lib/delivery-health";

export const GOV_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "ProgrammeManager",
  "HRBusinessPartner",
  "ReadOnly",
]);

export function isGovAllowed(role: string): boolean {
  return GOV_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// Over-Optimism Portfolio
// ---------------------------------------------------------------------------

export interface OverOptimismRow {
  programmeCode: string;
  /** Count of consecutive Green snapshots from the most-recent snapshot backwards. */
  greenSnapshotCount: number;
  /** Count of milestones with status Delayed for this programme. */
  delayedMilestoneCount: number;
  /**
   * True when the most-recent snapshot is Green AND the programme has at
   * least one Delayed milestone -- the classic over-optimism signal.
   */
  flagged: boolean;
}

/**
 * Build the over-optimism list from health snapshots and milestone data.
 *
 * A programme is flagged when its most-recent overall_rag is Green while
 * it simultaneously carries Delayed milestones. Sorted: flagged first,
 * then by delayedMilestoneCount descending.
 */
export function buildOverOptimismList(
  health: HealthSnapshotItem[],
  milestones: MilestoneItem[],
): OverOptimismRow[] {
  const healthByProg = new Map<string, HealthSnapshotItem[]>();
  for (const snap of health) {
    const existing = healthByProg.get(snap.programme_code) ?? [];
    existing.push(snap);
    healthByProg.set(snap.programme_code, existing);
  }

  const delayedByProg = new Map<string, number>();
  for (const m of milestones) {
    if (m.status === "Delayed") {
      delayedByProg.set(m.programme_code, (delayedByProg.get(m.programme_code) ?? 0) + 1);
    }
  }

  const rows: OverOptimismRow[] = [];

  for (const [programmeCode, snaps] of healthByProg) {
    const sorted = [...snaps].sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date));

    let greenCount = 0;
    for (const snap of sorted) {
      if (snap.overall_rag === "Green") greenCount++;
      else break;
    }

    const delayedCount = delayedByProg.get(programmeCode) ?? 0;
    const mostRecentIsGreen = sorted[0]?.overall_rag === "Green";

    rows.push({
      programmeCode,
      greenSnapshotCount: greenCount,
      delayedMilestoneCount: delayedCount,
      flagged: mostRecentIsGreen && delayedCount > 0,
    });
  }

  return rows.sort((a, b) => {
    if (a.flagged !== b.flagged) return a.flagged ? -1 : 1;
    return b.delayedMilestoneCount - a.delayedMilestoneCount;
  });
}

// ---------------------------------------------------------------------------
// Admin response types (minimal shapes; full schema in openapi.json)
// ---------------------------------------------------------------------------

export interface TierConfigItem {
  tier_number: number;
  display_label: string;
  default_label: string;
}

export interface TierConfigListResponse {
  items: TierConfigItem[];
}

export interface ThresholdItem {
  metric_id: string;
  display_name: string;
  direction: string;
  green_threshold: string | null;
  amber_threshold: string | null;
  red_threshold: string | null;
  owning_role: string;
}

export interface ThresholdListResponse {
  items: ThresholdItem[];
}
