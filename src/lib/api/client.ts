"use client";

import { env, assertClientEnv } from "@/lib/config/env";
import type { ApiError, ApiResponse } from "./types";

declare global {
  interface Window {
    __courierflow_token_refresh_inflight?: Promise<string | null>;
  }
}

type AuthAdapter = {
  getAccessToken: () => string | null | undefined;
  getRefreshToken: () => string | null | undefined;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void | Promise<void>;
  clearAuth: () => void | Promise<void>;
  onAuthErrorRedirect?: () => void;
};

let authAdapter: AuthAdapter | null = null;

export function registerAuthAdapter(adapter: AuthAdapter) {
  authAdapter = adapter;
}

export function getAuthAdapter(): AuthAdapter | null {
  return authAdapter;
}

let requestIdCounter = 0;
function newRequestId(): string {
  requestIdCounter = (requestIdCounter + 1) % 1_000_000;
  const rand = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  return `cf_${Date.now().toString(36)}_${rand}_${requestIdCounter.toString(36)}`;
}

export class ApiRequestError extends Error {
  status: number;
  code: string;
  errors: ApiError[];
  response?: unknown;
  requestId?: string;

  constructor(
    message: string,
    opts: {
      status?: number;
      code?: string;
      errors?: ApiError[];
      response?: unknown;
      requestId?: string;
    } = {},
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = opts.status ?? 0;
    this.code = opts.code ?? "UNKNOWN";
    this.errors = opts.errors ?? [];
    this.response = opts.response;
    this.requestId = opts.requestId;
  }
}

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const base = env.NEXT_PUBLIC_API_BASE_URL + cleanPath;
  if (!query) return base;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      for (const item of v) usp.append(k, String(item));
    } else {
      usp.set(k, String(v));
    }
  }
  const qs = usp.toString();
  return qs ? `${base}?${qs}` : base;
}

function isJsonBody(body: unknown): body is object {
  if (body === null || body === undefined) return false;
  if (body instanceof FormData) return false;
  if (body instanceof URLSearchParams) return false;
  if (body instanceof Blob) return false;
  if (ArrayBuffer.isView(body)) return false;
  return typeof body === "object";
}

async function callRefreshToken(): Promise<string | null> {
  if (!authAdapter) return null;
  const refreshToken = authAdapter.getRefreshToken();
  if (!refreshToken) {
    void authAdapter.clearAuth();
    authAdapter.onAuthErrorRedirect?.();
    return null;
  }
  const url = buildUrl("/auth/refresh-token");
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!resp.ok) throw new Error("refresh failed");
    const parsed = (await resp.json()) as ApiResponse<{
      accessToken: string;
      refreshToken?: string;
    }>;
    if (!parsed.success || !parsed.data?.accessToken) throw new Error("refresh body invalid");
    const nextRefresh = parsed.data.refreshToken ?? refreshToken;
    await authAdapter.setTokens({
      accessToken: parsed.data.accessToken,
      refreshToken: nextRefresh,
    });
    return parsed.data.accessToken;
  } catch {
    void authAdapter.clearAuth();
    authAdapter.onAuthErrorRedirect?.();
    return null;
  }
}

function getInflightRefresh(): Promise<string | null> | undefined {
  if (typeof window === "undefined") return undefined;
  return window.__courierflow_token_refresh_inflight;
}

function setInflightRefresh(p: Promise<string | null> | undefined) {
  if (typeof window === "undefined") return;
  window.__courierflow_token_refresh_inflight = p;
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, unknown>;
  skipAuth?: boolean;
  requestId?: string;
  /** Internal: recursion guard to prevent infinite refresh loops */
  _refreshedAlready?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  if (typeof window !== "undefined") assertClientEnv();

  const {
    query,
    skipAuth = false,
    requestId,
    _refreshedAlready = false,
    ...fetchOpts
  } = options;

  const url = buildUrl(path, query);
  const rid = requestId ?? newRequestId();

  const headers = new Headers(fetchOpts.headers ?? {});
  headers.set("X-Request-ID", rid);
  headers.set("Accept", "application/json");

  if (!headers.has("Content-Type") && isJsonBody(fetchOpts.body)) {
    headers.set("Content-Type", "application/json");
    fetchOpts.body = JSON.stringify(fetchOpts.body);
  }

  if (!skipAuth && authAdapter) {
    let accessToken = authAdapter.getAccessToken();
    if (!accessToken && !_refreshedAlready) {
      let inflight = getInflightRefresh();
      if (!inflight) {
        inflight = callRefreshToken().finally(() => setInflightRefresh(undefined));
        setInflightRefresh(inflight);
      }
      accessToken = await inflight ?? undefined;
    }
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const requestInit: RequestInit = {
    ...(fetchOpts as RequestInit),
    headers,
    credentials: "include",
  };

  let response: Response;
  try {
    response = await fetch(url, requestInit);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error";
    throw new ApiRequestError(`Network error: ${msg}`, {
      code: "NETWORK_ERROR",
      requestId: rid,
    });
  }

  const requestIdResp = response.headers.get("X-Request-ID") ?? rid;

  let parsed: ApiResponse<T> | null = null;
  const text = await response.text();
  try {
    parsed = text ? (JSON.parse(text) as ApiResponse<T>) : null;
  } catch {
    parsed = null;
  }

  if (response.ok && parsed && parsed.success) {
    return parsed.data as T;
  }

  if (response.status === 401 && !skipAuth && !_refreshedAlready && authAdapter) {
    let inflight = getInflightRefresh();
    if (!inflight) {
      inflight = callRefreshToken().finally(() => setInflightRefresh(undefined));
      setInflightRefresh(inflight);
    }
    const newToken = await inflight;
    if (newToken) {
      return apiFetch<T>(path, { ...options, _refreshedAlready: true });
    }
  }

  const message =
    parsed && !parsed.success
      ? parsed.message
      : response.statusText || "Request failed";
  const parsedErrors =
    parsed && typeof parsed === "object" && "errors" in parsed
      ? (parsed as { errors?: unknown }).errors
      : undefined;
  const errors: ApiError[] = Array.isArray(parsedErrors)
    ? (parsedErrors as ApiError[])
    : [];
  const parsedCode =
    parsed && typeof parsed === "object" && "code" in parsed
      ? (parsed as { code?: unknown }).code
      : undefined;
  const code = errors[0]?.code ?? (typeof parsedCode === "string" ? parsedCode : `HTTP_${response.status}`);

  if (response.status === 401 && authAdapter && _refreshedAlready) {
    void authAdapter.clearAuth();
    authAdapter.onAuthErrorRedirect?.();
  }

  throw new ApiRequestError(message, {
    status: response.status,
    code,
    errors,
    response: parsed,
    requestId: requestIdResp,
  });
}

export { env };
