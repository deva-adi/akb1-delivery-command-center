/**
 * Pure utility functions for the Delivery Health tab.
 *
 * All functions are side-effect-free and independently unit-testable.
 * Page components call these after fetching from the backend.
 *
 * Data sources: GET /api/v1/programmes/{code}/milestones
 *               GET /api/v1/programmes/{code}/health
 */

export const DELIVERY_HEALTH_ALLOWED_ROLES = new Set([
  "DeliveryDirector",
  "ProgrammeManager",
  "ReadOnly",
]);

export function isDeliveryHealthAllowed(role: string): boolean {
  return DELIVERY_HEALTH_ALLOWED_ROLES.has(role);
}

export type MilestoneStatus = "On Track" | "At Risk" | "Delayed" | "Complete";
export type RAGStatus = "Red" | "Amber" | "Green" | "Watching" | "Failing";

export interface MilestoneItem {
  milestone_id: string;
  programme_code: string;
  title: string;
  baseline_date: string | null;
  due_date: string;
  status: MilestoneStatus;
  completion_pct: number;
  created_at: string;
  updated_at: string;
}

export interface MilestoneListResponse {
  items: MilestoneItem[];
  count: number;
}

export interface HealthSnapshotItem {
  snapshot_id: string;
  programme_code: string;
  snapshot_date: string;
  overall_rag: RAGStatus;
  schedule_rag: RAGStatus | null;
  budget_rag: RAGStatus | null;
  resources_rag: RAGStatus | null;
  risks_rag: RAGStatus | null;
  commentary: string | null;
  captured_by_user_id: string;
  created_at: string;
}

