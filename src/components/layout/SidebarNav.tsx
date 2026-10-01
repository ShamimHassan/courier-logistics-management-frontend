"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "./Navbar";

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: NonNullable<UserRole>[];
  badge?: string | number;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  role?: UserRole;
  title?: string;
  footerSlot?: React.ReactNode;
}

export function SidebarNav({
  items,
  role = null,
  title = "Navigation",
  footerSlot,
}: SidebarNavProps) {
  const pathname = usePathname();

  const visible = role
    ? items.filter((i) => !i.roles || i.roles.includes(role))
    : items;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col gap-1 py-2">
      <div className="px-3 pb-2 pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition min-h-[44px]",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    item.variant === "destructive"
                      ? "bg-destructive/15 text-destructive"
                      : item.variant === "outline"
                        ? "border text-muted-foreground"
                        : item.variant === "secondary"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary/15 text-primary",
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
              {active ? (
                <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      {footerSlot ? (
        <div className="mt-auto pt-4 px-2">{footerSlot}</div>
      ) : null}
    </div>
  );
}

export default SidebarNav;
