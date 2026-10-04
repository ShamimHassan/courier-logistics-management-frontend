"use client";

import {
  Bell,
  CreditCard,
  Home as HomeIcon,
  Package,
  PlusCircle,
  Settings,
  User,
  MapPin,
  Activity,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardShell from "@/components/layout/DashboardShell";
import SidebarNav, { type SidebarNavItem } from "@/components/layout/SidebarNav";
import QuickShipWizard from "@/components/shipments/QuickShipWizard";
import { toast } from "sonner";
import { formatBDT, formatDateTime } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getHealth } from "@/lib/api/endpoints";

const DEMO_SIDEBAR_ITEMS: SidebarNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: HomeIcon, roles: ["CUSTOMER"] },
  { label: "My Shipments", href: "/dashboard/shipments", icon: Package, roles: ["CUSTOMER"], badge: 12 },
  { label: "Create Shipment", href: "/dashboard/shipments/new", icon: PlusCircle, roles: ["CUSTOMER"] },
  { label: "Pricing Calculator", href: "/dashboard/pricing", icon: CreditCard, roles: ["CUSTOMER"] },
  { label: "Track & Trace", href: "/dashboard/track", icon: MapPin, roles: ["CUSTOMER"] },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["CUSTOMER", "COURIER", "ADMIN"], badge: 3 },
  { label: "Profile", href: "/dashboard/profile", icon: User, roles: ["CUSTOMER", "COURIER", "ADMIN"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["CUSTOMER", "COURIER", "ADMIN"] },
];

export default function CustomerDashboardPreviewPage() {
  const {
    data: health,
    isLoading: healthLoading,
    isError: healthError,
    refetch: healthRefetch,
  } = useApiQuery({
    queryKey: ["dev", "health"],
    queryFn: getHealth,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const [showWizard, setShowWizard] = useState(true);

  return (
    <DashboardShell
      sidebarTitle="Customer"
      sidebar={
        <SidebarNav
          items={DEMO_SIDEBAR_ITEMS}
          role="CUSTOMER"
          title="Customer Workspace"
        />
      }
      headerSlot={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              Welcome back, Shamim 👋
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Here&apos;s your CourierFlow summary for today.
            </p>
          </div>
          <Button size="sm" asChild>
            <a href="/dashboard/shipments/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              New shipment
            </a>
          </Button>
        </div>
      }
    >
      {showWizard ? (
        <Card className="mb-6 border-primary/40 bg-gradient-to-br from-primary/[0.04] via-background to-indigo-500/[0.03] shadow-md overflow-hidden">
          <CardHeader className="py-4 px-5 flex-row items-center justify-between gap-3 border-b border-primary/15">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground flex items-center justify-center shadow-sm">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="space-y-0 min-w-0">
                <CardTitle className="text-sm sm:text-base font-bold tracking-tight flex items-center gap-2">
                  Quick-ship wizard
                  <Badge variant="default" className="text-[10px] px-2 py-0">
                    New
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm truncate">
                  Book, price &amp; pay for a shipment in under 60 seconds — 5 guided steps.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Dismiss quick-ship wizard"
              onClick={() => setShowWizard(false)}
              className="shrink-0"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CardHeader>
          <CardContent className="p-5 sm:p-6">
            <QuickShipWizard
              onSuccess={(shipment) => {
                toast(`Shipment ${shipment.trackingNumber} created`, {
                  description: "Redirecting to SSLCommerz checkout…",
                });
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-dashed bg-muted/20">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <PlusCircle className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">Quick-ship wizard</div>
                <div className="text-xs text-muted-foreground">
                  Collapsed — click to create a new shipment from scratch.
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowWizard(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Open wizard
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total shipments
            </CardTitle>
            <CardDescription>Lifetime</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">47</p>
            <p className="text-xs text-emerald-600 mt-1">+6 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In transit
            </CardTitle>
            <CardDescription>Active now</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              9 <Badge variant="outline" className="ml-1">IN_TRANSIT</Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Est. delivery by {formatDateTime(new Date(Date.now() + 86400000 * 2))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spent this month
            </CardTitle>
            <CardDescription>September</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBDT(12480)}</p>
            <p className="text-xs text-muted-foreground mt-1">14 shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On-time rate
            </CardTitle>
            <CardDescription>Last 30 deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">98.4%</p>
            <p className="text-xs text-muted-foreground mt-1">Avg 1.3 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent shipments</CardTitle>
          <CardDescription>
            Dashboard shell preview — sidebar, header &amp; KPI cards wired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Tracking ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Destination</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { id: "CFY20261001DH8821", to: "Chattogram", status: "IN_TRANSIT", amount: 220 },
                  { id: "CFY20260930SY5510", to: "Sylhet", status: "DELIVERED", amount: 380 },
                  { id: "CFY20260929RA1088", to: "Rajshahi", status: "PICKED_UP", amount: 180 },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                    <td className="px-4 py-3">{row.to}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          row.status === "DELIVERED"
                            ? "secondary"
                            : row.status === "IN_TRANSIT"
                              ? "default"
                              : "outline"
                        }
                      >
                        {row.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatBDT(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-dashed bg-muted/20">
        <CardHeader className="pb-2 flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Dev: Backend Health Check
            </CardTitle>
            <CardDescription>
              Verifies the typed API client + TanStack Query are wired. Uses{" "}
              <code className="bg-muted rounded px-1 text-[11px]">GET /health</code>.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => healthRefetch()}
            disabled={healthLoading}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            {healthLoading ? "Checking…" : "Re-check"}
          </Button>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : healthError ? (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="shrink-0">
                Not connected
              </Badge>
              <span>
                Backend is offline (expected in Step 6 — we only verify the client
                compiles + types are correct). Start backend on port 5000 and
                click Re-check.
              </span>
            </div>
          ) : health ? (
            <div className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <p className="font-semibold capitalize">{health.status}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Environment
                </p>
                <p className="font-semibold">{health.environment ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Uptime
                </p>
                <p className="font-semibold">
                  {health.uptime ? `${(health.uptime / 60).toFixed(1)} min` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Timestamp
                </p>
                <p className="font-semibold text-xs">
                  {formatDateTime(health.timestamp)}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
