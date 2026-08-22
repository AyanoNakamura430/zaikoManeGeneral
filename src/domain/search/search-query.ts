const searchQueryBrand = Symbol("SearchQuery");
export type SearchQuery = Readonly<{
  normalized: string;
  tokens: readonly string[];
  readonly [searchQueryBrand]: true;
}>;

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/\p{White_Space}+/gu, " ")
    .trim()
    .toLowerCase();
}

export function parseSearchQuery(query: string): SearchQuery {
  const raw = normalizeSearchText(query);
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const token of raw ? raw.split(" ") : []) {
    if (!seen.has(token)) {
      seen.add(token);
      tokens.push(token);
    }
  }
  return Object.freeze({
    normalized: raw,
    tokens: Object.freeze(tokens),
    [searchQueryBrand]: true as const,
  });
}

export function matchesSearchQuery(
  query: SearchQuery,
  fields: readonly string[],
): boolean {
  return query.tokens.every((token) =>
    fields.some((field) => normalizeSearchText(field).includes(token)),
  );
}
