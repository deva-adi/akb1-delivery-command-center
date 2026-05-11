/**
 * Home and tab smoke E2E spec.
 * Covers: nav rendering, tab-level page load, and intelligence card phrases.
 *
 * Tab subtitle phrases used as assertions are locked strings from the
 * intelligence card components -- changes there will require updating these
 * tests.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("home page loads and shows at least 3 tab links in nav", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home");
  const navLinks = page.getByRole("navigation").getByRole("link");
  await expect(navLinks).toHaveCount(await navLinks.count());
  expect(await navLinks.count()).toBeGreaterThanOrEqual(3);
});

test("executive tab renders intelligence card", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive");
  await expect(page.getByText("What does this tell me")).toBeVisible();
});

test("delivery-health tab loads without error boundary", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/delivery-health");
  await expect(page.getByText("Application error")).not.toBeVisible();
  await expect(page.locator("body")).not.toContainText("Something went wrong");
});

test("client-health tab shows locked tab subtitle", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health");
  await expect(
    page.getByText("Delivery excellence is the retention argument.")
  ).toBeVisible();
});

test("backlog-health tab renders for PM without error", async ({ page }) => {
  await loginAs(page, "ProgrammeManager");
  await page.goto("/home/backlog-health");
  await expect(page.getByText("Application error")).not.toBeVisible();
  await expect(page.locator('[data-testid="backlog-intelligence-card"]')).toBeVisible();
});

test("ai-governance tab renders intelligence card for PO with AP", async ({ page }) => {
  await loginAs(page, "PortfolioOwner", true);
  await page.goto("/home/ai-governance");
  await expect(page.locator('[data-testid="ai-gov-intelligence-card"]')).toBeVisible();
});
