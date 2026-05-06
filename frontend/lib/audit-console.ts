/**
 * Pure utility functions and type definitions for the Audit Trail Console.
 *
 * Data sources consumed by this tab:
 *   GET /api/v1/audit/search       role-scoped; AP flag enforced by backend
 *   GET /api/v1/audit/entry/{id}   strict AP required for all allowed roles
 *
 * PM backend gap: PRD 26 section 2 grants PM own-action visibility, but the
 * current backend returns 403 RoleDenied on GET /audit/search for PM (slice 4
 * decision, D-040). isAuditAllowed includes PM per PRD intent; the backend 403
 * surfaces as an AP-required message. Deferring PM scoped search to a future
 * backend slice.
 */

export const AUDIT_ALLOWED_ROLES = new Set([
  "PortfolioOwner",
  "DeliveryDirector",
  "FinanceLead",
  "ProgrammeManager",
]);

export function isAuditAllowed(role: string): boolean {
  return AUDIT_ALLOWED_ROLES.has(role);
}

/**
 * Whether the caller can view full before/after JSON in a single-entry detail
 * response. The backend enforces strict AP on GET /audit/entry/{id}: every
 * allowed role must carry ap_flag=true or the backend returns 403 ApFlagDenied.
 */
export function isEntryDetailAllowed(apFlag: boolean): boolean {
  return apFlag;
}

/**
 * Format an ISO 8601 timestamp as "YYYY-MM-DD HH:mm" (UTC) for display in
 * the monospaced activity stream. UTC is used for forensic consistency across
 * environments and is preferable to local time in an audit context.
 */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

// ---------------------------------------------------------------------------
// Chip colour maps (Tailwind class strings)
// ---------------------------------------------------------------------------

export interface ChipStyle {
  bg: string;
  text: string;
}

const DEFAULT_CHIP: ChipStyle = {
  bg: "bg-border-subtle",
  text: "text-text-muted",
};

export const METHOD_CHIP: Record<string, ChipStyle> = {
  PATCH:  { bg: "bg-[#F472B6]/20",      text: "text-[#F472B6]" },
  POST:   { bg: "bg-status-green/20",   text: "text-status-green" },
  PUT:    { bg: "bg-role-pm-soft/20",   text: "text-role-pm-soft" },
  DELETE: { bg: "bg-status-red/20",     text: "text-status-red" },
};

export function methodChip(method: string): ChipStyle {
  return METHOD_CHIP[method] ?? DEFAULT_CHIP;
}

export const OUTCOME_CHIP: Record<string, ChipStyle> = {
  Success:      { bg: "bg-status-green/20", text: "text-status-green" },
  Denied:       { bg: "bg-status-amber/20", text: "text-status-amber" },
  ApFlagDenied: { bg: "bg-status-amber/20", text: "text-status-amber" },
  RoleDenied:   { bg: "bg-status-amber/20", text: "text-status-amber" },
  Error:        { bg: "bg-status-red/20",   text: "text-status-red" },
};

export function outcomeChip(outcome: string): ChipStyle {
  return OUTCOME_CHIP[outcome] ?? DEFAULT_CHIP;
}

export const ROLE_CHIP: Record<string, ChipStyle> = {
  PortfolioOwner:    { bg: "bg-accent-gold/20",   text: "text-accent-gold" },
  DeliveryDirector:  { bg: "bg-role-fl-soft/20",  text: "text-role-fl-soft" },
  ProgrammeManager:  { bg: "bg-role-pm-soft/20",  text: "text-role-pm-soft" },
  FinanceLead:       { bg: "bg-[#F472B6]/20",     text: "text-[#F472B6]" },
  HRBusinessPartner: { bg: "bg-status-green/20",  text: "text-status-green" },
  ReadOnly:          { bg: "bg-border-strong/20", text: "text-text-muted" },
};

export function roleChip(role: string): ChipStyle {
  return ROLE_CHIP[role] ?? DEFAULT_CHIP;
}

// ---------------------------------------------------------------------------
// Diff line types and builder
// ---------------------------------------------------------------------------

export type DiffLineKind =
  | "added"
  | "removed"
  | "unchanged"
  | "changed-before"
  | "changed-after";

export interface DiffLine {
  kind: DiffLineKind;
  key: string;
  value: unknown;
}

export interface AuditEntryDiff {
  added: Record<string, unknown>;
  removed: Record<string, unknown>;
  changed: Record<string, { before: unknown; after: unknown }>;
}

/**
 * Build before/after diff line arrays for the side-by-side split-diff view.
 *
 * When diff is null (either snapshot is null per backend contract D-039 rule),
 * the non-null side is returned as unchanged lines and the null side is empty.
 *
 * Key traversal follows the order of keys in before/after respectively, so
 * stable properties appear in the same positions on both sides.
 */
export function buildDiffLines(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null,
  diff: AuditEntryDiff | null,
): { beforeLines: DiffLine[]; afterLines: DiffLine[] } {
  if (diff === null) {
    return {
      beforeLines:
        before !== null
          ? Object.entries(before).map(([key, value]) => ({
              kind: "unchanged" as const,
              key,
              value,
            }))
          : [],
      afterLines:
        after !== null
          ? Object.entries(after).map(([key, value]) => ({
              kind: "unchanged" as const,
              key,
              value,
            }))
          : [],
    };
  }

  const beforeLines: DiffLine[] = [];
  const afterLines: DiffLine[] = [];

  if (before !== null) {
    for (const [key, rawValue] of Object.entries(before)) {
      if (key in diff.removed) {
        beforeLines.push({ kind: "removed", key, value: rawValue });
      } else if (key in diff.changed) {
        const entry = diff.changed[key];
        beforeLines.push({
          kind: "changed-before",
          key,
          value: entry !== undefined ? entry.before : rawValue,
        });
      } else {
        beforeLines.push({ kind: "unchanged", key, value: rawValue });
      }
    }
  }

  if (after !== null) {
    for (const [key, rawValue] of Object.entries(after)) {
      if (key in diff.added) {
        afterLines.push({ kind: "added", key, value: rawValue });
      } else if (key in diff.changed) {
        const entry = diff.changed[key];
        afterLines.push({
          kind: "changed-after",
          key,
          value: entry !== undefined ? entry.after : rawValue,
        });
      } else {
        afterLines.push({ kind: "unchanged", key, value: rawValue });
      }
    }
  }

  return { beforeLines, afterLines };
}

// ---------------------------------------------------------------------------
// API response types (mirror openapi.json AuditSearchEntry, AuditSearchResponse,
// AuditEntryDetail, AuditEntryDiff)
// ---------------------------------------------------------------------------

export interface AuditSearchEntry {
  entry_id: string;
  actor_user_id: string;
  actor_role: string;
  endpoint: string;
  http_method: string;
  occurred_at: string;
  outcome: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface AuditSearchResponse {
  items: AuditSearchEntry[];
  next_cursor: string | null;
  total_count: number;
  page_size: number;
}

export interface AuditEntryDetail {
  entry_id: string;
  occurred_at: string;
  actor_user_id: string;
  actor_role: string;
  http_method: string;
  endpoint: string;
  resource_type: string;
  resource_id: string | null;
  outcome: string;
  ip_address: string | null;
  before_json: Record<string, unknown> | null;
  after_json: Record<string, unknown> | null;
  diff: AuditEntryDiff | null;
}
