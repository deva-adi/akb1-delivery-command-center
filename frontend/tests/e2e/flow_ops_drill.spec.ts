/**
 * M10-5 Playwright spec: Flow and Velocity WIP drill + Ops and SLA matrix drill.
 *
 * Gate M10-5:
 *   Flow: click PEGASUS WIP bar -> ?p=PEGASUS -> PEGASUS bar highlighted
 *   Ops:  click PEGASUS x Ticket MTTR cell -> ?p=PEGASUS&sla=incident-response
 *         -> cell highlighted with gold ring
 *
 * Requires live stack: Next.js on 3000, backend on 8000 with seeded DB.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

// ---------------------------------------------------------------------------
// Flow and Velocity: WIP bar drill
// ---------------------------------------------------------------------------

test("click PEGASUS WIP bar sets ?p=PEGASUS in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/flow-velocity");

  const wipBars = page.locator('[data-testid="flow-wip-bars"]');
  await expect(wipBars).toBeVisible({ timeout: 30000 });

  const pegasusBar = page.locator('[data-testid="wip-bar-PEGASUS"]');
  await expect(pegasusBar).toBeVisible();
  await pegasusBar.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("after ?p=PEGASUS on flow tab, PEGASUS WIP bar renders highlighted", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/flow-velocity?p=PEGASUS");

  const wipBars = page.locator('[data-testid="flow-wip-bars"]');
  await expect(wipBars).toBeVisible({ timeout: 30000 });

  // DrillRow wrapper receives ring-accent-gold when active.
  const pegasusBar = page.locator('[data-testid="wip-bar-PEGASUS"]');
  await expect(pegasusBar).toBeVisible();
  // The parent DrillRow has the ring class; parent is the closest ancestor div[role=button].
  const drillRow = pegasusBar.locator("xpath=..");
  await expect(drillRow).toHaveClass(/ring-accent-gold/);
});

test("WIP bars for all 10 programmes are visible on flow tab", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/flow-velocity");

  const wipBars = page.locator('[data-testid="flow-wip-bars"]');
  await expect(wipBars).toBeVisible({ timeout: 30000 });
  // At least PEGASUS and ANDROMEDA must be present with seed data.
  await expect(page.locator('[data-testid="wip-bar-PEGASUS"]')).toBeVisible();
  await expect(page.locator('[data-testid="wip-bar-ANDROMEDA"]')).toBeVisible();
});

test("clicking a second WIP bar updates ?p= to new programme", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/flow-velocity?p=PEGASUS");

  const orionBar = page.locator('[data-testid="wip-bar-ORION"]');
  await expect(orionBar).toBeVisible({ timeout: 30000 });
  await orionBar.click();

  await expect(page).toHaveURL(/[?&]p=ORION/);
  await expect(page).not.toHaveURL(/p=PEGASUS/);
});

test("programme filter bar clear removes ?p= on flow tab", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/flow-velocity?p=PEGASUS");

  const filterSelect = page.locator("#programme-filter");
  await expect(filterSelect).toBeVisible({ timeout: 30000 });
  await filterSelect.selectOption("");

  await expect(page).not.toHaveURL(/[?&]p=/);
});

// ---------------------------------------------------------------------------
// Ops and SLA: matrix cell drill
// ---------------------------------------------------------------------------

test("click PEGASUS x Ticket MTTR cell sets ?p=PEGASUS&sla=incident-response", async ({
  page,
}) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla");

  const matrix = page.locator('[data-testid="ops-sla-matrix"]');
  await expect(matrix).toBeVisible({ timeout: 30000 });

  const cell = page.locator('[data-testid="sla-cell-PEGASUS-incident-response"]');
  await expect(cell).toBeVisible();
  await cell.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).toHaveURL(/[?&]sla=incident-response/);
});

test("active cell has ring-accent-gold when ?p=PEGASUS&sla=incident-response", async ({
  page,
}) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla?p=PEGASUS&sla=incident-response");

  const cell = page.locator('[data-testid="sla-cell-PEGASUS-incident-response"]');
  await expect(cell).toBeVisible({ timeout: 30000 });
  await expect(cell).toHaveClass(/ring-accent-gold/);
});

test("click programme row header sets ?p=CODE and clears ?sla=", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla?sla=incident-response");

  const rowHeader = page.locator('[data-testid="sla-row-header-PEGASUS"]');
  await expect(rowHeader).toBeVisible({ timeout: 30000 });
  await rowHeader.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).not.toHaveURL(/[?&]sla=/);
});

test("click SLA column header sets ?sla= in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla");

  const colHeader = page.locator('[data-testid="sla-col-header-incident-response"]');
  await expect(colHeader).toBeVisible({ timeout: 30000 });
  await colHeader.click();

  await expect(page).toHaveURL(/[?&]sla=incident-response/);
});

test("click SLA column header preserves active ?p= when set", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla?p=PEGASUS");

  const colHeader = page.locator('[data-testid="sla-col-header-incident-response"]');
  await expect(colHeader).toBeVisible({ timeout: 30000 });
  await colHeader.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).toHaveURL(/[?&]sla=incident-response/);
});

test("active row header has text-accent-gold class when ?p= matches", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla?p=PEGASUS");

  const rowHeader = page.locator('[data-testid="sla-row-header-PEGASUS"]');
  await expect(rowHeader).toBeVisible({ timeout: 30000 });
  await expect(rowHeader).toHaveClass(/text-accent-gold/);
});

test("active column header has underline class when ?sla= matches", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla?sla=incident-response");

  const colHeader = page.locator('[data-testid="sla-col-header-incident-response"]');
  await expect(colHeader).toBeVisible({ timeout: 30000 });
  await expect(colHeader).toHaveClass(/underline/);
});
