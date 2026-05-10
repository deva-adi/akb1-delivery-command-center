/**
 * Rev 4 additions per PRD 15 rev 4: UC-Y extended Decision Queue columns
 * (Options, Recommendation, Impact of Deferral), UC-Z decision category split
 * (Scope, Vendor, Resource, Commercial, Compliance), and R4.3 Governance
 * cross-link banner.
 *
 * All sections stub pending decisions + steerco_pre_read entities.
 * TODO: wire extended columns to GET /api/v1/ops-sla/decision-queue?category={cat}
 * TODO: wire category splits to GET /api/v1/ops-sla/decision-queue-by-category
 * TODO: restrict cross-link banner to PO and DD only (R4.3; currently rendered for all)
 */

const DECISION_CATEGORIES = ["Scope", "Vendor", "Resource", "Commercial", "Compliance"] as const;

export function OpsRev4Section() {
  return (
    <section
      className="border-t-2 border-accent-gold bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-stub="true"
      data-testid="ops-rev4-section"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="px-2 py-1 bg-accent-gold text-bg-base rounded text-[10px] font-bold tracking-wider">
          REVISION 4
        </div>
        <h2 className="text-text-primary text-lg font-semibold">Rev 4 additions</h2>
        <span className="text-text-muted text-xs">
          UC-Y extended Decision Queue, UC-Z category split
        </span>
      </div>

      <div className="bg-bg-surface border border-accent-gold/30 rounded-md p-3 mb-5 flex items-center gap-3">
        <span className="text-accent-gold text-xs font-semibold">Governance scope:</span>
        <span className="text-text-primary text-xs">
          For full governance operating model including cadence calendar, RACI, escalation
          contracts, and sponsor engagement, see Governance Operating Model.
        </span>
        <a
          href="/home/governance-operating-model"
          className="ml-auto text-[10px] text-accent-gold hover:underline whitespace-nowrap"
        >
          Governance tab
        </a>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-primary text-sm font-semibold">
            Decision Queue (extended columns)
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-muted">Category:</span>
            {DECISION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="px-2 py-1 rounded text-text-muted border border-border-subtle cursor-not-allowed opacity-60"
                disabled
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center py-8 bg-bg-surface-subtle rounded border border-border-subtle border-dashed">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center px-2 py-1 bg-accent-gold/10 border border-accent-gold/30 rounded text-accent-gold text-[10px] font-semibold uppercase tracking-wider">
              stub
            </div>
            <p className="text-text-muted text-xs max-w-[320px]">
              Extended queue columns (Options, Recommendation, Impact of Deferral) require
              steerco_pre_read join. Category filter requires decisions.category field.
              Neither entity is seeded yet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
