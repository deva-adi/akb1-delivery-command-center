/**
 * Governance KPI grid -- 10 cards in a 5-column layout.
 *
 * All values are stubs pending the following backend entities:
 * decisions, cadences, raci_activities, pre_read_documents,
 * sponsor_engagement, commitment_deltas.
 * TODO: replace each stub when its respective endpoint lands.
 */

interface KpiCardProps {
  label: string;
  value: string;
  unit: string;
  sub: string;
  color: "red" | "amber" | "green";
}

function KpiCard({ label, value, unit, sub, color }: KpiCardProps) {
  const borderClass =
    color === "red"
      ? "border-status-red/50"
      : color === "amber"
      ? "border-status-amber/50"
      : "border-status-green/50";
  const subClass =
    color === "red"
      ? "text-status-red"
      : color === "amber"
      ? "text-status-amber"
      : "text-status-green";

  return (
    <div className={`bg-bg-surface border ${borderClass} rounded-md p-4 relative`}>
      <div className="absolute top-2 right-2 px-1 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">
        stub
      </div>
      <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-text-primary text-2xl font-semibold tabular">{value}</span>
        <span className="text-text-muted text-xs">{unit}</span>
      </div>
      <div className={`mt-1 text-[11px] ${subClass}`}>{sub}</div>
    </div>
  );
}

export function GovKPIGrid() {
  return (
    <section
      className="grid grid-cols-5 gap-3 mb-8"
      data-testid="gov-kpi-grid"
    >
      <KpiCard label="Decision Latency Wtd" value="7.4" unit="days" sub="Target below 2.0. Amber" color="amber" />
      <KpiCard label="Decisions Open (Pegasus)" value="14" unit="7 past SLA" sub="Target below 5. Red" color="red" />
      <KpiCard label="Cadence Attendance" value="82" unit="percent" sub="Target above 90. Amber" color="amber" />
      <KpiCard label="Cadence Theatre" value="3" unit="cadences" sub="Target 0. Red" color="red" />
      <KpiCard label="RACI Gap" value="12.3" unit="percent" sub="Target below 5. Red" color="red" />

      <KpiCard label="RACI Overlap" value="8.5" unit="percent" sub="Target below 8. Amber" color="amber" />
      <KpiCard label="Contract Staleness (max)" value="210" unit="days" sub="Target below 90. Red" color="red" />
      <KpiCard label="Pre-Read Issuance" value="72" unit="percent" sub="Target above 90. Amber" color="amber" />
      <KpiCard label="Commitment Delta" value="28" unit="percent" sub="Target below 10. Red" color="red" />
      <KpiCard label="Sponsor Engagement (min)" value="38" unit="score" sub="Target above 70. Red" color="red" />
    </section>
  );
}
