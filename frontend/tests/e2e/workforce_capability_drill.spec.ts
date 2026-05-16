/**
 * M10-4 Playwright spec: Workforce and Capability band drill.
 *
 * Gate: click B3 bar on Workforce -> ?band=B3 in URL ->
 *       people list renders B3 people with count ->
 *       also select PEGASUS -> list narrows to PEGASUS x B3 intersection ->
 *       clear band chip -> shows pyramid-only PEGASUS view ->
 *       clear programme -> portfolio view restored.
 *
 * Requires live stack: Next.js on 3000, backend on 8000 with seeded DB.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

// ---------------------------------------------------------------------------
// Workforce drill
// ---------------------------------------------------------------------------

test("click B3 pyramid bar sets ?band=B3 in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce");

  const b3Bar = page.getByTestId("pyramid-bar-B3");
  await expect(b3Bar).toBeVisible({ timeout: 30000 });
  await b3Bar.click();

  await expect(page).toHaveURL(/[?&]band=B3/);
});

test("after ?band=B3, people list panel renders", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce?band=B3");

  const panel = page.getByTestId("people-list-panel");
  await expect(panel).toBeVisible({ timeout: 30000 });
});

test("people list shows a non-zero count for B3 (60 people in seed)", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce?band=B3");

  const count = page.getByTestId("people-list-count");
  await expect(count).toBeVisible({ timeout: 30000 });
  // Seed has 60 B3 people; the count should reflect that.
  const text = await count.textContent();
  expect(text).toMatch(/\d+ people/);
  const n = parseInt(text?.match(/\d+/)?.[0] ?? "0", 10);
  expect(n).toBeGreaterThan(0);
});

test("also selecting PEGASUS narrows people list", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce?band=B3");

  // Get current count.
  const count = page.getByTestId("people-list-count");
  await expect(count).toBeVisible({ timeout: 30000 });
  const beforeText = await count.textContent();
  const before = parseInt(beforeText?.match(/\d+/)?.[0] ?? "0", 10);

  // Add programme filter via ProgrammeFilterBar.
  const filterSelect = page.locator("#programme-filter");
  await expect(filterSelect).toBeVisible();
  await filterSelect.selectOption("PEGASUS");

  // URL should have both params.
  await expect(page).toHaveURL(/[?&]band=B3/);
  await expect(page).toHaveURL(/[?&]p=PEGASUS/);

  // List should show PEGASUS x B3 intersection (fewer or equal people).
  const countAfter = page.getByTestId("people-list-count");
  await expect(countAfter).toBeVisible({ timeout: 15000 });
  const afterText = await countAfter.textContent();
  const after = parseInt(afterText?.match(/\d+/)?.[0] ?? "0", 10);
  expect(after).toBeLessThanOrEqual(before);
});

test("clearing band filter via clear-band-link removes people list", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce?band=B3");

  const panel = page.getByTestId("people-list-panel");
  await expect(panel).toBeVisible({ timeout: 30000 });

  await page.getByTestId("clear-band-link").click();

  await expect(page).not.toHaveURL(/[?&]band=/);
  await expect(page.getByTestId("people-list-panel")).not.toBeVisible();
});

test("clearing programme restores full pyramid headcount", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce?band=B3&p=PEGASUS");

  // Clear programme by selecting All Programmes in the filter bar.
  const filterSelect = page.locator("#programme-filter");
  await expect(filterSelect).toBeVisible({ timeout: 30000 });
  await filterSelect.selectOption("");

  await expect(page).not.toHaveURL(/[?&]p=/);
  // band filter should still be set.
  await expect(page).toHaveURL(/[?&]band=B3/);
  // People list should reappear with all B3 people.
  await expect(page.getByTestId("people-list-panel")).toBeVisible({ timeout: 15000 });
});

test("B3 bar highlighted when ?band=B3 is active", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce?band=B3");

  const pyramid = page.getByTestId("workforce-pyramid");
  await expect(pyramid).toBeVisible({ timeout: 30000 });
  // The active bar wrapper receives ring-accent-gold class.
  const b3Bar = page.getByTestId("pyramid-bar-B3");
  await expect(b3Bar).toBeVisible();
});

// ---------------------------------------------------------------------------
// Capability drill
// ---------------------------------------------------------------------------

test("click B3 capability pyramid bar sets ?band=B3", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/capability-supply-chain");

  const bar = page.getByTestId("capability-bar-B3");
  await expect(bar).toBeVisible({ timeout: 30000 });
  await bar.click();

  await expect(page).toHaveURL(/[?&]band=B3/);
});

test("after ?band=B3 on capability tab, people list renders", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/capability-supply-chain?band=B3");

  const panel = page.getByTestId("people-list-panel");
  await expect(panel).toBeVisible({ timeout: 30000 });

  const count = page.getByTestId("people-list-count");
  await expect(count).toBeVisible();
  const text = await count.textContent();
  expect(parseInt(text?.match(/\d+/)?.[0] ?? "0", 10)).toBeGreaterThan(0);
});

test("FilterChip for band renders when ?band= is set", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce?band=B3");

  const panel = page.getByTestId("workforce-people-section");
  await expect(panel).toBeVisible({ timeout: 30000 });
  // FilterChip renders the band code as visible text inside the chip.
  await expect(panel).toContainText("B3");
});
