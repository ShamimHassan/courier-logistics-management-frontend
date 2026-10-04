"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import type { Role, User } from "@/lib/api/types";
import {
  loginUser as apiLogin,
  registerCustomer as apiRegister,
  logoutUser as apiLogout,
  refreshToken as apiRefreshToken,
  getMe,
} from "@/lib/api/endpoints";
import type {
  LoginInput,
  RegisterInput,
  DemoLoginInput,
} from "@/lib/validations/auth";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  issuedAt?: number;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isHydrated: boolean;
  isAuthenticating: boolean;
  login: (
    payload: Omit<LoginInput, "remember">,
  ) => Promise<{ ok: boolean; user?: User }>;
  demoLogin: (payload: DemoLoginInput) => Promise<{ ok: boolean; user?: User }>;
  register: (
    payload: Omit<RegisterInput, "confirmPassword">,
  ) => Promise<{ ok: boolean; user?: User }>;
  refresh: () => Promise<boolean>;
  setUser: (user: User) => void;
  setAuth: (params: { user: User; tokens: AuthTokens }) => void;
  updateTokens: (tokens: AuthTokens) => void;
  fetchProfile: () => Promise<User | null>;
  logout: (opts?: { silent?: boolean; skipServer?: boolean }) => Promise<void>;
  hasRole: (role: Role | Role[]) => boolean;
  reset: () => void;
}

const STORAGE_KEY = "courierflow.auth.v1";

function isTokenValid(tokens: AuthTokens | null): boolean {
  if (!tokens) return false;
  if (!tokens.accessToken) return false;
  if (tokens.expiresIn && tokens.issuedAt) {
    const ttl = tokens.expiresIn * 1000;
    const safeMargin = 60_000;
    return Date.now() < tokens.issuedAt + ttl - safeMargin;
  }
  return true;
}

const DEMO_USERS: Record<
  Role,
  Omit<User, "id" | "createdAt" | "updatedAt"> & { id: string }
> = {
  CUSTOMER: {
    id: "demo-customer-001",
    name: "Demo Customer",
    email: "customer.demo@courierflow.local",
    phone: "+8801700000001",
    role: "CUSTOMER",
    status: "ACTIVE",
    profileImageUrl: null,
  },
  COURIER: {
    id: "demo-courier-001",
    name: "Demo Courier",
    email: "courier.demo@courierflow.local",
    phone: "+8801700000002",
    role: "COURIER",
    status: "ACTIVE",
    profileImageUrl: null,
  },
  ADMIN: {
    id: "demo-admin-001",
    name: "Demo Admin",
    email: "admin.demo@courierflow.local",
    phone: "+8801700000003",
    role: "ADMIN",
    status: "ACTIVE",
    profileImageUrl: null,
  },
};

const initialState = {
  user: null,
  tokens: null,
  isHydrated: false,
  isAuthenticating: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (payload) => {
        set({ isAuthenticating: true });
        try {
          const res = await apiLogin(payload);
          const tokens: AuthTokens = {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresIn: res.expiresIn,
            issuedAt: Date.now(),
          };
          set({
            user: res.user,
            tokens,
            isAuthenticating: false,
          });
          return { ok: true, user: res.user };
        } catch (err) {
          set({ isAuthenticating: false });
          throw err;
        }
      },

      demoLogin: async ({ role }) => {
        set({ isAuthenticating: true });
        try {
          const demoUser: User = DEMO_USERS[role];
          const demoTokens: AuthTokens = {
            accessToken: `demo-${role.toLowerCase()}-access-token-${Date.now()}`,
            refreshToken: `demo-${role.toLowerCase()}-refresh-token-${Date.now()}`,
            expiresIn: 60 * 60 * 24,
            issuedAt: Date.now(),
          };
          set({
            user: demoUser,
            tokens: demoTokens,
            isAuthenticating: false,
          });
          toast.success(`Signed in as ${demoUser.name} (${role})`, {
            description: "One-click demo mode: data is client-side only.",
          });
          return { ok: true, user: demoUser };
        } catch (err) {
          set({ isAuthenticating: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isAuthenticating: true });
        try {
          const res = await apiRegister(payload);
          const tokens: AuthTokens = {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            expiresIn: res.expiresIn,
            issuedAt: Date.now(),
          };
          set({
            user: res.user,
            tokens,
            isAuthenticating: false,
          });
          return { ok: true, user: res.user };
        } catch (err) {
          set({ isAuthenticating: false });
          throw err;
        }
      },

      refresh: async () => {
        const tokens = get().tokens;
        if (!tokens?.refreshToken) return false;
        try {
          const res = await apiRefreshToken({
            refreshToken: tokens.refreshToken,
          });
          set({
            tokens: {
              accessToken: res.accessToken,
              refreshToken: res.refreshToken ?? tokens.refreshToken,
              expiresIn: res.expiresIn,
              issuedAt: Date.now(),
            },
          });
          return true;
        } catch {
          return false;
        }
      },

      setUser: (user) => set({ user }),

      setAuth: ({ user, tokens }) =>
        set({
          user,
          tokens: { ...tokens, issuedAt: tokens.issuedAt ?? Date.now() },
        }),

      updateTokens: (tokens) =>
        set({
          tokens: { ...tokens, issuedAt: tokens.issuedAt ?? Date.now() },
        }),

      fetchProfile: async () => {
        if (!isTokenValid(get().tokens)) return null;
        try {
          const user = await getMe();
          set({ user });
          return user;
        } catch {
          return null;
        }
      },

      logout: async (opts = {}) => {
        const { silent = false, skipServer = false } = opts;
        const tokens = get().tokens;
        if (!skipServer && tokens?.refreshToken) {
          try {
            await apiLogout({ refreshToken: tokens.refreshToken }).catch(
              () => null,
            );
          } catch {
            /* noop */
          }
        }
        set({ user: null, tokens: null, isAuthenticating: false });
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.clear();
          } catch {
            /* noop */
          }
        }
        if (!silent) {
          toast.success("Signed out");
        }
      },

      hasRole: (role) => {
        const u = get().user;
        if (!u) return false;
        if (Array.isArray(role)) return role.includes(u.role);
        return u.role === role;
      },

      reset: () => set({ ...initialState, isHydrated: get().isHydrated }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error("[auth-store] rehydrate failed", error);
          }
          setTimeout(() => {
            useAuthStore.setState({ isHydrated: true });
          }, 0);
        };
      },
    },
  ),
);

export const selectIsAuthenticated = (s: AuthState) =>
  !!s.user && !!s.tokens?.accessToken;

export const selectIsGuest = (s: AuthState) =>
  !s.isAuthenticating && s.isHydrated && !s.user;

export const selectIsReady = (s: AuthState) => s.isHydrated;

export function getRoleHome(role: Role | null | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "COURIER":
      return "/courier";
    case "CUSTOMER":
      return "/dashboard";
    default:
      return "/";
  }
}
