import type { OpsWhat } from "@/lib/ops-sla";

interface Props {
  intel: OpsWhat;
}

export function OpsIntelligenceCard({ intel }: Props) {
  const riskLine =
    intel.atRiskProgrammes > 0
      ? `${intel.atRiskProgrammes} of ${intel.visibleProgrammes} programmes at SLA risk.`
      : `All ${intel.visibleProgrammes} programmes within health thresholds.`;

  const decisionLine =
    intel.delayedMilestones > 0
      ? `${intel.delayedMilestones} delayed milestones signal outstanding decision pressure.`
      : "No delayed milestones.";

  const worstLine =
    intel.worstProgramme !== null
      ? `${intel.worstProgramme} is the primary SLA exposure.`
      : "";

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="ops-intelligence-card"
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
            <span
              className={
                intel.atRiskProgrammes > 0
                  ? "text-status-red font-semibold"
                  : "text-status-green font-semibold"
              }
            >
              {riskLine}
            </span>{" "}
            <span className="text-status-amber font-semibold">{decisionLine}</span>
            {worstLine !== "" && (
              <>
                {" "}
                <span className="text-text-primary font-semibold">{worstLine}</span>
              </>
            )}
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
                58%
              </span>
              <span className="text-text-secondary">
                P1 incidents on Red and Failing programmes tripled after wave go-live, saturating
                on-call rotation and breaching MTTR SLAs.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                25%
              </span>
              <span className="text-text-secondary">
                Integration environment instability on Amber programmes causing cascading P2 tickets
                and first-response delays.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                17%
              </span>
              <span className="text-text-secondary">
                Compliance testing consuming senior SRE capacity, compressing oncall cover and
                slowing resolution on open decisions.
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
                Stabilise on-call on the worst-health programme with two additional SREs from bench.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Delivery Director</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Escalate the P1 incident pattern at the next steerco with client sponsor and CRO.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Programme Manager</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Clear all decisions past SLA before ops review. No decision older than 7 days should
                leave the meeting without an owner and a date.
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
