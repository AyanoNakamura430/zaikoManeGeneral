import { describe, expect, it } from "vitest";
import { runTrustedOnboarding } from "../../../../src/application/auth/run-trusted-onboarding";
import { activeOnboardingOutcome } from "../../../../src/domain/auth/trusted-onboarding";
import type { TrustedOnboardingPort } from "../../../../src/ports/trusted-onboarding-port";

const port = (result: unknown): TrustedOnboardingPort => ({
  run: () => Promise.resolve(result as never),
});

describe("runTrustedOnboarding", () => {
  it("returns the canonical active result", async () => {
    await expect(
      runTrustedOnboarding(
        port({ ok: true, value: activeOnboardingOutcome() }),
      ),
    ).resolves.toEqual({ ok: true, value: { kind: "active" } });
  });

  it.each([
    "authentication_expired",
    "network_failure",
    "unavailable",
  ] as const)("preserves the safe %s error", async (code) => {
    await expect(
      runTrustedOnboarding(port({ ok: false, error: { code } })),
    ).resolves.toEqual({ ok: false, error: { code } });
  });

  it("fails closed for malformed, forged, accessor, and thrown contracts", async () => {
    const malformed = [
      null,
      {},
      { ok: "true" },
      { ok: true, value: { kind: "pending" } },
      { ok: false, error: { code: "secret-provider-error" } },
      Object.defineProperty({}, "ok", { get: () => true }),
    ];
    for (const result of malformed)
      await expect(runTrustedOnboarding(port(result))).resolves.toEqual({
        ok: false,
        error: { code: "integrity_failure" },
      });
    await expect(
      runTrustedOnboarding({
        run: () => Promise.reject(new Error("sensitive")),
      }),
    ).resolves.toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
  });
});
