import { getAttributeDefinition, type AttributeType } from "./definitions";
export type AttributeValue = string | boolean;
export type HybridDocument = Readonly<{
  version: 1;
  categories: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
}>;
export type AttributeErrorCode =
  "invalid_document" | "invalid_json" | "type_mismatch" | "custom_category";
export type AttributeError = Readonly<{
  code: AttributeErrorCode;
  categoryKey: string;
  key?: string;
}>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AttributeError };
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);
function isJsonValue(value: unknown, seen = new WeakSet<object>()): boolean {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  return Array.isArray(value)
    ? value.every((entry) => isJsonValue(entry, seen))
    : isRecord(value) &&
        Object.values(value).every((entry) => isJsonValue(entry, seen));
}
function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    if (Array.isArray(value)) value.forEach(deepFreeze);
    else Object.values(value).forEach(deepFreeze);
  }
  return value;
}
const matches = (
  type: AttributeType,
  value: unknown,
): value is AttributeValue =>
  type === "text" ? typeof value === "string" : typeof value === "boolean";
export function validateHybridDocument(input: unknown): Result<HybridDocument> {
  if (!isRecord(input) || input.version !== 1 || !isRecord(input.categories))
    return { ok: false, error: { code: "invalid_document", categoryKey: "" } };
  for (const [categoryKey, values] of Object.entries(input.categories)) {
    if (!isRecord(values))
      return { ok: false, error: { code: "invalid_document", categoryKey } };
    for (const [key, value] of Object.entries(values)) {
      if (!isJsonValue(value))
        return { ok: false, error: { code: "invalid_json", categoryKey, key } };
      const definition = getAttributeDefinition(categoryKey, key);
      if (definition && !matches(definition.valueType, value))
        return {
          ok: false,
          error: { code: "type_mismatch", categoryKey, key },
        };
    }
  }
  return {
    ok: true,
    value: deepFreeze(structuredClone(input)) as HybridDocument,
  };
}
export function patchHybridDocument(
  document: HybridDocument,
  categoryKey: string,
  key: string,
  value: AttributeValue,
): Result<HybridDocument> {
  const validated = validateHybridDocument(document);
  if (!validated.ok) return validated;
  document = validated.value;
  const definition = getAttributeDefinition(categoryKey, key);
  if (!definition)
    return { ok: false, error: { code: "custom_category", categoryKey, key } };
  if (!matches(definition.valueType, value))
    return { ok: false, error: { code: "type_mismatch", categoryKey, key } };
  const categories = { ...document.categories };
  const values = { ...(categories[categoryKey] ?? {}) };
  if (value === "") delete values[key];
  else values[key] = value;
  categories[categoryKey] = values;
  return {
    ok: true,
    value: deepFreeze(structuredClone({ version: 1, categories })),
  };
}
