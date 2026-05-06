import type { OnTimeRow } from "@/lib/delivery-health";

interface Props {
  rows: OnTimeRow[];
}

function barColor(pct: number): string {
  if (pct >= 92) return "bg-status-green";
  if (pct >= 80) return "bg-status-amber";
  return "bg-status-red";
}

function labelColor(pct: number): string {
  if (pct >= 92) return "text-status-green";
  if (pct >= 80) return "text-status-amber";
  return "text-status-red";
}

export function DeliveryHealthOnTimeChart({ rows }: Props) {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="delivery-health-on-time-chart"
    >
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-text-primary font-semibold">On-Time by Programme</h3>
        <span className="text-text-subtle text-xs">QTD</span>
      </div>
      <p className="text-text-muted text-xs mb-4">
        Milestone adherence ranked. Target 92%.
      </p>

      {rows.length === 0 ? (
        <div className="flex items-center justify-center h-40 text-text-subtle text-sm">
          No data available.
        </div>
      ) : (
        <div className="space-y-2" data-testid="on-time-rows">
          {rows.map((row) => (
            <div key={row.programmeCode} data-testid={`on-time-row-${row.programmeCode}`}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-text-primary">{row.programmeCode}</span>
                <span
                  className={`font-mono tabular font-semibold ${labelColor(row.onTimePct)}`}
                >
                  {row.onTimePct.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-border-subtle rounded-full">
                <div
                  className={`h-1.5 rounded-full transition-all ${barColor(row.onTimePct)}`}
                  style={{ width: `${Math.min(row.onTimePct, 100)}%` }}
                  data-testid={`on-time-bar-${row.programmeCode}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
