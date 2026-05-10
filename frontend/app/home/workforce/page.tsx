/**
 * Workforce Intelligence tab -- M7 slice.
 *
 * Route: /home/workforce (nested under home/layout.tsx).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, HRBusinessPartner.
 * Redirect to /home: ProgrammeManager, ReadOnly, FinanceLead.
 * Source: PRD 07 section 2 access matrix and role-nav.ts (workforce = HRBP
 * pos 2; PO and DD included per PRD full-access grant and delivery relevance).
 *
 * Data fetch (server-side):
 *   GET /api/v1/people -- all 300 people; reuses the live endpoint from M7-8.
 *   On error, page renders with empty people array; real sections show zeros.
 *
 * Real sections: Headcount KPI (people.length), Pyramid by Band (band
 *   distribution from buildPyramidBands), Intelligence card What.
 * Stub sections: 7 KPI cards, Team Sustainability Matrix, AI Impact Overlay,
 *   Attrition Radar, Attrition Watchlist, Rev 4 Utilization Reconciliation.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend } from "@/lib/api-client/fetcher";
import {
  isWorkforceAllowed,
  buildWorkforceWhat,
} from "@/lib/workforce";
import { buildPyramidBands, type PeopleListResponse } from "@/lib/capability";
import { WorkforceIntelligenceCard } from "@/components/WorkforceIntelligenceCard";
import { WorkforceKPIGrid } from "@/components/WorkforceKPIGrid";
import { WorkforceSustainabilityMatrix } from "@/components/WorkforceSustainabilityMatrix";
import { WorkforceAIOverlay } from "@/components/WorkforceAIOverlay";
import { WorkforcePyramid } from "@/components/WorkforcePyramid";
import { WorkforceAttritionRadar } from "@/components/WorkforceAttritionRadar";
import { WorkforceAttritionWatchlist } from "@/components/WorkforceAttritionWatchlist";
import { WorkforceUtilizationReconciliation } from "@/components/WorkforceUtilizationReconciliation";

export default async function WorkforcePage(): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isWorkforceAllowed(user.role)) redirect("/home");

  let people: PeopleListResponse["items"] = [];
  try {
    const data = await callBackend<PeopleListResponse>("/api/v1/people");
    people = data.items;
  } catch {
    // Render with empty people array; real sections fall back to zero counts.
  }

  const dist = buildPyramidBands(people);
  const intel = buildWorkforceWhat(people);

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
          <WorkforcePyramid dist={dist} />
          <WorkforceAttritionRadar />
        </section>

        <WorkforceAttritionWatchlist />
      </main>

      <WorkforceUtilizationReconciliation />
    </div>
  );
}
