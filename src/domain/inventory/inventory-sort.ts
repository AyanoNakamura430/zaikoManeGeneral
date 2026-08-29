import {
  isAuthenticInventoryFilter,
  type InventoryFilter,
} from "../filter/inventory-filter";
declare const sortBrand: unique symbol;
export type SortField =
  "created_at" | "updated_at" | "item_name" | "purchase_date" | "quantity";
export type SortDirection = "asc" | "desc";
export type InventorySort = Readonly<{
  field: SortField;
  direction: SortDirection;
  readonly [sortBrand]: true;
}>;
export type SortError = Readonly<{
  code: "invalid_sort" | "quantity_requires_single_unit";
}>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: SortError };
const authentic = new WeakSet<object>();
const quantityUnits = new WeakMap<object, string>();
const fields = new Set<SortField>([
  "created_at",
  "updated_at",
  "item_name",
  "purchase_date",
  "quantity",
]);
const directions = new Set<SortDirection>(["asc", "desc"]);
export function isAuthenticInventorySort(
  value: unknown,
): value is InventorySort {
  return value !== null && typeof value === "object" && authentic.has(value);
}
export function createInventorySort(
  input: unknown = {},
  filter?: InventoryFilter,
): Result<InventorySort> {
  try {
    if (!input || typeof input !== "object" || Array.isArray(input))
      return { ok: false, error: { code: "invalid_sort" } };
    if (
      Object.getPrototypeOf(input) !== null &&
      Object.getPrototypeOf(input) !== Object.prototype
    )
      return { ok: false, error: { code: "invalid_sort" } };
    const keys = Reflect.ownKeys(input);
    if (keys.some((k) => k !== "field" && k !== "direction"))
      return { ok: false, error: { code: "invalid_sort" } };
    const fd = Object.getOwnPropertyDescriptor(input, "field"),
      dd = Object.getOwnPropertyDescriptor(input, "direction");
    if ((fd && !("value" in fd)) || (dd && !("value" in dd)))
      return { ok: false, error: { code: "invalid_sort" } };
    const field = (fd?.value ?? "created_at") as unknown,
      direction = (dd?.value ?? "desc") as unknown;
    if (
      typeof field !== "string" ||
      !fields.has(field as SortField) ||
      typeof direction !== "string" ||
      !directions.has(direction as SortDirection)
    )
      return { ok: false, error: { code: "invalid_sort" } };
    if (
      field === "quantity" &&
      (!isAuthenticInventoryFilter(filter) || filter.units.length !== 1)
    )
      return { ok: false, error: { code: "quantity_requires_single_unit" } };
    const value = Object.freeze({
      field: field as SortField,
      direction: direction as SortDirection,
    }) as InventorySort;
    authentic.add(value);
    if (field === "quantity" && isAuthenticInventoryFilter(filter)) {
      quantityUnits.set(value, filter.units[0] ?? "");
    }
    return { ok: true, value };
  } catch {
    return { ok: false, error: { code: "invalid_sort" } };
  }
}

export function isCompatibleInventorySort(
  sort: InventorySort,
  filter: InventoryFilter | undefined,
): boolean {
  try {
    if (!isAuthenticInventorySort(sort)) return false;
    if (sort.field !== "quantity") return true;
    return (
      isAuthenticInventoryFilter(filter) &&
      filter.units.length === 1 &&
      quantityUnits.get(sort) === filter.units[0]
    );
  } catch {
    return false;
  }
}
