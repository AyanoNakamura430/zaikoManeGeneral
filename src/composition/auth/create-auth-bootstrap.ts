import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAuthEligibilityAdapter } from "../../adapters/supabase/supabase-auth-eligibility-adapter";
import { createSupabaseTrustedOnboardingAdapter } from "../../adapters/supabase/supabase-trusted-onboarding-adapter";
import type { AuthBootstrapOutcome } from "../../application/auth/auth-bootstrap-outcome";
import { bootstrapAuth } from "../../application/auth/bootstrap-auth";
import type { Database } from "../../infrastructure/supabase/database.generated";

export type AuthBootstrap = Readonly<{
  run(): Promise<AuthBootstrapOutcome>;
}>;

export function createAuthBootstrap(
  client: SupabaseClient<Database>,
): AuthBootstrap {
  const eligibilityPort = createSupabaseAuthEligibilityAdapter(client);
  const onboardingPort = createSupabaseTrustedOnboardingAdapter(client);
  return Object.freeze({
    run: () => bootstrapAuth(eligibilityPort, onboardingPort),
  });
}
