"use client";

import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  MapPin,
  Package,
  Receipt,
  Search as SearchIcon,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import type { ServiceType, Shipment, ShipmentStatus } from "@/lib/api/types";
import { formatBDT, formatDateTime, cn } from "@/lib/utils";

const SERVICE_META: Record<ServiceType, { label: string; variant: "default" | "secondary" | "outline" }> = {
  STANDARD: { label: "Standard", variant: "outline" },
  EXPRESS: { label: "Express", variant: "default" },
  OVERNIGHT: { label: "Overnight", variant: "secondary" },
};

export interface RecentShipmentsProps {
  shipments: Shipment[] | null | undefined;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  limit?: number;
  emptyStateLabel?: string;
  emptyStateHint?: string;
  viewAllHref?: string;
  detailsHrefFn?: (shipment: Shipment) => string;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  showTrackingNumberColumn?: boolean;
  allowSearch?: boolean;
  allowFilterStatus?: ShipmentStatus[];
}

export function RecentShipments({
  shipments,
  loading,
  error,
  onRetry,
  limit,
  emptyStateLabel = "No shipments yet",
  emptyStateHint = "Your past and active shipments will appear here once created.",
  viewAllHref = "/dashboard/shipments",
  detailsHrefFn = (s) => `/dashboard/shipments/${s.id}`,
  className,
  title,
  description,
  headerAction,
  showTrackingNumberColumn = true,
  allowSearch = true,
  allowFilterStatus,
}: RecentShipmentsProps) {
  const [query, setQuery] = React.useState("");
  const [activeStatus, setActiveStatus] = React.useState<ShipmentStatus | "ALL">("ALL");

  const rows = React.useMemo(() => {
    if (!shipments) return [];
    let list = [...shipments];
    if (limit !== undefined) list = list.slice(0, limit);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((s) => {
        const matchable = [
          s.trackingNumber,
          s.id,
          s.senderAddress?.fullName,
          s.senderAddress?.phone,
          s.senderAddress?.city,
          s.recipientAddress?.fullName,
          s.recipientAddress?.phone,
          s.recipientAddress?.city,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchable.includes(q);
      });
    }
    if (activeStatus !== "ALL") {
      list = list.filter((s) => s.status === activeStatus);
    }
    return list;
  }, [shipments, limit, query, activeStatus]);

  const statuses = React.useMemo(() => {
    const set = new Set<ShipmentStatus>();
    for (const s of shipments ?? []) set.add(s.status);
    const arr = Array.from(set);
    if (allowFilterStatus?.length) return allowFilterStatus.filter((s) => set.has(s));
    return arr;
  }, [shipments, allowFilterStatus]);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-start justify-between gap-3 flex-wrap border-b">
        <div className="space-y-1 min-w-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-primary" />
            {title ?? "Your shipments"}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {description ?? "Recent shipments · latest first · each row links to full details"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {headerAction}
          {viewAllHref ? (
            <Button asChild variant="outline" size="sm">
              <Link href={viewAllHref}>
                View all
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {(allowSearch || statuses.length) ? (
          <div className="flex flex-col sm:flex-row gap-2 p-4 border-b items-start sm:items-center">
            {allowSearch ? (
              <div className="relative w-full sm:w-72">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tracking, name, city…"
                  className="pl-8 h-9"
                  aria-label="Search shipments"
                />
              </div>
            ) : null}
            {statuses.length ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant={activeStatus === "ALL" ? "default" : "outline"}
                  className="cursor-pointer text-[11px]"
                  onClick={() => setActiveStatus("ALL")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setActiveStatus("ALL")}
                >
                  All
                </Badge>
                {statuses.map((s) => (
                  <ShipmentStatusBadge
                    key={s}
                    status={s}
                    size="sm"
                    variant={activeStatus === s ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveStatus(s)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setActiveStatus(s)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <Table className="[&_td]:py-3.5 [&_th]:py-3">
            <TableHeader>
              <TableRow>
                {showTrackingNumberColumn ? (
                  <TableHead className="w-[180px] whitespace-nowrap">Tracking</TableHead>
                ) : null}
                <TableHead>Route</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="text-right whitespace-nowrap">Created</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: limit ?? 5 }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {showTrackingNumberColumn ? (
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-56 max-w-full" />
                        <Skeleton className="h-3 w-40 max-w-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20 rounded-4xl" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28 rounded-4xl" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-4 w-32 ml-auto" />
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={showTrackingNumberColumn ? 7 : 6}>
                    <div className="flex flex-col items-start gap-3 p-6 rounded-lg border border-destructive/30 bg-destructive/[0.03]">
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <CircleHelp className="h-4 w-4" />
                        <span className="font-semibold">
                          Failed to load your shipments
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {error.message ?? "Please check your connection and try again."}
                      </p>
                      {onRetry ? (
                        <Button size="sm" variant="outline" onClick={onRetry}>
                          Try again
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showTrackingNumberColumn ? 7 : 6}>
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{emptyStateLabel}</p>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          {emptyStateHint}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button asChild size="sm">
                          <Link href="/dashboard/shipments/new">
                            <Package className="h-4 w-4 mr-2" />
                            Book first shipment
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((s) => {
                  const svcMeta = SERVICE_META[s.serviceType] ?? {
                    label: s.serviceType,
                    variant: "outline" as const,
                  };
                  const originCity = s.senderAddress?.city ?? "—";
                  const destCity = s.recipientAddress?.city ?? "—";
                  return (
                    <TableRow key={s.id} className="group">
                      {showTrackingNumberColumn ? (
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-semibold">
                              {s.trackingNumber}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              ID · {s.id.slice(0, 10)}
                            </span>
                          </div>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0" />
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-medium line-clamp-1">
                              <span className="text-indigo-600 dark:text-indigo-400">
                                {originCity}
                              </span>
                              <span className="text-muted-foreground mx-1">→</span>
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {destCity}
                              </span>
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {s.senderAddress?.fullName?.split(" ")[0] ?? "?"}
                              {" · "}
                              {s.recipientAddress?.fullName?.split(" ")[0] ?? "?"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={svcMeta.variant} className="text-[10px] font-medium">
                          {svcMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ShipmentStatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        <div className="font-semibold text-sm">{formatBDT(s.totalAmount)}</div>
                        {s.codAmount ? (
                          <div className="text-[10px] text-amber-600">
                            +CoD {formatBDT(s.codAmount)}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatDateTime(s.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost" className="opacity-70 group-hover:opacity-100">
                          <Link href={detailsHrefFn(s)} aria-label={`View shipment ${s.trackingNumber}`}>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentShipments;
