export type CountUnitKind =
  | "point"
  | "piece"
  | "stick"
  | "sheet"
  | "book"
  | "garment"
  | "pair"
  | "set"
  | "box"
  | "bag"
  | "pack"
  | "machine";
export type MeasurementUnitKind =
  "gram" | "kilogram" | "milliliter" | "liter" | "centimeter" | "meter";
export type UnitKind = CountUnitKind | MeasurementUnitKind;
export type UnitFamily = "count" | "measurement";

export type UnitDefinition = Readonly<{
  kind: UnitKind;
  family: UnitFamily;
  label: string;
  symbol: string;
}>;

const unitDefinitions = [
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
] as const satisfies readonly UnitDefinition[];

export const UNIT_CATALOG: readonly UnitDefinition[] = Object.freeze(
  unitDefinitions.map((unit) => Object.freeze(unit)),
);

export const DEFAULT_UNIT: UnitKind = "point";
export const DEFAULT_QUANTITY = 1;
export type UnitParseError = Readonly<{ code: "invalid_unit"; field: "unit" }>;
export type UnitParseResult =
  | { readonly ok: true; readonly value: UnitKind }
  | { readonly ok: false; readonly error: UnitParseError };
export function parseUnitKind(value: unknown): UnitParseResult {
  if (
    typeof value !== "string" ||
    !UNIT_CATALOG.some((unit) => unit.kind === value)
  )
    return { ok: false, error: { code: "invalid_unit", field: "unit" } };
  return { ok: true, value: value as UnitKind };
}
export function getUnitDefinition(kind: UnitKind): UnitDefinition {
  const definition = UNIT_CATALOG.find((unit) => unit.kind === kind);
  if (!definition) throw new Error(`Unknown unit kind: ${kind}`);
  return definition;
}
