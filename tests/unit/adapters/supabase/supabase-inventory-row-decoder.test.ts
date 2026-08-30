import { describe, expect, it } from "vitest";
import { decodeInventoryListItem } from "../../../../src/adapters/supabase/supabase-inventory-row-decoder";

const userId = "10000000-0000-4000-8000-000000000001";
const itemId = "20000000-0000-4000-8000-000000000001";
const categoryId = "30000000-0000-4000-8000-000000000001";

const row = () => ({
  id: itemId,
  user_id: userId,
  item_name: "Coffee beans",
  category_id: categoryId,
  category: {
    id: categoryId,
    name: "Food",
    template_key: "food_beverage",
  },
  unit: "gram",
  quantity: 250.125,
  low_stock_threshold: 50.5,
  image_path: null,
  notes: "Medium roast",
  purchase_date: "2026-08-30",
  brand: "Example",
  color: null,
  model_code: "CB-1",
  attributes: {
    version: 1,
    categories: { food_beverage: { opened: true } },
  },
  created_at: "2026-08-30T00:00:00.123456+00:00",
  updated_at: "2026-08-30T10:00:00.999999+09:00",
});

describe("decodeInventoryListItem", () => {
  it("maps a complete owned database row into an immutable list item", () => {
    const result = decodeInventoryListItem(row(), userId);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toEqual({
      id: itemId,
      itemName: "Coffee beans",
      categoryId,
      categoryName: "Food",
      currentTemplateKey: "food_beverage",
      unit: "gram",
      quantity: 250.125,
      threshold: 50.5,
      notes: "Medium roast",
      purchaseDate: "2026-08-30",
      brand: "Example",
      modelCode: "CB-1",
      rawAttributes: {
        version: 1,
        categories: { food_beverage: { opened: true } },
      },
      createdAt: "2026-08-30T00:00:00.123Z",
      updatedAt: "2026-08-30T01:00:00.999Z",
    });
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(Object.isFrozen(result.value.rawAttributes)).toBe(true);
  });

  it("maps an uncategorized row and omits nullable optional values", () => {
    const input = {
      ...row(),
      category_id: null,
      category: null,
      low_stock_threshold: null,
      notes: null,
      purchase_date: null,
      brand: null,
      color: null,
      model_code: null,
    };
    const result = decodeInventoryListItem(input, userId);
    expect(result).toMatchObject({
      ok: true,
      value: { categoryId: null, currentTemplateKey: null },
    });
    if (!result.ok) return;
    expect(result.value).not.toHaveProperty("categoryName");
    expect(result.value).not.toHaveProperty("threshold");
    expect(result.value).not.toHaveProperty("purchaseDate");
  });

  it.each([
    ["wrong owner", { user_id: "10000000-0000-4000-8000-000000000002" }],
    ["malformed identity", { id: "not-an-id" }],
    ["blank item name", { item_name: "　" }],
    ["invalid unit", { unit: "unknown" }],
    ["invalid quantity", { quantity: -1 }],
    ["invalid threshold", { low_stock_threshold: 1.0000001 }],
    ["invalid instant", { created_at: "2026-08-30" }],
    ["normalized invalid day", { created_at: "2026-02-30T00:00:00Z" }],
    ["normalized invalid hour", { created_at: "2026-01-01T24:00:00Z" }],
    ["invalid offset", { created_at: "2026-01-01T00:00:00+24:00" }],
    ["invalid purchase date", { purchase_date: "2026-02-30" }],
    ["future image contract", { image_path: "private/item.jpg" }],
    ["invalid attributes", { attributes: { version: 2, categories: {} } }],
    ["missing category relation", { category: null }],
    [
      "mismatched category relation",
      {
        category: {
          id: "30000000-0000-4000-8000-000000000002",
          name: "Other",
          template_key: null,
        },
      },
    ],
  ])("rejects %s", (_name, change) => {
    expect(decodeInventoryListItem({ ...row(), ...change }, userId)).toEqual({
      ok: false,
      error: { code: "invalid_inventory_row" },
    });
  });

  it("rejects accessor and proxy input without throwing", () => {
    const accessor = Object.defineProperty(row(), "item_name", {
      get: () => "Coffee beans",
    });
    const proxy = new Proxy(row(), {
      getPrototypeOf() {
        throw new Error("blocked");
      },
    });
    expect(decodeInventoryListItem(accessor, userId).ok).toBe(false);
    expect(decodeInventoryListItem(proxy, userId).ok).toBe(false);
  });

  it("uses one own-data snapshot instead of re-reading stateful properties", () => {
    const stateful = new Proxy(row(), {
      get(target, key) {
        if (key === "user_id") return "10000000-0000-4000-8000-000000000002";
        return typeof key === "string" && key in target
          ? target[key as keyof typeof target]
          : undefined;
      },
    });
    expect(decodeInventoryListItem(stateful, userId).ok).toBe(true);

    const categoryAccessor = row();
    categoryAccessor.category = Object.defineProperty(
      { id: categoryId, template_key: "food_beverage" },
      "name",
      { get: () => "Food" },
    ) as typeof categoryAccessor.category;
    expect(decodeInventoryListItem(categoryAccessor, userId).ok).toBe(false);
  });
});
