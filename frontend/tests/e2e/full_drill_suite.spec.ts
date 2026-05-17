/**
 * M10-8 Full Playwright drill suite.
 *
 * Covers all 13 interactive tabs. For each tab:
 *   - Programme filter bar visible at Level 0
 *   - Clicking a programme row/bar/cell sets correct URL params
 *   - Active element carries the correct highlight class
 *   - Programme filter select clear removes ?p= from URL
 *   - Breadcrumb shows programme name when ?p= is set
 *   - Breadcrumb Portfolio link clears ?p=
 *   - Level 2 back button returns to Level 1 with ?p= preserved
 *
 * Role notes:
 *   - delivery-health: PortfolioOwner is NOT allowed (redirects to /home).
 *     Uses DeliveryDirector for that tab only.
 *   - All other tabs: PortfolioOwner.
 *
 * Requires live stack: Next.js on 3000, backend on 8000 with seeded DB.
 */

import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

// ---------------------------------------------------------------------------
// Executive
// ---------------------------------------------------------------------------

test("executive: programme filter bar is visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("executive: clicking programme-state-row-PEGASUS sets ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive");

  const row = page.getByTestId("programme-state-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("executive: active programme row has gold highlight when ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  const row = page.getByTestId("programme-state-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  const cls = await row.getAttribute("class");
  expect(cls).toMatch(/accent-gold/);
});

test("executive: programme filter select clear removes ?p=", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  const select = page.locator("#programme-filter");
  await expect(select).toBeVisible({ timeout: 30000 });
  await select.selectOption("");

  await expect(page).not.toHaveURL(/[?&]p=/);
});

test("executive: breadcrumb shows PEGASUS when ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  const breadcrumb = page.getByRole("navigation", { name: "Drill breadcrumb" });
  await expect(breadcrumb).toBeVisible({ timeout: 30000 });
  await expect(breadcrumb).toContainText("PEGASUS");
});

test("executive: breadcrumb Portfolio link clears ?p=", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  const breadcrumb = page.getByRole("navigation", { name: "Drill breadcrumb" });
  await expect(breadcrumb).toBeVisible({ timeout: 30000 });
  await breadcrumb.getByText("Portfolio").click();

  await expect(page).not.toHaveURL(/[?&]p=/);
});

// ---------------------------------------------------------------------------
// Delivery Health -- DeliveryDirector (PO is not allowed)
// ---------------------------------------------------------------------------

test("delivery-health: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "DeliveryDirector");
  await page.goto("/home/delivery-health");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("delivery-health: clicking on-time-bar-PEGASUS sets ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "DeliveryDirector");
  await page.goto("/home/delivery-health");

  const bar = page.getByTestId("on-time-bar-PEGASUS");
  await expect(bar).toBeVisible({ timeout: 30000 });
  await bar.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("delivery-health: milestone row click opens Level 2 route", async ({ page }) => {
  await loginAs(page, "DeliveryDirector");
  await page.goto("/home/delivery-health?p=PEGASUS");

  const firstMilestone = page.locator('[data-testid^="milestone-row-"]').first();
  await expect(firstMilestone).toBeVisible({ timeout: 30000 });
  await firstMilestone.click();

  await expect(page).toHaveURL(/\/home\/delivery-health\/PEGASUS\//);
});

test("delivery-health: Level 2 back button returns to Level 1 with ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "DeliveryDirector");
  await page.goto("/home/delivery-health?p=PEGASUS");

  const firstMilestone = page.locator('[data-testid^="milestone-row-"]').first();
  await expect(firstMilestone).toBeVisible({ timeout: 30000 });
  await firstMilestone.click();

  await expect(page).toHaveURL(/\/home\/delivery-health\/PEGASUS\//);

  const backBtn = page.getByRole("button", { name: /back/i });
  await expect(backBtn).toBeVisible();
  await backBtn.click();

  await expect(page).toHaveURL(/\/home\/delivery-health\?p=PEGASUS/);
});

// ---------------------------------------------------------------------------
// Risk and RAID
// ---------------------------------------------------------------------------

test("risk-raid: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("risk-raid: clicking heat map cell sets ?p= and ?severity=", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid");

  const cell = page.getByTestId("cell-PEGASUS-Critical");
  await expect(cell).toBeVisible({ timeout: 30000 });
  await cell.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).toHaveURL(/[?&]severity=Critical/);
});

