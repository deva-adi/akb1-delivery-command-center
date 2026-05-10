/**
 * Six KPI cards for the Financials tab.
 * All six are stubs pending the financials_monthly entity.
 * Values sourced from wireframe v1_05 as placeholder display.
 * TODO: replace all with actuals when financials_monthly entity lands.
 */
export function FinancialsKPIGrid() {
  return (
    <div data-testid="financials-kpi-grid" className="space-y-4">

      <div className="grid grid-cols-5 gap-4">

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Revenue Booked MTD
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">stub</span>
          </div>
          <div className="text-text-primary text-4xl font-semibold font-mono tabular">
            $31.2<span className="text-xl text-text-muted">M</span>
          </div>
          <div className="mt-2 text-xs text-status-green font-medium">vs plan $30.8M</div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Bill Ratio
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">stub</span>
          </div>
          <div className="text-status-amber text-4xl font-semibold font-mono tabular">
            95<span className="text-xl text-text-muted">%</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">target 97%</div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            DSO
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">stub</span>
          </div>
          <div className="text-status-amber text-4xl font-semibold font-mono tabular">
            47<span className="text-xl text-text-muted"> d</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">alert above 45</div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Unbilled WIP
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">stub</span>
          </div>
          <div className="text-status-red text-4xl font-semibold font-mono tabular">
            $2.8<span className="text-xl text-text-muted">M</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">alert above $2M</div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Gross Margin
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">stub</span>
          </div>
          <div className="text-status-red text-4xl font-semibold font-mono tabular">
            19.2<span className="text-xl text-text-muted">%</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">target 21%</div>
        </div>

      </div>

      <div className="grid grid-cols-1 max-w-xs">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-5" data-stub="true">
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
            Bench Tax MTD
            <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">stub</span>
          </div>
          <div className="text-status-amber text-4xl font-semibold font-mono tabular">
            $480<span className="text-xl text-text-muted">K</span>
          </div>
          <div className="mt-2 text-xs text-text-subtle">
            alert above $500K
            {/* TODO: replace with actuals when financials_monthly.bench_tax_allocated_usd lands */}
          </div>
        </div>
      </div>

    </div>
  );
}
