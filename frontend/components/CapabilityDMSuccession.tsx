/**
 * DM Succession Picture panel -- stub.
 *
 * Requires dm_succession_signals entity (not yet seeded). Displays the
 * wireframe table structure as a locked stub.
 * TODO: replace when GET /api/v1/capability/dm-succession lands.
 */

export function CapabilityDMSuccession(): JSX.Element {
  return (
    <div
      className="col-span-4 bg-bg-surface border border-border-subtle rounded-md p-5"
      data-stub="true"
      data-testid="capability-dm-succession"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-text-primary text-base font-semibold">DM Succession Picture</h2>
        <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
          stub
        </span>
      </div>
      <div className="text-text-muted text-xs text-center py-8">
        {/* TODO: succession grid from dm_succession_signals */}
        DM succession grid: awaiting GET /api/v1/capability/dm-succession
      </div>
    </div>
  );
}
