/**
 * Revision 4 section for the Client Health tab.
 *
 * Real element: cross-link banner to Governance Operating Model (static href).
 * Stub elements: Stakeholder Influence quadrant, Opposition Stakeholders KPI,
 * and 1-on-1 action prompt.
 * TODO: replace stubs with actuals when stakeholder_influence entity lands.
 */

export function ClientHealthRev4Section() {
  return (
    <section
      className="border-t-2 border-accent-gold bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="client-health-rev4-section"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="px-2 py-1 bg-accent-gold text-bg-base rounded text-[10px] font-bold tracking-wider">
          REVISION 4
        </div>
        <h2 className="text-text-primary text-lg font-semibold">
          Stakeholder Influence Map
        </h2>
        <span className="text-text-muted text-xs">
          UC-PO | stakeholder_influence entity not yet seeded
        </span>
      </div>

      {/* Cross-link banner (real -- static href) */}
      <div className="mb-5 bg-bg-surface border border-accent-gold/30 rounded-md px-4 py-3 flex items-center gap-3">
        <div className="w-1 h-5 bg-accent-gold rounded-full shrink-0" />
        <p className="text-text-secondary text-sm">
          For the full cross-programme Stakeholder Influence Map including internal
          stakeholders, see{" "}
          <a
            href="/home/governance-operating-model"
            className="text-accent-gold underline underline-offset-2 hover:text-text-primary transition font-medium"
          >
            Governance Operating Model
          </a>
          .
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">

        {/* Stakeholder Influence quadrant stub */}
        <div
          className="col-span-2 bg-bg-surface border border-border-subtle rounded-lg p-5"
          data-stub="true"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-text-primary text-sm font-semibold">
              Stakeholder Influence Quadrant
            </h3>
            <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium">
              stub
            </span>
          </div>

          <div className="relative border border-border-subtle rounded" style={{ height: "200px" }}>
            <svg viewBox="0 0 400 200" className="w-full h-full" aria-hidden="true">
              {/* Quadrant dividers */}
              <line x1="200" y1="0" x2="200" y2="200" stroke="currentColor" strokeWidth="1" className="text-border-subtle" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="1" className="text-border-subtle" />
              {/* Axis labels */}
              <text x="100" y="192" textAnchor="middle" className="fill-current text-text-muted" fontSize="10">Low Influence</text>
              <text x="300" y="192" textAnchor="middle" className="fill-current text-text-muted" fontSize="10">High Influence</text>
              <text x="8" y="55" className="fill-current text-text-muted" fontSize="10">High Support</text>
              <text x="8" y="155" className="fill-current text-text-muted" fontSize="10">Opposing</text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-text-muted text-xs text-center">
                {/* TODO: replace with stakeholder_influence entity data when seeded */}
                Stakeholder positions pending stakeholder_influence entity
              </p>
            </div>
          </div>
        </div>

        {/* Right column: KPI + action prompt */}
        <div className="flex flex-col gap-4">

          <div
            className="bg-bg-surface border border-border-subtle rounded-lg p-5"
            data-stub="true"
          >
            <div className="text-text-muted text-[10px] uppercase tracking-wider mb-2 font-medium">
              Opposition Stakeholders
              <span className="ml-2 px-1 py-0 bg-text-subtle/10 rounded text-[9px] text-text-subtle uppercase">
                stub
              </span>
            </div>
            <div className="text-text-muted text-4xl font-semibold font-mono tabular">
              n/a
            </div>
            <div className="mt-2 text-xs text-text-subtle">
              {/* TODO: replace with actuals when stakeholder_influence entity lands and opposition-count endpoint is added */}
              pending stakeholder_influence entity
            </div>
          </div>

          <div
            className="bg-bg-surface border border-accent-gold/30 rounded-lg p-4"
            data-stub="true"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-accent-gold rounded-full" />
              <p className="text-text-primary text-sm font-semibold">
                Action Required
              </p>
            </div>
            <p className="text-text-secondary text-sm leading-snug">
              Book 1-on-1 with each opposition stakeholder in the high-influence quadrant
              within 14 days.
            </p>
            <p className="mt-2 text-text-muted text-[11px]">
              {/* TODO: wire to stakeholder_influence entity when seeded */}
              Static wireframe prompt. Live targeting requires stakeholder_influence entity.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
