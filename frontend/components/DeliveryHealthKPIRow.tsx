import type { DeliveryHealthKPIs } from "@/lib/delivery-health";

interface Props {
  kpis: DeliveryHealthKPIs;
}

interface CardProps {
  label: string;
  value: string;
  meta: string;
  alert?: boolean;
  trend?: "up" | "down" | "neutral";
}

function KpiCard({ label, value, meta, alert = false, trend }: CardProps) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-5 hover:border-border-strong transition">
      <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
        {label}
      </div>
      <div
        className={`text-4xl font-semibold font-mono tabular ${
          alert ? "text-status-red" : "text-text-primary"
        }`}
      >
        {value}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs">
        {trend === "down" && (
          <span className={alert ? "text-status-red font-medium" : "text-status-amber font-medium"}>
            &#9660;
          </span>
        )}
        {trend === "up" && (
          <span className="text-status-amber font-medium">&#9650;</span>
        )}
        <span className="text-text-subtle">{meta}</span>
      </div>
    </div>
  );
}

export function DeliveryHealthKPIRow({ kpis }: Props) {
  return (
    <div
      className="grid grid-cols-5 gap-4"
      data-testid="delivery-health-kpi-row"
    >
      <KpiCard
        label="On-Time Delivery"
        value={`${kpis.onTimePct}%`}
        meta="vs target 92%"
        alert={kpis.onTimePct < 80}
        trend={kpis.onTimePct < 92 ? "down" : "neutral"}
      />
      <KpiCard
        label="Sprint Velocity"
        value={`${kpis.sprintVelocityPts}`}
        meta="milestones complete"
        trend="neutral"
      />
      <KpiCard
        label="Milestone Adherence"
        value={`${kpis.milestoneAdherencePct}%`}
        meta="vs target 90%"
        alert={kpis.milestoneAdherencePct < 80}
        trend={kpis.milestoneAdherencePct < 90 ? "down" : "neutral"}
      />
      <KpiCard
        label="Open Blockers"
        value={String(kpis.openBlockers)}
        meta="At Risk + Delayed"
        alert={kpis.openBlockers > 10}
        trend={kpis.openBlockers > 10 ? "up" : "neutral"}
      />
      <KpiCard
        label="CSAT"
        value={`${kpis.csat.toFixed(1)}`}
        meta="/ 5 target"
        trend="down"
      />
    </div>
  );
}
