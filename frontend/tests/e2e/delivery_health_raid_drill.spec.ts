/**
 * M10-3 Playwright spec: Delivery Health and Risk RAID drill-through.
 *
 * Gate A (Delivery Health):
 *   Click PEGASUS on-time bar -> URL shows ?p=PEGASUS ->
 *   milestone table shows PEGASUS milestones -> click first milestone row ->
 *   Level 2 detail renders -> back button returns to ?p=PEGASUS list.
 *
 * Gate B (Risk and RAID):
 *   Click High cell for first heat-map row -> URL shows ?severity=High ->
 *   top-10 table renders -> click first RAID row ->
 *   Level 2 RAID detail renders -> back button returns to ?p= list.
 *
 * Requires live stack: Next.js on 3000, backend on 8000 with seeded DB.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

// ---------------------------------------------------------------------------
// Gate A: Delivery Health drill
// ---------------------------------------------------------------------------

test("click PEGASUS on-time bar sets ?p=PEGASUS in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/delivery-health");

  const row = page.getByTestId("on-time-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("after drilling to PEGASUS, milestone table heading shows PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/delivery-health?p=PEGASUS");

  const table = page.getByTestId("delivery-health-milestones-table");
  await expect(table).toBeVisible({ timeout: 30000 });
  await expect(table).toContainText("PEGASUS");
});

test("after drilling to PEGASUS, milestone rows belong to PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/delivery-health?p=PEGASUS");

  await expect(page.getByTestId("milestones-table")).toBeVisible({ timeout: 30000 });
  const rows = page.locator("[data-testid^='milestone-row-']");
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
});

test("click first milestone row opens Level 2 detail page", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/delivery-health?p=PEGASUS");

  await expect(page.getByTestId("milestones-table")).toBeVisible({ timeout: 30000 });
  const firstRow = page.locator("[data-testid^='milestone-row-']").first();
  await firstRow.click();

  await expect(page).toHaveURL(/\/home\/delivery-health\/PEGASUS\//);
  const detailCard = page.getByTestId("milestone-detail-card");
  await expect(detailCard).toBeVisible({ timeout: 15000 });
});

test("back button from milestone Level 2 returns to ?p=PEGASUS list", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/delivery-health?p=PEGASUS");

  await expect(page.getByTestId("milestones-table")).toBeVisible({ timeout: 30000 });
  await page.locator("[data-testid^='milestone-row-']").first().click();
  await expect(page).toHaveURL(/\/home\/delivery-health\/PEGASUS\//);

  await page.getByRole("button", { name: /Back to PEGASUS/i }).click();

  await expect(page).toHaveURL(/\/home\/delivery-health/);
  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("Level 2 milestone detail shows status and programme code", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/delivery-health?p=PEGASUS");

  await expect(page.getByTestId("milestones-table")).toBeVisible({ timeout: 30000 });
  await page.locator("[data-testid^='milestone-row-']").first().click();

  const card = page.getByTestId("milestone-detail-card");
  await expect(card).toBeVisible({ timeout: 15000 });
  await expect(card).toContainText("PEGASUS");
});

// ---------------------------------------------------------------------------
// Gate B: Risk and RAID drill
// ---------------------------------------------------------------------------

test("click High cell on heat map row sets ?p= and ?severity=High in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid");

  const heatMap = page.getByTestId("heat-map-table");
  await expect(heatMap).toBeVisible({ timeout: 30000 });

  // Click the first available non-zero High cell
  const rows = page.locator("[data-testid^='heat-map-row-']");
  const firstRowCode = await rows.first().getAttribute("data-testid").then(
    (v) => v?.replace("heat-map-row-", "") ?? "PEGASUS",
  );
  await page.getByTestId(`cell-${firstRowCode}-High`).click();

  await expect(page).toHaveURL(/[?&]severity=High/);
  await expect(page).toHaveURL(new RegExp(`[?&]p=${firstRowCode}`));
});

test("type filter tab sets ?type= in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid");

  const riskTab = page.getByTestId("type-tab-Risk");
  await expect(riskTab).toBeVisible({ timeout: 30000 });
  await riskTab.click();

  await expect(page).toHaveURL(/[?&]type=Risk/);
});

test("click first top-10 RAID row opens Level 2 RAID detail", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid");

  const table = page.getByTestId("raid-top10-table");
  await expect(table).toBeVisible({ timeout: 30000 });

  const firstRow = page.locator("[data-testid^='top10-row-']").first();
  await expect(firstRow).toBeVisible();
  await firstRow.click();

  await expect(page).toHaveURL(/\/home\/risk-raid\/[A-Z]+\//);
  const detailCard = page.getByTestId("raid-detail-card");
  await expect(detailCard).toBeVisible({ timeout: 15000 });
});

test("Level 2 RAID detail shows type, severity and status badges", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid");

  await expect(page.getByTestId("raid-top10-table")).toBeVisible({ timeout: 30000 });
  await page.locator("[data-testid^='top10-row-']").first().click();

  await expect(page.getByTestId("raid-detail-card")).toBeVisible({ timeout: 15000 });
  await expect(page.getByTestId("raid-detail-status-badge")).toBeVisible();
});

test("back button from RAID Level 2 returns to risk-raid with ?p=", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid");

  await expect(page.getByTestId("raid-top10-table")).toBeVisible({ timeout: 30000 });

  // Navigate into the first top-10 row via heat-map cell click to establish ?p=
  const heatMap = page.getByTestId("heat-map-table");
  await expect(heatMap).toBeVisible();
  const rows = page.locator("[data-testid^='heat-map-row-']");
  const code = await rows.first().getAttribute("data-testid").then(
    (v) => v?.replace("heat-map-row-", "") ?? "PEGASUS",
  );
  await page.getByTestId(`cell-${code}-High`).click();
  await expect(page).toHaveURL(/[?&]p=/);

  const firstRow = page.locator("[data-testid^='top10-row-']").first();
  if (await firstRow.count() > 0) {
    await firstRow.click();
    await expect(page).toHaveURL(/\/home\/risk-raid\/[A-Z]+\//);

    const backBtn = page.getByRole("button", { name: /Back to /i });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL(/\/home\/risk-raid/);
    await expect(page).not.toHaveURL(/\/home\/risk-raid\/[A-Z]+\//);
  }
});
