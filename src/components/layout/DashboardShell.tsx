"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  headerSlot?: React.ReactNode;
  sidebarTitle?: string;
  sidebarFooter?: React.ReactNode;
  className?: string;
}

export function DashboardShell({
  children,
  sidebar,
  headerSlot,
  sidebarTitle = "CourierFlow",
  sidebarFooter,
  className,
}: DashboardShellProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("min-h-[calc(100dvh-4rem)] w-full bg-background", className)}>
      <div className="flex min-h-[calc(100dvh-4rem)] w-full">
        {/* ── Desktop sidebar ── */}
        <aside
          className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r bg-card/40"
          aria-label="Sidebar"
        >
          <div className="flex items-center h-14 px-4 border-b shrink-0">
            <span className="font-extrabold text-base tracking-tight">
              {sidebarTitle}
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="h-full">{sidebar}</div>
          </ScrollArea>
          {sidebarFooter ? (
            <>
              <Separator />
              <div className="p-3 shrink-0">{sidebarFooter}</div>
            </>
          ) : null}
        </aside>

        {/* ── Main column ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile topbar */}
          <div className="flex h-14 items-center gap-3 border-b bg-card/30 px-4 lg:h-auto lg:border-0 lg:bg-transparent lg:px-6 lg:pt-6 lg:pb-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[85%] max-w-sm p-0 flex flex-col"
              >
                <div className="flex items-center justify-between h-14 px-4 border-b shrink-0">
                  <span className="font-extrabold text-base tracking-tight">
                    {sidebarTitle}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="flex-1">{sidebar}</ScrollArea>
                {sidebarFooter ? (
                  <>
                    <Separator />
                    <div className="p-3 shrink-0">{sidebarFooter}</div>
                  </>
                ) : null}
              </SheetContent>
            </Sheet>
            {headerSlot ? (
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                {headerSlot}
              </div>
            ) : null}
          </div>

          {/* Page content */}
          <main className="flex-1 w-full">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-4 lg:px-6 lg:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardShell;
