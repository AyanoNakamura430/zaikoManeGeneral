import { describe, expect, it } from "vitest";
import { parseInstant } from "../../../../src/domain/time/instant";
describe("instant", () => {
  it("accepts canonical UTC instants and preserves lexical ordering", () => {
    expect(parseInstant("0001-01-01T00:00:00.000Z").ok).toBe(true);
    expect(parseInstant("9999-12-31T23:59:59.999Z").ok).toBe(true);
    expect("2024-01-01T00:00:00.000Z" < "2024-01-02T00:00:00.000Z").toBe(true);
  });
  it("rejects offsets, fractions, leap seconds, and invalid dates", () => {
    for (const value of [
      "2024-01-01T00:00:00Z",
      "2024-01-01T00:00:00.00Z",
      "2024-01-01T00:00:00.000+00:00",
      "2024-02-30T00:00:00.000Z",
      "2023-02-29T00:00:00.000Z",
      "2024-01-01T24:00:00.000Z",
      "2024-01-01T00:00:60.000Z",
      null,
      1,
    ])
      expect(parseInstant(value)).toEqual({
        ok: false,
        error: { code: "invalid_instant" },
      });
    for (const value of [
      "0000-01-01T00:00:00.000Z",
      "2024-00-01T00:00:00.000Z",
      "2024-13-01T00:00:00.000Z",
      "2024-01-00T00:00:00.000Z",
      "2024-01-01T00:60:00.000Z",
      "2024-01-01T00:00:00.000z",
      " 2024-01-01T00:00:00.000Z",
    ])
      expect(parseInstant(value).ok).toBe(false);
    expect(parseInstant("2000-02-29T12:34:56.789Z").ok).toBe(true);
    expect(parseInstant("1900-02-29T12:34:56.789Z").ok).toBe(false);
  });
  it("is parse-only", () => {
    // @ts-expect-error branded instant
    const forged: import("../../../../src/domain/time/instant").Instant =
      "2024-01-01T00:00:00.000Z";
    expect(forged).toBeDefined();
  });
});
