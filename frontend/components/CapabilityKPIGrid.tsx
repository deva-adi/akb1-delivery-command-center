/**
 * Capability and Supply Chain KPI row.
 *
 * 8 KPI cards per PRD 24 section 5. All stub pending bench_roster,
 * skill_demand_signals, dm_succession_signals, and hiring_funnel entities.
 */

const STUB_KPIS = [
  { label: "Bench Headcount", unit: "people", metric: "bench_headcount" },
  { label: "Bench Aging Max", unit: "days", metric: "bench_aging_max_days" },
  { label: "Cumulative Bench Cost", unit: "M USD", metric: "cumulative_bench_cost_usd" },
  { label: "Programme-Critical Skill Gaps", unit: "gaps", metric: "programme_critical_skill_gaps" },
  { label: "DM Succession Coverage", unit: "percent", metric: "dm_succession_coverage_pct" },
  { label: "DM Flight Risk above 70", unit: "DMs", metric: "dm_flight_risk_count" },
  { label: "Time to Fill (sr engineering)", unit: "days", metric: "time_to_fill_sr_days" },
  { label: "Stalled Requisitions", unit: "of total", metric: "stalled_requisitions_count" },
] as const;

export function CapabilityKPIGrid(): JSX.Element {
  return (
    <section
      className="grid grid-cols-4 gap-3 mb-8"
      data-testid="capability-kpi-grid"
    >
      {STUB_KPIS.map((kpi) => (
        <div
          key={kpi.metric}
          className="bg-bg-surface border border-border-subtle rounded-md p-4"
          data-metric={kpi.metric}
          data-stub="true"
        >
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
            {kpi.label}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-text-primary text-2xl font-semibold tabular-nums">
              {"--"}
            </span>
            <span className="text-text-muted text-xs">{kpi.unit}</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="px-1 py-0 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
              stub
            </span>
            {/* TODO: replace when bench_roster / skill_demand_signals / dm_succession_signals / hiring_funnel land */}
            <span className="text-text-subtle text-[11px]">awaiting entity</span>
          </div>
        </div>
      ))}
    </section>
  );
}
