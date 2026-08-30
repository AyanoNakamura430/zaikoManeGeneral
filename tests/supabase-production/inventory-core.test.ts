import { createClient } from "@supabase/supabase-js";
import { beforeAll, describe, expect, it } from "vitest";

import { normalizeCategoryNameKey } from "../../src/domain/category/category-name";

const env =
  (
    globalThis as unknown as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env ?? {};
const url = env.ZAIKO_LOCAL_SUPABASE_URL;
const publicKey = env.ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY;
const secretKey = env.ZAIKO_LOCAL_SUPABASE_SECRET_KEY;
if (!url || !publicKey || !secretKey)
  throw new Error("Local Supabase credentials are required.");

const options = { auth: { autoRefreshToken: false, persistSession: false } };
const service = createClient(url, secretKey, options);
const anonymous = createClient(url, publicKey, options);
const users = {
  a: createClient(url, publicKey, options),
  b: createClient(url, publicKey, options),
  pending: createClient(url, publicKey, options),
  deleting: createClient(url, publicKey, options),
};
const ids = { a: "", b: "", pending: "", deleting: "" };
const password = "Local-only-password-123!";
const randomUUID = () => globalThis.crypto.randomUUID();
const prefix = randomUUID();
const errorCode = (error: { code?: string } | null) => error?.code;

beforeAll(async () => {
  for (const name of Object.keys(users) as Array<keyof typeof users>) {
    const email = `${prefix}-${name}@example.test`;
    const created = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (created.error || !created.data.user)
      throw new Error(`Fixture user ${name} could not be created.`);
    ids[name] = created.data.user.id;
    const signedIn = await users[name].auth.signInWithPassword({
      email,
      password,
    });
    if (signedIn.error)
      throw new Error(`Fixture user ${name} could not sign in.`);
  }
  const accounts = await service.from("application_accounts").insert([
    { user_id: ids.a, status: "active" },
    { user_id: ids.b, status: "active" },
    { user_id: ids.pending, status: "pending" },
    { user_id: ids.deleting, status: "deleting" },
  ]);
  if (accounts.error) throw new Error("Fixture accounts could not be created.");
});

describe("production reference data and grants", () => {
  it("contains the exact six category templates", async () => {
    const result = await service
      .from("category_templates")
      .select("key,display_name,default_sort_order")
      .order("default_sort_order");
    expect(result.error).toBeNull();
    expect(result.data).toEqual([
      { key: "daily_goods", display_name: "日用品", default_sort_order: 0 },
      {
        key: "food_beverage",
        display_name: "食品・飲料",
        default_sort_order: 1,
      },
      {
        key: "clothing_accessories",
        display_name: "衣類・服飾",
        default_sort_order: 2,
      },
      {
        key: "electronics_appliances",
        display_name: "家電・電子機器",
        default_sort_order: 3,
      },
      {
        key: "hobby_collection",
        display_name: "趣味・コレクション",
        default_sort_order: 4,
      },
      {
        key: "tools_supplies",
        display_name: "工具・用品",
        default_sort_order: 5,
      },
    ]);
  });

  it("contains the exact eleven attribute definitions", async () => {
    const result = await service
      .from("attribute_definitions")
      .select("template_key,key,value_type,display_name,sort_order,searchable")
      .order("template_key")
      .order("sort_order");
    expect(result.error).toBeNull();
    expect(result.data).toEqual([
      {
        template_key: "clothing_accessories",
        key: "size",
        value_type: "text",
        display_name: "サイズ",
        sort_order: 0,
        searchable: true,
      },
      {
        template_key: "clothing_accessories",
        key: "material",
        value_type: "text",
        display_name: "素材",
        sort_order: 1,
        searchable: true,
      },
      {
        template_key: "daily_goods",
        key: "spec_size",
        value_type: "text",
        display_name: "規格・サイズ",
        sort_order: 0,
        searchable: true,
      },
      {
        template_key: "daily_goods",
        key: "opened",
        value_type: "boolean",
        display_name: "開封済み",
        sort_order: 1,
        searchable: false,
      },
      {
        template_key: "electronics_appliances",
        key: "serial_number",
        value_type: "text",
        display_name: "シリアル番号",
        sort_order: 0,
        searchable: true,
      },
      {
        template_key: "food_beverage",
        key: "content_amount",
        value_type: "text",
        display_name: "内容量",
        sort_order: 0,
        searchable: true,
      },
      {
        template_key: "food_beverage",
        key: "opened",
        value_type: "boolean",
        display_name: "開封済み",
        sort_order: 1,
        searchable: false,
      },
      {
        template_key: "hobby_collection",
        key: "series",
        value_type: "text",
        display_name: "シリーズ",
        sort_order: 0,
        searchable: true,
      },
      {
        template_key: "hobby_collection",
        key: "material",
        value_type: "text",
        display_name: "素材",
        sort_order: 1,
        searchable: true,
      },
      {
        template_key: "tools_supplies",
        key: "spec_size",
        value_type: "text",
        display_name: "規格・サイズ",
        sort_order: 0,
        searchable: true,
      },
      {
        template_key: "tools_supplies",
        key: "material",
        value_type: "text",
        display_name: "材質",
        sort_order: 1,
        searchable: true,
      },
    ]);
  });

  it("denies anonymous access to every application table", async () => {
    for (const table of [
      "application_accounts",
      "category_templates",
      "attribute_definitions",
      "categories",
      "items",
    ]) {
      const result = await anonymous.from(table).select("*").limit(1);
      expect(errorCode(result.error)).toBe("42501");
    }
  });

  it("limits accounts and references by account state and grants", async () => {
    const own = await users.a
      .from("application_accounts")
      .select("user_id,status");
    expect(own.data).toEqual([{ user_id: ids.a, status: "active" }]);
    expect(
      (
        await users.a
          .from("application_accounts")
          .update({ status: "deleting" })
          .eq("user_id", ids.a)
      ).error,
    ).not.toBeNull();
    expect(
      (await users.a.from("category_templates").select("key")).data,
    ).toHaveLength(6);
    expect(
      (await users.pending.from("category_templates").select("key")).data,
    ).toEqual([]);
    expect(
      (await users.deleting.from("attribute_definitions").select("key")).data,
    ).toEqual([]);
    expect(
      (
        await users.a.from("category_templates").insert({
          key: "forged",
          display_name: "Forged",
          default_sort_order: 99,
        })
      ).error,
    ).not.toBeNull();
  });
});

describe("production category isolation and normalization", () => {
  it("allows owner custom CRUD and rejects cross-account, protected, duplicate, blank, and color writes", async () => {
    const inserted = await users.a
      .from("categories")
      .insert({
        user_id: ids.a,
        name: "  ＦＯＯＤ　Supplies ",
        name_key: "spoof",
        sort_order: 0,
      })
      .select("id,name_key")
      .single();
    expect(inserted.error).toBeNull();
    expect(inserted.data?.name_key).toBe("food supplies");
    const id = inserted.data?.id as string;
    expect(
      (await users.b.from("categories").select("id").eq("id", id)).data,
    ).toEqual([]);
    expect(
      (
        await users.b
          .from("categories")
          .update({ name: "stolen" })
          .eq("id", id)
          .select()
      ).data,
    ).toEqual([]);
    expect(
      (
        await users.a.from("categories").insert({
          user_id: ids.a,
          name: "food supplies",
          name_key: "different",
          sort_order: 1,
        })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await users.a.from("categories").insert({
          user_id: ids.a,
          name: "\u3000\u00a0",
          name_key: "x",
          sort_order: 1,
        })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await users.a.from("categories").insert({
          user_id: ids.a,
          name: "Color",
          name_key: "color",
          color_key: "blue",
          sort_order: 1,
        })
      ).error,
    ).not.toBeNull();
    const system = await service
      .from("categories")
      .insert({
        user_id: ids.a,
        template_key: "daily_goods",
        name: "日用品",
        name_key: "ignored",
        sort_order: 0,
      })
      .select("id")
      .single();
    expect(system.error).toBeNull();
    expect(
      (
        await users.a
          .from("categories")
          .update({ name: "renamed" })
          .eq("id", system.data?.id)
          .select()
      ).data,
    ).toEqual([]);
    expect(
      (
        await users.a
          .from("categories")
          .delete()
          .eq("id", system.data?.id)
          .select()
      ).data,
    ).toEqual([]);
    expect(
      (
        await users.a
          .from("categories")
          .update({ name: "Renamed", sort_order: 2 })
          .eq("id", id)
      ).error,
    ).toBeNull();
  });

  it("matches the JavaScript normalization contract across Unicode vectors", async () => {
    const vectors = [
      "ASCII Case",
      "Ｆｕｌｌ１２３",
      "NBSP\u00a0Space",
      "Ogham\u1680Space",
      "Quad\u2000Space",
      "Line\u2028Break",
      "Paragraph\u2029Break",
      "Narrow\u202fSpace",
      "Medium\u205fSpace",
      "Ideographic\u3000Space",
      "École",
      "ΟΣ Case",
      "İstanbul",
      "工具・用品",
    ];
    for (const [index, name] of vectors.entries()) {
      const result = await users.a
        .from("categories")
        .insert({
          user_id: ids.a,
          name,
          name_key: "spoof",
          sort_order: 100 + index,
        })
        .select("name_key")
        .single();
      expect(result.error).toBeNull();
      expect(result.data?.name_key).toBe(normalizeCategoryNameKey(name));
    }
    expect(normalizeCategoryNameKey("École")).toBe(
      normalizeCategoryNameKey("E\u0301cole"),
    );
    expect(
      (
        await users.a.from("categories").insert({
          user_id: ids.a,
          name: "E\u0301cole",
          name_key: "spoof",
          sort_order: 999,
        })
      ).error,
    ).not.toBeNull();
  });
});

describe("production item constraints and isolation", () => {
  it("enforces owner/category isolation and restrictive category deletion", async () => {
    const category = await users.a
      .from("categories")
      .insert({
        user_id: ids.a,
        name: `Items ${prefix}`,
        name_key: "ignored",
        sort_order: 50,
      })
      .select("id")
      .single();
    const item = await users.a
      .from("items")
      .insert({
        user_id: ids.a,
        category_id: category.data?.id,
        item_name: "Owned",
        quantity: 1,
        unit: "piece",
      })
      .select("id")
      .single();
    expect(item.error).toBeNull();
    expect(
      (await users.b.from("items").select("id").eq("id", item.data?.id)).data,
    ).toEqual([]);
    expect(
      (
        await users.b
          .from("items")
          .update({ item_name: "Stolen" })
          .eq("id", item.data?.id)
          .select()
      ).data,
    ).toEqual([]);
    expect(
      (await users.b.from("items").delete().eq("id", item.data?.id).select())
        .data,
    ).toEqual([]);
    expect(
      (
        await users.b.from("items").insert({
          user_id: ids.b,
          category_id: category.data?.id,
          item_name: "Cross",
          quantity: 1,
          unit: "piece",
        })
      ).error,
    ).not.toBeNull();
    expect(
      (await users.a.from("categories").delete().eq("id", category.data?.id))
        .error,
    ).not.toBeNull();
    expect(
      (await users.a.from("items").delete().eq("id", item.data?.id)).error,
    ).toBeNull();
    expect(
      (await users.a.from("categories").delete().eq("id", category.data?.id))
        .error,
    ).toBeNull();
  });

  it("denies every inventory operation to pending and deleting accounts", async () => {
    for (const state of ["pending", "deleting"] as const) {
      const category = await service
        .from("categories")
        .insert({
          user_id: ids[state],
          name: `${state} category`,
          name_key: "ignored",
          sort_order: 0,
        })
        .select("id")
        .single();
      const item = await service
        .from("items")
        .insert({
          user_id: ids[state],
          category_id: category.data?.id,
          item_name: `${state} item`,
          quantity: 1,
          unit: "piece",
        })
        .select("id")
        .single();
      expect(category.error).toBeNull();
      expect(item.error).toBeNull();
      expect((await users[state].from("categories").select("id")).data).toEqual(
        [],
      );
      expect((await users[state].from("items").select("id")).data).toEqual([]);
      expect(
        (
          await users[state].from("categories").insert({
            user_id: ids[state],
            name: "Denied category",
            name_key: "ignored",
            sort_order: 1,
          })
        ).error,
      ).not.toBeNull();
      expect(
        (
          await users[state].from("items").insert({
            user_id: ids[state],
            item_name: "Denied item",
            quantity: 1,
            unit: "piece",
          })
        ).error,
      ).not.toBeNull();
      for (const table of ["categories", "items"] as const) {
        const id: unknown =
          table === "categories" ? category.data?.id : item.data?.id;
        expect(
          (
            await users[state]
              .from(table)
              .update(
                table === "categories"
                  ? { name: "Denied" }
                  : { item_name: "Denied" },
              )
              .eq("id", id)
              .select()
          ).data,
        ).toEqual([]);
        expect(
          (await users[state].from(table).delete().eq("id", id).select()).data,
        ).toEqual([]);
      }
    }
  });

  it("accepts all fixed units and rejects invalid numeric contracts", async () => {
    const units = [
      "point",
      "piece",
      "stick",
      "sheet",
      "book",
      "garment",
      "pair",
      "set",
      "box",
      "bag",
      "pack",
      "machine",
      "gram",
      "kilogram",
      "milliliter",
      "liter",
      "centimeter",
      "meter",
    ];
    for (const unit of units) {
      const result = await users.a.from("items").insert({
        user_id: ids.a,
        item_name: `Unit ${unit}`,
        quantity: 1,
        unit,
      });
      expect(result.error).toBeNull();
    }
    for (const row of [
      { quantity: 1, unit: "unknown" },
      { quantity: 1.5, unit: "piece" },
      { quantity: -1, unit: "meter" },
      { quantity: 100000000000000, unit: "meter" },
      { quantity: 0.0000001, unit: "meter" },
      { quantity: 1, low_stock_threshold: 0.0000001, unit: "meter" },
    ]) {
      const result = await users.a.from("items").insert({
        user_id: ids.a,
        item_name: `Invalid ${randomUUID()}`,
        ...row,
      });
      expect(result.error).not.toBeNull();
    }
    expect(
      (
        await users.a.from("items").insert({
          user_id: ids.a,
          item_name: "Six decimals",
          quantity: 0.000001,
          unit: "meter",
        })
      ).error,
    ).toBeNull();
    expect(
      (
        await users.a.from("items").insert([
          {
            user_id: ids.a,
            item_name: "Duplicate",
            quantity: 1,
            unit: "piece",
          },
          {
            user_id: ids.a,
            item_name: "Duplicate",
            quantity: 2,
            unit: "piece",
          },
        ])
      ).error,
    ).toBeNull();
    expect(
      (
        await users.a.from("items").insert({
          user_id: ids.a,
          item_name: "\u3000\u00a0",
          quantity: 1,
          unit: "piece",
        })
      ).error,
    ).not.toBeNull();
  });

  it("validates known JSON types while preserving unknown data", async () => {
    const valid = {
      version: 1,
      categories: {
        daily_goods: {
          spec_size: "large",
          opened: true,
          future: { nested: 1 },
        },
        future_category: { value: [1, 2] },
      },
    };
    const accepted = await users.a
      .from("items")
      .insert({
        user_id: ids.a,
        item_name: "JSON valid",
        quantity: 1,
        unit: "piece",
        attributes: valid,
      })
      .select("attributes")
      .single();
    expect(accepted.error).toBeNull();
    expect(accepted.data?.attributes).toEqual(valid);
    for (const attributes of [
      { version: 1 },
      { categories: {} },
      { version: 1, categories: null },
      { version: 2, categories: {} },
      { version: 1, categories: { daily_goods: { opened: "yes" } } },
      { version: 1, categories: { tools_supplies: { material: false } } },
    ]) {
      expect(
        (
          await users.a.from("items").insert({
            user_id: ids.a,
            item_name: `JSON invalid ${randomUUID()}`,
            quantity: 1,
            unit: "piece",
            attributes,
          })
        ).error,
      ).not.toBeNull();
    }
  });

  it("owns timestamps and immutable identity on the server", async () => {
    const forged = "2000-01-01T00:00:00.000Z";
    const created = await users.a
      .from("items")
      .insert({
        user_id: ids.a,
        item_name: "Timestamp",
        quantity: 1,
        unit: "piece",
        created_at: forged,
        updated_at: forged,
        image_path: "forged/path",
      })
      .select("id,created_at,updated_at")
      .single();
    expect(created.error).not.toBeNull();
    const clean = await users.a
      .from("items")
      .insert({
        user_id: ids.a,
        item_name: "Timestamp",
        quantity: 1,
        unit: "piece",
        created_at: forged,
        updated_at: forged,
      })
      .select("id,created_at,updated_at")
      .single();
    expect(clean.error).toBeNull();
    expect(clean.data?.created_at).not.toBe(forged);
    expect(clean.data?.updated_at).not.toBe(forged);
    const updated = await users.a
      .from("items")
      .update({ item_name: "Timestamp updated", updated_at: forged })
      .eq("id", clean.data?.id)
      .select("created_at,updated_at")
      .single();
    expect(updated.error).toBeNull();
    expect(updated.data?.created_at).toBe(clean.data?.created_at);
    expect(updated.data?.updated_at).not.toBe(forged);
    expect(
      (
        await users.a
          .from("items")
          .update({ user_id: ids.b })
          .eq("id", clean.data?.id)
      ).error,
    ).not.toBeNull();
  });
});
