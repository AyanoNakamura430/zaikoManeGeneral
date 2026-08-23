import type { ApplicationResult } from "../shared/application-error";

export interface InventoryReadPort<T> {
  readAll(): Promise<ApplicationResult<readonly T[]>>;
}
