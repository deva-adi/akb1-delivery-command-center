/**
 * AP flag gating E2E spec.
 * Covers the two distinct access patterns on AI Governance:
 *   FULL_AP  -- PO/DD with apFlag true: full page + pending backlog visible
 *   AGGREGATE -- PO/DD with apFlag false: all panels present, detail locked
 *
 * These tests verify the boundary between the two patterns, not just the
 * component-level logic (which is covered by Vitest in ai-governance-utils).
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("PO with AP sees pending red backlog table", async ({ page }) => {
  await loginAs(page, "PortfolioOwner", true);
  await page.goto("/home/ai-governance");
  const pendingBacklog = page.locator('[data-testid="ai-gov-pending-backlog"]');
  await expect(pendingBacklog).toBeVisible();
  await expect(pendingBacklog.getByText("Pending Red-Tier Backlog")).toBeVisible();
});

test("PO without AP sees locked message instead of pending backlog detail", async ({ page }) => {
  await loginAs(page, "PortfolioOwner", false);
  await page.goto("/home/ai-governance");
  await expect(page.getByText("Audit Permission required")).toBeVisible();
  await expect(
    page.getByText("Audit Permission required to view pending Red-tier backlog.")
  ).toBeVisible();
});

test("DD with AP sees full ai-governance including risk tier matrix", async ({ page }) => {
  await loginAs(page, "DeliveryDirector", true);
  await page.goto("/home/ai-governance");
  await expect(page.locator('[data-testid="ai-gov-risk-tier-matrix"]')).toBeVisible();
  await expect(page.locator('[data-testid="ai-gov-intelligence-card"]')).toBeVisible();
});

test("DD without AP sees aggregate view with locked quality gates", async ({ page }) => {
  await loginAs(page, "DeliveryDirector", false);
  await page.goto("/home/ai-governance");
  await expect(page.locator('[data-testid="ai-gov-intelligence-card"]')).toBeVisible();
  await expect(page.locator('[data-testid="ai-gov-quality-gates"]')).toBeVisible();
  await expect(
    page.getByText("Audit Permission required to view quality gate detail.")
  ).toBeVisible();
});
