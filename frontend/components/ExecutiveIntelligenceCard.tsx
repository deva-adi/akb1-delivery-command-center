import type { ExecutiveKPIs, ProgrammeStateRow } from "@/lib/executive";
import { executiveSubtitle } from "@/lib/executive";

interface Props {
  kpis: ExecutiveKPIs;
  programmeStates: ProgrammeStateRow[];
  userRole: string;
  activeProgamme: string | null;
}

export function ExecutiveIntelligenceCard({ kpis, programmeStates, userRole, activeProgamme }: Props) {
  const subtitle = executiveSubtitle(userRole);

  const greenCount = programmeStates.filter((p) => p.display === "GREEN").length;
  const amberCount = programmeStates.filter((p) => p.display === "AMBER").length;
  const redCount = programmeStates.filter((p) => p.display === "RED").length;
  const breachCount = programmeStates.filter((p) => p.display === "BREACH").length;

  const raidAlert = kpis.raidSeverityIndex >= 7.0;
  const onTimeAlert = kpis.onTimePct < 80;

  return (
    <section
      className="border-b border-border-subtle bg-bg-surface-subtle -mx-8 px-8 py-6"
      data-testid="executive-intelligence-card"
    >
      {subtitle !== null && (
        <p className="text-accent-gold text-xs font-medium mb-4 tracking-wide">
          {subtitle}
        </p>
      )}

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
          {activeProgamme !== null ? (
            <p className="text-text-secondary text-sm leading-relaxed">
              <span className="text-text-primary font-semibold">{activeProgamme}</span> is{" "}
              <span
                className={
                  onTimeAlert ? "text-status-red font-semibold" : "text-text-primary font-semibold"
                }
              >
                {kpis.onTimePct}% on plan
              </span>
              {" "}with RAID severity index{" "}
              <span
                className={raidAlert ? "text-status-red font-semibold" : "text-status-amber font-semibold"}
              >
                {kpis.raidSeverityIndex.toFixed(1)}/10
              </span>
              {raidAlert && " (above 7.0 alert threshold)"}
              .{" "}
              {(redCount + breachCount) > 0 && (
                <span className="text-status-red font-semibold">
                  Health: {programmeStates[0]?.display ?? "unknown"}.
                </span>
              )}
            </p>
          ) : (
            <p className="text-text-secondary text-sm leading-relaxed">
              Delivery is{" "}
              <span
                className={
                  onTimeAlert ? "text-status-red font-semibold" : "text-text-primary font-semibold"
                }
              >
                {kpis.onTimePct}% on plan
              </span>{" "}
              across{" "}
              <span className="text-text-primary font-semibold">
                {kpis.visibleProgrammes} programme{kpis.visibleProgrammes !== 1 ? "s" : ""}
              </span>
              .{" "}
              {greenCount > 0 && (
                <>
                  <span className="text-status-green font-semibold">{greenCount} green</span>
                  {(amberCount + redCount + breachCount) > 0 && ", "}
                </>
              )}
              {amberCount > 0 && (
                <>
                  <span className="text-status-amber font-semibold">{amberCount} amber</span>
                  {(redCount + breachCount) > 0 && ", "}
                </>
              )}
              {(redCount + breachCount) > 0 && (
                <span className="text-status-red font-semibold">
                  {redCount + breachCount} red{breachCount > 0 ? " or breach" : ""}
                </span>
              )}
              .{" "}
              RAID severity index{" "}
              <span
                className={raidAlert ? "text-status-red font-semibold" : "text-status-amber font-semibold"}
              >
                {kpis.raidSeverityIndex.toFixed(1)}/10
              </span>
              {raidAlert && " -- above 7.0 alert threshold"}
              .
            </p>
          )}
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
                42%
              </span>
              <span className="text-text-secondary">
                Pegasus Healthcare milestone slip pushed revenue recognition by 4 weeks.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                31%
              </span>
              <span className="text-text-secondary">
                Orion Insurance replaced two B4 Senior Managers at lower blended rates.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular min-w-[3ch]">
                27%
              </span>
              <span className="text-text-secondary">
                Stellar Logistics absorbed a scope expansion without a price adjustment.
              </span>
            </li>
            <li className="flex items-baseline gap-3 pt-1 border-t border-border-subtle mt-2">
              <span className="text-text-subtle font-mono text-xs tabular min-w-[3ch]">
                Other
              </span>
              <span className="text-text-subtle text-xs">
                Tail of 4 smaller drivers, contributions within rounding.
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
                Escalate Pegasus milestone slip in the Thursday client steerco.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Delivery Director</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Reprice Stellar scope expansion and recover the margin before month close.
              </p>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-text-muted">Finance Lead</span>
                <span className="text-status-amber font-medium">This week</span>
              </div>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-md p-3 hover:border-border-strong transition cursor-pointer">
              <p className="text-text-primary text-sm font-medium mb-1.5 leading-snug">
                Move two B3 Tech Leads to Orion to restore blended rate parity.
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