export interface HealthListResponse {
  items: HealthSnapshotItem[];
  count: number;
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------

export interface DeliveryHealthKPIs {
  /** Percentage of milestones at On Track or Complete status. */
  onTimePct: number;
  /** Of milestones past their due_date, the fraction that are Complete. */
  milestoneAdherencePct: number;
  /** Count of At Risk and Delayed milestones (open delivery blockers). */
  openBlockers: number;
  /** Unique programme codes visible to this caller. */
  visibleProgrammes: number;
  /**
   * Count of Complete milestones used as a velocity proxy.
   * TODO: replace with actuals when sprint-velocity endpoint lands.
   */
  sprintVelocityPts: number;
  /**
   * Client satisfaction score stub.
   * TODO: replace with actuals when csat endpoint lands.
   */
  csat: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function buildKPIs(milestones: MilestoneItem[]): DeliveryHealthKPIs {
  if (milestones.length === 0) {
    return {
      onTimePct: 0,
      milestoneAdherencePct: 0,
      openBlockers: 0,
      visibleProgrammes: 0,
      sprintVelocityPts: 0,
      csat: 4.2,
    };
  }

  const today = Date.now();

  const onTrackOrComplete = milestones.filter(
    (m) => m.status === "On Track" || m.status === "Complete",
  );
  const onTimePct =
    Math.round((onTrackOrComplete.length / milestones.length) * 1000) / 10;

  const pastDue = milestones.filter(
    (m) => new Date(m.due_date).getTime() <= today,
  );
  const completedPastDue = pastDue.filter((m) => m.status === "Complete");
  const milestoneAdherencePct =
    pastDue.length === 0
      ? 100
      : Math.round((completedPastDue.length / pastDue.length) * 1000) / 10;

  const openBlockers = milestones.filter(
    (m) => m.status === "At Risk" || m.status === "Delayed",
  ).length;

  const visibleProgrammes = new Set(milestones.map((m) => m.programme_code)).size;

  // TODO: replace with actuals when sprint-velocity endpoint lands
  const sprintVelocityPts = milestones.filter(
    (m) => m.status === "Complete",
  ).length;

  return {
    onTimePct,
    milestoneAdherencePct,
    openBlockers,
    visibleProgrammes,
    sprintVelocityPts,
    csat: 4.2, // TODO: replace with actuals when csat endpoint lands
  };
}

// ---------------------------------------------------------------------------
// On-Time by Programme
// ---------------------------------------------------------------------------

export interface OnTimeRow {
  programmeCode: string;
  onTimePct: number;
  total: number;
  atRisk: number;
  delayed: number;
}

/** Group milestones by programme and compute on-time rate. Sorted desc by onTimePct. */
export function buildOnTimeByProgramme(milestones: MilestoneItem[]): OnTimeRow[] {
  const acc = new Map<
    string,
    { onTrackComplete: number; atRisk: number; delayed: number; total: number }
  >();

  for (const m of milestones) {
    const entry = acc.get(m.programme_code) ?? {
      onTrackComplete: 0,
      atRisk: 0,
      delayed: 0,
      total: 0,
    };
    entry.total++;
    if (m.status === "On Track" || m.status === "Complete") entry.onTrackComplete++;
    if (m.status === "At Risk") entry.atRisk++;
    if (m.status === "Delayed") entry.delayed++;
    acc.set(m.programme_code, entry);
  }

  return [...acc.entries()]
    .map(([programmeCode, counts]) => ({
      programmeCode,
      onTimePct: Math.round((counts.onTrackComplete / counts.total) * 1000) / 10,
      total: counts.total,
      atRisk: counts.atRisk,
      delayed: counts.delayed,
    }))
    .sort((a, b) => b.onTimePct - a.onTimePct);
}

// ---------------------------------------------------------------------------
// Slipping Milestones (top 5)
// ---------------------------------------------------------------------------

export interface SlippingMilestone {
  milestoneId: string;
  title: string;
  programmeCode: string;
  dueDate: string;
  baselineDate: string | null;
  status: MilestoneStatus;
  completionPct: number;
  /** Days past due_date. Zero for future-dated milestones. */
  slipDays: number;
}

/** Return up to 5 At Risk + Delayed milestones sorted by slip days desc. */
export function buildSlippingMilestones(milestones: MilestoneItem[]): SlippingMilestone[] {
  const today = Date.now();

  return milestones
    .filter((m) => m.status === "At Risk" || m.status === "Delayed")
    .map((m) => {
      const dueDayMs = new Date(m.due_date).getTime();
      const slipDays = dueDayMs < today ? Math.floor((today - dueDayMs) / MS_PER_DAY) : 0;
      return {
        milestoneId: m.milestone_id,
        title: m.title,
        programmeCode: m.programme_code,
        dueDate: m.due_date,
        baselineDate: m.baseline_date,
        status: m.status,
        completionPct: m.completion_pct,
        slipDays,
      };
    })
    .sort((a, b) => {
      if (b.slipDays !== a.slipDays) return b.slipDays - a.slipDays;
      if (a.status === "Delayed" && b.status !== "Delayed") return -1;
      if (b.status === "Delayed" && a.status !== "Delayed") return 1;
      return 0;
    })
    .slice(0, 5);
}

// ---------------------------------------------------------------------------
// Velocity Trend (monthly buckets of due_date)
// ---------------------------------------------------------------------------

export interface SprintBucket {
  /** 0-indexed sequential bucket label. */
  sprint: number;
  /** Milestones with status Complete due in this month. */
  completed: number;
  /** All milestones due in this month. */
  total: number;
}

/**
 * Group milestones by calendar month of due_date and compute completion counts.
 *
 * Month buckets are sorted chronologically; the chart renders the last 8.
 */
export function buildVelocityTrend(milestones: MilestoneItem[]): SprintBucket[] {
  if (milestones.length === 0) return [];

  const acc = new Map<string, { completed: number; total: number }>();

  for (const m of milestones) {
    const d = new Date(m.due_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = acc.get(key) ?? { completed: 0, total: 0 };
    bucket.total++;
    if (m.status === "Complete") bucket.completed++;
    acc.set(key, bucket);
  }

  return [...acc.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, counts], i) => ({ sprint: i, ...counts }));
}

// ---------------------------------------------------------------------------
// Estimation Accuracy (Rev 4)
// ---------------------------------------------------------------------------

export interface EstimationRow {
  programmeCode: string;
  totalMilestones: number;
  completedOrOnTrack: number;
  /** Percentage of milestones On Track or Complete. */
  accuracy: number;
  /** Count of Delayed milestones with no baseline_date (unpriced slippage). */
  silentDrift: number;
}

/** Compute estimation accuracy per programme. Sorted accuracy ascending (worst first). */
export function buildEstimationAccuracy(milestones: MilestoneItem[]): EstimationRow[] {
  const acc = new Map<
    string,
    { total: number; completedOrOnTrack: number; silentDrift: number }
  >();

  for (const m of milestones) {
    const entry = acc.get(m.programme_code) ?? {
      total: 0,
      completedOrOnTrack: 0,
      silentDrift: 0,
    };
    entry.total++;
    if (m.status === "Complete" || m.status === "On Track") entry.completedOrOnTrack++;
    if (m.status === "Delayed" && m.baseline_date === null) entry.silentDrift++;
    acc.set(m.programme_code, entry);
  }

  return [...acc.entries()]
    .map(([programmeCode, counts]) => ({
      programmeCode,
      totalMilestones: counts.total,
      completedOrOnTrack: counts.completedOrOnTrack,
      accuracy: Math.round((counts.completedOrOnTrack / counts.total) * 1000) / 10,
      silentDrift: counts.silentDrift,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

// ---------------------------------------------------------------------------
// EVM Quartet (synthetic, per programme)
// ---------------------------------------------------------------------------

export interface EVMMetrics {
  /** Schedule performance index: (On Track + Complete) / total milestones. */
  spi: number;
  /**
   * Cost performance index (synthetic proxy from avg completion_pct).
   * TODO: replace with actuals when financials_monthly endpoint lands.
   */
  cpi: number;
  /**
   * To-complete performance index (1/spi rough proxy).
   * TODO: replace with actuals when financials_monthly endpoint lands.
   */
  tcpi: number;
  /**
   * Estimate at completion label.
   * TODO: replace with actuals when financials_monthly endpoint lands.
   */
  eacLabel: string;
}

/** Filter to a single programme code. Used when ?p=CODE is active. */
export function filterMilestonesByProgramme(
  milestones: MilestoneItem[],
  code: string,
): MilestoneItem[] {
  return milestones.filter((m) => m.programme_code === code);
}

const STATUS_PRIORITY: Record<MilestoneStatus, number> = {
  Delayed: 0,
  "At Risk": 1,
  "On Track": 2,
  Complete: 3,
};

/**
 * Return ALL milestones as SlippingMilestone rows, sorted by status priority then slip days desc.
 * Used in the programme-scoped list view when ?p=CODE is active.
 */
export function buildMilestoneList(milestones: MilestoneItem[]): SlippingMilestone[] {
  const today = Date.now();
  return milestones
    .map((m) => {
      const dueDayMs = new Date(m.due_date).getTime();
      const slipDays = dueDayMs < today ? Math.floor((today - dueDayMs) / MS_PER_DAY) : 0;
      return {
        milestoneId: m.milestone_id,
        title: m.title,
        programmeCode: m.programme_code,
        dueDate: m.due_date,
        baselineDate: m.baseline_date,
        status: m.status,
        completionPct: m.completion_pct,
        slipDays,
      };
    })
    .sort((a, b) => {
      const orderDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (orderDiff !== 0) return orderDiff;
      return b.slipDays - a.slipDays;
    });
}

export function computeEVMForProgramme(
  milestones: MilestoneItem[],
  programmeCode: string,
): EVMMetrics {
  const prog = milestones.filter((m) => m.programme_code === programmeCode);
  if (prog.length === 0) {
    return { spi: 1.0, cpi: 1.0, tcpi: 1.0, eacLabel: "N/A" };
  }

  const onTrackOrComplete = prog.filter(
    (m) => m.status === "On Track" || m.status === "Complete",
  ).length;
  const spi = Math.round((onTrackOrComplete / prog.length) * 100) / 100;

  // TODO: replace with actuals when financials_monthly endpoint lands
  const avgPct = prog.reduce((s, m) => s + m.completion_pct, 0) / prog.length;
  const cpi = Math.round((avgPct / 100) * 100) / 100 || 0.9;

  // TODO: replace with actuals when financials_monthly endpoint lands
  const tcpi = spi > 0 ? Math.round((1 / spi) * 100) / 100 : 1.0;

  // TODO: replace with actuals when financials_monthly endpoint lands
  const eacLabel = "Unavailable";

  return { spi, cpi, tcpi, eacLabel };
}
