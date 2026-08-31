import { describe, expect, it } from "vitest";
import { loadAuthEligibility } from "../../../../src/application/auth/load-auth-eligibility";
import {
  createEmailAuthEligibility,
  unauthenticatedEligibility,
} from "../../../../src/domain/auth/auth-eligibility";
import type { AuthEligibilityPort } from "../../../../src/ports/auth-eligibility-port";

describe("loadAuthEligibility", () => {
  it("returns authentic states from the port", async () => {
    const port: AuthEligibilityPort = {
      read: () =>
        Promise.resolve({ ok: true, value: unauthenticatedEligibility() }),
    };
    await expect(loadAuthEligibility(port)).resolves.toEqual({
      ok: true,
      value: { kind: "unauthenticated" },
    });
  });

  it.each(["network_failure", "unavailable"] as const)(
    "preserves the provider-neutral %s error",
    async (code) => {
      const port: AuthEligibilityPort = {
        read: () => Promise.resolve({ ok: false, error: { code } }),
      };
      await expect(loadAuthEligibility(port)).resolves.toEqual({
        ok: false,
        error: { code },
      });
    },
  );

  it("fails closed for forged, malformed, throwing, and accessor results", async () => {
    const valid = createEmailAuthEligibility("active", "person@example.test");
    if (!valid.ok) throw new Error("fixture failure");
    const cases: unknown[] = [
      null,
      { ok: true, value: { kind: "active", email: "forged@example.test" } },
      { ok: false, error: { code: "authentication_expired" } },
      Object.defineProperty({ value: valid.value }, "ok", { get: () => true }),
    ];
    for (const value of cases) {
      const port = {
        read: () => Promise.resolve(value),
      } as unknown as AuthEligibilityPort;
      await expect(loadAuthEligibility(port)).resolves.toEqual({
        ok: false,
        error: { code: "integrity_failure" },
      });
    }
    const throwing: AuthEligibilityPort = {
      read: () => Promise.reject(new Error("provider detail")),
    };
    await expect(loadAuthEligibility(throwing)).resolves.toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
  });
});
