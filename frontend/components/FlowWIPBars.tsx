/**
 * WIP vs Limit bar chart for the Flow and Velocity tab.
 *
 * Each bar is a DrillRow that sets ?p=CODE. The active programme row is
 * highlighted with a gold ring. Clicking the same bar again is a no-op
 * from the URL perspective -- ProgrammeFilterBar handles clearing ?p=.
 *
 * activeProgramme is passed from flow-velocity/page.tsx via server-read
 * searchParams. No useSearchParams hook here -- this is a Server Component.
 */

import type { WIPRow } from "@/lib/flow-velocity";
import { DrillRow } from "@/components/drill/DrillRow";

interface Props {
  rows: WIPRow[];
  activeProgramme: string | null;
}

export function FlowWIPBars({ rows, activeProgramme }: Props) {
  if (rows.length === 0) {
    return (
      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-testid="flow-wip-bars"
      >
        <h3 className="text-text-primary font-semibold mb-4">WIP vs Limit</h3>
        <p className="text-text-muted text-sm">No programme data available.</p>
      </div>
    );
  }

  const maxWip = Math.max(...rows.map((r) => Math.max(r.wip, r.limit)));

  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="flow-wip-bars"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">WIP vs Limit</h3>
        <span className="text-text-subtle text-xs">By programme (milestone proxy)</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Click a bar to scope to that programme. At Risk and On Track milestone count vs limit.
        {/* TODO: replace with story-level WIP when deliverables entity lands */}
      </p>

      <div className="space-y-1">
        {rows.map((row) => {
          const barPct = maxWip > 0 ? Math.round((row.wip / maxWip) * 100) : 0;
          const limitPct = maxWip > 0 ? Math.round((row.limit / maxWip) * 100) : 0;
          const isActive = activeProgramme === row.programmeCode;

          const colour = row.breaching
            ? "bg-status-red"
            : row.wip >= row.limit * 0.9
              ? "bg-status-amber"
              : "bg-status-green";

          const textColour = row.breaching
            ? "text-status-red"
            : row.wip >= row.limit * 0.9
              ? "text-status-amber"
              : "text-status-green";

          const href = `/home/flow-velocity?p=${row.programmeCode}`;

          return (
            <DrillRow
              key={row.programmeCode}
              href={href}
              className={`rounded px-1 py-1 ${isActive ? "ring-2 ring-accent-gold ring-inset" : ""}`}
            >
              <div data-testid={`wip-bar-${row.programmeCode}`}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span
                    className={`font-semibold ${
                      isActive ? "text-accent-gold" : "text-text-primary"
                    }`}
                  >
                    {row.programmeCode}
                  </span>
                  <span className={`font-mono tabular-nums font-bold ${textColour}`}>
                    {row.wip} / {row.limit}
                  </span>
                </div>
                <div className="h-2 bg-bg-surface-subtle rounded relative">
                  <div
                    className={`h-2 rounded ${isActive ? "bg-accent-gold" : colour}`}
                    style={{ width: `${barPct}%` }}
                    data-count={row.wip}
                  />
                  <div
                    className="absolute h-3 w-0.5 bg-accent-gold/60"
                    style={{ left: `${limitPct}%`, top: "-2px" }}
                    title={`WIP limit: ${row.limit}`}
                  />
                </div>
              </div>
            </DrillRow>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle text-[10px] text-text-subtle">
        <span className="inline-block w-0.5 h-2 bg-accent-gold/60 mr-1" />
        WIP limit
      </div>
    </div>
  );
}
