/**
 * M10-2 Playwright spec: Executive and Financials drill triggers.
 *
 * Gate: Click PEGASUS on Executive -> URL shows ?p=PEGASUS -> intelligence
 * card re-renders for PEGASUS -> breadcrumb shows PEGASUS -> click Portfolio
 * breadcrumb -> URL clears -> portfolio view restores.
 *
 * Requires live stack: Next.js on 3000, backend on 8000 with seeded DB.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

// ---------------------------------------------------------------------------
// Executive drill: row click sets ?p=
// ---------------------------------------------------------------------------

test("click PEGASUS row on executive sets ?p=PEGASUS in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive");

  // 30s: first visit compiles page + 30 parallel backend health calls in dev mode
  const pegasusRow = page.getByTestId("programme-state-row-PEGASUS");
  await expect(pegasusRow).toBeVisible({ timeout: 30000 });
  await pegasusRow.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("after drilling to PEGASUS, intelligence card shows programme context", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  const card = page.getByTestId("executive-intelligence-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("PEGASUS");
});

test("after drilling to PEGASUS, breadcrumb shows Portfolio > PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  const breadcrumb = page.getByRole("navigation", { name: "Drill breadcrumb" });
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb).toContainText("Portfolio");
  await expect(breadcrumb).toContainText("PEGASUS");
});

test("click Portfolio breadcrumb on executive restores portfolio view", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  await page.getByRole("navigation", { name: "Drill breadcrumb" })
    .getByRole("link", { name: "Portfolio" })
    .click();

  await expect(page).not.toHaveURL(/[?&]p=/);
  await expect(page).toHaveURL(/\/home\/executive$/);
});

test("View Delivery Health cross-link has correct href when PEGASUS is active", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");
  // 30s: cross-link only renders when programme state list has loaded health data
  const dhLink = page.getByTestId("exec-dh-link-PEGASUS");
  await expect(dhLink).toBeVisible({ timeout: 30000 });
  const href = await dhLink.getAttribute("href");
  expect(href).toContain("/home/delivery-health");
  expect(href).toContain("p=PEGASUS");
});

test("View RAID cross-link navigates to risk-raid with ?p=PEGASUS", async ({ page }) => {
  // PortfolioOwner IS allowed on Risk and RAID (PO/DD/PM/FL)
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");
  // 30s: same warm-up budget as DH cross-link test above
  const raidLink = page.getByTestId("exec-raid-link-PEGASUS");
  await expect(raidLink).toBeVisible({ timeout: 30000 });
  await raidLink.click();

  await expect(page).toHaveURL(/\/home\/risk-raid/);
  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

// ---------------------------------------------------------------------------
// Financials drill: row click sets ?p=
// ---------------------------------------------------------------------------

test("click PEGASUS row on financials sets ?p=PEGASUS in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/financials");

  const table = page.getByTestId("financials-programme-table");
  await expect(table).toBeVisible();

  const pegasusCell = page.getByTestId("financials-row-PEGASUS");
  await expect(pegasusCell).toBeVisible();
  await pegasusCell.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("after drilling on financials, intelligence card shows PEGASUS context", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/financials?p=PEGASUS");

  const card = page.getByTestId("financials-intelligence-card");
  await expect(card).toBeVisible();
  await expect(card).toContainText("PEGASUS");
});
