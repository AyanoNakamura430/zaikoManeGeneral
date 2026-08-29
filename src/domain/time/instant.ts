declare const instantBrand: unique symbol;
export type Instant = string & { readonly [instantBrand]: true };
export type InstantError = Readonly<{ code: "invalid_instant" }>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: InstantError };
const pattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;
function days(y: number, m: number) {
  if (m === 2) return y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(m) ? 30 : 31;
}
export function parseInstant(input: unknown): Result<Instant> {
  if (typeof input !== "string")
    return { ok: false, error: { code: "invalid_instant" } };
  const m = pattern.exec(input);
  if (!m) return { ok: false, error: { code: "invalid_instant" } };
  const y = +m[1]!,
    mo = +m[2]!,
    d = +m[3]!,
    h = +m[4]!,
    mi = +m[5]!,
    s = +m[6]!;
  if (
    y < 1 ||
    y > 9999 ||
    mo < 1 ||
    mo > 12 ||
    d < 1 ||
    d > days(y, mo) ||
    h > 23 ||
    mi > 59 ||
    s > 59
  )
    return { ok: false, error: { code: "invalid_instant" } };
  return { ok: true, value: input as Instant };
}
