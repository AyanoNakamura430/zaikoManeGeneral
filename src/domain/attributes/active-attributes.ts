import { ATTRIBUTE_DEFINITIONS, type AttributeDefinition } from "./definitions";
import { validateHybridDocument, type HybridDocument } from "./hybrid-document";

export type ActiveAttribute = Readonly<{
  definition: AttributeDefinition;
  value?: string | boolean;
}>;
export type ActiveAttributeErrorCode =
  "invalid_document" | "unknown_category_template";
export type ActiveAttributeError = Readonly<{
  code: ActiveAttributeErrorCode;
  categoryKey?: string;
}>;
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ActiveAttributeError };

export function selectActiveAttributes(
  document: HybridDocument,
  categoryKey: string | null,
): Result<readonly ActiveAttribute[]> {
  const validated = validateHybridDocument(document);
  if (!validated.ok) return { ok: false, error: { code: "invalid_document" } };
  if (categoryKey === null) return { ok: true, value: Object.freeze([]) };
  const definitions = ATTRIBUTE_DEFINITIONS.filter(
    (definition) => definition.categoryKey === categoryKey,
  ).sort((a, b) => a.order - b.order);
  if (definitions.length === 0)
    return {
      ok: false,
      error: { code: "unknown_category_template", categoryKey },
    };
  const values = validated.value.categories[categoryKey] ?? {};
  return {
    ok: true,
    value: Object.freeze(
      definitions.map((definition) =>
        Object.freeze(
          values[definition.key] === undefined
            ? { definition }
            : { definition, value: values[definition.key] as string | boolean },
        ),
      ),
    ),
  };
}
