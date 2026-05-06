interface Props {
  flaggedCount: number;
  visibleProgrammes: number;
  userRole: string;
}

export function GovIntelligenceCard({ flaggedCount, visibleProgrammes, userRole }: Props) {
  const flagLabel =
    flaggedCount === 0
      ? "no programmes reporting green while carrying delayed milestones"
      : `${flaggedCount} programme${flaggedCount !== 1 ? "s" : ""} reporting green on health while carrying delayed milestones`;

  const isExecutive = userRole === "PortfolioOwner" || userRole === "DeliveryDirector";

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 pt-5 pb-6"
      data-testid="gov-intelligence-card"
    >
      <p className="text-accent-gold text-sm font-semibold tracking-tight mb-4">
        Governance that does not decide is theatre.
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
            {isExecutive ? (
              <>
                <span className="text-text-primary font-semibold">{visibleProgrammes} programmes</span>
                {" "}in scope. Over-optimism check:{" "}
                <span
                  className={
                    flaggedCount > 0 ? "text-status-amber font-semibold" : "text-status-green font-semibold"
                  }
                >
                  {flagLabel}
                </span>
                . Governance cadence, RACI, and decision queue data are pending dedicated backend entities.
              </>
            ) : (
              <>
                <span className="text-text-primary font-semibold">{visibleProgrammes} programmes</span>
                {" "}visible to your scope. Over-optimism check:{" "}
                <span
                  className={
                    flaggedCount > 0 ? "text-status-amber font-semibold" : "text-status-green font-semibold"
                  }
                >
                  {flagLabel}
                </span>
                .
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
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">48%</span>
              <span className="text-text-secondary">
                Monthly steerco cadence on Pegasus and Phoenix. Decisions accumulate between meetings and crossed the Theatre threshold this quarter.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">32%</span>
              <span className="text-text-secondary">
                RACI gaps concentrated in vendor handoff workstreams on Pegasus and Stellar. Three activities have no named accountable.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">20%</span>
              <span className="text-text-secondary">
                Escalation contract staleness on Pegasus and Helix. Tier authority defaults to steerco, lengthening resolution.
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
                Move Pegasus and Phoenix to fortnightly steerco.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Delivery Director</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Assign accountable owners to the 3 vendor-handoff RACI gaps on Pegasus and Stellar.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Programme Manager</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Re-validate escalation contracts on Pegasus and Helix before the next steerco.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Portfolio Owner</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
