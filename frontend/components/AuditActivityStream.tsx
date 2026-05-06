"use client";

/**
 * Audit Trail Console activity stream.
 *
 * Client component: manages filter state, paginates via the
 * /api/audit/search Route Handler proxy, and expands rows by
 * fetching /api/audit/entry/{id} via the Route Handler proxy.
 *
 * AP enforcement is handled entirely by the backend; this component
 * surfaces the 403 responses as inline messages without reproducing
 * the access logic.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  AuditSearchEntry,
  AuditSearchResponse,
  AuditEntryDetail,
} from "@/lib/audit-console";
import {
  formatTimestamp,
  methodChip,
  outcomeChip,
  roleChip,
  buildDiffLines,
  type DiffLine,
} from "@/lib/audit-console";

type TimeWindow = "24h" | "7d" | "30d" | "90d";
type ExpandState = "loading" | "loaded" | "denied" | "error";

interface Props {
  initialItems: AuditSearchEntry[];
  initialTotalCount: number;
  initialNextCursor: string | null;
  /** True when the server-side initial fetch returned 403 (AP or role denial). */
  apDenied: boolean;
  /** Whether the current user can request per-entry detail (ap_flag=true). */
  canSeeDetail: boolean;
}

interface ExpandedEntry {
  state: ExpandState;
  detail: AuditEntryDetail | null;
}

const TIME_WINDOWS: TimeWindow[] = ["24h", "7d", "30d", "90d"];

const HTTP_METHODS = ["", "PATCH", "POST", "PUT", "DELETE"] as const;
const METHOD_LABELS: Record<string, string> = {
  "":       "All",
  PATCH:    "PATCH",
  POST:     "POST",
  PUT:      "PUT",
  DELETE:   "DELETE",
};

const OUTCOMES = ["", "Success", "Denied", "ApFlagDenied", "RoleDenied", "Error"] as const;
const OUTCOME_LABELS: Record<string, string> = {
  "":           "All",
  Success:      "Success",
  Denied:       "Denied",
  ApFlagDenied: "AP Denied",
  RoleDenied:   "Role Denied",
  Error:        "Error",
};

