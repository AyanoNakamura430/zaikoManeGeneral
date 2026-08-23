import { describe, expect, it } from "vitest";
import {
  createPurchaseDateRange,
  matchesPurchaseDate,
  parsePurchaseDate,
} from "../../../../src/domain/filter/purchase-date-filter";

const range = (input: unknown = {}) => {
  const result = createPurchaseDateRange(input);
  if (!result.ok) throw new Error("fixture failed");
  return result.value;
};

describe("purchase date filter", () => {
  it("accepts strict valid dates, leap years, and century rules", () => {
    for (const value of [
      "0001-01-01",
      "2024-02-29",
      "2000-02-29",
      "2023-12-31",
      "9999-12-31",
    ]) {
      expect(parsePurchaseDate(value)).toEqual({ ok: true, value });
    }
    expect(parsePurchaseDate("1900-02-29").ok).toBe(false);
  });

  it("rejects invalid format, calendar values, suffixes, and types", () => {
    for (const value of [
      "2023-00-01",
      "2023-01-00",
      "2023-04-31",
      "0000-01-01",
      "10000-01-01",
      "2023-2-01",
      "23-01-01",
      "2023/01/01",
      "2023-01-01T00:00:00Z",
      null,
      undefined,
      1,
    ]) {
      expect(parsePurchaseDate(value)).toEqual({
        ok: false,
        error: { code: "invalid_purchase_date" },
      });
    }
  });

  it("matches empty, one-sided, and two-sided inclusive ranges", () => {
    expect(matchesPurchaseDate(range(), undefined)).toBe(true);
    expect(
      matchesPurchaseDate(range({ from: "2024-01-10" }), "2024-01-10"),
    ).toBe(true);
    expect(
      matchesPurchaseDate(range({ from: "2024-01-10" }), "2024-01-09"),
    ).toBe(false);
    expect(
      matchesPurchaseDate(range({ from: "2024-01-10" }), "2024-01-11"),
    ).toBe(true);
    expect(matchesPurchaseDate(range({ to: "2024-01-10" }), "2024-01-10")).toBe(
      true,
    );
    expect(matchesPurchaseDate(range({ to: "2024-01-10" }), "2024-01-09")).toBe(
      true,
    );
    expect(matchesPurchaseDate(range({ to: "2024-01-10" }), "2024-01-11")).toBe(
      false,
    );
    const nullPrototype = Object.create(null) as { from: string };
    nullPrototype.from = "2024-01-10";
    expect(createPurchaseDateRange(nullPrototype).ok).toBe(true);
    const bounded = range({ from: "2024-01-10", to: "2024-01-20" });
    expect(matchesPurchaseDate(bounded, "2024-01-10")).toBe(true);
    expect(matchesPurchaseDate(bounded, "2024-01-20")).toBe(true);
    expect(matchesPurchaseDate(bounded, "2024-01-09")).toBe(false);
    expect(matchesPurchaseDate(bounded, "2024-01-21")).toBe(false);
  });

  it("rejects missing dates only when a bound is active", () => {
    expect(matchesPurchaseDate(range({ from: "2024-01-01" }), null)).toBe(
      false,
    );
    expect(matchesPurchaseDate(range({ to: "2024-01-01" }), undefined)).toBe(
      false,
    );
  });

  it("rejects reverse ranges and accepts equal bounds", () => {
    expect(
      createPurchaseDateRange({ from: "2024-02-01", to: "2024-01-01" }),
    ).toEqual({
      ok: false,
      error: { code: "invalid_date_range" },
    });
    expect(
      createPurchaseDateRange({ from: "2024-01-01", to: "2024-01-01" }).ok,
    ).toBe(true);
  });

  it("keeps authentic ranges immutable and rejects forged copies", () => {
    const valid = range({ from: "2024-01-01" });
    expect(Object.isFrozen(valid)).toBe(true);
    const copied = { ...valid } as never;
    expect(() => matchesPurchaseDate(copied, "2024-01-01")).not.toThrow();
    expect(matchesPurchaseDate(copied, "2024-01-01")).toBe(false);
    expect(matchesPurchaseDate({} as never, "2024-01-01")).toBe(false);
    const forgedRange: import("../../../../src/domain/filter/purchase-date-filter").PurchaseDateRange =
      {
        // @ts-expect-error PurchaseDateRange is parse-only.
        from: "2024-01-01",
      };
    expect(matchesPurchaseDate(forgedRange, "2024-01-01")).toBe(false);
    // @ts-expect-error PurchaseDate is parse-only.
    const forged: import("../../../../src/domain/filter/purchase-date-filter").PurchaseDate =
      "2024-01-01";
    expect(forged).toBeDefined();
  });

  it("rejects malformed range records without invoking accessors", () => {
    class RangeInput {
      from = "2024-01-01";
    }
    const accessor = Object.defineProperty({}, "from", {
      get() {
        throw new Error("must not execute accessor");
      },
      enumerable: true,
    });
    const symbolExtra = { from: "2024-01-01" };
    Object.defineProperty(symbolExtra, Symbol("extra"), { value: true });
    const hiddenExtra = { from: "2024-01-01" };
    Object.defineProperty(hiddenExtra, "extra", { value: true });
    for (const input of [
      [],
      new Date(),
      new Map(),
      new RangeInput(),
      { from: "2024-01-01", extra: true },
      accessor,
      symbolExtra,
      hiddenExtra,
      { from: "bad" },
      { to: "bad" },
    ]) {
      expect(createPurchaseDateRange(input)).toEqual({
        ok: false,
        error: { code: "invalid_purchase_date" },
      });
    }
  });

  it("does not confuse a branded date with a branded range", () => {
    const date = parsePurchaseDate("2024-01-01");
    if (!date.ok) throw new Error("fixture failed");
    // @ts-expect-error PurchaseDate alone is not a PurchaseDateRange.
    const forgedRange: import("../../../../src/domain/filter/purchase-date-filter").PurchaseDateRange =
      {
        from: date.value,
      };
    expect(matchesPurchaseDate(forgedRange, date.value)).toBe(false);
  });
});
