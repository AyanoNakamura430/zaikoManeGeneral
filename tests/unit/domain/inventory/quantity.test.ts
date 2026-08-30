import { describe, expect, it } from "vitest";
import {
  validateQuantity,
  validateThreshold,
} from "../../../../src/domain/inventory/quantity";

describe("inventory quantity validation", () => {
  it("accepts count integers and rejects decimals", () => {
    expect(validateQuantity(2, "piece")).toEqual({ ok: true, value: 2 });
    expect(validateQuantity(1.5, "piece")).toMatchObject({
      ok: false,
      error: { code: "count_requires_integer", field: "quantity" },
    });
  });
  it("accepts decimal measurements", () =>
    expect(validateQuantity(1.25, "meter")).toEqual({ ok: true, value: 1.25 }));
  it("enforces the persisted magnitude and decimal scale", () => {
    expect(validateQuantity(99_999_999_999_999, "meter")).toEqual({
      ok: true,
      value: 99_999_999_999_999,
    });
    for (const value of [1e14, 1e20]) {
      expect(validateQuantity(value, "meter")).toEqual({
        ok: false,
        error: { code: "too_large", field: "quantity" },
      });
    }
    expect(validateQuantity(0.000001, "meter")).toEqual({
      ok: true,
      value: 0.000001,
    });
    expect(validateQuantity(0.0000001, "meter")).toEqual({
      ok: false,
      error: { code: "too_many_decimal_places", field: "quantity" },
    });
    expect(validateThreshold(1e14, "meter")).toEqual({
      ok: false,
      error: { code: "too_large", field: "threshold" },
    });
    expect(validateThreshold(0.0000001, "meter")).toEqual({
      ok: false,
      error: { code: "too_many_decimal_places", field: "threshold" },
    });
  });
  it("normalizes zero and negative zero", () => {
    expect(validateQuantity(0, "piece")).toEqual({ ok: true, value: 0 });
    expect(validateQuantity(-0, "piece")).toEqual({ ok: true, value: 0 });
  });
  it("rejects negative, NaN, and infinities", () => {
    expect(validateQuantity(-1, "meter")).toEqual({
      ok: false,
      error: { code: "negative", field: "quantity" },
    });
    for (const value of [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      expect(validateQuantity(value, "meter")).toEqual({
        ok: false,
        error: { code: "not_finite", field: "quantity" },
      });
    }
  });
  it("allows undefined and validates configured thresholds", () => {
    expect(validateThreshold(undefined, "piece")).toEqual({
      ok: true,
      value: undefined,
    });
    expect(validateThreshold(2, "piece")).toEqual({ ok: true, value: 2 });
    expect(validateThreshold(1.2, "piece")).toMatchObject({
      ok: false,
      error: { code: "count_requires_integer", field: "threshold" },
    });
    expect(validateThreshold(-1, "meter")).toEqual({
      ok: false,
      error: { code: "negative", field: "threshold" },
    });
    expect(validateThreshold(Number.NaN, "meter")).toEqual({
      ok: false,
      error: { code: "not_finite", field: "threshold" },
    });
    expect(validateThreshold(Number.POSITIVE_INFINITY, "meter")).toEqual({
      ok: false,
      error: { code: "not_finite", field: "threshold" },
    });
    expect(validateThreshold(-0, "piece")).toEqual({ ok: true, value: 0 });
  });
});