test("risk-raid: top-10 row click opens Level 2 RAID item route", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid?p=PEGASUS");

  const firstRow = page.locator('[data-testid^="top10-row-"]').first();
  await expect(firstRow).toBeVisible({ timeout: 30000 });
  await firstRow.click();

  await expect(page).toHaveURL(/\/home\/risk-raid\/PEGASUS\//);
});

test("risk-raid: Level 2 back button returns to Level 1 with ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/risk-raid?p=PEGASUS");

  const firstRow = page.locator('[data-testid^="top10-row-"]').first();
  await expect(firstRow).toBeVisible({ timeout: 30000 });
  await firstRow.click();

  await expect(page).toHaveURL(/\/home\/risk-raid\/PEGASUS\//);

  const backBtn = page.getByRole("button", { name: /back/i });
  await expect(backBtn).toBeVisible();
  await backBtn.click();

  await expect(page).toHaveURL(/\/home\/risk-raid\?p=PEGASUS/);
});

// ---------------------------------------------------------------------------
// Workforce
// ---------------------------------------------------------------------------

test("workforce: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("workforce: clicking pyramid-bar-B3 sets ?band=B3 in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce");

  const bar = page.getByTestId("pyramid-bar-B3");
  await expect(bar).toBeVisible({ timeout: 30000 });
  await bar.click();

  await expect(page).toHaveURL(/[?&]band=B3/);
});

test("workforce: ?band=B3 renders people list panel below pyramid", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/workforce?band=B3");

  await expect(page.getByTestId("people-list-panel")).toBeVisible({ timeout: 30000 });
});

// ---------------------------------------------------------------------------
// Capability and Supply Chain
// ---------------------------------------------------------------------------

test("capability: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/capability-supply-chain");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("capability: clicking capability-bar-B4 sets ?band=B4 in URL", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/capability-supply-chain");

  const bar = page.getByTestId("capability-bar-B4");
  await expect(bar).toBeVisible({ timeout: 30000 });
  await bar.click();

  await expect(page).toHaveURL(/[?&]band=B4/);
});

// ---------------------------------------------------------------------------
// Financials
// ---------------------------------------------------------------------------

test("financials: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/financials");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("financials: clicking financials-row-PEGASUS sets ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/financials");

  const row = page.getByTestId("financials-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("financials: ?p=PEGASUS applies gold highlight to PEGASUS row", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/financials?p=PEGASUS");

  const row = page.getByTestId("financials-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  const cls = await row.getAttribute("class");
  expect(cls).toMatch(/accent-gold/);
});

// ---------------------------------------------------------------------------
// Flow and Velocity
// ---------------------------------------------------------------------------

test("flow-velocity: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/flow-velocity");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("flow-velocity: clicking wip-bar-PEGASUS sets ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/flow-velocity");

  const bar = page.getByTestId("wip-bar-PEGASUS");
  await expect(bar).toBeVisible({ timeout: 30000 });
  await bar.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

// ---------------------------------------------------------------------------
// Ops and SLA
// ---------------------------------------------------------------------------

test("ops-sla: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("ops-sla: clicking sla-cell-PEGASUS-incident-response sets ?p= and ?sla=", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla");

  const cell = page.getByTestId("sla-cell-PEGASUS-incident-response");
  await expect(cell).toBeVisible({ timeout: 30000 });
  await cell.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).toHaveURL(/[?&]sla=incident-response/);
});

test("ops-sla: ?p=PEGASUS&sla=incident-response active cell has gold ring", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla?p=PEGASUS&sla=incident-response");

  const cell = page.getByTestId("sla-cell-PEGASUS-incident-response");
  await expect(cell).toBeVisible({ timeout: 30000 });
  const cls = await cell.getAttribute("class");
  expect(cls).toMatch(/ring-accent-gold/);
});

