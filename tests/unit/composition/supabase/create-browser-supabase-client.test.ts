import { describe, expect, it } from "vitest";
import { createBrowserSupabaseClient } from "../../../../src/composition/supabase/create-browser-supabase-client";

describe("createBrowserSupabaseClient", () => {
  it("creates a frozen typed-client result from validated public input", () => {
    const result = createBrowserSupabaseClient(
      "https://project.example.test",
      "sb_publishable_public-test-key",
      undefined,
    );
    expect(result.ok).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    if (result.ok) {
      expect(result.client.auth).toBeDefined();
      expect(result.client.functions).toBeDefined();
    }
  });

  it("returns a value-free failure without constructing an unsafe client", () => {
    const secret = "sb_secret_do-not-report-this-value";
    const result = createBrowserSupabaseClient(
      "https://project.example.test",
      secret,
      undefined,
    );
    expect(result).toEqual({
      ok: false,
      error: { code: "secret_key_forbidden" },
    });
    expect(JSON.stringify(result)).not.toContain(secret);
  });
});
