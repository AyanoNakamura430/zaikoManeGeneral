import {
  validateQuantity,
  validateThreshold,
  type LowStockThreshold,
  type Quantity,
} from "../inventory/quantity";
import { parseUnitKind, type UnitKind } from "../inventory/unit";

const itemBrand = Symbol("ItemCore");
type ItemCoreFor<U extends UnitKind> = Readonly<{
  name: string;
  unit: U;
  quantity: Quantity<U>;
  threshold?: LowStockThreshold<U>;
  readonly [itemBrand]: true;
}>;
export type ItemCore = { [U in UnitKind]: ItemCoreFor<U> }[UnitKind];
export type ItemCoreError = Readonly<{
  code:
    | "blank_name"
    | "invalid_unit"
    | "not_finite"
    | "negative"
    | "count_requires_integer"
    | "too_large"
    | "too_many_decimal_places";
  field: "name" | "unit" | "quantity" | "threshold";
}>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ItemCoreError };
type Input = {
  name: string;
  unit: unknown;
  quantity: number;
  threshold?: number;
};

function isBlank(value: string): boolean {
  return !value
    .normalize("NFKC")
    .replace(/\p{White_Space}+/gu, " ")
    .trim();
}
function createForUnit<U extends UnitKind>(
  input: Input,
  unit: U,
): Result<ItemCoreFor<U>> {
  const quantity = validateQuantity(input.quantity, unit);
  if (!quantity.ok) return quantity;
  const threshold = validateThreshold(input.threshold, unit);
  if (!threshold.ok) return threshold;
  return {
    ok: true,
    value: Object.freeze({
      name: input.name,
      unit,
      quantity: quantity.value,
      ...(threshold.value === undefined ? {} : { threshold: threshold.value }),
      [itemBrand]: true as const,
    }),
  };
}
export function createItemCore(input: Input): Result<ItemCore> {
  if (isBlank(input.name))
    return { ok: false, error: { code: "blank_name", field: "name" } };
  const unit = parseUnitKind(input.unit);
  if (!unit.ok) return unit;
  return createForUnit(input, unit.value) as Result<ItemCore>;
}
