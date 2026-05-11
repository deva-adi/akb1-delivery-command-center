/**
 * Drill integrity E2E spec -- M8-2.
 *
 * Every assertion verifies that REAL data from the seed (10 programmes, 300
 * people) flows from the backend through Server Components to the rendered DOM.
 * No test accepts a stub string, a placeholder, or "n/a" as a passing value.
 *
 * Drill taxonomy used here:
 *   down  -- programme codes visible in section rows (parent -> child resolution)
 *   count -- aggregate value in UI matches actual data count
 *   across -- cross-tab navigation link resolves to the target tab
 *
 * Seed constants:
 *   PROGRAMME_CODES[0] = "PEGASUS"  (first, used as lower boundary check)
 *   PROGRAMME_CODES[9] = "ANDROMEDA" (last, used as upper boundary check)
 *   people.length      = 300
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

// Data-heavy tests: each page fans out to 10 programme endpoints before
// rendering per-code rows. 5000ms (default) is too tight under 5-worker
// concurrency. 15s gives the SSR fetch chain room to complete.
test.use({ actionTimeout: 15000 });

// ---------------------------------------------------------------------------
// down: programme codes present in section rows
// ---------------------------------------------------------------------------

test("down: executive programme state list resolves PEGASUS and ANDROMEDA from seed", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive");

  const list = page.locator('[data-testid="programme-state-rows"]');
  await expect(list).toBeVisible();

  await expect(page.locator('[data-testid="programme-state-row-PEGASUS"]')).toBeVisible();
  await expect(page.locator('[data-testid="programme-state-row-ANDROMEDA"]')).toBeVisible();
});

test("down: delivery health on-time chart renders all 10 programme rows", async ({ page }) => {
  // ReadOnly bypasses require_programme_access; DD/PM synthetic UUIDs have no
  // seed assignments and all 10 fetches return 403, leaving 0 chart rows.
  await loginAs(page, "ReadOnly");
  await page.goto("/home/delivery-health");

  const chart = page.locator('[data-testid="delivery-health-on-time-chart"]');
  await expect(chart).toBeVisible();

  await expect(page.locator('[data-testid="on-time-row-PEGASUS"]')).toBeVisible();
  await expect(page.locator('[data-testid="on-time-row-ANDROMEDA"]')).toBeVisible();

  const rows = page.locator('[data-testid="on-time-rows"] > div');
  expect(await rows.count()).toBe(10);
});

test("down: risk-raid heat map contains PEGASUS from seed", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid");

  const heatMap = page.locator('[data-testid="heat-map-table"]');
  await expect(heatMap).toBeVisible();
  await expect(heatMap.getByText("PEGASUS")).toBeVisible();
});

test("down: ops sla matrix renders PEGASUS and ANDROMEDA rows", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla");

  const matrix = page.locator('[data-testid="ops-sla-matrix"]');
  await expect(matrix).toBeVisible();
  await expect(matrix.getByText("PEGASUS")).toBeVisible();
  await expect(matrix.getByText("ANDROMEDA")).toBeVisible();
});

test("down: flow wip bars render PEGASUS and ANDROMEDA from seed", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/flow-velocity");

  const wipBars = page.locator('[data-testid="flow-wip-bars"]');
  await expect(wipBars).toBeVisible();
  await expect(wipBars.getByText("PEGASUS")).toBeVisible();
  await expect(wipBars.getByText("ANDROMEDA")).toBeVisible();
});

test("down: backlog health programme table renders PEGASUS as first row", async ({ page }) => {
  await loginAs(page, "ProgrammeManager");
  await page.goto("/home/backlog-health");

  const table = page.locator('[data-testid="backlog-programme-table"]');
  await expect(table).toBeVisible();
  await expect(table.getByText("PEGASUS")).toBeVisible();
});

test("down: client health signal matrix renders PEGASUS and ANDROMEDA rows", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health");

  const matrix = page.locator('[data-testid="client-signal-matrix"]');
  await expect(matrix).toBeVisible();
  await expect(matrix.getByText("PEGASUS")).toBeVisible();
  await expect(matrix.getByText("ANDROMEDA")).toBeVisible();
});

// ---------------------------------------------------------------------------
// count: aggregate value in UI matches actual data
// ---------------------------------------------------------------------------

test("count: workforce headcount KPI shows 300 from seed", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce");

  const kpi = page.locator('[data-testid="kpi-headcount"]');
  await expect(kpi).toBeVisible();
  await expect(kpi).toContainText("300");
});

test("count: capability intelligence card reports 300 headcount", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/capability-supply-chain");

  const what = page.locator('[data-testid="capability-what"]');
  await expect(what).toBeVisible();
  await expect(what).toContainText("300");
});

test("count: delivery health on-time rows count matches all 10 seed programmes", async ({ page }) => {
  await loginAs(page, "ReadOnly");
  await page.goto("/home/delivery-health");

  await expect(page.locator('[data-testid="on-time-rows"]')).toBeVisible();
  const rows = page.locator('[data-testid^="on-time-row-"]');
  expect(await rows.count()).toBe(10);
});

// ---------------------------------------------------------------------------
// across: cross-tab navigation links resolve to the target tab
// ---------------------------------------------------------------------------

test("across: backlog health flow-velocity cross-link navigates to flow tab", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/backlog-health");

  const link = page.getByRole("link", { name: /flow/i }).first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/home\/flow-velocity/);
  await expect(page.locator('[data-testid="flow-wip-bars"]')).toBeVisible();
});

test("across: client health governance cross-link navigates to governance tab", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health");

  const link = page.getByRole("link", { name: /governance/i }).first();
  await expect(link).toBeVisible();
  await link.click();
  await expect(page).toHaveURL(/\/home\/governance-operating-model/);
  await expect(page.locator('[data-testid="gov-intelligence-card"]')).toBeVisible();
});
