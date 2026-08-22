import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, test } from "vitest";

declare const __ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY__: string | undefined;
declare const __ZAIKO_LOCAL_SUPABASE_SECRET_KEY__: string | undefined;
declare const __ZAIKO_LOCAL_SUPABASE_URL__: string | undefined;

const requiredEnvironment = (name: string, value: string | undefined) => {
  if (!value)
    throw new Error(`Missing required local harness setting: ${name}`);
  return value;
};

const apiUrl = requiredEnvironment(
  "ZAIKO_LOCAL_SUPABASE_URL",
  __ZAIKO_LOCAL_SUPABASE_URL__,
);
const publicKey = requiredEnvironment(
  "ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY",
  __ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY__,
);
const secretKey = requiredEnvironment(
  "ZAIKO_LOCAL_SUPABASE_SECRET_KEY",
  __ZAIKO_LOCAL_SUPABASE_SECRET_KEY__,
);

const ids = {
  userA: "10000000-0000-4000-8000-000000000001",
  userB: "10000000-0000-4000-8000-000000000002",
  pending: "10000000-0000-4000-8000-000000000003",
  deleting: "10000000-0000-4000-8000-000000000004",
  categoryA: "20000000-0000-4000-8000-000000000001",
  categoryB: "20000000-0000-4000-8000-000000000002",
  itemA: "30000000-0000-4000-8000-000000000001",
  itemB: "30000000-0000-4000-8000-000000000002",
  itemPending: "30000000-0000-4000-8000-000000000003",
  itemDeleting: "30000000-0000-4000-8000-000000000004",
} as const;

const password = "Local-harness-password-1";

const client = (key: string) =>
  createClient(apiUrl, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

const admin = client(secretKey);
const anon = client(publicKey);

const users: Record<"a" | "b" | "pending" | "deleting", SupabaseClient> = {
  a: client(publicKey),
  b: client(publicKey),
  pending: client(publicKey),
  deleting: client(publicKey),
};

async function createHarnessUser(id: string, label: string) {
  const { error } = await admin.auth.admin.createUser({
    id,
    email: `${label}@wp7.invalid`,
    password,
    email_confirm: true,
  });
  expect(error).toBeNull();
}

async function signIn(target: SupabaseClient, label: string) {
  const { error } = await target.auth.signInWithPassword({
    email: `${label}@wp7.invalid`,
    password,
  });
  expect(error).toBeNull();
}

async function waitForSchemaCache() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const { error } = await admin
      .from("harness_accounts")
      .select("user_id")
      .limit(1);
    if (!error) return;
    if (error.code !== "PGRST205") throw error;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000));
  }
  throw new Error("Timed out waiting for the local Data API schema cache.");
}

beforeAll(async () => {
  await waitForSchemaCache();
  await createHarnessUser(ids.userA, "user-a");
  await createHarnessUser(ids.userB, "user-b");
  await createHarnessUser(ids.pending, "pending");
  await createHarnessUser(ids.deleting, "deleting");

  const { error: accountError } = await admin.from("harness_accounts").insert([
    { user_id: ids.userA, status: "active" },
    { user_id: ids.userB, status: "active" },
    { user_id: ids.pending, status: "pending" },
    { user_id: ids.deleting, status: "deleting" },
  ]);
  expect(accountError).toBeNull();

  const { error: categoryError } = await admin
    .from("harness_categories")
    .insert([
      { id: ids.categoryA, user_id: ids.userA, name: "A category" },
      { id: ids.categoryB, user_id: ids.userB, name: "B category" },
    ]);
  expect(categoryError).toBeNull();

  const { error: itemError } = await admin.from("harness_items").insert([
    {
      id: ids.itemA,
      user_id: ids.userA,
      category_id: ids.categoryA,
      name: "A item",
      quantity: 1,
    },
    {
      id: ids.itemB,
      user_id: ids.userB,
      category_id: ids.categoryB,
      name: "B item",
      quantity: 1,
    },
    {
      id: ids.itemPending,
      user_id: ids.pending,
      name: "Pending item",
      quantity: 1,
    },
    {
      id: ids.itemDeleting,
      user_id: ids.deleting,
      name: "Deleting item",
      quantity: 1,
    },
  ]);
  expect(itemError).toBeNull();

  const { error: grantlessError } = await admin
    .from("harness_grantless_items")
    .insert({
      id: "40000000-0000-4000-8000-000000000001",
      user_id: ids.userA,
      name: "Hidden by grant",
    });
  expect(grantlessError).toBeNull();

  await signIn(users.a, "user-a");
  await signIn(users.b, "user-b");
  await signIn(users.pending, "pending");
  await signIn(users.deleting, "deleting");
});

