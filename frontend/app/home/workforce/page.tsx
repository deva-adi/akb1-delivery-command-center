/**
 * Workforce Intelligence tab -- M7 + M10-4.
 *
 * Route: /home/workforce (nested under home/layout.tsx).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, HRBusinessPartner.
 * Redirect to /home: ProgrammeManager, ReadOnly, FinanceLead.
 *
 * Search params:
 *   ?p=CODE   -- scope pyramid and headcount to programme-assigned people
 *   ?band=B3  -- show people list for that band below the pyramid
 *
 * Data fetches:
 *   Pyramid people: GET /api/v1/people?programme=P (or bare endpoint)
 *   List people:    GET /api/v1/people?programme=P&band=B (only when ?band= set)
 */

import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend } from "@/lib/api-client/fetcher";
import {
  isWorkforceAllowed,
  buildWorkforceWhat,
} from "@/lib/workforce";
import {
  buildPyramidBands,
  buildPeopleUrl,
  type PeopleListResponse,
} from "@/lib/capability";
import { FilterChip } from "@/components/drill/FilterChip";
import { PeopleListPanel } from "@/components/PeopleListPanel";
import { WorkforceIntelligenceCard } from "@/components/WorkforceIntelligenceCard";
import { WorkforceKPIGrid } from "@/components/WorkforceKPIGrid";
import { WorkforceSustainabilityMatrix } from "@/components/WorkforceSustainabilityMatrix";
import { WorkforceAIOverlay } from "@/components/WorkforceAIOverlay";
import { WorkforcePyramid } from "@/components/WorkforcePyramid";
import { WorkforceAttritionRadar } from "@/components/WorkforceAttritionRadar";
import { WorkforceAttritionWatchlist } from "@/components/WorkforceAttritionWatchlist";
import { WorkforceUtilizationReconciliation } from "@/components/WorkforceUtilizationReconciliation";

export default async function WorkforcePage({
  searchParams,
}: {
  searchParams: { p?: string; band?: string };
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isWorkforceAllowed(user.role)) redirect("/home");

  const activeProgramme = typeof searchParams.p === "string" ? searchParams.p : null;
  const activeBand = typeof searchParams.band === "string" ? searchParams.band : null;

  // Pyramid fetch: programme-scoped (all bands shown for context).
  let pyramidPeople: PeopleListResponse["items"] = [];
  try {
    const data = await callBackend<PeopleListResponse>(
      buildPeopleUrl(activeProgramme, null),
    );
    pyramidPeople = data.items;
  } catch {
    // Render with empty people array; sections fall back to zero counts.
  }

  // List fetch: programme + band intersection. Only when ?band= is active.
  let listPeople: PeopleListResponse["items"] | null = null;
  if (activeBand !== null) {
    try {
      const data = await callBackend<PeopleListResponse>(
        buildPeopleUrl(activeProgramme, activeBand),
      );
      listPeople = data.items;
    } catch {
      listPeople = [];
    }
  }

  const dist = buildPyramidBands(pyramidPeople);
  const intel = buildWorkforceWhat(pyramidPeople);

  // clearBandHref preserves ?p= when clearing the band filter.
  const clearBandHref = activeProgramme
    ? `/home/workforce?p=${activeProgramme}`
    : "/home/workforce";

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <WorkforceIntelligenceCard intel={intel} />

      <main className="px-8 py-6">
        <WorkforceKPIGrid headcount={intel.totalHeadcount} />

        {/* Team Sustainability + AI Overlay */}
        <section className="grid grid-cols-3 gap-6 mb-6">
          <WorkforceSustainabilityMatrix />
          <WorkforceAIOverlay />
        </section>

        {/* Pyramid + Attrition Radar */}
        <section className="grid grid-cols-3 gap-6 mb-6">
          <WorkforcePyramid
            dist={dist}
            activeProgramme={activeProgramme}
            activeBand={activeBand}
          />
          <WorkforceAttritionRadar />
        </section>

        {/* People list: renders when ?band= is set */}
        {listPeople !== null && (
          <section className="mb-6" data-testid="workforce-people-section">
            <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
              {activeBand !== null && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-text-muted text-xs font-medium">Band</span>
                  <Suspense
                    fallback={
                      <span className="text-xs text-accent-gold font-semibold">
                        {activeBand}
                      </span>
                    }
                  >
                    <FilterChip label={activeBand} paramKey="band" />
                  </Suspense>
                </div>
              )}
              <PeopleListPanel
                people={listPeople}
                activeBand={activeBand ?? ""}
                clearBandHref={clearBandHref}
              />
            </div>
          </section>
        )}

        <WorkforceAttritionWatchlist />
      </main>

      <WorkforceUtilizationReconciliation />
    </div>
  );
}
