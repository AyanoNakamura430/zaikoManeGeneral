import {
  activeOnboardingOutcome,
  isTrustedOnboardingOutcome,
  type TrustedOnboardingOutcome,
} from "../../domain/auth/trusted-onboarding";
import type {
  ApplicationErrorCode,
  ApplicationResult,
} from "../../ports/application-result";
import type { TrustedOnboardingPort } from "../../ports/trusted-onboarding-port";

const preservedErrors = new Set<ApplicationErrorCode>([
  "authentication_expired",
  "network_failure",
  "unavailable",
]);

const integrityFailure = (): ApplicationResult<TrustedOnboardingOutcome> => ({
  ok: false,
  error: { code: "integrity_failure" },
});

function own(value: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor || !("value" in descriptor)) throw new Error("integrity");
  return descriptor.value;
}

export async function runTrustedOnboarding(
  port: TrustedOnboardingPort,
): Promise<ApplicationResult<TrustedOnboardingOutcome>> {
  try {
    const result: unknown = await port.run();
    if (!result || typeof result !== "object") return integrityFailure();
    const ok = own(result, "ok");
    if (ok === true) {
      const value = own(result, "value");
      return isTrustedOnboardingOutcome(value)
        ? { ok: true, value: activeOnboardingOutcome() }
        : integrityFailure();
    }
    if (ok !== false) return integrityFailure();
    const error = own(result, "error");
    if (!error || typeof error !== "object") return integrityFailure();
    const code = own(error, "code");
    return typeof code === "string" &&
      preservedErrors.has(code as ApplicationErrorCode)
      ? {
          ok: false,
          error: {
            code: code as Exclude<ApplicationErrorCode, "integrity_failure">,
          },
        }
      : integrityFailure();
  } catch {
    return integrityFailure();
  }
}
