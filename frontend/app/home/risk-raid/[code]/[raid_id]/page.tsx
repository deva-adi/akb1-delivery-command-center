import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend, BackendError } from "@/lib/api-client/fetcher";
import { isRaidAllowed } from "@/lib/raids";
import type { RaidItem } from "@/lib/raids";
import type { HealthListResponse } from "@/lib/delivery-health";
import { DrillDetailLayout } from "@/components/drill/DrillDetailLayout";

function typeBadgeClass(type: string): string {
  if (type === "Risk") return "bg-status-red/10 text-status-red border-status-red/40";
  if (type === "Issue") return "bg-status-amber/10 text-status-amber border-status-amber/40";
  if (type === "Dependency")
    return "bg-border-strong/20 text-text-primary border-border-strong/40";
  return "bg-border-subtle/20 text-text-muted border-border-subtle";
}

function severityBadgeClass(severity: string): string {
  if (severity === "Critical") return "bg-status-red text-white border-status-red";
  if (severity === "High") return "bg-status-amber text-bg-base border-status-amber";
  if (severity === "Medium")
    return "bg-border-strong/40 text-text-primary border-border-strong/40";
  return "bg-border-subtle/40 text-text-muted border-border-subtle";
}

function statusBadgeClass(status: string): string {
  if (status === "Escalated") return "bg-status-red/10 text-status-red border-status-red/40";
  if (status === "Open") return "bg-border-strong/20 text-text-primary border-border-strong/40";
  return "bg-border-subtle/20 text-text-muted border-border-subtle";
}

function ragBadgeClass(rag: string): string {
  if (rag === "Red" || rag === "Failing")
    return "bg-status-red/10 text-status-red border-status-red/40";
  if (rag === "Amber" || rag === "Watching")
    return "bg-status-amber/10 text-status-amber border-status-amber/40";
  return "bg-status-green/10 text-status-green border-status-green/40";
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-border-subtle last:border-0">
      <span className="text-text-muted text-xs">{label}</span>
      <span className="text-text-primary text-xs font-medium text-right max-w-[60%]">
        {children}
      </span>
    </div>
  );
}

export default async function RaidDetailPage({
  params,
}: {
  params: { code: string; raid_id: string };
}): Promise<JSX.Element> {
  const { code, raid_id } = params;

  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);

  if (user === null) redirect("/login");
  if (!isRaidAllowed(user.role)) redirect("/home");

  const [raidResult, healthResult] = await Promise.allSettled([
    callBackend<RaidItem>(`/api/v1/programmes/${code}/raids/${raid_id}`),
    callBackend<HealthListResponse>(`/api/v1/programmes/${code}/health`),
  ]);

  if (raidResult.status === "rejected") {
    if (
      raidResult.reason instanceof BackendError &&
      raidResult.reason.status === 404
    ) {
      notFound();
    }
    throw raidResult.reason as Error;
  }

  const raid = raidResult.value;
  const healthItems =
    healthResult.status === "fulfilled" ? healthResult.value.items : [];
  const latestRag = healthItems[0]?.overall_rag ?? null;

  return (
    <DrillDetailLayout
      title={raid.title}
      backHref={`/home/risk-raid?p=${code}`}
      backLabel={`Back to ${code}`}
    >
      <div
        className="bg-bg-surface border border-border-subtle rounded-lg p-5"
        data-testid="raid-detail-card"
      >
        <h2 className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-4">
          RAID item
        </h2>
        <div>
          <DetailRow label="Type">
            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${typeBadgeClass(raid.raid_type)}`}
            >
              {raid.raid_type}
            </span>
          </DetailRow>
          <DetailRow label="Severity">
            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${severityBadgeClass(raid.severity)}`}
            >
              {raid.severity}
            </span>
          </DetailRow>
          <DetailRow label="Status">
            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${statusBadgeClass(raid.status)}`}
              data-testid="raid-detail-status-badge"
            >
              {raid.status}
            </span>
          </DetailRow>
          <DetailRow label="Raised">{raid.raised_date}</DetailRow>
          <DetailRow label="Updated">{raid.updated_at.slice(0, 10)}</DetailRow>
          <DetailRow label="Created">{raid.created_at.slice(0, 10)}</DetailRow>
          {raid.mitigation_date && (
            <DetailRow label="Mitigation date">{raid.mitigation_date}</DetailRow>
          )}
        </div>

        {raid.description && (
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-2">
              Description
            </p>
            <p className="text-text-secondary text-xs leading-relaxed">
              {raid.description}
            </p>
          </div>
        )}
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg p-5">
        <h2 className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-4">
          Programme
        </h2>
        <div>
          <DetailRow label="Programme code">{code}</DetailRow>
          <DetailRow label="Health state">
            {latestRag !== null ? (
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${ragBadgeClass(latestRag)}`}
                data-testid="raid-detail-health-badge"
              >
                {latestRag}
              </span>
            ) : (
              <span className="text-text-subtle text-xs">No snapshot</span>
            )}
          </DetailRow>
        </div>
      </div>
    </DrillDetailLayout>
  );
}
