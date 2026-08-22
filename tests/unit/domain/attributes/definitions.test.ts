import { describe, expect, it } from "vitest";
import {
  ATTRIBUTE_DEFINITIONS,
  getAttributeDefinition,
} from "../../../../src/domain/attributes/definitions";
describe("attribute definitions", () => {
  it("keeps the exact stable table", () => {
    expect(
      ATTRIBUTE_DEFINITIONS.map(
        ({ categoryKey, key, valueType, displayName, searchable, order }) =>
          `${categoryKey}:${key}:${valueType}:${displayName}:${searchable}:${order}`,
      ),
    ).toEqual([
      "daily_goods:spec_size:text:規格・サイズ:true:0",
      "daily_goods:opened:boolean:開封済み:false:1",
      "food_beverage:content_amount:text:内容量:true:0",
      "food_beverage:opened:boolean:開封済み:false:1",
      "clothing_accessories:size:text:サイズ:true:0",
      "clothing_accessories:material:text:素材:true:1",
      "electronics_appliances:serial_number:text:シリアル番号:true:0",
      "hobby_collection:series:text:シリーズ:true:0",
      "hobby_collection:material:text:素材:true:1",
      "tools_supplies:spec_size:text:規格・サイズ:true:0",
      "tools_supplies:material:text:材質:true:1",
    ]);
    expect(Object.isFrozen(ATTRIBUTE_DEFINITIONS)).toBe(true);
    for (const definition of ATTRIBUTE_DEFINITIONS)
      expect(Object.isFrozen(definition)).toBe(true);
    expect(getAttributeDefinition("daily_goods", "opened")).toEqual({
      categoryKey: "daily_goods",
      key: "opened",
      valueType: "boolean",
      displayName: "開封済み",
      searchable: false,
      order: 1,
    });
  });
});
