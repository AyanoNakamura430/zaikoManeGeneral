import { describe, expect, it } from "vitest";
import {
  createInventoryFilter,
  matchesInventoryFilter,
  parseCategoryId,
} from "../../../../src/domain/filter/inventory-filter";
import {
  validateQuantity,
  validateThreshold,
} from "../../../../src/domain/inventory/quantity";

const item = (overrides: Record<string, unknown> = {}) => ({
  categoryId: "food",
  unit: "point",
  quantity: 2,
  ...overrides,
});
const filter = (input: unknown = {}) => {
  const result = createInventoryFilter(input);
  if (!result.ok) throw new Error("fixture failed");
  return result.value;
};

describe("inventory filter", () => {
  it("matches empty filters", () =>
    expect(matchesInventoryFilter(filter(), item())).toBe(true));
  it("uses OR within and AND across dimensions", () => {
    const result = createInventoryFilter({
      categories: [{ kind: "category", id: "food" }, { kind: "uncategorized" }],
      statuses: ["available", "low"],
      units: ["point", "meter"],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(matchesInventoryFilter(result.value, item())).toBe(true);
    expect(
      matchesInventoryFilter(result.value, item({ categoryId: "tools" })),
    ).toBe(false);
    expect(
      matchesInventoryFilter(result.value, item({ categoryId: null })),
    ).toBe(true);
  });
  it("derives out, low, and available statuses", () => {
    expect(
      matchesInventoryFilter(
        filter({ statuses: ["out"] }),
        item({ quantity: 0 }),
      ),
    ).toBe(true);
    expect(
      matchesInventoryFilter(
        filter({ statuses: ["low"] }),
        item({ quantity: 1, threshold: 1 }),
      ),
    ).toBe(true);
    expect(
      matchesInventoryFilter(
        filter({ statuses: ["available"] }),
        item({ quantity: 2, threshold: 1 }),
      ),
    ).toBe(true);
  });
  it("applies status OR and AND boundaries", () => {
    expect(
      matchesInventoryFilter(
        filter({ statuses: ["available", "low"] }),
        item({ quantity: 1, threshold: 1 }),
      ),
    ).toBe(true);
    expect(
      matchesInventoryFilter(
        filter({ statuses: ["available"] }),
        item({ quantity: 0 }),
      ),
    ).toBe(false);
  });
  it("matches unit selections and rejects invalid contracts", () => {
    expect(
      matchesInventoryFilter(
        filter({ units: ["meter"] }),
        item({ unit: "meter", quantity: 1.5 }),
      ),
    ).toBe(true);
    expect(
      matchesInventoryFilter(
        filter({ units: ["point", "meter"] }),
        item({ unit: "meter", quantity: 1.5 }),
      ),
    ).toBe(true);
    expect(createInventoryFilter({ statuses: ["unknown"] }).ok).toBe(false);
    expect(createInventoryFilter({ units: ["unknown"] }).ok).toBe(false);
    expect(matchesInventoryFilter(filter(), item({ unit: "unknown" }))).toBe(
      false,
    );
  });
  it("validates category ids and keeps results immutable", () => {
    expect(parseCategoryId(" ").ok).toBe(false);
    expect(parseCategoryId(1).ok).toBe(false);
    const result = createInventoryFilter({
      categories: [{ kind: "category", id: "food" }],
    });
    if (!result.ok) throw new Error("fixture failed");
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(Object.isFrozen(result.value.categories)).toBe(true);
    expect(Object.isFrozen(result.value.categories[0])).toBe(true);
    const uncategorized = createInventoryFilter({
      categories: [{ kind: "uncategorized" }],
    });
    if (!uncategorized.ok) throw new Error("fixture failed");
    expect(Object.isFrozen(uncategorized.value.categories[0])).toBe(true);
    // @ts-expect-error CategoryId is parse-only.
    const rawCategory: import("../../../../src/domain/filter/inventory-filter").CategoryId =
      "food";
    expect(rawCategory).toBeDefined();
  });
  it("rejects malformed filter and selection inputs with exact errors", () => {
    const invalid = [
      null,
      "filter",
      { categories: "food" },
      { statuses: "available" },
      { units: "point" },
      { categories: ["uncategorized"] },
      { categories: [{ kind: "category" }] },
      { categories: [{ kind: "other", id: "food" }] },
      { statuses: ["unknown"] },
      { units: ["unknown"] },
    ];
    for (const input of invalid)
      expect(createInventoryFilter(input)).toEqual({
        ok: false,
        error: { code: "invalid_filter" },
      });
  });
  it("rejects copied, overridden, and malformed runtime filters without throwing", () => {
    const valid = filter({ statuses: ["available"] });
    const copied = { ...valid, statuses: ["out"] } as never;
    expect(() => matchesInventoryFilter(copied, item())).not.toThrow();
    expect(matchesInventoryFilter(copied, item())).toBe(false);
    expect(matchesInventoryFilter({} as never, null)).toBe(false);
    expect(matchesInventoryFilter(valid, null)).toBe(false);
  });
  it("fails closed for invalid item amounts and mismatched dimensions", () => {
    const valid = filter({
      categories: [{ kind: "category", id: "food" }],
      statuses: ["available"],
      units: ["point"],
    });
    for (const candidate of [
      item({ quantity: -1 }),
      item({ quantity: Number.NaN }),
      item({ quantity: 1.5 }),
      item({ quantity: 1, threshold: -1 }),
      item({ quantity: 1, threshold: Number.POSITIVE_INFINITY }),
      item({ threshold: "1" }),
      item({ threshold: {} }),
      item({ categoryId: "tools" }),
      item({ unit: "meter", quantity: 1.5 }),
    ]) {
      expect(() => matchesInventoryFilter(valid, candidate)).not.toThrow();
      expect(matchesInventoryFilter(valid, candidate)).toBe(false);
    }
  });
  it("rejects hand-crafted filters and invalid item quantity contracts", () => {
    const quantity = validateQuantity(1, "point");
    const threshold = validateThreshold(0, "point");
    if (!quantity.ok || !threshold.ok) throw new Error("fixture failed");
    // @ts-expect-error InventoryFilter has a private brand.
    const handCrafted: import("../../../../src/domain/filter/inventory-filter").InventoryFilter =
      {
        categories: [],
        statuses: [],
        units: [],
      };
    expect(
      matchesInventoryFilter(
        handCrafted,
        item({ quantity: quantity.value, threshold: threshold.value }),
      ),
    ).toBe(false);
  });
});
