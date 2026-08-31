import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import {
  activeOnboardingOutcome,
  isTrustedOnboardingOutcome,
  type TrustedOnboardingOutcome,
} from "../../domain/auth/trusted-onboarding";
import type { Database } from "../../infrastructure/supabase/database.generated";
import type {
  ApplicationErrorCode,
  ApplicationResult,
} from "../../ports/application-result";
import type { TrustedOnboardingPort } from "../../ports/trusted-onboarding-port";

type Result = ApplicationResult<TrustedOnboardingOutcome>;
const failure = (code: ApplicationErrorCode): Result => ({
  ok: false,
  error: { code },
});

function httpStatus(error: FunctionsHttpError): number | undefined {
  const context: unknown = error.context;
  if (!context || typeof context !== "object") return undefined;
  if (context instanceof Response) {
    try {
      return context.status;
    } catch {
      return undefined;
    }
  }
  const descriptor = Object.getOwnPropertyDescriptor(context, "status");
  if (!descriptor || !("value" in descriptor)) return undefined;
  return typeof descriptor.value === "number" ? descriptor.value : undefined;
}

function classifyFunctionError(error: unknown): ApplicationErrorCode {
  if (error instanceof FunctionsFetchError) return "network_failure";
  if (error instanceof FunctionsRelayError) return "unavailable";
  if (error instanceof FunctionsHttpError) {
    const status = httpStatus(error);
    if (status === 401 || status === 403) return "authentication_expired";
    return status !== undefined && status >= 500
      ? "unavailable"
      : "integrity_failure";
  }
  return error instanceof TypeError ? "network_failure" : "unavailable";
}

export function createSupabaseTrustedOnboardingAdapter(
  client: SupabaseClient<Database>,
): TrustedOnboardingPort {
  return Object.freeze({
    async run(): Promise<Result> {
      let response: Awaited<
        ReturnType<typeof client.functions.invoke<unknown>>
      >;
      try {
        response = await client.functions.invoke<unknown>(
          "trusted-onboarding",
          { method: "POST" },
        );
      } catch (error) {
        return failure(classifyFunctionError(error));
      }
      try {
        if (response.error)
          return failure(classifyFunctionError(response.error));
        if (!isTrustedOnboardingOutcome(response.data))
          return failure("integrity_failure");
        return { ok: true, value: activeOnboardingOutcome() };
      } catch {
        return failure("integrity_failure");
      }
    },
  });
}
