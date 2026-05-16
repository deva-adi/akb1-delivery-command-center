/**
 * Pure utility functions for the Client Health tab.
 *
 * Data sources: GET /api/v1/programmes/{code}/health
 *               GET /api/v1/programmes/{code}/milestones (Delayed count proxy)
 *
 * client_signals, clients, value_realisation, qbr_records, and
 * stakeholder_influence entities are not seeded. All signal columns and
 * composite scores are stub placeholders. The per-programme State and
 * blended portfolio score are derived from health snapshot RAG as proxy.
 * Same reasoning as D-054 (Ops) and D-055 (Financials).
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

export const CLIENT_HEALTH_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "ProgrammeManager",
  "FinanceLead",
  "ReadOnly",
]);

export function isClientHealthAllowed(role: string): boolean {
  return CLIENT_HEALTH_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// Composite state derived from health RAG
// ---------------------------------------------------------------------------

export type CompositeState = "INTERVENE" | "WATCH" | "HEALTHY";

export interface ProgrammeClientState {
  code: string;
  state: CompositeState;
  snapshotRag: RAGStatus | null;
}

/**
 * Weighted score per RAG status for blended portfolio score calculation.
 * Scale 0-100 where 85 = fully healthy, 20 = critical intervention needed.
 * TODO: replace weights with actuals when client_signals entity lands.
 */
export const RAG_WEIGHT: Record<RAGStatus, number> = {
  Failing: 20,
  Red: 35,
  Watching: 55,
  Amber: 65,
  Green: 85,
};

function ragToCompositeState(rag: RAGStatus | null | undefined): CompositeState {
  if (rag === "Failing" || rag === "Red") return "INTERVENE";
  if (rag === "Watching" || rag === "Amber") return "WATCH";
  return "HEALTHY";
}

function latestSnapshot(snapshots: HealthSnapshotItem[]): HealthSnapshotItem | null {
  if (snapshots.length === 0) return null;
  return [...snapshots].sort((a, b) =>
    b.snapshot_date.localeCompare(a.snapshot_date),
  )[0] ?? null;
}

/**
 * Build a composite client state row per programme from most-recent health
 * snapshot overall_rag. Returns rows in PROGRAMME_CODES seed order.
 * TODO: replace with actual client_signals composite when entity lands.
 */
export function buildClientHealthProxy(
  snapshots: Map<string, HealthSnapshotItem[]>,
): ProgrammeClientState[] {
  return PROGRAMME_CODES.map((code) => {
    const snap = latestSnapshot(snapshots.get(code) ?? []);
    return {
      code,
      state: ragToCompositeState(snap?.overall_rag),
      snapshotRag: snap?.overall_rag ?? null,
    };
  });
}

// ---------------------------------------------------------------------------
// Client Health What
// ---------------------------------------------------------------------------

export interface ClientHealthWhat {
  /** Count of programmes in INTERVENE state (Failing or Red RAG). */
  interveneCount: number;
  /** Count of programmes in WATCH state (Watching or Amber RAG). */
  watchCount: number;
  visibleProgrammes: number;
  /**
   * Weighted average health score across all programmes, 0-100 scale.
   * null when no snapshots are available.
   * TODO: replace with actuals when client_signals entity lands.
   */
  blendedScore: number | null;
  /** Code of the first INTERVENE programme, else first WATCH, else null. */
  worstProgramme: string | null;
  /** Count of Delayed milestones as delivery pressure proxy. */
  delayedMilestones: number;
}

// ---------------------------------------------------------------------------
// Signal column slugs for ?signal= URL param
// ---------------------------------------------------------------------------

/**
 * Maps signal column display names to their ?signal= URL parameter values.
 * Six signal columns in ClientSignalMatrix (same order as the table).
 */
export const SIGNAL_SLUGS: Record<string, string> = {
  "Escalations 90d":   "escalations-90d",
  "Missed Exec Mtgs":  "missed-exec-mtgs",
  "Ticket Age":        "ticket-age",
  "Last NPS":          "last-nps",
  "Value Realisation": "value-realisation",
  "Composite":         "composite",
};

/** Ordered list of signal column display names, matching table column order. */
export const SIGNAL_COLUMNS = [
  "Escalations 90d",
  "Missed Exec Mtgs",
  "Ticket Age",
  "Last NPS",
  "Value Realisation",
  "Composite",
] as const;

export function buildClientHealthWhat(
  states: ProgrammeClientState[],
  allMilestones: MilestoneItem[],
): ClientHealthWhat {
  const interveneCount = states.filter((s) => s.state === "INTERVENE").length;
  const watchCount = states.filter((s) => s.state === "WATCH").length;
  const visibleProgrammes = states.length;

  const delayedMilestones = allMilestones.filter((m) => m.status === "Delayed").length;

  const scorable = states.filter((s) => s.snapshotRag !== null);
  const blendedScore =
    scorable.length === 0
      ? null
      : Math.round(
          scorable.reduce((sum, s) => sum + RAG_WEIGHT[s.snapshotRag!], 0) /
            scorable.length,
        );

  const firstIntervene = states.find((s) => s.state === "INTERVENE");
  const firstWatch = states.find((s) => s.state === "WATCH");
  const worstProgramme = firstIntervene?.code ?? firstWatch?.code ?? null;

  return {
    interveneCount,
    watchCount,
    visibleProgrammes,
    blendedScore,
    worstProgramme,
    delayedMilestones,
  };
}
