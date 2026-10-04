"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Crown,
  Home as HomeIcon,
  LayoutDashboard,
  LogOut,
  Package,
  PackageCheck,
  PackagePlus,
  Truck,
  User,
  Users2,
  FileText,
  Banknote,
  Receipt,
  Wrench,
  Scale,
  History,
  ShieldCheck,
  Search as SearchIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardShell from "@/components/layout/DashboardShell";
import SidebarNav, { type SidebarNavItem } from "@/components/layout/SidebarNav";
import { useAuthStore, getRoleHome } from "@/store/useAuthStore";
import type { Role } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const CUSTOMER_NAV: SidebarNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: HomeIcon, roles: ["CUSTOMER"] },
  { label: "My Shipments", href: "/dashboard/shipments", icon: Package, roles: ["CUSTOMER"] },
  { label: "New Shipment", href: "/dashboard/shipments/new", icon: PackagePlus, roles: ["CUSTOMER"] },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["CUSTOMER"] },
  { label: "Profile", href: "/dashboard/profile", icon: User, roles: ["CUSTOMER"] },
];

const COURIER_NAV: SidebarNavItem[] = [
  { label: "Overview", href: "/courier", icon: HomeIcon, roles: ["COURIER"] },
  { label: "My Assignments", href: "/courier/assignments", icon: Truck, roles: ["COURIER"] },
  { label: "Earnings", href: "/courier/earnings", icon: Banknote, roles: ["COURIER"] },
  { label: "Notifications", href: "/courier/notifications", icon: Bell, roles: ["COURIER"] },
  { label: "Profile", href: "/courier/profile", icon: User, roles: ["COURIER"] },
];

const ADMIN_NAV: SidebarNavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, roles: ["ADMIN"] },
  { label: "Shipments", href: "/admin/shipments", icon: PackageCheck, roles: ["ADMIN"] },
  { label: "Users", href: "/admin/users", icon: Users2, roles: ["ADMIN"] },
  { label: "Hubs", href: "/admin/hubs", icon: ShieldCheck, roles: ["ADMIN"] },
  { label: "Pricing Rules", href: "/admin/pricing-rules", icon: Scale, roles: ["ADMIN"] },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: History, roles: ["ADMIN"] },
  { label: "Settings", href: "/admin/settings", icon: Wrench, roles: ["ADMIN"] },
];

export function getNavForRole(role: Role): SidebarNavItem[] {
  switch (role) {
    case "CUSTOMER":
      return CUSTOMER_NAV;
    case "COURIER":
      return COURIER_NAV;
    case "ADMIN":
      return ADMIN_NAV;
  }
}

export function getRoleMeta(role: Role): {
  label: string;
  shortLabel: string;
  tagline: string;
  accent: string;
  accentSoft: string;
  icon: LucideIcon;
  badgeVariant: "default" | "secondary" | "outline";
} {
  switch (role) {
    case "CUSTOMER":
      return {
        label: "Customer Panel",
        shortLabel: "Customer",
        tagline: "Ship, track & pay for your parcels",
        accent: "from-blue-600 to-indigo-600",
        accentSoft: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
        icon: Package,
        badgeVariant: "secondary",
      };
    case "COURIER":
      return {
        label: "Courier Panel",
        shortLabel: "Courier",
        tagline: "Your assignments, pickups & earnings",
        accent: "from-amber-500 to-orange-600",
        accentSoft: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        icon: Truck,
        badgeVariant: "outline",
      };
    case "ADMIN":
      return {
        label: "Administrator Panel",
        shortLabel: "Admin",
        tagline: "Manage users, hubs, pricing & audits",
        accent: "from-purple-600 to-fuchsia-600",
        accentSoft: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
        icon: Crown,
        badgeVariant: "default",
      };
  }
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export interface RoleDashboardShellProps {
  role: Role;
  children: React.ReactNode;
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  headerActions?: React.ReactNode;
  showSearch?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

export function RoleDashboardShell({
  role,
  children,
  heading,
  subheading,
  headerActions,
  showSearch = true,
  searchPlaceholder = "Search…",
  className,
}: RoleDashboardShellProps) {
  const router = useRouter();
  const meta = getRoleMeta(role);
  const nav = getNavForRole(role);
  const Icon = meta.icon;

  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const logout = useAuthStore((s) => s.logout);

  const home = getRoleHome(role);

  const handleLogout = React.useCallback(async () => {
    await logout({ silent: false, skipServer: false });
    router.replace("/login?error=LoggedOut");
  }, [logout, router]);

  const footerSlot = React.useMemo(() => {
    return (
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
        {isHydrated && user ? (
          <div className="rounded-xl border bg-muted/30 p-3 flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback
                className={cn(
                  "text-[11px] font-semibold bg-gradient-to-br text-white",
                  meta.accent,
                )}
              >
                {initialsOf(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
          </div>
        )}
      </div>
    );
  }, [handleLogout, isHydrated, user, meta.accent]);

  const headerSlot = React.useMemo(() => {
    return (
      <div className="flex w-full min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm",
              meta.accent,
            )}
            aria-hidden
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight sm:text-lg truncate">
                {heading ?? (
                  <span>
                    {meta.label}
                    <span className="text-muted-foreground font-medium hidden sm:inline">
                      {" "}· Dashboard
                    </span>
                  </span>
                )}
              </h1>
              <Badge variant={meta.badgeVariant} className="text-[10px] px-2 py-0 shrink-0">
                {meta.shortLabel}
              </Badge>
            </div>
            {subheading ?? (
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {meta.tagline}
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full items-center gap-2 lg:w-auto">
          {showSearch ? (
            <div className="relative min-w-0 flex-1 lg:w-72 lg:flex-none">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={searchPlaceholder}
                className="pl-8 h-9"
                aria-label={searchPlaceholder}
              />
            </div>
          ) : null}

          <Button asChild variant="outline" size="sm" aria-label="Notifications">
            <Link href={`${home}/notifications`}>
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>

          {headerActions}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 h-9 px-1.5">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-[10px] font-semibold bg-gradient-to-br text-white",
                      meta.accent,
                    )}
                  >
                    {isHydrated && user ? initialsOf(user.name) : "…"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-xs font-medium max-w-[120px] truncate">
                  {isHydrated && user ? user.name.split(" ")[0] : "Loading…"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {isHydrated && user ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">{user.name}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        {user.email}
                      </span>
                      {user.phone ? (
                        <span className="text-[11px] text-muted-foreground font-normal">
                          {user.phone}
                        </span>
                      ) : null}
                      <Badge variant={meta.badgeVariant} className="mt-1 w-fit text-[10px]">
                        {meta.shortLabel} account
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={home}>
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      {meta.shortLabel} Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${home}/profile`}>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`${home}/notifications`}>
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuLabel>
                  <div className="space-y-1.5">
                    <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                  </div>
                </DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }, [
    meta,
    Icon,
    heading,
    subheading,
    showSearch,
    searchPlaceholder,
    headerActions,
    home,
    isHydrated,
    user,
    handleLogout,
  ]);

  return (
    <DashboardShell
      sidebarTitle={meta.label}
      className={className}
      sidebar={
        <SidebarNav
          items={nav}
          role={role}
          title={`${meta.shortLabel} Workspace`}
          footerSlot={footerSlot}
        />
      }
      headerSlot={headerSlot}
    >
      {children}
    </DashboardShell>
  );
}

export default RoleDashboardShell;

export { CUSTOMER_NAV, COURIER_NAV, ADMIN_NAV };
