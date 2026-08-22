import { describe, expect, it } from "vitest";
import { selectActiveAttributes } from "../../../../src/domain/attributes/active-attributes";
import type { HybridDocument } from "../../../../src/domain/attributes/hybrid-document";

const document: HybridDocument = {
  version: 1,
  categories: {
    daily_goods: { opened: true, legacy: "hidden" },
    food_beverage: { content_amount: "500mL" },
  },
};
describe("active category attributes", () => {
  it("selects current definitions in order and only includes existing values", () => {
    const result = selectActiveAttributes(document, "daily_goods");
    if (!result.ok) throw new Error("fixture failed");
    expect(
      result.value.map(({ definition, value }) => [definition.key, value]),
    ).toEqual([
      ["spec_size", undefined],
      ["opened", true],
    ]);
  });
  it("excludes hidden and unknown values", () => {
    const food = selectActiveAttributes(document, "food_beverage");
    if (!food.ok) throw new Error("fixture failed");
    expect(food.value.map(({ value }) => value)).toEqual(["500mL", undefined]);
    expect(selectActiveAttributes(document, null)).toEqual({
      ok: true,
      value: [],
    });
  });
  it("rejects unknown templates and invalid documents", () => {
    expect(selectActiveAttributes(document, "future_template")).toEqual({
      ok: false,
      error: {
        code: "unknown_category_template",
        categoryKey: "future_template",
      },
    });
    expect(
      selectActiveAttributes(
        {
          version: 1,
          categories: { daily_goods: { opened: "bad" } },
        } as unknown as HybridDocument,
        "daily_goods",
      ),
    ).toEqual({ ok: false, error: { code: "invalid_document" } });
    expect(selectActiveAttributes(document, "custom")).toEqual({
      ok: false,
      error: {
        code: "unknown_category_template",
        categoryKey: "custom",
      },
    });
    expect(selectActiveAttributes(document, "uncategorized")).toEqual({
      ok: false,
      error: {
        code: "unknown_category_template",
        categoryKey: "uncategorized",
      },
    });
  });
  it("returns every definition without a value when the category has no values", () => {
    const result = selectActiveAttributes(
      { version: 1, categories: {} },
      "daily_goods",
    );
    if (!result.ok) throw new Error("fixture failed");
    expect(result.value.map(({ definition }) => definition.key)).toEqual([
      "spec_size",
      "opened",
    ]);
    expect(
      result.value.every(
        (entry) => !Object.prototype.hasOwnProperty.call(entry, "value"),
      ),
    ).toBe(true);
  });
  it("returns runtime immutable results", () => {
    const result = selectActiveAttributes(document, "daily_goods");
    if (!result.ok) throw new Error("fixture failed");
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(Object.isFrozen(result.value[0])).toBe(true);
  });
});
