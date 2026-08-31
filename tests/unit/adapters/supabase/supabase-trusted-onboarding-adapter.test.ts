import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { createSupabaseTrustedOnboardingAdapter } from "../../../../src/adapters/supabase/supabase-trusted-onboarding-adapter";
import type { Database } from "../../../../src/infrastructure/supabase/database.generated";

function client(result: unknown, calls: unknown[]): SupabaseClient<Database> {
  return {
    functions: {
      invoke: (name: string, options: unknown) => {
        calls.push({ name, options });
        return Promise.resolve(result);
      },
    },
  } as unknown as SupabaseClient<Database>;
}

describe("createSupabaseTrustedOnboardingAdapter", () => {
  it("invokes the exact function and accepts only the active contract", async () => {
    const calls: unknown[] = [];
    await expect(
      createSupabaseTrustedOnboardingAdapter(
        client({ data: { kind: "active" }, error: null }, calls),
      ).run(),
    ).resolves.toEqual({ ok: true, value: { kind: "active" } });
    expect(calls).toEqual([
      { name: "trusted-onboarding", options: { method: "POST" } },
    ]);
  });

  it.each([null, {}, { kind: "pending" }, { kind: "active", extra: true }])(
    "rejects malformed success payload %j",
    async (data) => {
      await expect(
        createSupabaseTrustedOnboardingAdapter(
          client({ data, error: null }, []),
        ).run(),
      ).resolves.toEqual({
        ok: false,
        error: { code: "integrity_failure" },
      });
    },
  );

  it("classifies an exceptional success payload as integrity failure", async () => {
    const response = Object.defineProperty({}, "error", {
      get() {
        throw new Error("sensitive payload trap");
      },
    });
    await expect(
      createSupabaseTrustedOnboardingAdapter(client(response, [])).run(),
    ).resolves.toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
  });

  it.each([
    [new FunctionsFetchError({}), "network_failure"],
    [new FunctionsRelayError({}), "unavailable"],
    [
      new FunctionsHttpError(new Response(null, { status: 401 })),
      "authentication_expired",
    ],
    [
      new FunctionsHttpError(new Response(null, { status: 403 })),
      "authentication_expired",
    ],
    [
      new FunctionsHttpError(new Response(null, { status: 409 })),
      "integrity_failure",
    ],
    [
      new FunctionsHttpError(new Response(null, { status: 503 })),
      "unavailable",
    ],
  ] as const)("maps function error %#", async (error, code) => {
    await expect(
      createSupabaseTrustedOnboardingAdapter(
        client({ data: null, error }, []),
      ).run(),
    ).resolves.toEqual({ ok: false, error: { code } });
  });

  it.each([
    [new TypeError("offline"), "network_failure"],
    [new Error("provider"), "unavailable"],
  ] as const)("maps rejected invocation %#", async (error, code) => {
    const rejected = {
      functions: { invoke: () => Promise.reject(error) },
    } as unknown as SupabaseClient<Database>;
    await expect(
      createSupabaseTrustedOnboardingAdapter(rejected).run(),
    ).resolves.toEqual({ ok: false, error: { code } });
  });
});
