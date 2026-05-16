/**
 * M10-7 Playwright spec: Governance drill + Audit Trail Level 2 route.
 *
 * Gate tests:
 *   1. Click PEGASUS row on governance -> ?p=PEGASUS in URL
 *   2. governance-row-PEGASUS has bg-accent-gold when ?p=PEGASUS
 *   3. Programme filter clear removes ?p= on governance
 *   4. Click audit entry row -> navigates to Level 2 route
 *   5. Audit trail Level 2 shows before and after panels
 *   6. Back button on Level 2 returns to audit list
 *   7. Actor filter chip renders when ?actor= is set
 *   8. Outcome filter chip renders when ?outcome=Updated
 *
 * Requires live stack: Next.js on 3000, backend on 8000 with seeded DB.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

// ---------------------------------------------------------------------------
// Governance drill tests
// ---------------------------------------------------------------------------

test("click PEGASUS row on governance sets ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/governance-operating-model");

  const row = page.getByTestId("governance-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("governance-row-PEGASUS has bg-accent-gold/10 when ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/governance-operating-model?p=PEGASUS");

  const row = page.getByTestId("governance-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });

  const className = await row.getAttribute("class");
  expect(className).toMatch(/bg-accent-gold/);
});

test("programme filter clear removes ?p= on governance", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/governance-operating-model?p=PEGASUS");

  const filterBar = page.getByTestId("programme-filter-bar");
  await expect(filterBar).toBeVisible({ timeout: 30000 });

  const select = filterBar.locator("select").first();
  await select.selectOption("");

  await expect(page).not.toHaveURL(/[?&]p=/);
});

// ---------------------------------------------------------------------------
// Audit Trail Level 2 route tests
// ---------------------------------------------------------------------------

test("click audit entry row navigates to Level 2 route", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/audit-trail-console");

  const firstRow = page.locator('[data-testid^="audit-entry-row-"]').first();
  await expect(firstRow).toBeVisible({ timeout: 30000 });
  await firstRow.click();

  await expect(page).toHaveURL(/\/home\/audit-trail-console\/.+/);
});

test("audit trail Level 2 shows before and after panels", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");

  // Navigate to audit list to get a real entry ID.
  await page.goto("/home/audit-trail-console");
  const firstRow = page.locator('[data-testid^="audit-entry-row-"]').first();
  await expect(firstRow).toBeVisible({ timeout: 30000 });

  const testId = await firstRow.getAttribute("data-testid");
  const entryId = testId?.replace("audit-entry-row-", "") ?? "";
  expect(entryId).not.toBe("");

  await page.goto(`/home/audit-trail-console/${entryId}`);

  const beforePanel = page.getByTestId("before-json-panel");
  const afterPanel = page.getByTestId("after-json-panel");
  await expect(beforePanel).toBeVisible({ timeout: 30000 });
  await expect(afterPanel).toBeVisible({ timeout: 30000 });
});

test("back button on Level 2 returns to audit list", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");

  await page.goto("/home/audit-trail-console");
  const firstRow = page.locator('[data-testid^="audit-entry-row-"]').first();
  await expect(firstRow).toBeVisible({ timeout: 30000 });
  await firstRow.click();

  await expect(page).toHaveURL(/\/home\/audit-trail-console\/.+/);

  const backButton = page.getByRole("button", { name: /back/i });
  await expect(backButton).toBeVisible({ timeout: 15000 });
  await backButton.click();

  await expect(page).toHaveURL(/\/home\/audit-trail-console\/?$/);
});

// ---------------------------------------------------------------------------
// Filter chip tests
// ---------------------------------------------------------------------------

test("actor filter chip renders when ?actor= is set", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");

  // Use a placeholder UUID -- the chip renders based on the prop, not data validation.
  const fakeUuid = "00000000-0000-0000-0000-000000000001";
  await page.goto(`/home/audit-trail-console?actor=${fakeUuid}`);

  const chip = page.getByTestId("filter-chip-actor");
  await expect(chip).toBeVisible({ timeout: 30000 });
});

test("outcome filter chip renders when ?outcome=Updated", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/audit-trail-console?outcome=Updated");

  const chip = page.getByTestId("filter-chip-outcome");
  await expect(chip).toBeVisible({ timeout: 30000 });
});
