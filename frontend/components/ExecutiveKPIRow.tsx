import type { ExecutiveKPIs } from "@/lib/executive";

interface Props {
  kpis: ExecutiveKPIs;
}

interface CardProps {
  label: string;
  value: string;
  meta: string;
  trend?: "up-bad" | "down-bad" | "up-good" | "neutral";
  alert?: boolean;
  stub?: boolean;
}

function KpiCard({ label, value, meta, trend, alert = false, stub = false }: CardProps) {
  const valueColor = alert ? "text-status-red" : "text-text-primary";
  const trendColor =
    trend === "up-bad" || trend === "down-bad"
      ? alert
        ? "text-status-red"
        : "text-status-amber"
      : trend === "up-good"
      ? "text-status-green"
      : "text-text-muted";
  const arrow =
    trend === "up-bad" || trend === "up-good"
      ? "▲"
      : trend === "down-bad"
      ? "▼"
      : "";

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-5 hover:border-border-strong transition relative">
      {stub && (
        <div className="absolute top-2 right-2 px-1 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">
          stub
        </div>
      )}
      <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
        {label}
      </div>
      <div className={`text-3xl font-semibold font-mono tabular ${valueColor}`}>
        {value}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs">
        {arrow && <span className={`font-medium ${trendColor}`}>{arrow}</span>}
        <span className="text-text-subtle">{meta}</span>
      </div>
    </div>
  );
}

export function ExecutiveKPIRow({ kpis }: Props) {
  return (
    <div
      className="grid grid-cols-7 gap-4"
      data-testid="executive-kpi-row"
    >
      <KpiCard
        label="Gross Margin"
        value={`${kpis.grossMarginPct}%`}
        meta="vs target 21%"
        trend="down-bad"
        alert={kpis.grossMarginPct < 18}
        stub
      />
      <KpiCard
        label="Net Margin"
        value={`${kpis.netMarginPct}%`}
        meta="vs target 15%"
        trend="down-bad"
        stub
      />
      <KpiCard
        label="Utilisation"
        value={`${kpis.utilisationPct}%`}
        meta="vs target 80%"
        trend="up-good"
        stub
      />
      <KpiCard
        label="On-Time Delivery"
        value={`${kpis.onTimePct}%`}
        meta="vs target 92%"
        trend={kpis.onTimePct < 92 ? "down-bad" : "neutral"}
        alert={kpis.onTimePct < 80}
      />
      <KpiCard
        label="RAID Severity Index"
        value={`${kpis.raidSeverityIndex.toFixed(1)}/10`}
        meta="alert >= 7.0"
        trend="up-bad"
        alert={kpis.raidSeverityIndex >= 7.0}
      />
      <KpiCard
        label="Decision Latency"
        value={`${kpis.decisionLatencyDays}d`}
        meta="target below 2d"
        trend="up-bad"
        alert={kpis.decisionLatencyDays > 7}
        stub
      />
      <KpiCard
        label="Value Realisation"
        value={`${kpis.valueRealisationPct}%`}
        meta="target 70%"
        trend="down-bad"
        stub
      />
    </div>
  );
}
