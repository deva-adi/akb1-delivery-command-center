/**
 * Revenue Stack 12-month line chart stub (Booked, Billed, Collected).
 * TODO: replace with real data when financials_monthly entity lands.
 * Requires revenue_booked_usd, revenue_billed_usd, revenue_collected_usd
 * grouped by month over 12 months.
 */
export function FinancialsRevenueStack() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="financials-revenue-stack"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Revenue Stack</h3>
        <span className="text-text-subtle text-xs">Booked, Billed, Collected over 12 months</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Widening gap between booked and collected is the DSO story.
      </p>

      <div className="flex items-center justify-center h-52 bg-bg-surface-subtle rounded border border-border-subtle border-dashed">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center px-2 py-1 bg-accent-gold/10 border border-accent-gold/30 rounded text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
            stub
          </div>
          <p className="text-text-muted text-xs max-w-[240px]">
            Revenue stack requires financials_monthly with revenue_booked_usd,
            revenue_billed_usd, revenue_collected_usd per month per programme.
          </p>
        </div>
      </div>

      <div className="flex gap-5 text-[11px] mt-3">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-accent-gold" />
          <span className="text-text-secondary">Booked</span>
          <span className="text-text-muted font-mono">n/a</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-status-amber" />
          <span className="text-text-secondary">Billed</span>
          <span className="text-text-muted font-mono">n/a</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-status-green" />
          <span className="text-text-secondary">Collected</span>
          <span className="text-text-muted font-mono">n/a</span>
        </span>
      </div>
    </div>
  );
}
