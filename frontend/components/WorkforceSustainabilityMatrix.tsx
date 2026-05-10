/**
 * Team Sustainability Matrix panel -- stub.
 *
 * Requires team_sustainability_signals entity (not yet seeded).
 * Displays the wireframe table structure with 10 programme rows (stub data).
 * TODO: replace when GET /api/v1/workforce/sustainability lands.
 */

const PROGRAMMES = [
  "Pegasus", "Phoenix", "Orion", "Stellar", "Helix",
  "Atlas", "Draco", "Lyra", "Vega", "Andromeda",
] as const;

export function WorkforceSustainabilityMatrix(): JSX.Element {
  return (
    <div
      className="col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-stub="true"
      data-testid="workforce-sustainability-matrix"
    >
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-text-primary font-semibold">Team Sustainability Matrix</h3>
        <div className="flex items-center gap-2">
          <span className="text-text-subtle text-xs">10 programmes</span>
          <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
            stub
          </span>
        </div>
      </div>
      <p className="text-text-muted text-xs mb-3">
        Bus factor, overtime, 1-on-1 cadence, psych safety per programme.
        {/* TODO: replace when team_sustainability_signals entity lands */}
      </p>

      <table className="w-full text-xs">
        <thead className="text-text-muted text-[10px] uppercase tracking-wider">
          <tr className="border-b border-border-subtle">
            <th className="text-left py-2">Programme</th>
            <th className="text-right py-2">Bus Factor</th>
            <th className="text-right py-2">Overtime h/p</th>
            <th className="text-right py-2">1-on-1 cadence</th>
            <th className="text-right py-2">Psych safety</th>
            <th className="text-center py-2">State</th>
          </tr>
        </thead>
        <tbody className="text-text-secondary">
          {PROGRAMMES.map((prog) => (
            <tr
              key={prog}
              className="border-b border-border-subtle/50"
              data-programme={prog}
            >
              <td className="py-2 text-text-primary font-medium">{prog}</td>
              <td className="text-right text-text-subtle font-mono tabular-nums py-2">--</td>
              <td className="text-right text-text-subtle font-mono tabular-nums py-2">--</td>
              <td className="text-right text-text-subtle font-mono tabular-nums py-2">--d</td>
              <td className="text-right text-text-subtle font-mono tabular-nums py-2">--</td>
              <td className="text-center py-2">
                <span className="px-2 py-0.5 bg-border-subtle text-text-subtle rounded text-[10px] font-semibold">
                  --
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
