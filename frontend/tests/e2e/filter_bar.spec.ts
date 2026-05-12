/**
 * M10-1 filter bar E2E spec.
 *
 * Gate: filter bar renders on executive tab, selecting PEGASUS sets ?p=PEGASUS
 * in the URL, breadcrumb shows "Portfolio > PEGASUS", clicking Portfolio
 * in breadcrumb clears ?p= and restores Level 0.
 *
 * Requires live stack: Next.js on 3000, backend on 8000 with seeded DB.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

test("filter bar renders on executive tab", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible();
});

test("selecting PEGASUS in filter bar sets ?p=PEGASUS in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive");

  await page.getByTestId("programme-filter-bar").locator("select").selectOption("PEGASUS");

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("breadcrumb shows Portfolio > PEGASUS when ?p=PEGASUS is set", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  const breadcrumb = page.getByRole("navigation", { name: "Drill breadcrumb" });
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb).toContainText("Portfolio");
  await expect(breadcrumb).toContainText("PEGASUS");
});

test("clicking Portfolio breadcrumb clears ?p= and restores Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  await page.getByRole("navigation", { name: "Drill breadcrumb" }).getByRole("link", { name: "Portfolio" }).click();

  await expect(page).not.toHaveURL(/[?&]p=/);
  await expect(page).toHaveURL(/\/home\/executive$/);
});
