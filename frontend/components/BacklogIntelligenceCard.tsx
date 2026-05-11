import type { BacklogWhat } from "@/lib/backlog-health";

interface Props {
  what: BacklogWhat;
}

export function BacklogIntelligenceCard({ what }: Props) {
  const pressureLine =
    what.pressureProgrammes > 0
      ? `${what.pressureProgrammes} of ${what.visibleProgrammes} programmes have delayed or at-risk milestones signalling grooming pressure.`
      : `All ${what.visibleProgrammes} programmes free of milestone delays.`;

  const delayedLine =
    what.delayedTotal > 0
      ? `${what.delayedTotal} delayed milestones total.`
      : "No delayed milestones.";

  const worstLine =
    what.worstProgramme !== null
      ? `${what.worstProgramme} is CRITICAL -- groom sprint required.`
      : "";

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="backlog-intelligence-card"
    >
      <p className="text-text-muted text-xs mb-4 font-medium tracking-wide uppercase">
        Groom early or debug late.
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
                what.pressureProgrammes > 0
                  ? "text-status-red font-semibold"
                  : "text-status-green font-semibold"
              }
            >
              {pressureLine}
            </span>{" "}
            <span className="text-status-amber font-semibold">{delayedLine}</span>
            {worstLine !== "" && (
              <>
                {" "}
                <span className="text-status-red font-semibold">{worstLine}</span>
              </>
            )}{" "}
            <span className="text-text-muted text-xs">
              Backlog volume and DoR metrics pending backlog_items entity.
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
                Pegasus compliance stories are saturating sprint capacity. The team is
                delivering regulatory mandates but deferring all product backlog refinement
                to future sprints that are already overcommitted.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                2
              </span>
              <span className="text-text-secondary">
                Phoenix epic readiness stalled on client sign-off. Three epics cannot enter
                grooming until the client architecture review completes, creating a downstream
                readiness gap for the next two sprints.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                3
              </span>
              <span className="text-text-secondary">
                Stellar groom sessions have been skipped for three consecutive sprints due to
                DM availability conflicts. Backlog DoR compliance has dropped below the
                threshold required for reliable sprint commitment.
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
                Add a dedicated groom sprint to Pegasus to clear compliance story backlog
                and restore capacity for product work.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Programme Manager</span>
                <span className="text-status-red font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Escalate the Phoenix epic readiness blocker to the client architecture
                committee with a named sign-off deadline.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Delivery Director</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Enforce Stellar groom cadence at 4 hours per sprint and assign a backup
                facilitator for DM absence cover.
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
