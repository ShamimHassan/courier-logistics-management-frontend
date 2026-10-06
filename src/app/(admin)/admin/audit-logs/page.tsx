"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  History,
  RefreshCw,
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

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getAuditLogs } from "@/lib/api/endpoints";
import type { AuditLog } from "@/lib/api/types";
import { cn, formatDateTime } from "@/lib/utils";

/* ─── Backend returns this shape ─────────────────────────────────────────────── */

interface AuditLogEntry {
  id: string;
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  reason?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  requestId?: string | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string } | null;
}

interface AuditLogResponse {
  logs: AuditLogEntry[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

/* ─── Action badge ───────────────────────────────────────────────────────────── */

const ACTION_COLOURS: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-700 border-emerald-400/30",
  UPDATE: "bg-indigo-500/10 text-indigo-700 border-indigo-400/30",
  DELETE: "bg-rose-500/10 text-rose-700 border-rose-400/30",
  CANCEL: "bg-amber-500/10 text-amber-700 border-amber-400/30",
  ASSIGN: "bg-sky-500/10 text-sky-700 border-sky-400/30",
  REFUND: "bg-violet-500/10 text-violet-700 border-violet-400/30",
  LOGIN: "bg-slate-500/10 text-slate-600 border-slate-400/30",
  LOGOUT: "bg-slate-500/10 text-slate-600 border-slate-400/30",
  STATUS_CHANGE: "bg-blue-500/10 text-blue-700 border-blue-400/30",
};

function ActionBadge({ action }: { action: string }) {
  const cls =
    ACTION_COLOURS[action] ??
    ACTION_COLOURS[action.split("_")[0]] ??
    "bg-slate-500/10 text-slate-600 border-slate-400/30";
  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium border", cls)}>
      {action.replace(/_/g, " ")}
    </Badge>
  );
}

