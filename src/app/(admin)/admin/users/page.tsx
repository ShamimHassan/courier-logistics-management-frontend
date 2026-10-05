"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users2,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { getAdminUsers, updateUserStatus, updateUserRole } from "@/lib/api/endpoints";
import type { PaginatedData, Role, User, UserStatus } from "@/lib/api/types";
import { cn, formatDateTime } from "@/lib/utils";

/* ─── Role / Status badge meta ──────────────────────────────────────────────── */

const ROLE_META: Record<Role, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className: "border-purple-400/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  COURIER: {
    label: "Courier",
    className: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  CUSTOMER: {
    label: "Customer",
    className: "border-indigo-400/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
};

const STATUS_META: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  PENDING_APPROVAL: {
    label: "Pending",
    className: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

/* ─── Zod schemas (match backend exactly) ───────────────────────────────────── */

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"], { message: "Select a status" }),
  reason: z.string().trim().max(500).optional(),
});

const roleSchema = z.object({
  role: z.enum(["ADMIN", "COURIER", "CUSTOMER"], { message: "Select a role" }),
  reason: z.string().trim().min(3, "Reason required (min 3 characters)").max(500),
});

type StatusFormValues = z.infer<typeof statusSchema>;
type RoleFormValues = z.infer<typeof roleSchema>;

/* ─── Status toggle dialog ───────────────────────────────────────────────────── */

function StatusDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const nextStatus: UserStatus = user?.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  const form = useForm<StatusFormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: { status: nextStatus, reason: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ status: nextStatus, reason: "" });
  }, [open, nextStatus, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: ({ id, values }: { id: string; values: StatusFormValues }) =>
      updateUserStatus(id, { status: values.status, reason: values.reason || undefined }),
    successToast: false,
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" />
            {nextStatus === "SUSPENDED" ? "Suspend User" : "Activate User"}
          </DialogTitle>
          <DialogDescription>
            Change status of <span className="font-semibold">{user?.name}</span> ({user?.email}) to{" "}
            <span className="font-semibold">{nextStatus}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              user && mutate({ id: user.id, values: v }),
            )}
            className="space-y-4 pt-1"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Reason for this status change…"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant={nextStatus === "SUSPENDED" ? "destructive" : "default"}
                disabled={isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {nextStatus === "SUSPENDED" ? "Suspend" : "Activate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Role change dialog ─────────────────────────────────────────────────────── */

function RoleDialog({
  user,
  open,
  onClose,
  onSuccess,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { role: user?.role ?? "CUSTOMER", reason: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ role: user?.role ?? "CUSTOMER", reason: "" });
  }, [open, user, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: ({ id, values }: { id: string; values: RoleFormValues }) =>
      updateUserRole(id, { role: values.role as Role, reason: values.reason }),
    successToast: false,
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-indigo-500" />
            Change Role
          </DialogTitle>
          <DialogDescription>
            Update the role for <span className="font-semibold">{user?.name}</span>. A reason is
            required and will be audit-logged.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              user && mutate({ id: user.id, values: v }),
            )}
            className="space-y-4 pt-1"
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Role <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(["ADMIN", "COURIER", "CUSTOMER"] as Role[]).map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_META[r].label}
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why this role change is necessary…"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Recorded in the audit log with your admin account.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update role
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
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-44" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell>
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </TableCell>
    </TableRow>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const q = searchParams.get("q") ?? "";
  const roleFilter = (searchParams.get("role") ?? "ALL") as Role | "ALL";
  const statusFilter = (searchParams.get("status") ?? "ALL") as UserStatus | "ALL";
  const page = Number(searchParams.get("page") ?? "1");

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
    debounceRef.current = setTimeout(() => pushParams({ q: value || undefined }), 350);
  };

  React.useEffect(() => { setSearchInput(q); }, [q]);

  const setPage = (n: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(n));
    router.push(`${pathname}?${p.toString()}`);
  };

  const queryKey = ["admin", "users", { q, role: roleFilter, status: statusFilter, page }];

  const { data, isLoading, isError, error, refetch, isFetching } =
    useApiQuery<PaginatedData<User>>({
      queryKey,
      queryFn: () =>
        getAdminUsers({
          search: q || undefined,
          role: roleFilter !== "ALL" ? (roleFilter as Role) : undefined,
          status: statusFilter !== "ALL" ? statusFilter : undefined,
          page,
          limit: 20,
        }),
      staleTime: 30_000,
    });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const [statusTarget, setStatusTarget] = React.useState<User | null>(null);
  const [roleTarget, setRoleTarget] = React.useState<User | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasFilters = !!(q || roleFilter !== "ALL" || statusFilter !== "ALL");

  return (
    <>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users2 className="h-5 w-5 text-indigo-500" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Activate, suspend, and change user roles.
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
          <div className="flex flex-col sm:flex-row gap-3 items-end flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search name, email…"
                className="pl-8 h-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => pushParams({ role: v })}>
              <SelectTrigger className="w-[150px] h-9">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="COURIER">Courier</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => pushParams({ status: v })}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground"
                onClick={() => { setSearchInput(""); pushParams({ q: undefined, role: undefined, status: undefined }); }}>
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
            <CardTitle className="text-sm font-semibold">Users</CardTitle>
            <CardDescription className="text-xs">
              {isLoading ? "Loading…" : `${total.toLocaleString()} total`}
            </CardDescription>
          </div>
          {totalPages > 1 && (
            <Badge variant="outline" className="text-[11px]">Page {page} / {totalPages}</Badge>
          )}
        </CardHeader>

        <div className="overflow-x-auto">
          <Table className="[&_td]:py-3 [&_th]:py-3">
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="whitespace-nowrap">Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="whitespace-nowrap">Joined</TableHead>
                <TableHead className="text-right w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => <RowSkeleton key={i} />)
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="p-6 space-y-2">
                      <p className="text-sm font-semibold text-destructive">Failed to load users</p>
                      <p className="text-xs text-muted-foreground">{(error as Error)?.message}</p>
                      <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="py-14 text-center space-y-2">
                      <Users2 className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm font-semibold">No users found</p>
                      <p className="text-xs text-muted-foreground">
                        {hasFilters ? "Try clearing your filters." : "No users in the system yet."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((u) => {
                  const roleMeta = ROLE_META[u.role];
                  const statusMeta = STATUS_META[u.status];
                  return (
                    <TableRow key={u.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="text-xs font-bold bg-linear-to-br from-indigo-500 to-purple-500 text-white">
                              {initialsOf(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] font-medium border", roleMeta.className)}>
                          {roleMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] font-medium border", statusMeta.className)}>
                          {statusMeta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {u.createdAt ? formatDateTime(u.createdAt) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="outline"
                            className={cn(
                              "h-8 text-xs gap-1",
                              u.status === "ACTIVE"
                                ? "border-rose-400/40 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                                : "border-emerald-400/40 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950",
                            )}
                            onClick={() => setStatusTarget(u)}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1"
                            onClick={() => setRoleTarget(u)}
                          >
                            <UserCog className="h-3.5 w-3.5" />
                            Role
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages} · {total} total</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <StatusDialog user={statusTarget} open={!!statusTarget} onClose={() => setStatusTarget(null)} onSuccess={invalidate} />
      <RoleDialog user={roleTarget} open={!!roleTarget} onClose={() => setRoleTarget(null)} onSuccess={invalidate} />
    </>
  );
}
