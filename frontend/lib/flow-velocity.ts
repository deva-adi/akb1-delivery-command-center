/**
 * Pure utility functions for the Flow and Velocity tab.
 *
 * Data sources: GET /api/v1/programmes/{code}/milestones
 *               GET /api/v1/programmes/{code}/health
 *
 * Sprint-level entities (sprint_velocity_log, flow_metrics, wip_limits,
 * dora_metrics) are not yet seeded. KPIs and charts use milestone proxies
 * where possible; remaining sections carry stub placeholders.
 */

export type {
  MilestoneItem,
  MilestoneListResponse,
  HealthSnapshotItem,
  HealthListResponse,
  MilestoneStatus,
  RAGStatus,
} from "@/lib/delivery-health";

import type { MilestoneItem } from "@/lib/delivery-health";

// ---------------------------------------------------------------------------
// Role access
// ---------------------------------------------------------------------------

export const FLOW_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "ProgrammeManager",
  "ReadOnly",
]);

export function isFlowAllowed(role: string): boolean {
  return FLOW_ALLOWED_ROLES.has(role);
}

// ---------------------------------------------------------------------------
// WIP limits
// TODO: replace with actuals when wip_limits entity lands in seed.
// Values are sourced from wireframe v1_07 WIP vs Limit panel.
// ---------------------------------------------------------------------------

export const WIP_LIMITS: Record<string, number> = {
  PEGASUS: 20,
  PHOENIX: 18,
  ORION: 16,
  STELLAR: 15,
  HELIX: 14,
  ATLAS: 14,
  DRACO: 12,
  LYRA: 12,
  VEGA: 10,
  ANDROMEDA: 8,
};

const DEFAULT_WIP_LIMIT = 15;

// ---------------------------------------------------------------------------
// WIP proxy
// ---------------------------------------------------------------------------

export interface WIPRow {
  programmeCode: string;
  /** At Risk + On Track milestone count as WIP proxy. */
  wip: number;
  limit: number;
  breaching: boolean;
}

/**
 * Derive a WIP row per programme from milestone status counts.
 * At Risk and On Track milestones represent active in-flight work.
 * TODO: replace wip with actuals when sprint story counts land.
 */
export function buildWIPProxy(milestones: MilestoneItem[]): WIPRow[] {
  const acc = new Map<string, number>();

  for (const m of milestones) {
    if (m.status === "At Risk" || m.status === "On Track") {
      acc.set(m.programme_code, (acc.get(m.programme_code) ?? 0) + 1);
    }
  }

  return [...acc.entries()]
    .map(([programmeCode, wip]) => {
      const limit = WIP_LIMITS[programmeCode] ?? DEFAULT_WIP_LIMIT;
      return { programmeCode, wip, limit, breaching: wip > limit };
    })
    .sort((a, b) => b.wip - a.wip);
}

// ---------------------------------------------------------------------------
// Flow KPIs (proxy)
// ---------------------------------------------------------------------------

export interface FlowKPIs {
  /** Complete milestone count as throughput proxy. */
  throughputProxy: number;
  /** Count of programmes where WIP proxy exceeds limit. */
  wipBreachCount: number;
  visibleProgrammes: number;
  /**
   * Cycle time days stub.
   * TODO: replace with actuals when sprint_velocity_log endpoint lands.
   */
  cycleTimeDaysStub: number;
  /**
   * Flow efficiency pct stub.
   * TODO: replace with actuals when flow_metrics endpoint lands.
   */
  flowEfficiencyPctStub: number;
  /**
   * Lead time 85th percentile stub.
   * TODO: replace with actuals when sprint_velocity_log endpoint lands.
   */
  leadTimeP85DaysStub: number;
}

