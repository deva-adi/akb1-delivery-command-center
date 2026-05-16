"use client";

/**
 * SLA Status Matrix with drill interactivity (M10-5).
 *
 * Click a cell        -> sets ?p=CODE&sla=SLUG
 * Click a row header  -> sets ?p=CODE, clears ?sla=
 * Click a col header  -> sets ?sla=SLUG, preserves ?p= if active
 *
 * activeProgramme and activeSla come from ops-sla/page.tsx (server searchParams).
 * useRouter is used for navigation; useSearchParams is NOT used here to avoid
 * requiring a Suspense boundary on this component.
 *
 * Highlighting:
 *   active row   -- gold background tint on the entire row
 *   active col   -- gold underline on the column header
 *   active cell  -- gold ring-2 on the cell badge (intersection of row + col)
 */

import { useRouter } from "next/navigation";
import type { SLAMatrixRow, SLACellState, SLACategory } from "@/lib/ops-sla";
import { SLA_CATEGORIES, SLA_SLUGS } from "@/lib/ops-sla";

interface Props {
  rows: SLAMatrixRow[];
  activeProgramme: string | null;
  activeSla: string | null;
}

function cellStyle(state: SLACellState): string {
  if (state === "BREACH") return "bg-status-red text-bg-base font-bold";
  if (state === "RED") return "bg-status-red/70 text-bg-base";
  if (state === "AMBER") return "bg-status-amber text-bg-base";
  return "bg-status-green text-bg-base";
}

export function OpsSLAMatrix({ rows, activeProgramme, activeSla }: Props) {
  const router = useRouter();

  function handleCellClick(programmeCode: string, category: SLACategory) {
    const slug = SLA_SLUGS[category];
    const params = new URLSearchParams();
    params.set("p", programmeCode);
    params.set("sla", slug);
    router.push(`/home/ops-sla?${params.toString()}`, { scroll: false });
  }

  function handleRowHeaderClick(programmeCode: string) {
    const params = new URLSearchParams();
    params.set("p", programmeCode);
    // ?sla= intentionally cleared: row header drill is programme-only
    router.push(`/home/ops-sla?${params.toString()}`, { scroll: false });
  }

  function handleColHeaderClick(category: SLACategory) {
    const slug = SLA_SLUGS[category];
    const params = new URLSearchParams();
    if (activeProgramme !== null) params.set("p", activeProgramme);
    params.set("sla", slug);
    router.push(`/home/ops-sla?${params.toString()}`, { scroll: false });
  }

  function handleKeyActivate(
    e: React.KeyboardEvent,
    action: () => void,
  ) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  }

  if (rows.length === 0) {
    return (
      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-testid="ops-sla-matrix"
      >
        <h3 className="text-text-primary font-semibold mb-4">SLA Status Matrix</h3>
        <p className="text-text-muted text-sm">No programme health data available.</p>
      </div>
    );
  }

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="ops-sla-matrix"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">SLA Status Matrix</h3>
        <span className="text-text-subtle text-xs">
          {rows.length} programmes x 6 SLA categories (health proxy)
          {/* TODO: replace with sla_metrics entity when seeded */}
        </span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Click a cell to scope programme and SLA category. Click a row header to scope by programme.
        Click a column header to scope by SLA category. Derived from health snapshot sub-RAGs.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider">
              <th className="text-left py-2 pr-3 font-medium text-text-muted">Programme</th>
              {SLA_CATEGORIES.map((cat) => {
                const slug = SLA_SLUGS[cat];
                const isColActive = activeSla === slug;
                return (
                  <th
                    key={cat}
                    className={`py-2 px-1 text-center font-medium cursor-pointer select-none transition-colors hover:text-accent-gold ${
                      isColActive
                        ? "text-accent-gold underline underline-offset-2"
                        : "text-text-muted"
                    }`}
                    onClick={() => handleColHeaderClick(cat)}
                    onKeyDown={(e) => handleKeyActivate(e, () => handleColHeaderClick(cat))}
                    role="button"
                    tabIndex={0}
                    aria-label={`Filter by SLA category ${cat}`}
                    data-testid={`sla-col-header-${slug}`}
                  >
                    {cat}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isRowActive = activeProgramme === row.programmeCode;
              return (
                <tr
                  key={row.programmeCode}
                  className={`transition-colors ${
                    isRowActive
                      ? "bg-accent-gold/10"
                      : "hover:bg-bg-surface-subtle/50"
                  }`}
                >
                  <td
                    className={`py-1.5 pr-3 font-semibold cursor-pointer select-none transition-colors hover:text-accent-gold ${
                      isRowActive ? "text-accent-gold" : "text-text-primary"
                    }`}
                    onClick={() => handleRowHeaderClick(row.programmeCode)}
                    onKeyDown={(e) =>
                      handleKeyActivate(e, () => handleRowHeaderClick(row.programmeCode))
                    }
                    role="button"
                    tabIndex={0}
                    aria-label={`Filter by programme ${row.programmeCode}`}
                    data-testid={`sla-row-header-${row.programmeCode}`}
                  >
                    {row.programmeCode}
                  </td>
                  {row.cells.map((cell) => {
                    const slug = SLA_SLUGS[cell.category];
                    const isColActive = activeSla === slug;
                    const isCellActive = isRowActive && isColActive;
                    return (
                      <td key={cell.category} className="py-1.5 px-1">
                        <div
                          className={`h-7 rounded flex items-center justify-center text-[10px] font-mono tabular-nums cursor-pointer hover:opacity-80 transition-opacity ${cellStyle(cell.state)} ${
                            isCellActive
                              ? "ring-2 ring-accent-gold ring-inset"
                              : isColActive
                                ? "ring-1 ring-accent-gold/50 ring-inset"
                                : ""
                          }`}
                          onClick={() => handleCellClick(row.programmeCode, cell.category)}
                          onKeyDown={(e) =>
                            handleKeyActivate(e, () =>
                              handleCellClick(row.programmeCode, cell.category),
                            )
                          }
                          role="button"
                          tabIndex={0}
                          aria-label={`${row.programmeCode} ${cell.category}: ${cell.state}`}
                          data-testid={`sla-cell-${row.programmeCode}-${slug}`}
                        >
                          {cell.state}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
