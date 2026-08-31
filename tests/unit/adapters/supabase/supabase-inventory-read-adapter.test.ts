import {
  AuthError,
  AuthRetryableFetchError,
  AuthSessionMissingError,
} from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { createSupabaseInventoryReadAdapter } from "../../../../src/adapters/supabase/supabase-inventory-read-adapter";
import {
  classifySupabaseAuthError,
  classifySupabaseQueryError,
} from "../../../../src/adapters/supabase/supabase-error-mapping";
import type { Database } from "../../../../src/infrastructure/supabase/database.generated";
import type { SupabaseClient } from "@supabase/supabase-js";

const userId = "10000000-0000-4000-8000-000000000001";
const validRow = () => ({
  id: "20000000-0000-4000-8000-000000000001",
  user_id: userId,
  item_name: "Adapter item",
  category_id: null,
  category: null,
  unit: "piece",
  quantity: 1,
  low_stock_threshold: null,
  image_path: null,
  notes: null,
  purchase_date: null,
  brand: null,
  color: null,
  model_code: null,
  attributes: { version: 1, categories: {} },
  created_at: "2026-08-30T00:00:00.123456+00:00",
  updated_at: "2026-08-30T00:00:00.123456+00:00",
});

function clientWithResponse(
  response: Readonly<{
    data: unknown;
    error: unknown;
    status: number;
  }>,
  calls: string[] = [],
): SupabaseClient<Database> {
  const builder = {
    select: (projection: string) => {
      calls.push(`select:${projection.replace(/\s+/gu, "")}`);
      return builder;
    },
    order: (column: string) => {
      calls.push(`order:${column}`);
      return builder;
    },
    then: (resolve: (value: typeof response) => unknown): Promise<unknown> =>
      Promise.resolve(resolve(response)),
  };
  return {
    auth: {
      getUser: () =>
        Promise.resolve({ data: { user: { id: userId } }, error: null }),
    },
    from: (table: string) => {
      calls.push(`from:${table}`);
      return builder;
    },
  } as unknown as SupabaseClient<Database>;
}

describe("classifySupabaseAuthError", () => {
  it("distinguishes retryable transport, missing session, unauthorized, and provider failures", () => {
    expect(
      classifySupabaseAuthError(new AuthRetryableFetchError("offline", 0)),
    ).toBe("network_failure");
    expect(classifySupabaseAuthError(new AuthSessionMissingError())).toBe(
      "authentication_expired",
    );
    expect(classifySupabaseAuthError(new AuthError("expired", 401))).toBe(
      "authentication_expired",
    );
    expect(classifySupabaseAuthError(new AuthError("provider", 500))).toBe(
      "unavailable",
    );
  });
});

describe("classifySupabaseQueryError", () => {
  it("distinguishes expired authorization, transport, and provider failures", () => {
    expect(classifySupabaseQueryError({ code: "PGRST301" }, 401)).toBe(
      "authentication_expired",
    );
    expect(classifySupabaseQueryError({ code: "PGRST301" }, 403)).toBe(
      "authentication_expired",
    );
    expect(classifySupabaseQueryError({ code: "PGRST000" }, 503)).toBe(
      "network_failure",
    );
    expect(classifySupabaseQueryError({ code: "unexpected" }, 0)).toBe(
      "network_failure",
    );
    expect(classifySupabaseQueryError({ code: "PGRST100" }, 500)).toBe(
      "unavailable",
    );
  });
});

describe("createSupabaseInventoryReadAdapter", () => {
  it("executes the exact relational read once and maps an immutable result", async () => {
    const calls: string[] = [];
    const result = await createSupabaseInventoryReadAdapter(
      clientWithResponse(
        { data: [validRow()], error: null, status: 200 },
        calls,
      ),
    ).readAll();
    expect(result).toMatchObject({
      ok: true,
      value: [{ id: validRow().id, itemName: "Adapter item" }],
    });
    expect(calls).toEqual([
      "from:items",
      "select:id,user_id,item_name,category_id,unit,quantity,low_stock_threshold,image_path,notes,purchase_date,brand,color,model_code,attributes,created_at,updated_at,category:categories!items_category_id_user_id_fkey(id,name,template_key)",
      "order:created_at",
      "order:id",
    ]);
    if (result.ok) expect(Object.isFrozen(result.value)).toBe(true);
  });

  it("returns an immutable empty result without treating it as failure", async () => {
    const result = await createSupabaseInventoryReadAdapter(
      clientWithResponse({ data: [], error: null, status: 200 }),
    ).readAll();
    expect(result).toEqual({ ok: true, value: [] });
    if (result.ok) expect(Object.isFrozen(result.value)).toBe(true);
  });

  it("does not query inventory when server user verification fails", async () => {
    let queried = false;
    const client = {
      auth: {
        getUser: () =>
          Promise.resolve({
            data: { user: null },
            error: new AuthSessionMissingError(),
          }),
      },
      from: () => {
        queried = true;
        throw new Error("must not query");
      },
    } as unknown as SupabaseClient<Database>;
    const adapter = createSupabaseInventoryReadAdapter(client);
    await expect(adapter.readAll()).resolves.toEqual({
      ok: false,
      error: { code: "authentication_expired" },
    });
    expect(queried).toBe(false);
  });

  it("fails closed when a successful provider response contains another owner", async () => {
    const response = {
      data: [
        {
          id: "20000000-0000-4000-8000-000000000001",
          user_id: "10000000-0000-4000-8000-000000000002",
        },
      ],
      error: null,
    };
    const builder = {
      select: () => builder,
      order: () => builder,
      then: (resolve: (value: typeof response) => unknown): Promise<unknown> =>
        Promise.resolve(resolve(response)),
    };
    const client = {
      auth: {
        getUser: () =>
          Promise.resolve({ data: { user: { id: userId } }, error: null }),
      },
      from: () => builder,
    } as unknown as SupabaseClient<Database>;
    await expect(
      createSupabaseInventoryReadAdapter(client).readAll(),
    ).resolves.toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
  });

  it.each([
    [401, { code: "PGRST301" }, "authentication_expired"],
    [0, { code: "" }, "network_failure"],
    [503, { code: "PGRST000" }, "network_failure"],
    [500, { code: "PGRST100" }, "unavailable"],
  ] as const)(
    "maps query status %s without exposing provider details",
    async (status, error, code) => {
      const result = await createSupabaseInventoryReadAdapter(
        clientWithResponse({ data: null, error, status }),
      ).readAll();
      expect(result).toEqual({ ok: false, error: { code } });
    },
  );

  it("classifies thrown fetch failures without exposing provider details", async () => {
    const client = {
      auth: {
        getUser: () =>
          Promise.reject(new TypeError("fetch failed with sensitive URL")),
      },
    } as unknown as SupabaseClient<Database>;
    await expect(
      createSupabaseInventoryReadAdapter(client).readAll(),
    ).resolves.toEqual({
      ok: false,
      error: { code: "network_failure" },
    });
  });
});
