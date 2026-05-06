/**
 * Capability and Supply Chain tab -- M7 slice.
 *
 * Route: /home/capability-supply-chain (nested under home/layout.tsx).
 *
 * Allowed roles: PortfolioOwner, DeliveryDirector, HRBusinessPartner.
 * Redirect to /home: ProgrammeManager, ReadOnly, FinanceLead.
 * Source: PRD 24 section 2. PM/RO/FL partial access per PRD requires
 * bench_roster, skill_demand_signals, and hiring_funnel entities not yet
 * seeded; deferred to a future slice.
 *
 * Data fetch (server-side):
 *   GET /api/v1/people -- all 300 people; no pagination.
 *   On backend error, page renders with empty people array (all real sections
 *   fall back to zero counts; stub sections are unaffected).
 *
 * Real sections: Pyramid Shift (band distribution from people data),
 *                Intelligence card What (total headcount + band line).
 * Stub sections: 8 KPI cards, Bench Deep Dive, Skills Heat Map,
 *                Bench-to-Demand Match, DM Succession, DM Retention,
 *                Hiring Funnel, Margin Literacy.
 */

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
  type PeopleListResponse,
} from "@/lib/capability";
import { CapabilityIntelligenceCard } from "@/components/CapabilityIntelligenceCard";
import { CapabilityKPIGrid } from "@/components/CapabilityKPIGrid";
import { CapabilityBenchDive } from "@/components/CapabilityBenchDive";
import { CapabilitySkillsSection } from "@/components/CapabilitySkillsSection";
import { CapabilityDMSuccession } from "@/components/CapabilityDMSuccession";
import { CapabilityDMRetention } from "@/components/CapabilityDMRetention";
import { CapabilityHiringFunnel } from "@/components/CapabilityHiringFunnel";
import { CapabilityPyramidShift } from "@/components/CapabilityPyramidShift";
import { CapabilityMarginLiteracy } from "@/components/CapabilityMarginLiteracy";

export default async function CapabilityPage(): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isCapabilityAllowed(user.role)) redirect("/home");

  let people: PeopleListResponse["items"] = [];
  try {
    const data = await callBackend<PeopleListResponse>("/api/v1/people");
    people = data.items;
  } catch {
    // Render with empty people array; real sections show zero counts.
  }

  const dist = buildPyramidBands(people);
  const sentimentList = buildSentimentList(people);
  const intel = buildCapabilityWhat(people);

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
          <CapabilityPyramidShift dist={dist} />
          <CapabilityMarginLiteracy sentimentList={sentimentList} />
        </section>

        <CapabilityDMRetention userRole={user.role} />
      </main>
    </div>
  );
}
