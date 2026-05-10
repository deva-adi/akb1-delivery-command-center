/**
 * DORA Metrics section (Revision 2 per PRD 10 R2.1/R2.2).
 * All 4 DORA KPIs and the per-programme band grid are stubs pending
 * the dora_metrics entity.
 * TODO: wire to GET /api/v1/flow/dora when dora_metrics is seeded.
 */

const DORA_KPIS = [
  {
    label: "Deployment Frequency",
    value: "n/a",
    unit: "/ day",
    band: "stub",
    bandColour: "border-border-subtle text-text-muted",
  },
  {
    label: "Lead Time for Changes",
    value: "n/a",
    unit: "days",
    band: "stub",
    bandColour: "border-border-subtle text-text-muted",
  },
  {
    label: "Change Failure Rate",
    value: "n/a",
    unit: "%",
    band: "stub",
    bandColour: "border-border-subtle text-text-muted",
  },
  {
    label: "MTTR",
    value: "n/a",
    unit: "hrs",
    band: "stub",
    bandColour: "border-border-subtle text-text-muted",
  },
] as const;

const DORA_PROGRAMMES = [
  "PEGASUS",
  "PHOENIX",
  "ORION",
  "ATLAS",
  "HELIX",
];

export function FlowDORASection() {
  return (
    <section
      className="border-t-2 border-accent-gold bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-stub="true"
      data-testid="flow-dora-section"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="px-2 py-1 bg-accent-gold text-bg-base rounded text-[10px] font-bold tracking-wider">
          REVISION 2
        </div>
        <h2 className="text-text-primary text-lg font-semibold">DORA Metrics</h2>
        <span className="text-text-muted text-xs">UC-L | dora_metrics entity not yet seeded</span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {DORA_KPIS.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-bg-surface border border-border-subtle rounded-md p-4"
            data-stub="true"
          >
            <div className="text-text-muted text-[10px] uppercase tracking-wider mb-1">
              {kpi.label}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-text-secondary text-2xl font-semibold tabular">
                {kpi.value}
              </span>
              <span className="text-text-muted text-xs">{kpi.unit}</span>
            </div>
            <div className="mt-1 text-text-subtle text-[11px]">
              stub
            </div>
          </div>
        ))}
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-md p-4">
        <h3 className="text-text-primary text-sm font-semibold mb-3">
          DORA Band per Programme
        </h3>
        <div className="grid grid-cols-5 gap-3 text-xs">
          {DORA_PROGRAMMES.map((code) => (
            <div
              key={code}
              className="p-2 bg-border-subtle/10 border border-border-subtle rounded text-center"
              data-stub="true"
            >
              <div className="text-text-primary mb-1">{code}</div>
              <div className="font-mono text-text-muted font-semibold">
                n/a
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-text-subtle text-[10px]">
          Elite / High / Medium / Low bands per DORA Accelerate convention.
          {/* TODO: wire to dora_metrics when entity is seeded */}
        </p>
      </div>
    </section>
  );
}
