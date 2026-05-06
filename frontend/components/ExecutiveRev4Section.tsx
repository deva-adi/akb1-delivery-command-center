/**
 * Executive tab Rev 4 additions panel (UC-C label layer, UC-AA portfolio drift,
 * role-aware subtitle, threshold register binding).
 *
 * All four instruments are stubs pending their respective backend endpoints.
 * TODO: Portfolio Drift Delta -- replace when portfolio_drift endpoint lands.
 * TODO: Forecast Confidence -- replace when portfolio_forecast endpoint lands.
 * TODO: Account Concentration -- replace when account_risk endpoint lands.
 * TODO: Capability Heat Map reference -- links to v1_17 Capability tab when built.
 */

export function ExecutiveRev4Section() {
  return (
    <section
      className="border-t-2 border-accent-gold bg-bg-surface-subtle -mx-8 px-8 py-6 mt-8"
      data-testid="executive-rev4-section"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="px-2 py-1 bg-accent-gold text-bg-base rounded text-[10px] font-bold tracking-wider">
          REVISION 4
        </div>
        <h2 className="text-text-primary text-lg font-semibold">
          Rev 4 additions per PRD 04 rev 4
        </h2>
        <span className="text-text-muted text-xs">
          UC-C label layer, UC-AA portfolio drift, role-aware subtitle, threshold register binding
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4">

        <div
          className="col-span-3 bg-bg-surface border border-status-amber/50 rounded-md p-4"
          data-testid="rev4-portfolio-drift"
        >
          <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
            Portfolio Drift Delta (stub)
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-text-primary text-2xl font-semibold tabular">2.4</span>
            <span className="text-text-muted text-xs">pp (amber)</span>
          </div>
          <div className="mt-1 text-status-amber text-[11px]">
            Every programme green. Portfolio bleeding 240 bps.
          </div>
          <div className="mt-2 text-[10px] text-accent-gold cursor-pointer hover:underline">
            Drill: Portfolio Drift view (pending)
          </div>
          <div className="mt-1 text-[9px] text-text-subtle">
            TODO: replace when portfolio_drift endpoint lands
          </div>
        </div>

        <div
          className="col-span-3 bg-bg-surface border border-border-subtle rounded-md p-4"
          data-testid="rev4-forecast-confidence"
        >
          <div className="text-accent-gold text-[10px] uppercase tracking-wider mb-1">
            Instrument 1 of 4
          </div>
          <div className="text-text-primary text-sm font-semibold">
            Forecast Confidence
          </div>
          <div className="text-text-muted text-[11px] mt-1">
            Source: portfolio_forecast. Links to Scenario Planner tab.
          </div>
          <div className="mt-2 text-[9px] text-text-subtle">
            TODO: replace when portfolio_forecast endpoint lands
          </div>
        </div>

        <div
          className="col-span-3 bg-bg-surface border border-border-subtle rounded-md p-4"
          data-testid="rev4-account-concentration"
        >
          <div className="text-accent-gold text-[10px] uppercase tracking-wider mb-1">
            Instrument 2 of 4 (NEW)
          </div>
          <div className="text-text-primary text-sm font-semibold">
            Account Concentration
          </div>
          <div className="text-text-muted text-[11px] mt-1">
            1 Critical, 2 High, 4 Moderate, 3 Low.
          </div>
          <div className="mt-2 text-[9px] text-text-subtle">
            TODO: replace when account_risk endpoint lands
          </div>
        </div>

        <div
          className="col-span-3 bg-bg-surface border border-border-subtle rounded-md p-4"
          data-testid="rev4-capability-heatmap"
        >
          <div className="text-accent-gold text-[10px] uppercase tracking-wider mb-1">
            Instrument 4 of 4 (NEW)
          </div>
          <div className="text-text-primary text-sm font-semibold">
            Capability Heat Map
          </div>
          <div className="text-text-muted text-[11px] mt-1">
            5 critical gaps. Links to Capability and Supply Chain tab.
          </div>
          <div className="mt-2 text-[9px] text-text-subtle">
            TODO: links to /home/capability-supply-chain when built
          </div>
        </div>

      </div>
    </section>
  );
}
