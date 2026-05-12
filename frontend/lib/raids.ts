/**
 * Pure utility functions for the Risk and RAID tab.
 *
 * All functions are side-effect-free and independently unit-testable.
 * Page components call these after fetching from the backend.
 */

export const PROGRAMME_CODES = [
  "PEGASUS",
  "PHOENIX",
  "ORION",
  "STELLAR",
  "HELIX",
  "ATLAS",
  "DRACO",
  "LYRA",
  "VEGA",
  "ANDROMEDA",
] as const;

export const RAID_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "ProgrammeManager",
  "FinanceLead",
]);

export function isRaidAllowed(role: string): boolean {
  return RAID_ALLOWED_ROLES.has(role);
}

export type RaidSeverity = "Critical" | "High" | "Medium" | "Low";
export type RaidStatus = "Open" | "Escalated" | "Mitigated" | "Accepted" | "Closed";
export type RaidType = "Risk" | "Assumption" | "Issue" | "Dependency";

export interface RaidItem {
  raid_id: string;
  programme_code: string;
  raid_type: RaidType;
  title: string;
  description: string | null;
  severity: RaidSeverity;
  status: RaidStatus;
  owner_user_id: string | null;
  mitigation_date: string | null;
  raised_date: string;
  created_at: string;
  updated_at: string;
}

export interface RaidListResponse {
  items: RaidItem[];
  count: number;
}

export interface HeatMapRow {
  programmeCode: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface Top10Row {
  raidId: string;
  title: string;
  programmeCode: string;
  raidType: RaidType;
  ownerUserId: string | null;
  status: RaidStatus;
  severity: RaidSeverity;
  updatedAt: string;
}

export interface WeekBucket {
  week: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RaidKPIs {
  openCount: number;
  highSevCount: number;
  agingCount: number;
}

const OPEN_STATUSES: Set<RaidStatus> = new Set(["Open", "Escalated"]);
const HIGH_SEVERITIES: Set<RaidSeverity> = new Set(["Critical", "High"]);
const SEVERITY_ORDER: Record<RaidSeverity, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/** Build heat map rows from a flat list of raids. Counts open+escalated only. Sorted by total desc. */
export function buildHeatMap(raids: RaidItem[]): HeatMapRow[] {
  const acc = new Map<string, { critical: number; high: number; medium: number; low: number }>();

  for (const raid of raids) {
    if (!OPEN_STATUSES.has(raid.status)) continue;
    const entry = acc.get(raid.programme_code) ?? { critical: 0, high: 0, medium: 0, low: 0 };
    switch (raid.severity) {
      case "Critical": entry.critical++; break;
      case "High": entry.high++; break;
      case "Medium": entry.medium++; break;
      case "Low": entry.low++; break;
    }
    acc.set(raid.programme_code, entry);
  }

  return [...acc.entries()]
    .map(([programmeCode, counts]) => ({
      programmeCode,
      ...counts,
      total: counts.critical + counts.high + counts.medium + counts.low,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Return up to 10 open Critical/High raids, sorted severity desc then updated_at desc. */
export function buildTop10(raids: RaidItem[]): Top10Row[] {
  return raids
    .filter((r) => OPEN_STATUSES.has(r.status) && HIGH_SEVERITIES.has(r.severity))
    .sort((a, b) => {
      const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 10)
    .map((r) => ({
      raidId: r.raid_id,
      title: r.title,
      programmeCode: r.programme_code,
      raidType: r.raid_type,
      ownerUserId: r.owner_user_id,
      status: r.status,
      severity: r.severity,
      updatedAt: r.updated_at,
    }));
}

/**
 * Group raids into weekly buckets based on raised_date.
 *
 * Week 0 = the week containing the earliest raised_date across all raids.
 * Week N = Math.floor(daysSinceEarliest / 7).
 */
export function buildTrend(raids: RaidItem[]): WeekBucket[] {
  if (raids.length === 0) return [];

  const timestamps = raids.map((r) => new Date(r.raised_date).getTime());
  const earliest = Math.min(...timestamps);

  const buckets = new Map<number, { critical: number; high: number; medium: number; low: number }>();

  for (const raid of raids) {
    const daysSince =
      (new Date(raid.raised_date).getTime() - earliest) / (1000 * 60 * 60 * 24);
    const week = Math.floor(daysSince / 7);
    const bucket = buckets.get(week) ?? { critical: 0, high: 0, medium: 0, low: 0 };
    switch (raid.severity) {
      case "Critical": bucket.critical++; break;
      case "High": bucket.high++; break;
      case "Medium": bucket.medium++; break;
      case "Low": bucket.low++; break;
    }
    buckets.set(week, bucket);
  }

  const maxWeek = Math.max(...buckets.keys());
  return Array.from({ length: maxWeek + 1 }, (_, i) => ({
    week: i,
    ...(buckets.get(i) ?? { critical: 0, high: 0, medium: 0, low: 0 }),
  }));
}

/** Filter to a single programme code. Used when ?p=CODE is active. */
export function filterRaidsByProgramme(raids: RaidItem[], code: string): RaidItem[] {
  return raids.filter((r) => r.programme_code === code);
}

const VALID_SEVERITIES = new Set(["Critical", "High", "Medium", "Low"]);
const VALID_TYPES = new Set(["Risk", "Assumption", "Issue", "Dependency"]);

/** Filter by severity string. Returns all raids unchanged when value is not a valid severity. */
export function filterRaidsBySeverity(raids: RaidItem[], severity: string): RaidItem[] {
  if (!VALID_SEVERITIES.has(severity)) return raids;
  return raids.filter((r) => r.severity === severity);
}

/** Filter by raid_type string. Returns all raids unchanged when value is not a valid type. */
export function filterRaidsByType(raids: RaidItem[], type: string): RaidItem[] {
  if (!VALID_TYPES.has(type)) return raids;
  return raids.filter((r) => r.raid_type === type);
}

/**
 * Build a filtered top-10 list.
 * When severity is provided: filters to that severity only.
 * When severity is null/omitted: defaults to Critical + High.
 * When type is provided: additionally filters by raid_type.
 */
export function buildFilteredTop10(
  raids: RaidItem[],
  opts: { severity?: string | null; type?: string | null } = {},
): Top10Row[] {
  let open = raids.filter((r) => OPEN_STATUSES.has(r.status));

  if (opts.severity && VALID_SEVERITIES.has(opts.severity)) {
    open = open.filter((r) => r.severity === opts.severity);
  } else {
    open = open.filter((r) => HIGH_SEVERITIES.has(r.severity));
  }

  if (opts.type && VALID_TYPES.has(opts.type)) {
    open = open.filter((r) => r.raid_type === opts.type);
  }

  return open
    .sort((a, b) => {
      const sevDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    })
    .slice(0, 10)
    .map((r) => ({
      raidId: r.raid_id,
      title: r.title,
      programmeCode: r.programme_code,
      raidType: r.raid_type,
      ownerUserId: r.owner_user_id,
      status: r.status,
      severity: r.severity,
      updatedAt: r.updated_at,
    }));
}

/** Compute top-level KPI numbers from all fetched raids. */
export function computeKPIs(raids: RaidItem[]): RaidKPIs {
  const now = Date.now();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const openRaids = raids.filter((r) => OPEN_STATUSES.has(r.status));

  return {
    openCount: openRaids.length,
    highSevCount: openRaids.filter((r) => HIGH_SEVERITIES.has(r.severity)).length,
    agingCount: openRaids.filter(
      (r) => (now - new Date(r.raised_date).getTime()) / MS_PER_DAY > 30,
    ).length,
  };
}