export function buildFlowKPIs(milestones: MilestoneItem[]): FlowKPIs {
  if (milestones.length === 0) {
    return {
      throughputProxy: 0,
      wipBreachCount: 0,
      visibleProgrammes: 0,
      cycleTimeDaysStub: 8.2,
      flowEfficiencyPctStub: 42,
      leadTimeP85DaysStub: 18.6,
    };
  }

  const throughputProxy = milestones.filter((m) => m.status === "Complete").length;
  const visibleProgrammes = new Set(milestones.map((m) => m.programme_code)).size;
  const wipRows = buildWIPProxy(milestones);
  const wipBreachCount = wipRows.filter((r) => r.breaching).length;

  return {
    throughputProxy,
    wipBreachCount,
    visibleProgrammes,
    // TODO: replace with actuals when sprint_velocity_log endpoint lands
    cycleTimeDaysStub: 8.2,
    // TODO: replace with actuals when flow_metrics endpoint lands
    flowEfficiencyPctStub: 42,
    // TODO: replace with actuals when sprint_velocity_log endpoint lands
    leadTimeP85DaysStub: 18.6,
  };
}

// ---------------------------------------------------------------------------
// Intelligence What
// ---------------------------------------------------------------------------

export interface FlowWhat {
  throughputProxy: number;
  wipBreachCount: number;
  visibleProgrammes: number;
  /** Programme with the highest WIP overage, or null if no breaches. */
  worstProgramme: string | null;
}

export function buildFlowWhat(milestones: MilestoneItem[]): FlowWhat {
  const kpis = buildFlowKPIs(milestones);
  const wipRows = buildWIPProxy(milestones);

  const breaching = wipRows.filter((r) => r.breaching);
  const worstProgramme =
    breaching.length > 0
      ? (breaching.sort((a, b) => b.wip - b.limit - (a.wip - a.limit))[0]?.programmeCode ?? null)
      : null;

  return {
    throughputProxy: kpis.throughputProxy,
    wipBreachCount: kpis.wipBreachCount,
    visibleProgrammes: kpis.visibleProgrammes,
    worstProgramme,
  };
}

// ---------------------------------------------------------------------------
// Sprint window table (monthly bucket proxy)
// ---------------------------------------------------------------------------

export interface SprintWindowRow {
  programmeCode: string;
  /** Complete milestone count in the earliest of the last 3 monthly buckets. */
  window1: number;
  window2: number;
  /** Complete milestone count in the most recent monthly bucket. */
  window3: number;
  trend: "up" | "flat" | "down";
}

/**
 * Group milestones by programme and monthly due_date bucket.
 * Returns the last 3 non-empty monthly windows as a proxy sprint performance
 * table. Trend compares window3 vs window1.
 * TODO: replace with actuals when sprint_velocity_log endpoint lands.
 */
export function buildSprintWindowTable(milestones: MilestoneItem[]): SprintWindowRow[] {
  if (milestones.length === 0) return [];

  const byProg = new Map<string, MilestoneItem[]>();
  for (const m of milestones) {
    const list = byProg.get(m.programme_code) ?? [];
    list.push(m);
    byProg.set(m.programme_code, list);
  }

  const results: SprintWindowRow[] = [];

  for (const [programmeCode, items] of byProg.entries()) {
    const acc = new Map<string, number>();
    for (const m of items) {
      if (m.status !== "Complete") continue;
      const d = new Date(m.due_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      acc.set(key, (acc.get(key) ?? 0) + 1);
    }

    const sorted = [...acc.entries()].sort(([a], [b]) => a.localeCompare(b));
    const last3 = sorted.slice(-3);

    const w1 = last3[0]?.[1] ?? 0;
    const w2 = last3[1]?.[1] ?? 0;
    const w3 = last3[2]?.[1] ?? 0;

    const trend: "up" | "flat" | "down" = w3 > w1 ? "up" : w3 < w1 ? "down" : "flat";

    results.push({ programmeCode, window1: w1, window2: w2, window3: w3, trend });
  }

  return results.sort((a, b) => a.programmeCode.localeCompare(b.programmeCode));
}
