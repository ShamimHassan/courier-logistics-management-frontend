"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Bell,
  BellOff,
  BellRing,
  CheckCheck,
  CircleDot,
  Loader2,
  Package,
  RefreshCw,
  Truck,
  CreditCard,
  ShieldAlert,
  Star,
  Info,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { getNotifications, markNotificationRead } from "@/lib/api/endpoints";
import type { Notification, NotificationListMeta, NotificationType } from "@/lib/api/types";
import { formatDateTime, cn } from "@/lib/utils";

/* ─── Notification type → icon/colour map ─── */
type NotificationMeta = {
  icon: React.ElementType;
  colour: string;
  bg: string;
};

function getNotificationMeta(type: NotificationType): NotificationMeta {
  if (type.startsWith("SHIPMENT_")) {
    return {
      icon: Package,
      colour: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
    };
  }
  if (type.startsWith("ASSIGNMENT_")) {
    return {
      icon: Truck,
      colour: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    };
  }
  if (type.startsWith("PAYMENT_") || type === "REFUND_PROCESSED") {
    return {
      icon: CreditCard,
      colour: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    };
  }
  if (type === "COURIER_AVAILABILITY") {
    return {
      icon: ShieldAlert,
      colour: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
    };
  }
  return {
    icon: Info,
    colour: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  };
}

/* ─── Single notification row ─── */
function NotificationRow({
  notification,
  onMarkRead,
  isMarkingRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isMarkingRead: boolean;
}) {
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;
  const isRead = !!notification.readAt;

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4 transition",
        isRead
          ? "bg-card/50 opacity-80"
          : "bg-card border-primary/20 shadow-sm",
      )}
    >
      {/* Icon circle */}
      <div
        className={cn(
          "h-9 w-9 shrink-0 rounded-full flex items-center justify-center",
          meta.bg,
        )}
        aria-hidden
      >
        <Icon className={cn("h-4 w-4", meta.colour)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p
            className={cn(
              "text-sm font-semibold leading-snug",
              !isRead && "text-foreground",
            )}
          >
            {notification.title}
            {!isRead && (
              <span
                aria-label="Unread"
                className="ml-2 inline-block h-2 w-2 rounded-full bg-primary align-middle"
              />
            )}
          </p>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
            {formatDateTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {notification.type.replace(/_/g, " ")}
          </Badge>
          {notification.relatedShipmentId && (
            <Badge variant="secondary" className="text-[10px] font-mono">
              Shipment #{notification.relatedShipmentId.slice(0, 8)}
            </Badge>
          )}
          {isRead && notification.readAt && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CheckCheck className="h-3 w-3" />
              Read {formatDateTime(notification.readAt)}
            </span>
          )}
        </div>
      </div>

      {/* Mark-read button */}
      {!isRead && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onMarkRead(notification.id)}
          disabled={isMarkingRead}
          aria-label="Mark as read"
          className="shrink-0 h-8 w-8 p-0"
        >
          {isMarkingRead ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CircleDot className="h-3.5 w-3.5 text-primary" />
          )}
        </Button>
      )}
    </div>
  );
}

/* ─── Page ─── */
type FilterTab = "all" | "unread" | "read";

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const tab = (searchParams.get("filter") as FilterTab) ?? "all";
  const page = Number(searchParams.get("page") ?? "1");

  // Build API query from active tab
  const readFilter =
    tab === "unread" ? false : tab === "read" ? true : undefined;

  const queryKey = ["notifications", { filter: tab, page }];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApiQuery<NotificationListMeta>({
    queryKey,
    queryFn: () =>
      getNotifications({ read: readFilter, page, limit: 20 }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Track which IDs are being marked (for per-row loading)
  const [markingIds, setMarkingIds] = React.useState<Set<string>>(new Set());

  const { mutate: markRead } = useApiMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    successToast: false,
    errorToast: true,
    onMutate: (id) => {
      // Optimistic: mark the item as read in cache
      qc.setQueryData<NotificationListMeta>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: Math.max(0, old.unreadCount - 1),
          items: old.items.map((n) =>
            n.id === id
              ? { ...n, readAt: new Date().toISOString() }
              : n,
          ),
        };
      });
    },
    onSuccess: (_data, id) => {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Marked as read.");
      // Invalidate sidebar unread count queries too
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (_err, id) => {
      setMarkingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      // Revert optimistic update
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleMarkRead = (id: string) => {
    setMarkingIds((prev) => new Set(prev).add(id));
    markRead(id);
  };

  // Mark ALL unread as read — loop call pattern
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);

  const handleMarkAllRead = async () => {
    const unread = (data?.items ?? []).filter((n) => !n.readAt);
    if (unread.length === 0) {
      toast("All notifications are already read.");
      return;
    }
    setIsMarkingAll(true);
    try {
      await Promise.all(
        unread.map((n) => markNotificationRead(n.id).catch(() => null)),
      );
      await qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`Marked ${unread.length} notification${unread.length > 1 ? "s" : ""} as read.`);
    } catch {
      toast.error("Some notifications could not be marked as read.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  // Tab navigation
  const setTab = (next: FilterTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("filter");
    } else {
      params.set("filter", next);
    }
    params.delete("page"); // reset to page 1
    router.push(`${pathname}?${params.toString()}`);
  };

  const items = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] px-2 py-0">
                {unreadCount} unread
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Shipment updates, payment alerts and assignment events.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh notifications"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || isLoading}
            >
              {isMarkingAll ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              )}
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
        <TabsList>
          <TabsTrigger value="all">
            All
            {total > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {total}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1.5 text-[10px] px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl border p-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3.5 w-full max-w-sm" />
                <Skeleton className="h-3.5 w-3/4 max-w-xs" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card className="border-destructive/30">
          <CardContent className="p-6 flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <BellOff className="h-4 w-4" />
              <span className="font-semibold">Failed to load notifications</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {(error as Error)?.message ?? "Please check your connection and try again."}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
              {tab === "unread" ? (
                <BellRing className="h-6 w-6 text-muted-foreground" />
              ) : (
                <CheckCheck className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                {tab === "unread"
                  ? "All caught up!"
                  : tab === "read"
                    ? "No read notifications"
                    : "No notifications yet"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {tab === "unread"
                  ? "You have no unread notifications. Great work staying on top of things."
                  : tab === "read"
                    ? "Notifications you have opened will appear here."
                    : "Shipment updates, payment confirmations and courier events will appear here."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <NotificationRow
              key={n.id}
              notification={n}
              onMarkRead={handleMarkRead}
              isMarkingRead={markingIds.has(n.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.totalPages} · {data.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(page - 1));
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(page + 1));
                router.push(`${pathname}?${params.toString()}`);
              }}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
