/**
 * AI Governance tab -- M7-15.
 *
 * Route: /home/ai-governance (nested under home/layout.tsx, inherits JWT
 * guard and role-aware nav).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, FinanceLead,
 * ProgrammeManager, ReadOnly.
 * HRBusinessPartner: no access -- redirect to /home (PRD section 2 explicit).
 *
 * No data fetch: all ai_* entities are absent. Only server-side operation is
 * session decode to read role and ap_flag for access-level derivation.
 * This is the first tab in M7 with zero Promise.allSettled calls.
 *
 * Access levels:
 *   FULL_AP        -- PO/DD with apFlag: full 9-panel page with per-use-case drill
 *   AGGREGATE      -- PO/DD without apFlag: full page, detail panels show AP-locked message
 *   CADENCE_ONLY   -- FL: exactly 2 panels (IntelligenceCard + Cadence)
 *   OWN_PROGRAMME  -- PM: same layout as AGGREGATE; own-programme scope deferred
 *   AGGREGATE_RO   -- RO: same layout as AGGREGATE; read-only labels
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { isAIGovAllowed, getAccessLevel } from "@/lib/ai-governance";
import { AIGovIntelligenceCard } from "@/components/AIGovIntelligenceCard";
import { AIGovKPIGrid } from "@/components/AIGovKPIGrid";
import { AIGovSurfacedCounts } from "@/components/AIGovSurfacedCounts";
import { AIGovRiskTierMatrix } from "@/components/AIGovRiskTierMatrix";
import { AIGovQualityGates } from "@/components/AIGovQualityGates";
import { AIGovCadence } from "@/components/AIGovCadence";
import {
  ShadowInventoryChart,
  FiveUnsolvableChart,
  DeliverySpeedGapChart,
} from "@/components/AIGovCharts";
import { AIGovPendingBacklog } from "@/components/AIGovPendingBacklog";

export default async function AIGovernancePage({
  searchParams,
}: {
  searchParams: { p?: string; tier?: string };
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isAIGovAllowed(user.role)) redirect("/home");

  const activeProgramme = typeof searchParams.p === "string" ? searchParams.p : null;
  const activeTier = typeof searchParams.tier === "string" ? searchParams.tier : null;

  const accessLevel = getAccessLevel(user.role, user.apFlag);

  if (accessLevel === "CADENCE_ONLY") {
    return (
      <div className="grid gap-0 -mx-8 -mt-8">
        <AIGovIntelligenceCard accessLevel={accessLevel} />
        <section className="px-8 py-6">
          <AIGovCadence />
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <AIGovIntelligenceCard accessLevel={accessLevel} />

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-base font-semibold">AI Governance</h2>
          <span className="text-text-subtle text-xs font-mono">
            ai_use_case not seeded | access: {accessLevel}
          </span>
        </div>
        <AIGovKPIGrid accessLevel={accessLevel} />
      </section>

      <section className="px-8 pb-6">
        <AIGovSurfacedCounts accessLevel={accessLevel} />
      </section>

      <section className="px-8 pb-6">
        <AIGovRiskTierMatrix
          accessLevel={accessLevel}
          activeProgramme={activeProgramme}
          activeTier={activeTier}
        />
      </section>

      <section className="px-8 pb-6">
        <AIGovQualityGates accessLevel={accessLevel} />
      </section>

      <section className="px-8 pb-6">
        <AIGovCadence />
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-3 gap-6">
          <ShadowInventoryChart />
          <FiveUnsolvableChart />
          <DeliverySpeedGapChart />
        </div>
      </section>

      <section className="px-8 pb-6">
        <AIGovPendingBacklog accessLevel={accessLevel} />
      </section>
    </div>
  );
}
