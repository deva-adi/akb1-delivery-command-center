/**
 * Auth helpers for Playwright E2E tests.
 *
 * Cookie stub approach: the real backend JWT requires HS256 signing with
 * JWT_SECRET. Instead of re-implementing signing in test helpers, we set a
 * base64url-encoded JSON payload in the akb1_session cookie. The Next.js
 * decodeSessionToken will fail verification on unsigned tokens and return null,
 * redirecting to /login.
 *
 * For tests against a live stack: start the backend and call the real login
 * endpoint (POST /api/auth/login) to obtain a signed token. The loginAs
 * function below falls back to the real endpoint when PLAYWRIGHT_USE_REAL_AUTH
 * env var is set to "true".
 *
 * Without a live stack (tsc-only CI), this file compiles and exports cleanly.
 */

import type { Page } from "@playwright/test";

const SESSION_COOKIE = "akb1_session";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

const ROLE_CREDENTIALS: Record<string, { email: string; password: string }> = {
  PortfolioOwner:    { email: "po@akb1.test",   password: "test-secret" },
  DeliveryDirector:  { email: "dd@akb1.test",   password: "test-secret" },
  ProgrammeManager:  { email: "pm@akb1.test",   password: "test-secret" },
  FinanceLead:       { email: "fl@akb1.test",   password: "test-secret" },
  HRBusinessPartner: { email: "hrbp@akb1.test", password: "test-secret" },
  ReadOnly:          { email: "ro@akb1.test",   password: "test-secret" },
};

/**
 * Log in as the given role. When PLAYWRIGHT_USE_REAL_AUTH=true and the stack
 * is running, POSTs to /api/auth/login and lets the backend plant a real signed
 * JWT cookie. Otherwise sets a cookie stub (unsigned) that keeps the browser
 * session state consistent across test steps even though the token cannot be
 * verified server-side.
 */
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

  const payload = { role, ap_flag: apFlag };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const stubToken = `stub.${encoded}.stub`;

  await page.context().addCookies([
    {
      name: SESSION_COOKIE,
      value: stubToken,
      url: BASE_URL,
      httpOnly: true,
      sameSite: "Strict",
    },
  ]);
}

/**
 * Clear the session cookie to simulate logout.
 */
export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies();
}
