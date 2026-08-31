import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../infrastructure/supabase/database.generated";
import {
  decodeBrowserSupabaseConfig,
  type BrowserSupabaseConfigErrorCode,
} from "./browser-supabase-config";

export type BrowserSupabaseClientResult =
  | Readonly<{ ok: true; client: SupabaseClient<Database> }>
  | Readonly<{
      ok: false;
      error: Readonly<{
        code: BrowserSupabaseConfigErrorCode | "client_initialization_failed";
      }>;
    }>;

export function createBrowserSupabaseClient(
  url: unknown,
  publishableKey: unknown,
  legacyAnonKey: unknown,
): BrowserSupabaseClientResult {
  const config = decodeBrowserSupabaseConfig(
    url,
    publishableKey,
    legacyAnonKey,
  );
  if (!config.ok) return config;
  try {
    return Object.freeze({
      ok: true,
      client: createClient<Database>(config.value.url, config.value.publicKey),
    });
  } catch {
    return Object.freeze({
      ok: false,
      error: Object.freeze({ code: "client_initialization_failed" as const }),
    });
  }
}
