import { selectActiveAttributes } from "../attributes/active-attributes";
import type { HybridDocument } from "../attributes/hybrid-document";
import { normalizeSearchText } from "./search-query";

export type ItemSearchInput = Readonly<{
  itemName: string;
  categoryName?: string;
  notes?: string;
  brand?: string;
  color?: string;
  modelCode?: string;
  rawAttributes: HybridDocument;
  currentTemplateKey: string | null;
}>;
export type ItemSearchFieldError = Readonly<{
  code: "invalid_document" | "unknown_category_template";
  categoryKey?: string;
}>;
export type Result =
  | { readonly ok: true; readonly value: readonly string[] }
  | { readonly ok: false; readonly error: ItemSearchFieldError };

export function assembleItemSearchFields(item: ItemSearchInput): Result {
  const fields: string[] = [];
  for (const value of [
    item.itemName,
    item.categoryName,
    item.notes,
    item.brand,
    item.color,
    item.modelCode,
  ]) {
    if (value !== undefined) {
      const normalized = normalizeSearchText(value);
      if (normalized) fields.push(normalized);
    }
  }
  const active = selectActiveAttributes(
    item.rawAttributes,
    item.currentTemplateKey,
  );
  if (!active.ok) return active;
  for (const { definition, value } of active.value) {
    if (!definition.searchable || typeof value !== "string") continue;
    const normalized = normalizeSearchText(value);
    if (normalized) fields.push(normalized);
  }
  return { ok: true, value: Object.freeze(fields) };
}
