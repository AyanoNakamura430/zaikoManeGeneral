import { getUnitDefinition, type UnitKind } from "./unit";

export type QuantityErrorCode =
  | "not_finite"
  | "negative"
  | "count_requires_integer"
  | "too_large"
  | "too_many_decimal_places";
export type QuantityField = "quantity" | "threshold";
export type QuantityError = Readonly<{
  code: QuantityErrorCode;
  field: QuantityField;
}>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: QuantityError };
declare const quantityBrand: unique symbol;
declare const thresholdBrand: unique symbol;
export type Quantity<U extends UnitKind> = number & {
  readonly [quantityBrand]: (unit: U) => U;
};
export type LowStockThreshold<U extends UnitKind> = number & {
  readonly [thresholdBrand]: (unit: U) => U;
};

function normalize(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

function validateAmount(
  value: number,
  unit: UnitKind,
  field: QuantityField,
): Result<number> {
  const family = getUnitDefinition(unit).family;
  if (!Number.isFinite(value))
    return { ok: false, error: { code: "not_finite", field } };
  if (value < 0) return { ok: false, error: { code: "negative", field } };
  if (value >= 1_000_000_000)
    return { ok: false, error: { code: "too_large", field } };
  const decimal = value.toString().toLowerCase();
  const [coefficient = "", exponentText] = decimal.split("e");
  const exponent = exponentText === undefined ? 0 : Number(exponentText);
  const unsigned = coefficient.replace(/^[+-]/, "");
  const [integerPart = "", fractionalPart = ""] = unsigned.split(".");
  const digits = `${integerPart}${fractionalPart}`;
  const decimalPosition = integerPart.length + exponent;
  const fractional = Math.max(0, digits.length - decimalPosition);
  if (fractional > 6)
    return { ok: false, error: { code: "too_many_decimal_places", field } };
  if (family === "count" && !Number.isInteger(value))
    return { ok: false, error: { code: "count_requires_integer", field } };
  return { ok: true, value: normalize(value) };
}

export function validateQuantity<U extends UnitKind>(
  value: number,
  unit: U,
): Result<Quantity<U>> {
  return validateAmount(value, unit, "quantity") as Result<Quantity<U>>;
}

export const validateThreshold = <U extends UnitKind>(
  value: number | undefined,
  unit: U,
): Result<LowStockThreshold<U> | undefined> =>
  value === undefined
    ? { ok: true, value: undefined }
    : (validateAmount(value, unit, "threshold") as Result<
        LowStockThreshold<U>
      >);
