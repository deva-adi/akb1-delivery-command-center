import type { FlowKPIs } from "@/lib/flow-velocity";

interface Props {
  kpis: FlowKPIs;
}

export function FlowKPIGrid({ kpis }: Props) {
  return (
    <div className="grid grid-cols-5 gap-4" data-testid="flow-kpi-grid">

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Throughput
        </div>
        <div className="text-text-primary text-4xl font-semibold font-mono tabular">
          {kpis.throughputProxy}
          <span className="text-xl text-text-muted"> milestones</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          complete (milestone proxy)
        </div>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          WIP Breach
        </div>
        <div
          className={`text-4xl font-semibold font-mono tabular ${
            kpis.wipBreachCount > 0 ? "text-status-red" : "text-status-green"
          }`}
        >
          {kpis.wipBreachCount}
          <span className="text-xl text-text-muted"> / {kpis.visibleProgrammes}</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">programmes over limit</div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Cycle Time
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-text-primary text-4xl font-semibold font-mono tabular">
          {kpis.cycleTimeDaysStub}
          <span className="text-xl text-text-muted"> d</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          target below 7
          {/* TODO: replace with actuals when sprint_velocity_log endpoint lands */}
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Flow Efficiency
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-text-primary text-4xl font-semibold font-mono tabular">
          {kpis.flowEfficiencyPctStub}
          <span className="text-xl text-text-muted">%</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          target 55%
          {/* TODO: replace with actuals when flow_metrics endpoint lands */}
        </div>
      </div>

      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-stub="true"
      >
        <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
          Lead Time p85
          <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
            stub
          </span>
        </div>
        <div className="text-text-primary text-4xl font-semibold font-mono tabular">
          {kpis.leadTimeP85DaysStub}
          <span className="text-xl text-text-muted"> d</span>
        </div>
        <div className="mt-2 text-xs text-text-subtle">
          target below 14
          {/* TODO: replace with actuals when sprint_velocity_log endpoint lands */}
        </div>
      </div>

    </div>
  );
}
