declare const purchaseDateBrand: unique symbol;
declare const purchaseDateRangeBrand: unique symbol;

export type PurchaseDate = string & {
  readonly [purchaseDateBrand]: true;
};
export type PurchaseDateRange = Readonly<{
  readonly from?: PurchaseDate;
  readonly to?: PurchaseDate;
  readonly [purchaseDateRangeBrand]: true;
}>;
export type PurchaseDateFilterError = Readonly<{
  code: "invalid_purchase_date" | "invalid_date_range";
}>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: PurchaseDateFilterError };

const rangeMembership = new WeakSet<object>();
const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year: number, month: number): number {
  if (month === 2)
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isValidDate(input: unknown): input is PurchaseDate {
  if (typeof input !== "string") return false;
  const match = datePattern.exec(input);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return (
    year >= 1 &&
    year <= 9999 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  );
}

export function parsePurchaseDate(input: unknown): Result<PurchaseDate> {
  return isValidDate(input)
    ? { ok: true, value: input }
    : { ok: false, error: { code: "invalid_purchase_date" } };
}

export function createPurchaseDateRange(
  input: unknown = {},
): Result<PurchaseDateRange> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { ok: false, error: { code: "invalid_purchase_date" } };
  if (
    Object.getPrototypeOf(input) !== null &&
    Object.getPrototypeOf(input) !== Object.prototype
  )
    return { ok: false, error: { code: "invalid_purchase_date" } };
  const keys = Reflect.ownKeys(input);
  if (keys.some((key) => key !== "from" && key !== "to"))
    return { ok: false, error: { code: "invalid_purchase_date" } };
  const fromDescriptor = Object.getOwnPropertyDescriptor(input, "from");
  const toDescriptor = Object.getOwnPropertyDescriptor(input, "to");
  if (
    (fromDescriptor && !("value" in fromDescriptor)) ||
    (toDescriptor && !("value" in toDescriptor))
  )
    return { ok: false, error: { code: "invalid_purchase_date" } };
  const fromValue: unknown = fromDescriptor?.value;
  const toValue: unknown = toDescriptor?.value;
  const from =
    fromValue === undefined ? undefined : parsePurchaseDate(fromValue);
  const to = toValue === undefined ? undefined : parsePurchaseDate(toValue);
  if (from !== undefined && !from.ok) return from;
  if (to !== undefined && !to.ok) return to;
  const range = Object.freeze({
    ...(from === undefined ? {} : { from: from.value }),
    ...(to === undefined ? {} : { to: to.value }),
  }) as PurchaseDateRange;
  if (
    range.from !== undefined &&
    range.to !== undefined &&
    range.from > range.to
  )
    return { ok: false, error: { code: "invalid_date_range" } };
  rangeMembership.add(range);
  return { ok: true, value: range };
}

export function matchesPurchaseDate(
  range: PurchaseDateRange,
  purchaseDate: unknown,
): boolean {
  if (!range || typeof range !== "object" || !rangeMembership.has(range))
    return false;
  if (range.from === undefined && range.to === undefined) return true;
  if (!isValidDate(purchaseDate)) return false;
  if (range.from !== undefined && purchaseDate < range.from) return false;
  if (range.to !== undefined && purchaseDate > range.to) return false;
  return true;
}
