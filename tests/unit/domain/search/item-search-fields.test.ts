import { describe, expect, it } from "vitest";
import { assembleItemSearchFields } from "../../../../src/domain/search/item-search-fields";
import type { HybridDocument } from "../../../../src/domain/attributes/hybrid-document";

const attributes: HybridDocument = {
  version: 1,
  categories: {
    daily_goods: { spec_size: " Large ", opened: true, unknown: "hidden" },
  },
};
const base = {
  itemName: "  Ａ item ",
  categoryName: "Daily",
  notes: "",
  brand: "Brand",
  color: "Blue",
  modelCode: "M-1",
  rawAttributes: attributes,
  currentTemplateKey: "daily_goods" as const,
};
describe("item search field assembly", () => {
  it("keeps fixed fields then searchable active text attributes", () => {
    const result = assembleItemSearchFields(base);
    if (!result.ok) throw new Error("fixture failed");
    expect(result.value).toEqual([
      "a item",
      "daily",
      "brand",
      "blue",
      "m-1",
      "large",
    ]);
  });
  it("keeps all fixed fields in the approved order when nonempty", () => {
    const result = assembleItemSearchFields({ ...base, notes: " Note " });
    if (!result.ok) throw new Error("fixture failed");
    expect(result.value.slice(0, 6)).toEqual([
      "a item",
      "daily",
      "note",
      "brand",
      "blue",
      "m-1",
    ]);
  });
  it("appends clothing size and material in definition order", () => {
    const result = assembleItemSearchFields({
      ...base,
      rawAttributes: {
        version: 1,
        categories: { clothing_accessories: { size: "L", material: "Cotton" } },
      },
      currentTemplateKey: "clothing_accessories",
    });
    if (!result.ok) throw new Error("fixture failed");
    expect(result.value.slice(-2)).toEqual(["l", "cotton"]);
  });
  it("excludes boolean, hidden, unknown, and normalized-empty fields", () => {
    const sparseBase = { ...base } as Omit<
      typeof base,
      "brand" | "color" | "modelCode"
    >;
    Reflect.deleteProperty(sparseBase, "brand");
    Reflect.deleteProperty(sparseBase, "color");
    Reflect.deleteProperty(sparseBase, "modelCode");
    const result = assembleItemSearchFields({
      ...sparseBase,
      itemName: " ",
      categoryName: " ",
    });
    if (!result.ok) throw new Error("fixture failed");
    expect(result.value).toEqual(["large"]);
  });
  it("excludes fullwidth and Unicode-whitespace-only active text", () => {
    const result = assembleItemSearchFields({
      ...base,
      rawAttributes: {
        version: 1,
        categories: { daily_goods: { spec_size: "　\u00a0" } },
      },
    });
    if (!result.ok) throw new Error("fixture failed");
    expect(result.value).toEqual(["a item", "daily", "brand", "blue", "m-1"]);
  });
  it("includes category name for custom and has no Uncategorized synthetic label", () => {
    const result = assembleItemSearchFields({
      ...base,
      categoryName: "Custom",
      currentTemplateKey: null,
    });
    if (!result.ok) throw new Error("fixture failed");
    expect(result.value).toEqual(["a item", "custom", "brand", "blue", "m-1"]);
  });
  it("omits categoryName with a null template and adds no synthetic label", () => {
    const withoutCategory = { ...base };
    Reflect.deleteProperty(withoutCategory, "categoryName");
    const result = assembleItemSearchFields({
      ...withoutCategory,
      currentTemplateKey: null,
    });
    if (!result.ok) throw new Error("fixture failed");
    expect(result.value).toEqual(["a item", "brand", "blue", "m-1"]);
  });
  it("propagates invalid document and unknown template errors", () => {
    expect(
      assembleItemSearchFields({
        ...base,
        rawAttributes: {
          version: 1,
          categories: { daily_goods: { opened: "bad" } },
        },
      }),
    ).toMatchObject({ ok: false, error: { code: "invalid_document" } });
    expect(
      assembleItemSearchFields({ ...base, currentTemplateKey: "future" }),
    ).toMatchObject({
      ok: false,
      error: { code: "unknown_category_template", categoryKey: "future" },
    });
  });
  it("returns an immutable field list", () => {
    const result = assembleItemSearchFields(base);
    if (!result.ok) throw new Error("fixture failed");
    expect(Object.isFrozen(result.value)).toBe(true);
  });
});