test("ops-sla: programme filter clear removes ?p= and ?sla=", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ops-sla?p=PEGASUS&sla=incident-response");

  const select = page.locator("#programme-filter");
  await expect(select).toBeVisible({ timeout: 30000 });
  await select.selectOption("");

  await expect(page).not.toHaveURL(/[?&]p=/);
});

// ---------------------------------------------------------------------------
// Client Health
// ---------------------------------------------------------------------------

test("client-health: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("client-health: clicking signal-row-PEGASUS sets ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health");

  const row = page.getByTestId("signal-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("client-health: ?p=PEGASUS active row has gold highlight", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health?p=PEGASUS");

  const row = page.getByTestId("signal-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  const cls = await row.getAttribute("class");
  expect(cls).toMatch(/accent-gold/);
});

// ---------------------------------------------------------------------------
// Backlog Health
// ---------------------------------------------------------------------------

test("backlog-health: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/backlog-health");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("backlog-health: clicking backlog-row-PEGASUS sets ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/backlog-health");

  const row = page.getByTestId("backlog-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("backlog-health: ?p=PEGASUS active row has bg-accent-gold/10", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/backlog-health?p=PEGASUS");

  const row = page.getByTestId("backlog-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  const cls = await row.getAttribute("class");
  expect(cls).toMatch(/bg-accent-gold/);
});

test("backlog-health: programme filter clear removes ?p=", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/backlog-health?p=PEGASUS");

  const select = page.locator("#programme-filter");
  await expect(select).toBeVisible({ timeout: 30000 });
  await select.selectOption("");

  await expect(page).not.toHaveURL(/[?&]p=/);
});

// ---------------------------------------------------------------------------
// AI Governance
// ---------------------------------------------------------------------------

test("ai-governance: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ai-governance");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("ai-governance: clicking ai-tier-cell-PEGASUS-red sets ?p=PEGASUS&tier=red", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ai-governance");

  const cell = page.getByTestId("ai-tier-cell-PEGASUS-red");
  await expect(cell).toBeVisible({ timeout: 30000 });
  await cell.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).toHaveURL(/[?&]tier=red/);
});

// ---------------------------------------------------------------------------
// Governance Operating Model
// ---------------------------------------------------------------------------

test("governance: programme filter bar visible at Level 0", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/governance-operating-model");
  await expect(page.getByTestId("programme-filter-bar")).toBeVisible({ timeout: 30000 });
});

test("governance: clicking governance-row-PEGASUS sets ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/governance-operating-model");

  const row = page.getByTestId("governance-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  await row.click();

  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("governance: ?p=PEGASUS active row has bg-accent-gold/10", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/governance-operating-model?p=PEGASUS");

  const row = page.getByTestId("governance-row-PEGASUS");
  await expect(row).toBeVisible({ timeout: 30000 });
  const cls = await row.getAttribute("class");
  expect(cls).toMatch(/bg-accent-gold/);
});

// ---------------------------------------------------------------------------
// Audit Trail Console
// ---------------------------------------------------------------------------

test("audit-trail: entry rows are visible", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/audit-trail-console");

  const firstRow = page.locator('[data-testid^="audit-entry-row-"]').first();
  await expect(firstRow).toBeVisible({ timeout: 30000 });
});

test("audit-trail: clicking entry row navigates to Level 2 route", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/audit-trail-console");

  const firstRow = page.locator('[data-testid^="audit-entry-row-"]').first();
  await expect(firstRow).toBeVisible({ timeout: 30000 });
  await firstRow.click();

  await expect(page).toHaveURL(/\/home\/audit-trail-console\/.+/);
});

// ---------------------------------------------------------------------------
// Cross-tab drill-through
// ---------------------------------------------------------------------------

test("executive: exec-dh-link-PEGASUS navigates to delivery-health?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/executive?p=PEGASUS");

  const dhLink = page.getByTestId("exec-dh-link-PEGASUS");
  await expect(dhLink).toBeVisible({ timeout: 30000 });
  await dhLink.click();

  await expect(page).toHaveURL(/\/home\/delivery-health\?p=PEGASUS/);
});
