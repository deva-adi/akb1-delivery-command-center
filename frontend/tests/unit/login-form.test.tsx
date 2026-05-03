import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/app/login/LoginForm";

const replace = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh, push: vi.fn(), back: vi.fn() }),
}));

const originalFetch = globalThis.fetch;

beforeEach(() => {
  replace.mockReset();
  refresh.mockReset();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("LoginForm", () => {
  it("posts to /api/auth/login and redirects on success", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<LoginForm redirectTo="/home" />);

    await user.type(screen.getByLabelText(/email/i), "po@test.local");
    await user.type(screen.getByLabelText(/password/i), "akb1_demo_password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/home"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows the 401 detail inline on bad credentials", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ detail: "Invalid email or password" }), {
        status: 401,
      })) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<LoginForm redirectTo="/home" />);
    await user.type(screen.getByLabelText(/email/i), "po@test.local");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Invalid email or password");
    expect(alert.getAttribute("data-status")).toBe("401");
    expect(replace).not.toHaveBeenCalled();
  });

  it("renders Retry-After countdown on 429 lockout", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ detail: "Locked out", retryAfter: "120" }),
        { status: 429, headers: { "Retry-After": "120" } },
      )) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<LoginForm redirectTo="/home" />);
    await user.type(screen.getByLabelText(/email/i), "po@test.local");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/120 seconds/);
    expect(alert.getAttribute("data-status")).toBe("429");
  });
});
