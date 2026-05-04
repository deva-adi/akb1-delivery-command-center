import type { RaidKPIs } from "@/lib/raids";

interface Props {
  kpis: RaidKPIs;
}

export function RaidIntelligenceCard({ kpis }: Props) {
  const highLabel = kpis.highSevCount > 15
    ? `${kpis.highSevCount} high severity -- above alert threshold`
    : `${kpis.highSevCount} high severity`;

  const agingLabel = kpis.agingCount > 5
    ? `${kpis.agingCount} aging more than 30 days -- above alert threshold`
    : `${kpis.agingCount} aging more than 30 days`;

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="raid-intelligence-card"
    >
      <div className="grid grid-cols-3 gap-8">

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              What does this tell me
            </h3>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            Portfolio carries{" "}
            <span className="text-text-primary font-semibold">
              {kpis.openCount} open RAID items
            </span>
            .{" "}
            <span
              className={
                kpis.highSevCount > 15 ? "text-status-red font-semibold" : "text-status-amber font-semibold"
              }
            >
              {highLabel}
            </span>
            .{" "}
            <span
              className={
                kpis.agingCount > 5 ? "text-status-red font-semibold" : "text-status-amber font-semibold"
              }
            >
              {agingLabel}
            </span>
            .
          </p>
        </div>

        <div className="pl-8 border-l border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              Why is this happening
            </h3>
          </div>
          <ol className="space-y-2 text-sm">
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                45%
              </span>
              <span className="text-text-secondary">
                Compliance and regulatory items dominate the Critical band across Red and Failing programmes.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                30%
              </span>
              <span className="text-text-secondary">
                SLA breach exposure and contractual dependencies driving High severity count above threshold.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                25%
              </span>
              <span className="text-text-secondary">
                Scope and commercial items accumulating without resolution, contributing to aging RAID debt.
              </span>
            </li>
          </ol>
        </div>

        <div className="pl-8 border-l border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              What do I do this week
            </h3>
          </div>
          <div className="space-y-2">
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Escalate any Critical item past 30 days in the next steerco.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Delivery Director</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Review High severity items without a mitigation date assigned.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Programme Manager</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Reprice Assumptions that have converted to confirmed scope items.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Finance Lead</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
