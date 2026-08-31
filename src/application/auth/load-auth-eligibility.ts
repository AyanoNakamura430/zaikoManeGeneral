import {
  isAuthenticAuthEligibility,
  type AuthEligibility,
} from "../../domain/auth/auth-eligibility";
import type { ApplicationResult } from "../../ports/application-result";
import type { AuthEligibilityPort } from "../../ports/auth-eligibility-port";

const integrityFailure = (): ApplicationResult<AuthEligibility> => ({
  ok: false,
  error: { code: "integrity_failure" },
});

function own(value: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor || !("value" in descriptor)) throw new Error("integrity");
  return descriptor.value;
}

export async function loadAuthEligibility(
  port: AuthEligibilityPort,
): Promise<ApplicationResult<AuthEligibility>> {
  try {
    const result: unknown = await port.read();
    if (!result || typeof result !== "object") return integrityFailure();
    const ok = own(result, "ok");
    if (ok === true) {
      const value = own(result, "value");
      return isAuthenticAuthEligibility(value)
        ? { ok: true, value }
        : integrityFailure();
    }
    if (ok !== false) return integrityFailure();
    const error = own(result, "error");
    if (!error || typeof error !== "object") return integrityFailure();
    const code = own(error, "code");
    return code === "network_failure" || code === "unavailable"
      ? { ok: false, error: { code } }
      : integrityFailure();
  } catch {
    return integrityFailure();
  }
}
