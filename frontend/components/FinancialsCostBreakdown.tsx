/**
 * Cost Breakdown horizontal bar chart stub.
 * Static values from wireframe v1_05 as display placeholder.
 * TODO: replace with actuals when financials_monthly cost category fields land.
 */

const COST_ROWS = [
  { label: "Direct labour (India)", pct: 52, widthPct: "52%" },
  { label: "Direct labour (US / EU)", pct: 24, widthPct: "24%" },
  { label: "Vendor costs", pct: 10, widthPct: "10%" },
  { label: "Overheads and indirect", pct: 6, widthPct: "6%" },
  { label: "Infrastructure and tools", pct: 4, widthPct: "4%" },
  { label: "Travel and expenses", pct: 3, widthPct: "3%" },
  { label: "Bench (idle cost)", pct: 1, widthPct: "1%" },
] as const;

export function FinancialsCostBreakdown() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="financials-cost-breakdown"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Cost Breakdown</h3>
        <span className="text-text-subtle text-xs">MTD (stub)</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        7 cost categories including bench.
        {/* TODO: replace with actuals when financials_monthly entity lands */}
      </p>

      <div className="space-y-2 text-sm">
        {COST_ROWS.map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-text-primary">{row.label}</span>
              <span className="text-text-muted font-mono tabular">{row.pct}% (stub)</span>
            </div>
            <div className="h-2 bg-bg-surface-subtle rounded">
              <div className="h-2 bg-border-strong/60 rounded" style={{ width: row.widthPct }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
