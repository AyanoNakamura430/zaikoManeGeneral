import { validateHybridDocument } from "../../domain/attributes/hybrid-document";
import { parsePurchaseDate } from "../../domain/filter/purchase-date-filter";
import type { InventoryListItem } from "../../domain/inventory/inventory-list-item";
import { createItemCore } from "../../domain/item/item-core";
import { parseInstant } from "../../domain/time/instant";

export type InventoryListItemError = Readonly<{
  code: "invalid_inventory_row";
}>;

export type InventoryListItemResult =
  | { readonly ok: true; readonly value: InventoryListItem }
  | { readonly ok: false; readonly error: InventoryListItemError };

const invalid = (): InventoryListItemResult => ({
  ok: false,
  error: { code: "invalid_inventory_row" },
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}

function optionalString(
  value: unknown,
): { ok: true; value?: string } | { ok: false } {
  return value === null
    ? { ok: true }
    : typeof value === "string"
      ? { ok: true, value }
      : { ok: false };
}

function isIdentifier(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      value,
    )
  );
}

const databaseInstantPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,6}))?(Z|[+-]\d{2}:\d{2})$/;

function daysInMonth(year: number, month: number): number {
  if (month === 2)
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function canonicalizeDatabaseInstant(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = databaseInstantPattern.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  if (
    year < 1 ||
    year > 9999 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  )
    return undefined;
  const offset = match[8];
  if (offset !== "Z") {
    const offsetHours = Number(offset?.slice(1, 3));
    const offsetMinutes = Number(offset?.slice(4, 6));
    if (offsetHours > 23 || offsetMinutes > 59) return undefined;
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  const canonical = new Date(timestamp).toISOString();
  return parseInstant(canonical).ok ? canonical : undefined;
}

function snapshotOwnData(
  input: unknown,
  keys: readonly string[],
): Record<string, unknown> | undefined {
  if (!isRecord(input)) return undefined;
  const snapshot: Record<string, unknown> = Object.create(null) as Record<
    string,
    unknown
  >;
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (!descriptor || !("value" in descriptor)) return undefined;
    snapshot[key] = descriptor.value;
  }
  return snapshot;
}

export function decodeInventoryListItem(
  input: unknown,
  expectedUserId: string,
): InventoryListItemResult {
  try {
    if (!isIdentifier(expectedUserId)) return invalid();
    const row = snapshotOwnData(input, [
      "id",
      "user_id",
      "item_name",
      "category_id",
      "category",
      "unit",
      "quantity",
      "low_stock_threshold",
      "notes",
      "purchase_date",
      "brand",
      "color",
      "model_code",
      "attributes",
      "image_path",
      "created_at",
      "updated_at",
    ]);
    if (!row) return invalid();
    const {
      id,
      user_id: userId,
      item_name: itemName,
      category_id: categoryId,
      category,
      unit,
      quantity,
      low_stock_threshold: threshold,
      notes,
      purchase_date: purchaseDate,
      brand,
      color,
      model_code: modelCode,
      attributes,
      image_path: imagePath,
      created_at: createdAt,
      updated_at: updatedAt,
    } = row;
    if (
      !isIdentifier(id) ||
      userId !== expectedUserId ||
      typeof itemName !== "string" ||
      typeof quantity !== "number" ||
      (threshold !== null && typeof threshold !== "number") ||
      imagePath !== null ||
      typeof createdAt !== "string" ||
      typeof updatedAt !== "string"
    )
      return invalid();
    const canonicalCreatedAt = canonicalizeDatabaseInstant(createdAt);
    const canonicalUpdatedAt = canonicalizeDatabaseInstant(updatedAt);
    if (!canonicalCreatedAt || !canonicalUpdatedAt) return invalid();

    const core = createItemCore({
      name: itemName,
      unit,
      quantity,
      ...(threshold === null ? {} : { threshold }),
    });
    const document = validateHybridDocument(attributes);
    if (!core.ok || !document.ok) return invalid();

    let categoryName: string | undefined;
    let currentTemplateKey: string | null;
    if (categoryId === null) {
      if (category !== null) return invalid();
      currentTemplateKey = null;
    } else {
      const categoryRow = snapshotOwnData(category, [
        "id",
        "name",
        "template_key",
      ]);
      if (!isIdentifier(categoryId) || !categoryRow) return invalid();
      if (categoryRow.id !== categoryId || typeof categoryRow.name !== "string")
        return invalid();
      const templateKey = categoryRow.template_key;
      if (templateKey !== null && typeof templateKey !== "string")
        return invalid();
      categoryName = categoryRow.name;
      currentTemplateKey = templateKey;
    }

    const parsedNotes = optionalString(notes);
    const parsedBrand = optionalString(brand);
    const parsedColor = optionalString(color);
    const parsedModelCode = optionalString(modelCode);
    if (
      !parsedNotes.ok ||
      !parsedBrand.ok ||
      !parsedColor.ok ||
      !parsedModelCode.ok
    )
      return invalid();
    if (
      purchaseDate !== null &&
      (typeof purchaseDate !== "string" || !parsePurchaseDate(purchaseDate).ok)
    )
      return invalid();

    const numericQuantity: unknown = core.value.quantity;
    const numericThreshold: unknown = core.value.threshold;
    if (
      typeof numericQuantity !== "number" ||
      (numericThreshold !== undefined && typeof numericThreshold !== "number")
    )
      return invalid();

    return {
      ok: true,
      value: Object.freeze({
        id,
        itemName: core.value.name,
        categoryId,
        ...(categoryName === undefined ? {} : { categoryName }),
        currentTemplateKey,
        unit: core.value.unit,
        quantity: numericQuantity,
        ...(numericThreshold === undefined
          ? {}
          : { threshold: numericThreshold }),
        ...(parsedNotes.value === undefined
          ? {}
          : { notes: parsedNotes.value }),
        ...(purchaseDate === null ? {} : { purchaseDate }),
        ...(parsedBrand.value === undefined
          ? {}
          : { brand: parsedBrand.value }),
        ...(parsedColor.value === undefined
          ? {}
          : { color: parsedColor.value }),
        ...(parsedModelCode.value === undefined
          ? {}
          : { modelCode: parsedModelCode.value }),
        rawAttributes: document.value,
        createdAt: canonicalCreatedAt,
        updatedAt: canonicalUpdatedAt,
      }),
    };
  } catch {
    return invalid();
  }
}
