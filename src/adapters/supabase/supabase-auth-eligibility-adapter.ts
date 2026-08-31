import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createEmailAuthEligibility,
  createOnboardingEligibility,
  reauthenticationRequiredEligibility,
  unauthenticatedEligibility,
  type AuthEligibility,
} from "../../domain/auth/auth-eligibility";
import type { Database } from "../../infrastructure/supabase/database.generated";
import type {
  ApplicationErrorCode,
  ApplicationResult,
} from "../../ports/application-result";
import {
  classifySupabaseAuthError,
  classifySupabaseQueryError,
  classifySupabaseThrownError,
} from "./supabase-error-mapping";

type Result = ApplicationResult<AuthEligibility>;
const success = (value: AuthEligibility): Result => ({ ok: true, value });
const failure = (code: ApplicationErrorCode): Result => ({
  ok: false,
  error: { code },
});

function isIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      value,
    )
  );
}

function accountSnapshot(
  value: unknown,
):
  | Readonly<{ userId: string; status: "pending" | "active" | "deleting" }>
  | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const userId = Object.getOwnPropertyDescriptor(value, "user_id");
  const status = Object.getOwnPropertyDescriptor(value, "status");
  if (!userId || !("value" in userId) || !status || !("value" in status))
    return undefined;
  const userIdValue: unknown = userId.value;
  const statusValue: unknown = status.value;
  if (
    !isIdentifier(userIdValue) ||
    (statusValue !== "pending" &&
      statusValue !== "active" &&
      statusValue !== "deleting")
  )
    return undefined;
  return { userId: userIdValue, status: statusValue };
}

function userSnapshot(
  value: unknown,
):
  | Readonly<{ id: string; email: string; emailConfirmedAt?: string }>
  | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const id = Object.getOwnPropertyDescriptor(value, "id");
  const email = Object.getOwnPropertyDescriptor(value, "email");
  const emailConfirmedAt = Object.getOwnPropertyDescriptor(
    value,
    "email_confirmed_at",
  );
  if (!id || !("value" in id) || !email || !("value" in email))
    return undefined;
  const idValue: unknown = id.value;
  const emailValue: unknown = email.value;
  if (!isIdentifier(idValue) || typeof emailValue !== "string")
    return undefined;
  if (!emailConfirmedAt) return { id: idValue, email: emailValue };
  if (!("value" in emailConfirmedAt)) return undefined;
  const confirmedValue: unknown = emailConfirmedAt.value;
  if (confirmedValue === null || confirmedValue === undefined)
    return { id: idValue, email: emailValue };
  if (typeof confirmedValue !== "string" || confirmedValue.trim() === "")
    return undefined;
  return {
    id: idValue,
    email: emailValue,
    emailConfirmedAt: confirmedValue,
  };
}

function emailState(
  kind: "verification_required" | "active" | "deleting",
  email: string,
): Result {
  const state = createEmailAuthEligibility(kind, email);
  return state.ok ? success(state.value) : failure("integrity_failure");
}

function onboardingState(
  email: string,
  reason: "missing_account" | "pending_account",
): Result {
  const state = createOnboardingEligibility(email, reason);
  return state.ok ? success(state.value) : failure("integrity_failure");
}

export function createSupabaseAuthEligibilityAdapter(
  client: SupabaseClient<Database>,
): Readonly<{ read(): Promise<Result> }> {
  return Object.freeze({
    async read(): Promise<Result> {
      let local: Awaited<ReturnType<typeof client.auth.getSession>>;
      try {
        local = await client.auth.getSession();
      } catch (error) {
        const code = classifySupabaseThrownError(error);
        return code === "authentication_expired"
          ? success(reauthenticationRequiredEligibility())
          : failure(code);
      }
      try {
        if (local.error) {
          const code = classifySupabaseAuthError(local.error);
          if (code === "network_failure" || code === "unavailable")
            return failure(code);
          return success(
            local.data.session
              ? reauthenticationRequiredEligibility()
              : unauthenticatedEligibility(),
          );
        }
        if (!local.data.session) return success(unauthenticatedEligibility());
      } catch {
        return failure("integrity_failure");
      }

      let verified: Awaited<ReturnType<typeof client.auth.getUser>>;
      try {
        verified = await client.auth.getUser();
      } catch (error) {
        const code = classifySupabaseThrownError(error);
        return code === "authentication_expired"
          ? success(reauthenticationRequiredEligibility())
          : failure(code);
      }
      let user: ReturnType<typeof userSnapshot>;
      try {
        if (verified.error) {
          const code = classifySupabaseAuthError(verified.error);
          return code === "authentication_expired"
            ? success(reauthenticationRequiredEligibility())
            : failure(code);
        }
        user = userSnapshot(verified.data.user);
        if (!user) return failure("integrity_failure");
        if (!user.emailConfirmedAt)
          return emailState("verification_required", user.email);
      } catch {
        return failure("integrity_failure");
      }

      let account: Readonly<{
        data: unknown;
        error: unknown;
        status: number;
      }>;
      try {
        account = await client
          .from("application_accounts")
          .select("user_id,status")
          .eq("user_id", user.id)
          .maybeSingle();
      } catch (error) {
        const code = classifySupabaseThrownError(error);
        return code === "authentication_expired"
          ? success(reauthenticationRequiredEligibility())
          : failure(code);
      }
      try {
        if (account.error) {
          const code = classifySupabaseQueryError(
            account.error,
            account.status,
          );
          return code === "authentication_expired"
            ? success(reauthenticationRequiredEligibility())
            : failure(code);
        }
        if (account.data === null)
          return onboardingState(user.email, "missing_account");
        const snapshot = accountSnapshot(account.data);
        if (!snapshot || snapshot.userId !== user.id)
          return failure("integrity_failure");
        if (snapshot.status === "pending")
          return onboardingState(user.email, "pending_account");
        return emailState(snapshot.status, user.email);
      } catch {
        return failure("integrity_failure");
      }
    },
  });
}
