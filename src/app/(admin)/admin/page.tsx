"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Crown,
  History,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Timer,
  TrendingDown,
  TrendingUp,
  Truck,
  Users,
  Users2,
  XCircle,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import {
  getAdminDashboardStats,
  getUnassignedShipments,
} from "@/lib/api/endpoints";
import type { DashboardStats, PaginatedData, Shipment } from "@/lib/api/types";
import { cn, formatBDT, formatDateTime } from "@/lib/utils";

/* ─── Star icon ─────────────────────────────────────────────────────────────── */
function StarInline() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
      <path d="M12 2l2.95 6.94L22 9.63l-5.27 4.81L18.18 22 12 18.27 5.82 22l1.45-7.56L2 9.63l7.05-.69z" />
    </svg>
  );
}

/* ─── Custom tooltips ───────────────────────────────────────────────────────── */
function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number | string; name: string; color?: string }>;
  label?: string;
  formatter?: (v: number | string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg p-3 text-sm space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{formatter ? formatter(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── Simulated trend data (derived from stats) ─────────────────────────────── */
// The backend stats endpoint returns aggregates, not time-series.
// We generate plausible 14-day and 6-month trend data seeded from real totals.
function generateShipmentTrend(total: number): Array<{ day: string; count: number }> {
  const days: Array<{ day: string; count: number }> = [];
  const avg = Math.max(1, Math.round(total / 30));
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const label = d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" });
    const jitter = Math.round((Math.random() - 0.5) * avg * 0.6);
    days.push({ day: label, count: Math.max(0, avg + jitter) });
  }
  return days;
}

function generateRevenueTrend(monthTotal: number): Array<{ month: string; revenue: number }> {
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const base = Math.max(1000, monthTotal * 0.4);
  return months.map((m, i) => ({
    month: m,
    revenue: Math.round(base * (0.5 + i * 0.1) * (0.9 + Math.random() * 0.2)),
  }));
}

/* ─── Status distribution pie data ─────────────────────────────────────────── */
const STATUS_PIE = [
  { name: "Delivered", key: "delivered", color: "#10b981" },
  { name: "In Transit", key: "inTransit", color: "#3b82f6" },
  { name: "Failed", key: "failed", color: "#ef4444" },
];

/* ─── Skeleton helpers ──────────────────────────────────────────────────────── */
function KpiSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  /* ── Data fetching ── */
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
    isFetching: statsFetching,
  } = useApiQuery<DashboardStats>({
    queryKey: ["admin", "dashboard-stats"],
    queryFn: getAdminDashboardStats,
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: unassignedData,
    isLoading: unassignedLoading,
  } = useApiQuery<PaginatedData<Shipment>>({
    queryKey: ["admin", "assignments", "unassigned", { page: 1, limit: 5 }],
    queryFn: () => getUnassignedShipments({ page: 1, limit: 5 }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  /* ── Derived values ── */
  const shipmentTrend = React.useMemo(
    () => generateShipmentTrend(stats?.shipments?.total ?? 100),
    [stats?.shipments?.total],
  );
  const revenueTrend = React.useMemo(
    () => generateRevenueTrend(stats?.revenue?.thisMonth ?? 500_000),
    [stats?.revenue?.thisMonth],
  );

  const pieSections = React.useMemo(() => {
    if (!stats?.shipments) return STATUS_PIE.map((s) => ({ ...s, value: 0 }));
    const { delivered, inTransit, failed, total } = stats.shipments;
    const other = Math.max(0, total - delivered - inTransit - failed);
    return [
      { ...STATUS_PIE[0], value: delivered },
      { ...STATUS_PIE[1], value: inTransit },
      { ...STATUS_PIE[2], value: failed },
      { name: "Other", key: "other", color: "#94a3b8", value: other },
    ].filter((s) => s.value > 0);
  }, [stats?.shipments]);

  const unassigned = unassignedData?.items ?? [];
  const unassignedTotal = unassignedData?.total ?? 0;

  /* ── KPI groups sourced from live stats ── */
  const shipmentsGroup = [
    {
      label: "Total shipments",
      value: statsLoading ? "—" : (stats?.shipments?.total ?? 0).toLocaleString(),
      accent: "indigo" as const,
      icon: PackageCheck,
      delta: "Lifetime",
      deltaDir: "neutral" as const,
    },
    {
      label: "In transit",
      value: statsLoading ? "—" : (stats?.shipments?.inTransit ?? 0).toLocaleString(),
      accent: "blue" as const,
      icon: Truck,
      delta: "Active now",
      deltaDir: "up" as const,
    },
    {
      label: "Delivered",
      value: statsLoading ? "—" : (stats?.shipments?.delivered ?? 0).toLocaleString(),
      accent: "emerald" as const,
      icon: CheckCircle2,
      delta: "All time",
      deltaDir: "up" as const,
    },
    {
      label: "Failed / Cancelled",
      value: statsLoading ? "—" : (stats?.shipments?.failed ?? 0).toLocaleString(),
      accent: "rose" as const,
      icon: XCircle,
      delta: "Cancelled + returned",
      deltaDir: "down" as const,
    },
  ];

  const revenueGroup = [
    {
      label: "Today",
      value: statsLoading ? "—" : formatBDT(stats?.revenue?.today ?? 0),
      accent: "amber" as const,
      icon: Banknote,
      delta: "Payments received today",
      deltaDir: "up" as const,
    },
    {
      label: "This week",
      value: statsLoading ? "—" : formatBDT(stats?.revenue?.thisWeek ?? 0),
      accent: "orange" as const,
      icon: Zap,
      delta: "Last 7 days",
      deltaDir: "up" as const,
    },
    {
      label: "This month",
      value: statsLoading ? "—" : formatBDT(stats?.revenue?.thisMonth ?? 0),
      accent: "lime" as const,
      icon: TrendingUp,
      delta: "Last 30 days",
      deltaDir: "up" as const,
    },
    {
      label: "Success rate",
      value: statsLoading ? "—" : `${stats?.delivery?.successRate ?? 0}%`,
      accent: "purple" as const,
      icon: CheckCircle2,
      delta: `${(stats?.delivery?.totalAttempts ?? 0).toLocaleString()} attempts`,
      deltaDir: "up" as const,
    },
  ];

  const couriersGroup = [
    {
      label: "Active couriers",
      value: statsLoading ? "—" : (stats?.couriers?.active ?? 0).toLocaleString(),
      accent: "indigo" as const,
      icon: Users,
      delta: "Approved",
      deltaDir: "neutral" as const,
    },
    {
      label: "Available",
      value: statsLoading ? "—" : (stats?.couriers?.available ?? 0).toLocaleString(),
      accent: "emerald" as const,
      icon: Timer,
      delta: "Ready for assignment",
      deltaDir: "up" as const,
    },
    {
      label: "Busy",
      value: statsLoading ? "—" : (stats?.couriers?.busy ?? 0).toLocaleString(),
      accent: "blue" as const,
      icon: Truck,
      delta: "On delivery",
      deltaDir: "neutral" as const,
    },
    {
      label: "Pending queue",
      value: unassignedLoading ? "—" : unassignedTotal.toLocaleString(),
      accent: "amber" as const,
      icon: AlertTriangle,
      delta: "Awaiting assignment",
      deltaDir: unassignedTotal > 0 ? ("down" as const) : ("neutral" as const),
    },
  ];

  const kpiSections = [
    { title: "Shipments", items: shipmentsGroup },
    { title: "Revenue", items: revenueGroup },
    { title: "Couriers & Queue", items: couriersGroup },
  ];

  return (
    <>
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Admin Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Live aggregate KPIs from the CourierFlow platform.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchStats()}
          disabled={statsFetching}
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5 mr-1.5", statsFetching && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* ── Error state ── */}
      {statsError && !stats && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="p-5 flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-destructive">
                Failed to load dashboard stats
              </p>
              <p className="text-xs text-muted-foreground">
                The stats API may be unavailable. Charts will show placeholder
                data. Try refreshing.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── KPI sections ── */}
      {kpiSections.map((section) => (
        <section key={section.title} className="mb-6">
          <div className="flex items-end justify-between mb-3 px-0.5">
            <h2 className="text-sm font-semibold tracking-tight text-foreground/90">
              {section.title}
            </h2>
            <p className="text-xs text-muted-foreground">
              Live · updated on refresh
            </p>
          </div>
          {statsLoading && !stats ? (
            <KpiSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {section.items.map((item) => (
                <StatCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  icon={item.icon}
                  accent={item.accent}
                  deltaLabel={item.delta}
                  deltaDirection={item.deltaDir}
                  loading={statsLoading && !stats}
                />
              ))}
            </div>
          )}
        </section>
      ))}

      {/* ── Charts row ── */}
      <div className="grid gap-4 lg:grid-cols-3 mt-2">
        {/* LineChart — Shipments over time */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap border-b pb-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                Shipments over Time
              </CardTitle>
              <CardDescription>Last 14 days · estimated from total volume</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">14-day window</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {statsLoading ? (
              <div className="h-52 flex items-end gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${30 + Math.abs(Math.sin(i)) * 50}%` }}
                  />
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={208}>
                <LineChart
                  data={shipmentTrend}
                  margin={{ top: 4, right: 12, left: -12, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Shipments"
                    stroke="hsl(239 84% 67%)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "hsl(239 84% 67%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* BarChart — Revenue by month */}
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4.5 w-4.5 text-amber-600" />
              Revenue by Month
            </CardTitle>
            <CardDescription>Last 6 months · BDT estimate</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {statsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-2.5 rounded-full flex-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={208}>
                <BarChart
                  data={revenueTrend}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  tickFormatter={(v) => `৳${(Number(v) / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(v) => formatBDT(Number(v))}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="hsl(38 92% 50%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Second charts row ── */}
      <div className="grid gap-4 mt-4 lg:grid-cols-3">
        {/* PieChart — Status distribution */}
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PackageCheck className="h-4.5 w-4.5 text-emerald-600" />
              Status distribution
            </CardTitle>
            <CardDescription>All shipments in system</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {statsLoading ? (
              <div className="h-44 flex items-center justify-center">
                <Skeleton className="h-36 w-36 rounded-full" />
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={176}>
                  <PieChart>
                    <Pie
                      data={pieSections}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {pieSections.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [Number(v).toLocaleString(), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {pieSections.map((s) => (
                    <div key={s.key} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-muted-foreground truncate">{s.name}</span>
                      <span className="font-semibold ml-auto">
                        {s.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Top couriers ranking table (static — no dedicated API endpoint) */}
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="h-4.5 w-4.5 text-amber-500" />
              Top couriers · this month
            </CardTitle>
            <CardDescription>Deliveries &amp; ratings (sample)</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {[
              { name: "Rahim Uddin", deliveries: 186, rating: 4.9, zone: "Dhaka North" },
              { name: "Karim Ahmed", deliveries: 164, rating: 4.8, zone: "Chattogram" },
              { name: "Fatima Khatun", deliveries: 158, rating: 4.9, zone: "Dhaka South" },
              { name: "Sabbir Hossain", deliveries: 142, rating: 4.7, zone: "Sylhet" },
              { name: "Nasirul Islam", deliveries: 138, rating: 4.6, zone: "Rajshahi" },
            ].map((c, i) => (
              <div
                key={c.name}
                className="flex items-center gap-3 rounded-lg border p-2.5 hover:bg-muted/30 transition"
              >
                <div className="h-7 w-7 shrink-0 rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.zone}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold">{c.deliveries}</p>
                  <p className="text-[11px] text-amber-600 flex items-center justify-end gap-0.5">
                    <StarInline />{c.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Unassigned queue */}
        <Card>
          <CardHeader className="border-b pb-3 flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                Pending queue
              </CardTitle>
              <CardDescription>
                {unassignedLoading
                  ? "Loading…"
                  : `${unassignedTotal} awaiting courier dispatch`}
              </CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/shipments?filter=unassigned">
                Assign
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {unassignedLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))
            ) : unassigned.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  All caught up!
                </p>
                <p className="text-xs text-muted-foreground">
                  No shipments awaiting assignment.
                </p>
              </div>
            ) : (
              unassigned.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/4 p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px]">{s.trackingNumber}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px]">
                        {s.serviceType}
                      </Badge>
                      <span className="text-xs font-semibold">
                        {formatBDT(s.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {s.senderAddress?.city ?? "?"} →{" "}
                    {s.recipientAddress?.city ?? "?"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Created {formatDateTime(s.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Quick links ── */}
      <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/admin/shipments", icon: PackageCheck, label: "Manage shipments" },
          { href: "/admin/users", icon: Users2, label: "Manage users" },
          { href: "/admin/hubs", icon: ShieldCheck, label: "Hubs & zones" },
          { href: "/admin/audit-logs", icon: History, label: "Audit logs" },
        ].map((l) => {
          const Icon = l.icon;
          return (
            <Button
              key={l.href}
              asChild
              variant="outline"
              className="justify-start gap-2"
            >
              <Link href={l.href}>
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            </Button>
          );
        })}
      </div>
    </>
  );
}
