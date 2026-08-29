import { describe, expect, it } from "vitest";
import type { InventoryReadPort } from "../../../../src/application/inventory/inventory-read-port";
import { listInventory } from "../../../../src/application/inventory/list-inventory";
import { parseSearchQuery } from "../../../../src/domain/search/search-query";
import { createInventorySort } from "../../../../src/domain/inventory/inventory-sort";
import { createInventoryFilter } from "../../../../src/domain/filter/inventory-filter";
const item = (itemName: string, overrides: Record<string, unknown> = {}) => ({
  itemName,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  purchaseDate: "2024-01-01",
  unit: "piece",
  quantity: 1,
  rawAttributes: { version: 1, categories: { daily_goods: {} } },
  currentTemplateKey: "daily_goods",
  categoryId: "daily",
  ...overrides,
});
type Item = ReturnType<typeof item>;
const valueOf = <T>(result: { ok: true; value: T } | { ok: false }): T => {
  if (!result.ok) throw new Error("fixture");
  return result.value;
};
const port = (
  response: unknown,
  calls = { count: 0 },
): InventoryReadPort<Item> => ({
  readAll: async () => {
    calls.count += 1;
    return await Promise.resolve(response as never);
  },
});
const code = (state: { kind: string; error?: { code: string } }) =>
  state.kind === "load_error" && state.error ? state.error.code : "";
