/**
 * Workforce Intelligence KPI row.
 *
 * 8 KPI cards in a 4-column 2-row grid per PRD 07 section 5.
 * Headcount is REAL (from people.length). All other cards are stub pending
 * allocations, team_sustainability_signals, and attrition entities.
 */

interface Props {
  headcount: number;
}

const STUB_KPIS = [
  { label: "Utilisation", unit: "%", metric: "utilisation_pct" },
  { label: "Bench", unit: "(%)", metric: "bench_pct" },
  { label: "Attrition (ann.)", unit: "%", metric: "attrition_annualised_pct" },
  { label: "Pyramid Integrity", unit: "/10", metric: "pyramid_integrity_score" },
  { label: "Bus Factor (min)", unit: "", metric: "bus_factor_min" },
  { label: "Overtime Hours MTD", unit: "h/p", metric: "overtime_hours_mtd_avg" },
  { label: "Team Health Index", unit: "/10", metric: "team_health_index" },
] as const;

export function WorkforceKPIGrid({ headcount }: Props): JSX.Element {
  return (
    <section
      className="grid grid-cols-4 gap-4 mb-6"
      data-testid="workforce-kpi-grid"
    >
      {/* Headcount: REAL */}
      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-metric="headcount"
        data-testid="kpi-headcount"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Headcount
        </div>
        <div className="text-text-primary text-4xl font-semibold font-mono tabular-nums">
          {headcount}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className="text-text-subtle">Active delivery organisation</span>
        </div>
      </div>

      {/* 7 stub KPIs */}
      {STUB_KPIS.map((kpi) => (
        <div
          key={kpi.metric}
          className="bg-bg-surface border border-border-subtle rounded-lg p-5"
          data-metric={kpi.metric}
          data-stub="true"
        >
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            {kpi.label}
          </div>
          <div className="text-text-primary text-4xl font-semibold font-mono tabular-nums">
            {"--"}
            {kpi.unit && (
              <span className="text-xl text-text-muted">{kpi.unit}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <span className="px-1 py-0 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
              stub
            </span>
            {/* TODO: replace when allocations / team_sustainability_signals / attrition entities land */}
          </div>
        </div>
      ))}
    </section>
  );
}
