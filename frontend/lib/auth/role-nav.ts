/**
 * Per-role primary 5-tab navigation map.
 *
 * Source of truth: Master PRD revision 3 section R3.3 (Per-role primary
 * nav). Six roles, each with exactly 5 tabs. All 18 tabs reachable via a
 * More menu regardless of role; primary nav is render-only convenience.
 *
 * The backend access matrix in 01_PRD_Data_Model.md section 3.1.10 is
 * authoritative; this map is for layout selection only.
 */

export const ROLES = [
  "PortfolioOwner",
  "DeliveryDirector",
  "ProgrammeManager",
  "FinanceLead",
  "HRBusinessPartner",
  "ReadOnly",
] as const;

export type Role = (typeof ROLES)[number];

export type TabKey =
  | "executive"
  | "delivery-health"
  | "risk-raid"
  | "workforce"
  | "financials"
  | "pnl-cockpit"
  | "flow-velocity"
  | "ai-innovation"
  | "commercial"
  | "backlog-health"
  | "scenario-planner"
  | "ops-sla"
  | "multi-vendor"
  | "change-impact"
  | "client-health"
  | "governance-operating-model"
  | "capability-supply-chain"
  | "ai-governance"
  | "onboarding-first-90-days"
  | "notifications";

export interface NavItem {
  key: TabKey;
  label: string;
  href: string;
}

const TAB_LABELS: Record<TabKey, string> = {
  executive: "Executive",
  "delivery-health": "Delivery Health",
  "risk-raid": "Risk and RAID",
  workforce: "Workforce",
  financials: "Financials",
  "pnl-cockpit": "P and L Cockpit",
  "flow-velocity": "Flow and Velocity",
  "ai-innovation": "AI and Innovation",
  commercial: "Commercial",
  "backlog-health": "Backlog Health",
  "scenario-planner": "Scenario Planner",
  "ops-sla": "Ops and SLA",
  "multi-vendor": "Multi-Vendor",
  "change-impact": "Change Impact",
  "client-health": "Client Health",
  "governance-operating-model": "Governance",
  "capability-supply-chain": "Capability",
  "ai-governance": "AI Governance",
  "onboarding-first-90-days": "First 90 Days",
  notifications: "Notifications",
};

function nav(...keys: TabKey[]): NavItem[] {
  return keys.map((key) => ({
    key,
    label: TAB_LABELS[key],
    href: `/home/${key}`,
  }));
}

export const ROLE_PRIMARY_NAV: Record<Role, NavItem[]> = {
  PortfolioOwner: nav(
    "executive",
    "governance-operating-model",
    "financials",
    "capability-supply-chain",
    "client-health",
  ),
  DeliveryDirector: nav(
    "executive",
    "governance-operating-model",
    "delivery-health",
    "capability-supply-chain",
    "ops-sla",
  ),
  ProgrammeManager: nav(
    "delivery-health",
    "flow-velocity",
    "governance-operating-model",
    "risk-raid",
    "ops-sla",
  ),
  FinanceLead: nav(
    "financials",
    "pnl-cockpit",
    "commercial",
    "scenario-planner",
    "change-impact",
  ),
  HRBusinessPartner: nav(
    "capability-supply-chain",
    "workforce",
    "executive",
    "onboarding-first-90-days",
    "notifications",
  ),
  ReadOnly: nav(
    "executive",
    "delivery-health",
    "financials",
    "governance-operating-model",
    "client-health",
  ),
};

export function navForRole(role: Role): NavItem[] {
  return ROLE_PRIMARY_NAV[role];
}

export function isKnownRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}
