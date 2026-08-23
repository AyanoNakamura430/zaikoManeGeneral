import { describe, expect, it } from "vitest";
import {
  authenticationExpired,
  isAuthenticCollectionState,
  loaded,
  loadError,
  loading,
  noResults,
  trueEmpty,
} from "../../../../src/application/inventory/inventory-collection";

describe("inventory collection application state", () => {
  const valueOf = <T>(result: unknown): T => {
    if (
      !result ||
      typeof result !== "object" ||
      !("ok" in result) ||
      result.ok !== true
    )
      throw new Error("fixture failed");
    return (result as unknown as { value: T }).value;
  };
  it("represents every state distinctly", () => {
    expect(loading().kind).toBe("loading");
    expect(valueOf<{ kind: string }>(loaded(["item"])).kind).toBe("loaded");
    expect(valueOf<{ kind: string }>(trueEmpty(0, [])).kind).toBe("true_empty");
    expect(valueOf<{ kind: string }>(noResults(2, [])).kind).toBe("no_results");
    expect(authenticationExpired().kind).toBe("authentication_expired");
    expect(valueOf<{ kind: string }>(loadError("network_failure")).kind).toBe(
      "load_error",
    );
  });
  it("preserves true-empty and no-results distinction", () => {
    expect(valueOf(trueEmpty(0, []))).not.toEqual(valueOf(noResults(1, [])));
    expect(valueOf(noResults(1, []))).toMatchObject({
      kind: "no_results",
      items: [],
    });
  });
  it("rejects invalid combinations and exact unsupported errors", () => {
    expect(loaded([])).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
    expect(noResults(0, [])).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
    expect(trueEmpty(1, [])).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
    expect(trueEmpty(0, ["unexpected"])).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
    expect(trueEmpty(Number.MAX_SAFE_INTEGER + 1, [])).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
    expect(noResults(Number.MAX_SAFE_INTEGER + 1, [])).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
    expect(noResults(1.5, [])).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
    expect(noResults(1, ["unexpected"])).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
    expect(loadError("authentication_expired" as never)).toEqual({
      ok: false,
      error: { code: "integrity_failure" },
    });
  });
  it("freezes containers and isolates item array aliases", () => {
    const items = ["one"];
    const result = loaded(items);
    if (!result.ok) throw new Error("fixture failed");
    items.push("two");
    const state = valueOf<{ kind: "loaded"; items: readonly string[] }>(result);
    expect(state.items).toEqual(["one"]);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.items)).toBe(true);
  });
  it("rejects forged and malformed runtime states", () => {
    expect(isAuthenticCollectionState({ kind: "loading" })).toBe(false);
    expect(isAuthenticCollectionState(null)).toBe(false);
    expect(isAuthenticCollectionState("loading")).toBe(false);
  });
  it("authenticates every factory state and rejects copies", () => {
    const states = [
      loading(),
      valueOf(loaded(["item"])),
      valueOf(trueEmpty(0, [])),
      valueOf(noResults(1, [])),
      authenticationExpired(),
      valueOf(loadError("unavailable")),
      valueOf(loadError("network_failure")),
      valueOf(loadError("integrity_failure")),
    ];
    for (const state of states) {
      expect(isAuthenticCollectionState(state)).toBe(true);
      expect(isAuthenticCollectionState({ ...(state as object) })).toBe(false);
    }
  });
});
