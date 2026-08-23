import { describe, expect, it } from "vitest";
import { createInventoryFilter } from "../../../../src/domain/filter/inventory-filter";
import { createPurchaseDateRange } from "../../../../src/domain/filter/purchase-date-filter";
import {
  matchesInventoryQuery,
  validateInventoryQuery,
} from "../../../../src/domain/inventory/inventory-query";
import { parseSearchQuery } from "../../../../src/domain/search/search-query";

const document = {
  itemName: "Cotton towel",
  categoryName: "Daily goods",
  notes: "soft",
  rawAttributes: { version: 1, categories: { daily_goods: {} } },
  currentTemplateKey: "daily_goods",
};
const item = (overrides: Record<string, unknown> = {}) => ({
  ...document,
  categoryId: "daily",
  unit: "piece",
  quantity: 2,
  purchaseDate: "2024-01-15",
  ...overrides,
});
const validFilter = (input = {}) => {
  const result = createInventoryFilter(input);
  if (!result.ok) throw new Error("fixture failed");
  return result.value;
};
const validRange = (input = {}) => {
  const result = createPurchaseDateRange(input);
  if (!result.ok) throw new Error("fixture failed");
  return result.value;
};

describe("inventory query", () => {
  it("matches empty query and each component", () => {
    expect(matchesInventoryQuery({}, item())).toEqual({
      ok: true,
      value: true,
    });
    expect(
      matchesInventoryQuery({ search: parseSearchQuery("cotton") }, item()),
    ).toEqual({ ok: true, value: true });
    expect(
      matchesInventoryQuery(
        { filter: validFilter({ units: ["piece"] }) },
        item(),
      ),
    ).toEqual({ ok: true, value: true });
    expect(
      matchesInventoryQuery(
        { purchaseDate: validRange({ from: "2024-01-15", to: "2024-01-15" }) },
        item(),
      ),
    ).toEqual({ ok: true, value: true });
  });
  it("ANDs search, inventory filter, and purchase date", () => {
    const query = {
      search: parseSearchQuery("cotton"),
      filter: validFilter({ categories: [{ kind: "category", id: "daily" }] }),
      purchaseDate: validRange({ from: "2024-01-01", to: "2024-01-31" }),
    };
    expect(matchesInventoryQuery(query, item())).toEqual({
      ok: true,
      value: true,
    });
    expect(matchesInventoryQuery(query, item({ itemName: "Wool" }))).toEqual({
      ok: true,
      value: false,
    });
    expect(matchesInventoryQuery(query, item({ categoryId: "other" }))).toEqual(
      { ok: true, value: false },
    );
    expect(
      matchesInventoryQuery(query, item({ purchaseDate: "2024-02-01" })),
    ).toEqual({ ok: true, value: false });
  });
  it("propagates document integrity errors despite mismatching filters", () => {
    const result = matchesInventoryQuery(
      { search: parseSearchQuery("never"), filter: validFilter() },
      item({ rawAttributes: null }),
    );
    expect(result).toEqual({ ok: false, error: { code: "invalid_document" } });
  });
  it("propagates unknown template errors and rejects malformed items", () => {
    expect(
      matchesInventoryQuery({}, item({ currentTemplateKey: "unknown" })),
    ).toEqual({
      ok: false,
      error: { code: "unknown_category_template", categoryKey: "unknown" },
    });
    expect(matchesInventoryQuery({}, null)).toEqual({
      ok: false,
      error: { code: "invalid_document" },
    });
  });
  it("excludes hidden attributes from search and returns component mismatches", () => {
    expect(
      matchesInventoryQuery(
        { search: parseSearchQuery("secret") },
        item({
          rawAttributes: {
            version: 1,
            categories: { food_beverage: { content_amount: "secret" } },
          },
        }),
      ),
    ).toEqual({ ok: true, value: false });
    expect(
      matchesInventoryQuery(
        { filter: validFilter({ statuses: ["out"] }) },
        item(),
      ),
    ).toEqual({ ok: true, value: false });
  });
  it("rejects malformed query and item fields without throwing", () => {
    const spread = { ...parseSearchQuery("cotton"), tokens: [] } as never;
    const throwingQuery = Object.defineProperty({}, "search", {
      get() {
        throw new Error("query getter");
      },
    });
    expect(matchesInventoryQuery(null as never, item())).toEqual({
      ok: false,
      error: { code: "invalid_query" },
    });
    for (const malformedItem of [null, undefined, "item", 42, true]) {
      expect(matchesInventoryQuery({}, malformedItem)).toEqual({
        ok: false,
        error: { code: "invalid_document" },
      });
    }
    expect(matchesInventoryQuery({ search: spread }, item())).toEqual({
      ok: false,
      error: { code: "invalid_query" },
    });
    expect(matchesInventoryQuery(throwingQuery as never, item())).toEqual({
      ok: false,
      error: { code: "invalid_query" },
    });
    const throwingItem = Object.defineProperty(item(), "itemName", {
      get() {
        throw new Error("item getter");
      },
    });
    expect(matchesInventoryQuery({}, throwingItem)).toEqual({
      ok: false,
      error: { code: "invalid_document" },
    });
    expect(matchesInventoryQuery({}, item({ itemName: 42 }))).toEqual({
      ok: false,
      error: { code: "invalid_document" },
    });
  });
  it("prioritizes unknown template integrity errors over mismatches", () => {
    expect(
      matchesInventoryQuery(
        {
          search: parseSearchQuery("never"),
          filter: validFilter({ statuses: ["out"] }),
          purchaseDate: validRange({ from: "2025-01-01" }),
        },
        item({ currentTemplateKey: "future_template" }),
      ),
    ).toEqual({
      ok: false,
      error: {
        code: "unknown_category_template",
        categoryKey: "future_template",
      },
    });
  });
  it("snapshots authentic query components exactly once", () => {
    const authentic = validFilter({ units: ["piece"] });
    let descriptorReads = 0;
    const stateful = new Proxy(
      { filter: authentic },
      {
        getOwnPropertyDescriptor(target, property) {
          if (property !== "filter")
            return Reflect.getOwnPropertyDescriptor(target, property);
          descriptorReads += 1;
          return {
            configurable: true,
            enumerable: true,
            writable: true,
            value: descriptorReads === 1 ? authentic : {},
          };
        },
      },
    );
    const validated = validateInventoryQuery(stateful);
    expect(validated.ok).toBe(true);
    if (!validated.ok) return;
    expect(descriptorReads).toBe(1);
    expect(Object.isFrozen(validated.value)).toBe(true);
    expect(matchesInventoryQuery(validated.value, item())).toEqual({
      ok: true,
      value: true,
    });
    expect(descriptorReads).toBe(1);
  });
  it("rejects forged filter and date components and isolates snapshots", () => {
    expect(validateInventoryQuery({ filter: {} })).toEqual({
      ok: false,
      error: { code: "invalid_query" },
    });
    expect(validateInventoryQuery({ purchaseDate: {} })).toEqual({
      ok: false,
      error: { code: "invalid_query" },
    });
    const input: { search?: ReturnType<typeof parseSearchQuery> } = {
      search: parseSearchQuery("cotton"),
    };
    const validated = validateInventoryQuery(input);
    if (!validated.ok) throw new Error("fixture failed");
    input.search = parseSearchQuery("wool");
    expect(matchesInventoryQuery(validated.value, item())).toEqual({
      ok: true,
      value: true,
    });
  });
});
