import type { FlowWhat } from "@/lib/flow-velocity";

interface Props {
  intel: FlowWhat;
}

export function FlowIntelligenceCard({ intel }: Props) {
  const breachLine =
    intel.wipBreachCount > 0
      ? `WIP above limit on ${intel.wipBreachCount} of ${intel.visibleProgrammes} programmes.`
      : `WIP within limits across all ${intel.visibleProgrammes} programmes.`;

  const dragLine =
    intel.worstProgramme !== null
      ? `${intel.worstProgramme} is the primary drag.`
      : "";

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="flow-intelligence-card"
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
            Portfolio throughput proxy:{" "}
            <span className="text-text-primary font-semibold">
              {intel.throughputProxy} milestones complete
            </span>{" "}
            across{" "}
            <span className="text-text-primary font-semibold">
              {intel.visibleProgrammes} programme{intel.visibleProgrammes !== 1 ? "s" : ""}
            </span>
            .{" "}
            <span
              className={
                intel.wipBreachCount > 0
                  ? "text-status-red font-semibold"
                  : "text-status-green font-semibold"
              }
            >
              {breachLine}
            </span>
            {dragLine !== "" && (
              <>
                {" "}
                <span className="text-status-amber font-semibold">{dragLine}</span>
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
                52%
              </span>
              <span className="text-text-secondary">
                WIP-heavy programmes accumulate queue buildup in code review and QA, compressing
                cycle time for the whole portfolio.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                28%
              </span>
              <span className="text-text-secondary">
                Compliance and audit draws on senior engineers starve the pipeline on two Amber
                programmes.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                20%
              </span>
              <span className="text-text-secondary">
                Test environment instability causes stories to cycle between test and dev, inflating
                lead time.
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
                Cap WIP on breaching programmes and enforce the limit at the next daily standup.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Delivery Director</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Unblock the two Amber programmes by capping compliance draw to 20 hours per week.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Programme Manager</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Stabilise test environments on the lowest-velocity programme before next sprint
                planning.
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
