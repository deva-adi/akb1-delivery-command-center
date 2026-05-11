/**
 * Definition of Ready compliance bars per programme -- stub.
 * 10 ranked horizontal bars from wireframe, sorted highest to lowest DoR %.
 * Target 85% shown as a dashed reference line.
 * TODO: replace with actuals when backlog_items dor-compliance endpoint lands.
 */

const DOR_ROWS = [
  { label: "Helix Retail OMS", pct: 91 },
  { label: "Nova Telecom BSS", pct: 87 },
  { label: "Quantum Mfg", pct: 84 },
  { label: "Atlas Banking", pct: 78 },
  { label: "Vega Energy", pct: 72 },
  { label: "Orion Insurance", pct: 68 },
  { label: "Lyra Airlines", pct: 64 },
  { label: "Stellar Logistics", pct: 54 },
  { label: "Phoenix Pharma", pct: 49 },
  { label: "Pegasus Healthcare", pct: 41 },
] as const;

const TARGET = 85;

function barColour(pct: number): string {
  if (pct >= TARGET) return "bg-status-green";
  if (pct >= 60) return "bg-status-amber";
  return "bg-status-red";
}

function labelColour(pct: number): string {
  if (pct >= TARGET) return "text-status-green";
  if (pct >= 60) return "text-status-amber";
  return "text-status-red";
}

export function BacklogDoRBars() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="backlog-dor-bars"
      data-stub="true"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary text-sm font-semibold">
          Definition of Ready Compliance
        </h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium">
          stub
        </span>
      </div>

      <div className="space-y-2 relative">
        {/* Target line overlay at 85% */}
        <div
          className="absolute top-0 bottom-0 border-l border-dashed border-accent-gold/60 pointer-events-none"
          style={{ left: `${TARGET}%` }}
          aria-hidden="true"
        />

        {DOR_ROWS.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-text-secondary">{row.label}</span>
              <span className={`font-mono font-semibold ${labelColour(row.pct)}`}>
                {row.pct}%
              </span>
            </div>
            <div className="w-full h-3 bg-bg-surface-subtle rounded overflow-hidden">
              <div
                className={`h-3 ${barColour(row.pct)} rounded`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-text-muted">
        <span className="inline-block w-4 h-px border-t border-dashed border-accent-gold/80" />
        <span>Target {TARGET}%</span>
      </div>
      <p className="mt-1 text-text-muted text-[11px]">
        {/* TODO: replace with actuals when backlog_items dor-compliance endpoint lands */}
        Stub values from wireframe. Live DoR requires backlog_items entity.
      </p>
    </div>
  );
}
