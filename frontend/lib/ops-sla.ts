/**
 * Pure utility functions for the Ops and SLA tab.
 *
 * Data sources: GET /api/v1/programmes/{code}/health
 *               GET /api/v1/programmes/{code}/milestones (for Delayed count proxy)
 *
 * SLA-specific entities (sla_metrics, incidents, decisions, steerco_pre_read)
 * are not yet seeded. The SLA Status Matrix and Ops KPIs derive from health
 * snapshot sub-RAGs as a proxy. All incident, breach, and decision sections
 * carry stub placeholders.
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

export const OPS_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "ProgrammeManager",
  "ReadOnly",
]);

export function isOpsAllowed(role: string): boolean {
  return OPS_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// SLA category definitions
// ---------------------------------------------------------------------------

export const SLA_CATEGORIES = [
  "Uptime",
  "Ticket MTTR",
  "Response",
  "Quality",
  "Release",
  "Support",
] as const;

export type SLACategory = (typeof SLA_CATEGORIES)[number];

/**
 * URL-safe slugs for each SLA category.
 * Used as the ?sla= query param value when a column or cell is drilled.
 * "Ticket MTTR" maps to "incident-response" per M10-5 gate spec.
 */
export const SLA_SLUGS: Record<SLACategory, string> = {
  "Uptime": "uptime",
  "Ticket MTTR": "incident-response",
  "Response": "response",
  "Quality": "quality",
  "Release": "change-mgmt",
  "Support": "support",
};

/**
 * Reverse map: slug -> SLACategory.
 * Used to translate an incoming ?sla= param back to the display category.
 */
export const SLA_SLUG_TO_CATEGORY: Record<string, SLACategory> = {
  "uptime": "Uptime",
  "incident-response": "Ticket MTTR",
  "response": "Response",
  "quality": "Quality",
  "change-mgmt": "Release",
  "support": "Support",
};

/** Rendered cell state derived from health sub-RAG proxy. */
export type SLACellState = "BREACH" | "RED" | "AMBER" | "GREEN";

export interface SLACell {
  category: SLACategory;
  state: SLACellState;
}

export interface SLAMatrixRow {
  programmeCode: string;
  cells: SLACell[];
}

// ---------------------------------------------------------------------------
// RAG helpers
// ---------------------------------------------------------------------------

function ragToCell(rag: RAGStatus | null | undefined): SLACellState {
  if (rag === "Failing") return "BREACH";
  if (rag === "Red") return "RED";
  if (rag === "Amber" || rag === "Watching") return "AMBER";
  return "GREEN";
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

// ---------------------------------------------------------------------------
// SLA Status Matrix
// ---------------------------------------------------------------------------

/**
 * Map health snapshot sub-RAGs to the 6 SLA category cells per programme.
 *
 * Category-to-sub-RAG mapping (proxy, TODO: replace with sla_metrics entity):
 *   Uptime      -> overall_rag
 *   Ticket MTTR -> resources_rag ?? overall_rag
 *   Response    -> risks_rag ?? overall_rag
 *   Quality     -> budget_rag ?? overall_rag
 *   Release     -> schedule_rag ?? overall_rag
 *   Support     -> overall_rag
 */
export function buildSLAMatrix(
  healthByProgramme: Record<string, HealthSnapshotItem[]>,
): SLAMatrixRow[] {
  return Object.entries(healthByProgramme).map(([programmeCode, snapshots]) => {
    const snap = latestSnapshot(snapshots);

    const overall = snap?.overall_rag ?? "Green";
    const schedule = snap?.schedule_rag ?? overall;
    const budget = snap?.budget_rag ?? overall;
    const resources = snap?.resources_rag ?? overall;
    const risks = snap?.risks_rag ?? overall;

    const cells: SLACell[] = [
      { category: "Uptime", state: ragToCell(overall) },
      { category: "Ticket MTTR", state: ragToCell(resources) },
      { category: "Response", state: ragToCell(risks) },
      { category: "Quality", state: ragToCell(budget) },
      { category: "Release", state: ragToCell(schedule) },
      { category: "Support", state: ragToCell(overall) },
    ];

    return { programmeCode, cells };
  });
}

// ---------------------------------------------------------------------------
// Ops KPIs
// ---------------------------------------------------------------------------

export interface OpsKPIs {
  /** Count of programmes with Red or Failing most-recent health RAG. */
  atRiskProgrammes: number;
  visibleProgrammes: number;
  /**
   * SLA adherence pct stub.
   * TODO: replace with actuals when sla_metrics entity lands.
   */
  slaAdherencePctStub: number;
  /**
   * Active breach count stub.
   * TODO: replace with actuals when sla_metrics entity lands.
   */
  activeBreachesStub: number;
  /**
   * Penalty exposure USD stub.
   * TODO: replace with actuals when sla_metrics entity lands.
   */
  penaltyExposureUsdStub: number;
  /**
   * P1 incidents in last 30 days stub.
   * TODO: replace with actuals when incidents entity lands.
   */
  p1Incidents30dStub: number;
  /**
   * MTTR hours stub.
   * TODO: replace with actuals when incidents entity lands.
   */
  mttrHoursStub: number;
}

export function buildOpsKPIs(
  healthByProgramme: Record<string, HealthSnapshotItem[]>,
): OpsKPIs {
  const programmes = Object.entries(healthByProgramme);
  const visibleProgrammes = programmes.length;

  const atRiskProgrammes = programmes.filter(([, snapshots]) => {
    const snap = latestSnapshot(snapshots);
    return snap !== null && (snap.overall_rag === "Red" || snap.overall_rag === "Failing");
  }).length;

  return {
    atRiskProgrammes,
    visibleProgrammes,
    // TODO: replace with actuals when sla_metrics entity lands
    slaAdherencePctStub: 88.3,
    activeBreachesStub: 3,
    penaltyExposureUsdStub: 380,
    // TODO: replace with actuals when incidents entity lands
    p1Incidents30dStub: 42,
    mttrHoursStub: 4.2,
  };
}

// ---------------------------------------------------------------------------
// Ops What
// ---------------------------------------------------------------------------

export interface OpsWhat {
  atRiskProgrammes: number;
  visibleProgrammes: number;
  /** Count of Delayed milestones as a proxy for outstanding decisions needing action. */
  delayedMilestones: number;
  /** Programme with the worst (highest-weight) health RAG, or null if no data. */
  worstProgramme: string | null;
}

export function buildOpsWhat(
  healthByProgramme: Record<string, HealthSnapshotItem[]>,
  milestones: MilestoneItem[],
): OpsWhat {
  const kpis = buildOpsKPIs(healthByProgramme);
  const delayedMilestones = milestones.filter((m) => m.status === "Delayed").length;

  let worstProgramme: string | null = null;
  let worstWeight = -1;

  for (const [code, snapshots] of Object.entries(healthByProgramme)) {
    const snap = latestSnapshot(snapshots);
    if (snap === null) continue;
    const weight = RAG_WEIGHT[snap.overall_rag];
    if (weight > worstWeight) {
      worstWeight = weight;
      worstProgramme = code;
    }
  }

  return {
    atRiskProgrammes: kpis.atRiskProgrammes,
    visibleProgrammes: kpis.visibleProgrammes,
    delayedMilestones,
    worstProgramme: worstWeight > 0 ? worstProgramme : null,
  };
}
