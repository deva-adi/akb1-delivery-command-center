/**
 * Data smoke E2E spec.
 * Confirms that proxy data renders non-empty values in key sections.
 * Tests use digit-match or row-count assertions to verify real data
 * is flowing from backend through Server Components.
 *
 * All assertions operate on the rendered DOM; no API interception needed.
 * Stub sections are excluded from these tests (they are expected to show "n/a").
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test("executive KPI row renders at least one numeric value", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive");
  const kpiRow = page.locator('[data-testid="executive-kpi-row"]');
  await expect(kpiRow).toBeVisible();
  const text = await kpiRow.textContent();
  expect(text).toMatch(/\d/);
});

test("workforce pyramid renders visible bar rows", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce");
  const pyramid = page.locator('[data-testid="workforce-pyramid"]');
  await expect(pyramid).toBeVisible();
  const rows = pyramid.locator("[data-band]");
  expect(await rows.count()).toBeGreaterThan(0);
});

test("ops-sla renders decision queue section", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla");
  const queue = page.locator('[data-testid="ops-decision-queue"]');
  await expect(queue).toBeVisible();
});

test("client-health signal matrix renders programme rows", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health");
  const matrix = page.locator('[data-testid="client-signal-matrix"]');
  await expect(matrix).toBeVisible();
  const rows = matrix.locator("tbody tr");
  expect(await rows.count()).toBeGreaterThan(0);
});

test("backlog-health programme table renders rows for PM", async ({ page }) => {
  await loginAs(page, "ProgrammeManager");
  await page.goto("/home/backlog-health");
  const table = page.locator('[data-testid="backlog-programme-table"]');
  await expect(table).toBeVisible();
  const rows = table.locator("tbody tr");
  expect(await rows.count()).toBeGreaterThan(0);
});
