import { describe, expect, it } from "vitest";
import { bootstrapAuth } from "../../../../src/application/auth/bootstrap-auth";
import {
  createEmailAuthEligibility,
  createOnboardingEligibility,
  reauthenticationRequiredEligibility,
  unauthenticatedEligibility,
  type AuthEligibility,
} from "../../../../src/domain/auth/auth-eligibility";
import { activeOnboardingOutcome } from "../../../../src/domain/auth/trusted-onboarding";
import type { ApplicationResult } from "../../../../src/ports/application-result";
import type { AuthEligibilityPort } from "../../../../src/ports/auth-eligibility-port";
import type { TrustedOnboardingPort } from "../../../../src/ports/trusted-onboarding-port";

function emailState(kind: "verification_required" | "active" | "deleting") {
  const result = createEmailAuthEligibility(kind, "person@example.test");
  if (!result.ok) throw new Error("fixture failure");
  return result.value;
}

function onboardingState(reason: "missing_account" | "pending_account") {
  const result = createOnboardingEligibility("person@example.test", reason);
  if (!result.ok) throw new Error("fixture failure");
  return result.value;
}

function eligibilityPort(
  results: Array<ApplicationResult<AuthEligibility>>,
  calls: string[],
): AuthEligibilityPort {
  return {
    read: () => {
      calls.push("eligibility");
      const result = results.shift();
      if (!result) return Promise.reject(new Error("unexpected read"));
      return Promise.resolve(result);
    },
  };
}

function onboardingPort(
  result: ReturnType<TrustedOnboardingPort["run"]>,
  calls: string[],
): TrustedOnboardingPort {
  return {
    run: () => {
      calls.push("onboarding");
      return result;
    },
  };
}

const success = (
  value: AuthEligibility,
): ApplicationResult<AuthEligibility> => ({
  ok: true,
  value,
});

describe("bootstrapAuth", () => {
  it.each([
    unauthenticatedEligibility(),
    reauthenticationRequiredEligibility(),
    emailState("verification_required"),
    emailState("active"),
    emailState("deleting"),
  ])(
    "resolves non-onboarding eligibility %# without onboarding",
    async (state) => {
      const calls: string[] = [];
      const result = await bootstrapAuth(
        eligibilityPort([success(state)], calls),
        onboardingPort(
          Promise.resolve({ ok: true, value: activeOnboardingOutcome() }),
          calls,
        ),
      );
      expect(result).toEqual({ kind: "resolved", eligibility: state });
      expect(calls).toEqual(["eligibility"]);
    },
  );

  it.each(["missing_account", "pending_account"] as const)(
    "runs %s onboarding once and requires a refreshed active state",
    async (reason) => {
      const calls: string[] = [];
      const result = await bootstrapAuth(
        eligibilityPort(
          [success(onboardingState(reason)), success(emailState("active"))],
          calls,
        ),
        onboardingPort(
          Promise.resolve({ ok: true, value: activeOnboardingOutcome() }),
          calls,
        ),
      );
      expect(result).toEqual({
        kind: "resolved",
        eligibility: { kind: "active", email: "person@example.test" },
      });
      expect(calls).toEqual(["eligibility", "onboarding", "eligibility"]);
    },
  );

  it("distinguishes initial eligibility, onboarding, and post-onboarding failures", async () => {
    const initialCalls: string[] = [];
    await expect(
      bootstrapAuth(
        eligibilityPort(
          [{ ok: false, error: { code: "network_failure" } }],
          initialCalls,
        ),
        onboardingPort(
          Promise.resolve({ ok: true, value: activeOnboardingOutcome() }),
          initialCalls,
        ),
      ),
    ).resolves.toEqual({
      kind: "eligibility_failed",
      stage: "initial",
      error: { code: "network_failure" },
    });

    const onboardingCalls: string[] = [];
    await expect(
      bootstrapAuth(
        eligibilityPort(
          [success(onboardingState("pending_account"))],
          onboardingCalls,
        ),
        onboardingPort(
          Promise.resolve({ ok: false, error: { code: "unavailable" } }),
          onboardingCalls,
        ),
      ),
    ).resolves.toEqual({
      kind: "onboarding_failed",
      reason: "pending_account",
      error: { code: "unavailable" },
    });

    const refreshCalls: string[] = [];
    await expect(
      bootstrapAuth(
        eligibilityPort(
          [
            success(onboardingState("missing_account")),
            { ok: false, error: { code: "unavailable" } },
          ],
          refreshCalls,
        ),
        onboardingPort(
          Promise.resolve({ ok: true, value: activeOnboardingOutcome() }),
          refreshCalls,
        ),
      ),
    ).resolves.toEqual({
      kind: "eligibility_failed",
      stage: "post_onboarding",
      error: { code: "unavailable" },
    });
  });

  it.each([
    unauthenticatedEligibility(),
    reauthenticationRequiredEligibility(),
    emailState("verification_required"),
    emailState("deleting"),
    onboardingState("pending_account"),
  ])("fails closed when post-onboarding refresh is %#", async (state) => {
    const calls: string[] = [];
    await expect(
      bootstrapAuth(
        eligibilityPort(
          [success(onboardingState("missing_account")), success(state)],
          calls,
        ),
        onboardingPort(
          Promise.resolve({ ok: true, value: activeOnboardingOutcome() }),
          calls,
        ),
      ),
    ).resolves.toEqual({
      kind: "eligibility_failed",
      stage: "post_onboarding",
      error: { code: "integrity_failure" },
    });
    expect(calls).toEqual(["eligibility", "onboarding", "eligibility"]);
  });

  it.each([
    [
      "forged success",
      () =>
        Promise.resolve({
          ok: true,
          value: { kind: "active", email: "forged@example.test" },
        }),
    ],
    [
      "accessor result",
      () =>
        Promise.resolve(Object.defineProperty({}, "ok", { get: () => true })),
    ],
    ["rejected read", () => Promise.reject(new Error("provider detail"))],
  ] as const)(
    "fails closed for malformed post-onboarding %s",
    async (_label, malformedRead) => {
      const calls: string[] = [];
      let readCount = 0;
      const port = {
        read: () => {
          calls.push("eligibility");
          readCount += 1;
          return readCount === 1
            ? Promise.resolve(success(onboardingState("missing_account")))
            : malformedRead();
        },
      } as AuthEligibilityPort;

      await expect(
        bootstrapAuth(
          port,
          onboardingPort(
            Promise.resolve({ ok: true, value: activeOnboardingOutcome() }),
            calls,
          ),
        ),
      ).resolves.toEqual({
        kind: "eligibility_failed",
        stage: "post_onboarding",
        error: { code: "integrity_failure" },
      });
      expect(calls).toEqual(["eligibility", "onboarding", "eligibility"]);
    },
  );
});
