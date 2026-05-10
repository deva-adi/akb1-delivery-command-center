/**
 * Financials tab -- M7-12.
 *
 * Route: /home/financials (nested under home/layout.tsx, inherits JWT guard
 * and role-aware nav).
 *
 * Allowed roles: PortfolioOwner, ProgrammeManager, FinanceLead, ReadOnly.
 * DeliveryDirector, HRBusinessPartner redirect to /home.
 * Source: PRD 08 section 2 (DD not listed; HRBP not listed; FL is primary;
 * PM scoped -- scoping deferred until financials_monthly lands, per D-055).
 *
 * Data fetch: Promise.allSettled over all 10 PROGRAMME_CODES for health and
 * milestones. financials_monthly not yet seeded; tab is mostly stub.
 * 403s silently discarded.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { PROGRAMME_CODES } from "@/lib/raids";
import {
  isFinancialsAllowed,
  buildFinancialsWhat,
  buildProgrammeFinancialStates,
} from "@/lib/financials";
import type { HealthListResponse, MilestoneListResponse } from "@/lib/delivery-health";
import { FinancialsIntelligenceCard } from "@/components/FinancialsIntelligenceCard";
import { FinancialsKPIGrid } from "@/components/FinancialsKPIGrid";
import { FinancialsRevenueStack } from "@/components/FinancialsRevenueStack";
import { FinancialsCostBreakdown } from "@/components/FinancialsCostBreakdown";
import { FinancialsProgrammeTable } from "@/components/FinancialsProgrammeTable";
import { FinancialsBenchTax } from "@/components/FinancialsBenchTax";
import { FinancialsRev4Section } from "@/components/FinancialsRev4Section";

export default async function FinancialsPage(): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isFinancialsAllowed(user.role)) redirect("/home");

  const [healthResults, milestoneResults] = await Promise.all([
    Promise.allSettled(
      PROGRAMME_CODES.map((code) =>
        callBackend<HealthListResponse>(`/api/v1/programmes/${code}/health`),
      ),
    ),
    Promise.allSettled(
      PROGRAMME_CODES.map((code) =>
        callBackend<MilestoneListResponse>(`/api/v1/programmes/${code}/milestones`),
      ),
    ),
  ]);

  const healthByProgramme: Record<string, NonNullable<HealthListResponse["items"]>> = {};
  for (let i = 0; i < healthResults.length; i++) {
    const r = healthResults[i];
    const code = PROGRAMME_CODES[i];
    if (r?.status === "fulfilled" && code !== undefined) {
      healthByProgramme[code] = r.value.items;
    }
  }

  const allMilestones = milestoneResults
    .filter(
      (r): r is PromiseFulfilledResult<MilestoneListResponse> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value.items);

  const hasError =
    healthResults.some(
      (r) =>
        r.status === "rejected" &&
        !(r.reason instanceof BackendError && r.reason.status === 403),
    ) ||
    milestoneResults.some(
      (r) =>
        r.status === "rejected" &&
        !(r.reason instanceof BackendError && r.reason.status === 403),
    );

  const intel = buildFinancialsWhat(healthByProgramme, allMilestones);
  const programmeStates = buildProgrammeFinancialStates(healthByProgramme);

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <FinancialsIntelligenceCard intel={intel} />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <section className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-text-primary text-base font-semibold">Financials</h2>
          <span className="text-text-subtle text-xs font-mono">
            {intel.visibleProgrammes} programme{intel.visibleProgrammes !== 1 ? "s" : ""} visible
            {" "}| financials_monthly not seeded
          </span>
        </div>
        <FinancialsKPIGrid />
      </section>

      <section className="px-8 pb-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <FinancialsRevenueStack />
          </div>
          <div>
            <FinancialsCostBreakdown />
          </div>
        </div>
      </section>

      <section className="px-8 pb-6">
        <FinancialsProgrammeTable states={programmeStates} />
      </section>

      <section className="px-8 pb-6">
        <FinancialsBenchTax />
      </section>

      <FinancialsRev4Section />
    </div>
  );
}
