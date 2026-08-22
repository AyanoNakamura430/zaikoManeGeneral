export type AttributeType = "text" | "boolean";
export type AttributeDefinition = Readonly<{
  categoryKey: string;
  key: string;
  valueType: AttributeType;
  displayName: string;
  searchable: boolean;
  order: number;
}>;
const definitions: readonly AttributeDefinition[] = [
  {
    categoryKey: "daily_goods",
    key: "spec_size",
    valueType: "text",
    displayName: "サイズ",
    searchable: true,
    order: 0,
  },
  {
    categoryKey: "daily_goods",
    key: "opened",
    valueType: "boolean",
    displayName: "開封済み",
    searchable: false,
    order: 1,
  },
  {
    categoryKey: "food_beverage",
    key: "capacity",
    valueType: "text",
    displayName: "内容量",
    searchable: true,
    order: 0,
  },
  {
    categoryKey: "food_beverage",
    key: "opened",
    valueType: "boolean",
    displayName: "開封済み",
    searchable: false,
    order: 1,
  },
  {
    categoryKey: "clothing_accessories",
    key: "size",
    valueType: "text",
    displayName: "サイズ",
    searchable: true,
    order: 0,
  },
  {
    categoryKey: "clothing_accessories",
    key: "color",
    valueType: "text",
    displayName: "色",
    searchable: true,
    order: 1,
  },
  {
    categoryKey: "electronics_appliances",
    key: "serial_number",
    valueType: "text",
    displayName: "シリアル番号",
    searchable: true,
    order: 0,
  },
  {
    categoryKey: "hobby_collection",
    key: "series",
    valueType: "text",
    displayName: "シリーズ",
    searchable: true,
    order: 0,
  },
  {
    categoryKey: "hobby_collection",
    key: "color",
    valueType: "text",
    displayName: "色",
    searchable: true,
    order: 1,
  },
  {
    categoryKey: "tools_supplies",
    key: "spec_size",
    valueType: "text",
    displayName: "サイズ",
    searchable: true,
    order: 0,
  },
  {
    categoryKey: "tools_supplies",
    key: "material",
    valueType: "text",
    displayName: "材質",
    searchable: true,
    order: 1,
  },
];
export const ATTRIBUTE_DEFINITIONS = Object.freeze(
  definitions.map((definition) => Object.freeze(definition)),
);
export function getAttributeDefinition(
  categoryKey: string,
  key: string,
): AttributeDefinition | undefined {
  return ATTRIBUTE_DEFINITIONS.find(
    (definition) =>
      definition.categoryKey === categoryKey && definition.key === key,
  );
}
