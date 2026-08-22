export type StockStatus = "out" | "low" | "available";

import type { LowStockThreshold, Quantity } from "./quantity";
import type { UnitKind } from "./unit";

export function deriveStockStatus<U extends UnitKind>(
  quantity: Quantity<U>,
  threshold?: LowStockThreshold<U>,
): StockStatus {
  if (quantity === 0) return "out";
  if (threshold !== undefined && quantity <= threshold) return "low";
  return "available";
}
