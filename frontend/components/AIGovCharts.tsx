/**
 * Three stub chart components for the AI Governance tab.
 * Exported as named exports from a single file per brief spec.
 *
 * ShadowInventoryChart: quarterly shadow tool discovery trend (decreasing).
 * FiveUnsolvableChart:  radar stub for the 5 unsolvable problems.
 * DeliverySpeedGapChart: dual-line chart stub showing productivity vs speed gap.
 *
 * All data-stub="true". TODO per component below.
 */

// ---------------------------------------------------------------------------
// ShadowInventoryChart
// ---------------------------------------------------------------------------

const SHADOW_QUARTERS = [
  { label: "Q1", value: 12 },
  { label: "Q2", value: 8 },
  { label: "Q3", value: 5 },
  { label: "Q4", value: 2 },
] as const;

const SHADOW_MAX = 12;

export function ShadowInventoryChart() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="ai-gov-shadow-inventory-chart"
      data-stub="true"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary text-sm font-semibold">
          Shadow Tool Inventory (Quarterly)
        </h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium">
          stub
        </span>
      </div>

      <div className="flex items-end gap-4 h-28 px-2">
        {SHADOW_QUARTERS.map((q) => {
          const heightPct = Math.round((q.value / SHADOW_MAX) * 100);
          return (
            <div key={q.label} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-text-secondary text-xs font-mono">{q.value}</span>
              <div
                className="w-full bg-status-amber/60 rounded-t"
                style={{ height: `${heightPct}%`, minHeight: "4px" }}
              />
              <span className="text-text-muted text-[11px]">{q.label}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-text-muted text-xs">
        Trend decreasing as governance matures.
      </p>
      <p className="mt-1 text-text-muted text-[11px]">
        {/* TODO: replace with actuals when ai_shadow_survey entity lands */}
        Stub values from wireframe. Live trend requires ai_shadow_survey entity.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FiveUnsolvableChart
// ---------------------------------------------------------------------------

const FIVE_AXES = [
  { label: "Estimation",    count: 8 },
  { label: "Scope",         count: 4 },
  { label: "Communications", count: 6 },
  { label: "TechDebt",      count: 9 },
  { label: "TeamStructure", count: 5 },
] as const;

export function FiveUnsolvableChart() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="ai-gov-five-unsolvable-chart"
      data-stub="true"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary text-sm font-semibold">
          5 Unsolvable Problems Distribution
        </h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium">
          stub
        </span>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="space-y-2 w-full">
          {FIVE_AXES.map((axis) => (
            <div key={axis.label} className="flex items-center gap-3">
              <span className="text-text-secondary text-xs w-28 shrink-0">{axis.label}</span>
              <div className="flex-1 h-3 bg-bg-surface-subtle rounded overflow-hidden">
                <div
                  className="h-3 bg-status-amber/50 rounded"
                  style={{ width: `${Math.round((axis.count / 9) * 100)}%` }}
                />
              </div>
              <span className="text-text-muted font-mono text-xs w-4 text-right">
                {axis.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-text-secondary text-xs leading-snug">
        Per S02P1: if you are expecting AI to solve these, you are pointing the tool at
        the wrong problem.
      </p>
      <p className="mt-1 text-text-muted text-[11px]">
        {/* TODO: replace with actuals when ai_five_unsolvable entity lands */}
        Stub values from wireframe. Live distribution requires ai_five_unsolvable entity.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeliverySpeedGapChart
// ---------------------------------------------------------------------------

export function DeliverySpeedGapChart() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="ai-gov-delivery-speed-gap-chart"
      data-stub="true"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary text-sm font-semibold">
          Delivery Speed Gap
        </h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium">
          stub
        </span>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-8 h-0.5 bg-status-green" />
          <span className="text-text-secondary">Productivity Uplift</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-8 h-0.5 bg-status-amber" />
          <span className="text-text-secondary">Delivery Speed</span>
        </span>
      </div>

      {/* SVG stub shell */}
      <div className="relative rounded border border-border-subtle bg-bg-surface-subtle" style={{ height: "100px" }}>
        <svg viewBox="0 0 300 100" className="w-full h-full" aria-hidden="true">
          {/* Productivity Uplift line (stub) */}
          <polyline
            points="0,70 75,55 150,40 225,28 300,18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-status-green/60"
          />
          {/* Delivery Speed line (stub) */}
          <polyline
            points="0,70 75,65 150,62 225,60 300,58"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-status-amber/60"
          />
          {/* Gap shading placeholder */}
          <polygon
            points="0,70 75,55 150,40 225,28 300,18 300,58 225,60 150,62 75,65 0,70"
            fill="currentColor"
            className="text-status-red/10"
          />
        </svg>
      </div>

      <div className="mt-3 bg-bg-surface-subtle border border-border-subtle rounded-md px-4 py-3">
        <p className="text-text-secondary text-xs leading-snug">
          Individual productivity up 25 percent. Delivery throughput up 7 percent.
          Gap = 18 points. Primary constraint: governance and handoffs.
          Cross-check 5 unsolvable.
        </p>
      </div>

      <p className="mt-2 text-text-muted text-[11px]">
        {/* TODO: replace with actuals when ai_delivery_speed_gap entity lands */}
        Stub values from wireframe. Live gap analysis requires ai_delivery_speed_gap entity.
      </p>
    </div>
  );
}
