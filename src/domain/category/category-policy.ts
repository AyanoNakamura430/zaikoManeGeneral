export type CategoryKind = "system" | "custom";
export type CategoryAction = "rename" | "reorder" | "delete" | "change_color";
export function canCategoryAction(
  kind: CategoryKind,
  action: CategoryAction,
): boolean {
  if (kind !== "system" && kind !== "custom") return false;
  if (!["rename", "reorder", "delete", "change_color"].includes(action))
    return false;
  return kind === "custom" || action === "change_color";
}
