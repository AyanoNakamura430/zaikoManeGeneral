const unicodeWhitespace = /\p{White_Space}+/gu;

export function normalizeCategoryNameKey(name: string): string {
  return name
    .normalize("NFKC")
    .replace(unicodeWhitespace, " ")
    .trim()
    .toLowerCase();
}
