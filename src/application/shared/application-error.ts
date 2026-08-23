export type ApplicationErrorCode =
  | "authentication_expired"
  | "unavailable"
  | "network_failure"
  | "integrity_failure";

export type ApplicationError = Readonly<{ code: ApplicationErrorCode }>;

export type ApplicationResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ApplicationError };