describe("list inventory", () => {
  it("maps loaded, true-empty, and no-results", async () => {
    const loaded = await listInventory(
      port({ ok: true, value: [item("one"), item("two")] }),
      { search: parseSearchQuery("one") },
    );
    expect(loaded.kind).toBe("loaded");
    if (loaded.kind === "loaded")
      expect(loaded.items.map((value) => value.itemName)).toEqual(["one"]);
    expect((await listInventory(port({ ok: true, value: [] }), {})).kind).toBe(
      "true_empty",
    );
    expect(
      (
        await listInventory(port({ ok: true, value: [item("one")] }), {
          search: parseSearchQuery("missing"),
        })
      ).kind,
    ).toBe("no_results");
  });
  it("maps provider errors and authentication distinctly", async () => {
    expect(
      (
        await listInventory(
          port({
            ok: false,
            error: { code: "authentication_expired", secret: "x" },
          }),
          {},
        )
      ).kind,
    ).toBe("authentication_expired");
    expect(
      code(
        await listInventory(
          port({ ok: false, error: { code: "network_failure" } }),
          {},
        ),
      ),
    ).toBe("network_failure");
    for (const errorCode of ["unavailable", "integrity_failure"] as const) {
      expect(
        code(
          await listInventory(
            port({ ok: false, error: { code: errorCode } }),
            {},
          ),
        ),
      ).toBe(errorCode);
    }
    expect(
      code(
        await listInventory(
          port({ ok: false, error: { code: "unknown" } }),
          {},
        ),
      ),
    ).toBe("integrity_failure");
  });
  it("fails closed for malformed ports, throws, and query errors", async () => {
    expect(
      code(await listInventory(port({ ok: true, value: "bad" }), {})),
    ).toBe("integrity_failure");
    const throwing = {
      readAll: async () => {
        await Promise.resolve();
        throw new Error("network");
      },
    } as unknown as InventoryReadPort<Item>;
    expect(code(await listInventory(throwing, {}))).toBe("integrity_failure");
    for (const response of [
      Object.defineProperty({}, "ok", {
        get: () => {
          throw new Error("getter");
        },
      }),
      {
        ok: true,
        get value() {
          throw new Error("getter");
        },
      },
      {
        ok: false,
        get error() {
          throw new Error("getter");
        },
      },
    ]) {
      await expect(listInventory(port(response), {})).resolves.toMatchObject({
        kind: "load_error",
        error: { code: "integrity_failure" },
      });
    }
    const revoked = Proxy.revocable({ ok: true, value: [] }, {});
    revoked.revoke();
    await expect(listInventory(port(revoked.proxy), {})).resolves.toMatchObject(
      { kind: "load_error", error: { code: "integrity_failure" } },
    );
    const badArray = new Proxy([] as Item[], {
      get(target, property, receiver) {
        if (property === Symbol.iterator) throw new Error("iterator");
        return Reflect.get(target, property, receiver) as unknown;
      },
    });
    await expect(
      listInventory(port({ ok: true, value: badArray }), {}),
    ).resolves.toMatchObject({
      kind: "load_error",
      error: { code: "integrity_failure" },
    });
    const calls = { count: 0 };
    expect(
      code(
        await listInventory(port({ ok: true, value: [] }, calls), {
          search: { normalized: "bad", tokens: [] } as never,
        }),
      ),
    ).toBe("integrity_failure");
    expect(calls.count).toBe(0);
  });
  it("copies result containers and preserves source order", async () => {
    const source = [item("one"), item("two"), item("three")];
    const calls = { count: 0 };
    const result = await listInventory(
      port({ ok: true, value: source }, calls),
      {},
    );
    if (result.kind !== "loaded") throw new Error("fixture failed");
    expect(result.items.map((value) => value.itemName)).toEqual([
      "one",
      "two",
      "three",
    ]);
    expect(calls.count).toBe(1);
    source.push(item("four"));
    expect(result.items).toHaveLength(3);
    expect(Object.isFrozen(result.items)).toBe(true);
  });
  it("uses the query snapshot captured before awaiting the port", async () => {
    let resolveRead:
      ((value: { ok: true; value: readonly Item[] }) => void) | undefined;
    const deferred = new Promise<{ ok: true; value: readonly Item[] }>(
      (resolve) => {
        resolveRead = resolve;
      },
    );
    const deferredPort: InventoryReadPort<Item> = {
      readAll: async () => await deferred,
    };
    const query = { search: parseSearchQuery("one") };
    const pending = listInventory(deferredPort, query);
    query.search = parseSearchQuery("missing");
    if (!resolveRead) throw new Error("fixture failed");
    resolveRead({ ok: true, value: [item("one")] });
    const result = await pending;
    expect(result.kind).toBe("loaded");
  });
  it("applies default and explicit sorts, including quantity validation", async () => {
    const source = [
      item("b", {
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-03T00:00:00.000Z",
        purchaseDate: undefined,
      }),
      item("a", {
        createdAt: "2024-01-02T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        purchaseDate: "2024-01-02",
      }),
    ];
    const names = await listInventory(port({ ok: true, value: source }), {});
    if (names.kind !== "loaded") throw new Error("fixture");
    expect(names.items.map((v) => v.itemName)).toEqual(["a", "b"]);
    const purchase = await listInventory(
      port({ ok: true, value: source }),
      {},
      valueOf(
        createInventorySort({ field: "purchase_date", direction: "asc" }),
      ),
    );
    if (purchase.kind !== "loaded") throw new Error("fixture");
    expect(purchase.items.map((v) => v.itemName)).toEqual(["a", "b"]);
    const updated = await listInventory(
      port({ ok: true, value: source }),
      {},
      valueOf(createInventorySort({ field: "updated_at", direction: "desc" })),
    );
    if (updated.kind !== "loaded") throw new Error("fixture");
    expect(updated.items[0]?.itemName).toBe("b");
    const quantity = await listInventory(
      port({ ok: true, value: [item("one"), item("two", { quantity: 2 })] }),
      {
        filter: valueOf(createInventoryFilter({ units: ["piece"] })),
      },
      valueOf(
        createInventorySort(
          { field: "quantity", direction: "desc" },
          valueOf(createInventoryFilter({ units: ["piece"] })),
        ),
      ),
    );
    expect(quantity.kind).toBe("loaded");
    const explicitName = await listInventory(
      port({ ok: true, value: [item("b"), item("a")] }),
      {},
      valueOf(createInventorySort({ field: "item_name", direction: "asc" })),
    );
    expect(
      explicitName.kind === "loaded" && explicitName.items[0]?.itemName,
    ).toBe("a");
    expect(
      quantity.kind === "loaded" && quantity.items.map((v) => v.quantity),
    ).toEqual([2, 1]);
  });
  it("rejects forged sort or invalid sorted items before returning data", async () => {
    const calls = { count: 0 };
    expect(
      (
        await listInventory(port({ ok: true, value: [item("x")] }, calls), {}, {
          field: "created_at",
          direction: "asc",
        } as never)
      ).kind,
    ).toBe("load_error");
    expect(calls.count).toBe(0);
    const emptyCalls = { count: 0 };
    const validQuantitySort = valueOf(
      createInventorySort(
        { field: "quantity", direction: "desc" },
        valueOf(createInventoryFilter({ units: ["piece"] })),
      ),
    );
    expect(
      (
        await listInventory(
          port({ ok: true, value: [] }, emptyCalls),
          {},
          valueOf(
            createInventorySort({ field: "created_at", direction: "desc" }),
          ),
        )
      ).kind,
    ).toBe("true_empty");
    expect(emptyCalls.count).toBe(1);
    const noResultCalls = { count: 0 };
    expect(
      (
        await listInventory(
          port({ ok: true, value: [item("x")] }, noResultCalls),
          { search: parseSearchQuery("missing") },
          valueOf(
            createInventorySort({ field: "updated_at", direction: "asc" }),
          ),
        )
      ).kind,
    ).toBe("no_results");
    expect(noResultCalls.count).toBe(1);
    const mismatchCalls = { count: 0 };
    expect(
      (
        await listInventory(
          port({ ok: true, value: [item("x")] }, mismatchCalls),
          { filter: valueOf(createInventoryFilter({ units: ["meter"] })) },
          validQuantitySort,
        )
      ).kind,
    ).toBe("load_error");
    expect(mismatchCalls.count).toBe(0);
    for (const currentFilter of [
      undefined,
      valueOf(createInventoryFilter({ units: [] })),
      valueOf(createInventoryFilter({ units: ["piece", "meter"] })),
    ]) {
      const filterCalls = { count: 0 };
      const state = await listInventory(
        port({ ok: true, value: [] }, filterCalls),
        currentFilter === undefined ? {} : { filter: currentFilter },
        validQuantitySort,
      );
      expect(state.kind).toBe("load_error");
      expect(filterCalls.count).toBe(0);
    }
    const narrowed = await listInventory(
      port({
        ok: true,
        value: [item("item-b"), item("item-a"), item("other")],
      }),
      { search: parseSearchQuery("item") },
      valueOf(createInventorySort({ field: "item_name", direction: "desc" })),
    );
    expect(
      narrowed.kind === "loaded" && narrowed.items.map((v) => v.itemName),
    ).toEqual(["item-b", "item-a"]);
    expect(
      (
        await listInventory(
          port({ ok: true, value: [item("x", { createdAt: "bad" })] }),
          {},
        )
      ).kind,
    ).toBe("load_error");
  });
});
