import type { Role } from "@/lib/auth/role-nav";

const ROLE_DISPLAY: Record<Role, string> = {
  PortfolioOwner: "Portfolio Owner",
  DeliveryDirector: "Delivery Director",
  ProgrammeManager: "Programme Manager",
  FinanceLead: "Finance Lead",
  HRBusinessPartner: "HR Business Partner",
  ReadOnly: "Read Only",
};

interface RoleBadgeProps {
  role: Role;
  apFlag: boolean;
}

export function RoleBadge({ role, apFlag }: RoleBadgeProps): JSX.Element {
  return (
    <div
      data-testid="role-badge"
      data-role={role}
      data-ap={apFlag ? "true" : "false"}
      className="relative inline-flex items-center gap-2 bg-bg-surface-elevated border border-border-subtle rounded-md px-3 py-1.5"
    >
      <span className="text-text-secondary text-xs uppercase tracking-wider">
        {ROLE_DISPLAY[role]}
      </span>
      {apFlag ? (
        <span
          aria-label="Audit permission enabled"
          title="Audit permission enabled"
          className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent-gold"
        />
      ) : null}
    </div>
  );
}
