import { describe, expect, it } from "vitest";
import { createInventoryFilter } from "../../../../src/domain/filter/inventory-filter";
import { createInventorySort } from "../../../../src/domain/inventory/inventory-sort";
import { sortInventory } from "../../../../src/domain/inventory/sort-inventory";
const item = (name: string, overrides: Record<string, unknown> = {}) => ({
  itemName: name,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  purchaseDate: "2024-01-01",
  unit: "piece",
  quantity: 1,
  ...overrides,
});
const sort = (field: string, direction = "asc", filter?: unknown) => {
  const s = createInventorySort({ field, direction }, filter as never);
  if (!s.ok) throw new Error("fixture");
  return s.value;
};
const filter = (units = ["piece"]) => {
  const f = createInventoryFilter({ units });
  if (!f.ok) throw new Error("fixture");
  return f.value;
};
describe("sort inventory", () => {
  const sorted = <T>(result: unknown): readonly T[] => {
    if (
      !result ||
      typeof result !== "object" ||
      !("ok" in result) ||
      result.ok !== true
    )
      throw new Error("fixture");
    return (result as unknown as { value: readonly T[] }).value;
  };
  it("sorts fields, directions, and stably preserves ties", () => {
    const values = [
      item(" B", { createdAt: "2024-01-02T00:00:00.000Z" }),
      item("a"),
      item("a"),
    ];
    const r = sortInventory(sort("created_at"), values);
    expect(r.ok && r.value[0]).toBe(values[1]);
    expect(sorted(sortInventory(sort("item_name"), values))).toEqual([
      values[1],
      values[2],
      values[0],
    ]);
    expect(sorted(sortInventory(sort("created_at", "desc"), values))[0]).toBe(
      values[0],
    );
  });
  it("places missing purchase dates last in both directions", () => {
    const values = [
      item("missing", { purchaseDate: undefined }),
      item("late", { purchaseDate: "2024-01-02" }),
      item("early", { purchaseDate: "2024-01-01" }),
    ];
    expect(sorted(sortInventory(sort("purchase_date"), values))).toEqual([
      values[2],
      values[1],
      values[0],
    ]);
    expect(
      sorted(sortInventory(sort("purchase_date", "desc"), values)),
    ).toEqual([values[1], values[2], values[0]]);
  });
  it("sorts quantity with one selected unit and rejects invalid items", () => {
    const f = filter();
    const values = [item("two", { quantity: 2 }), item("one")];
    expect(
      sorted(sortInventory(sort("quantity", "asc", f), values, f))[0],
    ).toBe(values[1]);
    expect(createInventorySort({ field: "quantity" })).toEqual({
      ok: false,
      error: { code: "quantity_requires_single_unit" },
    });
    expect(
      sortInventory(
        sort("quantity", "asc", f),
        [item("bad", { quantity: -1 })],
        f,
      ),
    ).toEqual({ ok: false, error: { code: "invalid_sort_item" } });
  });
  it("rejects malformed sort items, forged sort, and keeps output immutable", () => {
    expect(
      sortInventory(sort("created_at"), [item("ok"), null as never]),
    ).toEqual({ ok: false, error: { code: "invalid_sort_item" } });
    const result = sortInventory(sort("created_at"), [item("ok")]);
    expect(result.ok).toBe(true);
    if (result.ok) expect(Object.isFrozen(result.value)).toBe(true);
    expect(
      sortInventory({ field: "created_at", direction: "asc" } as never, []),
    ).toEqual({ ok: false, error: { code: "invalid_sort" } });
  });
  it("requires strict purchase dates and own data fields", () => {
    expect(
      sortInventory(sort("purchase_date"), [
        item("bad", { purchaseDate: "2024-01-01T00:00:00.000Z" }),
      ]),
    ).toEqual({ ok: false, error: { code: "invalid_sort_item" } });
    const inherited = Object.create({
      createdAt: "2024-01-01T00:00:00.000Z",
    }) as Record<string, unknown>;
    Object.assign(inherited, item("inherited"));
    delete inherited.createdAt;
    expect(sortInventory(sort("created_at"), [inherited])).toEqual({
      ok: false,
      error: { code: "invalid_sort_item" },
    });
    const accessor = item("accessor") as Record<string, unknown>;
    Object.defineProperty(accessor, "createdAt", {
      get: () => "2024-01-01T00:00:00.000Z",
    });
    expect(sortInventory(sort("created_at"), [accessor])).toEqual({
      ok: false,
      error: { code: "invalid_sort_item" },
    });
  });
  it("covers direction boundaries, normalization, and defensive snapshots", () => {
    const values = [
      item("Ａ", {
        updatedAt: "2024-01-03T00:00:00.000Z",
        purchaseDate: "2024-01-02",
      }),
      item(" a ", {
        updatedAt: "2024-01-01T00:00:00.000Z",
        purchaseDate: "2024-01-01",
      }),
      item("B", {
        updatedAt: "2024-01-02T00:00:00.000Z",
        purchaseDate: undefined,
      }),
      item("あ"),
      item("ア"),
    ];
    expect(sorted(sortInventory(sort("updated_at"), values))[0]).toBe(
      values[1],
    );
    expect(sorted(sortInventory(sort("updated_at", "desc"), values))[0]).toBe(
      values[0],
    );
    expect(sorted(sortInventory(sort("purchase_date"), values)).at(-1)).toBe(
      values[2],
    );
    expect(
      sorted(sortInventory(sort("purchase_date", "desc"), values)).at(-1),
    ).toBe(values[2]);
    expect(
      sorted<{ quantity: number }>(
        sortInventory(
          sort("quantity", "desc", filter()),
          [item("one"), item("two", { quantity: 2 })],
          filter(),
        ),
      )[0]?.quantity,
    ).toBe(2);
    expect(
      sorted(sortInventory(sort("item_name"), values)).slice(0, 2),
    ).toEqual([values[0], values[1]]);
    expect(
      sorted<{ itemName: string }>(
        sortInventory(sort("item_name", "desc"), [item("one"), item("two")]),
      ).map((entry) => entry.itemName),
    ).toEqual(["two", "one"]);
    const source = [item("one"), item("two")];
    const result = sortInventory(sort("item_name"), source);
    source.reverse();
    expect(
      sorted<{ itemName: string }>(result).map((entry) => entry.itemName),
    ).toEqual(["one", "two"]);
  });
  it("rejects later malformed entries and hostile containers", () => {
    const valid = item("valid");
    const invalid = item("invalid", { createdAt: "bad" });
    expect(sortInventory(sort("created_at"), [valid, invalid])).toEqual({
      ok: false,
      error: { code: "invalid_sort_item" },
    });
    expect(
      sortInventory(
        sort("quantity", "asc", filter()),
        [item("meter", { unit: "meter" })],
        filter(),
      ),
    ).toEqual({ ok: false, error: { code: "invalid_sort_item" } });
    expect(
      sortInventory(sort("quantity", "asc", filter()), [], {} as never),
    ).toEqual({
      ok: false,
      error: { code: "quantity_requires_single_unit" },
    });
    expect(() =>
      sortInventory(sort("created_at"), [
        new Proxy(valid, {
          getOwnPropertyDescriptor: () => {
            throw new Error("x");
          },
        }),
      ]),
    ).not.toThrow();
    expect(
      sortInventory(sort("created_at"), [
        new Proxy(valid, {
          getOwnPropertyDescriptor: () => {
            throw new Error("x");
          },
        }),
      ]),
    ).toEqual({ ok: false, error: { code: "invalid_sort_item" } });
    const revoked = Proxy.revocable(valid, {});
    revoked.revoke();
    expect(sortInventory(sort("created_at"), [revoked.proxy])).toEqual({
      ok: false,
      error: { code: "invalid_sort_item" },
    });
    const array = new Proxy([valid], {
      get(_target, property, receiver): unknown {
        if (property === Symbol.iterator) {
          return () => {
            throw new Error("x");
          };
        }
        return Reflect.get(_target, property, receiver) as unknown;
      },
    });
    expect(sortInventory(sort("created_at"), array)).toEqual({
      ok: false,
      error: { code: "invalid_sort" },
    });
  });
});
