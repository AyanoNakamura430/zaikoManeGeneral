import type { AuthEligibility } from "../domain/auth/auth-eligibility";
import type { ApplicationResult } from "./application-result";

export interface AuthEligibilityPort {
  read(): Promise<ApplicationResult<AuthEligibility>>;
}
