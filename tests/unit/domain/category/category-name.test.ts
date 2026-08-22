import { describe, expect, it } from "vitest";

import { normalizeCategoryNameKey } from "../../../../src/domain/category/category-name";

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
