/**
 * Capability and Supply Chain tab -- M7 + M10-4.
 *
 * Route: /home/capability-supply-chain (nested under home/layout.tsx).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, HRBusinessPartner.
 * Redirect to /home: ProgrammeManager, ReadOnly, FinanceLead.
 *
 * Search params:
 *   ?p=CODE   -- scope pyramid and sentiment list to programme-assigned people
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
  isCapabilityAllowed,
  buildPyramidBands,
  buildSentimentList,
  buildCapabilityWhat,
  buildPeopleUrl,
  type PeopleListResponse,
} from "@/lib/capability";
import { FilterChip } from "@/components/drill/FilterChip";
import { PeopleListPanel } from "@/components/PeopleListPanel";
import { CapabilityIntelligenceCard } from "@/components/CapabilityIntelligenceCard";
import { CapabilityKPIGrid } from "@/components/CapabilityKPIGrid";
import { CapabilityBenchDive } from "@/components/CapabilityBenchDive";
import { CapabilitySkillsSection } from "@/components/CapabilitySkillsSection";
import { CapabilityDMSuccession } from "@/components/CapabilityDMSuccession";
import { CapabilityDMRetention } from "@/components/CapabilityDMRetention";
import { CapabilityHiringFunnel } from "@/components/CapabilityHiringFunnel";
import { CapabilityPyramidShift } from "@/components/CapabilityPyramidShift";
import { CapabilityMarginLiteracy } from "@/components/CapabilityMarginLiteracy";

export default async function CapabilityPage({
  searchParams,
}: {
  searchParams: { p?: string; band?: string };
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isCapabilityAllowed(user.role)) redirect("/home");

  const activeProgamme = typeof searchParams.p === "string" ? searchParams.p : null;
  const activeBand = typeof searchParams.band === "string" ? searchParams.band : null;

  // Pyramid fetch: programme-scoped (all bands shown for context).
  let pyramidPeople: PeopleListResponse["items"] = [];
  try {
    const data = await callBackend<PeopleListResponse>(
      buildPeopleUrl(activeProgamme, null),
    );
    pyramidPeople = data.items;
  } catch {
    // Render with empty people array; sections show zero counts.
  }

  // List fetch: programme + band intersection. Only when ?band= is active.
  let listPeople: PeopleListResponse["items"] | null = null;
  if (activeBand !== null) {
    try {
      const data = await callBackend<PeopleListResponse>(
        buildPeopleUrl(activeProgamme, activeBand),
      );
      listPeople = data.items;
    } catch {
      listPeople = [];
    }
  }

  const dist = buildPyramidBands(pyramidPeople);
  // sentimentList is automatically scoped to programme via pyramidPeople.
  const sentimentList = buildSentimentList(pyramidPeople);
  const intel = buildCapabilityWhat(pyramidPeople);

  // clearBandHref preserves ?p= when clearing the band filter.
  const clearBandHref = activeProgamme
    ? `/home/capability-supply-chain?p=${activeProgamme}`
    : "/home/capability-supply-chain";

  return (
    <div className="grid gap-0 -mx-8 -mt-8">
      <CapabilityIntelligenceCard intel={intel} />

      <main className="px-8 py-8">
        <CapabilityKPIGrid />

        <CapabilityBenchDive />

        <section className="grid grid-cols-12 gap-6 mb-8">
          <CapabilitySkillsSection />
          <CapabilityDMSuccession />
        </section>

        <section className="grid grid-cols-12 gap-6 mb-8">
          <CapabilityHiringFunnel />
          <CapabilityPyramidShift
            dist={dist}
            activeProgamme={activeProgamme}
            activeBand={activeBand}
          />
          <CapabilityMarginLiteracy sentimentList={sentimentList} />
        </section>

        {/* People list: renders when ?band= is set */}
        {listPeople !== null && (
          <section className="mb-8" data-testid="capability-people-section">
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

        <CapabilityDMRetention userRole={user.role} />
      </main>
    </div>
  );
}
