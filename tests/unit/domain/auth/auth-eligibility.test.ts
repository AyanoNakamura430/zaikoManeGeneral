import { describe, expect, it } from "vitest";
import {
  createEmailAuthEligibility,
  createOnboardingEligibility,
  isAuthenticAuthEligibility,
  reauthenticationRequiredEligibility,
  unauthenticatedEligibility,
} from "../../../../src/domain/auth/auth-eligibility";

describe("Auth eligibility", () => {
  it("creates immutable authentic terminal states", () => {
    for (const state of [
      unauthenticatedEligibility(),
      reauthenticationRequiredEligibility(),
    ]) {
      expect(isAuthenticAuthEligibility(state)).toBe(true);
      expect(Object.isFrozen(state)).toBe(true);
    }
  });

  it.each(["verification_required", "active", "deleting"] as const)(
    "creates an authentic %s state with email",
    (kind) => {
      const result = createEmailAuthEligibility(kind, "person@example.test");
      expect(result).toMatchObject({
        ok: true,
        value: { kind, email: "person@example.test" },
      });
      if (result.ok)
        expect(isAuthenticAuthEligibility(result.value)).toBe(true);
    },
  );

  it("distinguishes missing and pending onboarding accounts", () => {
    expect(
      createOnboardingEligibility("person@example.test", "missing_account"),
    ).toMatchObject({
      ok: true,
      value: { kind: "onboarding_required", reason: "missing_account" },
    });
    expect(
      createOnboardingEligibility("person@example.test", "pending_account"),
    ).toMatchObject({
      ok: true,
      value: { kind: "onboarding_required", reason: "pending_account" },
    });
  });

  it("rejects blank email and unknown onboarding reasons", () => {
    const unknownKind = createEmailAuthEligibility(
      "unknown" as never,
      "person@example.test",
    );
    expect(unknownKind).toEqual({
      ok: false,
      error: { code: "invalid_auth_eligibility" },
    });
    expect(createEmailAuthEligibility("active", "　").ok).toBe(false);
    expect(
      createOnboardingEligibility("person@example.test", "unknown").ok,
    ).toBe(false);
    expect(isAuthenticAuthEligibility({ kind: "active" })).toBe(false);
  });
});
