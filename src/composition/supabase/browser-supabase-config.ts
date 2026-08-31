export type BrowserSupabaseConfigErrorCode =
  | "missing_url"
  | "invalid_url"
  | "missing_public_key"
  | "invalid_public_key"
  | "secret_key_forbidden";

export type BrowserSupabaseConfig = Readonly<{
  url: string;
  publicKey: string;
  keySource: "publishable" | "legacy_anon";
}>;

export type BrowserSupabaseConfigResult =
  | Readonly<{ ok: true; value: BrowserSupabaseConfig }>
  | Readonly<{
      ok: false;
      error: Readonly<{ code: BrowserSupabaseConfigErrorCode }>;
    }>;

const failure = (
  code: BrowserSupabaseConfigErrorCode,
): BrowserSupabaseConfigResult =>
  Object.freeze({ ok: false, error: Object.freeze({ code }) });

function browserUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const candidate = value.trim();
  try {
    const parsed = new URL(candidate);
    if (parsed.username !== "" || parsed.password !== "") return undefined;
    if (parsed.protocol === "https:") return candidate;
    const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return parsed.protocol === "http:" && localHosts.has(parsed.hostname)
      ? candidate
      : undefined;
  } catch {
    return undefined;
  }
}

function legacyRole(value: string): unknown {
  const segments = value.split(".");
  if (segments.length !== 3 || !segments[1]) return undefined;
  try {
    const base64 = segments[1].replace(/-/gu, "+").replace(/_/gu, "/");
    if (base64.length % 4 === 1) return undefined;
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const bytes = Uint8Array.from(atob(padded), (character) =>
      character.charCodeAt(0),
    );
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      return undefined;
    const role = Object.getOwnPropertyDescriptor(payload, "role");
    return role && "value" in role ? role.value : undefined;
  } catch {
    return undefined;
  }
}

function publicKey(
  value: unknown,
  source: "publishable" | "legacy_anon",
): BrowserSupabaseConfigResult | string {
  if (typeof value !== "string" || value.trim() === "")
    return failure("missing_public_key");
  const candidate = value.trim();
  if (candidate.startsWith("sb_secret_"))
    return failure("secret_key_forbidden");
  if (source === "publishable")
    return candidate.startsWith("sb_publishable_") &&
      candidate.length > "sb_publishable_".length
      ? candidate
      : failure("invalid_public_key");
  const role = legacyRole(candidate);
  if (role === "service_role") return failure("secret_key_forbidden");
  return role === "anon" ? candidate : failure("invalid_public_key");
}

export function decodeBrowserSupabaseConfig(
  url: unknown,
  publishableKey: unknown,
  legacyAnonKey: unknown,
): BrowserSupabaseConfigResult {
  if (typeof url !== "string" || url.trim() === "")
    return failure("missing_url");
  const decodedUrl = browserUrl(url);
  if (!decodedUrl) return failure("invalid_url");

  const keySource =
    publishableKey === undefined ? "legacy_anon" : "publishable";
  const decodedKey = publicKey(
    keySource === "publishable" ? publishableKey : legacyAnonKey,
    keySource,
  );
  if (typeof decodedKey !== "string") return decodedKey;
  return Object.freeze({
    ok: true,
    value: Object.freeze({
      url: decodedUrl,
      publicKey: decodedKey,
      keySource,
    }),
  });
}
