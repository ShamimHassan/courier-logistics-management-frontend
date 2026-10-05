"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Filter,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  Truck,
  UserCheck,
  X,
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  getShipments,
  getAdminUsers,
  assignShipmentCourier,
  transitionShipmentStatus,
} from "@/lib/api/endpoints";
import type {
  PaginatedData,
  Shipment,
  ShipmentStatus,
  ServiceType,
  User,
} from "@/lib/api/types";
import { cn, formatBDT, formatDateTime } from "@/lib/utils";

/* ─── Status options for filter ─────────────────────────────────────────────── */

const STATUS_OPTIONS: { value: ShipmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "ASSIGNMENT_PENDING", label: "Awaiting Courier" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "DELIVERY_FAILED", label: "Delivery Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "PAYMENT_PENDING", label: "Payment Pending" },
];

const SERVICE_OPTIONS: { value: ServiceType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All services" },
  { value: "STANDARD", label: "Standard" },
  { value: "EXPRESS", label: "Express" },
  { value: "OVERNIGHT", label: "Overnight" },
];

/* ─── Assign courier schema ──────────────────────────────────────────────────── */

const assignSchema = z.object({
  courierId: z.string().min(1, "Please select a courier"),
});
type AssignFormValues = z.infer<typeof assignSchema>;

/* ─── Admin status override schema ──────────────────────────────────────────── */

