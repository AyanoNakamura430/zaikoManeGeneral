import type { HybridDocument } from "../attributes/hybrid-document";
import type { UnitKind } from "./unit";

export type InventoryListItem = Readonly<{
  id: string;
  itemName: string;
  categoryId: string | null;
  categoryName?: string;
  currentTemplateKey: string | null;
  unit: UnitKind;
  quantity: number;
  threshold?: number;
  notes?: string;
  purchaseDate?: string;
  brand?: string;
  color?: string;
  modelCode?: string;
  rawAttributes: HybridDocument;
  createdAt: string;
  updatedAt: string;
}>;
