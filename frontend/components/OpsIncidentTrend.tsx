/**
 * Incident Trend stacked area chart stub.
 * TODO: replace with real data when incidents entity lands.
 * Requires P1/P2/P3 incident counts bucketed by week over 12 weeks.
 */
export function OpsIncidentTrend() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="ops-incident-trend"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Incident Trend</h3>
        <span className="text-text-subtle text-xs">Last 12 weeks</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Stacked by severity. P1 rising when Red programmes are active.
      </p>

      <div className="flex items-center justify-center h-56 bg-bg-surface-subtle rounded border border-border-subtle border-dashed">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center px-2 py-1 bg-accent-gold/10 border border-accent-gold/30 rounded text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
            stub
          </div>
          <p className="text-text-muted text-xs max-w-[220px]">
            Incident trend requires P1/P2/P3 counts from the incidents entity.
            No data seeded yet.
          </p>
        </div>
      </div>

      <div className="flex gap-3 text-[10px] mt-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-status-red" />
          <span className="text-text-secondary">P1</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-status-amber" />
          <span className="text-text-secondary">P2</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-border-strong" />
          <span className="text-text-secondary">P3</span>
        </span>
      </div>
    </div>
  );
}
