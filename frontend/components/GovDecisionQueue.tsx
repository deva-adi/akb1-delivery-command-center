/**
 * Decision Queue (stub) + Escalation Contract ladder (partial real).
 *
 * Decision Queue: TODO: replace when decisions table lands.
 * Escalation Contract: tier labels from escalation_tier_config for PO;
 *   static default labels for non-PO. SLA values and contact names are stubs.
 */

import type { TierConfigItem } from "@/lib/governance";

interface Props {
  tierConfigItems: TierConfigItem[] | null;
}

const DECISIONS = [
  { programme: "Pegasus", category: "Scope", label: "Milestone recovery plan", age: "11d", ageRed: true, options: "A Descope / B Extend / C Accept slip", rec: "A Descope with Q3 add-back", deferral: "Margin minus 120 bps at 2 weeks", owner: "Rajiv" },
  { programme: "Phoenix", category: "Resource", label: "Hire backfill approval", age: "8d", ageRed: true, options: "A Internal / B Vendor / C Defer", rec: "A Internal from bench", deferral: "SLA miss in 14 days", owner: "Meera" },
  { programme: "Stellar", category: "Commercial", label: "CR reprice Q2 scope", age: "14d", ageRed: true, options: "No pre-read", rec: "--", deferral: "--", owner: "Priya" },
  { programme: "Helix", category: "Vendor", label: "Vendor B rationalisation gate", age: "4d", ageRed: false, options: "A Exit / B Formal notice / C Continue", rec: "B Formal notice with 60-day", deferral: "Quality miss compounding", owner: "Kiran" },
  { programme: "Pegasus", category: "Compliance", label: "Audit remediation scope", age: "6d", ageRed: true, options: "A Full / B Phased / C Accept risk", rec: "B Phased with 45-day gate", deferral: "Regulatory fine exposure", owner: "Rajiv" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Scope: "bg-[#60A5FA]/20 text-[#60A5FA]",
  Resource: "bg-[#A78BFA]/20 text-[#A78BFA]",
  Commercial: "bg-[#F472B6]/20 text-[#F472B6]",
  Vendor: "bg-status-amber/20 text-status-amber",
  Compliance: "bg-status-red/20 text-status-red",
};

const DEFAULT_TIERS: TierConfigItem[] = [
  { tier_number: 1, display_label: "DM", default_label: "DM" },
  { tier_number: 2, display_label: "Programme Director", default_label: "Programme Director" },
  { tier_number: 3, display_label: "Portfolio Owner", default_label: "Portfolio Owner" },
  { tier_number: 4, display_label: "Sponsor", default_label: "Sponsor" },
  { tier_number: 5, display_label: "Steerco", default_label: "Steerco" },
];

const TIER_SLAS = ["24h SLA", "48h SLA", "72h SLA", "5d SLA", "10d SLA"];

function tierBorderClass(n: number): string {
  if (n <= 2) return "border-l-status-green bg-status-green/5";
  if (n === 3) return "border-l-status-amber bg-status-amber/5";
  return "border-l-status-red bg-status-red/5";
}

export function GovDecisionQueue({ tierConfigItems }: Props) {
  const tiers = tierConfigItems ?? DEFAULT_TIERS;

  return (
    <section className="grid grid-cols-12 gap-6 mb-8" data-testid="gov-decision-section">

      <div className="col-span-8 bg-bg-surface border border-border-subtle rounded-md p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-text-primary text-base font-semibold">Decision Queue (extended)</h2>
            <p className="text-text-muted text-xs mt-0.5">
              S04P2 format: Options, Recommendation, Impact of Deferral.
            </p>
          </div>
          <span className="px-1.5 py-0.5 bg-border-subtle/60 rounded text-[9px] text-text-subtle font-mono">
            stub -- decisions table pending
          </span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-muted border-b border-border-subtle">
              <th className="text-left p-2 font-medium">Programme</th>
              <th className="text-left p-2 font-medium">Category</th>
              <th className="text-left p-2 font-medium">Decision</th>
              <th className="text-left p-2 font-medium">Age</th>
              <th className="text-left p-2 font-medium">Options</th>
              <th className="text-left p-2 font-medium">Recommendation</th>
              <th className="text-left p-2 font-medium">Deferral impact</th>
              <th className="text-left p-2 font-medium">Owner</th>
            </tr>
          </thead>
          <tbody>
            {DECISIONS.map((d, i) => (
              <tr key={i} className="border-b border-border-subtle hover:bg-border-subtle/20 transition cursor-pointer">
                <td className="p-2 text-text-primary">{d.programme}</td>
                <td className="p-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${CATEGORY_COLORS[d.category] ?? "text-text-muted"}`}>
                    {d.category}
                  </span>
                </td>
                <td className="p-2 text-text-primary">{d.label}</td>
                <td className="p-2">
                  <span className={`font-mono ${d.ageRed ? "text-status-red" : "text-status-amber"}`}>
                    {d.age}
                  </span>
                </td>
                <td className="p-2 text-text-secondary">{d.options}</td>
                <td className="p-2 text-text-secondary">{d.rec}</td>
                <td className="p-2 text-text-secondary">{d.deferral}</td>
                <td className="p-2 text-text-muted">{d.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="col-span-4 bg-bg-surface border border-border-subtle rounded-md p-5" data-testid="gov-escalation-contract">
        <div className="mb-3">
          <h2 className="text-text-primary text-base font-semibold">Escalation Contract</h2>
          <p className="text-text-muted text-xs mt-0.5">
            Pegasus. Tier labels from{" "}
            <span className="font-mono">escalation_tier_config</span>.
            {tierConfigItems === null && " (PO-only -- showing defaults)"}
          </p>
        </div>
        <div className="space-y-2 text-xs">
          {tiers.map((tier, i) => (
            <div
              key={tier.tier_number}
              className={`border-l-2 pl-3 py-2 ${tierBorderClass(tier.tier_number)}`}
              data-testid={`escalation-tier-${tier.tier_number}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-medium">
                  Tier {tier.tier_number} {tier.display_label}
                </span>
                <span className="font-mono text-text-muted">{TIER_SLAS[i]}</span>
              </div>
              <div className="text-text-secondary text-[11px]">Contact name (stub)</div>
            </div>
          ))}
          <div className="pt-2 border-t border-border-subtle mt-3">
            <span className="text-status-red text-[11px] font-semibold">Staleness: 210 days (stub)</span>
            <span className="text-text-muted text-[11px] ml-2">Re-validate before next steerco</span>
          </div>
        </div>
      </div>

    </section>
  );
}
