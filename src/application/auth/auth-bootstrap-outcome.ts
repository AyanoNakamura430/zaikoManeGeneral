import {
  isAuthenticAuthEligibility,
  type AuthEligibility,
  type OnboardingReason,
} from "../../domain/auth/auth-eligibility";
import type { ApplicationErrorCode } from "../../ports/application-result";

export type AuthBootstrapOutcome =
  | Readonly<{ kind: "resolved"; eligibility: AuthEligibility }>
  | Readonly<{
      kind: "eligibility_failed";
      stage: "initial" | "post_onboarding";
      error: Readonly<{ code: ApplicationErrorCode }>;
    }>
  | Readonly<{
      kind: "onboarding_failed";
      reason: OnboardingReason;
      error: Readonly<{ code: ApplicationErrorCode }>;
    }>;

const authenticOutcomes = new WeakSet<object>();
const errorCodes = new Set<ApplicationErrorCode>([
  "authentication_expired",
  "network_failure",
  "unavailable",
  "integrity_failure",
]);

function register<T extends AuthBootstrapOutcome>(outcome: T): T {
  const frozen = Object.freeze(outcome);
  authenticOutcomes.add(frozen);
  return frozen;
}

export function resolvedAuthBootstrap(
  eligibility: unknown,
): AuthBootstrapOutcome {
  return isAuthenticAuthEligibility(eligibility)
    ? register({ kind: "resolved", eligibility })
    : eligibilityFailed("initial", "integrity_failure");
}

export function eligibilityFailed(
  stage: "initial" | "post_onboarding",
  code: ApplicationErrorCode,
): AuthBootstrapOutcome {
  if (
    (stage !== "initial" && stage !== "post_onboarding") ||
    !errorCodes.has(code)
  )
    return register({
      kind: "eligibility_failed",
      stage: "initial",
      error: Object.freeze({ code: "integrity_failure" }),
    });
  return register({
    kind: "eligibility_failed",
    stage,
    error: Object.freeze({ code }),
  });
}

export function onboardingFailed(
  reason: OnboardingReason,
  code: ApplicationErrorCode,
): AuthBootstrapOutcome {
  if (
    (reason !== "missing_account" && reason !== "pending_account") ||
    !errorCodes.has(code)
  )
    return eligibilityFailed("initial", "integrity_failure");
  return register({
    kind: "onboarding_failed",
    reason,
    error: Object.freeze({ code }),
  });
}

export function isAuthenticAuthBootstrapOutcome(
  value: unknown,
): value is AuthBootstrapOutcome {
  return (
    value !== null && typeof value === "object" && authenticOutcomes.has(value)
  );
}
