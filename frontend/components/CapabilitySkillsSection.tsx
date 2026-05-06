/**
 * Skills Heat Map and Bench-to-Demand Match panels -- both stub.
 *
 * Both require skill_demand_signals and bench_to_demand_match entities
 * (not yet seeded). Rendered as col-span-4 stubs matching the wireframe
 * grid layout.
 * TODO: Skills Heat Map -- GET /api/v1/capability/skills-heat-map
 * TODO: Bench-to-Demand Match -- GET /api/v1/capability/bench-to-demand-match
 */

export function CapabilitySkillsSection(): JSX.Element {
  return (
    <div className="col-span-8 grid grid-cols-2 gap-6">
      <div
        className="bg-bg-surface border border-border-subtle rounded-md p-5"
        data-stub="true"
        data-testid="capability-skills-heatmap"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text-primary text-base font-semibold">Skills Heat Map</h2>
          <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
            stub
          </span>
        </div>
        <p className="text-text-muted text-xs mb-4">Rows: skill. Columns: band. Cell: gap headcount.</p>
        <div className="text-text-subtle text-xs text-center py-8">
          {/* TODO: skills grid from skill_demand_signals x bands */}
          Skills grid: awaiting GET /api/v1/capability/skills-heat-map
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-md p-5"
        data-stub="true"
        data-testid="capability-bench-demand-match"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text-primary text-base font-semibold">Bench to Demand Match</h2>
          <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
            stub
          </span>
        </div>
        <p className="text-text-muted text-xs mb-4">Kanban: Suggested, Reviewed, Confirmed.</p>
        <div className="text-text-subtle text-xs text-center py-8">
          {/* TODO: kanban cards from bench_to_demand_match */}
          Match kanban: awaiting GET /api/v1/capability/bench-to-demand-match
        </div>
      </div>
    </div>
  );
}
