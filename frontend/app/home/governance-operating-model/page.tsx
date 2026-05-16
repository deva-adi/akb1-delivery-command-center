/**
 * Governance Operating Model tab -- M7-6.
 *
 * Route: /home/governance-operating-model (nested under home/layout.tsx).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, ProgrammeManager,
 *                HRBusinessPartner, ReadOnly.
 * Redirect to /home: FinanceLead.
 * Source: Data Model PRD section 3.1.10 access matrix.
 *
 * Data fetch:
 *   All roles: health + milestones for all 10 PROGRAMME_CODES in parallel
 *              (for over-optimism detection).
 *   PO only:   tier-config + threshold-register (both PO-gated endpoints).
 *
 * Admin panels are read-only display. PATCH wiring is a dedicated future slice.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { PROGRAMME_CODES } from "@/lib/raids";
import type { MilestoneListResponse, HealthListResponse } from "@/lib/delivery-health";
import {
  isGovAllowed,
  buildOverOptimismList,
} from "@/lib/governance";
import type { TierConfigListResponse, ThresholdListResponse } from "@/lib/governance";
import { GovIntelligenceCard } from "@/components/GovIntelligenceCard";
import { GovKPIGrid } from "@/components/GovKPIGrid";
import { GovCadenceCalendar } from "@/components/GovCadenceCalendar";
import { GovRACIMatrix } from "@/components/GovRACIMatrix";
import { GovDecisionQueue } from "@/components/GovDecisionQueue";
import { GovPreReadSection } from "@/components/GovPreReadSection";
import { GovStakeholderSection } from "@/components/GovStakeholderSection";
import { GovAdminSection } from "@/components/GovAdminSection";

export default async function GovernancePage({
  searchParams,
}: {
  searchParams: { p?: string };
}): Promise<JSX.Element> {
  const activeProgramme = typeof searchParams.p === "string" ? searchParams.p : null;
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isGovAllowed(user.role)) redirect("/home");

  const isPO = user.role === "PortfolioOwner";

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

  const allHealth = healthResults
    .filter((r): r is PromiseFulfilledResult<HealthListResponse> => r.status === "fulfilled")
    .flatMap((r) => r.value.items);

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

  const overOptimismRows = buildOverOptimismList(allHealth, allMilestones);
  const flaggedCount = overOptimismRows.filter((r) => r.flagged).length;
  const visibleProgrammes = new Set(allHealth.map((h) => h.programme_code)).size;

  let tierConfigItems = null;
  let thresholdItems = null;

  if (isPO) {
    const [tierResult, thresholdResult] = await Promise.allSettled([
      callBackend<TierConfigListResponse>("/api/v1/admin/tier-config"),
      callBackend<ThresholdListResponse>("/api/v1/admin/threshold-register"),
    ]);
    if (tierResult.status === "fulfilled") tierConfigItems = tierResult.value.items;
    if (thresholdResult.status === "fulfilled") thresholdItems = thresholdResult.value.items;
  }

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <GovIntelligenceCard
        flaggedCount={flaggedCount}
        visibleProgrammes={visibleProgrammes}
        userRole={user.role}
      />

      {hasError && (
        <div className="mx-8 mt-6">
          <p className="text-status-red text-xs bg-status-red/10 border border-status-red/30 rounded-md px-4 py-2">
            Some programme data could not be loaded. Showing partial results.
          </p>
        </div>
      )}

      <main className="px-8 py-8">
        <GovKPIGrid />

        <section className="grid grid-cols-12 gap-6 mb-8">
          <GovCadenceCalendar />
          <GovRACIMatrix />
        </section>

        <GovDecisionQueue tierConfigItems={tierConfigItems} />

        <GovPreReadSection />

        <GovStakeholderSection overOptimismRows={overOptimismRows} activeProgramme={activeProgramme} />

        <GovAdminSection
          tierConfigItems={tierConfigItems}
          thresholdItems={thresholdItems}
        />
      </main>
    </div>
  );
}
