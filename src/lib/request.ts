import type { RequestResult } from "../types";

/** Build the local proxy URL. Empty params are omitted. */
export function buildProxyUrl(path: string, params: Record<string, string>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      search.set(key, trimmed);
    }
  }
  const query = search.toString();
  const base = import.meta.env.PROD ? CFBD_ORIGIN : "/cfbd";
  return `${base}${path}${query ? `?${query}` : ""}`;
}

const CFBD_ORIGIN = "https://api.collegefootballdata.com";
const KEY_STORAGE = "cfbd-api-key";

/** Static hosting has no proxy, so production builds call CFBD directly with a user-supplied key. */
export function getStoredKey(): string {
  try {
    return localStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

export function storeKey(key: string): void {
  try {
    localStorage.setItem(KEY_STORAGE, key);
  } catch {
    // storage unavailable; key stays in memory only
  }
}

export async function fetchCfbd(path: string, params: Record<string, string>): Promise<RequestResult> {
  const url = buildProxyUrl(path, params);
  const started = performance.now();
  const key = import.meta.env.PROD ? getStoredKey().trim() : "";
  const response = await fetch(url, {
    headers: key ? { Authorization: `Bearer ${key}`, Accept: "application/json" } : undefined,
  });
  const rawText = await response.text();
  const durationMs = Math.round(performance.now() - started);

  let body: unknown = rawText;
  try {
    body = rawText.length > 0 ? JSON.parse(rawText) : null;
  } catch {
    body = rawText;
  }

  return {
    status: response.status,
    durationMs,
    byteLength: new TextEncoder().encode(rawText).length,
    url,
    body,
    rawText,
  };
}

export function countRecords(body: unknown): number | null {
  return Array.isArray(body) ? body.length : null;
}
