"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Download,
  HandCoins,
  RefreshCw,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatCard from "@/components/dashboard/StatCard";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import {
  getCourierEarnings,
  type CourierEarningsResponse,
  type CourierEarningsDeliveryEntry,
} from "@/lib/api/endpoints";
import { cn, formatBDT, formatDate } from "@/lib/utils";

/* ─── Service type badge ─────────────────────────────────────────────────────── */

const SERVICE_BADGE: Record<string, { label: string; className: string }> = {
  STANDARD: {
    label: "Standard",
    className: "border-slate-400/30 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  },
  EXPRESS: {
    label: "Express",
    className: "border-indigo-400/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  OVERNIGHT: {
    label: "Overnight",
    className: "border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

function ServiceBadge({ type }: { type: string }) {
  const meta = SERVICE_BADGE[type] ?? {
    label: type,
    className: "border-slate-400/30 bg-slate-500/10 text-slate-600",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium", meta.className)}>
      {meta.label}
    </Badge>
  );
}

/* ─── Daily earnings chart data builder ─────────────────────────────────────── */

interface DailyPoint {
  date: string;    // "Mon 03", "Tue 04" …
  earnings: number;
  deliveries: number;
}

function buildDailyTrend(
  deliveries: CourierEarningsDeliveryEntry[],
  fromDate?: string,
  toDate?: string,
): DailyPoint[] {
  // Determine the window: use provided dates or last 14 days
  const to = toDate ? new Date(toDate) : new Date();
  const from = fromDate
    ? new Date(fromDate)
    : new Date(to.getTime() - 13 * 86_400_000);

  // Clamp to a max of 60 days to keep the chart readable
  const diffDays = Math.round((to.getTime() - from.getTime()) / 86_400_000);
  const days = Math.min(diffDays + 1, 60);

  // Build a map: dateStr → { earnings, count }
  const map = new Map<string, { earnings: number; deliveries: number }>();

  for (let i = 0; i < days; i++) {
    const d = new Date(to.getTime() - (days - 1 - i) * 86_400_000);
    const key = d.toISOString().slice(0, 10); // "2026-10-05"
    map.set(key, { earnings: 0, deliveries: 0 });
  }

  for (const entry of deliveries) {
    if (!entry.completedAt) continue;
    const key = entry.completedAt.slice(0, 10);
    const existing = map.get(key);
    if (existing) {
      existing.earnings += entry.courierEarning;
      existing.deliveries += 1;
    }
  }

  return Array.from(map.entries()).map(([dateStr, val]) => {
    const d = new Date(dateStr);
    const label = d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
    }); // "Mon 03"
    return { date: label, ...val };
  });
}

/* ─── Custom Recharts tooltip ────────────────────────────────────────────────── */

function EarningsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number | string; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const earnings = Number(payload.find((p) => p.name === "earnings")?.value ?? 0);
  const deliveries = Number(payload.find((p) => p.name === "deliveries")?.value ?? 0);
  return (
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm shadow-lg p-3 text-sm space-y-1.5">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-emerald-600 font-bold">{formatBDT(earnings)}</p>
      <p className="text-xs text-muted-foreground">
        {deliveries} deliver{deliveries !== 1 ? "ies" : "y"}
      </p>
    </div>
  );
}

/* ─── Table row skeleton ─────────────────────────────────────────────────────── */

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
    </TableRow>
  );
}

/* ─── CSV export ─────────────────────────────────────────────────────────────── */

