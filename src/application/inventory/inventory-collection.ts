import type {
  ApplicationErrorCode,
  ApplicationResult,
} from "../shared/application-error";

declare const collectionStateBrand: unique symbol;
export type InventoryCollectionState<T> =
  | Readonly<{ kind: "loading"; readonly [collectionStateBrand]: true }>
  | Readonly<{
      kind: "loaded";
      items: readonly T[];
      readonly [collectionStateBrand]: true;
    }>
  | Readonly<{ kind: "true_empty"; readonly [collectionStateBrand]: true }>
  | Readonly<{
      kind: "no_results";
      items: readonly T[];
      readonly [collectionStateBrand]: true;
    }>
  | Readonly<{
      kind: "authentication_expired";
      readonly [collectionStateBrand]: true;
    }>
  | Readonly<{
      kind: "load_error";
      error: Readonly<{
        code: Exclude<ApplicationErrorCode, "authentication_expired">;
      }>;
      readonly [collectionStateBrand]: true;
    }>;

const authenticStates = new WeakSet<object>();
const state = <T>(value: T): T => {
  const frozen = Object.freeze(value);
  authenticStates.add(frozen);
  return frozen;
};

export function loading<T = never>(): InventoryCollectionState<T> {
  return state({
    kind: "loading",
  }) as InventoryCollectionState<T>;
}
export function loaded<T>(
  items: readonly T[],
): ApplicationResult<InventoryCollectionState<T>> {
  if (!Array.isArray(items) || items.length === 0)
    return { ok: false, error: { code: "integrity_failure" } };
  return {
    ok: true,
    value: state({
      kind: "loaded",
      items: Object.freeze(Array.from(items)),
    }) as InventoryCollectionState<T>,
  };
}
export function trueEmpty<T>(
  sourceCount: number,
  items: readonly T[],
): ApplicationResult<InventoryCollectionState<T>> {
  if (
    !Number.isSafeInteger(sourceCount) ||
    sourceCount !== 0 ||
    !Array.isArray(items) ||
    items.length !== 0
  )
    return { ok: false, error: { code: "integrity_failure" } };
  return {
    ok: true,
    value: state({
      kind: "true_empty",
    }) as unknown as InventoryCollectionState<T>,
  };
}
export function noResults<T>(
  sourceCount: number,
  items: readonly T[],
): ApplicationResult<InventoryCollectionState<T>> {
  if (
    !Number.isSafeInteger(sourceCount) ||
    sourceCount <= 0 ||
    !Array.isArray(items) ||
    items.length !== 0
  )
    return { ok: false, error: { code: "integrity_failure" } };
  return {
    ok: true,
    value: state({
      kind: "no_results",
      items: Object.freeze([] as T[]),
    }) as InventoryCollectionState<T>,
  };
}
export function authenticationExpired<
  T = never,
>(): InventoryCollectionState<T> {
  return state({
    kind: "authentication_expired",
  }) as InventoryCollectionState<T>;
}
export function loadError<T = never>(
  code: Exclude<ApplicationErrorCode, "authentication_expired">,
): ApplicationResult<InventoryCollectionState<T>> {
  if (!["unavailable", "network_failure", "integrity_failure"].includes(code))
    return { ok: false, error: { code: "integrity_failure" } };
  return {
    ok: true,
    value: state({
      kind: "load_error",
      error: Object.freeze({ code }),
    }) as InventoryCollectionState<T>,
  };
}

export function isAuthenticCollectionState<T>(
  value: unknown,
): value is InventoryCollectionState<T> {
  return (
    value !== null && typeof value === "object" && authenticStates.has(value)
  );
}
