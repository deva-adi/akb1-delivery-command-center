/**
 * Threshold Calibration Register + Tier Config Admin.
 *
 * Both panels are read-only display. PATCH wiring is a dedicated future slice.
 *
 * PortfolioOwner: sees real data from API responses passed as props.
 * All other roles: sees a "PO access required" stub panel.
 */

import type { TierConfigItem, ThresholdItem } from "@/lib/governance";

interface Props {
  tierConfigItems: TierConfigItem[] | null;
  thresholdItems: ThresholdItem[] | null;
}

function directionLabel(direction: string): string {
  if (direction === "HigherIsBetter") return "Higher is better";
  if (direction === "LowerIsBetter") return "Lower is better";
  return "Within range";
}

function StubCard({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="px-3 py-1.5 bg-accent-gold/20 text-accent-gold rounded-md text-xs font-semibold">
        PO ONLY
      </div>
      <p className="text-text-muted text-sm">{title} is visible to Portfolio Owners only.</p>
      <p className="text-text-subtle text-xs">Edit via Settings when PATCH wiring is live.</p>
    </div>
  );
}

export function GovAdminSection({ tierConfigItems, thresholdItems }: Props) {
  return (
    <section
      className="grid grid-cols-12 gap-6 mb-8"
      data-testid="gov-admin-section"
    >

      <div className="col-span-7 bg-bg-surface border border-border-subtle rounded-md p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-text-primary text-base font-semibold">Threshold Calibration Register</h2>
          <span className="text-text-muted text-[11px]">
            {thresholdItems !== null ? `${thresholdItems.length} metrics` : "60 metrics (PO only)"}
          </span>
        </div>
        {thresholdItems === null ? (
          <StubCard title="Threshold Calibration Register" />
        ) : (
          <>
            <table className="w-full text-xs" data-testid="threshold-register-table">
              <thead>
                <tr className="text-text-muted border-b border-border-subtle">
                  <th className="text-left p-2 font-medium">Metric</th>
                  <th className="text-left p-2 font-medium">Direction</th>
                  <th className="text-left p-2 font-medium">Green</th>
                  <th className="text-left p-2 font-medium">Amber</th>
                  <th className="text-left p-2 font-medium">Red</th>
                  <th className="text-left p-2 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {thresholdItems.slice(0, 5).map((item) => (
                  <tr key={item.metric_id} className="border-b border-border-subtle hover:bg-border-subtle/20">
                    <td className="p-2 font-mono text-[11px] text-text-primary">{item.metric_id}</td>
                    <td className="p-2 text-text-secondary">{directionLabel(item.direction)}</td>
                    <td className="p-2 font-mono text-status-green">{item.green_threshold ?? "--"}</td>
                    <td className="p-2 font-mono text-status-amber">{item.amber_threshold ?? "--"}</td>
                    <td className="p-2 font-mono text-status-red">{item.red_threshold ?? "--"}</td>
                    <td className="p-2 text-text-muted">{item.owning_role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-3 text-accent-gold text-xs hover:underline cursor-pointer">
              View all {thresholdItems.length} metrics
            </button>
          </>
        )}
      </div>

      <div className="col-span-5 bg-bg-surface border border-accent-gold/40 rounded-md p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-text-primary text-base font-semibold">Tier Config Admin</h2>
            <p className="text-text-muted text-[11px] mt-0.5">
              Portfolio Owner only. Read-only. Edit via Settings.
            </p>
          </div>
          <span className="px-2 py-0.5 bg-accent-gold/20 text-accent-gold rounded text-[10px] font-semibold">
            PO ONLY
          </span>
        </div>
        {tierConfigItems === null ? (
          <StubCard title="Tier Config Admin" />
        ) : (
          <table className="w-full text-xs" data-testid="tier-config-table">
            <thead>
              <tr className="text-text-muted border-b border-border-subtle">
                <th className="text-left p-2 font-medium">Tier</th>
                <th className="text-left p-2 font-medium">Default label</th>
                <th className="text-left p-2 font-medium">Display label</th>
                <th className="text-left p-2 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {tierConfigItems.map((item) => (
                <tr key={item.tier_number} className="border-b border-border-subtle">
                  <td className="p-2 font-mono text-text-primary">{item.tier_number}</td>
                  <td className="p-2 text-text-muted">{item.default_label}</td>
                  <td className="p-2 text-text-primary font-medium">{item.display_label}</td>
                  <td className="p-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-status-green" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-[10px] text-text-subtle">
          PATCH wiring is a dedicated future slice. Display-only in this release.
        </p>
      </div>

    </section>
  );
}
