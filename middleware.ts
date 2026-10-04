import { NextResponse, type NextRequest } from "next/server";
import { verifyAuthCookies } from "@/lib/cookies";
import type { Role } from "@/lib/api/types";

const PUBLIC_ROUTES: readonly string[] = [
  "/",
  "/about",
  "/services",
  "/contact",
  "/pricing",
  "/login",
  "/register",
  "/payment/success",
  "/payment/cancel",
];

const ROLE_ROUTES: Record<Role, RegExp> = {
  CUSTOMER: /^\/dashboard(?:\/|$)/,
  COURIER: /^\/courier(?:\/|$)/,
  ADMIN: /^\/admin(?:\/|$)/,
};

const AUTH_RUNTIME_ROUTES: readonly string[] = ["/login", "/register"];

function getRoleHome(role: Role | null | undefined): string {
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

function requiredRoleForPath(pathname: string): Role | null {
  for (const [role, pattern] of Object.entries(ROLE_ROUTES) as [Role, RegExp][]) {
    if (pattern.test(pathname)) return role;
  }
  return null;
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon") || pathname === "/favicon.ico") return true;
  if (/\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|txt|woff2?|ttf)$/i.test(pathname)) return true;
  return false;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const cookieHeader = request.headers.get("cookie") ?? undefined;

  const auth = await verifyAuthCookies(cookieHeader);
  const isAuth = auth !== null;
  const requiredRole = requiredRoleForPath(pathname);
  const isAuthRuntimeRoute = AUTH_RUNTIME_ROUTES.includes(pathname);

  if (isPublicPath(pathname) && !isAuthRuntimeRoute && !requiredRole) {
    return NextResponse.next();
  }

  if (isAuthRuntimeRoute) {
    if (isAuth) {
      const home = getRoleHome(auth.role);
      const redirectUrl = new URL(home, request.nextUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  if (requiredRole) {
    if (!isAuth) {
      const login = new URL("/login", request.nextUrl.origin);
      login.searchParams.set("error", "Unauthorized");
      login.searchParams.set("redirect", pathname + search);
      return NextResponse.redirect(login);
    }

    if (auth.role !== requiredRole) {
      const login = new URL("/login", request.nextUrl.origin);
      login.searchParams.set("error", "Unauthorized");
      return NextResponse.redirect(login);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/courier/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
