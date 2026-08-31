import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryListItem } from "../../domain/inventory/inventory-list-item";
import type { Database } from "../../infrastructure/supabase/database.generated";
import type {
  ApplicationErrorCode,
  ApplicationResult,
} from "../../ports/application-result";
import { decodeInventoryListItem } from "./supabase-inventory-row-decoder";
import {
  classifySupabaseAuthError,
  classifySupabaseQueryError,
  classifySupabaseThrownError,
} from "./supabase-error-mapping";

type ReadResult = ApplicationResult<readonly InventoryListItem[]>;

const inventorySelect = `
  id,
  user_id,
  item_name,
  category_id,
  unit,
  quantity,
  low_stock_threshold,
  image_path,
  notes,
  purchase_date,
  brand,
  color,
  model_code,
  attributes,
  created_at,
  updated_at,
  category:categories!items_category_id_user_id_fkey(id,name,template_key)
`;

const failure = (code: ApplicationErrorCode): ReadResult => ({
  ok: false,
  error: { code },
});

export function createSupabaseInventoryReadAdapter(
  client: SupabaseClient<Database>,
): Readonly<{ readAll(): Promise<ReadResult> }> {
  return Object.freeze({
    async readAll(): Promise<ReadResult> {
      try {
        const auth = await client.auth.getUser();
        if (auth.error) return failure(classifySupabaseAuthError(auth.error));
        if (!auth.data.user) return failure("authentication_expired");

        const response = await client
          .from("items")
          .select(inventorySelect)
          .order("created_at", { ascending: false })
          .order("id", { ascending: true });
        if (response.error)
          return failure(
            classifySupabaseQueryError(response.error, response.status),
          );
        if (!Array.isArray(response.data)) return failure("integrity_failure");

        const items: InventoryListItem[] = [];
        for (const row of response.data as readonly unknown[]) {
          const decoded = decodeInventoryListItem(row, auth.data.user.id);
          if (!decoded.ok) return failure("integrity_failure");
          items.push(decoded.value);
        }
        return { ok: true, value: Object.freeze(items) };
      } catch (error) {
        return failure(classifySupabaseThrownError(error));
      }
    },
  });
}
