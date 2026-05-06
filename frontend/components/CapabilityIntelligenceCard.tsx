/**
 * Capability and Supply Chain intelligence card.
 *
 * What: derived from real people data (total headcount, band distribution).
 * Why + Act: static, matching wireframe voice at director altitude.
 * Subtitle locked: "Strategic capability, not operational roster."
 */

import type { CapabilityWhat } from "@/lib/capability";

interface Props {
  intel: CapabilityWhat;
}

export function CapabilityIntelligenceCard({ intel }: Props): JSX.Element {
  const whatProse = [
    `Delivery organisation headcount: ${intel.totalHeadcount} across 5 bands (${intel.bandLine}).`,
    intel.seniorLine,
    intel.sentimentLine ?? "1-on-1 sentiment scores not yet seeded.",
    "Bench, skill gap, succession, and hiring panels pending capability platform entities.",
  ].join(" ");

  return (
    <section className="border-b border-border-subtle bg-bg-surface-subtle">
      <div className="max-w-[1440px] mx-auto px-8 pt-5 pb-2">
        <div className="text-accent-gold text-sm font-semibold tracking-tight mb-1">
          Strategic capability, not operational roster.
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto px-8 py-5 grid grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-5 bg-accent-gold rounded-full" />
            <h3 className="text-accent-gold text-base font-semibold tracking-tight">
              What does this tell me
            </h3>
          </div>
          <p
            className="text-text-secondary text-sm leading-relaxed"
            data-testid="capability-what"
          >
            {whatProse}
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
              <span className="text-text-primary font-mono font-semibold tabular-nums min-w-[3ch]">42%</span>
              <span className="text-text-secondary">
                Programme roll-offs create bench clusters at senior band. Demand is mid-band cloud skills. Skill mismatch.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular-nums min-w-[3ch]">33%</span>
              <span className="text-text-secondary">
                DM succession gaps not backfilled. Single point of failure across multiple programmes.
              </span>
            </li>
            <li className="flex items-baseline gap-3">
              <span className="text-text-primary font-mono font-semibold tabular-nums min-w-[3ch]">25%</span>
              <span className="text-text-secondary">
                Senior engineering hiring in BFSI market slow. Time to fill above 90 days.
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
            {[
              "Reskill senior-band bench to cloud SRE via 3-week intensive.",
              "Open formal DM succession programme with named ready candidates as successors.",
              "Escalate hiring vendor panel expansion to bring more search firms into senior engineering funnel.",
            ].map((action) => (
              <div
                key={action}
                className="bg-bg-surface border border-border-subtle rounded-md p-3"
              >
                <p className="text-text-primary text-sm font-medium leading-snug">
                  {action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
