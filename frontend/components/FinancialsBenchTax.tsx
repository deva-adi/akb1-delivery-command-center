/**
 * Bench Tax Allocation table stub (PRD 08 revision 3 new section).
 * Wireframe values shown as static placeholders.
 * TODO: replace with real data when financials_monthly.bench_tax_allocated_usd
 * and people.bench_state / people.bench_since_date fields land.
 */
export function FinancialsBenchTax() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="financials-bench-tax"
    >
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-text-primary font-semibold">Bench Tax Allocation</h3>
        <span className="text-text-subtle text-xs">
          n/a total MTD | bench_tax_allocated_usd not yet seeded
        </span>
      </div>
      <p className="text-text-muted text-xs mb-3">
        Bench is a cost centre with named owners and decisions. Rebadge or release window on
        each line.
      </p>

      <table className="w-full text-xs">
        <thead className="text-text-muted text-[10px] uppercase tracking-wider">
          <tr className="border-b border-border-subtle">
            <th className="text-left py-2">Programme</th>
            <th className="text-right py-2">Bench Tax MTD</th>
            <th className="text-right py-2">Bench days</th>
            <th className="text-left py-2">People on bench</th>
            <th className="text-left py-2">Source roll-off</th>
            <th className="text-left py-2">Decision</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          <tr className="border-b border-border-subtle/50">
            <td className="py-2 text-text-primary font-medium">PEGASUS</td>
            <td className="text-right text-text-subtle font-mono tabular">n/a (stub)</td>
            <td className="text-right font-mono tabular text-text-subtle">n/a</td>
            <td className="py-2 text-text-muted">n/a pending bench_state</td>
            <td className="py-2 text-text-muted">n/a</td>
            <td className="py-2 text-text-muted">n/a</td>
          </tr>
          <tr className="border-b border-border-subtle/50">
            <td className="py-2 text-text-primary font-medium">PHOENIX</td>
            <td className="text-right text-text-subtle font-mono tabular">n/a (stub)</td>
            <td className="text-right font-mono tabular text-text-subtle">n/a</td>
            <td className="py-2 text-text-muted">n/a pending bench_state</td>
            <td className="py-2 text-text-muted">n/a</td>
            <td className="py-2 text-text-muted">n/a</td>
          </tr>
          <tr>
            <td className="py-2 text-text-muted" colSpan={2}>
              8 more programmes (n/a)
            </td>
            <td className="text-right font-mono tabular text-text-subtle">n/a</td>
            <td className="py-2 text-text-muted" colSpan={3}>
              Mixed actions, drill for detail
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-border-strong">
            <td className="pt-3 text-text-primary font-semibold">Portfolio total MTD</td>
            <td className="pt-3 text-right text-text-muted font-mono tabular">n/a</td>
            <td className="pt-3 text-right font-mono tabular text-text-muted">n/a</td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
