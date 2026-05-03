import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { RoleAwareNav } from "@/components/RoleAwareNav";
import { ROLES, navForRole } from "@/lib/auth/role-nav";

describe("RoleAwareNav", () => {
  it.each(ROLES)("renders 5 tabs for role %s", (role) => {
    render(<RoleAwareNav role={role} />);
    const nav = screen.getByTestId("role-aware-nav");
    expect(nav.getAttribute("data-role")).toBe(role);
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(5);
    const expectedLabels = navForRole(role).map((item) => item.label);
    expect(links.map((l) => l.textContent)).toEqual(expectedLabels);
  });

  it("renders Portfolio Owner primary tabs in correct order", () => {
    render(<RoleAwareNav role="PortfolioOwner" />);
    const nav = screen.getByTestId("role-aware-nav");
    const labels = within(nav)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(labels).toEqual([
      "Executive",
      "Governance",
      "Financials",
      "Capability",
      "Client Health",
    ]);
  });
});
