import type { TrustedOnboardingOutcome } from "../domain/auth/trusted-onboarding";
import type { ApplicationResult } from "./application-result";

export interface TrustedOnboardingPort {
  run(): Promise<ApplicationResult<TrustedOnboardingOutcome>>;
}
