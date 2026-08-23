import {
  matchesInventoryFilter,
  isAuthenticInventoryFilter,
  type InventoryFilter,
} from "../filter/inventory-filter";
import {
  matchesPurchaseDate,
  isAuthenticPurchaseDateRange,
  type PurchaseDateRange,
} from "../filter/purchase-date-filter";
import {
  assembleItemSearchFields,
  type ItemSearchInput,
} from "../search/item-search-fields";
import {
  matchesSearchQuery,
  parseSearchQuery,
  type SearchQuery,
} from "../search/search-query";

export type InventoryQuery = Readonly<{
  search?: SearchQuery;
  filter?: InventoryFilter;
  purchaseDate?: PurchaseDateRange;
}>;
export type InventoryQueryError = Readonly<{
  code: "invalid_query" | "invalid_document" | "unknown_category_template";
  categoryKey?: string;
}>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: InventoryQueryError };
export function validateInventoryQuery(input: unknown): Result<InventoryQuery> {
  if (!isObject(input)) return { ok: false, error: { code: "invalid_query" } };
  try {
    const components = readQueryComponents(input);
    if (
      components.search !== undefined &&
      !isValidSearchQuery(components.search)
    )
      return { ok: false, error: { code: "invalid_query" } };
    if (
      components.filter !== undefined &&
      !isAuthenticInventoryFilter(components.filter)
    )
      return { ok: false, error: { code: "invalid_query" } };
    if (
      components.purchaseDate !== undefined &&
      !isAuthenticPurchaseDateRange(components.purchaseDate)
    )
      return { ok: false, error: { code: "invalid_query" } };
    return {
      ok: true,
      value: Object.freeze({
        ...(components.search === undefined
          ? {}
          : { search: components.search }),
        ...(components.filter === undefined
          ? {}
          : { filter: components.filter }),
        ...(components.purchaseDate === undefined
          ? {}
          : { purchaseDate: components.purchaseDate }),
      }),
    };
  } catch {
    return { ok: false, error: { code: "invalid_query" } };
  }
}
type QueryComponents = {
  search: unknown;
  filter: unknown;
  purchaseDate: unknown;
};

function isObject(value: unknown): value is object {
  return value !== null && typeof value === "object";
}

function isValidSearchQuery(value: unknown): value is SearchQuery {
  if (!isObject(value) || !Object.isFrozen(value)) return false;
  const candidate = value as {
    normalized?: unknown;
    tokens?: readonly unknown[];
  };
  if (
    typeof candidate.normalized !== "string" ||
    !Array.isArray(candidate.tokens) ||
    !Object.isFrozen(candidate.tokens) ||
    !candidate.tokens.every((token) => typeof token === "string")
  )
    return false;
  const expected = parseSearchQuery(candidate.normalized);
  return (
    expected.normalized === candidate.normalized &&
    expected.tokens.length === candidate.tokens.length &&
    expected.tokens.every((token, index) => token === candidate.tokens?.[index])
  );
}

export function matchesInventoryQuery(
  query: InventoryQuery,
  item: unknown,
): Result<boolean> {
  if (!isObject(query)) return { ok: false, error: { code: "invalid_query" } };
  if (!isObject(item))
    return { ok: false, error: { code: "invalid_document" } };
  const validated = validateInventoryQuery(query);
  if (!validated.ok) return validated;
  query = validated.value;
  let components: QueryComponents;
  try {
    components = readQueryComponents(query);
  } catch {
    return { ok: false, error: { code: "invalid_query" } };
  }
  try {
    if (
      components.search !== undefined &&
      !isValidSearchQuery(components.search)
    )
      return { ok: false, error: { code: "invalid_query" } };
  } catch {
    return { ok: false, error: { code: "invalid_query" } };
  }
  try {
    const assembled = assembleItemSearchFields(item as ItemSearchInput);
    if (!assembled.ok) return assembled;
    const fields = assembled.value;
    if (
      components.search !== undefined &&
      !matchesSearchQuery(components.search, fields)
    )
      return { ok: true, value: false };
    if (
      components.filter !== undefined &&
      !matchesInventoryFilter(components.filter as InventoryFilter, item)
    )
      return { ok: true, value: false };
    if (
      components.purchaseDate !== undefined &&
      !matchesPurchaseDate(
        components.purchaseDate as PurchaseDateRange,
        (item as { purchaseDate?: unknown }).purchaseDate,
      )
    )
      return { ok: true, value: false };
    return { ok: true, value: true };
  } catch {
    return { ok: false, error: { code: "invalid_document" } };
  }
}

function readQueryComponents(query: object): QueryComponents {
  const components = {} as QueryComponents;
  for (const key of ["search", "filter", "purchaseDate"] as const) {
    if (!(key in query)) {
      components[key] = undefined;
      continue;
    }
    const descriptor = Object.getOwnPropertyDescriptor(query, key);
    if (!descriptor || !("value" in descriptor))
      throw new Error("invalid query");
    components[key] = descriptor.value;
  }
  return components;
}
