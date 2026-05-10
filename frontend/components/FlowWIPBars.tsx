import type { WIPRow } from "@/lib/flow-velocity";

interface Props {
  rows: WIPRow[];
}

export function FlowWIPBars({ rows }: Props) {
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
        At Risk and On Track milestone count vs limit.
        {/* TODO: replace with story-level WIP when deliverables entity lands */}
      </p>

      <div className="space-y-2">
        {rows.map((row) => {
          const barPct = maxWip > 0 ? Math.round((row.wip / maxWip) * 100) : 0;
          const limitPct = maxWip > 0 ? Math.round((row.limit / maxWip) * 100) : 0;
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

          return (
            <div key={row.programmeCode}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-text-primary font-semibold">{row.programmeCode}</span>
                <span className={`font-mono tabular font-bold ${textColour}`}>
                  {row.wip} / {row.limit}
                </span>
              </div>
              <div className="h-2 bg-bg-surface-subtle rounded relative">
                <div
                  className={`h-2 rounded ${colour}`}
                  style={{ width: `${barPct}%` }}
                />
                <div
                  className="absolute h-3 w-0.5 bg-accent-gold"
                  style={{ left: `${limitPct}%`, top: "-2px" }}
                  title={`WIP limit: ${row.limit}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle text-[10px] text-text-subtle">
        <span className="inline-block w-0.5 h-2 bg-accent-gold mr-1" />
        WIP limit
      </div>
    </div>
  );
}
