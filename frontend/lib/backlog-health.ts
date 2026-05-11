/**
 * Pure utility functions for the Backlog Health tab.
 *
 * Data sources: GET /api/v1/programmes/{code}/health
 *               GET /api/v1/programmes/{code}/milestones
 *
 * backlog_items entity does not exist. All backlog volume, aging, DoR, and
 * groom cadence figures are stub placeholders. The per-programme Health state
 * and groom pressure proxy are derived from health snapshot RAG and milestone
 * Delayed/At Risk counts as the best available signal.
 */

export type {
  HealthSnapshotItem,
  HealthListResponse,
  MilestoneItem,
  MilestoneListResponse,
  RAGStatus,
  MilestoneStatus,
} from "@/lib/delivery-health";

import type { HealthSnapshotItem, MilestoneItem, RAGStatus } from "@/lib/delivery-health";
import { PROGRAMME_CODES } from "@/lib/raids";

// ---------------------------------------------------------------------------
// Role access
// ---------------------------------------------------------------------------

export const BACKLOG_HEALTH_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "ProgrammeManager",
  "ReadOnly",
]);

export function isBacklogHealthAllowed(role: string): boolean {
  return BACKLOG_HEALTH_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// Backlog health state derived from health RAG
// ---------------------------------------------------------------------------

export type BacklogHealthState = "CRITICAL" | "RED" | "AMBER" | "GREEN";

/**
 * Map a health snapshot RAG status to a backlog health display state.
 * TODO: replace with actuals when backlog_items entity lands.
 */
export function ragToBacklogState(rag: RAGStatus | null | undefined): BacklogHealthState {
  if (rag === "Failing") return "CRITICAL";
  if (rag === "Red") return "RED";
  if (rag === "Amber" || rag === "Watching") return "AMBER";
  return "GREEN";
}

export interface ProgrammeBacklogState {
  code: string;
  state: BacklogHealthState;
  rag: RAGStatus | null;
  /** Count of milestones with status "Delayed" -- grooming pressure proxy. */
  delayedCount: number;
  /** Count of milestones with status "At Risk". */
  atRiskCount: number;
}

function latestSnapshot(snapshots: HealthSnapshotItem[]): HealthSnapshotItem | null {
  if (snapshots.length === 0) return null;
  return [...snapshots].sort((a, b) =>
    b.snapshot_date.localeCompare(a.snapshot_date),
  )[0] ?? null;
}

/**
 * Build a backlog health state row per programme.
 * Milestone Delayed + At Risk counts act as grooming pressure proxies.
 * Returns rows in PROGRAMME_CODES seed order.
 * TODO: replace with actuals when backlog_items entity lands.
 */
export function buildBacklogProxy(
  snapshots: Map<string, HealthSnapshotItem[]>,
  milestones: Map<string, MilestoneItem[]>,
): ProgrammeBacklogState[] {
  return PROGRAMME_CODES.map((code) => {
    const snap = latestSnapshot(snapshots.get(code) ?? []);
    const programMilestones = milestones.get(code) ?? [];
    const delayedCount = programMilestones.filter((m) => m.status === "Delayed").length;
    const atRiskCount = programMilestones.filter((m) => m.status === "At Risk").length;
    return {
      code,
      state: ragToBacklogState(snap?.overall_rag),
      rag: snap?.overall_rag ?? null,
      delayedCount,
      atRiskCount,
    };
  });
}

// ---------------------------------------------------------------------------
// Backlog What
// ---------------------------------------------------------------------------

export interface BacklogWhat {
  /** Programmes where delayedCount > 0 (proxy for missed groom cadence). */
  pressureProgrammes: number;
  /** Sum of delayedCount across all programmes. */
  delayedTotal: number;
  /** Sum of atRiskCount across all programmes. */
  atRiskTotal: number;
  visibleProgrammes: number;
  /** First CRITICAL programme code, else first RED, else null. */
  worstProgramme: string | null;
}

export function buildBacklogWhat(states: ProgrammeBacklogState[]): BacklogWhat {
  const pressureProgrammes = states.filter((s) => s.delayedCount > 0).length;
  const delayedTotal = states.reduce((sum, s) => sum + s.delayedCount, 0);
  const atRiskTotal = states.reduce((sum, s) => sum + s.atRiskCount, 0);
  const visibleProgrammes = states.length;

  const firstCritical = states.find((s) => s.state === "CRITICAL");
  const firstRed = states.find((s) => s.state === "RED");
  const worstProgramme = firstCritical?.code ?? firstRed?.code ?? null;

  return { pressureProgrammes, delayedTotal, atRiskTotal, visibleProgrammes, worstProgramme };
}
