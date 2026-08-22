import { describe, expect, it } from "vitest";
import {
  DEFAULT_QUANTITY,
  DEFAULT_UNIT,
  UNIT_CATALOG,
  getUnitDefinition,
} from "../../../../src/domain/inventory/unit";

describe("inventory unit catalog", () => {
  it("keeps the approved order, labels, kinds, and defaults", () => {
    expect(UNIT_CATALOG).toEqual([
      { kind: "point", family: "count", label: "点", symbol: "点" },
      { kind: "piece", family: "count", label: "個", symbol: "個" },
      { kind: "stick", family: "count", label: "本", symbol: "本" },
      { kind: "sheet", family: "count", label: "枚", symbol: "枚" },
      { kind: "book", family: "count", label: "冊", symbol: "冊" },
      { kind: "garment", family: "count", label: "着", symbol: "着" },
      { kind: "pair", family: "count", label: "組", symbol: "組" },
      { kind: "set", family: "count", label: "セット", symbol: "セット" },
      { kind: "box", family: "count", label: "箱", symbol: "箱" },
      { kind: "bag", family: "count", label: "袋", symbol: "袋" },
      { kind: "pack", family: "count", label: "パック", symbol: "パック" },
      { kind: "machine", family: "count", label: "台", symbol: "台" },
      { kind: "gram", family: "measurement", label: "グラム", symbol: "g" },
      {
        kind: "kilogram",
        family: "measurement",
        label: "キログラム",
        symbol: "kg",
      },
      {
        kind: "milliliter",
        family: "measurement",
        label: "ミリリットル",
        symbol: "mL",
      },
      { kind: "liter", family: "measurement", label: "リットル", symbol: "L" },
      {
        kind: "centimeter",
        family: "measurement",
        label: "センチメートル",
        symbol: "cm",
      },
      { kind: "meter", family: "measurement", label: "メートル", symbol: "m" },
    ]);
    expect(DEFAULT_UNIT).toBe("point");
    expect(DEFAULT_QUANTITY).toBe(1);
  });
  it("freezes catalog and entries", () => {
    expect(Object.isFrozen(UNIT_CATALOG)).toBe(true);
    for (const entry of UNIT_CATALOG) expect(Object.isFrozen(entry)).toBe(true);
  });
  it("returns immutable unit definitions", () =>
    expect(getUnitDefinition("meter")).toEqual({
      kind: "meter",
      family: "measurement",
      label: "メートル",
      symbol: "m",
    }));
  it("rejects an unknown runtime key", () =>
    expect(() => getUnitDefinition("unknown" as never)).toThrow(
      "Unknown unit kind: unknown",
    ));
});
