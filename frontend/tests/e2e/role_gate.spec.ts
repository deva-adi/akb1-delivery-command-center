/**
 * Role gate E2E spec.
 * Covers: role-nav primary tab visibility, tab redirect behaviour, and
 * AP-flag gating on the AI Governance tab.
 *
 * Source of truth: lib/auth/role-nav.ts for primary nav assignments.
 * AP gating logic: lib/ai-governance.ts getAccessLevel.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("PO sees Executive tab link in primary nav", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home");
  await expect(page.getByRole("link", { name: "Executive" })).toBeVisible();
});

test("RO can reach executive tab and sees intelligence card", async ({ page }) => {
  await loginAs(page, "ReadOnly");
  await page.goto("/home/executive");
  await expect(page.locator('[data-testid="executive-intelligence-card"]')).toBeVisible();
});

test("HRBP is redirected from workforce tab", async ({ page }) => {
  await loginAs(page, "HRBusinessPartner");
  await page.goto("/home/workforce");
  await expect(page).not.toHaveURL(/\/home\/workforce/);
});

test("FL on ai-governance sees cadence section only", async ({ page }) => {
  await loginAs(page, "FinanceLead", false);
  await page.goto("/home/ai-governance");
  await expect(page.locator('[data-testid="ai-gov-cadence"]')).toBeVisible();
  await expect(page.locator('[data-testid="ai-gov-risk-tier-matrix"]')).not.toBeVisible();
});

test("PO without AP sees aggregate only on ai-governance", async ({ page }) => {
  await loginAs(page, "PortfolioOwner", false);
  await page.goto("/home/ai-governance");
  await expect(page.getByText("Audit Permission required")).toBeVisible();
});

test("PO with AP sees full ai-governance including risk tier matrix", async ({ page }) => {
  await loginAs(page, "PortfolioOwner", true);
  await page.goto("/home/ai-governance");
  await expect(page.locator('[data-testid="ai-gov-risk-tier-matrix"]')).toBeVisible();
});
