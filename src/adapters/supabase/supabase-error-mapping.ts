import {
  isAuthError,
  isAuthRetryableFetchError,
  isAuthSessionMissingError,
} from "@supabase/supabase-js";
import type { ApplicationErrorCode } from "../../ports/application-result";

export function classifySupabaseAuthError(
  error: unknown,
): ApplicationErrorCode {
  if (isAuthRetryableFetchError(error)) return "network_failure";
  if (isAuthSessionMissingError(error)) return "authentication_expired";
  if (error && typeof error === "object" && "status" in error) {
    const status = error.status;
    if (status === 401 || status === 403) return "authentication_expired";
  }
  return "unavailable";
}

export function classifySupabaseQueryError(
  error: unknown,
  status: number,
): ApplicationErrorCode {
  if (status === 401 || status === 403) return "authentication_expired";
  if (
    status === 0 ||
    (error !== null &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "PGRST000")
  )
    return "network_failure";
  return "unavailable";
}

export function classifySupabaseThrownError(
  error: unknown,
): ApplicationErrorCode {
  if (isAuthError(error)) return classifySupabaseAuthError(error);
  if (error instanceof TypeError) return "network_failure";
  if (error && typeof error === "object" && "status" in error) {
    const status = error.status;
    if (typeof status === "number")
      return classifySupabaseQueryError(error, status);
  }
  return "unavailable";
}
