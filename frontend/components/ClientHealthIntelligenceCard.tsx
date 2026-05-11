import type { ClientHealthWhat } from "@/lib/client-health";

interface Props {
  intel: ClientHealthWhat;
}

export function ClientHealthIntelligenceCard({ intel }: Props) {
  const interventionLine =
    intel.interveneCount > 0
      ? `${intel.interveneCount} programmes in intervention zone across ${intel.visibleProgrammes} visible.`
      : `All ${intel.visibleProgrammes} programmes outside intervention zone.`;

  const scoreLine =
    intel.blendedScore !== null
      ? `Blended health proxy: ${intel.blendedScore}/100.`
      : "Blended health proxy: no snapshot data.";

  const milestoneLine =
    intel.delayedMilestones > 0
      ? `${intel.delayedMilestones} delayed milestones.`
      : "No delayed milestones.";

  const worstLine =
    intel.interveneCount > 0 && intel.worstProgramme !== null
      ? `${intel.worstProgramme} is the priority.`
      : "";

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="client-health-intelligence-card"
    >
      <p className="text-text-muted text-xs mb-4 font-medium tracking-wide uppercase">
        Delivery excellence is the retention argument.
      </p>

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
                intel.interveneCount > 0
                  ? "text-status-red font-semibold"
                  : "text-status-green font-semibold"
              }
            >
              {interventionLine}
            </span>{" "}
            <span className="text-text-primary font-semibold">{scoreLine}</span>{" "}
            <span className="text-status-amber font-semibold">{milestoneLine}</span>
            {worstLine !== "" && (
              <>
                {" "}
                <span className="text-text-primary font-semibold">{worstLine}</span>
              </>
            )}{" "}
            <span className="text-text-muted text-xs">
              Signal data pending client_signals entity.
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
                1
              </span>
              <span className="text-text-secondary">
                Escalation pattern from key client stakeholders signals unresolved expectations
                gap between contracted scope and perceived delivery outcome.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                2
              </span>
              <span className="text-text-secondary">
                Missed executive meetings on two programmes have broken the visibility loop.
                Decision-makers are forming their own narratives without counterbalance.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                3
              </span>
              <span className="text-text-secondary">
                NPS trajectory across intervene-zone programmes shows three consecutive
                declining surveys, consistent with unresolved SLA and scope disputes.
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
                Book executive save meeting with client CRO on the priority programme before
                end of week.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Portfolio Owner</span>
                <span className="text-status-red font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Run relationship audit across all INTERVENE programmes. Identify the most
                influential champion and the most vocal detractor in each account.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Delivery Director</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Start daily sponsor standups on watch-zone programmes before they cross into
                intervention territory.
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
