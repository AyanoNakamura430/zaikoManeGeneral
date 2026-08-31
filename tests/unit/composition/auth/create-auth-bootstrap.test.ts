import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { createAuthBootstrap } from "../../../../src/composition/auth/create-auth-bootstrap";
import type { Database } from "../../../../src/infrastructure/supabase/database.generated";

const userId = "10000000-0000-4000-8000-000000000001";
const email = "person@example.test";

function client(
  accountStates: Array<unknown>,
  calls: string[],
): SupabaseClient<Database> {
  const query = {
    select: (projection: string) => {
      calls.push(`select:${projection}`);
      return query;
    },
    eq: (column: string, value: string) => {
      calls.push(`eq:${column}:${value}`);
      return query;
    },
    maybeSingle: () => {
      calls.push("maybeSingle");
      const data = accountStates.shift();
      return Promise.resolve({ data: data ?? null, error: null, status: 200 });
    },
  };
  return {
    auth: {
      getSession: () => {
        calls.push("getSession");
        return Promise.resolve({
          data: { session: { access_token: "local-only" } },
          error: null,
        });
      },
      getUser: () => {
        calls.push("getUser");
        return Promise.resolve({
          data: {
            user: {
              id: userId,
              email,
              email_confirmed_at: "2026-08-31T00:00:00Z",
            },
          },
          error: null,
        });
      },
    },
    from: (table: string) => {
      calls.push(`from:${table}`);
      return query;
    },
    functions: {
      invoke: (name: string, options: unknown) => {
        calls.push(`invoke:${name}:${JSON.stringify(options)}`);
        return Promise.resolve({ data: { kind: "active" }, error: null });
      },
    },
  } as unknown as SupabaseClient<Database>;
}

describe("createAuthBootstrap", () => {
  it("returns a frozen composition boundary and skips onboarding for active eligibility", async () => {
    const calls: string[] = [];
    const bootstrap = createAuthBootstrap(
      client([{ user_id: userId, status: "active" }], calls),
    );

    expect(Object.isFrozen(bootstrap)).toBe(true);
    await expect(bootstrap.run()).resolves.toEqual({
      kind: "resolved",
      eligibility: { kind: "active", email },
    });
    expect(calls).not.toContain(expect.stringContaining("invoke:"));
  });

  it("uses the injected client for eligibility, onboarding, and active refresh", async () => {
    const calls: string[] = [];
    const bootstrap = createAuthBootstrap(
      client([null, { user_id: userId, status: "active" }], calls),
    );

    await expect(bootstrap.run()).resolves.toEqual({
      kind: "resolved",
      eligibility: { kind: "active", email },
    });
    expect(calls.filter((call) => call.startsWith("invoke:"))).toEqual([
      'invoke:trusted-onboarding:{"method":"POST"}',
    ]);
    expect(calls.filter((call) => call === "getSession")).toHaveLength(2);
    expect(calls.filter((call) => call === "maybeSingle")).toHaveLength(2);
  });
});
