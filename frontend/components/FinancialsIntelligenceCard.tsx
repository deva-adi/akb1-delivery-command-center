import type { FinancialsWhat } from "@/lib/financials";

interface Props {
  intel: FinancialsWhat;
  activeProgamme: string | null;
}

export function FinancialsIntelligenceCard({ intel, activeProgamme }: Props) {
  const riskLine =
    activeProgamme !== null
      ? intel.atRiskProgrammes > 0
        ? `${activeProgamme} is at financial health risk.`
        : `${activeProgamme} is within health thresholds.`
      : intel.atRiskProgrammes > 0
      ? `${intel.atRiskProgrammes} of ${intel.visibleProgrammes} programmes show financial health risk.`
      : `All ${intel.visibleProgrammes} programmes within health thresholds.`;

  const wipLine =
    intel.delayedMilestones > 0
      ? `${intel.delayedMilestones} delayed milestone${intel.delayedMilestones !== 1 ? "s" : ""} signal unbilled WIP exposure.`
      : "No delayed milestones.";

  const worstLine =
    activeProgamme === null && intel.worstProgramme !== null
      ? `${intel.worstProgramme} is the primary margin risk.`
      : "";

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="financials-intelligence-card"
    >
      {activeProgamme !== null && (
        <p className="text-accent-gold text-xs font-medium mb-4 tracking-wide">
          Programme view: {activeProgamme}
        </p>
      )}
      <div className="grid grid-cols-3 gap-8">

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              What does this tell me
            </h3>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            <span
              className={
                intel.atRiskProgrammes > 0
                  ? "text-status-red font-semibold"
                  : "text-status-green font-semibold"
              }
            >
              {riskLine}
            </span>{" "}
            <span className="text-status-amber font-semibold">{wipLine}</span>
            {worstLine !== "" && (
              <>
                {" "}
                <span className="text-text-primary font-semibold">{worstLine}</span>
              </>
            )}{" "}
            <span className="text-text-muted text-xs">
              Revenue stack, DSO, and margin figures pending financials_monthly entity.
            </span>
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
                48%
              </span>
              <span className="text-text-secondary">
                Direct cost grew from replacement hires at higher blended rates, compressing
                gross margin on the Red and Failing programmes.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                29%
              </span>
              <span className="text-text-secondary">
                Unbilled WIP rising from milestone slips on the worst-health programmes.
                Booked vs billed gap widens each week decisions are delayed.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                23%
              </span>
              <span className="text-text-secondary">
                Non-billable bench days rising as roll-offs from delayed programmes have no
                immediate rebadge target.
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
                Clear unbilled WIP on delayed milestones with client sign-off before month-end
                close.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Finance Lead</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Shift 30 percent of bench to new commercial opportunities to reduce bench tax
                drag.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Portfolio Owner</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Enforce blended rate ceiling on replacement hires and reprice any contract
                where margin fell below 18 percent.
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
