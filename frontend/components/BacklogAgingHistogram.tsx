/**
 * Backlog aging histogram -- stub.
 * Four age buckets from wireframe with proportional horizontal bars.
 * TODO: replace with actuals when backlog_items aging-histogram endpoint lands.
 */

const BUCKETS = [
  { label: "0-30 days", tag: "Fresh", items: 986, pct: 53, colour: "bg-status-green" },
  { label: "30-60 days", tag: "Active", items: 549, pct: 30, colour: "bg-status-green" },
  { label: "60-90 days", tag: "Aging", items: 188, pct: 10, colour: "bg-status-amber" },
  { label: "Over 90 days", tag: "Stale", items: 124, pct: 7, colour: "bg-status-red" },
] as const;

export function BacklogAgingHistogram() {
  return (
    <div
      className="bg-bg-surface border border-border-subtle rounded-lg p-5"
      data-testid="backlog-aging-histogram"
      data-stub="true"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-text-primary text-sm font-semibold">Backlog Age Distribution</h3>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium">
          stub
        </span>
      </div>

      <div className="space-y-3">
        {BUCKETS.map((b) => (
          <div key={b.label}>
            <div className="flex items-center justify-between mb-1 text-xs">
              <span className="text-text-primary font-medium">
                {b.label}
                <span className="ml-2 text-text-muted font-normal">{b.tag}</span>
              </span>
              <span className="font-mono text-text-secondary">
                {b.items.toLocaleString()} ({b.pct}%)
              </span>
            </div>
            <div className="w-full h-4 bg-bg-surface-subtle rounded overflow-hidden">
              <div
                className={`h-4 ${b.colour} rounded`}
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-text-muted text-[11px]">
        Total over 60 days: 312 items (17 percent of backlog)
      </p>
      <p className="mt-1 text-text-muted text-[11px]">
        {/* TODO: replace with actuals when backlog_items entity lands */}
        Stub values from wireframe. Live aging requires backlog_items entity.
      </p>
    </div>
  );
}
