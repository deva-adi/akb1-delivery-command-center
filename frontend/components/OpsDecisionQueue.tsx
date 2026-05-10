/**
 * Decision Queue table and Decision Velocity chart stubs.
 * TODO: wire to GET /api/v1/decisions/queue and
 *       GET /api/v1/decisions/velocity-trend?weeks=12 when decisions entity lands.
 * Requires decisions with opened_at, sla_target_days, status, owner, programme.
 */
export function OpsDecisionQueue() {
  return (
    <div className="grid grid-cols-3 gap-6" data-testid="ops-decision-queue">

      <div
        className="col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-text-primary font-semibold">Decision Queue</h3>
          <span className="text-text-subtle text-xs">
            n/a open, n/a past SLA (decisions not yet seeded)
          </span>
        </div>
        <p className="text-text-muted text-xs mb-3">
          Amber equals steering. Red means we failed to decide in amber.
        </p>

        <div className="flex items-center justify-center py-10 bg-bg-surface-subtle rounded border border-border-subtle border-dashed">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center px-2 py-1 bg-accent-gold/10 border border-accent-gold/30 rounded text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
              stub
            </div>
            <p className="text-text-muted text-xs max-w-[280px]">
              Decision Queue requires the decisions entity with decision text, programme,
              age, SLA target, status, and owner fields.
            </p>
          </div>
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-text-primary font-semibold">Decision Velocity</h3>
          <span className="text-text-subtle text-xs">12-week rolling avg</span>
        </div>
        <p className="text-text-muted text-xs mb-3">
          Amber band 2 to 7 days. Red above 7. Target line at 2 days.
        </p>

        <div className="flex items-center justify-center h-40 bg-bg-surface-subtle rounded border border-border-subtle border-dashed">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center px-2 py-1 bg-accent-gold/10 border border-accent-gold/30 rounded text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
              stub
            </div>
            <p className="text-text-muted text-xs max-w-[160px]">
              Requires decisions velocity-trend endpoint.
            </p>
          </div>
        </div>

        <p className="text-text-subtle text-xs mt-3">
          Current avg: n/a.
          {/* TODO: replace with actuals when decisions entity lands */}
        </p>
      </div>

    </div>
  );
}
