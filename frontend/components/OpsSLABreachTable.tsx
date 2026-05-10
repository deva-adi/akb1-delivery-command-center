/**
 * Top 10 SLA Breaches table stub.
 * TODO: replace with real data when sla_metrics entity lands.
 * Requires SLA breach records with metric name, programme, target, actual,
 * breach count, penalty exposure, and state.
 */
export function OpsSLABreachTable() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="ops-sla-breach-table"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Top 10 SLA Breaches</h3>
        <span className="text-text-subtle text-xs">QTD | Ranked by penalty exposure</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Drill any row for breach detail, root cause, and recovery plan.
      </p>

      <div className="flex items-center justify-center py-12 bg-bg-surface-subtle rounded border border-border-subtle border-dashed">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center px-2 py-1 bg-accent-gold/10 border border-accent-gold/30 rounded text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
            stub
          </div>
          <p className="text-text-muted text-xs max-w-[260px]">
            SLA breach table requires the sla_metrics entity with uptime, MTTR, response,
            quality, release, and support measurements per programme.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border-subtle flex justify-between text-[10px] text-text-subtle">
        <span>Total penalty exposure QTD</span>
        <span className="text-text-muted font-mono">n/a pending sla_metrics</span>
      </div>
    </div>
  );
}
