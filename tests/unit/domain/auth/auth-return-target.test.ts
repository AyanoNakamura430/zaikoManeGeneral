import { describe, expect, it } from "vitest";
import { parseAuthReturnTarget } from "../../../../src/domain/auth/auth-return-target";

const validStaticTargets = [
  "/inventory",
  "/items/new",
  "/categories",
  "/account",
] as const;
const validItemTargets = [
  "/items/123e4567-e89b-12d3-a456-426614174000",
  "/items/123E4567-E89B-12D3-A456-426614174000/edit",
] as const;

describe("auth return target", () => {
  it("accepts exact static targets", () => {
    for (const target of validStaticTargets) {
      expect(parseAuthReturnTarget(target)).toEqual({
        ok: true,
        value: target,
      });
    }
  });

  it("accepts canonical UUID item and edit targets while preserving spelling", () => {
    for (const target of validItemTargets) {
      const result = parseAuthReturnTarget(target);
      expect(result).toEqual({ ok: true, value: target });
      if (result.ok) expect(result.value).toBe(target);
    }
  });

  it("rejects public, root, and unknown routes", () => {
    for (const target of [
      "/",
      "/public",
      "/items",
      "/items/new/edit",
      "/admin",
    ]) {
      expect(parseAuthReturnTarget(target)).toEqual({
        ok: false,
        error: { code: "invalid_return_target" },
      });
    }
  });

  it("rejects unsafe URL forms and non-canonical separators", () => {
    const uuid = "123e4567-e89b-12d3-a456-426614174000";
    for (const target of [
      `https://example.test/items/${uuid}`,
      `//example.test/items/${uuid}`,
      `/items/${uuid}/`,
      `/items/${uuid}/edit/`,
      `/items/${uuid}?next=/account`,
      `/items/${uuid}#details`,
      `/items/${uuid}/%2Fedit`,
      `/items/${uuid}/../edit`,
      `/items/${uuid}/%2e%2e/edit`,
      `/items/${uuid}/%2E%2E/edit`,
      `/items/${uuid}/%5c/edit`,
      `/items/${uuid}/%5C/edit`,
      `/items/${uuid}\\edit`,
      `/items/${uuid}/\nedit`,
      "/inventory/../account",
      "/inventory/%2e%2e/account",
      "/inventory/%2E%2E/account",
      "/inventory/%5c/account",
      "/inventory/%5C/account",
      "/inventory／account",
      "/inventory∕account",
      "/inventory\0",
      "/inventory\r",
      "/inventory\t",
      "/inventory?next=/account",
      "/inventory#account",
      "/inventory/",
      `javascript:/items/${uuid}`,
      `http:/items/${uuid}`,
      `javascript:/${uuid}`,
      `http:/${uuid}`,
    ]) {
      expect(parseAuthReturnTarget(target).ok).toBe(false);
    }
  });

  it("rejects malformed UUIDs and non-string inputs", () => {
    for (const target of [
      "/items/123e4567-e89b-12d3-a456-42661417400",
      "/items/123e4567-e89b-12d3-a456-4266141740000",
      "/items/123e4567-e89b-12d3-a456-42661417400g",
      null,
      undefined,
      42,
      { value: "/inventory" },
    ]) {
      expect(parseAuthReturnTarget(target).ok).toBe(false);
    }
  });

  it("rejects hand-crafted branded values at compile time", () => {
    // @ts-expect-error AuthReturnTarget is parse-only and branded.
    const handCrafted: import("../../../../src/domain/auth/auth-return-target").AuthReturnTarget =
      "/inventory";
    expect(handCrafted).toBeDefined();
  });
});
