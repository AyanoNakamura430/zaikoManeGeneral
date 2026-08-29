import {
  matchesInventoryQuery,
  validateInventoryQuery,
  type InventoryQuery,
} from "../../domain/inventory/inventory-query";
import type { ApplicationErrorCode } from "../shared/application-error";
import {
  authenticationExpired,
  loaded,
  loadError,
  noResults,
  trueEmpty,
  type InventoryCollectionState,
} from "./inventory-collection";
import type { InventoryReadPort } from "./inventory-read-port";
import {
  createInventorySort,
  isCompatibleInventorySort,
  isAuthenticInventorySort,
  type InventorySort,
} from "../../domain/inventory/inventory-sort";
import { sortInventory } from "../../domain/inventory/sort-inventory";
const codes = new Set<ApplicationErrorCode>([
  "authentication_expired",
  "unavailable",
  "network_failure",
  "integrity_failure",
]);
const unwrap = <T>(result: unknown): T => {
  if (
    !result ||
    typeof result !== "object" ||
    !("ok" in result) ||
    result.ok !== true
  )
    throw new Error("integrity");
  return (result as unknown as { value: T }).value;
};
const integrity = <T>(): InventoryCollectionState<T> =>
  unwrap(loadError("integrity_failure"));

function readOwnDataProperty(value: object, key: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  if (!descriptor || !("value" in descriptor)) throw new Error("integrity");
  return descriptor.value;
}

export async function listInventory<T>(
  port: InventoryReadPort<T>,
  query: InventoryQuery,
  requestedSort?: InventorySort,
): Promise<InventoryCollectionState<T>> {
  const validated = validateInventoryQuery(query);
  if (!validated.ok) return integrity();
  query = validated.value;
  const sortResult =
    requestedSort === undefined
      ? createInventorySort({ field: "created_at", direction: "desc" })
      : isAuthenticInventorySort(requestedSort)
        ? { ok: true as const, value: requestedSort }
        : { ok: false as const };
  if (!sortResult.ok) return integrity();
  const sort = sortResult.value;
  if (!isCompatibleInventorySort(sort, query.filter)) return integrity();
  try {
    const raw: unknown = await port.readAll();
    if (!raw || typeof raw !== "object") return integrity();
    const ok = readOwnDataProperty(raw, "ok");
    if (ok === false) {
      const error = readOwnDataProperty(raw, "error");
      if (!error || typeof error !== "object") return integrity();
      const code = readOwnDataProperty(error, "code");
      if (code === "authentication_expired") return authenticationExpired();
      if (typeof code !== "string" || !codes.has(code as ApplicationErrorCode))
        return integrity();
      return unwrap(
        loadError(
          code as "unavailable" | "network_failure" | "integrity_failure",
        ),
      );
    }
    if (ok !== true) return integrity();
    const value = readOwnDataProperty(raw, "value");
    if (!Array.isArray(value)) return integrity();
    const source = Array.from(value) as T[];
    if (source.length === 0) {
      const sorted = sortInventory(sort, source, query.filter);
      if (!sorted.ok) return integrity();
      return unwrap(trueEmpty(0, []));
    }
    const filtered: T[] = [];
    for (const item of source) {
      const matched = matchesInventoryQuery(query, item);
      if (!matched.ok) return integrity();
      if (matched.value) filtered.push(item);
    }
    const sorted = sortInventory(sort, filtered, query.filter);
    if (!sorted.ok) return integrity();
    if (sorted.value.length === 0) return unwrap(noResults(source.length, []));
    return unwrap(loaded(sorted.value));
  } catch {
    return integrity();
  }
}
