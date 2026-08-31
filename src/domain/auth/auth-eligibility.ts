export type OnboardingReason = "missing_account" | "pending_account";

export type AuthEligibility =
  | Readonly<{ kind: "unauthenticated" }>
  | Readonly<{ kind: "reauthentication_required" }>
  | Readonly<{ kind: "verification_required"; email: string }>
  | Readonly<{
      kind: "onboarding_required";
      email: string;
      reason: OnboardingReason;
    }>
  | Readonly<{ kind: "active"; email: string }>
  | Readonly<{ kind: "deleting"; email: string }>;

export type AuthEligibilityResult =
  | { readonly ok: true; readonly value: AuthEligibility }
  | {
      readonly ok: false;
      readonly error: Readonly<{ code: "invalid_auth_eligibility" }>;
    };

const authentic = new WeakSet<object>();

function register<T extends AuthEligibility>(value: T): T {
  const frozen = Object.freeze(value);
  authentic.add(frozen);
  return frozen;
}

const unauthenticated = register({ kind: "unauthenticated" } as const);
const reauthenticationRequired = register({
  kind: "reauthentication_required",
} as const);

export function unauthenticatedEligibility(): AuthEligibility {
  return unauthenticated;
}

export function reauthenticationRequiredEligibility(): AuthEligibility {
  return reauthenticationRequired;
}

export function createEmailAuthEligibility(
  kind: "verification_required" | "active" | "deleting",
  email: unknown,
): AuthEligibilityResult {
  if (
    (kind !== "verification_required" &&
      kind !== "active" &&
      kind !== "deleting") ||
    typeof email !== "string" ||
    email.trim() === ""
  )
    return { ok: false, error: { code: "invalid_auth_eligibility" } };
  return { ok: true, value: register({ kind, email }) };
}

export function createOnboardingEligibility(
  email: unknown,
  reason: unknown,
): AuthEligibilityResult {
  if (
    typeof email !== "string" ||
    email.trim() === "" ||
    (reason !== "missing_account" && reason !== "pending_account")
  )
    return { ok: false, error: { code: "invalid_auth_eligibility" } };
  return {
    ok: true,
    value: register({ kind: "onboarding_required", email, reason }),
  };
}

export function isAuthenticAuthEligibility(
  value: unknown,
): value is AuthEligibility {
  return value !== null && typeof value === "object" && authentic.has(value);
}
