/**
 * Utilization Reconciliation panel -- stub (Rev 4 section, UC-CC).
 *
 * Requires utilization_reconciliation entity (not yet seeded). Displays the
 * three per-programme gap cards and reconciliation table shell from the R4
 * wireframe section.
 * TODO: replace when GET /api/v1/workforce/utilization-reconciliation lands.
 */

const PROGRAMMES = ["Pegasus", "Phoenix", "Orion"] as const;

export function WorkforceUtilizationReconciliation(): JSX.Element {
  return (
    <section
      className="border-t-2 border-accent-gold bg-bg-surface-subtle mt-8"
      data-stub="true"
      data-testid="workforce-utilization-reconciliation"
    >
      <div className="max-w-[1440px] mx-auto px-8 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="px-2 py-1 bg-accent-gold text-bg-base rounded text-[10px] font-bold tracking-wider">
            REVISION 4
          </div>
          <h2 className="text-text-primary text-lg font-semibold">
            Utilization Reconciliation (UC-CC)
          </h2>
          <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
            stub
          </span>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-md p-3 mb-5 flex items-center gap-3">
          <div className="text-accent-gold text-xs font-semibold">Strategic depth:</div>
          <div className="text-text-primary text-xs">
            For bench roster, DM succession, and hiring funnel, see Capability and Supply Chain.
          </div>
        </div>

        <h3 className="text-accent-gold text-sm font-semibold tracking-tight mb-3">
          Utilization Max Gap per Programme
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {PROGRAMMES.map((prog) => (
            <div
              key={prog}
              className="bg-bg-surface border border-border-subtle rounded-md p-4"
              data-programme={prog}
            >
              <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
                Max Gap ({prog})
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-text-primary text-2xl font-semibold tabular-nums">--</span>
                <span className="text-text-muted text-xs">points</span>
              </div>
              {/* TODO: replace when utilization_reconciliation entity lands */}
              <div className="mt-1 text-text-subtle text-[11px]">stub</div>
            </div>
          ))}
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-text-muted border-b border-border-subtle">
                <th className="text-left p-2">Programme</th>
                <th className="text-right p-2">HR System</th>
                <th className="text-right p-2">Finance System</th>
                <th className="text-right p-2">Delivery System</th>
                <th className="text-right p-2">Reconciled</th>
                <th className="text-right p-2">Method</th>
              </tr>
            </thead>
            <tbody>
              {PROGRAMMES.map((prog) => (
                <tr key={prog} className="border-b border-border-subtle">
                  <td className="p-2 text-text-primary">{prog}</td>
                  {[0, 1, 2, 3].map((i) => (
                    <td key={i} className="p-2 text-right font-mono text-text-subtle">--</td>
                  ))}
                  <td className="p-2 text-right text-[10px] text-text-subtle">--</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
