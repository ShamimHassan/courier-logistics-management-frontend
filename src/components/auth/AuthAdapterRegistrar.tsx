"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { registerAuthAdapter } from "@/lib/api/client";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthTokens } from "@/store/useAuthStore";
import { env } from "@/lib/config/env";

export default function AuthAdapterRegistrar() {
  const router = useRouter();
  const registeredRef = useRef(false);

  const tokens = useAuthStore((s) => s.tokens);
  const tokensRef = useRef<AuthTokens | null>(tokens);
  tokensRef.current = tokens;

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    registerAuthAdapter({
      getAccessToken: () => tokensRef.current?.accessToken ?? null,
      getRefreshToken: () => tokensRef.current?.refreshToken ?? null,
      setTokens: (next) => {
        useAuthStore.getState().updateTokens({
          accessToken: next.accessToken,
          refreshToken: next.refreshToken,
          issuedAt: Date.now(),
        });
      },
      clearAuth: async () => {
        await useAuthStore.getState().logout({ silent: true, skipServer: true });
      },
      onAuthErrorRedirect: () => {
        if (typeof window === "undefined") return;
        const current = window.location.pathname;
        const isPublic =
          current === "/" ||
          current === "/about" ||
          current === "/services" ||
          current === "/contact" ||
          current.startsWith("/login") ||
          current.startsWith("/register");
        if (!isPublic) {
          try {
            const login =
              env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") +
              "/login?redirect=" +
              encodeURIComponent(current);
            window.location.href = login;
          } catch {
            router.replace("/login");
          }
        }
      },
    });
  }, [router]);

  const isReady = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isReady) return;
    if (typeof window === "undefined") return;
    const state = useAuthStore.getState();
    if (state.user && !state.tokens?.accessToken) {
      void state.logout({ silent: true, skipServer: true });
      return;
    }
    if (
      state.user &&
      state.tokens?.issuedAt &&
      state.tokens.expiresIn &&
      Date.now() >
        state.tokens.issuedAt + state.tokens.expiresIn * 1000 - 60_000
    ) {
      void state.fetchProfile().catch(() => null);
    }
  }, [isReady]);

  return null;
}
