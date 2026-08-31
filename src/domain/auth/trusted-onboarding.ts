export type TrustedOnboardingOutcome = Readonly<{ kind: "active" }>;

const outcome: TrustedOnboardingOutcome = Object.freeze({ kind: "active" });

export function activeOnboardingOutcome(): TrustedOnboardingOutcome {
  return outcome;
}

export function isTrustedOnboardingOutcome(
  value: unknown,
): value is TrustedOnboardingOutcome {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return false;
  const keys = Reflect.ownKeys(value);
  if (keys.length !== 1 || keys[0] !== "kind") return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "kind");
  return Boolean(
    descriptor && "value" in descriptor && descriptor.value === "active",
  );
}
