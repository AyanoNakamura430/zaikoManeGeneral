import { describe, expect, it } from "vitest";
import {
  eligibilityFailed,
  isAuthenticAuthBootstrapOutcome,
  onboardingFailed,
  resolvedAuthBootstrap,
} from "../../../../src/application/auth/auth-bootstrap-outcome";
import {
  createEmailAuthEligibility,
  unauthenticatedEligibility,
} from "../../../../src/domain/auth/auth-eligibility";

describe("Auth bootstrap outcome", () => {
  it("creates immutable authentic resolved and failure outcomes", () => {
    for (const outcome of [
      resolvedAuthBootstrap(unauthenticatedEligibility()),
      eligibilityFailed("post_onboarding", "network_failure"),
      onboardingFailed("pending_account", "unavailable"),
    ]) {
      expect(isAuthenticAuthBootstrapOutcome(outcome)).toBe(true);
      expect(Object.isFrozen(outcome)).toBe(true);
      if ("error" in outcome) expect(Object.isFrozen(outcome.error)).toBe(true);
    }
  });

  it("fails closed for forged eligibility and invalid runtime arguments", () => {
    expect(resolvedAuthBootstrap({ kind: "active" })).toMatchObject({
      kind: "eligibility_failed",
      error: { code: "integrity_failure" },
    });
    expect(eligibilityFailed("unknown" as never, "unavailable")).toMatchObject({
      kind: "eligibility_failed",
      stage: "initial",
      error: { code: "integrity_failure" },
    });
    expect(onboardingFailed("unknown" as never, "unavailable")).toMatchObject({
      kind: "eligibility_failed",
      error: { code: "integrity_failure" },
    });
    expect(isAuthenticAuthBootstrapOutcome({ kind: "resolved" })).toBe(false);
  });

  it("preserves an authentic active eligibility", () => {
    const eligibility = createEmailAuthEligibility(
      "active",
      "person@example.test",
    );
    if (!eligibility.ok) throw new Error("fixture failure");
    expect(resolvedAuthBootstrap(eligibility.value)).toEqual({
      kind: "resolved",
      eligibility: { kind: "active", email: "person@example.test" },
    });
  });
});
