/**
 * Attrition Radar chart panel -- stub.
 *
 * Requires attrition events entity (not yet seeded). Renders the wireframe
 * SVG chart shell with axis labels and legend; all data points are stub.
 * TODO: replace when GET /api/v1/workforce/attrition-trend lands.
 */

export function WorkforceAttritionRadar(): JSX.Element {
  return (
    <div
      className="col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-5 relative"
      data-stub="true"
      data-testid="workforce-attrition-radar"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">Attrition Radar</h3>
        <div className="flex items-center gap-2">
          <span className="text-text-subtle text-xs">12-month rolling</span>
          <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
            stub
          </span>
        </div>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Annualised attrition by month. Regretted vs non-regretted. Alert threshold 15%.
        {/* TODO: replace when attrition events entity lands */}
      </p>

      <svg
        className="w-full h-52"
        viewBox="0 0 800 220"
        preserveAspectRatio="none"
        aria-label="Attrition radar chart (stub)"
      >
        {/* Grid lines */}
        <line x1="40" y1="40" x2="790" y2="40" stroke="#3A4454" />
        <line x1="40" y1="90" x2="790" y2="90" stroke="#3A4454" />
        <line x1="40" y1="140" x2="790" y2="140" stroke="#3A4454" />
        <line x1="40" y1="190" x2="790" y2="190" stroke="#4A5568" />
        {/* Y axis labels */}
        <text x="10" y="45" fill="#718096" fontSize="11" fontFamily="JetBrains Mono">20%</text>
        <text x="10" y="95" fill="#718096" fontSize="11" fontFamily="JetBrains Mono">15%</text>
        <text x="10" y="145" fill="#718096" fontSize="11" fontFamily="JetBrains Mono">10%</text>
        <text x="10" y="195" fill="#718096" fontSize="11" fontFamily="JetBrains Mono">5%</text>
        {/* Alert band */}
        <rect x="40" y="85" width="750" height="12" fill="#EF4444" fillOpacity="0.08" />
        <line x1="40" y1="92" x2="790" y2="92" stroke="#EF4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
        <text x="728" y="82" fill="#EF4444" fontSize="10" fontWeight="500">15% alert</text>
        {/* Stub: placeholder lines */}
        <text x="400" y="130" fill="#718096" fontSize="12" textAnchor="middle">
          awaiting attrition entity
        </text>
        {/* X axis labels */}
        <text x="60" y="210" fill="#718096" fontSize="10" textAnchor="middle">Month 1</text>
        <text x="775" y="210" fill="#F1F5F9" fontSize="10" textAnchor="middle" fontWeight="600">Current</text>
      </svg>

      <div className="flex gap-4 text-[11px] mt-3">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-status-red inline-block" />
          <span className="text-text-secondary">Regretted</span>
          <span className="text-text-subtle font-mono tabular-nums">--%</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-status-amber inline-block" />
          <span className="text-text-secondary">Non-regretted</span>
          <span className="text-text-subtle font-mono tabular-nums">--%</span>
        </span>
      </div>
    </div>
  );
}
