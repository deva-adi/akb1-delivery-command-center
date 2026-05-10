/**
 * Cumulative Flow Diagram stub.
 * TODO: replace SVG with real CFD bands when flow_snapshots entity lands.
 * Requires sprint-bucketed story counts by state (Backlog/In Progress/Review/Done).
 */
export function FlowCFDChart() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="flow-cfd-chart"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Cumulative Flow Diagram</h3>
        <span className="text-text-subtle text-xs">Last 8 sprints | Portfolio</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Backlog, In Progress, Review, Done. Widening In-Progress band signals WIP buildup.
      </p>

      <div className="flex items-center justify-center h-56 bg-bg-surface-subtle rounded border border-border-subtle border-dashed">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center px-2 py-1 bg-accent-gold/10 border border-accent-gold/30 rounded text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
            stub
          </div>
          <p className="text-text-muted text-xs max-w-[240px]">
            CFD requires sprint-bucketed story state data from the
            flow_snapshots entity. No data seeded yet.
          </p>
        </div>
      </div>

      <div className="flex gap-4 text-[11px] mt-3">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-status-green opacity-50" />
          <span className="text-text-secondary">Done</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-status-amber opacity-50" />
          <span className="text-text-secondary">Review</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-accent-gold/50 rounded" />
          <span className="text-text-secondary">In Progress</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-border-strong opacity-50" />
          <span className="text-text-secondary">Backlog</span>
        </span>
      </div>
    </div>
  );
}
