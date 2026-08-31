import type { AuthEligibilityPort } from "../../ports/auth-eligibility-port";
import type { TrustedOnboardingPort } from "../../ports/trusted-onboarding-port";
import {
  eligibilityFailed,
  onboardingFailed,
  resolvedAuthBootstrap,
  type AuthBootstrapOutcome,
} from "./auth-bootstrap-outcome";
import { loadAuthEligibility } from "./load-auth-eligibility";
import { runTrustedOnboarding } from "./run-trusted-onboarding";

export async function bootstrapAuth(
  eligibilityPort: AuthEligibilityPort,
  onboardingPort: TrustedOnboardingPort,
): Promise<AuthBootstrapOutcome> {
  const initial = await loadAuthEligibility(eligibilityPort);
  if (!initial.ok) return eligibilityFailed("initial", initial.error.code);
  if (initial.value.kind !== "onboarding_required")
    return resolvedAuthBootstrap(initial.value);

  const reason = initial.value.reason;
  const onboarding = await runTrustedOnboarding(onboardingPort);
  if (!onboarding.ok) return onboardingFailed(reason, onboarding.error.code);

  const refreshed = await loadAuthEligibility(eligibilityPort);
  if (!refreshed.ok)
    return eligibilityFailed("post_onboarding", refreshed.error.code);
  return refreshed.value.kind === "active"
    ? resolvedAuthBootstrap(refreshed.value)
    : eligibilityFailed("post_onboarding", "integrity_failure");
}
