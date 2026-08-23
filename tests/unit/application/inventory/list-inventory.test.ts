import { describe, expect, it } from "vitest";
import type { InventoryReadPort } from "../../../../src/application/inventory/inventory-read-port";
import { listInventory } from "../../../../src/application/inventory/list-inventory";
import { parseSearchQuery } from "../../../../src/domain/search/search-query";
const item = (itemName: string) => ({
  itemName,
  rawAttributes: { version: 1, categories: { daily_goods: {} } },
  currentTemplateKey: "daily_goods",
  categoryId: "daily",
  unit: "piece",
  quantity: 1,
});
type Item = ReturnType<typeof item>;
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
});
