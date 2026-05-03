import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { decodeSessionToken } from "@/lib/auth/session";

export default async function RootPage(): Promise<never> {
  const token = cookies().get(SESSION_COOKIE)?.value ?? "";
  const user = token.length > 0 ? await decodeSessionToken(token) : null;
  redirect(user !== null ? "/home" : "/login");
}
