/**
 * Attrition Watchlist panel -- stub.
 *
 * Requires flight risk scores (not in people table; would need a separate
 * flight_risk_signals entity). Person names are redacted in the wireframe
 * for privacy; stub rows use role + band identifiers only.
 * TODO: replace when GET /api/v1/workforce/watchlist lands.
 */

export function WorkforceAttritionWatchlist(): JSX.Element {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5 relative"
      data-stub="true"
      data-testid="workforce-attrition-watchlist"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Attrition Watchlist</h3>
        <div className="flex items-center gap-2">
          <span className="text-text-subtle text-xs">Flight risk above 70</span>
          <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
            stub
          </span>
        </div>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Signals: 1-on-1 sentiment, market rate gap, scope match. Names redacted.
        {/* TODO: replace when flight_risk_signals entity lands */}
      </p>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted text-[10px] uppercase tracking-wider border-b border-border-subtle">
            <th className="text-left pb-3 font-medium">Role</th>
            <th className="text-left pb-3 font-medium">Band</th>
            <th className="text-left pb-3 font-medium">Programme</th>
            <th className="text-right pb-3 font-medium">Tenure</th>
            <th className="text-right pb-3 font-medium">Flight Risk</th>
            <th className="text-right pb-3 font-medium">Replacement Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {[1, 2, 3, 4, 5].map((n) => (
            <tr key={n} className="text-text-secondary">
              <td className="py-3 text-text-primary">Redacted ({String.fromCharCode(64 + n)})</td>
              <td className="py-3">--</td>
              <td className="py-3">--</td>
              <td className="py-3 text-right font-mono tabular-nums">-- yrs</td>
              <td className="py-3 text-right">
                <span className="px-2 py-0.5 bg-border-subtle text-text-subtle rounded text-[10px] font-semibold">
                  --
                </span>
              </td>
              <td className="py-3 text-right font-mono tabular-nums">--</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
