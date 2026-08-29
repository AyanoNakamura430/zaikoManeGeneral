import { describe, expect, it } from "vitest";
import { createInventoryFilter } from "../../../../src/domain/filter/inventory-filter";
import {
  createInventorySort,
  isAuthenticInventorySort,
} from "../../../../src/domain/inventory/inventory-sort";
const filter = (units: string[]) => {
  const r = createInventoryFilter({ units });
  if (!r.ok) throw new Error("fixture");
  return r.value;
};
describe("inventory sort", () => {
  it("defaults and accepts all fields/directions", () => {
    expect(createInventorySort()).toMatchObject({
      ok: true,
      value: { field: "created_at", direction: "desc" },
    });
    for (const field of [
      "created_at",
      "updated_at",
      "item_name",
      "purchase_date",
    ])
      for (const direction of ["asc", "desc"])
        expect(createInventorySort({ field, direction }).ok).toBe(true);
    expect(
      createInventorySort(
        { field: "quantity", direction: "asc" },
        filter(["piece"]),
      ).ok,
    ).toBe(true);
  });
  it("requires exactly one authentic unit for quantity", () => {
    expect(createInventorySort({ field: "quantity" })).toEqual({
      ok: false,
      error: { code: "quantity_requires_single_unit" },
    });
    expect(createInventorySort({ field: "quantity" }, filter([]))).toEqual({
      ok: false,
      error: { code: "quantity_requires_single_unit" },
    });
    expect(
      createInventorySort({ field: "quantity" }, filter(["piece", "meter"])),
    ).toEqual({ ok: false, error: { code: "quantity_requires_single_unit" } });
  });
  it("rejects malformed specs and forged copies", () => {
    expect(createInventorySort({ field: "bad" }).ok).toBe(false);
    const r = createInventorySort();
    if (!r.ok) throw new Error("fixture");
    expect(Object.isFrozen(r.value)).toBe(true);
    expect(isAuthenticInventorySort(r.value)).toBe(true);
    expect(isAuthenticInventorySort({ ...r.value })).toBe(false);
  });
  it("rejects every malformed shape with the exact error without throwing", () => {
    class Spec {
      field = "created_at";
    }
    const accessor = Object.defineProperty({}, "field", {
      get() {
        throw new Error("field getter");
      },
    });
    const symbolExtra = {};
    Object.defineProperty(symbolExtra, Symbol("extra"), { value: true });
    const hiddenExtra = {};
    Object.defineProperty(hiddenExtra, "extra", { value: true });
    const nullPrototype = Object.create(null) as Record<string, never>;
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    const throwingProxy = new Proxy(
      {},
      {
        ownKeys() {
          throw new Error("ownKeys");
        },
      },
    );
    const inputs = [
      null,
      "sort",
      [],
      new Date(),
      new Map(),
      new Spec(),
      { extra: true },
      symbolExtra,
      hiddenExtra,
      accessor,
      { field: "bad" },
      { direction: "sideways" },
      revoked.proxy,
      throwingProxy,
    ];
    for (const input of inputs) {
      expect(() => createInventorySort(input)).not.toThrow();
      expect(createInventorySort(input)).toEqual({
        ok: false,
        error: { code: "invalid_sort" },
      });
    }
    expect(createInventorySort(nullPrototype)).toMatchObject({
      ok: true,
      value: { field: "created_at", direction: "desc" },
    });
  });
  it("rejects quantity sort with a forged filter using the exact error", () => {
    const forged = { categories: [], statuses: [], units: ["piece"] } as never;
    expect(createInventorySort({ field: "quantity" }, forged)).toEqual({
      ok: false,
      error: { code: "quantity_requires_single_unit" },
    });
  });
});
