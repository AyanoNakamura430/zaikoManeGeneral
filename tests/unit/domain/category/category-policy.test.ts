import { describe, expect, it } from "vitest";
import { canCategoryAction } from "../../../../src/domain/category/category-policy";

describe("category policy", () => {
  it("allows only color changes for system categories", () => {
    expect(canCategoryAction("system", "change_color")).toBe(true);
    for (const action of ["rename", "reorder", "delete"] as const)
      expect(canCategoryAction("system", action)).toBe(false);
  });
  it("allows all approved actions for custom categories", () => {
    for (const action of [
      "rename",
      "reorder",
      "delete",
      "change_color",
    ] as const)
      expect(canCategoryAction("custom", action)).toBe(true);
  });
  it("rejects unknown runtime values", () => {
    expect(canCategoryAction("other" as never, "rename")).toBe(false);
    expect(canCategoryAction("system", "other" as never)).toBe(false);
  });
});
