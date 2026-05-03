// @vitest-environment node
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { decodeSessionToken } from "@/lib/auth/session";

const SECRET = "test_jwt_secret_long_enough_for_hs256_padding_minimum";

beforeAll(() => {
  process.env.JWT_SECRET = SECRET;
});

afterEach(() => {
  process.env.JWT_SECRET = SECRET;
});

async function makeToken(claims: Record<string, unknown>): Promise<string> {
  const key = new TextEncoder().encode(SECRET);
  const builder = new SignJWT(claims).setProtectedHeader({ alg: "HS256" });
  return builder.sign(key);
}

describe("decodeSessionToken", () => {
  it("returns null for empty string", async () => {
    const result = await decodeSessionToken("");
    expect(result).toBeNull();
  });

  it("returns null for malformed token", async () => {
    const result = await decodeSessionToken("not.a.real.jwt");
    expect(result).toBeNull();
  });

  it("returns null for token signed with wrong secret", async () => {
    const otherKey = new TextEncoder().encode("other_secret_value_long_enough");
    const token = await new SignJWT({
      sub: "11111111-1111-1111-1111-111111111111",
      role: "PortfolioOwner",
      ap_flag: true,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(otherKey);
    const result = await decodeSessionToken(token);
    expect(result).toBeNull();
  });

  it("decodes a valid PO token", async () => {
    const token = await makeToken({
      sub: "11111111-1111-1111-1111-111111111111",
      role: "PortfolioOwner",
      ap_flag: true,
    });
    const result = await decodeSessionToken(token);
    expect(result).not.toBeNull();
    expect(result?.role).toBe("PortfolioOwner");
    expect(result?.apFlag).toBe(true);
  });

  it("returns null when role claim is unknown", async () => {
    const token = await makeToken({
      sub: "11111111-1111-1111-1111-111111111111",
      role: "Hacker",
      ap_flag: false,
    });
    const result = await decodeSessionToken(token);
    expect(result).toBeNull();
  });

  it("returns null when sub is missing", async () => {
    const token = await makeToken({ role: "ReadOnly" });
    const result = await decodeSessionToken(token);
    expect(result).toBeNull();
  });

  it("defaults apFlag to false when missing", async () => {
    const token = await makeToken({
      sub: "22222222-2222-2222-2222-222222222222",
      role: "ReadOnly",
    });
    const result = await decodeSessionToken(token);
    expect(result?.apFlag).toBe(false);
  });
});
