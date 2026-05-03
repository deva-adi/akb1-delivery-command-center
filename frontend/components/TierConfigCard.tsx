import { BackendError, callBackend } from "@/lib/api-client/fetcher";
import type { CurrentUser } from "@/lib/auth/session";

interface TierConfigItem {
  tier_number: number;
  default_label: string;
  display_label: string;
}

interface TierConfigList {
  items: TierConfigItem[];
}

interface TierConfigCardProps {
  user: CurrentUser;
}

export async function TierConfigCard({ user }: TierConfigCardProps): Promise<JSX.Element> {
  if (user.role !== "PortfolioOwner") {
    return <StubCard role={user.role} />;
  }

  let payload: TierConfigList | null = null;
  let error: BackendError | null = null;
  try {
    payload = await callBackend<TierConfigList>("/api/v1/admin/tier-config");
  } catch (err) {
    if (err instanceof BackendError) {
      error = err;
    } else {
      throw err;
    }
  }

  return (
    <section
      data-testid="tier-config-card"
      data-state={payload !== null ? "loaded" : "error"}
      className="bg-bg-surface border border-border-subtle rounded-lg p-6"
    >
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-text-primary text-lg font-semibold tracking-tight">
            Escalation tier configuration
          </h2>
          <p className="text-text-muted text-xs mt-0.5">
            Five-tier ladder. Source: GET /api/v1/admin/tier-config (PO only).
          </p>
        </div>
      </header>
      {error !== null ? (
        <p className="text-status-red text-sm">
          Backend {error.status}: {error.detail}
        </p>
      ) : null}
      {payload !== null ? (
        <ul className="grid gap-2">
          {payload.items.map((tier) => (
            <li
              key={tier.tier_number}
              className="flex items-center justify-between bg-bg-surface-subtle border border-border-subtle rounded-md px-3 py-2"
            >
              <span className="text-text-muted font-mono text-xs tabular">
                Tier {tier.tier_number}
              </span>
              <span className="text-text-primary text-sm font-medium">
                {tier.display_label}
              </span>
              <span className="text-text-subtle text-xs">{tier.default_label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function StubCard({ role }: { role: string }): JSX.Element {
  return (
    <section
      data-testid="tier-config-card"
      data-state="stub"
      className="bg-bg-surface border border-border-subtle rounded-lg p-6"
    >
      <header className="mb-2">
        <h2 className="text-text-primary text-lg font-semibold tracking-tight">
          Welcome
        </h2>
        <p className="text-text-muted text-xs mt-0.5">
          Role: {role}. Tab content lands in the next M7 slice.
        </p>
      </header>
      <p className="text-text-secondary text-sm">
        Tier configuration is portfolio-owner only. The Portfolio Owner role
        sees the populated five-tier ladder here.
      </p>
    </section>
  );
}
