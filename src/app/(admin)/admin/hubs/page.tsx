"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  Loader2,
  PlusCircle,
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { getHubs, createHub, updateHub } from "@/lib/api/endpoints";
import type { Hub, PaginatedData } from "@/lib/api/types";
import { cn } from "@/lib/utils";

/* ─── Hub form schema ────────────────────────────────────────────────────────── */

const hubSchema = z.object({
  name: z.string().trim().min(2, "Name required").max(100),
  code: z.string().trim().min(2, "Code required").max(20).toUpperCase(),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  region: z.string().trim().max(100).optional().or(z.literal("")),
  zip: z.string().trim().max(20).optional().or(z.literal("")),
  operatingHours: z.string().trim().max(200).optional().or(z.literal("")),
  contactPhone: z.string().trim().max(30).optional().or(z.literal("")),
  isActive: z.boolean(),
});

const editHubSchema = hubSchema.partial().extend({
  isActive: z.boolean().optional(),
});

type HubFormValues = z.infer<typeof hubSchema>;
type EditHubFormValues = z.infer<typeof editHubSchema>;

/* ─── Create hub modal ───────────────────────────────────────────────────────── */

function CreateHubModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<HubFormValues>({
    resolver: zodResolver(hubSchema),
    defaultValues: {
      name: "", code: "", address: "", city: "", region: "",
      zip: "", operatingHours: "", contactPhone: "", isActive: true,
    },
  });

  React.useEffect(() => {
    if (open) form.reset({
      name: "", code: "", address: "", city: "", region: "",
      zip: "", operatingHours: "", contactPhone: "", isActive: true,
    });
  }, [open, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: HubFormValues) =>
      createHub({
        name: values.name,
        code: values.code,
        address: values.address || null,
        city: values.city || null,
        region: values.region || null,
        zip: values.zip || null,
        operatingHours: values.operatingHours || null,
        contactPhone: values.contactPhone || null,
        isActive: values.isActive,
      }),
    successToast: "Hub created successfully.",
    onSuccess: () => { onSuccess(); onClose(); },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            Create Hub
          </DialogTitle>
          <DialogDescription>Add a new sorting/delivery hub to the network.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Hub Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="e.g. Dhaka Central Hub" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="DHK-C"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input placeholder="Dhaka" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="region" render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl><Input placeholder="Dhaka Division" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="zip" render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP</FormLabel>
                  <FormControl><Input placeholder="1207" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input placeholder="Full street address" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="operatingHours" render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating Hours</FormLabel>
                  <FormControl><Input placeholder="8am–10pm daily" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl><Input placeholder="+8801XXXXXXXXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Switch checked={field.value} onCheckedChange={field.onChange} id="hub-active" />
                  <FormLabel htmlFor="hub-active" className="cursor-pointer text-sm font-medium">
                    Active hub
                  </FormLabel>
                </div>
              </FormItem>
            )} />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create hub
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Edit hub dialog ────────────────────────────────────────────────────────── */

function EditHubDialog({
  hub,
  open,
  onClose,
  onSuccess,
}: {
  hub: Hub | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<EditHubFormValues>({
    resolver: zodResolver(editHubSchema),
    defaultValues: {},
  });

  React.useEffect(() => {
    if (open && hub) {
      form.reset({
        name: hub.name,
        code: hub.code,
        address: hub.address ?? "",
        city: hub.city ?? "",
        region: hub.region ?? "",
        zip: hub.zip ?? "",
        operatingHours: hub.operatingHours ?? "",
        contactPhone: hub.contactPhone ?? "",
        isActive: hub.isActive,
      });
    }
  }, [open, hub, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: EditHubFormValues) =>
      updateHub(hub!.id, {
        name: values.name,
        code: values.code,
        address: values.address || null,
        city: values.city || null,
        region: values.region || null,
        zip: values.zip || null,
        operatingHours: values.operatingHours || null,
        contactPhone: values.contactPhone || null,
        isActive: values.isActive,
      }),
    successToast: "Hub updated.",
    onSuccess: () => { onSuccess(); onClose(); },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-500" />
            Edit Hub — {hub?.name}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Hub Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="region" render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="zip" render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="operatingHours" render={({ field }) => (
                <FormItem>
                  <FormLabel>Operating Hours</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contactPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Switch checked={field.value ?? false} onCheckedChange={field.onChange} id="hub-edit-active" />
                  <FormLabel htmlFor="hub-edit-active" className="cursor-pointer text-sm font-medium">
                    Active hub
                  </FormLabel>
                </div>
              </FormItem>
            )} />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function AdminHubsPage() {
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<Hub | null>(null);
  const [page, setPage] = React.useState(1);

  const queryKey = ["admin", "hubs", { page }];

  const { data, isLoading, isError, refetch, isFetching } =
    useApiQuery<PaginatedData<Hub>>({
      queryKey,
      queryFn: () => getHubs({ page, limit: 20, status: "all" }),
      staleTime: 60_000,
    });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin", "hubs"] });

  /* inline isActive toggle */
  const { mutate: toggleActive, variables: togglingId } = useApiMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateHub(id, { isActive }),
    successToast: false,
    onSuccess: () => invalidate(),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500" />
            Hubs Network
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage sorting/delivery hubs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isFetching && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create hub
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b py-3 px-4 flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">All Hubs</CardTitle>
            <CardDescription className="text-xs">
              {isLoading ? "Loading…" : `${total} hubs`}
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
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="whitespace-nowrap">Operating Hours</TableHead>
                <TableHead className="whitespace-nowrap">Contact</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="p-6 text-center space-y-2">
                      <p className="text-sm font-semibold text-destructive">Failed to load hubs</p>
                      <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="py-14 text-center space-y-2">
                      <Building2 className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm font-semibold">No hubs yet</p>
                      <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create first hub
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((h) => {
                  const isToggling = (togglingId as { id?: string } | undefined)?.id === h.id;
                  return (
                    <TableRow key={h.id} className="group">
                      <TableCell>
                        <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">{h.code}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{h.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{h.city ?? "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{h.region ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{h.operatingHours ?? "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{h.contactPhone ?? "—"}</TableCell>
                      <TableCell className="text-center">
                        {isToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                        ) : (
                          <Switch
                            checked={h.isActive}
                            onCheckedChange={(checked) => toggleActive({ id: h.id, isActive: checked })}
                            aria-label={`Toggle ${h.name} active`}
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs opacity-70 group-hover:opacity-100"
                          onClick={() => setEditTarget(h)}
                        >
                          Edit
                        </Button>
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
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <CreateHubModal open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={invalidate} />
      <EditHubDialog hub={editTarget} open={!!editTarget} onClose={() => setEditTarget(null)} onSuccess={invalidate} />
    </>
  );
}
