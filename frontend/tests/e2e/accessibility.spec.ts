/**
 * Accessibility spec -- M8-3.
 *
 * Runs axe-core WCAG 2.1 AA scan on every built tab plus /login.
 * Gate: zero critical violations (launch blocker per 06_Accessibility.md).
 * Serious violations are surfaced as test annotations -- they require a PR
 * justification and time-boxed remediation ticket but do not block M8.
 *
 * Role used per tab:
 *   PO      -- broadest access; covers executive, raid, workforce, financials,
 *              flow, backlog, ops-sla, client-health, governance, capability,
 *              ai-governance, audit-trail-console
 *   ReadOnly -- delivery-health (PO is not an allowed role per PRD 3.1.10)
 *   none    -- /login (public)
 *
 * Each test uses a 15s action timeout to allow SSR data fetches to complete
 * before axe scans the fully-rendered DOM.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { loginAs } from "./helpers/auth";

test.use({ actionTimeout: 15000 });

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

async function runAxe(page: Parameters<typeof AxeBuilder>[0]["page"]) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
}

function criticalViolations(results: Awaited<ReturnType<typeof runAxe>>) {
  return results.violations.filter((v) => v.impact === "critical");
}

function seriousViolations(results: Awaited<ReturnType<typeof runAxe>>) {
  return results.violations.filter((v) => v.impact === "serious");
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

test("a11y: /login has zero critical WCAG AA violations", async ({ page }) => {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  const results = await runAxe(page);
  const serious = seriousViolations(results);
  if (serious.length > 0) {
    test.info().annotations.push({
      type: "serious-violations",
      description: serious.map((v) => `${v.id}: ${v.description}`).join(" | "),
    });
  }
  expect(criticalViolations(results)).toEqual([]);
});

// ---------------------------------------------------------------------------
// Authenticated tabs -- PO role
// ---------------------------------------------------------------------------

const PO_TABS = [
  { name: "executive",             path: "/home/executive" },
  { name: "risk-raid",             path: "/home/risk-raid" },
  { name: "workforce",             path: "/home/workforce" },
  { name: "financials",            path: "/home/financials" },
  { name: "flow-velocity",         path: "/home/flow-velocity" },
  { name: "backlog-health",        path: "/home/backlog-health" },
  { name: "ops-sla",              path: "/home/ops-sla" },
  { name: "client-health",         path: "/home/client-health" },
  { name: "governance",            path: "/home/governance-operating-model" },
  { name: "capability",            path: "/home/capability-supply-chain" },
  { name: "ai-governance",         path: "/home/ai-governance" },
  { name: "audit-trail-console",   path: "/home/audit-trail-console" },
] as const;

for (const tab of PO_TABS) {
  test(`a11y: ${tab.name} has zero critical WCAG AA violations`, async ({ page }) => {
    await loginAs(page, "PortfolioOwner");
    await page.goto(tab.path);
    await page.waitForLoadState("networkidle");
    const results = await runAxe(page);
    const serious = seriousViolations(results);
    if (serious.length > 0) {
      test.info().annotations.push({
        type: "serious-violations",
        description: serious.map((v) => `${v.id}: ${v.description}`).join(" | "),
      });
    }
    expect(criticalViolations(results)).toEqual([]);
  });
}

// ---------------------------------------------------------------------------
// Delivery Health -- ReadOnly (PO not allowed per PRD 3.1.10)
// ---------------------------------------------------------------------------

test("a11y: delivery-health has zero critical WCAG AA violations", async ({ page }) => {
  await loginAs(page, "ReadOnly");
  await page.goto("/home/delivery-health");
  await page.waitForLoadState("networkidle");
  const results = await runAxe(page);
  const serious = seriousViolations(results);
  if (serious.length > 0) {
    test.info().annotations.push({
      type: "serious-violations",
      description: serious.map((v) => `${v.id}: ${v.description}`).join(" | "),
    });
  }
  expect(criticalViolations(results)).toEqual([]);
});

// ---------------------------------------------------------------------------
// M10-8 WCAG re-scan: new interactive routes with role=button drill elements
// ---------------------------------------------------------------------------

const M10_NEW_ROUTES = [
  { name: "client-health-p-PEGASUS",     path: "/home/client-health?p=PEGASUS",                role: "PortfolioOwner" },
  { name: "backlog-health-p-PEGASUS",    path: "/home/backlog-health?p=PEGASUS",               role: "PortfolioOwner" },
  { name: "ai-governance-p-PEGASUS",     path: "/home/ai-governance?p=PEGASUS&tier=red",       role: "PortfolioOwner" },
  { name: "governance-p-PEGASUS",        path: "/home/governance-operating-model?p=PEGASUS",   role: "PortfolioOwner" },
  { name: "audit-trail-console-rows",    path: "/home/audit-trail-console",                    role: "PortfolioOwner" },
] as const;

for (const route of M10_NEW_ROUTES) {
  test(`a11y: ${route.name} has zero critical WCAG AA violations`, async ({ page }) => {
    await loginAs(page, route.role);
    await page.goto(route.path);
    await page.waitForLoadState("networkidle");
    const results = await runAxe(page);
    const serious = seriousViolations(results);
    if (serious.length > 0) {
      test.info().annotations.push({
        type: "serious-violations",
        description: serious.map((v) => `${v.id}: ${v.description}`).join(" | "),
      });
    }
    expect(criticalViolations(results)).toEqual([]);
    expect(seriousViolations(results)).toEqual([]);
  });
}
