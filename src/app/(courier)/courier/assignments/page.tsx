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
  ArrowRight,
  CheckCircle2,
  CircleX,
  ClipboardList,
  Loader2,
  MapPin,
  RefreshCw,
  Truck,
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  getMyAssignments,
  acceptAssignment,
  rejectAssignment,
} from "@/lib/api/endpoints";
import type {
  AssignmentStatus,
  CourierAssignment,
  PaginatedData,
  RejectAssignmentReason,
} from "@/lib/api/types";
import { formatBDT, formatDateTime, cn } from "@/lib/utils";

/* ─── constants ─────────────────────────────────────────────────────────────── */

type TabFilter = "ALL" | AssignmentStatus;

const TABS: { value: TabFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "OFFERED", label: "Offered" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REJECTED", label: "Rejected" },
];

const REJECT_REASON_LABELS: Record<RejectAssignmentReason, string> = {
  VEHICLE_ISSUE: "Vehicle issue",
  PERSONAL_EMERGENCY: "Personal emergency",
  WRONG_ZONE: "Wrong zone",
  PACKAGE_CONFLICT: "Package conflict",
  OTHER: "Other",
};

const STATUS_BADGE: Record<
  AssignmentStatus,
  { label: string; className: string }
> = {
  OFFERED: {
    label: "Offered",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

/* ─── Reject reason schema ───────────────────────────────────────────────────── */

const rejectSchema = z.object({
  reason: z.enum(
    ["VEHICLE_ISSUE", "PERSONAL_EMERGENCY", "WRONG_ZONE", "PACKAGE_CONFLICT", "OTHER"],
    { message: "Please select a reason" },
  ),
  notes: z.string().trim().max(500).optional(),
});
type RejectFormValues = z.infer<typeof rejectSchema>;

/* ─── Reject dialog ─────────────────────────────────────────────────────────── */

interface RejectDialogProps {
  assignment: CourierAssignment | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string, values: RejectFormValues) => void;
  isPending: boolean;
}

function RejectDialog({
  assignment,
  open,
  onClose,
  onConfirm,
  isPending,
}: RejectDialogProps) {
  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: undefined, notes: "" },
  });

  // Reset form when dialog re-opens for a different assignment
  React.useEffect(() => {
    if (open) form.reset({ reason: undefined, notes: "" });
  }, [open, form]);

  const handleSubmit = (values: RejectFormValues) => {
    if (!assignment) return;
    onConfirm(assignment.id, values);
  };

  const tracking = assignment?.shipment?.trackingNumber ?? assignment?.id?.slice(0, 16) ?? "—";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-rose-500" />
            Reject assignment
          </DialogTitle>
          <DialogDescription>
            You are rejecting shipment{" "}
            <span className="font-mono font-semibold">{tracking}</span>. This
            action cannot be undone — the shipment will return to the unassigned
            queue.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(REJECT_REASON_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional context for dispatch…"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
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
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CircleX className="h-4 w-4 mr-2" />
                )}
                Confirm rejection
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Assignment status badge ────────────────────────────────────────────────── */

function AssignmentStatusBadge({ status }: { status: AssignmentStatus }) {
  const meta = STATUS_BADGE[status] ?? {
    label: status,
    className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  };
  return (
    <Badge
      variant="outline"
      className={cn("border text-[11px] font-medium gap-1.5", meta.className)}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </Badge>
  );
}

/* ─── Row skeleton ────────────────────────────────────────────────────────────── */

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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