function exportCsv(entries: CourierEarningsDeliveryEntry[]) {
  const header = "Date,Tracking Number,Service Type,Shipment Amount (BDT),Courier Earning (BDT)";
  const rows = entries.map((e) =>
    [
      e.completedAt ? formatDate(e.completedAt) : "—",
      e.trackingNumber,
      e.serviceType,
      e.shipmentAmount,
      e.courierEarning,
    ].join(","),
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `courierflow-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function CourierEarningsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── URL state ── */
  const fromDate = searchParams.get("from") ?? "";
  const toDate = searchParams.get("to") ?? "";
  const page = Number(searchParams.get("page") ?? "1");
  const PAGE_SIZE = 20;

  /* ── Local date picker state (controlled inputs before "Apply") ── */
  const [fromInput, setFromInput] = React.useState(fromDate);
  const [toInput, setToInput] = React.useState(toDate);

  /* Sync inputs when URL changes externally */
  React.useEffect(() => {
    setFromInput(fromDate);
    setToInput(toDate);
  }, [fromDate, toDate]);

  const pushParams = (params: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page"); // reset to page 1 on filter change
    router.push(`${pathname}?${next.toString()}`);
  };

  const applyDateFilter = () => {
    pushParams({ from: fromInput || undefined, to: toInput || undefined });
  };

  const clearFilters = () => {
    setFromInput("");
    setToInput("");
    pushParams({ from: undefined, to: undefined });
  };

  const hasFilter = !!fromDate || !!toDate;

  /* ── Fetch — summary + table on same request ── */
  const queryKey = ["courier", "earnings", { from: fromDate, to: toDate, page }];

  const { data, isLoading, isError, error, refetch, isFetching } =
    useApiQuery<CourierEarningsResponse>({
      queryKey,
      queryFn: () =>
        getCourierEarnings({
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page,
          limit: PAGE_SIZE,
        }),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    });

  /* For the chart we fetch all at once (larger limit, no pagination) */
  const chartQueryKey = ["courier", "earnings", "chart", { from: fromDate, to: toDate }];
  const { data: chartData, isLoading: chartLoading } =
    useApiQuery<CourierEarningsResponse>({
      queryKey: chartQueryKey,
      queryFn: () =>
        getCourierEarnings({
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page: 1,
          limit: 500, // get everything for chart
        }),
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    });

  const summary = data?.summary;
  const entries = data?.deliveries ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const chartEntries = chartData?.deliveries ?? [];
  const dailyTrend = React.useMemo(
    () => buildDailyTrend(chartEntries, fromDate, toDate),
    [chartEntries, fromDate, toDate],
  );

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Banknote className="h-5 w-5 text-amber-500" />
            Earnings Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your completed delivery earnings — filter by date range.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetch();
              void refetch(); // refetch both queries
            }}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
          {entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv(chartEntries.length ? chartEntries : entries)}
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* ── Date range filter ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-end gap-3 flex-wrap">
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <Label htmlFor="from-date" className="text-xs font-medium flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                From date
              </Label>
              <Input
                id="from-date"
                type="date"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                max={toInput || undefined}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[140px]">
              <Label htmlFor="to-date" className="text-xs font-medium flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                To date
              </Label>
              <Input
                id="to-date"
                type="date"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                min={fromInput || undefined}
                className="h-9 text-sm"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                onClick={applyDateFilter}
                disabled={isLoading || isFetching}
              >
                Apply filter
              </Button>
              {hasFilter && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                  className="gap-1.5 text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          {hasFilter && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <CalendarDays className="h-3 w-3" />
              Showing results from{" "}
              <span className="font-medium text-foreground">{fromDate || "—"}</span> to{" "}
              <span className="font-medium text-foreground">{toDate || "—"}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Summary stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total earnings"
          value={formatBDT(summary?.totalEarnings ?? 0)}
          icon={Banknote}
          accent="amber"
          deltaLabel={isLoading ? "Loading…" : `${summary?.totalDeliveries ?? 0} deliveries`}
          deltaDirection="neutral"
          loading={isLoading}
        />
        <StatCard
          label="Total deliveries"
          value={summary?.totalDeliveries ?? 0}
          icon={CheckCircle2}
          accent="emerald"
          deltaLabel={isLoading ? "Loading…" : "Completed"}
          deltaDirection="neutral"
          loading={isLoading}
        />
        <StatCard
          label="Avg per delivery"
          value={formatBDT(summary?.averagePerDelivery ?? 0)}
          icon={TrendingUp}
          accent="indigo"
          deltaLabel={isLoading ? "Loading…" : "Per completed delivery"}
          deltaDirection="neutral"
          loading={isLoading}
        />
        <StatCard
          label="This week"
          value={formatBDT(summary?.thisWeek ?? 0)}
          icon={Zap}
          accent="purple"
          deltaLabel={isLoading ? "Loading…" : "Last 7 days"}
          deltaDirection="neutral"
          loading={isLoading}
        />
        <StatCard
          label="This month"
          value={formatBDT(summary?.thisMonth ?? 0)}
          icon={HandCoins}
          accent="orange"
          deltaLabel={isLoading ? "Loading…" : "Last 30 days"}
          deltaDirection="neutral"
          loading={isLoading}
        />
      </div>

      {/* ── Line chart ── */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 flex-wrap border-b pb-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
              Earnings Trend (Daily)
            </CardTitle>
            <CardDescription>
              {hasFilter
                ? `${fromDate} → ${toDate || "today"} · BDT earned per day`
                : "Last 14 days · BDT earned per day"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              Earnings / day
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {chartLoading ? (
            <div className="h-56 flex items-end gap-1 px-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{ height: `${30 + Math.sin(i) * 20 + 30}%` }}
                />
              ))}
            </div>
          ) : dailyTrend.length === 0 ||
            dailyTrend.every((d) => d.earnings === 0) ? (
            <div className="h-56 flex items-center justify-center">
              <div className="text-center space-y-1">
                <TrendingUp className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  No earnings data in this period
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={dailyTrend}
                margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    Number(v) >= 1000 ? `৳${(Number(v) / 1000).toFixed(1)}k` : `৳${Number(v)}`
                  }
                  width={52}
                />
                <Tooltip content={<EarningsTooltip />} />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  name="earnings"
                  stroke="hsl(239 84% 67%)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "hsl(239 84% 67%)" }}
                />
                <Line
                  type="monotone"
                  dataKey="deliveries"
                  name="deliveries"
                  stroke="hsl(142 71% 45%)"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 2"
                  activeDot={{ r: 4, fill: "hsl(142 71% 45%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {dailyTrend.length > 0 && !chartLoading && (
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-5 bg-indigo-500 inline-block rounded" />
                Earnings (BDT)
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="h-0.5 w-5 border-t-2 border-dashed border-emerald-500 inline-block"
                  style={{ borderSpacing: "4px" }}
                />
                Deliveries (count)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Earnings table ── */}
      <Card>
        <CardHeader className="border-b py-3 px-4 flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              Delivery Records
            </CardTitle>
            <CardDescription className="text-xs">
              {isLoading
                ? "Loading…"
                : `${meta?.totalCount ?? 0} completed deliveries${hasFilter ? " in selected range" : ""}`}
            </CardDescription>
          </div>
          {meta && meta.totalCount > 0 && (
            <Badge variant="outline" className="text-[11px]">
              Page {page} / {totalPages}
            </Badge>
          )}
        </CardHeader>

        <div className="overflow-x-auto">
          <Table className="[&_td]:py-3.5 [&_th]:py-3">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Completed</TableHead>
                <TableHead className="whitespace-nowrap">Tracking #</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Shipment Amount
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Your Earning
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-start gap-3 p-6 rounded-lg border border-destructive/30 bg-destructive/[0.03]">
                      <p className="text-sm font-semibold text-destructive">
                        Failed to load earnings
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(error as Error)?.message ?? "Check your connection."}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => refetch()}
                      >
                        Try again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          No earnings found
                        </p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          {hasFilter
                            ? "No completed deliveries in this date range. Try clearing the filter."
                            : "Complete deliveries to see your earnings here."}
                        </p>
                      </div>
                      {hasFilter && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={clearFilters}
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow
                    key={entry.assignmentId}
                    className="group"
                  >
                    <TableCell className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {entry.completedAt
                        ? formatDate(entry.completedAt)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold">
                        {entry.trackingNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ServiceBadge type={entry.serviceType} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                      {formatBDT(entry.shipmentAmount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                        {formatBDT(entry.courierEarning)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {meta?.totalCount ?? 0} total records
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
