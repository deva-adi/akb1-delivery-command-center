/**
 * Auth helpers for Playwright E2E tests.
 *
 * Live-stack mode (default): mints a real HS256 JWT signed with the same
 * JWT_SECRET the Next.js process uses. This lets middleware.ts verify the token
 * and pass the request through to /home without needing a real users table or
 * a running login endpoint.
 *
 * Real-auth mode (PLAYWRIGHT_USE_REAL_AUTH=true): POSTs credentials to the
 * backend /api/v1/auth/login endpoint and uses the returned signed cookie.
 */

import type { Page } from "@playwright/test";
import { SignJWT } from "jose";

const SESSION_COOKIE = "akb1_session";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const JWT_SECRET =
  process.env.JWT_SECRET ?? "replace_with_long_random_string_before_deploy";

const ROLE_CREDENTIALS: Record<string, { email: string; password: string }> = {
  PortfolioOwner:    { email: "po@akb1.test",   password: "test-secret" },
  DeliveryDirector:  { email: "dd@akb1.test",   password: "test-secret" },
  ProgrammeManager:  { email: "pm@akb1.test",   password: "test-secret" },
  FinanceLead:       { email: "fl@akb1.test",   password: "test-secret" },
  HRBusinessPartner: { email: "hrbp@akb1.test", password: "test-secret" },
  ReadOnly:          { email: "ro@akb1.test",   password: "test-secret" },
};

// UUIDs must be valid RFC 4122 values -- backend does uuid.UUID(payload["sub"])
// and rejects the token with 401 if the value is not a valid UUID.
const ROLE_SUBS: Record<string, string> = {
  PortfolioOwner:    "00000000-0000-0000-0000-000000000001",
  DeliveryDirector:  "00000000-0000-0000-0000-000000000002",
  ProgrammeManager:  "00000000-0000-0000-0000-000000000003",
  FinanceLead:       "00000000-0000-0000-0000-000000000004",
  HRBusinessPartner: "00000000-0000-0000-0000-000000000005",
  ReadOnly:          "00000000-0000-0000-0000-000000000006",
};

async function mintToken(role: string, apFlag: boolean): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const sub = ROLE_SUBS[role] ?? `user-${role.toLowerCase()}-001`;
  return new SignJWT({ role, ap_flag: apFlag })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

export async function loginAs(
  page: Page,
  role: string,
  apFlag = false,
): Promise<void> {
  const useRealAuth = process.env.PLAYWRIGHT_USE_REAL_AUTH === "true";

  if (useRealAuth) {
    const creds = ROLE_CREDENTIALS[role];
    if (!creds) throw new Error(`No test credentials for role: ${role}`);
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel("Email").fill(creds.email);
    await page.getByLabel("Password").fill(creds.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(`${BASE_URL}/home`);
    return;
  }

  const token = await mintToken(role, apFlag);

  await page.context().addCookies([
    {
      name: SESSION_COOKIE,
      value: token,
      url: BASE_URL,
      httpOnly: true,
      sameSite: "Strict",
    },
  ]);
}

export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies();
}
