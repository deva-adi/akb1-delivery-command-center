/**
 * Intervention playbook cards for programmes in the INTERVENE zone.
 * All cards are static stubs from wireframe v1_13.
 * TODO: replace with live intervention-playbook endpoint when client_signals entity lands.
 */

const PLAYBOOK_CARDS = [
  {
    programme: "Pegasus Healthcare",
    primary: "Executive save meeting with client CRO",
    secondary: "Assign dedicated relationship manager",
    tags: ["SLA breach", "Missed exec 2x"],
  },
  {
    programme: "Phoenix Pharma",
    primary: "Neutral third-party relationship audit",
    secondary: "Joint regulatory task force",
    tags: ["Compliance pressure", "Ticket age rising"],
  },
  {
    programme: "Stellar Logistics",
    primary: "Daily sponsor standups",
    secondary: "Quick-win delivery in 30 days",
    tags: ["Scope disputes", "Sentiment drop"],
  },
  {
    programme: "Orion Insurance",
    primary: "Executive business review with joint roadmap refresh",
    secondary: "Ticket age recovery sprint",
    tags: ["NPS sliding", "Missed exec 1x"],
  },
] as const;

const RELATED_TABS = [
  { label: "Risk and RAID", href: "/home/risk-raid" },
  { label: "Ops and SLA", href: "/home/ops-sla" },
  { label: "Commercial Pipeline", href: "/home" },
] as const;

export function ClientInterventionPlaybook() {
  return (
    <div data-testid="client-intervention-playbook">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-text-primary text-sm font-semibold">Intervention Playbook</h3>
          <p className="text-text-muted text-xs mt-0.5">
            Four programmes in intervene zone
          </p>
        </div>
        <span className="px-2 py-0.5 bg-text-subtle/10 rounded text-[10px] text-text-subtle uppercase font-medium">
          stub
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {PLAYBOOK_CARDS.map((card) => (
          <div
            key={card.programme}
            className="bg-bg-surface border border-border-subtle rounded-lg p-4"
            data-stub="true"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-text-primary text-sm font-semibold">{card.programme}</p>
              <span className="text-status-red text-[10px] font-semibold uppercase ml-2 shrink-0">
                INTERVENE
              </span>
            </div>
            <p className="text-text-primary text-sm font-medium mb-1 leading-snug">
              {card.primary}
            </p>
            <p className="text-text-secondary text-xs mb-3 leading-snug">
              {card.secondary}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-status-red/10 border border-status-red/20 rounded text-[10px] text-status-red font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-text-muted text-[11px]">Related tabs:</span>
        {RELATED_TABS.map((tab, idx) => (
          <span key={tab.label} className="flex items-center gap-2">
            <a
              href={tab.href}
              className="text-text-secondary text-[11px] underline underline-offset-2 hover:text-text-primary transition"
            >
              {tab.label}
            </a>
            {idx < RELATED_TABS.length - 1 && (
              <span className="text-border-strong text-[11px]">|</span>
            )}
          </span>
        ))}
      </div>

      <p className="mt-2 text-text-muted text-[11px]">
        {/* TODO: replace with live intervention-playbook endpoint when client_signals entity lands */}
        Cards are static wireframe stubs. Live playbook requires client_signals entity.
      </p>
    </div>
  );
}
