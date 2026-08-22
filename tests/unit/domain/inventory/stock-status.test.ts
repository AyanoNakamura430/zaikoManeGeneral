import { describe, expect, it } from "vitest";
import {
  validateQuantity,
  validateThreshold,
  type Result,
} from "../../../../src/domain/inventory/quantity";
import { deriveStockStatus } from "../../../../src/domain/inventory/stock-status";

describe("inventory stock status", () => {
  it("covers disabled, zero, equality, and threshold boundaries", () => {
    const valid = <T>(result: Result<T>): T => {
      if (!result.ok) throw new Error("fixture validation failed");
      return result.value;
    };
    const quantity = (value: number) => validateQuantity(value, "piece");
    const threshold = (value: number | undefined) =>
      validateThreshold(value, "piece");
    expect(
      deriveStockStatus(valid(quantity(0)), valid(threshold(undefined))),
    ).toBe("out");
    expect(deriveStockStatus(valid(quantity(0)))).toBe("out");
    expect(deriveStockStatus(valid(quantity(1)))).toBe("available");
    expect(deriveStockStatus(valid(quantity(1)), valid(threshold(0)))).toBe(
      "available",
    );
    expect(deriveStockStatus(valid(quantity(1)), valid(threshold(1)))).toBe(
      "low",
    );
    expect(deriveStockStatus(valid(quantity(2)), valid(threshold(1)))).toBe(
      "available",
    );
    expect(deriveStockStatus(valid(quantity(1)), valid(threshold(2)))).toBe(
      "low",
    );

    const incompatibleThreshold = valid(validateThreshold(1, "meter"));
    const sameFamilyIncompatibleThreshold = valid(
      validateThreshold(1, "point"),
    );
    const compileOnlySameUnitCheck = () => {
      // @ts-expect-error Quantity and threshold must use the same Unit key.
      deriveStockStatus(valid(quantity(1)), incompatibleThreshold);
      // @ts-expect-error Different count Unit keys must remain incompatible.
      deriveStockStatus(valid(quantity(1)), sameFamilyIncompatibleThreshold);
    };
    expect(compileOnlySameUnitCheck).toBeTypeOf("function");
  });
});
