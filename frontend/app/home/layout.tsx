import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { callBackend } from "@/lib/api-client/fetcher";
import { RoleAwareNav } from "@/components/RoleAwareNav";
import { RoleBadge } from "@/components/RoleBadge";
import { Breadcrumb } from "@/components/drill/Breadcrumb";
import { ProgrammeFilterBar } from "@/components/drill/ProgrammeFilterBar";
import type { ProgrammeListItem } from "@/components/drill/ProgrammeFilterBar";

interface ProgrammeListResponse {
  items: ProgrammeListItem[];
  count: number;
}

async function FilterBarLoader(): Promise<JSX.Element> {
  const result = await callBackend<ProgrammeListResponse>("/api/v1/programmes").catch(
    () => ({ items: [], count: 0 } as ProgrammeListResponse),
  );
  return <ProgrammeFilterBar initialProgrammes={result.items} />;
}

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = token.length > 0 ? await decodeSessionToken(token) : null;
  if (user === null) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border-subtle bg-bg-surface">
        <div className="max-w-[1440px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-accent-gold grid place-items-center">
              <span className="text-bg-base font-bold text-sm">A1</span>
            </div>
            <div>
              <div className="text-text-primary font-semibold text-sm tracking-tight">
                AKB1 Delivery Command Center
              </div>
              <div className="text-text-muted text-xs">Programme delivery intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Suspense fallback={null}>
              <Breadcrumb />
            </Suspense>
            <RoleBadge role={user.role} apFlag={user.apFlag} />
          </div>
        </div>
        <RoleAwareNav role={user.role} />
      </header>
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-8 py-8">
        <Suspense fallback={<div className="h-9 mb-5" aria-hidden="true" />}>
          <FilterBarLoader />
        </Suspense>
        {children}
      </main>
    </div>
  );
}
