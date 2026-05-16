import { test, expect } from "@playwright/test";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

test("click PEGASUS signal row sets ?p=PEGASUS on client-health", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health");
  await expect(page.locator('[data-testid="client-signal-matrix"]')).toBeVisible({
    timeout: 30000,
  });
  await page.locator('[data-testid="signal-row-PEGASUS"]').click();
  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("signal-row-PEGASUS has bg-accent-gold/10 when ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health?p=PEGASUS");
  await expect(page.locator('[data-testid="client-signal-matrix"]')).toBeVisible({
    timeout: 30000,
  });
  await expect(page.locator('[data-testid="signal-row-PEGASUS"]')).toHaveClass(
    /bg-accent-gold/,
  );
});

test("click escalations-90d column header sets ?signal= on client-health", async ({
  page,
}) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health");
  await page.locator('[data-testid="signal-col-header-escalations-90d"]').click();
  await expect(page).toHaveURL(/[?&]signal=escalations-90d/);
});

test("signal col header click preserves ?p= when set on client-health", async ({
  page,
}) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health?p=PEGASUS");
  await page.locator('[data-testid="signal-col-header-escalations-90d"]').click();
  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).toHaveURL(/[?&]signal=escalations-90d/);
});

test("active signal col header has underline class on client-health", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health?signal=escalations-90d");
  await expect(page.locator('[data-testid="signal-col-header-escalations-90d"]')).toHaveClass(
    /underline/,
  );
});

test("programme filter clear removes ?p= on client-health", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/client-health?p=PEGASUS");
  await expect(page.locator("#programme-filter")).toBeVisible({ timeout: 30000 });
  await page.locator("#programme-filter").selectOption("");
  await expect(page).not.toHaveURL(/[?&]p=/);
});

test("click PEGASUS row sets ?p=PEGASUS on backlog-health", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/backlog-health");
  await expect(page.locator('[data-testid="backlog-programme-table"]')).toBeVisible({
    timeout: 30000,
  });
  await page.locator('[data-testid="backlog-row-PEGASUS"]').click();
  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
});

test("backlog-row-PEGASUS has bg-accent-gold/10 when ?p=PEGASUS", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/backlog-health?p=PEGASUS");
  await expect(page.locator('[data-testid="backlog-row-PEGASUS"]')).toHaveClass(
    /bg-accent-gold/,
    { timeout: 30000 },
  );
});

test("programme filter clear removes ?p= on backlog-health", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/backlog-health?p=PEGASUS");
  await page.locator("#programme-filter").selectOption("");
  await expect(page).not.toHaveURL(/[?&]p=/);
});

test("click PEGASUS x Red cell sets ?p=PEGASUS&tier=red on ai-governance", async ({
  page,
}) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ai-governance");
  await expect(page.locator('[data-testid="ai-gov-risk-tier-matrix"]')).toBeVisible({
    timeout: 30000,
  });
  await page.locator('[data-testid="ai-tier-cell-PEGASUS-red"]').click();
  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).toHaveURL(/[?&]tier=red/);
});

test("ai-tier-cell-PEGASUS-red has ring-accent-gold when ?p=PEGASUS&tier=red", async ({
  page,
}) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ai-governance?p=PEGASUS&tier=red");
  await expect(page.locator('[data-testid="ai-tier-cell-PEGASUS-red"]')).toHaveClass(
    /ring-accent-gold/,
    { timeout: 30000 },
  );
});

test("click tier col header preserves ?p= when set on ai-governance", async ({ page }) => {
  await loginAs(page, "PortfolioOwner");
  await page.goto("/home/ai-governance?p=PEGASUS");
  await page.locator('[data-testid="ai-tier-col-header-red"]').click();
  await expect(page).toHaveURL(/[?&]p=PEGASUS/);
  await expect(page).toHaveURL(/[?&]tier=red/);
});
