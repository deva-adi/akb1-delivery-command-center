import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";
import { TierConfigCard } from "@/components/TierConfigCard";

export default async function HomePage(): Promise<JSX.Element> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = await decodeSessionToken(token);
  if (user === null) {
    return <p className="text-text-muted">Loading session.</p>;
  }

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-text-primary text-2xl font-semibold tracking-tight">
          Home
        </h1>
        <p className="text-text-muted text-sm mt-1">
          Scaffold landing. Tab content lands in the next M7 slice.
        </p>
      </header>
      <TierConfigCard user={user} />
    </div>
  );
}
