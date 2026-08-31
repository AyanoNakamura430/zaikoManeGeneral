import { describe, expect, it } from "vitest";
import {
  activeOnboardingOutcome,
  isTrustedOnboardingOutcome,
} from "../../../../src/domain/auth/trusted-onboarding";

describe("trusted onboarding outcome", () => {
  it("provides one immutable canonical active outcome", () => {
    const first = activeOnboardingOutcome();
    expect(first).toBe(activeOnboardingOutcome());
    expect(first).toEqual({ kind: "active" });
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("accepts an exact data-only outcome and rejects malformed payloads", () => {
    expect(isTrustedOnboardingOutcome({ kind: "active" })).toBe(true);
    for (const value of [
      null,
      [],
      {},
      { kind: "pending" },
      { kind: "active", extra: true },
      Object.create({ kind: "active" }),
      Object.defineProperty({}, "kind", { get: () => "active" }),
    ])
      expect(isTrustedOnboardingOutcome(value)).toBe(false);
  });
});
