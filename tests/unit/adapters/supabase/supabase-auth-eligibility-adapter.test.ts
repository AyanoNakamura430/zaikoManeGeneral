import {
  AuthRetryableFetchError,
  AuthSessionMissingError,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { createSupabaseAuthEligibilityAdapter } from "../../../../src/adapters/supabase/supabase-auth-eligibility-adapter";
import type { Database } from "../../../../src/infrastructure/supabase/database.generated";

const userId = "10000000-0000-4000-8000-000000000001";
const email = "person@example.test";

class StatusError extends Error {
  constructor(readonly status: number) {
    super(`provider status ${status}`);
  }
}

type Fixture = Readonly<{
  session?: unknown;
  sessionError?: unknown;
  sessionThrow?: Error;
  user?: unknown;
  userError?: unknown;
  userThrow?: Error;
  account?: unknown;
  accountError?: unknown;
  accountStatus?: number;
  accountThrow?: Error;
}>;

function client(fixture: Fixture, calls: string[]): SupabaseClient<Database> {
  const query = {
    select: (projection: string) => {
      calls.push(`select:${projection}`);
      return query;
    },
    eq: (column: string, value: string) => {
      calls.push(`eq:${column}:${value}`);
      return query;
    },
    maybeSingle: () =>
      fixture.accountThrow
        ? Promise.reject(fixture.accountThrow)
        : Promise.resolve({
            data: fixture.account ?? null,
            error: fixture.accountError ?? null,
            status: fixture.accountStatus ?? 200,
          }),
  };
  return {
    auth: {
      getSession: () => {
        calls.push("getSession");
        if (fixture.sessionThrow) return Promise.reject(fixture.sessionThrow);
        return Promise.resolve({
          data: { session: fixture.session ?? null },
          error: fixture.sessionError ?? null,
        });
      },
      getUser: () => {
        calls.push("getUser");
        if (fixture.userThrow) return Promise.reject(fixture.userThrow);
        return Promise.resolve({
          data: { user: fixture.user ?? null },
          error: fixture.userError ?? null,
        });
      },
    },
    from: (table: string) => {
      calls.push(`from:${table}`);
      return query;
    },
  } as unknown as SupabaseClient<Database>;
}

const verifiedUser = {
  id: userId,
  email,
  email_confirmed_at: "2026-08-31T00:00:00Z",
};

describe("createSupabaseAuthEligibilityAdapter", () => {
  it("returns unauthenticated without a server or database request when no session exists", async () => {
    const calls: string[] = [];
    const result = await createSupabaseAuthEligibilityAdapter(
      client({}, calls),
    ).read();
    expect(result).toEqual({ ok: true, value: { kind: "unauthenticated" } });
    expect(calls).toEqual(["getSession"]);
  });

  it("requires reauthentication when a stored session fails server validation", async () => {
    const calls: string[] = [];
    const result = await createSupabaseAuthEligibilityAdapter(
      client(
        {
          session: { access_token: "local-only" },
          userError: new AuthSessionMissingError(),
        },
        calls,
      ),
    ).read();
    expect(result).toEqual({
      ok: true,
      value: { kind: "reauthentication_required" },
    });
    expect(calls).toEqual(["getSession", "getUser"]);
  });

  it("returns verification required without reading the application account", async () => {
    const calls: string[] = [];
    const result = await createSupabaseAuthEligibilityAdapter(
      client(
        {
          session: {},
          user: { id: userId, email, email_confirmed_at: null },
        },
        calls,
      ),
    ).read();
    expect(result).toEqual({
      ok: true,
      value: { kind: "verification_required", email },
    });
    expect(calls).toEqual(["getSession", "getUser"]);
  });

  it.each([
    [null, "missing_account", "onboarding_required"],
    [
      { user_id: userId, status: "pending" },
      "pending_account",
      "onboarding_required",
    ],
    [{ user_id: userId, status: "active" }, undefined, "active"],
    [{ user_id: userId, status: "deleting" }, undefined, "deleting"],
  ] as const)("maps account %j to %s/%s", async (account, reason, kind) => {
    const calls: string[] = [];
    const result = await createSupabaseAuthEligibilityAdapter(
      client({ session: {}, user: verifiedUser, account }, calls),
    ).read();
    expect(result).toMatchObject({
      ok: true,
      value: { kind, ...(reason ? { reason } : {}) },
    });
    expect(calls).toEqual([
      "getSession",
      "getUser",
      "from:application_accounts",
      "select:user_id,status",
      `eq:user_id:${userId}`,
    ]);
  });

  it("fails closed for another owner or unknown account status", async () => {
    for (const account of [
      { user_id: "10000000-0000-4000-8000-000000000002", status: "active" },
      { user_id: userId, status: "unknown" },
    ]) {
      const result = await createSupabaseAuthEligibilityAdapter(
        client({ session: {}, user: verifiedUser, account }, []),
      ).read();
      expect(result).toEqual({
        ok: false,
        error: { code: "integrity_failure" },
      });
    }
  });

  it("maps retryable Auth transport failure without exposing details", async () => {
    const result = await createSupabaseAuthEligibilityAdapter(
      client(
        {
          session: {},
          userError: new AuthRetryableFetchError("sensitive", 0),
        },
        [],
      ),
    ).read();
    expect(result).toEqual({
      ok: false,
      error: { code: "network_failure" },
    });
  });

  it.each([
    [{ status: 401 }, null, "unauthenticated"],
    [{ status: 403 }, { access_token: "stored" }, "reauthentication_required"],
  ] as const)(
    "maps stored-session error %j according to session presence",
    async (sessionError, session, kind) => {
      const result = await createSupabaseAuthEligibilityAdapter(
        client({ session, sessionError }, []),
      ).read();
      expect(result).toEqual({ ok: true, value: { kind } });
    },
  );

  it.each([
    [
      { status: 401 },
      { ok: true, value: { kind: "reauthentication_required" } },
    ],
    [
      { status: 403 },
      { ok: true, value: { kind: "reauthentication_required" } },
    ],
    [{ status: 500 }, { ok: false, error: { code: "unavailable" } }],
  ] as const)("maps getUser error %j", async (userError, expected) => {
    await expect(
      createSupabaseAuthEligibilityAdapter(
        client({ session: {}, userError }, []),
      ).read(),
    ).resolves.toEqual(expected);
  });

  it.each([
    [{ status: 401 }, 401, "reauthentication_required"],
    [{ status: 403 }, 403, "reauthentication_required"],
    [{ code: "PGRST000" }, 500, "network_failure"],
    [{ message: "offline" }, 0, "network_failure"],
    [{ message: "provider" }, 500, "unavailable"],
  ] as const)(
    "maps account error %j with status %i",
    async (accountError, accountStatus, expected) => {
      const result = await createSupabaseAuthEligibilityAdapter(
        client(
          { session: {}, user: verifiedUser, accountError, accountStatus },
          [],
        ),
      ).read();
      expect(result).toEqual(
        expected === "reauthentication_required"
          ? { ok: true, value: { kind: expected } }
          : { ok: false, error: { code: expected } },
      );
    },
  );

  it("fails closed when successful user or account payloads are malformed", async () => {
    const throwingProxy = new Proxy(
      {},
      {
        getOwnPropertyDescriptor() {
          throw new Error("sensitive payload trap");
        },
      },
    );
    for (const fixture of [
      { user: { id: userId } },
      { user: { ...verifiedUser, email: " " } },
      { user: throwingProxy },
      {
        user: verifiedUser,
        account: {
          user_id: userId,
          get status() {
            return "active";
          },
        },
      },
      { user: verifiedUser, account: throwingProxy },
    ]) {
      await expect(
        createSupabaseAuthEligibilityAdapter(
          client({ session: {}, ...fixture }, []),
        ).read(),
      ).resolves.toEqual({
        ok: false,
        error: { code: "integrity_failure" },
      });
    }
  });

  it.each([
    ["sessionThrow", new TypeError("offline"), "network_failure"],
    ["sessionThrow", new Error("provider"), "unavailable"],
    ["userThrow", new TypeError("offline"), "network_failure"],
    ["userThrow", new Error("provider"), "unavailable"],
    ["userThrow", new StatusError(401), "reauthentication_required"],
    ["accountThrow", new TypeError("offline"), "network_failure"],
    ["accountThrow", new Error("provider"), "unavailable"],
    ["accountThrow", new StatusError(403), "reauthentication_required"],
  ] as const)("maps rejected %s with %j", async (field, thrown, expected) => {
    const fixture: Fixture = {
      session: {},
      user: verifiedUser,
      account: { user_id: userId, status: "active" },
      [field]: thrown,
    };
    const result = await createSupabaseAuthEligibilityAdapter(
      client(fixture, []),
    ).read();
    expect(result).toEqual(
      expected === "reauthentication_required"
        ? { ok: true, value: { kind: expected } }
        : { ok: false, error: { code: expected } },
    );
  });

  it.each([
    [new AuthRetryableFetchError("sensitive", 0), "network_failure"],
    [{ status: 500 }, "unavailable"],
  ] as const)(
    "maps getSession response error %j",
    async (sessionError, code) => {
      await expect(
        createSupabaseAuthEligibilityAdapter(
          client({ sessionError, session: {} }, []),
        ).read(),
      ).resolves.toEqual({ ok: false, error: { code } });
    },
  );
});
