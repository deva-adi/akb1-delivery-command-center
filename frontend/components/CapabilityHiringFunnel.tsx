/**
 * Hiring Funnel panel -- stub.
 *
 * Requires hiring_funnel entity (not yet seeded). Displays the wireframe
 * funnel structure as a locked stub with stage labels preserved.
 * TODO: replace when GET /api/v1/capability/hiring-funnel lands.
 */

const FUNNEL_STAGES = [
  "Open",
  "Sourced",
  "Screened",
  "Interviewed",
  "Offered",
  "Joined",
] as const;

export function CapabilityHiringFunnel(): JSX.Element {
  return (
    <div
      className="col-span-5 bg-bg-surface border border-border-subtle rounded-md p-5"
      data-stub="true"
      data-testid="capability-hiring-funnel"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-text-primary text-base font-semibold">Hiring Funnel</h2>
        <span className="px-1.5 py-0.5 bg-border-subtle rounded text-[9px] uppercase font-semibold text-text-subtle">
          stub
        </span>
      </div>

      <div className="space-y-2">
        {FUNNEL_STAGES.map((stage) => (
          <div key={stage}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-primary">{stage}</span>
              <span className="font-mono text-text-muted">--</span>
            </div>
            <div className="w-full h-6 bg-bg-surface-elevated rounded" />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-text-muted">
        <span>Time to fill</span>
        <span className="font-mono text-text-subtle font-semibold">-- days</span>
        {/* TODO: replace with real funnel data from hiring_funnel entity */}
      </div>
    </div>
  );
}
