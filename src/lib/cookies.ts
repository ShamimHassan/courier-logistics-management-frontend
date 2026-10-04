import { env } from "@/lib/config/env";
import type { Role } from "@/lib/api/types";

const COOKIE_ROLE = "cf_r";
const COOKIE_USER = "cf_u";
const COOKIE_SIG = "cf_s";

export const AUTH_COOKIES = {
  ROLE: COOKIE_ROLE,
  USER: COOKIE_USER,
  SIG: COOKIE_SIG,
  ALL: [COOKIE_ROLE, COOKIE_USER, COOKIE_SIG] as const,
} as const;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

function b64urlEncode(buf: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buf.byteLength; i++) {
    binary += String.fromCharCode(buf[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const binary = atob(pad ? padded + "=".repeat(4 - pad) : padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out.slice() as Uint8Array;
}

export async function importSigningKey(secretHex: string): Promise<CryptoKey> {
  const bytes = new Uint8Array(Math.max(1, Math.ceil(secretHex.length / 2)));
  for (let i = 0; i < bytes.byteLength; i++) {
    bytes[i] = parseInt(secretHex.slice(i * 2, i * 2 + 2) || "0", 16);
  }
  return crypto.subtle.importKey(
    "raw",
    bytes as unknown as Uint8Array<ArrayBuffer>,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function computeSignature(key: CryptoKey, payload: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    TEXT_ENCODER.encode(payload),
  );
  return b64urlEncode(new Uint8Array(signature) as Uint8Array);
}

async function verifySignature(
  key: CryptoKey,
  payload: string,
  expectedSignature: string,
): Promise<boolean> {
  try {
    const expected = b64urlDecode(expectedSignature) as unknown as Uint8Array<ArrayBuffer>;
    return await crypto.subtle.verify(
      "HMAC",
      key,
      expected,
      TEXT_ENCODER.encode(payload),
    );
  } catch {
    return false;
  }
}

export interface SignedAuthPayload {
  role: Role;
  userId: string;
  email: string;
}

export async function signAuthCookies(
  { role, userId, email }: SignedAuthPayload,
  opts: { expiresAt?: number | Date; secret?: string } = {},
): Promise<Record<string, string>> {
  const secret = opts.secret ?? env.AUTH_COOKIE_SECRET;
  if (!secret) {
    throw new Error(
      "[cookies] AUTH_COOKIE_SECRET is not set — cannot sign auth cookies. " +
        "Set it in .env.local (generate with: openssl rand -hex 32).",
    );
  }
  const key = await importSigningKey(secret);

  const roleB64 = b64urlEncode(TEXT_ENCODER.encode(role));
  const userB64 = b64urlEncode(TEXT_ENCODER.encode(`${userId}|${email}`));
  const payload = `${roleB64}.${userB64}`;
  const sig = await computeSignature(key, payload);

  const expires = opts.expiresAt
    ? typeof opts.expiresAt === "number"
      ? new Date(opts.expiresAt)
      : opts.expiresAt
    : new Date(Date.now() + 24 * 60 * 60 * 1000 * 7);

  const commonAttrs = [
    `Path=/`,
    `SameSite=Lax`,
    `Secure=${typeof location !== "undefined" && location.protocol === "https:" ? "true" : "false"}`,
    `Expires=${expires.toUTCString()}`,
  ].join("; ");

  return {
    [COOKIE_ROLE]: `${COOKIE_ROLE}=${roleB64}; ${commonAttrs}`,
    [COOKIE_USER]: `${COOKIE_USER}=${userB64}; ${commonAttrs}`,
    [COOKIE_SIG]: `${COOKIE_SIG}=${sig}; ${commonAttrs}`,
  };
}

export function setDocumentAuthCookies(
  cookies: Record<string, string>,
): void {
  if (typeof document === "undefined") return;
  for (const value of Object.values(cookies)) {
    document.cookie = value;
  }
}

export function clearDocumentAuthCookies(): void {
  if (typeof document === "undefined") return;
  const past = new Date(0).toUTCString();
  for (const name of AUTH_COOKIES.ALL) {
    document.cookie = `${name}=; Path=/; Expires=${past}; SameSite=Lax; Secure=false`;
  }
}

export function readCookieString(
  cookieHeader: string | null | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  const prefix = `${name}=`;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

export async function verifyAuthCookies(
  cookieHeader: string | null | undefined,
  opts: { secret?: string } = {},
): Promise<SignedAuthPayload | null> {
  const secret = opts.secret ?? env.AUTH_COOKIE_SECRET;
  if (!secret) return null;

  const roleB64 = readCookieString(cookieHeader, COOKIE_ROLE);
  const userB64 = readCookieString(cookieHeader, COOKIE_USER);
  const sig = readCookieString(cookieHeader, COOKIE_SIG);
  if (!roleB64 || !userB64 || !sig) return null;

  const key = await importSigningKey(secret);
  const payload = `${roleB64}.${userB64}`;
  const ok = await verifySignature(key, payload, sig);
  if (!ok) return null;

  try {
    const role = TEXT_DECODER.decode(b64urlDecode(roleB64)) as Role;
    const userRaw = TEXT_DECODER.decode(b64urlDecode(userB64));
    const sep = userRaw.indexOf("|");
    if (sep === -1) return null;
    const userId = userRaw.slice(0, sep);
    const email = userRaw.slice(sep + 1);
    if (!role || !userId || !email) return null;
    return { role, userId, email };
  } catch {
    return null;
  }
}