/* ─── JSON diff viewer ───────────────────────────────────────────────────────── */

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  if (data === null || data === undefined) return null;
  return (
    <div className="flex-1 min-w-0 space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <pre className="text-[11px] rounded-lg bg-muted/50 border p-3 overflow-x-auto text-foreground/80 max-h-40">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/* ─── Expanded row details ───────────────────────────────────────────────────── */

function ExpandedDetails({ log }: { log: AuditLogEntry }) {
  const hasOld = log.oldValues !== null && log.oldValues !== undefined;
  const hasNew = log.newValues !== null && log.newValues !== undefined;
  const hasReason = !!log.reason;

  return (
    <div className="px-4 pb-4 pt-2 border-t bg-muted/20">
      <div className="space-y-3">
        {hasReason && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              Reason
            </p>
            <p className="text-sm text-muted-foreground italic">
              &ldquo;{log.reason}&rdquo;
            </p>
          </div>
        )}
        {(hasOld || hasNew) && (
          <div className="flex gap-3 flex-col sm:flex-row">
            {hasOld && <JsonBlock label="Previous (old)" data={log.oldValues} />}
            {hasNew && <JsonBlock label="New values" data={log.newValues} />}
          </div>
        )}
        {!hasOld && !hasNew && !hasReason && (
          <p className="text-xs text-muted-foreground">No additional details.</p>
        )}
        {log.requestId && (
          <p className="text-[11px] text-muted-foreground font-mono">
            Request ID: {log.requestId}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Row skeleton ────────────────────────────────────────────────────────────── */

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
      <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    </TableRow>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const entityType = searchParams.get("entityType") ?? "";
  const action = searchParams.get("action") ?? "";
  const fromDate = searchParams.get("from") ?? "";
  const toDate = searchParams.get("to") ?? "";
  const page = Number(searchParams.get("page") ?? "1");

  /* Local filter state */
  const [entityTypeInput, setEntityTypeInput] = React.useState(entityType);
  const [actionInput, setActionInput] = React.useState(action);
  const [fromInput, setFromInput] = React.useState(fromDate);
  const [toInput, setToInput] = React.useState(toDate);

  React.useEffect(() => {
    setEntityTypeInput(entityType);
    setActionInput(action);
    setFromInput(fromDate);
    setToInput(toDate);
  }, [entityType, action, fromDate, toDate]);

  const pushParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  };

  const applyFilters = () => {
    pushParams({
      entityType: entityTypeInput || undefined,
      action: actionInput || undefined,
      from: fromInput || undefined,
      to: toInput || undefined,
    });
  };

  const clearFilters = () => {
    setEntityTypeInput("");
    setActionInput("");
    setFromInput("");
    setToInput("");
    pushParams({ entityType: undefined, action: undefined, from: undefined, to: undefined });
  };

  const hasFilters = !!(entityType || action || fromDate || toDate);

  const setPage = (n: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(n));
    router.push(`${pathname}?${p.toString()}`);
  };

  /* ── Fetch — cast to our local response shape ── */
  const queryKey = ["admin", "audit-logs", { entityType, action, fromDate, toDate, page }];

  const { data, isLoading, isError, error, refetch, isFetching } = useApiQuery<AuditLogResponse>({
    queryKey,
    queryFn: () =>
      getAuditLogs({
        entityType: entityType || undefined,
        action: action || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit: 20,
      }) as unknown as Promise<AuditLogResponse>,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const logs = data?.logs ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  /* ── Expand/collapse rows ── */
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-5 w-5 text-indigo-500" />
            Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All platform mutations — filter by entity type, action or date range.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Entity Type</Label>
              <Input
                value={entityTypeInput}
                onChange={(e) => setEntityTypeInput(e.target.value)}
                placeholder="e.g. Shipment"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Action</Label>
              <Input
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="e.g. CREATE"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">From Date</Label>
              <Input
                type="date"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">To Date</Label>
              <Input
                type="date"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={applyFilters} disabled={isFetching}>
              Apply filters
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clearFilters}>
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="border-b py-3 px-4 flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">Audit Log Entries</CardTitle>
            <CardDescription className="text-xs">
              {isLoading ? "Loading…" : `${(meta?.totalCount ?? 0).toLocaleString()} total · click a row to expand details`}
            </CardDescription>
          </div>
          {totalPages > 1 && (
            <Badge variant="outline" className="text-[11px]">
              Page {page} / {totalPages}
            </Badge>
          )}
        </CardHeader>

        <div className="overflow-x-auto">
          <Table className="[&_td]:py-3 [&_th]:py-3">
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="whitespace-nowrap">Entity Type</TableHead>
                <TableHead className="whitespace-nowrap">Entity ID</TableHead>
                <TableHead>Summary / Reason</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => <RowSkeleton key={i} />)
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="p-6 space-y-2">
                      <p className="text-sm font-semibold text-destructive">Failed to load audit logs</p>
                      <p className="text-xs text-muted-foreground">{(error as Error)?.message}</p>
                      <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="py-14 text-center space-y-2">
                      <History className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm font-semibold">No audit logs found</p>
                      <p className="text-xs text-muted-foreground">
                        {hasFilters ? "Try clearing your filters." : "No mutations have been logged yet."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <TableRow
                        className={cn(
                          "cursor-pointer hover:bg-muted/30 transition",
                          isExpanded && "bg-muted/20",
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      >
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          {log.actor ? (
                            <div>
                              <p className="text-xs font-semibold">{log.actor.name}</p>
                              <p className="text-[11px] text-muted-foreground">{log.actor.email}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <ActionBadge action={log.action} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.entityType ?? "—"}
                        </TableCell>
                        <TableCell>
                          {log.entityId ? (
                            <span className="font-mono text-[11px] bg-muted rounded px-1.5 py-0.5">
                              {log.entityId.slice(0, 12)}…
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">
                          {log.reason ?? "—"}
                        </TableCell>
                        <TableCell>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <ExpandedDetails log={log} />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages} · {meta?.totalCount?.toLocaleString()} total
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
