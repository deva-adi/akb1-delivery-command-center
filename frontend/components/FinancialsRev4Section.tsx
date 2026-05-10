/**
 * Revenue Leakage 5-Mechanism Audit (Revision 4 per PRD 08 R4.2, UC-DD).
 * All mechanisms are stub pending the revenue_leakage_mechanism entity.
 * TODO: wire to GET /api/v1/financials/revenue-leakage-portfolio when entity lands.
 */

const LEAKAGE_MECHANISMS = [
  { label: "Rate Card vs Blended Actual", pct: 45 },
  { label: "Scope Absorbed Silently", pct: 23 },
  { label: "Vendor Overrun Unmapped to Penalty", pct: 16 },
  { label: "Attrition Not Rehired at Band", pct: 12 },
  { label: "License Renewal Unbudgeted", pct: 5 },
] as const;

export function FinancialsRev4Section() {
  return (
    <section
      className="border-t-2 border-accent-gold bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-stub="true"
      data-testid="financials-rev4-section"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="px-2 py-1 bg-accent-gold text-bg-base rounded text-[10px] font-bold tracking-wider">
          REVISION 4
        </div>
        <h2 className="text-text-primary text-lg font-semibold">
          Revenue Leakage 5-Mechanism Audit
        </h2>
        <span className="text-text-muted text-xs">
          UC-DD | revenue_leakage_mechanism entity not yet seeded
        </span>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-primary text-sm font-semibold">
            Revenue Leakage by Mechanism (current month, portfolio)
          </h3>
          <span className="font-mono text-text-muted text-sm">n/a (stub)</span>
        </div>

        <div className="space-y-2">
          {LEAKAGE_MECHANISMS.map((mech) => (
            <div key={mech.label}>
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-text-primary">{mech.label}</span>
                <span className="font-mono text-text-muted">n/a (stub)</span>
              </div>
              <div className="w-full h-3 bg-bg-surface-subtle rounded">
                <div
                  className="h-3 bg-border-strong/50 rounded"
                  style={{ width: `${mech.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-[11px] text-text-subtle">
          Recoverable flag indicates which mechanisms can be billed back. Click any bar for
          programme-level detail when revenue_leakage_mechanism entity is seeded.
        </div>
      </div>
    </section>
  );
}
