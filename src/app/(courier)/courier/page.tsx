"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardList,
  HandCoins,
  Loader2,
  MapPin,
  PackageCheck,
  RefreshCw,
  Star,
  Truck,
  User as UserIcon,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import StatCard from "@/components/dashboard/StatCard";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  getCourierMe,
  getCourierEarnings,
  setCourierAvailability,
  type CourierMeResponse,
  type CourierEarningsResponse,
} from "@/lib/api/endpoints";
import { useAuthStore } from "@/store/useAuthStore";
import { formatBDT, formatDateTime, cn } from "@/lib/utils";

/* ─── helpers ─── */
function greetCourier(name: string | undefined): string {
  const first = name?.trim().split(/\s+/)[0] ?? "there";
  const h = new Date().getHours();
  const part =
    h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${part}, ${first} 👋`;
}

/* ─── Weekly bar chart (CSS-only, no Recharts dep needed here) ─── */
interface WeeklyBarChartProps {
  deliveries: Array<{ completedAt: string | null; courierEarning: number }>;
  loading?: boolean;
}

function WeeklyBarChart({ deliveries, loading }: WeeklyBarChartProps) {
  const days = React.useMemo(() => {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts: number[] = Array(7).fill(0);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    for (const d of deliveries) {
      if (!d.completedAt) continue;
      const dt = new Date(d.completedAt);
      if (dt >= weekStart) {
        counts[dt.getDay()] += 1;
      }
    }
    // Reorder to show today last — Mon … today
    const todayIdx = now.getDay();
    const reordered: { label: string; count: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const idx = (todayIdx - 7 + i + 7) % 7;
      reordered.push({ label: labels[idx], count: counts[idx] });
    }
    return reordered;
  }, [deliveries]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      {loading ? (
        <div className="flex items-end gap-2 h-32">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <Skeleton className="w-full rounded-t-md" style={{ height: `${40 + Math.random() * 60}%` }} />
              <Skeleton className="h-3 w-5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-2 h-32">
          {days.map((d) => {
            const h = (d.count / max) * 100;
            const isToday =
              d.label ===
              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-[10px] font-semibold text-muted-foreground">
                  {d.count || ""}
                </div>
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    isToday
                      ? "bg-linear-to-t from-amber-500 to-orange-400"
                      : "bg-linear-to-t from-indigo-500 to-purple-500",
                  )}
                  style={{ height: `${Math.max(6, h)}%` }}
                />
                <div
                  className={cn(
                    "text-[10px]",
                    isToday ? "font-bold text-amber-600" : "text-muted-foreground",
                  )}
                >
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Total this week:{" "}
          {loading ? (
            <Skeleton className="inline-block h-3.5 w-6" />
          ) : (
            <span className="font-semibold text-foreground">{total}</span>
          )}
        </span>
        <Link
          href="/courier/earnings"
          className="font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
          <Banknote className="h-3.5 w-3.5" />
          Earnings report
        </Link>
      </div>
    </div>
  );
}

/* ─── Recent assignment card ─── */
interface AssignmentRowProps {
  assignment: NonNullable<CourierMeResponse["profile"]["recentAssignments"]>[number];
}

function AssignmentRow({ assignment }: AssignmentRowProps) {
  const shipment = assignment.shipment;
  const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    OFFERED: "secondary",
    ACCEPTED: "default",
    IN_PROGRESS: "default",
    COMPLETED: "outline",
    REJECTED: "destructive",
    CANCELLED: "destructive",
  };

  return (
    <div className="rounded-xl border bg-card/60 p-4 hover:bg-muted/30 transition">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="font-mono text-[10px]">
              {assignment.id.slice(0, 16)}
            </Badge>
            <Badge
              variant={statusVariant[assignment.status] ?? "outline"}
              className="text-[10px]"
            >
              {assignment.status.replace(/_/g, " ")}
            </Badge>
          </div>
          {shipment?.trackingNumber && (
            <p className="text-xs font-mono text-muted-foreground mt-1.5">
              {shipment.trackingNumber}
            </p>
          )}
        </div>
        {assignment.earnings != null && (
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Earning
            </p>
            <p className="text-base font-bold text-emerald-600">
              {formatBDT(assignment.earnings)}
            </p>
          </div>
        )}
      </div>

      {shipment && (
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-muted/40 p-2.5 space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Pickup
            </p>
            <p className="text-xs line-clamp-2">
              {[
                shipment.senderAddress?.city,
                shipment.senderAddress?.street,
              ]
                .filter(Boolean)
                .join(" — ") || "—"}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2.5 space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Dropoff
            </p>
            <p className="text-xs line-clamp-2">
              {[
                shipment.recipientAddress?.city,
                shipment.recipientAddress?.street,
              ]
                .filter(Boolean)
                .join(" — ") || "—"}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end">
        <Button asChild size="sm" variant="outline">
          <Link href={`/courier/assignments/${assignment.id}`}>
            {assignment.status === "IN_PROGRESS" ? "Continue workflow" : "View details"}
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ─── Availability toggle card ─── */
function AvailabilityCard({
  profile,
  isLoading,
}: {
  profile: CourierMeResponse["profile"] | undefined;
  isLoading: boolean;
}) {
  const qc = useQueryClient();
  const [optimisticAvailable, setOptimisticAvailable] = React.useState<boolean | null>(null);

  const isAvailable = optimisticAvailable ?? profile?.available ?? false;

  const { mutate, isPending } = useApiMutation({
    mutationFn: (available: boolean) => setCourierAvailability({ available }),
    successToast: false,
    onSuccess: (data) => {
      // data is the full profile response — update cache
      qc.setQueryData(["courier", "me"], (old: CourierMeResponse | undefined) => {
        if (!old) return old;
        return { profile: { ...old.profile, available: (data as { isAvailable: boolean }).isAvailable } };
      });
      setOptimisticAvailable(null);
      toast.success(
        (data as { isAvailable: boolean }).isAvailable
          ? "You are now available for assignments."
          : "You are now unavailable.",
      );
    },
    onError: () => {
      // Revert
      setOptimisticAvailable(null);
    },
  });

  const handleToggle = (checked: boolean) => {
    setOptimisticAvailable(checked);
    mutate(checked);
  };

  const primaryZone = profile?.serviceZones?.[0]?.zone;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Truck className="h-4 w-4 text-amber-600" />
          Availability
        </CardTitle>
        <CardDescription>Turn this on so dispatch can assign you new jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="courier-available" className="text-sm font-medium cursor-pointer">
                  I&apos;m available for new assignments
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Auto-synced to CourierFlow dispatch engine.
                </p>
              </div>
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Switch
                  id="courier-available"
                  checked={isAvailable}
                  onCheckedChange={handleToggle}
                  aria-label="Toggle availability"
                />
              )}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isAvailable ? "bg-emerald-500" : "bg-slate-400",
                  )}
                />
                {isAvailable ? "Available" : "Unavailable"}
              </span>
              {primaryZone && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {primaryZone.name}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Page ─── */
export default function CourierDashboardPage() {
  const user = useAuthStore((s) => s.user);

  // ── Profile ──────────────────────────────────────────────────────────────
  const {
    data: profileData,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useApiQuery<CourierMeResponse>({
    queryKey: ["courier", "me"],
    queryFn: getCourierMe,
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
  });

  // ── Earnings (last 7 completed deliveries for bar chart) ─────────────────
  const {
    data: earningsData,
    isLoading: earningsLoading,
  } = useApiQuery<CourierEarningsResponse>({
    queryKey: ["courier", "earnings", { limit: 50 }],
    queryFn: () => getCourierEarnings({ page: 1, limit: 50 }),
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
  });

  const profile = profileData?.profile;
  const summary = earningsData?.summary;
  const deliveries = earningsData?.deliveries ?? [];

  // ── Derived KPIs ─────────────────────────────────────────────────────────
  const todayDeliveries = React.useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return deliveries.filter(
      (d) => d.completedAt && new Date(d.completedAt) >= todayStart,
    ).length;
  }, [deliveries]);

  const successRate = React.useMemo(() => {
    if (!profile?.totalDeliveries) return null;
    const completed = summary?.totalDeliveries ?? 0;
    if (completed === 0) return null;
    // Use total deliveries from profile as denominator (includes failed)
    return Math.min(100, Math.round((completed / profile.totalDeliveries) * 100));
  }, [profile, summary]);

  // KPI stat cards
  const kpiCards = [
    {
      label: "Today's deliveries",
      value: earningsLoading ? "—" : String(todayDeliveries),
      description: "Completed today",
      accent: "emerald" as const,
      icon: CheckCircle2,
      delta: earningsLoading ? "Loading…" : `${todayDeliveries} dropoff${todayDeliveries !== 1 ? "s" : ""}`,
    },
    {
      label: "Weekly earnings",
      value: earningsLoading ? "—" : formatBDT(summary?.thisWeek ?? 0),
      description: "Last 7 days",
      accent: "amber" as const,
      icon: HandCoins,
      delta: earningsLoading ? "Loading…" : `${summary?.totalDeliveries ?? 0} total deliveries`,
    },
    {
      label: "Average rating",
      value: profileLoading
        ? "—"
        : profile?.averageRating != null
          ? Number(profile.averageRating).toFixed(1)
          : "N/A",
      description: profile?.totalRatings ? `${profile.totalRatings} reviews` : "No reviews yet",
      accent: "indigo" as const,
      icon: Star,
      delta: profileLoading ? "Loading…" : `${profile?.totalRatings ?? 0} ratings`,
    },
    {
      label: "Success rate",
      value: profileLoading
        ? "—"
        : successRate != null
          ? `${successRate}%`
          : "—",
      description: "Completed vs total",
      accent: "lime" as const,
      icon: PackageCheck,
      delta: profileLoading
        ? "Loading…"
        : `${profile?.totalDeliveries ?? 0} lifetime deliveries`,
    },
  ];

  // ── Recent assignments from profile ──────────────────────────────────────
  const recentAssignments = (profile as any)?.recentAssignments ?? [];

  return (
    <>
      {/* ── Welcome banner ── */}
      <Card className="mb-6 border-amber-500/20 bg-linear-to-br from-amber-500/[0.05] via-background to-orange-500/[0.03] shadow-sm">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              {greetCourier(user?.name)}
            </p>
            <h2 className="text-xl font-bold tracking-tight mt-1 flex flex-wrap items-center gap-2">
              <span>Courier Dashboard</span>
              {profile?.available != null && (
                <Badge
                  variant={profile.available ? "default" : "secondary"}
                  className="text-[11px]"
                >
                  {profile.available ? "🟢 Available" : "⚫ Unavailable"}
                </Badge>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
              {user?.email ?? "Accept assignments, log pickups and record deliveries."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button asChild size="sm">
              <Link href="/courier/assignments">
                <ClipboardList className="h-4 w-4 mr-2" />
                My assignments
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                void refetchProfile();
                toast("Refreshed.");
              }}
              aria-label="Refresh dashboard"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k) => (
          <StatCard
            key={k.label}
            label={k.label}
            value={k.value}
            description={k.description}
            icon={k.icon}
            accent={k.accent}
            deltaLabel={k.delta}
            deltaDirection="neutral"
            loading={k.label === "Weekly earnings" || k.label === "Today's deliveries"
              ? earningsLoading
              : profileLoading}
          />
        ))}
      </div>

      {/* ── Main grid: assignments + sidebar ── */}
      <div className="grid gap-4 mt-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Recent assignments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-amber-600" />
                Recent assignments
              </CardTitle>
              <CardDescription>
                Your latest offered and active jobs — accept, reject or continue the
                workflow.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/courier/assignments">
                View all
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {profileLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3.5 w-32" />
                    </div>
                    <Skeleton className="h-8 w-20 shrink-0" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Skeleton className="h-14 rounded-lg" />
                    <Skeleton className="h-14 rounded-lg" />
                  </div>
                </div>
              ))
            ) : profileError ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-center space-y-3">
                <p className="text-sm font-semibold text-destructive">
                  Failed to load assignments
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetchProfile()}
                >
                  Try again
                </Button>
              </div>
            ) : recentAssignments.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <ClipboardList className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-semibold text-sm">No assignments yet</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  When dispatch assigns you a shipment, it will appear here. Make
                  sure you&apos;re set as available.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-2">
                  <Link href="/courier/assignments">Open assignments page</Link>
                </Button>
              </div>
            ) : (
              recentAssignments
                .slice(0, 3)
                .map((a: any) => (
                  <AssignmentRow key={a.id} assignment={a} />
                ))
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Availability toggle */}
          <AvailabilityCard profile={profile} isLoading={profileLoading} />

          {/* Weekly deliveries chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Deliveries this week
              </CardTitle>
              <CardDescription>7-day window · completed dropoffs · today highlighted</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyBarChart deliveries={deliveries} loading={earningsLoading} />
            </CardContent>
          </Card>

          {/* Earnings summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                Earnings summary
              </CardTitle>
              <CardDescription>Completed deliveries only</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {earningsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))
              ) : (
                <>
                  {[
                    { label: "This week", value: formatBDT(summary?.thisWeek ?? 0), accent: "text-amber-600" },
                    { label: "This month", value: formatBDT(summary?.thisMonth ?? 0), accent: "text-indigo-600" },
                    {
                      label: "Avg / delivery",
                      value: formatBDT(summary?.averagePerDelivery ?? 0),
                      accent: "text-emerald-600",
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-semibold ${row.accent}`}>{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
                      <Link href="/courier/earnings">
                        <Banknote className="h-4 w-4" />
                        Full earnings report
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/courier/assignments">
                  <ClipboardList className="h-4 w-4" />
                  All assignments
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/courier/earnings">
                  <Banknote className="h-4 w-4" />
                  Earnings &amp; payouts
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/courier/profile">
                  <UserIcon className="h-4 w-4" />
                  Vehicle &amp; zones
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
