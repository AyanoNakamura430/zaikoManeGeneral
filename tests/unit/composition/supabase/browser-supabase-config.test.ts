import { describe, expect, it } from "vitest";
import { decodeBrowserSupabaseConfig } from "../../../../src/composition/supabase/browser-supabase-config";

const publishableKey = "sb_publishable_public-test-key";
const legacyKey = (role: "anon" | "service_role") => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/=/gu, "")
      .replace(/\+/gu, "-")
      .replace(/\//gu, "_");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ role })}.signature`;
};

describe("decodeBrowserSupabaseConfig", () => {
  it("prefers a publishable key and freezes the decoded contract", () => {
    const result = decodeBrowserSupabaseConfig(
      "https://project.example.test",
      ` ${publishableKey} `,
      legacyKey("anon"),
    );
    expect(result).toEqual({
      ok: true,
      value: {
        url: "https://project.example.test",
        publicKey: publishableKey,
        keySource: "publishable",
      },
    });
    expect(Object.isFrozen(result)).toBe(true);
    if (result.ok) expect(Object.isFrozen(result.value)).toBe(true);
  });

  it("falls back to a structurally identified legacy anon key when publishable is absent", () => {
    const anonKey = legacyKey("anon");
    expect(
      decodeBrowserSupabaseConfig("http://127.0.0.1:54321", undefined, anonKey),
    ).toEqual({
      ok: true,
      value: {
        url: "http://127.0.0.1:54321",
        publicKey: anonKey,
        keySource: "legacy_anon",
      },
    });
  });

  it.each([
    [undefined, undefined, "missing_public_key"],
    ["", legacyKey("anon"), "missing_public_key"],
    ["not-a-publishable-key", undefined, "invalid_public_key"],
    [undefined, "not-a-jwt", "invalid_public_key"],
    [undefined, legacyKey("service_role"), "secret_key_forbidden"],
    ["sb_secret_server-only", undefined, "secret_key_forbidden"],
  ] as const)(
    "rejects unsafe or malformed public key input %#",
    (nextKey, anonKey, code) => {
      expect(
        decodeBrowserSupabaseConfig(
          "https://project.example.test",
          nextKey,
          anonKey,
        ),
      ).toEqual({ ok: false, error: { code } });
    },
  );

  it.each([
    [undefined, "missing_url"],
    ["", "missing_url"],
    ["not a URL", "invalid_url"],
    ["ftp://project.example.test", "invalid_url"],
    ["http://project.example.test", "invalid_url"],
    ["https://user:password@project.example.test", "invalid_url"],
  ] as const)("rejects invalid browser URL input %#", (url, code) => {
    expect(decodeBrowserSupabaseConfig(url, publishableKey, undefined)).toEqual(
      { ok: false, error: { code } },
    );
  });

  it("never includes rejected values in an error result", () => {
    const secret = "sb_secret_do-not-report-this-value";
    const result = decodeBrowserSupabaseConfig(
      "https://project.example.test",
      secret,
      undefined,
    );
    expect(JSON.stringify(result)).not.toContain(secret);
  });
});