const ADMIN_OVERRIDE_TARGETS: Array<{
  value: "AT_ORIGIN_HUB" | "IN_TRANSIT" | "AT_DESTINATION_HUB" | "OUT_FOR_DELIVERY";
  label: string;
}> = [
  { value: "AT_ORIGIN_HUB", label: "At Origin Hub" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "AT_DESTINATION_HUB", label: "At Destination Hub" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
];

const overrideSchema = z.object({
  status: z.enum([
    "AT_ORIGIN_HUB",
    "IN_TRANSIT",
    "AT_DESTINATION_HUB",
    "OUT_FOR_DELIVERY",
  ] as const, { message: "Select a target status" }),
  adminReason: z
    .string()
    .trim()
    .min(3, "Admin reason is required (min 3 characters)")
    .max(500),
  location: z.string().trim().max(200).optional(),
});
type OverrideFormValues = z.infer<typeof overrideSchema>;

/* ─── Assign courier modal ───────────────────────────────────────────────────── */

function AssignCourierModal({
  shipment,
  open,
  onClose,
  onSuccess,
}: {
  shipment: Shipment | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: { courierId: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ courierId: "" });
  }, [open, form]);

  // Fetch available couriers
  const { data: couriersData, isLoading: couriersLoading } =
    useApiQuery<PaginatedData<User>>({
      queryKey: ["admin", "users", { role: "COURIER", status: "ACTIVE", page: 1, limit: 100 }],
      queryFn: () =>
        getAdminUsers({ role: "COURIER", status: "ACTIVE", page: 1, limit: 100 }),
      enabled: open,
      staleTime: 2 * 60_000,
    });

  const couriers = couriersData?.items ?? [];

  const { mutate, isPending } = useApiMutation({
    mutationFn: ({ id, courierId }: { id: string; courierId: string }) =>
      assignShipmentCourier(id, { courierId }),
    successToast: false,
    onSuccess: () => {
      toast.success("Courier assigned successfully.");
      onSuccess();
      onClose();
    },
  });

  const onSubmit = (values: AssignFormValues) => {
    if (!shipment) return;
    mutate({ id: shipment.id, courierId: values.courierId });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-indigo-500" />
            Assign Courier
          </DialogTitle>
          <DialogDescription>
            Assign an available courier to shipment{" "}
            <span className="font-mono font-semibold">
              {shipment?.trackingNumber}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">
            <FormField
              control={form.control}
              name="courierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Courier <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={couriersLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            couriersLoading
                              ? "Loading couriers…"
                              : couriers.length === 0
                                ? "No active couriers found"
                                : "Select a courier"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {couriers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{c.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {c.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[11px]">
                    Only ACTIVE couriers are shown. Zone compatibility is not
                    auto-checked.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || couriersLoading || couriers.length === 0}
              >
                {isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Truck className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Admin status override dialog ──────────────────────────────────────────── */

function StatusOverrideDialog({
  shipment,
  open,
  onClose,
  onSuccess,
}: {
  shipment: Shipment | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<OverrideFormValues>({
    resolver: zodResolver(overrideSchema),
    defaultValues: {
      status: undefined as unknown as "AT_ORIGIN_HUB",
      adminReason: "",
      location: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        status: undefined as unknown as "AT_ORIGIN_HUB",
        adminReason: "",
        location: "",
      });
    }
  }, [open, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: OverrideFormValues;
    }) =>
      transitionShipmentStatus(id, {
        status: values.status,
        location: values.location || undefined,
        adminReason: values.adminReason,
      }),
    successToast: false,
    onSuccess: () => {
      toast.success("Shipment status overridden by admin.");
      onSuccess();
      onClose();
    },
  });

  const onSubmit = (values: OverrideFormValues) => {
    if (!shipment) return;
    mutate({ id: shipment.id, values });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Admin Status Override
          </DialogTitle>
          <DialogDescription>
            Force the status of{" "}
            <span className="font-mono font-semibold">
              {shipment?.trackingNumber}
            </span>{" "}
            — current:{" "}
            <span className="font-semibold">{shipment?.status}</span>. An admin
            reason is required and will be recorded in the audit log.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">
            {/* Target status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New Status <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target status…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ADMIN_OVERRIDE_TARGETS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Admin reason (required) */}
            <FormField
              control={form.control}
              name="adminReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Admin Reason <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why this status override is necessary…"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Required. Recorded in audit logs with your admin account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Current location of the shipment…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isPending}
              >
                {isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Override status
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Row skeleton ────────────────────────────────────────────────────────────── */

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
      <TableCell>
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3.5 w-44" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell>
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function AdminShipmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  /* ── URL state ── */
  const q = searchParams.get("q") ?? "";
  const status = (searchParams.get("status") ?? "ALL") as ShipmentStatus | "ALL";
  const serviceType = (searchParams.get("service") ?? "ALL") as ServiceType | "ALL";
  const page = Number(searchParams.get("page") ?? "1");
  const PAGE_SIZE = 20;

  /* ── Local search input (debounced) ── */
  const [searchInput, setSearchInput] = React.useState(q);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushParams = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v && v !== "ALL") next.set(k, v);
        else next.delete(k);
      }
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ q: value || undefined });
    }, 350);
  };

  React.useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  };

  /* ── Data ── */
  const queryKey = ["admin", "shipments", { q, status, serviceType, page }];

  const { data, isLoading, isError, error, refetch, isFetching } =
    useApiQuery<PaginatedData<Shipment>>({
      queryKey,
      queryFn: () =>
        getShipments({
          search: q || undefined,
          status: status !== "ALL" ? status : undefined,
          serviceType: serviceType !== "ALL" ? serviceType : undefined,
          page,
          limit: PAGE_SIZE,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    });

  const invalidate = React.useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["admin", "shipments"] });
    void qc.invalidateQueries({ queryKey: ["admin", "assignments", "unassigned"] });
    void qc.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
  }, [qc]);

  /* ── Dialog state ── */
  const [assignTarget, setAssignTarget] = React.useState<Shipment | null>(null);
  const [overrideTarget, setOverrideTarget] = React.useState<Shipment | null>(null);

  /* ── Derived ── */
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = !!(q || (status !== "ALL") || (serviceType !== "ALL"));

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-indigo-500" />
            Admin Shipments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search, filter, assign couriers and override statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Filters bar ── */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search tracking #, name, city…"
                className="pl-8 h-9"
                aria-label="Search shipments"
              />
            </div>

            {/* Status filter */}
            <Select
              value={status}
              onValueChange={(v) => pushParams({ status: v })}
            >
              <SelectTrigger className="w-[180px] h-9">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Service filter */}
            <Select
              value={serviceType}
              onValueChange={(v) => pushParams({ service: v })}
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear */}
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => {
                  setSearchInput("");
                  pushParams({
                    q: undefined,
                    status: undefined,
                    service: undefined,
                  });
                }}
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        <CardHeader className="border-b py-3 px-4 flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">Shipments</CardTitle>
            <CardDescription className="text-xs">
              {isLoading ? "Loading…" : `${total.toLocaleString()} total`}
            </CardDescription>
          </div>
          {data && totalPages > 1 && (
            <Badge variant="outline" className="text-[11px]">
              Page {page} / {totalPages}
            </Badge>
          )}
        </CardHeader>

        <div className="overflow-x-auto">
          <Table className="[&_td]:py-3.5 [&_th]:py-3">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Tracking #</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Created</TableHead>
                <TableHead className="text-right w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-start gap-3 p-6 rounded-lg border border-destructive/30 bg-destructive/[0.03]">
                      <p className="text-sm font-semibold text-destructive">
                        Failed to load shipments
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(error as Error)?.message ?? "Check your connection."}
                      </p>
                      <Button size="sm" variant="outline" onClick={() => refetch()}>
                        Try again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                        <PackageCheck className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">No shipments found</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          {hasFilters
                            ? "No shipments match your filters. Try clearing them."
                            : "No shipments in the system yet."}
                        </p>
                      </div>
                      {hasFilters && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSearchInput("");
                            pushParams({
                              q: undefined,
                              status: undefined,
                              service: undefined,
                            });
                          }}
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((s) => {
                  const isUnassigned =
                    s.status === "ASSIGNMENT_PENDING" || s.status === "CONFIRMED";
                  const canOverride = [
                    "PICKED_UP",
                    "AT_ORIGIN_HUB",
                    "IN_TRANSIT",
                    "AT_DESTINATION_HUB",
                  ].includes(s.status);

                  return (
                    <TableRow key={s.id} className="group">
                      {/* Tracking */}
                      <TableCell>
                        <span className="font-mono text-xs font-semibold">
                          {s.trackingNumber}
                        </span>
                      </TableCell>

                      {/* Route */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <p className="text-xs">
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {s.senderAddress?.city ?? "?"}
                            </span>
                            <span className="text-muted-foreground mx-1">→</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {s.recipientAddress?.city ?? "?"}
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {s.senderAddress?.fullName?.split(" ")[0] ?? "?"} →{" "}
                            {s.recipientAddress?.fullName?.split(" ")[0] ?? "?"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <ShipmentStatusBadge status={s.status} />
                      </TableCell>

                      {/* Service */}
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {s.serviceType}
                        </Badge>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right tabular-nums text-sm font-semibold">
                        {formatBDT(s.totalAmount)}
                      </TableCell>

                      {/* Created */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(s.createdAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100">
                          {isUnassigned && (
                            <Button
                              size="sm"
                              className="h-8 gap-1.5 text-xs"
                              onClick={() => setAssignTarget(s)}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Assign
                            </Button>
                          )}
                          {canOverride && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 text-xs border-amber-400/40 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950"
                              onClick={() => setOverrideTarget(s)}
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Override
                            </Button>
                          )}
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1.5 text-xs"
                          >
                            <Link href={`/dashboard/shipments/${s.id}`} target="_blank">
                              View
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {total.toLocaleString()} shipments
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

      {/* ── Dialogs ── */}
      <AssignCourierModal
        shipment={assignTarget}
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        onSuccess={invalidate}
      />

      <StatusOverrideDialog
        shipment={overrideTarget}
        open={!!overrideTarget}
        onClose={() => setOverrideTarget(null)}
        onSuccess={invalidate}
      />
    </>
  );
}
