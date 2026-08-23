import { deriveStockStatus, type StockStatus } from "../inventory/stock-status";
import { validateQuantity, validateThreshold } from "../inventory/quantity";
import { parseUnitKind, type UnitKind } from "../inventory/unit";

declare const categoryIdBrand: unique symbol;
const filterBrand = Symbol("InventoryFilter");
const validFilters = new WeakSet<object>();
export function isAuthenticInventoryFilter(
  value: unknown,
): value is InventoryFilter {
  return value !== null && typeof value === "object" && validFilters.has(value);
}
export type CategoryId = string & { readonly [categoryIdBrand]: true };
export type CategorySelection =
  | { readonly kind: "category"; readonly id: CategoryId }
  | { readonly kind: "uncategorized" };
export type InventoryFilter = Readonly<{
  categories: readonly CategorySelection[];
  statuses: readonly StockStatus[];
  units: readonly UnitKind[];
  readonly [filterBrand]: true;
}>;
export type FilterError = Readonly<{ code: "invalid_filter" }>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: FilterError };

const statuses = new Set<StockStatus>(["out", "low", "available"]);

export function parseCategoryId(input: unknown): Result<CategoryId> {
  if (typeof input !== "string" || input.trim() === "")
    return { ok: false, error: { code: "invalid_filter" } };
  return { ok: true, value: input as CategoryId };
}

function selection(input: unknown): CategorySelection | undefined {
  if (!input || typeof input !== "object") return undefined;
  const value = input as { kind?: unknown; id?: unknown };
  if (value.kind === "uncategorized") return { kind: "uncategorized" };
  if (value.kind !== "category") return undefined;
  const id = parseCategoryId(value.id);
  return id.ok ? { kind: "category", id: id.value } : undefined;
}

export function createInventoryFilter(input: unknown): Result<InventoryFilter> {
  if (!input || typeof input !== "object")
    return { ok: false, error: { code: "invalid_filter" } };
  const value = input as {
    categories?: unknown;
    statuses?: unknown;
    units?: unknown;
  };
  const categories = value.categories ?? [];
  const rawStatuses = value.statuses ?? [];
  const units = value.units ?? [];
  if (
    !Array.isArray(categories) ||
    !Array.isArray(rawStatuses) ||
    !Array.isArray(units)
  )
    return { ok: false, error: { code: "invalid_filter" } };
  const parsedCategories = categories.map(selection);
  if (parsedCategories.some((item) => item === undefined))
    return { ok: false, error: { code: "invalid_filter" } };
  if (
    !rawStatuses.every(
      (item): item is StockStatus =>
        typeof item === "string" && statuses.has(item as StockStatus),
    )
  )
    return { ok: false, error: { code: "invalid_filter" } };
  const parsedUnits = units.map(parseUnitKind);
  if (parsedUnits.some((item) => !item.ok))
    return { ok: false, error: { code: "invalid_filter" } };
  const unitValues = parsedUnits.map((item) => {
    if (!item.ok) throw new Error("unreachable");
    return item.value;
  });
  const result = {
    ok: true,
    value: Object.freeze({
      categories: Object.freeze(
        (parsedCategories as CategorySelection[]).map((item) =>
          Object.freeze(item),
        ),
      ),
      statuses: Object.freeze([...rawStatuses]),
      units: Object.freeze(unitValues),
      [filterBrand]: true as const,
    }),
  } as const;
  validFilters.add(result.value);
  return result;
}

type InventoryItem = {
  categoryId: unknown;
  unit: unknown;
  quantity: unknown;
  threshold?: unknown;
};

function matchesCategory(
  filter: InventoryFilter,
  categoryId: unknown,
): boolean {
  if (filter.categories.length === 0) return true;
  return filter.categories.some((candidate) =>
    candidate.kind === "uncategorized"
      ? categoryId === null
      : categoryId === candidate.id,
  );
}

export function matchesInventoryFilter(
  filter: InventoryFilter,
  input: unknown,
): boolean {
  if (
    !filter ||
    typeof filter !== "object" ||
    !input ||
    typeof input !== "object"
  )
    return false;
  if (!isAuthenticInventoryFilter(filter)) return false;
  const item = input as InventoryItem;
  if (!matchesCategory(filter, item.categoryId)) return false;
  const unit = parseUnitKind(item.unit);
  if (!unit.ok) return false;
  if (typeof item.quantity !== "number") return false;
  if (item.threshold !== undefined && typeof item.threshold !== "number")
    return false;
  const quantity = validateQuantity(item.quantity, unit.value);
  if (!quantity.ok) return false;
  const threshold = validateThreshold(item.threshold, unit.value);
  if (!threshold.ok) return false;
  if (filter.units.length > 0 && !filter.units.includes(unit.value))
    return false;
  if (filter.statuses.length > 0) {
    const status = deriveStockStatus(quantity.value, threshold.value);
    if (!filter.statuses.includes(status)) return false;
  }
  return true;
}
