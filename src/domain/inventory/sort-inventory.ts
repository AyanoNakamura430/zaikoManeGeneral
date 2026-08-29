import {
  isAuthenticInventoryFilter,
  type InventoryFilter,
} from "../filter/inventory-filter";
import { parseInstant } from "../time/instant";
import { parsePurchaseDate } from "../filter/purchase-date-filter";
import { isAuthenticInventorySort, type InventorySort } from "./inventory-sort";
import { isCompatibleInventorySort } from "./inventory-sort";
import { validateQuantity } from "./quantity";
import { parseUnitKind } from "./unit";
import { normalizeSearchText } from "../search/search-query";
export type SortInventoryError = Readonly<{
  code: "invalid_sort" | "invalid_sort_item" | "quantity_requires_single_unit";
}>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: SortInventoryError };
type Entry<T> = {
  item: T;
  index: number;
  value: string | number;
  missing: boolean;
};
function own(
  item: object,
  key: string,
): { ok: true; value: unknown } | { ok: false } {
  const descriptor = Object.getOwnPropertyDescriptor(item, key);
  if (!descriptor || !("value" in descriptor)) return { ok: false };
  return { ok: true, value: descriptor.value };
}
export function sortInventory<T>(
  sort: InventorySort,
  items: readonly T[],
  filter?: InventoryFilter,
): Result<readonly T[]> {
  try {
    if (!isAuthenticInventorySort(sort) || !Array.isArray(items))
      return { ok: false, error: { code: "invalid_sort" } };
    if (!isCompatibleInventorySort(sort, filter))
      return { ok: false, error: { code: "quantity_requires_single_unit" } };
    const source = Array.from(items);
    const entries: Entry<T>[] = [];
    for (const [index, item] of source.entries()) {
      if (!item || typeof item !== "object")
        return { ok: false, error: { code: "invalid_sort_item" } };
      const objectItem = item as object;
      try {
        let key: string | number,
          missing = false;
        if (sort.field === "item_name") {
          const field = own(objectItem, "itemName");
          if (!field.ok || typeof field.value !== "string")
            return { ok: false, error: { code: "invalid_sort_item" } };
          key = normalizeSearchText(field.value);
        } else if (sort.field === "created_at" || sort.field === "updated_at") {
          const field = own(
            objectItem,
            sort.field === "created_at" ? "createdAt" : "updatedAt",
          );
          if (
            !field.ok ||
            typeof field.value !== "string" ||
            !parseInstant(field.value).ok
          )
            return { ok: false, error: { code: "invalid_sort_item" } };
          key = field.value;
        } else if (sort.field === "purchase_date") {
          const field = own(objectItem, "purchaseDate");
          if (!field.ok || field.value === undefined || field.value === null) {
            key = "";
            missing = true;
          } else {
            const parsed = parsePurchaseDate(field.value);
            if (!parsed.ok)
              return { ok: false, error: { code: "invalid_sort_item" } };
            key = parsed.value;
          }
        } else {
          const unitField = own(objectItem, "unit");
          const quantityField = own(objectItem, "quantity");
          const unit = parseUnitKind(
            unitField.ok ? unitField.value : undefined,
          );
          if (
            !unit.ok ||
            !isAuthenticInventoryFilter(filter) ||
            filter.units[0] !== unit.value ||
            !quantityField.ok ||
            typeof quantityField.value !== "number"
          )
            return { ok: false, error: { code: "invalid_sort_item" } };
          const quantity = validateQuantity(quantityField.value, unit.value);
          if (!quantity.ok)
            return { ok: false, error: { code: "invalid_sort_item" } };
          const numeric: unknown = quantity.value;
          if (typeof numeric !== "number")
            return { ok: false, error: { code: "invalid_sort_item" } };
          key = numeric;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        entries.push({ item, index, value: key, missing });
      } catch {
        return { ok: false, error: { code: "invalid_sort_item" } };
      }
    }
    const direction = sort.direction === "asc" ? 1 : -1;
    entries.sort((a, b) => {
      if (a.missing !== b.missing) return a.missing ? 1 : -1;
      if (a.value < b.value) return -direction;
      if (a.value > b.value) return direction;
      return a.index - b.index;
    });
    return {
      ok: true,
      value: Object.freeze(entries.map((entry) => entry.item)),
    };
  } catch {
    return { ok: false, error: { code: "invalid_sort" } };
  }
}
