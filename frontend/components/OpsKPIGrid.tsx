import type { OpsKPIs } from "@/lib/ops-sla";

interface Props {
  kpis: OpsKPIs;
}

export function OpsKPIGrid({ kpis }: Props) {
  return (
    <div data-testid="ops-kpi-grid" className="space-y-4">

      <div className="grid grid-cols-5 gap-4">

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            SLA Adherence
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
              stub
            </span>
          </div>
          <div className="text-text-primary text-4xl font-semibold font-mono tabular">
            {kpis.slaAdherencePctStub}
            <span className="text-xl text-text-muted">%</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">
            target 95%
            {/* TODO: replace with actuals when sla_metrics entity lands */}
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Active Breaches
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
              stub
            </span>
          </div>
          <div className="text-status-red text-4xl font-semibold font-mono tabular">
            {kpis.activeBreachesStub}
          </div>
          <div className="mt-2 text-xs text-text-subtle">
            alert at 1 or above
            {/* TODO: replace with actuals when sla_metrics entity lands */}
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Penalty Exposure
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
              stub
            </span>
          </div>
          <div className="text-status-red text-4xl font-semibold font-mono tabular">
            ${kpis.penaltyExposureUsdStub}
            <span className="text-xl text-text-muted">K</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">
            QTD at risk
            {/* TODO: replace with actuals when sla_metrics entity lands */}
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            P1 Incidents 30d
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
              stub
            </span>
          </div>
          <div className="text-status-red text-4xl font-semibold font-mono tabular">
            {kpis.p1Incidents30dStub}
          </div>
          <div className="mt-2 text-xs text-text-subtle">
            target below 30
            {/* TODO: replace with actuals when incidents entity lands */}
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            MTTR
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
              stub
            </span>
          </div>
          <div className="text-status-amber text-4xl font-semibold font-mono tabular">
            {kpis.mttrHoursStub}
            <span className="text-xl text-text-muted"> hrs</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">
            target below 4h
            {/* TODO: replace with actuals when incidents entity lands */}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Programmes at SLA Risk
          </div>
          <div
            className={`text-4xl font-semibold font-mono tabular ${
              kpis.atRiskProgrammes > 0 ? "text-status-red" : "text-status-green"
            }`}
          >
            {kpis.atRiskProgrammes}
            <span className="text-xl text-text-muted"> / {kpis.visibleProgrammes}</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">
            Red or Failing health RAG (proxy)
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Visible Programmes
          </div>
          <div className="text-text-primary text-4xl font-semibold font-mono tabular">
            {kpis.visibleProgrammes}
          </div>
          <div className="mt-2 text-xs text-text-subtle">with health data</div>
        </div>

      </div>

    </div>
  );
}
