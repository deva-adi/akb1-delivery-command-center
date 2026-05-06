import type { DeliveryHealthKPIs } from "@/lib/delivery-health";

interface Props {
  kpis: DeliveryHealthKPIs;
}

export function DeliveryHealthIntelligenceCard({ kpis }: Props) {
  const blockerLabel =
    kpis.openBlockers > 10
      ? `${kpis.openBlockers} open blockers -- above alert threshold`
      : `${kpis.openBlockers} open blockers`;

  const adherenceLabel =
    kpis.milestoneAdherencePct < 80
      ? `milestone adherence at ${kpis.milestoneAdherencePct}% -- below 80% floor`
      : `milestone adherence at ${kpis.milestoneAdherencePct}%`;

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="delivery-health-intelligence-card"
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
            Portfolio is{" "}
            <span className="text-text-primary font-semibold">
              {kpis.onTimePct}% on plan
            </span>{" "}
            across{" "}
            <span className="text-text-primary font-semibold">
              {kpis.visibleProgrammes} programme{kpis.visibleProgrammes !== 1 ? "s" : ""}
            </span>
            .{" "}
            <span
              className={
                kpis.openBlockers > 10
                  ? "text-status-red font-semibold"
                  : "text-status-amber font-semibold"
              }
            >
              {blockerLabel}
            </span>
            .{" "}
            <span
              className={
                kpis.milestoneAdherencePct < 80
                  ? "text-status-red font-semibold"
                  : "text-status-amber font-semibold"
              }
            >
              {adherenceLabel}
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
                55%
              </span>
              <span className="text-text-secondary">
                Velocity decline on Red and Failing programmes driven by unplanned resource exits
                and compliance draw on senior engineers.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                28%
              </span>
              <span className="text-text-secondary">
                Integration environment instability blocking story closure on two Amber programmes,
                compressing sprint capacity.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                17%
              </span>
              <span className="text-text-secondary">
                Estimation compression accepted without re-baselining now surfacing as silent
                variance on three programmes.
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
                Review all Delayed milestones with slip over 14 days and assign a recovery owner by Friday.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Delivery Director</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Cap compliance draw to 20 hours per week on any programme below 80% adherence.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Programme Manager</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Re-baseline any milestone with silent drift before the next steerco or accept the
                margin impact formally.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Programme Manager</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
