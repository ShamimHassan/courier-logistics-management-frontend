const required = (key: string, fallback?: string): string => {
  const v = process.env[key];
  if (v !== undefined && v !== "") return v;
  if (fallback !== undefined) return fallback;
  throw new Error(
    `[env] Missing required environment variable: ${key}. ` +
      `Add it to .env.local or your deployment platform env.`,
  );
};

const DEFAULT_DEV_COOKIE_SECRET =
  "courierflow-dev-fallback-secret-do-not-use-in-production-00000000000000000000";

const rawAuthCookieSecret = process.env.AUTH_COOKIE_SECRET ?? "";
const AUTH_COOKIE_SECRET_VALUE =
  rawAuthCookieSecret && rawAuthCookieSecret.length >= 16
    ? rawAuthCookieSecret
    : DEFAULT_DEV_COOKIE_SECRET;

if (AUTH_COOKIE_SECRET_VALUE === DEFAULT_DEV_COOKIE_SECRET) {
  if (typeof console !== "undefined") {
    console.warn(
      "%c[env] AUTH_COOKIE_SECRET is not set or too short — using a dev-only fallback.\n" +
        "  → Generate one with:  openssl rand -hex 32\n" +
        "  → Then add it to .env.local as AUTH_COOKIE_SECRET=<64 hex chars>\n" +
        "  → Required for production: signed middleware auth cookies will use this secret.",
      "color: #f59e0b; font-weight: bold;",
    );
  }
}

export const env = {
  NEXT_PUBLIC_API_BASE_URL: required(
    "NEXT_PUBLIC_API_BASE_URL",
    "http://localhost:5000/api/v1",
  ).replace(/\/$/, ""),
  NEXT_PUBLIC_APP_URL: required(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000",
  ).replace(/\/$/, ""),
  AUTH_COOKIE_SECRET: AUTH_COOKIE_SECRET_VALUE,
  NEXT_PUBLIC_SSLCOMMERZ_MODE:
    (process.env.NEXT_PUBLIC_SSLCOMMERZ_MODE as "sandbox" | "production") ??
    "sandbox",
} as const;

export function assertClientEnv() {
  if (typeof window === "undefined") return;
  const requiredPublic = ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_APP_URL"];
  for (const k of requiredPublic) {
    const v = process.env[k];
    if (!v) {
      console.warn(
        `[env] WARN: ${k} is not set — API calls will fail. ` +
          `Set it in .env.local before running the app.`,
      );
    }
  }
}
