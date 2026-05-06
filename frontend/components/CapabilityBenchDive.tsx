/**
 * Bench Deep Dive panel -- stub.
 *
 * Requires bench_roster entity (not yet seeded). Displays the wireframe
 * structure (aging strip + roster table) as a locked stub.
 * TODO: replace when GET /api/v1/capability/bench-roster lands.
 */

export function CapabilityBenchDive(): JSX.Element {
  return (
    <section
      className="bg-bg-surface border border-border-subtle rounded-md p-5 mb-8"
      data-stub="true"
      data-testid="capability-bench-dive"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-text-primary text-base font-semibold">Bench Deep Dive</h2>
          <p className="text-text-muted text-xs mt-0.5">
            Aging distribution with 21-day and 45-day markers.
          </p>
        </div>
        <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
          stub
        </span>
      </div>

      <div className="mb-4 h-10 bg-bg-surface-elevated border border-border-subtle rounded flex items-center justify-center">
        <span className="text-text-subtle text-xs">
          {/* TODO: aging strip from bench_roster bench_days distribution */}
          Aging strip: awaiting bench_roster entity
        </span>
      </div>

      <div className="text-text-muted text-xs text-center py-6">
        Bench roster table: awaiting GET /api/v1/capability/bench-roster
      </div>
    </section>
  );
}
