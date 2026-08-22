import { describe, expect, it } from "vitest";
import {
  patchHybridDocument,
  validateHybridDocument,
  type HybridDocument,
  type Result,
} from "../../../../src/domain/attributes/hybrid-document";

const base: HybridDocument = {
  version: 1,
  categories: { daily_goods: { opened: true, legacy: 42 } },
};
const valueOf = <T>(result: Result<T>): T => {
  if (!result.ok) throw new Error("fixture failed");
  return result.value;
};
describe("hybrid attribute document", () => {
  it("accepts known values and preserves unknown JSON", () => {
    expect(validateHybridDocument(base).ok).toBe(true);
    expect(
      valueOf(patchHybridDocument(base, "daily_goods", "spec_size", "L"))
        .categories.daily_goods,
    ).toEqual({ opened: true, legacy: 42, spec_size: "L" });
  });
  it("rejects known type mismatches and custom categories", () => {
    expect(
      validateHybridDocument({
        version: 1,
        categories: { daily_goods: { opened: "yes" } },
      }),
    ).toMatchObject({ ok: false, error: { code: "type_mismatch" } });
    expect(patchHybridDocument(base, "custom", "note", "x")).toMatchObject({
      ok: false,
      error: { code: "custom_category" },
    });
    expect(
      patchHybridDocument(
        {
          version: 1,
          categories: { daily_goods: { opened: "invalid" } },
        },
        "daily_goods",
        "spec_size",
        "L",
      ),
    ).toMatchObject({ ok: false, error: { code: "type_mismatch" } });
    expect(
      patchHybridDocument(base, "daily_goods", "opened", 1 as never),
    ).toEqual({
      ok: false,
      error: {
        code: "type_mismatch",
        categoryKey: "daily_goods",
        key: "opened",
      },
    });
  });
  it("returns invalid_document for malformed document structure", () => {
    for (const input of [
      null,
      [],
      { version: 2, categories: {} },
      { version: 1 },
    ]) {
      expect(validateHybridDocument(input)).toEqual({
        ok: false,
        error: { code: "invalid_document", categoryKey: "" },
      });
    }
    expect(
      validateHybridDocument({
        version: 1,
        categories: { daily_goods: [] },
      }),
    ).toEqual({
      ok: false,
      error: { code: "invalid_document", categoryKey: "daily_goods" },
    });
  });
  it("rejects non-JSON unknown values and returns an immutable snapshot", () => {
    expect(
      validateHybridDocument({
        version: 1,
        categories: { daily_goods: { unknown: Number.NaN } },
      }),
    ).toMatchObject({ ok: false, error: { code: "invalid_json" } });
    const input = {
      version: 1,
      categories: { daily_goods: { unknown: { nested: true } } },
    };
    const result = validateHybridDocument(input);
    if (!result.ok) throw new Error("fixture validation failed");
    input.categories.daily_goods.unknown.nested = false;
    expect(result.value.categories.daily_goods!.unknown).toEqual({
      nested: true,
    });
    expect(Object.isFrozen(result.value)).toBe(true);
  });
  it("accepts nested JSON and rejects non-JSON values", () => {
    expect(
      validateHybridDocument({
        version: 1,
        categories: {
          daily_goods: { unknown: { nested: [null, { ok: true }] } },
        },
      }).ok,
    ).toBe(true);
    const cycle: { self?: unknown } = {};
    cycle.self = cycle;
    for (const value of [
      cycle,
      new Date(),
      undefined,
      () => true,
      Infinity,
      1n,
      Symbol("x"),
    ]) {
      expect(
        validateHybridDocument({
          version: 1,
          categories: { daily_goods: { unknown: value } },
        }),
      ).toMatchObject({ ok: false, error: { code: "invalid_json" } });
    }
  });
  it("isolates nested aliases and freezes patched output", () => {
    const nested = { tags: ["a", { enabled: true }] };
    const input = {
      version: 1,
      categories: { daily_goods: { unknown: nested } },
    };
    const decoded = validateHybridDocument(input);
    if (!decoded.ok) throw new Error("fixture validation failed");
    const patched = patchHybridDocument(
      decoded.value,
      "daily_goods",
      "spec_size",
      "M",
    );
    if (!patched.ok) throw new Error("fixture patch failed");
    nested.tags[1] = { enabled: false };
    expect(patched.value.categories.daily_goods!.unknown).toEqual({
      tags: ["a", { enabled: true }],
    });
    expect(Object.isFrozen(patched.value)).toBe(true);
    expect(Object.isFrozen(patched.value.categories.daily_goods!.unknown)).toBe(
      true,
    );
  });
  it("preserves every hidden category namespace while patching the current one", () => {
    const document = valueOf(
      validateHybridDocument({
        version: 1,
        categories: {
          daily_goods: { opened: true },
          food_beverage: {
            content_amount: "500 mL",
            unknown: { retained: true },
          },
        },
      }),
    );
    const hiddenBefore = document.categories.food_beverage;
    const patched = valueOf(
      patchHybridDocument(document, "daily_goods", "spec_size", "L"),
    );
    expect(patched.categories.food_beverage).toEqual(hiddenBefore);
  });
  it("deletes only the exact empty text value and retains whitespace", () => {
    expect(
      valueOf(patchHybridDocument(base, "daily_goods", "spec_size", ""))
        .categories.daily_goods,
    ).toEqual({ opened: true, legacy: 42 });
    expect(
      valueOf(patchHybridDocument(base, "daily_goods", "spec_size", " "))
        .categories.daily_goods!.spec_size,
    ).toBe(" ");
  });
});
