/**
 * Pure utility functions for the Financials tab.
 *
 * Data sources: GET /api/v1/programmes/{code}/health
 *               GET /api/v1/programmes/{code}/milestones (Delayed count proxy)
 *
 * financials_monthly is not yet seeded. All revenue, cost, DSO, margin, and
 * bench-tax figures are stub placeholders. The per-programme State column and
 * intelligence card What are derived from health snapshot RAG as proxy.
 */

export type {
  HealthSnapshotItem,
  HealthListResponse,
  MilestoneItem,
  MilestoneListResponse,
  RAGStatus,
} from "@/lib/delivery-health";

import type { HealthSnapshotItem, MilestoneItem, RAGStatus } from "@/lib/delivery-health";

// ---------------------------------------------------------------------------
// Role access
// ---------------------------------------------------------------------------

export const FINANCIALS_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "ProgrammeManager",
  "FinanceLead",
  "ReadOnly",
]);

export function isFinancialsAllowed(role: string): boolean {
  return FINANCIALS_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// Financial state derived from health RAG
// ---------------------------------------------------------------------------

export type FinancialState = "BREACH" | "RED" | "AMBER" | "GREEN";

/**
 * Map a health snapshot RAG status to a financial display state.
 * TODO: replace with actuals when financials_monthly entity lands.
 */
export function ragToFinancialState(rag: RAGStatus | null | undefined): FinancialState {
  if (rag === "Failing") return "BREACH";
  if (rag === "Red") return "RED";
  if (rag === "Amber" || rag === "Watching") return "AMBER";
  return "GREEN";
}

export interface ProgrammeFinancialState {
  programmeCode: string;
  state: FinancialState;
}

const RAG_WEIGHT: Record<RAGStatus, number> = {
  Failing: 4,
  Red: 3,
  Watching: 2,
  Amber: 1,
  Green: 0,
};

function latestSnapshot(snapshots: HealthSnapshotItem[]): HealthSnapshotItem | null {
  if (snapshots.length === 0) return null;
  return [...snapshots].sort((a, b) =>
    b.snapshot_date.localeCompare(a.snapshot_date),
  )[0] ?? null;
}

/**
 * Return the derived financial state per programme from the most-recent
 * health snapshot overall_rag.
 * TODO: replace with financials_monthly margin state when entity lands.
 */
export function buildProgrammeFinancialStates(
  healthByProgramme: Record<string, HealthSnapshotItem[]>,
): ProgrammeFinancialState[] {
  return Object.entries(healthByProgramme).map(([programmeCode, snapshots]) => {
    const snap = latestSnapshot(snapshots);
    return { programmeCode, state: ragToFinancialState(snap?.overall_rag) };
  });
}

// ---------------------------------------------------------------------------
// Financials What
// ---------------------------------------------------------------------------

export interface FinancialsWhat {
  /** Count of programmes with Red or Failing health RAG as financial risk proxy. */
  atRiskProgrammes: number;
  visibleProgrammes: number;
  /** Count of Delayed milestones as unbilled WIP pressure signal. */
  delayedMilestones: number;
  /** Programme with highest-weight RAG, or null when all Green. */
  worstProgramme: string | null;
}

// ---------------------------------------------------------------------------
// M10-2: Drill filter utilities
// ---------------------------------------------------------------------------

function financialHealthParamToStateSet(
  param: string,
): Set<FinancialState> | null {
  switch (param) {
    case "Red":
      return new Set<FinancialState>(["RED", "BREACH"]);
    case "Amber":
    case "Watching":
      return new Set<FinancialState>(["AMBER"]);
    case "Green":
      return new Set<FinancialState>(["GREEN"]);
    case "Failing":
      return new Set<FinancialState>(["BREACH"]);
    default:
      return null;
  }
}

export function filterFinancialStatesByProgramme(
  states: ProgrammeFinancialState[],
  code: string,
): ProgrammeFinancialState[] {
  return states.filter((s) => s.programmeCode === code);
}

export function filterFinancialStatesByHealth(
  states: ProgrammeFinancialState[],
  healthParam: string,
): ProgrammeFinancialState[] {
  const stateSet = financialHealthParamToStateSet(healthParam);
  if (stateSet === null) return states;
  return states.filter((s) => stateSet.has(s.state));
}

export function buildFinancialsWhat(
  healthByProgramme: Record<string, HealthSnapshotItem[]>,
  milestones: MilestoneItem[],
): FinancialsWhat {
  const programmes = Object.entries(healthByProgramme);
  const visibleProgrammes = programmes.length;

  const atRiskProgrammes = programmes.filter(([, snapshots]) => {
    const snap = latestSnapshot(snapshots);
    return snap !== null && (snap.overall_rag === "Red" || snap.overall_rag === "Failing");
  }).length;

  const delayedMilestones = milestones.filter((m) => m.status === "Delayed").length;

  let worstProgramme: string | null = null;
  let worstWeight = -1;
  for (const [code, snapshots] of programmes) {
    const snap = latestSnapshot(snapshots);
    if (snap === null) continue;
    const weight = RAG_WEIGHT[snap.overall_rag];
    if (weight > worstWeight) {
      worstWeight = weight;
      worstProgramme = code;
    }
  }

  return {
    atRiskProgrammes,
    visibleProgrammes,
    delayedMilestones,
    worstProgramme: worstWeight > 0 ? worstProgramme : null,
  };
}
