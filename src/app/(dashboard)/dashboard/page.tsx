"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Activity,
  Clock,
  CreditCard,
  LineChart,
  MapPin,
  Package,
  PackageCheck,
  PlusCircle,
  Receipt,
  RefreshCw,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";
import RecentShipments from "@/components/dashboard/RecentShipments";
import QuickShipWizard from "@/components/shipments/QuickShipWizard";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getHealth, getMe, getMyShipments } from "@/lib/api/endpoints";
import {
  computeCustomerKpis,
  greetingForUser,
  isActiveShipment,
} from "@/components/dashboard/customerKpis";
import { formatBDT, formatDateTime } from "@/lib/utils";

export default function CustomerDashboardPage() {
  const [showWizard, setShowWizard] = useState(true);

  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
    refetch: refetchUser,
  } = useApiQuery({
    queryKey: ["users", "me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: shipmentsPage,
    isLoading: shipmentsLoading,
    isError: shipmentsError,
    refetch: refetchShipments,
  } = useApiQuery({
    queryKey: ["shipments", "my", { page: 1, limit: 25 }],
    queryFn: () =>
      getMyShipments({
        page: 1,
        limit: 25,
        sortBy: "createdAt",
        sortOrder: "desc",
      }),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

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

  const shipments = shipmentsPage?.items ?? null;
  const kpis = useMemo(() => computeCustomerKpis(shipments), [shipments]);
  const greeting = useMemo(() => greetingForUser(user), [user]);

  const activeShipments = useMemo(
    () => (shipments ?? []).filter((s) => isActiveShipment(s)),
    [shipments],
  );

  const anyLoading = userLoading || shipmentsLoading;
  const anyError = userError || shipmentsError;

  return (
    <>
      <Card className="mb-6 border-indigo-500/20 bg-gradient-to-br from-primary/[0.05] via-background to-indigo-500/[0.04] shadow-sm">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {anyLoading ? (
                <Skeleton className="inline-block h-4 w-40" />
              ) : user ? (
                greeting
              ) : anyError ? (
                <span className="text-amber-600">
                  Couldn&apos;t load profile — try refreshing
                </span>
              ) : (
                greeting
              )}
            </p>
            <h2 className="text-xl font-bold tracking-tight mt-1 flex flex-wrap items-center gap-2">
              {userLoading ? (
                <>
                  <Skeleton className="h-6 w-56" />
                  <Skeleton className="h-5 w-28" />
                </>
              ) : (
                <>
                  <span>Welcome back to CourierFlow</span>
                  <Badge variant="outline" className="text-[11px]">
                    {shipmentsLoading
                      ? "…"
                      : `${kpis.totalShipments} shipments · ${formatBDT(kpis.spentTotal)} lifetime`}
                  </Badge>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-xl">
              {user?.email ? (
                <>Signed in as <span className="font-medium">{user.email}</span> · {user.phone ?? ""}</>
              ) : (
                "Book shipments, track their status and manage payments from one place."
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button asChild size="sm">
              <Link href="/dashboard/shipments/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                New shipment
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
                    5 steps
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm truncate">
                  Book, price &amp; pay for a shipment in under 60 seconds.
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
                refetchShipments().catch(() => null);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6 border-dashed bg-muted/20">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
        <StatCard
          label="Total shipments"
          description="Lifetime"
          value={kpis.totalShipments}
          icon={Package}
          accent="indigo"
          deltaLabel={
            shipmentsLoading
              ? "Loading…"
              : `${kpis.shipmentsThisMonth} this month`
          }
          deltaDirection="up"
          loading={shipmentsLoading}
        />
        <StatCard
          label="Active shipments"
          description="In progress now"
          value={activeShipments.length}
          icon={LineChart}
          accent="blue"
          deltaLabel={
            shipmentsLoading
              ? "Loading…"
              : activeShipments.length === 0
                ? "No active parcels"
                : `${activeShipments.filter((s) => s.status === "IN_TRANSIT").length} in transit`
          }
          deltaDirection={activeShipments.length > 0 ? "up" : "neutral"}
          loading={shipmentsLoading}
        />
        <StatCard
          label="Spent this month"
          description={new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
          value={formatBDT(kpis.spentThisMonth)}
          icon={Receipt}
          accent="amber"
          deltaLabel={
            shipmentsLoading ? "Loading…" : `${kpis.shipmentsThisMonth} shipments`
          }
          deltaDirection="neutral"
          loading={shipmentsLoading}
        />
        <StatCard
          label="On-time rate"
          description={
            kpis.delivered30d ? `Delivered · ${kpis.delivered30d} past 30d` : "Deliveries tracked"
          }
          value={
            kpis.onTimeRate !== null
              ? `${(kpis.onTimeRate * 100).toFixed(1)}%`
              : kpis.avgDeliveryDays !== null
                ? `${kpis.avgDeliveryDays.toFixed(1)}d avg`
                : "—"
          }
          icon={Clock}
          accent="emerald"
          deltaLabel={
            shipmentsLoading
              ? "Loading…"
              : kpis.avgDeliveryDays !== null
                ? `Avg ${kpis.avgDeliveryDays.toFixed(1)} days`
                : kpis.deliveredShipments === 0
                  ? "Complete your first delivery"
                  : "More data needed"
          }
          deltaDirection="up"
          loading={shipmentsLoading}
        />
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <RecentShipments
          shipments={shipments}
          loading={shipmentsLoading}
          error={shipmentsError ? new Error("Failed to load") : null}
          onRetry={() => refetchShipments()}
          limit={8}
          viewAllHref="/dashboard/shipments"
          detailsHrefFn={(s) => `/dashboard/shipments/${s.id}`}
          title="Your shipments"
          description="Latest orders — click a row to open full details, or filter below."
          emptyStateLabel="You don't have any shipments yet"
          emptyStateHint="Click the Quick-ship wizard above or use New Shipment to book your first parcel."
        />

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-indigo-500" />
                Quick actions
              </CardTitle>
              <CardDescription>Shortcuts you&apos;ll use most</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/dashboard/shipments/new">
                  <PlusCircle className="h-4 w-4" />
                  Book new shipment
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/dashboard/track">
                  <MapPin className="h-4 w-4" />
                  Track a package
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/pricing">
                  <CreditCard className="h-4 w-4" />
                  Pricing calculator
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/dashboard/profile">
                  <User className="h-4 w-4" />
                  Update profile
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2 text-xs text-muted-foreground mt-2"
                onClick={() => refetchUser().catch(() => null)}
                disabled={userLoading}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh profile
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                Active in-transit
              </CardTitle>
              <CardDescription>Next 3 urgent parcels to watch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {shipmentsLoading && !shipments
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={`sk-a-${i}`}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  ))
                : activeShipments.slice(0, 3).length === 0
                  ? (
                      <div className="rounded-lg border border-dashed p-4 text-center space-y-1">
                        <p className="text-sm font-semibold">Nothing in transit 🎉</p>
                        <p className="text-xs text-muted-foreground">
                          All caught up! Create a new shipment to see its journey here.
                        </p>
                        <Button asChild size="sm" variant="outline" className="mt-2">
                          <Link href="/dashboard/shipments/new">
                            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                            Book shipment
                          </Link>
                        </Button>
                      </div>
                    )
                  : activeShipments.slice(0, 3).map((s) => (
                      <Link
                        key={s.id}
                        href={`/dashboard/shipments/${s.id}`}
                        className="block rounded-lg border p-3 hover:bg-muted/30 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="font-mono text-[11px] font-semibold block truncate">
                              {s.trackingNumber}
                            </span>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                              {s.senderAddress?.city ?? "?"} →{" "}
                              {s.recipientAddress?.city ?? "?"}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {formatBDT(s.totalAmount)}
                          </Badge>
                        </div>
                      </Link>
                    ))}
            </CardContent>
          </Card>
        </div>
      </div>

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
                Backend is offline (expected during dev shell setup — we only verify the
                client compiles + types are correct). Start backend on port 5000 and
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
    </>
  );
}
