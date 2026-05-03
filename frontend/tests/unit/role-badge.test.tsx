import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleBadge } from "@/components/RoleBadge";

describe("RoleBadge", () => {
  it("renders the human-readable role label", () => {
    render(<RoleBadge role="PortfolioOwner" apFlag={false} />);
    const badge = screen.getByTestId("role-badge");
    expect(badge.textContent).toContain("Portfolio Owner");
    expect(badge.getAttribute("data-ap")).toBe("false");
  });

  it("shows the AP gold dot when apFlag is true", () => {
    render(<RoleBadge role="DeliveryDirector" apFlag={true} />);
    const badge = screen.getByTestId("role-badge");
    expect(badge.getAttribute("data-ap")).toBe("true");
    const dot = screen.getByLabelText("Audit permission enabled");
    expect(dot).toBeInTheDocument();
  });

  it("hides the AP dot when apFlag is false", () => {
    render(<RoleBadge role="FinanceLead" apFlag={false} />);
    expect(screen.queryByLabelText("Audit permission enabled")).toBeNull();
  });
});
