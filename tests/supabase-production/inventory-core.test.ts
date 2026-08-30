import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
const env = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const url = env.ZAIKO_LOCAL_SUPABASE_URL;
const key = env.ZAIKO_LOCAL_SUPABASE_PUBLIC_KEY;
const adminKey = env.ZAIKO_LOCAL_SUPABASE_SECRET_KEY;
const client = (token: string) => createClient(url ?? "http://127.0.0.1", token);
describe("production inventory schema", () => {
  it("requires local harness credentials", () => {
    expect(typeof url).toBe("string");
    expect(typeof key).toBe("string");
    expect(typeof adminKey).toBe("string");
  });
  it("exposes the six category templates to the service client", async () => {
    if (!url || !adminKey) return;
    const result = await client(adminKey).from("category_templates").select("key,display_name,default_sort_order").order("default_sort_order");
    expect(result.error).toBeNull();
    expect(result.data?.map((row) => row.key)).toEqual(["daily_goods", "food_beverage", "clothing_accessories", "electronics_appliances", "hobby_collection", "tools_supplies"]);
  });
  it("rejects anonymous table access", async () => {
    if (!url || !key) return;
    const result = await client(key).from("items").select("id").limit(1);
    expect(result.data ?? []).toEqual([]);
  });
});
