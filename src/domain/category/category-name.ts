const unicodeWhitespace = /\p{White_Space}+/gu;

export function normalizeCategoryNameKey(name: string): string {
  return name
    .normalize("NFKC")
    .replace(unicodeWhitespace, " ")
    .trim()
    .toLowerCase();
}

const validatedNameBrand = Symbol("ValidatedCategoryName");
export type ValidatedCategoryName = Readonly<{
  displayName: string;
  nameKey: string;
  readonly [validatedNameBrand]: true;
}>;
export type CategoryNameErrorCode = "blank_name" | "duplicate_name";
export type CategoryNameResult =
  | { readonly ok: true; readonly value: ValidatedCategoryName }
  | {
      readonly ok: false;
      readonly error: Readonly<{ code: CategoryNameErrorCode }>;
    };

export function validateCategoryName(
  displayName: string,
  unavailableNames: readonly string[],
): CategoryNameResult {
  const nameKey = normalizeCategoryNameKey(displayName);
  if (!nameKey) return { ok: false, error: { code: "blank_name" } };
  const unavailableKeys = new Set(
    unavailableNames.map(normalizeCategoryNameKey),
  );
  if (unavailableKeys.has(nameKey))
    return { ok: false, error: { code: "duplicate_name" } };
  return {
    ok: true,
    value: Object.freeze({
      displayName,
      nameKey,
      [validatedNameBrand]: true as const,
    }),
  };
}
