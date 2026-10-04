"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  useAuthStore,
  getRoleHome,
  selectIsAuthenticated,
} from "@/store/useAuthStore";
import { ApiRequestError } from "@/lib/api/client";
import type { Role } from "@/lib/api/types";

type DemoRole = Extract<Role, "CUSTOMER" | "COURIER" | "ADMIN">;

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"
  | null
  | undefined;

interface DemoCredential {
  role: DemoRole;
  title: string;
  tagline: string;
  badge: string;
  badgeVariant: BadgeVariant;
  email: string;
  password: string;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
  homeHref: string;
  capabilities: string[];
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: "CUSTOMER",
    title: "Customer Demo",
    tagline: "Book shipments, pay & track parcels",
    badge: "CUSTOMER",
    badgeVariant: "secondary",
    email: "customer@courierflow.test",
    password: "Customer@123",
    accent: "from-blue-500/20 via-indigo-500/10 to-transparent ring-blue-500/30 hover:ring-blue-500/50",
    icon: User,
    homeHref: getRoleHome("CUSTOMER"),
    capabilities: [
      "Create shipments with live pricing",
      "SSLCommerz (bKash/Nagad/Rocket) checkout",
      "Track package with timeline",
      "Download receipts",
    ],
  },
  {
    role: "COURIER",
    title: "Courier Demo",
    tagline: "Pickup, scan & deliver parcels",
    badge: "COURIER",
    badgeVariant: "outline",
    email: "courier@courierflow.test",
    password: "Courier@123",
    accent: "from-amber-500/20 via-orange-500/10 to-transparent ring-amber-500/30 hover:ring-amber-500/50",
    icon: Truck,
    homeHref: getRoleHome("COURIER"),
    capabilities: [
      "See assigned manifest by zone",
      "Scan pickup / drop-off OTP",
      "Upload proof-of-delivery photo",
      "Log failed delivery attempts",
    ],
  },
  {
    role: "ADMIN",
    title: "Admin Demo",
    tagline: "Full control & global analytics",
    badge: "ADMIN",
    badgeVariant: "default",
    email: "admin@courierflow.test",
    password: "Admin@123",
    accent: "from-purple-500/20 via-fuchsia-500/10 to-transparent ring-purple-500/30 hover:ring-purple-500/50",
    icon: Crown,
    homeHref: getRoleHome("ADMIN"),
    capabilities: [
      "KPI dashboard + Recharts reports",
      "Courier onboarding & approvals",
      "Pricing engine & service types",
      "System-wide shipment audits",
    ],
  },
];

export function DemoLoginCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? undefined;

  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  const authLogin = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const user = useAuthStore((s) => s.user);

  const [activeRole, setActiveRole] = useState<DemoRole | null>(null);

  const handleDemoLogin = async (cred: DemoCredential) => {
    setActiveRole(cred.role);
    try {
      const promise = authLogin({
        email: cred.email,
        password: cred.password,
      });
      const roleLabel = cred.badge;
      toast.promise(promise, {
        loading: `Signing you in as ${roleLabel} demo…`,
        success: (result) =>
          result.ok && result.user
            ? `Welcome back, ${result.user.name.split(" ")[0]} · ${roleLabel} dashboard ready`
            : "Signed in successfully",
        error: (err: unknown) => {
          const apiErr = err as ApiRequestError;
          return (
            apiErr.message ??
            "Could not sign in to the demo account. Please try again."
          );
        },
      });
      const result = await promise;
      if (result.ok && result.user) {
        const destination = redirectTo ?? cred.homeHref;
        router.replace(destination);
      }
    } catch {
      // toast.promise above already surfaces the error
    } finally {
      setActiveRole(null);
    }
  };

  const disabled = isAuthenticating;

  if (isHydrated && isAuthenticated && user) {
    const destination = redirectTo ?? getRoleHome(user.role);
    return (
      <Card className="w-full border-emerald-500/30 bg-emerald-500/5">
        <CardHeader className="space-y-1">
          <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            You&apos;re already signed in
          </CardTitle>
          <CardDescription>
            Continuing as <strong>{user.name}</strong> ({user.role}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm" variant="outline" className="w-full gap-2">
            <a href={destination}>
              Go to {user.role} dashboard
              <Truck className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-border/70 bg-card/80 backdrop-blur-sm shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground flex items-center justify-center shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
              One-click demo login
            </CardTitle>
            <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0 border border-amber-400/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">
              BETA
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm leading-relaxed">
          Skip registration and instantly explore every role in the CourierFlow
          sandbox. Credentials are pre-filled below — just click a button.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          {DEMO_CREDENTIALS.map((cred) => {
            const Icon = cred.icon;
            const isActive = activeRole === cred.role;
            return (
              <button
                key={cred.role}
                type="button"
                onClick={() => handleDemoLogin(cred)}
                disabled={disabled}
                className={[
                  "group relative text-left rounded-xl border p-3 sm:p-4 transition-all",
                  "bg-background hover:-translate-y-0.5 hover:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "ring-1",
                  cred.accent,
                  disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
                aria-busy={isActive}
                aria-label={`Sign in as ${cred.title}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={[
                      "h-9 w-9 rounded-lg flex items-center justify-center shadow-inner",
                      cred.role === "CUSTOMER"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : cred.role === "COURIER"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                    ].join(" ")}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <Badge variant={cred.badgeVariant ?? "outline"} className="text-[10px]">
                    {cred.badge}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {cred.title}
                    {isActive ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : null}
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                    {cred.tagline}
                  </p>
                </div>
                <Separator className="my-3 opacity-70" />
                <div className="space-y-1.5 text-[11px] font-mono text-muted-foreground/90">
                  <div className="flex items-center justify-between gap-2">
                    <span className="uppercase text-[9px] tracking-wider opacity-70">
                      Email
                    </span>
                    <span className="truncate max-w-[65%] text-right">
                      {cred.email.replace("@courierflow.test", "@…")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="uppercase text-[9px] tracking-wider opacity-70">
                      Pass
                    </span>
                    <span className="truncate max-w-[65%] text-right tabular-nums">
                      {cred.password.slice(0, -3)}•••
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 p-3 text-xs text-muted-foreground flex flex-col gap-2">
          <div className="flex items-center gap-2 font-medium text-foreground/80">
            <Building2 className="h-3.5 w-3.5 text-primary/80" />
            <span>Sandbox data &amp; payments</span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 list-disc pl-4 text-[11px] leading-relaxed">
            <li>All shipments &amp; payments are sandbox-only — no real charges</li>
            <li>Use SSLCommerz test cards/bKash/Nagad for checkout flow</li>
            <li>Use any 6-digit OTP for courier pickup/drop-off scans</li>
            <li>Accounts reset daily — great for screenshots &amp; demos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default DemoLoginCard;