export function AuditActivityStream({
  initialItems,
  initialTotalCount,
  initialNextCursor,
  apDenied,
  canSeeDetail,
}: Props): JSX.Element {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("7d");
  const [httpMethod, setHttpMethod] = useState("");
  const [outcome, setOutcome] = useState("");

  const [items, setItems] = useState<AuditSearchEntry[]>(initialItems);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [fetchError, setFetchError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<
    Map<string, ExpandedEntry>
  >(new Map());

  const isInitialRender = useRef(true);

  const buildParams = useCallback(
    (cursor?: string): URLSearchParams => {
      const p = new URLSearchParams();
      p.set("time_window", timeWindow);
      if (httpMethod) p.set("http_method", httpMethod);
      if (outcome) p.set("outcome", outcome);
      if (cursor) p.set("cursor", cursor);
      p.set("page_size", "50");
      return p;
    },
    [timeWindow, httpMethod, outcome],
  );

  const fetchItems = useCallback(
    async (cursor?: string): Promise<void> => {
      const appending = cursor !== undefined;
      if (appending) {
        setLoadingMore(true);
      } else {
        setFilterLoading(true);
        setFetchError(false);
      }

      try {
        const response = await fetch(
          `/api/audit/search?${buildParams(cursor).toString()}`,
        );
        if (!response.ok) {
          setFetchError(true);
          return;
        }
        const data = (await response.json()) as AuditSearchResponse;
        if (appending) {
          setItems((prev) => [...prev, ...data.items]);
        } else {
          setItems(data.items);
          setExpandedId(null);
        }
        setTotalCount(data.total_count);
        setNextCursor(data.next_cursor ?? null);
      } catch {
        setFetchError(true);
      } finally {
        if (appending) {
          setLoadingMore(false);
        } else {
          setFilterLoading(false);
        }
      }
    },
    [buildParams],
  );

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    void fetchItems();
  }, [timeWindow, httpMethod, outcome, fetchItems]);

  async function expandRow(entryId: string): Promise<void> {
    if (expandedId === entryId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(entryId);

    if (expandedEntries.has(entryId)) return;

    setExpandedEntries((prev) =>
      new Map(prev).set(entryId, { state: "loading", detail: null }),
    );

    try {
      const response = await fetch(`/api/audit/entry/${entryId}`);
      if (response.status === 403) {
        setExpandedEntries((prev) =>
          new Map(prev).set(entryId, { state: "denied", detail: null }),
        );
        return;
      }
      if (!response.ok) {
        setExpandedEntries((prev) =>
          new Map(prev).set(entryId, { state: "error", detail: null }),
        );
        return;
      }
      const detail = (await response.json()) as AuditEntryDetail;
      setExpandedEntries((prev) =>
        new Map(prev).set(entryId, { state: "loaded", detail }),
      );
    } catch {
      setExpandedEntries((prev) =>
        new Map(prev).set(entryId, { state: "error", detail: null }),
      );
    }
  }

  if (apDenied) {
    return (
      <div
        className="bg-bg-surface border border-border-subtle rounded-md p-8 text-center"
        data-testid="audit-ap-denied"
      >
        <p className="text-text-secondary text-sm mb-1">
          Audit Permission required to view the audit trail.
        </p>
        <p className="text-text-subtle text-xs">
          Contact your Portfolio Owner to enable the AP flag on your account.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FilterBar
        timeWindow={timeWindow}
        httpMethod={httpMethod}
        outcome={outcome}
        onTimeWindow={setTimeWindow}
        onHttpMethod={setHttpMethod}
        onOutcome={setOutcome}
      />

      <div className="bg-bg-surface border border-border-subtle rounded-md">
        <div className="border-b border-border-subtle px-4 py-3 flex items-center justify-between">
          <h2 className="text-text-primary text-base font-semibold">Activity Stream</h2>
          <span className="text-text-muted text-xs">
            {filterLoading
              ? "Loading..."
              : `Showing ${items.length} of ${totalCount.toLocaleString()} results`}
          </span>
        </div>

        {fetchError && (
          <div className="px-4 py-3 border-b border-border-subtle">
            <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded px-3 py-2">
              Failed to load audit events. Check your connection and try again.
            </p>
          </div>
        )}

        <div className="divide-y divide-border-subtle" data-testid="audit-stream">
          {items.length === 0 && !filterLoading ? (
            <EmptyState />
          ) : (
            items.map((item) => (
              <AuditStreamRow
                key={item.entry_id}
                item={item}
                expanded={expandedId === item.entry_id}
                expandedEntry={expandedEntries.get(item.entry_id) ?? null}
                canSeeDetail={canSeeDetail}
                onExpand={() => void expandRow(item.entry_id)}
              />
            ))
          )}
        </div>

        {nextCursor !== null && (
          <div className="border-t border-border-subtle px-4 py-3 flex items-center justify-between text-xs text-text-muted">
            <span>
              Showing {items.length} of {totalCount.toLocaleString()}
            </span>
            <button
              onClick={() => void fetchItems(nextCursor)}
              disabled={loadingMore}
              className="text-accent-gold hover:underline disabled:opacity-50"
              data-testid="load-more"
            >
              {loadingMore ? "Loading..." : "Load 50 more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

interface FilterBarProps {
  timeWindow: TimeWindow;
  httpMethod: string;
  outcome: string;
  onTimeWindow: (v: TimeWindow) => void;
  onHttpMethod: (v: string) => void;
  onOutcome: (v: string) => void;
}

function FilterBar({
  timeWindow,
  httpMethod,
  outcome,
  onTimeWindow,
  onHttpMethod,
  onOutcome,
}: FilterBarProps): JSX.Element {
  return (
    <div
      className="flex items-center gap-3 flex-wrap mb-4"
      data-testid="audit-filter-bar"
    >
      <div className="flex items-center bg-bg-surface border border-border-subtle rounded-md overflow-hidden">
        {TIME_WINDOWS.map((tw) => (
          <button
            key={tw}
            onClick={() => onTimeWindow(tw)}
            className={`px-3 py-1.5 text-xs transition ${
              timeWindow === tw
                ? "text-accent-gold bg-bg-surface-subtle font-medium"
                : "text-text-muted hover:text-text-primary"
            }`}
            data-testid={`time-window-${tw}`}
            aria-pressed={timeWindow === tw}
          >
            {tw}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-md cursor-pointer hover:border-accent-gold transition">
        <span className="text-text-muted text-[10px] uppercase tracking-wider">Method</span>
        <select
          value={httpMethod}
          onChange={(e) => onHttpMethod(e.target.value)}
          className="bg-transparent text-text-primary text-sm appearance-none focus:outline-none cursor-pointer"
          data-testid="filter-method"
          aria-label="Filter by HTTP method"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {METHOD_LABELS[m]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-md cursor-pointer hover:border-accent-gold transition">
        <span className="text-text-muted text-[10px] uppercase tracking-wider">Outcome</span>
        <select
          value={outcome}
          onChange={(e) => onOutcome(e.target.value)}
          className="bg-transparent text-text-primary text-sm appearance-none focus:outline-none cursor-pointer"
          data-testid="filter-outcome"
          aria-label="Filter by outcome"
        >
          {OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {OUTCOME_LABELS[o]}
            </option>
          ))}
        </select>
      </label>

      <div
        className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-md"
        data-stub="true"
        title="Actor filter: awaiting people name lookup endpoint"
      >
        <span className="text-text-muted text-[10px] uppercase tracking-wider">Actor</span>
        <span className="text-text-subtle text-sm">All</span>
        <span className="px-1 py-0 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
          stub
        </span>
      </div>

      <div
        className="flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-border-subtle rounded-md"
        data-stub="true"
        title="Export: awaiting /audit/export endpoint"
      >
        <span className="text-text-muted text-xs font-medium">Export Audit Bundle</span>
        <span className="px-1 py-0 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
          stub
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Individual stream row
// ---------------------------------------------------------------------------

interface RowProps {
  item: AuditSearchEntry;
  expanded: boolean;
  expandedEntry: ExpandedEntry | null;
  canSeeDetail: boolean;
  onExpand: () => void;
}

function AuditStreamRow({
  item,
  expanded,
  expandedEntry,
  canSeeDetail,
  onExpand,
}: RowProps): JSX.Element {
  const mChip = methodChip(item.http_method);
  const oChip = outcomeChip(item.outcome);
  const rChip = roleChip(item.actor_role);
  const shortRole = ROLE_ABBREV[item.actor_role] ?? item.actor_role.slice(0, 4).toUpperCase();
  const shortUuid = item.actor_user_id.slice(0, 8);

  return (
    <>
      <div
        className="px-4 py-2 hover:bg-bg-surface-elevated/30 cursor-pointer text-xs flex items-center gap-3"
        onClick={onExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onExpand()}
        aria-expanded={expanded}
        data-testid={`audit-row-${item.entry_id}`}
      >
        <span className="font-mono text-text-muted tabular-nums w-36 shrink-0">
          {formatTimestamp(item.occurred_at)}
        </span>
        <span className="text-text-secondary w-28 shrink-0 font-mono text-[11px] truncate" title={item.actor_user_id}>
          {shortUuid}
        </span>
        <span
          className={`px-1.5 py-0.5 ${rChip.bg} ${rChip.text} rounded text-[10px] w-12 text-center shrink-0`}
        >
          {shortRole}
        </span>
        <span
          className={`px-1.5 py-0.5 ${mChip.bg} ${mChip.text} rounded text-[10px] w-14 text-center shrink-0`}
        >
          {item.http_method}
        </span>
        <span className="font-mono text-text-secondary flex-1 truncate" title={item.endpoint}>
          {item.endpoint}
        </span>
        <span className="text-text-secondary w-40 shrink-0 truncate" title={item.resource_type}>
          {item.resource_type}
          {item.resource_id !== null && (
            <span className="text-text-subtle"> #{item.resource_id.slice(0, 8)}</span>
          )}
        </span>
        <span
          className={`px-1.5 py-0.5 ${oChip.bg} ${oChip.text} rounded text-[10px] w-20 text-center shrink-0`}
        >
          {item.outcome}
        </span>
      </div>

      {expanded && (
        <ExpandedRow
          item={item}
          expandedEntry={expandedEntry}
          canSeeDetail={canSeeDetail}
        />
      )}
    </>
  );
}

const ROLE_ABBREV: Record<string, string> = {
  PortfolioOwner:    "PO",
  DeliveryDirector:  "DD",
  ProgrammeManager:  "PM",
  FinanceLead:       "FL",
  HRBusinessPartner: "HRBP",
  ReadOnly:          "RO",
};

// ---------------------------------------------------------------------------
// Expanded row: diff view
// ---------------------------------------------------------------------------

interface ExpandedRowProps {
  item: AuditSearchEntry;
  expandedEntry: ExpandedEntry | null;
  canSeeDetail: boolean;
}

function ExpandedRow({
  item,
  expandedEntry,
  canSeeDetail,
}: ExpandedRowProps): JSX.Element {
  if (!canSeeDetail) {
    return (
      <div
        className="px-4 py-3 bg-bg-surface-subtle border-b border-border-subtle"
        data-testid="ap-required-message"
      >
        <p className="text-text-muted text-xs">
          Audit Permission required to view full pre- and post-state. Aggregate metadata visible above.
        </p>
      </div>
    );
  }

  if (expandedEntry === null || expandedEntry.state === "loading") {
    return (
      <div className="px-4 py-3 bg-bg-surface-subtle border-b border-border-subtle">
        <p className="text-text-muted text-xs">Loading entry detail...</p>
      </div>
    );
  }

  if (expandedEntry.state === "denied") {
    return (
      <div
        className="px-4 py-3 bg-bg-surface-subtle border-b border-border-subtle"
        data-testid="ap-required-message"
      >
        <p className="text-text-muted text-xs">
          Audit Permission required to view full pre- and post-state. Aggregate metadata visible above.
        </p>
      </div>
    );
  }

  if (expandedEntry.state === "error" || expandedEntry.detail === null) {
    return (
      <div className="px-4 py-3 bg-bg-surface-subtle border-b border-border-subtle">
        <p className="text-status-red text-xs">Failed to load entry detail.</p>
      </div>
    );
  }

  const detail = expandedEntry.detail;
  const { beforeLines, afterLines } = buildDiffLines(
    detail.before_json,
    detail.after_json,
    detail.diff,
  );

  return (
    <div
      className="px-4 py-3 bg-bg-surface-subtle border-b border-border-subtle"
      data-testid={`expanded-row-${item.entry_id}`}
    >
      <div className="grid grid-cols-2 gap-4 mb-3">
        <DiffPanel label="Before" lines={beforeLines} />
        <DiffPanel label="After" lines={afterLines} />
      </div>
      <div className="text-[10px] text-text-subtle">
        Resource: {detail.resource_type}
        {detail.resource_id !== null && ` #${detail.resource_id}`}
        {" | "}Outcome: {detail.outcome}
        {detail.ip_address !== null && ` | IP: ${detail.ip_address}`}
      </div>
    </div>
  );
}

interface DiffPanelProps {
  label: string;
  lines: DiffLine[];
}

function DiffPanel({ label, lines }: DiffPanelProps): JSX.Element {
  return (
    <div>
      <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2">
        {label}
      </div>
      <pre
        className="font-mono text-[10px] text-text-secondary bg-bg-base border border-border-subtle rounded p-3 overflow-x-auto min-h-[3rem]"
        data-testid={`diff-panel-${label.toLowerCase()}`}
      >
        {lines.length === 0 ? (
          <span className="text-text-subtle">No snapshot</span>
        ) : (
          lines.map((line, idx) => (
            <DiffLineRow key={`${line.key}-${idx}`} line={line} />
          ))
        )}
      </pre>
    </div>
  );
}

function DiffLineRow({ line }: { line: DiffLine }): JSX.Element {
  const isAdded = line.kind === "added" || line.kind === "changed-after";
  const isRemoved = line.kind === "removed" || line.kind === "changed-before";

  const lineClass = isAdded
    ? "bg-status-green/15 text-[#86EFAC] block px-1"
    : isRemoved
      ? "bg-status-red/15 text-[#FCA5A5] block px-1"
      : "block px-1";

  const prefix = isAdded ? "+ " : isRemoved ? "- " : "  ";

  return (
    <span className={lineClass}>
      {prefix}
      {`"${line.key}": ${JSON.stringify(line.value)},`}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState(): JSX.Element {
  return (
    <div
      className="px-4 py-12 text-center"
      data-testid="audit-empty-state"
    >
      <p className="text-text-secondary text-sm mb-1">
        No audit events match this filter.
      </p>
      <p className="text-text-subtle text-xs">
        Try widening the time window or removing one filter.
      </p>
    </div>
  );
}
