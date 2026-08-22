import { describe, expect, it } from "vitest";

import {
  normalizeCategoryNameKey,
  validateCategoryName,
  type ValidatedCategoryName,
} from "../../../../src/domain/category/category-name";

describe("normalizeCategoryNameKey", () => {
  it("normalizes ASCII letter case", () => {
    expect(normalizeCategoryNameKey("FOOD")).toBe("food");
    expect(normalizeCategoryNameKey("Food")).toBe("food");
  });

  it("normalizes full-width Latin letters and digits with NFKC", () => {
    expect(normalizeCategoryNameKey("ＦＯＯＤ１２３")).toBe("food123");
  });

  it("trims leading and trailing Unicode whitespace", () => {
    expect(normalizeCategoryNameKey("\u00a0\t 日用品 \n\u3000")).toBe("日用品");
  });

  it("collapses mixed internal Unicode whitespace to one ASCII space", () => {
    expect(normalizeCategoryNameKey("Food\u3000\t\n Supplies")).toBe(
      "food supplies",
    );
  });

  it("retains Japanese names and meaningful punctuation", () => {
    expect(normalizeCategoryNameKey("工具・用品")).toBe("工具・用品");
  });

  it("returns an empty key for blank input", () => {
    expect(normalizeCategoryNameKey("\u00a0\t\n\u3000")).toBe("");
  });

  it("is idempotent", () => {
    const normalized = normalizeCategoryNameKey("  Ｆｏｏｄ\u3000 Supplies  ");

    expect(normalizeCategoryNameKey(normalized)).toBe(normalized);
  });

  it("keeps meaningfully different names distinct", () => {
    expect(normalizeCategoryNameKey("工具・用品")).not.toBe(
      normalizeCategoryNameKey("工具用品"),
    );
  });
});

describe("validateCategoryName", () => {
  it("preserves displayName and only normalizes nameKey", () => {
    const result = validateCategoryName("  Food　Supplies ", []);
    expect(result).toMatchObject({
      ok: true,
      value: { displayName: "  Food　Supplies ", nameKey: "food supplies" },
    });
    if (result.ok) expect(Object.isFrozen(result.value)).toBe(true);
  });
  it("rejects blank and normalized duplicate names", () => {
    expect(validateCategoryName("\u00a0\t", [])).toEqual({
      ok: false,
      error: { code: "blank_name" },
    });
    expect(validateCategoryName(" FOOD ", [" ＦＯＯＤ　"])).toEqual({
      ok: false,
      error: { code: "duplicate_name" },
    });
  });
  it("does not accept a hand-crafted validated name", () => {
    // @ts-expect-error ValidatedCategoryName has a module-private opaque brand.
    const handCrafted: ValidatedCategoryName = {
      displayName: "Food",
      nameKey: "food",
    };
    expect(handCrafted).toBeDefined();
  });
});
