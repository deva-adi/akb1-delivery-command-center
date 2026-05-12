/**
 * Pure utility functions for the Executive tab.
 *
 * All functions are side-effect-free and independently unit-testable.
 * Page components call these after fetching from the backend.
 *
 * Data sources: GET /api/v1/programmes/{code}/raids
 *               GET /api/v1/programmes/{code}/milestones
 *               GET /api/v1/programmes/{code}/health
 */

import type { RaidItem } from "@/lib/raids";
import type { MilestoneItem, HealthSnapshotItem } from "@/lib/delivery-health";

export const EXECUTIVE_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "ReadOnly",
]);

export function isExecutiveAllowed(role: string): boolean {
  return EXECUTIVE_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// RAID Severity Index (0-10)
// ---------------------------------------------------------------------------

const SEVERITY_WEIGHT: Record<string, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const OPEN_STATUSES = new Set(["Open", "Escalated"]);

/**
 * Compute a weighted severity index (0-10) from all visible RAID items.
 *
 * Formula: sum(weight * count per severity) / (openCount * 4) * 10
 * where weight: Critical=4, High=3, Medium=2, Low=1.
 * Returns 0 when there are no open or escalated items.
 * Returns 10 when every open item is Critical.
 */
export function buildRaidSeverityIndex(raids: RaidItem[]): number {
  const open = raids.filter((r) => OPEN_STATUSES.has(r.status));
  if (open.length === 0) return 0;

  const weightedSum = open.reduce(
    (sum, r) => sum + (SEVERITY_WEIGHT[r.severity] ?? 1),
    0,
  );
  const maxPossible = open.length * 4;
  return Math.round((weightedSum / maxPossible) * 100) / 10;
}

// ---------------------------------------------------------------------------
// Programme State List (from health snapshots)
// ---------------------------------------------------------------------------

export type ProgrammeStateDisplay = "GREEN" | "AMBER" | "RED" | "BREACH";

export interface ProgrammeStateRow {
  programmeCode: string;
  display: ProgrammeStateDisplay;
  snapshotDate: string;
}

const STATE_SORT_ORDER: Record<ProgrammeStateDisplay, number> = {
  BREACH: 0,
  RED: 1,
  AMBER: 2,
  GREEN: 3,
};

function ragToDisplay(rag: string): ProgrammeStateDisplay {
  switch (rag) {
    case "Failing": return "BREACH";
    case "Red": return "RED";
    case "Amber":
    case "Watching": return "AMBER";
    default: return "GREEN";
  }
}

/**
 * Build one state row per programme using the most-recent health snapshot.
 *
 * When a programme has multiple snapshots the highest snapshot_date wins.
 * Sorted: BREACH, RED, AMBER, GREEN (most urgent first).
 */
export function buildProgrammeStateList(health: HealthSnapshotItem[]): ProgrammeStateRow[] {
  const latest = new Map<string, HealthSnapshotItem>();

  for (const snap of health) {
    const existing = latest.get(snap.programme_code);
    if (!existing || snap.snapshot_date > existing.snapshot_date) {
      latest.set(snap.programme_code, snap);
    }
  }

  return [...latest.values()]
    .map((snap) => ({
      programmeCode: snap.programme_code,
      display: ragToDisplay(snap.overall_rag),
      snapshotDate: snap.snapshot_date,
    }))
    .sort((a, b) => STATE_SORT_ORDER[a.display] - STATE_SORT_ORDER[b.display]);
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export interface ExecutiveKPIs {
  /** Percentage of milestones at On Track or Complete. */
  onTimePct: number;
  /** Weighted severity index 0-10 from open RAID items. */
  raidSeverityIndex: number;
  /** Count of unique programme codes visible to this caller. */
  visibleProgrammes: number;
  /**
   * Stub: 19.2%. TODO: replace with actuals when financials_monthly endpoint lands.
   */
  grossMarginPct: number;
  /**
   * Stub: 13.2%. TODO: replace with actuals when financials_monthly endpoint lands.
   */
  netMarginPct: number;
  /**
   * Stub: 82.0%. TODO: replace with actuals when utilisations endpoint lands.
   */
  utilisationPct: number;
  /**
   * Stub: 9.3 days. TODO: replace with actuals when decisions endpoint lands.
   */
  decisionLatencyDays: number;
  /**
   * Stub: 54%. TODO: replace with actuals when value-tracking endpoint lands.
   */
  valueRealisationPct: number;
}

export function buildExecutiveKPIs(
  milestones: MilestoneItem[],
  raids: RaidItem[],
): ExecutiveKPIs {
  const onTrackOrComplete = milestones.filter(
    (m) => m.status === "On Track" || m.status === "Complete",
  );
  const onTimePct =
    milestones.length === 0
      ? 0
      : Math.round((onTrackOrComplete.length / milestones.length) * 1000) / 10;

  const raidSeverityIndex = buildRaidSeverityIndex(raids);

  const visibleProgrammes = new Set([
    ...milestones.map((m) => m.programme_code),
    ...raids.map((r) => r.programme_code),
  ]).size;

  return {
    onTimePct,
    raidSeverityIndex,
    visibleProgrammes,
    grossMarginPct: 19.2, // TODO: replace with actuals when financials_monthly endpoint lands
    netMarginPct: 13.2, // TODO: replace with actuals when financials_monthly endpoint lands
    utilisationPct: 82.0, // TODO: replace with actuals when utilisations endpoint lands
    decisionLatencyDays: 9.3, // TODO: replace with actuals when decisions endpoint lands
    valueRealisationPct: 54, // TODO: replace with actuals when value-tracking endpoint lands
  };
}

// ---------------------------------------------------------------------------
// Role-differentiated subtitle (Design Foundations R4)
// ---------------------------------------------------------------------------

export function executiveSubtitle(role: string): string | null {
  if (role === "PortfolioOwner") return "The director sees across.";
  if (role === "DeliveryDirector") return "The delivery manager walks each one.";
  return null;
}

// ---------------------------------------------------------------------------
// M10-2: Drill filter utilities
// ---------------------------------------------------------------------------

function healthParamToDisplaySet(
  param: string,
): Set<ProgrammeStateDisplay> | null {
  switch (param) {
    case "Red":
      return new Set<ProgrammeStateDisplay>(["RED", "BREACH"]);
    case "Amber":
    case "Watching":
      return new Set<ProgrammeStateDisplay>(["AMBER"]);
    case "Green":
      return new Set<ProgrammeStateDisplay>(["GREEN"]);
    case "Failing":
      return new Set<ProgrammeStateDisplay>(["BREACH"]);
    default:
      return null;
  }
}

export function filterStatesByProgramme(
  states: ProgrammeStateRow[],
  code: string,
): ProgrammeStateRow[] {
  return states.filter((s) => s.programmeCode === code);
}

export function filterStatesByHealth(
  states: ProgrammeStateRow[],
  healthParam: string,
): ProgrammeStateRow[] {
  const displaySet = healthParamToDisplaySet(healthParam);
  if (displaySet === null) return states;
  return states.filter((s) => displaySet.has(s.display));
}
