import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};
const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };
const expectedTemplateKeys = [
  "daily_goods",
  "food_beverage",
  "clothing_accessories",
  "electronics_appliances",
  "hobby_collection",
  "tools_supplies",
] as const;

function respond(status: number, body: Readonly<Record<string, string>>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== "POST")
    return respond(405, { code: "method_not_allowed" });

  const url = Deno.env.get("SUPABASE_URL");
  const publicKey =
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ??
    Deno.env.get("SUPABASE_ANON_KEY");
  const secretKey =
    Deno.env.get("SUPABASE_SECRET_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");
  if (!url || !publicKey || !secretKey)
    return respond(503, { code: "onboarding_unavailable" });
  if (!authorization) return respond(401, { code: "authentication_required" });

  try {
    const caller = createClient(url, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authorization } },
    });
    const verified = await caller.auth.getUser();
    const user = verified.data.user;
    if (verified.error || !user)
      return respond(401, { code: "authentication_required" });
    if (!user.email_confirmed_at)
      return respond(403, { code: "verification_required" });

    const admin = createClient(url, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const initial = await admin
      .from("application_accounts")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (initial.error) return respond(503, { code: "onboarding_unavailable" });
    if (initial.data?.status === "deleting")
      return respond(409, { code: "account_deleting" });
    if (initial.data?.status === "active")
      return respond(200, { kind: "active" });

    if (initial.data === null) {
      const pending = await admin
        .from("application_accounts")
        .upsert(
          { user_id: user.id, status: "pending" },
          { onConflict: "user_id", ignoreDuplicates: true },
        );
      if (pending.error)
        return respond(503, { code: "onboarding_unavailable" });
    }

    const account = await admin
      .from("application_accounts")
      .select("status")
      .eq("user_id", user.id)
      .single();
    if (account.error) return respond(503, { code: "onboarding_unavailable" });
    if (account.data.status === "deleting")
      return respond(409, { code: "account_deleting" });
    if (account.data.status === "active")
      return respond(200, { kind: "active" });
    if (account.data.status !== "pending")
      return respond(503, { code: "onboarding_unavailable" });

    const templates = await admin
      .from("category_templates")
      .select("key,display_name,default_sort_order")
      .eq("is_active", true)
      .order("default_sort_order");
    if (
      templates.error ||
      templates.data.length !== expectedTemplateKeys.length ||
      templates.data.some(
        (template, index) => template.key !== expectedTemplateKeys[index],
      )
    )
      return respond(503, { code: "onboarding_unavailable" });

    for (const template of templates.data) {
      const category = await admin.from("categories").insert({
        user_id: user.id,
        template_key: template.key,
        name: template.display_name,
        name_key: template.display_name,
        sort_order: template.default_sort_order,
      });
      if (category.error && category.error.code !== "23505")
        return respond(503, { code: "onboarding_unavailable" });
    }

    const materialized = await admin
      .from("categories")
      .select("template_key,name,sort_order")
      .eq("user_id", user.id)
      .not("template_key", "is", null);
    if (
      materialized.error ||
      materialized.data.length !== expectedTemplateKeys.length ||
      !templates.data.every((template) => {
        const category = materialized.data.find(
          (candidate) => candidate.template_key === template.key,
        );
        return (
          category?.name === template.display_name &&
          category.sort_order === template.default_sort_order
        );
      })
    )
      return respond(503, { code: "onboarding_unavailable" });

    const activated = await admin
      .from("application_accounts")
      .update({ status: "active" })
      .eq("user_id", user.id)
      .eq("status", "pending")
      .select("status")
      .single();
    if (!activated.error && activated.data.status === "active")
      return respond(200, { kind: "active" });
    const finalAccount = await admin
      .from("application_accounts")
      .select("status")
      .eq("user_id", user.id)
      .single();
    return !finalAccount.error && finalAccount.data.status === "active"
      ? respond(200, { kind: "active" })
      : respond(503, { code: "onboarding_unavailable" });
  } catch {
    return respond(503, { code: "onboarding_unavailable" });
  }
});
