const required = (key: string, fallback?: string): string => {
  const v = process.env[key];
  if (v !== undefined && v !== "") return v;
  if (fallback !== undefined) return fallback;
  throw new Error(
    `[env] Missing required environment variable: ${key}. ` +
      `Add it to .env.local or your deployment platform env.`,
  );
};

export const env = {
  NEXT_PUBLIC_API_BASE_URL: required(
    "NEXT_PUBLIC_API_BASE_URL",
    "http://localhost:5000/api/v1",
  ).replace(/\/$/, ""),
  NEXT_PUBLIC_APP_URL: required(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000",
  ).replace(/\/$/, ""),
  AUTH_COOKIE_SECRET: process.env.AUTH_COOKIE_SECRET ?? "",
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
