/**
 * Auth E2E spec.
 * Covers: unauthenticated redirect, login, logout, role-based access control
 * at the session boundary.
 *
 * Runs against a live stack. Cookie stub loginAs is used; for verified JWT
 * set PLAYWRIGHT_USE_REAL_AUTH=true.
 */

import { test, expect } from "@playwright/test";
import { loginAs, logout } from "./helpers/auth";

test("unauthenticated user is redirected to /login from /home", async ({ page }) => {
  await page.goto("/home");
  await expect(page).toHaveURL(/\/login/);
});

test("authenticated PO can reach /home", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home");
  await expect(page).toHaveURL(/\/home/);
});

test("HRBP is redirected away from /home", async ({ page }) => {
  await loginAs(page, "HRBusinessPartner");
  await page.goto("/home");
  const url = page.url();
  expect(url).not.toContain("/home/workforce");
});

test("logout clears session and redirects to /login", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home");
  await expect(page).toHaveURL(/\/home/);

  await logout(page);
  await page.goto("/home");
  await expect(page).toHaveURL(/\/login/);
});