export default function CourierAssignmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const tab = (searchParams.get("tab") as TabFilter) ?? "ALL";
  const page = Number(searchParams.get("page") ?? "1");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const queryKey = ["assignments", "my", { tab, page }];
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useApiQuery<PaginatedData<CourierAssignment>>({
    queryKey,
    queryFn: () =>
      getMyAssignments({
        status: tab === "ALL" ? undefined : tab,
        page,
        limit: 15,
      }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // ── Accept mutation ────────────────────────────────────────────────────────
  const [acceptingId, setAcceptingId] = React.useState<string | null>(null);

  const { mutate: doAccept } = useApiMutation({
    mutationFn: (id: string) => acceptAssignment(id),
    successToast: false,
    onMutate: (id) => setAcceptingId(id),
    onSuccess: (_data, id) => {
      setAcceptingId(null);
      toast.success("Assignment accepted!", {
        description: "Head to the pickup address.",
      });
      // Optimistic: flip status in cache
      qc.setQueryData<PaginatedData<CourierAssignment>>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((a) =>
            a.id === id ? { ...a, status: "ACCEPTED" as AssignmentStatus } : a,
          ),
        };
      });
      void qc.invalidateQueries({ queryKey: ["assignments", "my"] });
      void qc.invalidateQueries({ queryKey: ["courier", "me"] });
    },
    onError: () => setAcceptingId(null),
  });

  // ── Reject mutation ────────────────────────────────────────────────────────
  const [rejectTarget, setRejectTarget] = React.useState<CourierAssignment | null>(null);
  const [isRejectPending, setIsRejectPending] = React.useState(false);

  const { mutate: doReject } = useApiMutation({
    mutationFn: ({
      id,
      reason,
      notes,
    }: {
      id: string;
      reason: RejectAssignmentReason;
      notes?: string;
    }) => rejectAssignment(id, { reason, notes }),
    successToast: false,
    onMutate: () => setIsRejectPending(true),
    onSuccess: (_data, vars) => {
      setIsRejectPending(false);
      setRejectTarget(null);
      toast.success("Assignment rejected.", {
        description: "It has been returned to the unassigned queue.",
      });
      // Optimistic: flip status in cache
      qc.setQueryData<PaginatedData<CourierAssignment>>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((a) =>
            a.id === vars.id
              ? { ...a, status: "REJECTED" as AssignmentStatus }
              : a,
          ),
        };
      });
      void qc.invalidateQueries({ queryKey: ["assignments", "my"] });
      void qc.invalidateQueries({ queryKey: ["courier", "me"] });
    },
    onError: () => {
      setIsRejectPending(false);
      void qc.invalidateQueries({ queryKey: ["assignments", "my"] });
    },
  });

  const handleRejectConfirm = (id: string, values: RejectFormValues) => {
    doReject({ id, reason: values.reason as RejectAssignmentReason, notes: values.notes });
  };

  // ── Tab navigation ─────────────────────────────────────────────────────────
  const setTab = (next: TabFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "ALL") params.delete("tab");
    else params.set("tab", next);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.push(`${pathname}?${params.toString()}`);
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-500" />
            My Assignments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Accept offered shipments, then log pickup and complete deliveries.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh assignments"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)} className="mb-4">
        <TabsList className="flex-wrap h-auto gap-1">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Table card */}
      <Card>
        <CardHeader className="border-b py-3 px-4 flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              {tab === "ALL" ? "All assignments" : `${STATUS_BADGE[tab as AssignmentStatus]?.label ?? tab} assignments`}
            </CardTitle>
            {!isLoading && (
              <CardDescription className="text-xs">
                {total} total
              </CardDescription>
            )}
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table className="[&_td]:py-3.5 [&_th]:py-3">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px] whitespace-nowrap">Assignment ID</TableHead>
                <TableHead>Shipment / Route</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap text-right">Earning</TableHead>
                <TableHead className="whitespace-nowrap">Assigned</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-start gap-3 p-6 rounded-lg border border-destructive/30 bg-destructive/[0.03]">
                      <p className="text-sm font-semibold text-destructive">
                        Failed to load assignments
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
                  <TableCell colSpan={6}>
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">No assignments found</p>
                        <p className="text-xs text-muted-foreground max-w-xs">
                          {tab === "OFFERED"
                            ? "No new assignments have been offered yet. Make sure you're set as available."
                            : tab === "ALL"
                              ? "You have no assignments yet. Enable availability so dispatch can assign you jobs."
                              : `No ${tab.toLowerCase().replace("_", " ")} assignments.`}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((a) => {
                  const shipment = a.shipment;
                  const originCity = shipment?.senderAddress?.city;
                  const destCity = shipment?.recipientAddress?.city;
                  const isAccepting = acceptingId === a.id;
                  const canAccept = a.status === "OFFERED";
                  const canReject = a.status === "OFFERED";
                  const canView = ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(a.status);

                  return (
                    <TableRow key={a.id} className="group">
                      {/* Assignment ID */}
                      <TableCell>
                        <span className="font-mono text-xs font-semibold">
                          {a.id.slice(0, 16)}…
                        </span>
                      </TableCell>

                      {/* Shipment / route */}
                      <TableCell>
                        <div className="space-y-0.5">
                          {shipment?.trackingNumber && (
                            <p className="font-mono text-xs font-semibold text-foreground">
                              {shipment.trackingNumber}
                            </p>
                          )}
                          {(originCity || destCity) && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="text-indigo-600 dark:text-indigo-400">
                                {originCity ?? "—"}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {destCity ?? "—"}
                              </span>
                            </p>
                          )}
                          {shipment?.serviceType && (
                            <Badge variant="outline" className="text-[10px] mt-0.5">
                              {shipment.serviceType}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <AssignmentStatusBadge status={a.status} />
                      </TableCell>

                      {/* Earning */}
                      <TableCell className="text-right tabular-nums">
                        {(a as any).earnings != null ? (
                          <span className="font-semibold text-sm text-emerald-600">
                            {formatBDT((a as any).earnings)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Assigned at */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(a.assignedAt)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100">
                          {canAccept && (
                            <Button
                              size="sm"
                              className="h-8 gap-1.5"
                              onClick={() => doAccept(a.id)}
                              disabled={isAccepting}
                              aria-label={`Accept assignment ${a.id}`}
                            >
                              {isAccepting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Accept
                            </Button>
                          )}
                          {canReject && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 border-rose-500/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                              onClick={() => setRejectTarget(a)}
                              disabled={isAccepting}
                              aria-label={`Reject assignment ${a.id}`}
                            >
                              <CircleX className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          )}
                          {canView && (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5"
                            >
                              <Link href={`/courier/assignments/${a.id}`}>
                                {a.status === "IN_PROGRESS" ? (
                                  <>
                                    <Truck className="h-3.5 w-3.5" />
                                    Continue
                                  </>
                                ) : (
                                  <>
                                    View
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </>
                                )}
                              </Link>
                            </Button>
                          )}
                          {a.status === "COMPLETED" || a.status === "REJECTED" || a.status === "CANCELLED" ? (
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1.5 text-muted-foreground"
                            >
                              <Link href={`/courier/assignments/${a.id}`}>
                                View
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          ) : null}
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
              Page {page} of {totalPages} · {total} total
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

      {/* Reject dialog */}
      <RejectDialog
        assignment={rejectTarget}
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        isPending={isRejectPending}
      />
    </>
  );
}
