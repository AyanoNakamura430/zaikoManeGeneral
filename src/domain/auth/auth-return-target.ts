const authReturnTargetBrand = Symbol("AuthReturnTarget");

export type AuthReturnTarget = string & {
  readonly [authReturnTargetBrand]: true;
};

export type AuthReturnTargetError = Readonly<{
  code: "invalid_return_target";
}>;

export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AuthReturnTargetError };

const staticTargets = new Set([
  "/inventory",
  "/items/new",
  "/categories",
  "/account",
]);
const uuid =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
const itemTargetPattern = new RegExp(`^/items/${uuid}(?:/edit)?$`);

function isValidTarget(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (staticTargets.has(value)) return true;
  return itemTargetPattern.test(value);
}

export function parseAuthReturnTarget(
  input: unknown,
): Result<AuthReturnTarget> {
  if (!isValidTarget(input)) {
    return {
      ok: false,
      error: { code: "invalid_return_target" },
    };
  }
  return { ok: true, value: input as AuthReturnTarget };
}