describe("migration and constraints", () => {
  test("enforces nonblank names and nonnegative quantity", async () => {
    const blank = await admin.from("harness_categories").insert({
      id: "20000000-0000-4000-8000-000000000010",
      user_id: ids.userA,
      name: "   ",
    });
    expect(blank.error).not.toBeNull();

    const negative = await admin.from("harness_items").insert({
      id: "30000000-0000-4000-8000-000000000010",
      user_id: ids.userA,
      name: "Invalid quantity",
      quantity: -1,
    });
    expect(negative.error).not.toBeNull();
  });

  test("rejects a cross-owner category relationship", async () => {
    const result = await users.a.from("harness_items").insert({
      id: "30000000-0000-4000-8000-000000000011",
      user_id: ids.userA,
      category_id: ids.categoryB,
      name: "Cross owner",
      quantity: 1,
    });
    expect(result.error).not.toBeNull();
  });
});

describe("GRANT and RLS separation", () => {
  test("denies anonymous table access", async () => {
    const result = await anon.from("harness_items").select("id");
    expect(result.error).not.toBeNull();
  });

  test("reports a missing GRANT even when an owner RLS policy exists", async () => {
    const result = await users.a.from("harness_grantless_items").select("id");
    expect(result.error).not.toBeNull();
  });

  test("allows an active owner and hides another owner's rows", async () => {
    const own = await users.a
      .from("harness_items")
      .select("id")
      .eq("id", ids.itemA);
    expect(own.error).toBeNull();
    expect(own.data).toHaveLength(1);

    const other = await users.a
      .from("harness_items")
      .select("id")
      .eq("id", ids.itemB);
    expect(other.error).toBeNull();
    expect(other.data).toEqual([]);
  });

  test("rejects ownership reassignment on update", async () => {
    const result = await users.a
      .from("harness_items")
      .update({ user_id: ids.userB })
      .eq("id", ids.itemA)
      .select("id");
    expect(result.error).not.toBeNull();
  });

  test("blocks pending and deleting application accounts", async () => {
    const pending = await users.pending
      .from("harness_items")
      .select("id")
      .eq("id", ids.itemPending);
    expect(pending.error).toBeNull();
    expect(pending.data).toEqual([]);

    const deleting = await users.deleting
      .from("harness_items")
      .select("id")
      .eq("id", ids.itemDeleting);
    expect(deleting.error).toBeNull();
    expect(deleting.data).toEqual([]);
  });
});

describe("private Storage policies", () => {
  const ownPath = `${ids.userA}/${ids.itemA}/photo.png`;

  test("allows an owner upload and download", async () => {
    const upload = await users.a.storage
      .from("harness-private")
      .upload(ownPath, new Uint8Array([137, 80, 78, 71]), {
        contentType: "image/png",
      });
    expect(upload.error).toBeNull();

    const download = await users.a.storage
      .from("harness-private")
      .download(ownPath);
    expect(download.error).toBeNull();
  });

  test("denies another user path and read access", async () => {
    const forged = await users.a.storage
      .from("harness-private")
      .upload(`${ids.userB}/${ids.itemB}/forged.png`, new Uint8Array([1]), {
        contentType: "image/png",
      });
    expect(forged.error).not.toBeNull();

    const otherRead = await users.b.storage
      .from("harness-private")
      .download(ownPath);
    expect(otherRead.error).not.toBeNull();
  });

  test("denies pending and deleting account uploads", async () => {
    const pending = await users.pending.storage
      .from("harness-private")
      .upload(
        `${ids.pending}/${ids.itemPending}/pending.png`,
        new Uint8Array([1]),
        {
          contentType: "image/png",
        },
      );
    expect(pending.error).not.toBeNull();

    const deleting = await users.deleting.storage
      .from("harness-private")
      .upload(
        `${ids.deleting}/${ids.itemDeleting}/deleting.png`,
        new Uint8Array([1]),
        {
          contentType: "image/png",
        },
      );
    expect(deleting.error).not.toBeNull();
  });

  test("rejects an object above the configured bucket size", async () => {
    const oversized = await users.a.storage
      .from("harness-private")
      .upload(
        `${ids.userA}/${ids.itemA}/oversized.png`,
        new Uint8Array(5 * 1024 * 1024 + 1),
        { contentType: "image/png" },
      );
    expect(oversized.error).not.toBeNull();
  });

  test("rejects unsupported MIME, upsert, and direct delete", async () => {
    const mime = await users.a.storage
      .from("harness-private")
      .upload(`${ids.userA}/${ids.itemA}/note.txt`, new Uint8Array([1]), {
        contentType: "text/plain",
      });
    expect(mime.error).not.toBeNull();

    const upsert = await users.a.storage
      .from("harness-private")
      .upload(ownPath, new Uint8Array([137, 80, 78, 71]), {
        contentType: "image/png",
        upsert: true,
      });
    expect(upsert.error).not.toBeNull();

    const removal = await users.a.storage
      .from("harness-private")
      .remove([ownPath]);
    expect(removal.error).toBeNull();

    const afterRemoval = await users.a.storage
      .from("harness-private")
      .download(ownPath);
    expect(afterRemoval.error).toBeNull();
  });
});
