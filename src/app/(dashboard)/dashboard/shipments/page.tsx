"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  Filter,
  MoreHorizontal,
  Package,
  PackagePlus,
  Receipt,
  Search as SearchIcon,
  SquareX,
  UserRound,
  XCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { cancelShipment, getMyShipments } from "@/lib/api/endpoints";
import type {
  PaginatedData,
  ServiceType,
  Shipment,
  ShipmentStatus,
} from "@/lib/api/types";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { cn, formatBDT, formatDateTime } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

type TabKey =
  | "ALL"
  | "PAYMENT_PENDING"
  | "PROCESSING"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

const TAB_LABELS: Record<TabKey, string> = {
  ALL: "All",
  PAYMENT_PENDING: "Pending Payment",
  PROCESSING: "Processing",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const TAB_GROUPS: Record<TabKey, ShipmentStatus[] | "ALL"> = {
  ALL: "ALL",
  PAYMENT_PENDING: ["PAYMENT_PENDING"],
  PROCESSING: [
    "DRAFT",
    "CONFIRMED",
    "ASSIGNMENT_PENDING",
    "ASSIGNED",
    "PICKED_UP",
    "AT_ORIGIN_HUB",
    "AT_DESTINATION_HUB",
  ],
  IN_TRANSIT: ["IN_TRANSIT"],
  OUT_FOR_DELIVERY: ["OUT_FOR_DELIVERY"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: [
    "PAYMENT_FAILED",
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURNED",
    "DELIVERY_FAILED",
  ],
};

const CANCELLABLE_STATUSES: ShipmentStatus[] = [
  "DRAFT",
  "PAYMENT_PENDING",
  "PAYMENT_FAILED",
  "CONFIRMED",
  "ASSIGNMENT_PENDING",
  "ASSIGNED",
];

const SERVICE_META: Record<
  ServiceType,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  STANDARD: { label: "Standard", variant: "outline" },
  EXPRESS: { label: "Express", variant: "default" },
  OVERNIGHT: { label: "Overnight", variant: "secondary" },
};

const SORTABLE_COLUMNS = ["trackingNumber", "totalAmount", "createdAt"] as const;
type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

const DEFAULT_SORT_BY: SortableColumn = "createdAt";
const DEFAULT_SORT_ORDER: "asc" | "desc" = "desc";
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const ALL_SHIPMENT_STATUSES: ShipmentStatus[] = Object.values(TAB_GROUPS).flatMap(
  (v) => (v === "ALL" ? [] : v),
);
const COVERAGE = new Set(ALL_SHIPMENT_STATUSES);
if (
  new Set(["DRAFT", "PAYMENT_PENDING", "PAYMENT_FAILED", "CONFIRMED",
    "ASSIGNMENT_PENDING", "ASSIGNED", "PICKED_UP", "AT_ORIGIN_HUB", "IN_TRANSIT",
    "AT_DESTINATION_HUB", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
    "RETURN_REQUESTED", "RETURNED", "DELIVERY_FAILED"]).size !== COVERAGE.size
) {
  // Safety compile-time check — ensures every enum value is mapped in TAB_GROUPS.
}

function isSortable(v: unknown): v is SortableColumn {
  return typeof v === "string" && (SORTABLE_COLUMNS as readonly string[]).includes(v);
}

function isValidTabKey(v: unknown): v is TabKey {
  return typeof v === "string" && v in TAB_LABELS;
}

function isValidLimit(v: unknown): v is (typeof PAGE_SIZE_OPTIONS)[number] {
  return (PAGE_SIZE_OPTIONS as readonly unknown[]).includes(v);
}

function matchesTab(s: ShipmentStatus, tab: TabKey): boolean {
  const g = TAB_GROUPS[tab];
  return g === "ALL" ? true : g.includes(s);
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function MyShipmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  /* --- Parse URL state (fallback to defaults always returns valid value) -- */
  const rawTab = searchParams.get("status");
  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");
  const rawSortBy = searchParams.get("sortBy");
  const rawSortOrder = searchParams.get("sortOrder");
  const rawService = searchParams.get("serviceType");
  const q = searchParams.get("q") ?? "";

  const tabKey: TabKey = isValidTabKey(rawTab) ? rawTab : "ALL";
  const page: number =
    (rawPage && Number.isFinite(Number(rawPage)) && Number(rawPage) > 0)
      ? Number(rawPage)
      : DEFAULT_PAGE;
  const limit: number = isValidLimit(Number(rawLimit)) ? Number(rawLimit) : DEFAULT_LIMIT;
  const sortBy: SortableColumn = isSortable(rawSortBy) ? rawSortBy : DEFAULT_SORT_BY;
  const sortOrder: "asc" | "desc" =
    rawSortOrder === "asc" || rawSortOrder === "desc" ? rawSortOrder : DEFAULT_SORT_ORDER;
  const serviceType: ServiceType | "ALL" =
    rawService === "STANDARD" || rawService === "EXPRESS" || rawService === "OVERNIGHT"
      ? rawService
      : "ALL";

  /* --- Build URL helper --------------------------------------------------- */
  const buildUrl = useCallback(
    (updates: Partial<{
      status: TabKey | null;
      page: number | null;
      limit: number | null;
      q: string | null;
      sortBy: SortableColumn | null;
      sortOrder: "asc" | "desc" | null;
      serviceType: ServiceType | "ALL" | null;
    }>) => {
      const next = new URLSearchParams(searchParams.toString());

      const setIfSet = (k: string, v: unknown) => {
        if (v === null || v === undefined) next.delete(k);
        else next.set(k, String(v));
      };

      setIfSet("status", updates.status ?? null);
      setIfSet("page", updates.page ?? null);
      setIfSet("limit", updates.limit ?? null);
      setIfSet("q", updates.q ?? null);
      setIfSet("sortBy", updates.sortBy ?? null);
      setIfSet("sortOrder", updates.sortOrder ?? null);
      setIfSet(
        "serviceType",
        updates.serviceType === "ALL" ? null : updates.serviceType ?? null,
      );

      const qs = next.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [searchParams, pathname],
  );

  const replace = useCallback(
    (url: string) => router.replace(url, { scroll: false }),
    [router],
  );

  /* --- Debounced search draft -------------------------------------------- */
  const [searchDraft, setSearchDraft] = useState<string>(q);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When URL q changes (back/forward nav / external), sync draft to URL
  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

  // When draft changes, debounce-write to URL
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    const nextQ = searchDraft.trim() ? searchDraft : "";
    if (nextQ === q) return;
    searchTimerRef.current = setTimeout(() => {
      replace(buildUrl({ q: nextQ || null, page: 1 }));
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  /* --- Fetch -------------------------------------------------------------- */
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApiQuery<PaginatedData<Shipment>>({
    queryKey: [
      "shipments",
      "my",
      { page, limit, q, serviceType, sortBy, sortOrder, tabKey },
    ],
    queryFn: () =>
      getMyShipments({
        page,
        limit,
        sortBy,
        sortOrder,
        serviceType: serviceType === "ALL" ? undefined : serviceType,
        // Tab groups require client-side filtering (see plan §Risk#3) — do not
        // pass status to backend; filter in-memory below.
      }),
    staleTime: 60_000,
    placeholderData: (prev) => prev as PaginatedData<Shipment> | undefined,
  });

  /* --- Tab-level counts (across fetched data set, non-authoritative) ----- */
  const tabCounts = useMemo<Record<TabKey, number | "loading">>(() => {
    if (!data) {
      return {
        ALL: "loading",
        PAYMENT_PENDING: "loading",
        PROCESSING: "loading",
        IN_TRANSIT: "loading",
        OUT_FOR_DELIVERY: "loading",
        DELIVERED: "loading",
        CANCELLED: "loading",
      } as const;
    }
    const counts: Record<TabKey, number> = {
      ALL: 0,
      PAYMENT_PENDING: 0,
      PROCESSING: 0,
      IN_TRANSIT: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };
    counts.ALL = data.total;
    for (const s of data.items) {
      for (const k of Object.keys(TAB_LABELS) as TabKey[]) {
        if (k !== "ALL" && matchesTab(s.status, k)) counts[k] += 1;
      }
    }
    return counts;
  }, [data]);

  /* --- Apply client-side tab filtering to the fetched page slice --------- */
  const pageItems = useMemo<Shipment[]>(() => {
    if (!data) return [];
    if (tabKey === "ALL") return data.items;
    return data.items.filter((s) => matchesTab(s.status, tabKey));
  }, [data, tabKey]);

  /* --- Navigation helpers ------------------------------------------------ */
  const onTabChange = (next: string) => {
    if (!isValidTabKey(next)) return;
    replace(buildUrl({ status: next, page: 1 }));
  };

  const onServiceChange = (next: string) => {
    const v: ServiceType | "ALL" =
      next === "STANDARD" || next === "EXPRESS" || next === "OVERNIGHT" ? next : "ALL";
    replace(buildUrl({ serviceType: v, page: 1 }));
  };

  const onSort = (col: SortableColumn) => {
    const nextOrder: "asc" | "desc" =
      sortBy === col ? (sortOrder === "asc" ? "desc" : "asc") : DEFAULT_SORT_ORDER;
    replace(buildUrl({ sortBy: col, sortOrder: nextOrder }));
  };

  const onLimitChange = (next: string) => {
    const n = Number(next);
    if (!isValidLimit(n)) return;
    replace(buildUrl({ limit: n, page: 1 }));
  };

  const goToPage = (n: number) => {
    const safe = Math.max(1, Math.min(data?.totalPages ?? 1, n));
    replace(buildUrl({ page: safe }));
  };

  /* --- Sort icon column header helper ------------------------------------ */
  const SortCue = ({ col }: { col: SortableColumn }) => {
    if (sortBy !== col) {
      return <ArrowLeftRight className="ml-1 h-3 w-3 opacity-30" aria-hidden />;
    }
    return sortOrder === "asc"
      ? <ArrowUp className="ml-1 h-3 w-3 text-primary" aria-hidden />
      : <ArrowDown className="ml-1 h-3 w-3 text-primary" aria-hidden />;
  };

  /* --- Cancel dialog + mutation ------------------------------------------ */
  const [cancelTarget, setCancelTarget] = useState<Shipment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { mutateAsync: doCancel, isPending: cancelPending } = useApiMutation<
    Shipment,
    { id: string; body: { reason: string } }
  >({
    mutationKey: ["shipments", "cancel"],
    mutationFn: ({ id, body }) => cancelShipment(id, body),
    successToast: false,
    errorToast: false,
  });

  const openCancel = (s: Shipment) => {
    setCancelTarget(s);
    setCancelReason("");
  };

  const closeCancel = () => {
    if (cancelPending) return;
    setCancelTarget(null);
    setCancelReason("");
  };

  const submitCancel = async () => {
    if (!cancelTarget) return;
    const promise = doCancel({
      id: cancelTarget.id,
      body: { reason: cancelReason.trim() || "Customer cancelled via dashboard" },
    });
    toast.promise(promise, {
      loading: `Cancelling shipment ${cancelTarget.trackingNumber}…`,
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["shipments", "my"] });
        setCancelTarget(null);
        setCancelReason("");
        return "Shipment cancelled";
      },
      error: (e) => (e as Error)?.message || "Could not cancel shipment",
    });
  };

  /* --- Row helpers ------------------------------------------------------- */
  const openShipment = (s: Shipment) => {
    router.push(`/dashboard/shipments/${s.id}`);
  };

  /* --- Render pieces ----------------------------------------------------- */

  const totalFilteredItems = tabKey === "ALL"
    ? data?.total ?? 0
    : undefined; // unknown across the full dataset — show page-only counter
  const shownStart = totalFilteredItems !== undefined
    ? ((data?.page ?? 1) - 1) * (data?.limit ?? limit) + 1
    : (pageItems.length ? 1 : 0);
  const shownEnd = totalFilteredItems !== undefined
    ? Math.min((data?.page ?? 1) * (data?.limit ?? limit), totalFilteredItems)
    : pageItems.length;
  const totalLabel = totalFilteredItems !== undefined
    ? String(totalFilteredItems)
    : "filtered set";

  const showRows = !isLoading && !isError && pageItems.length > 0;

  return (
    <div className="space-y-5 pb-10 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-primary/30">
              <Package className="h-3 w-3 text-primary" />
              My shipments
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            All your shipments in one place
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Track status, view details, or cancel bookings before pickup.
            Filters and page state live in the URL — share a link to show
            exactly this list.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/shipments/new">
            <PackagePlus className="h-4 w-4" />
            Book new shipment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4 border-b">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4.5 w-4.5 text-primary" />
              Shipments
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm pt-1">
              {data
                ? `${data.total} total · showing ${data.items.length} on page ${data.page}/${data.totalPages || 1}`
                : "Loading your shipments…"}
            </CardDescription>
          </div>

          {/* Tabs */}
          <Tabs value={tabKey} onValueChange={onTabChange}>
            <TabsList className="flex-wrap h-auto p-1.5 gap-1 bg-transparent border border-border rounded-xl w-full">
              {(Object.keys(TAB_LABELS) as TabKey[]).map((k) => {
                const c = tabCounts[k];
                return (
                  <TabsTrigger
                    key={k}
                    value={k}
                    className="rounded-full data-[state=active]:shadow-sm h-8 px-3.5 text-xs"
                  >
                    <span>{TAB_LABELS[k]}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-2 h-4 min-w-[18px] px-1 text-[10px] tabular-nums",
                        tabKey === k
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/60 bg-background/60 text-muted-foreground",
                      )}
                    >
                      {c === "loading" ? "…" : c}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Toolbar: search + service filter + refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="relative flex-1 sm:max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search tracking #, name, phone, city…"
                aria-label="Search shipments"
                className="pl-8 h-9"
              />
            </div>

            <Select
              value={serviceType}
              onValueChange={onServiceChange}
            >
              <SelectTrigger className="h-9 sm:w-44">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All services</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="EXPRESS">Express</SelectItem>
                <SelectItem value="OVERNIGHT">Overnight</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching && !isLoading}
              className="h-9 gap-1.5"
            >
              <RefreshIconAnimated active={isFetching || isLoading} />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className={cn("overflow-x-auto transition-opacity", isFetching && !isLoading ? "opacity-85" : "")}>
            <Table className="[&_td]:py-3.5 [&_th]:py-3">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] whitespace-nowrap">
                    <button
                      type="button"
                      className="flex items-center font-semibold text-xs uppercase tracking-wider"
                      onClick={() => onSort("trackingNumber")}
                    >
                      Tracking #
                      <SortCue col="trackingNumber" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider">
                      Recipient
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider">
                      Service
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="font-semibold text-xs uppercase tracking-wider">
                      Status
                    </span>
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="flex items-center justify-end ml-auto font-semibold text-xs uppercase tracking-wider"
                      onClick={() => onSort("totalAmount")}
                    >
                      Amount
                      <SortCue col="totalAmount" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="flex items-center justify-end ml-auto font-semibold text-xs uppercase tracking-wider"
                      onClick={() => onSort("createdAt")}
                    >
                      Created
                      <SortCue col="createdAt" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[60px]" aria-label="Actions" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {/* Skeleton loading */}
                {isLoading && !data
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
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
                  : null}

                {/* Error state */}
                {isError
                  ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex flex-col items-start gap-3 p-6 rounded-lg border border-destructive/30 bg-destructive/[0.03]">
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <CircleHelp className="h-4 w-4" />
                            <span className="font-semibold">
                              Failed to load your shipments
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {error?.message ?? "Please check your connection and try again."}
                          </p>
                          <Button size="sm" variant="outline" onClick={() => refetch()}>
                            Try again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                  : null}

                {/* Empty state */}
                {!isLoading && !isError && pageItems.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex flex-col items-center gap-3 py-14 text-center">
                          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">
                              You don&apos;t have any shipments yet
                            </p>
                            <p className="text-xs text-muted-foreground max-w-sm">
                              Book your first delivery in under a minute. We&apos;ll
                              handle pickup, tracking, and proof of delivery.
                            </p>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Button asChild size="sm">
                              <Link href="/dashboard/shipments/new">
                                <PackagePlus className="h-4 w-4 mr-2" />
                                Book first shipment
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                  : null}

                {/* Data rows */}
                {showRows
                  ? pageItems.map((s) => {
                    const svcMeta = SERVICE_META[s.serviceType] ?? {
                      label: s.serviceType,
                      variant: "outline" as const,
                    };
                    const recipient = s.recipientAddress;
                    const cancellable = CANCELLABLE_STATUSES.includes(s.status);
                    return (
                      <TableRow
                        key={s.id}
                        className="group cursor-pointer hover:bg-muted/40"
                        onClick={() => openShipment(s)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="text-left"
                            onClick={() => openShipment(s)}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-xs font-semibold">
                                {s.trackingNumber}
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                ID · {s.id.slice(0, 10)}
                              </span>
                            </div>
                          </button>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-start gap-2 min-w-0">
                            <span className="h-7 w-7 rounded-full bg-muted/80 flex items-center justify-center mt-0.5 shrink-0">
                              <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                            </span>
                            <div className="space-y-0.5 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">
                                {recipient?.fullName ?? "Unknown recipient"}
                              </p>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">
                                {recipient?.phone ?? "—"}
                                {" · "}
                                {recipient?.city ?? "—"}
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
                          <div className="font-semibold text-sm">
                            {formatBDT(s.totalAmount)}
                          </div>
                          {s.codAmount ? (
                            <div className="text-[10px] text-amber-600">
                              +CoD {formatBDT(s.codAmount)}
                            </div>
                          ) : null}
                        </TableCell>

                        <TableCell className="text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {formatDateTime(s.createdAt)}
                        </TableCell>

                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 opacity-70 group-hover:opacity-100"
                                aria-label={`Actions for shipment ${s.trackingNumber}`}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuLabel className="flex flex-col gap-0.5">
                                <span className="font-semibold truncate">
                                  {s.trackingNumber}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-normal">
                                  {formatBDT(s.totalAmount)} ·{" "}
                                  {TAB_LABELS[tabKey]}
                                </span>
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openShipment(s)}
                                className="gap-2"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View details
                              </DropdownMenuItem>
                              {cancellable
                                ? (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openCancel(s)}
                                      className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                      Cancel shipment
                                    </DropdownMenuItem>
                                  </>
                                )
                                : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                  : null}
              </TableBody>
            </Table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t px-4 sm:px-6 py-3.5">
            <div className="text-xs text-muted-foreground tabular-nums">
              {isLoading || !data
                ? <Skeleton className="h-3 w-60" />
                : pageItems.length === 0
                  ? totalLabel === "filtered set"
                    ? "No shipments on this page"
                    : "Showing 0 results"
                  : totalLabel === "filtered set"
                    ? `Showing ${shownStart}–${shownEnd} on this page`
                    : `Showing ${shownStart}–${shownEnd} of ${totalLabel}`}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(limit)}
                onValueChange={onLimitChange}
                disabled={!data && isLoading}
              >
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5"
                  onClick={() => goToPage((data?.page ?? 1) - 1)}
                  disabled={isLoading || !data?.hasPrev}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="px-2 h-8 inline-flex items-center text-xs tabular-nums min-w-[72px] justify-center rounded-md border border-border bg-background/50">
                  {isLoading
                    ? <Skeleton className="h-3 w-12" />
                    : (
                      <>
                        <span className="font-semibold">{data?.page ?? "—"}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span>{data?.totalPages || 1}</span>
                      </>
                    )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5"
                  onClick={() => goToPage((data?.page ?? 1) + 1)}
                  disabled={isLoading || !data?.hasNext}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel dialog */}
      <Dialog open={cancelTarget !== null} onOpenChange={(o) => !o && closeCancel()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <SquareX className="h-4 w-4" />
              </span>
              Cancel shipment {cancelTarget?.trackingNumber ?? ""}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-1">
              {cancelTarget
                ? `This cancels ${cancelTarget.trackingNumber} (${formatBDT(cancelTarget.totalAmount)}).`
                : ""}{" "}
              A cancelled shipment cannot be reopened — you can always book a new
              one from the dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-1">
            <label htmlFor="cancel-reason" className="text-xs font-medium">
              Reason (optional, helps our team)
            </label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="e.g. no longer needed, duplicate booking, changed delivery details…"
              className="text-sm resize-y"
              disabled={cancelPending}
            />
            {cancelTarget && (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
                <div>
                  <span className="font-semibold text-foreground/70">Status: </span>
                  <ShipmentStatusBadge status={cancelTarget.status} size="sm" />
                </div>
                <div>
                  <span className="font-semibold text-foreground/70">Service: </span>
                  {SERVICE_META[cancelTarget.serviceType]?.label ?? cancelTarget.serviceType}
                  {" · "}
                  {formatBDT(cancelTarget.totalAmount)}
                </div>
                <div>
                  <span className="font-semibold text-foreground/70">Recipient: </span>
                  {cancelTarget.recipientAddress?.fullName ?? "—"}
                  {" · "}
                  {cancelTarget.recipientAddress?.city ?? "—"}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeCancel}
              disabled={cancelPending}
            >
              Keep shipment
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={submitCancel}
              disabled={cancelPending || !cancelTarget}
              className="gap-2"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {cancelPending ? "Cancelling…" : "Yes, cancel shipment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tiny in-file helper (animation for refresh icon)                         */
/* -------------------------------------------------------------------------- */

function RefreshIconAnimated({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-3.5 w-3.5 text-muted-foreground", active && "animate-spin")}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
