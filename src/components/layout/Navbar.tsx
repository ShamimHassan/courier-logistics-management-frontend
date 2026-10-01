"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  Menu,
  Package,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type UserRole = "CUSTOMER" | "COURIER" | "ADMIN" | null;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface NavbarProps {
  user?: SessionUser | null;
  unreadNotificationCount?: number;
  onLogout?: () => void;
}

const PUBLIC_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function dashboardRouteFor(role: NonNullable<UserRole>): string {
  switch (role) {
    case "CUSTOMER":
      return "/dashboard";
    case "COURIER":
      return "/courier";
    case "ADMIN":
      return "/admin";
  }
}

function roleLabel(role: NonNullable<UserRole>): string {
  switch (role) {
    case "CUSTOMER":
      return "Customer";
    case "COURIER":
      return "Courier";
    case "ADMIN":
      return "Admin";
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

export function Navbar({
  user = null,
  unreadNotificationCount = 0,
  onLogout,
}: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const isPublic = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors",
        scrolled
          ? "bg-background/85 backdrop-blur border-b shadow-sm"
          : "bg-background/60 backdrop-blur-sm border-b border-transparent",
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* ── Brand ── */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm group-hover:scale-[1.03] transition">
            <Truck className="h-4.5 w-4.5" />
          </span>
          <span className="font-extrabold text-lg tracking-tight">
            Courier<span className="text-primary">Flow</span>
          </span>
          <Badge
            variant="secondary"
            className="ml-1 hidden sm:inline-flex text-[10px] px-1.5 py-0 tracking-wide"
          >
            BD
          </Badge>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-1">
          {PUBLIC_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition",
                isPublic(l.href)
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop actions ── */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild aria-label="Notifications">
                <Link
                  href={
                    user.role
                      ? `${dashboardRouteFor(user.role)}/notifications`
                      : "/login"
                  }
                >
                  <Bell className="h-5 w-5 relative">
                    {unreadNotificationCount > 0 && (
                      <span className="sr-only">
                        {unreadNotificationCount} unread notifications
                      </span>
                    )}
                  </Bell>
                  {unreadNotificationCount > 0 ? (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0 rounded-full"
                    >
                      {unreadNotificationCount > 99
                        ? "99+"
                        : unreadNotificationCount}
                    </Badge>
                  ) : null}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-9 px-2">
                    <Avatar className="h-8 w-8">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initialsOf(user.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-left leading-tight hidden sm:block">
                      <div className="text-sm font-semibold">
                        {user.name.split(" ")[0]}
                      </div>
                      {user.role ? (
                        <div className="text-[11px] text-muted-foreground">
                          {roleLabel(user.role)}
                        </div>
                      ) : null}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role ? (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href={dashboardRouteFor(user.role)}>
                            <Package className="h-4 w-4 mr-2" />
                            {roleLabel(user.role)} Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                        >
                          <Link
                            href={`${dashboardRouteFor(user.role)}/profile`}
                          >
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                        >
                          <Link
                            href={`${dashboardRouteFor(user.role)}/notifications`}
                          >
                            Notifications
                            {unreadNotificationCount ? (
                              <Badge variant="secondary" className="ml-auto">
                                {unreadNotificationCount}
                              </Badge>
                            ) : null}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                    </>
                  ) : null}
                  {onLogout ? (
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      Log out
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/login">Log in</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="gap-2">
                <Link href="/register">
                  Create account
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* ── Mobile trigger ── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88%] sm:w-[420px]">
            <SheetHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <SheetTitle asChild>
                <Link href="/" className="flex items-center gap-2">
                  <span className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                    <Truck className="h-4 w-4" />
                  </span>
                  <span className="font-extrabold text-base tracking-tight">
                    Courier<span className="text-primary">Flow</span>
                  </span>
                </Link>
              </SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSheetOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </SheetHeader>

            <Separator className="my-2" />

            <div className="flex flex-col gap-1 pt-2">
              {PUBLIC_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "px-3 py-2.5 rounded-md text-[15px] font-medium transition flex items-center justify-between",
                    isPublic(l.href)
                      ? "text-primary bg-primary/5"
                      : "hover:bg-muted/60",
                  )}
                >
                  {l.label}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>

            <Separator className="my-4" />

            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                  <Avatar className="h-10 w-10">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initialsOf(user.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {user.role ? (
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {roleLabel(user.role)}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href={user.role ? dashboardRouteFor(user.role) : "/login"}>
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href={
                        user.role
                          ? `${dashboardRouteFor(user.role)}/notifications`
                          : "/login"
                      }
                    >
                      Notifications
                      {unreadNotificationCount > 0 ? (
                        <Badge variant="secondary" className="ml-auto">
                          {unreadNotificationCount}
                        </Badge>
                      ) : null}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="col-span-2"
                  >
                    <Link
                      href={
                        user.role
                          ? `${dashboardRouteFor(user.role)}/profile`
                          : "/login"
                      }
                    >
                      Manage profile
                    </Link>
                  </Button>
                </div>

                {onLogout ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive mt-3"
                  >
                    Log out
                  </Button>
                ) : null}
              </>
            ) : (
              <div className="grid gap-2">
                <Button asChild size="sm">
                  <Link href="/register">Create account</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default Navbar;
