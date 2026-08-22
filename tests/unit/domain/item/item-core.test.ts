import { describe, expect, it } from "vitest";
import { validateQuantity } from "../../../../src/domain/inventory/quantity";
import { createItemCore } from "../../../../src/domain/item/item-core";

describe("item core", () => {
  it("preserves original name and validates unit quantities", () => {
    const result = createItemCore({
      name: " Ａ Item ",
      unit: "piece",
      quantity: 2,
      threshold: 1,
    });
    expect(result).toMatchObject({
      ok: true,
      value: {
        name: " Ａ Item ",
        unit: "piece",
        quantity: 2,
        threshold: 1,
      },
    });
    if (result.ok) expect(Object.isFrozen(result.value)).toBe(true);
  });
  it("allows distinct names with the same normalized form", () => {
    expect(
      createItemCore({ name: "Food", unit: "point", quantity: 1 }).ok,
    ).toBe(true);
    expect(
      createItemCore({ name: "ＦＯＯＤ", unit: "point", quantity: 1 }).ok,
    ).toBe(true);
  });
  it("returns only approved fields and omits absent threshold", () => {
    const result = createItemCore({ name: "Item", unit: "point", quantity: 1 });
    if (!result.ok) throw new Error("fixture failed");
    expect(Object.keys(result.value)).toEqual(["name", "unit", "quantity"]);
    expect("status" in result.value).toBe(false);
  });
  it("rejects hand-crafted cores at compile time", () => {
    const quantity = validateQuantity(1, "point");
    if (!quantity.ok) throw new Error("fixture failed");
    // @ts-expect-error ItemCore has a private item brand.
    const handCrafted: import("../../../../src/domain/item/item-core").ItemCore =
      {
        name: "Item",
        unit: "point",
        quantity: quantity.value,
      };
    expect(handCrafted).toBeDefined();
  });
  it("does not expose a caller-selected generic create API", () => {
    // @ts-expect-error createItemCore has no public generic parameter.
    createItemCore<"meter">({ name: "Item", unit: "meter", quantity: 1 });
  });
  it("requires explicit fields and rejects blank name or unsafe unit", () => {
    expect(createItemCore({ name: " \t", unit: "point", quantity: 1 })).toEqual(
      { ok: false, error: { code: "blank_name", field: "name" } },
    );
    expect(
      createItemCore({ name: "Item", unit: "unknown", quantity: 1 }),
    ).toEqual({ ok: false, error: { code: "invalid_unit", field: "unit" } });
    expect(createItemCore({ name: "Item", unit: 1, quantity: 1 })).toEqual({
      ok: false,
      error: { code: "invalid_unit", field: "unit" },
    });
  });
  it("propagates quantity and threshold validation without implicit defaults", () => {
    expect(
      createItemCore({ name: "Item", unit: "piece", quantity: 1.2 }),
    ).toEqual({
      ok: false,
      error: { code: "count_requires_integer", field: "quantity" },
    });
    expect(
      createItemCore({
        name: "Item",
        unit: "piece",
        quantity: 1,
        threshold: -1,
      }),
    ).toEqual({ ok: false, error: { code: "negative", field: "threshold" } });
    expect(
      createItemCore({ name: "Item", unit: "meter", quantity: 1.2 }),
    ).toMatchObject({ ok: true, value: { quantity: 1.2 } });
  });
});
