import { describe, expect, it } from "vitest";
import {
  matchesSearchQuery,
  normalizeSearchText,
  parseSearchQuery,
} from "../../../../src/domain/search/search-query";

describe("search query normalization", () => {
  it("normalizes NFKC, Unicode whitespace, trim, and case", () =>
    expect(normalizeSearchText(" ＡＢＣ\u00a0  Def ")).toBe("abc def"));
  it("deduplicates tokens while preserving first occurrence order", () =>
    expect(parseSearchQuery("Alpha beta alpha ALPHA")).toMatchObject({
      normalized: "alpha beta alpha alpha",
      tokens: ["alpha", "beta"],
    }));
  it("freezes the query and tokens", () => {
    const query = parseSearchQuery("one two");
    expect(Object.isFrozen(query)).toBe(true);
    expect(Object.isFrozen(query.tokens)).toBe(true);
  });
  it("cannot be hand-crafted as a SearchQuery", () => {
    // @ts-expect-error SearchQuery has a module-private opaque brand.
    matchesSearchQuery({ normalized: "", tokens: [] }, []);
  });
});

describe("search query matching", () => {
  it("matches every token across fields without spanning one field", () => {
    expect(
      matchesSearchQuery(parseSearchQuery("red cotton"), [
        "red",
        "cotton yarn",
      ]),
    ).toBe(true);
    expect(
      matchesSearchQuery(parseSearchQuery("red cotton"), ["red", "yarn"]),
    ).toBe(false);
    expect(matchesSearchQuery(parseSearchQuery("cotton"), ["cot", "ton"])).toBe(
      false,
    );
    expect(matchesSearchQuery(parseSearchQuery(""), [])).toBe(true);
  });
  it("uses substring matching and treats punctuation literally", () => {
    expect(
      matchesSearchQuery(parseSearchQuery("C++"), ["Tools: C++ compiler"]),
    ).toBe(true);
    expect(matchesSearchQuery(parseSearchQuery("needle"), ["hayneedle"])).toBe(
      true,
    );
    expect(matchesSearchQuery(parseSearchQuery("needle"), ["hay stack"])).toBe(
      false,
    );
  });
});
