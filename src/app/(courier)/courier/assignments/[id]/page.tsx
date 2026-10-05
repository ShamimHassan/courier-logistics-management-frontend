"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  Building2,
  Camera,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  RefreshCw,
  Truck,
  UserRound,
  Warehouse,
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  getShipment,
  getShipmentTracking,
  getHubs,
  markShipmentPickedUp,
  transitionShipmentStatus,
} from "@/lib/api/endpoints";
import type {
  Hub,
  PaginatedData,
  PickupCondition,
  Shipment,
  ShipmentStatus,
  TrackingEvent,
} from "@/lib/api/types";
import { cn, formatBDT, formatDateTime } from "@/lib/utils";

/* ─── Tracking timeline icon/colour maps ────────────────────────────────────── */

const EVENT_ICON: Partial<Record<ShipmentStatus, LucideIcon>> & {
  default: LucideIcon;
} = {
  DRAFT: Package,
  CONFIRMED: PackageCheck,
  ASSIGNMENT_PENDING: UserRound,
  ASSIGNED: UserRound,
  PICKED_UP: CarFront,
  AT_ORIGIN_HUB: Warehouse,
  IN_TRANSIT: Truck,
  AT_DESTINATION_HUB: Warehouse,
  OUT_FOR_DELIVERY: MapPin,
  DELIVERY_FAILED: AlertTriangle,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
  default: Clock,
};

const EVENT_TONE: Partial<Record<ShipmentStatus, string>> & {
  default: string;
} = {
  DELIVERED: "border-emerald-400 bg-emerald-500 text-white",
  OUT_FOR_DELIVERY: "border-emerald-300 bg-emerald-100 text-emerald-700",
  IN_TRANSIT: "border-indigo-300 bg-indigo-100 text-indigo-700",
  AT_ORIGIN_HUB: "border-primary/30 bg-primary/10 text-primary",
  AT_DESTINATION_HUB: "border-primary/30 bg-primary/10 text-primary",
  PICKED_UP: "border-cyan-300 bg-cyan-100 text-cyan-700",
  CANCELLED: "border-destructive/30 bg-destructive/10 text-destructive",
  DELIVERY_FAILED:
    "border-destructive/30 bg-destructive/10 text-destructive",
  default: "border-slate-300 bg-slate-100 text-slate-600",
};

/* ─── Status-machine: what courier can do given current status ─────────────── */

type TransitionTarget =
  | "AT_ORIGIN_HUB"
  | "IN_TRANSIT"
  | "AT_DESTINATION_HUB"
  | "OUT_FOR_DELIVERY";

interface TransitionDef {
  from: ShipmentStatus;
  to: TransitionTarget;
  label: string;
  needsHub: boolean;
  description: string;
  icon: LucideIcon;
}

const TRANSITIONS: TransitionDef[] = [
  {
    from: "PICKED_UP",
    to: "AT_ORIGIN_HUB",
    label: "Scan at Origin Hub",
    needsHub: true,
    description: "Mark parcel as scanned into the origin sorting hub.",
    icon: Warehouse,
  },
  {
    from: "AT_ORIGIN_HUB",
    to: "IN_TRANSIT",
    label: "Start Transit",
    needsHub: false,
    description: "Mark parcel as loaded onto transport — in transit.",
    icon: Truck,
  },
  {
    from: "IN_TRANSIT",
    to: "AT_DESTINATION_HUB",
    label: "Scan at Destination Hub",
    needsHub: true,
    description: "Mark parcel as arrived and scanned at destination hub.",
    icon: Warehouse,
  },
  {
    from: "AT_DESTINATION_HUB",
    to: "OUT_FOR_DELIVERY",
    label: "Out For Delivery",
    needsHub: false,
    description: "Mark parcel as loaded for final delivery to recipient.",
    icon: MapPin,
  },
];

/* ─── Pickup dialog ─────────────────────────────────────────────────────────── */

const pickupFormSchema = z.object({
  condition: z.enum(["GOOD", "DAMAGED", "PACKAGING_WORN"], {
    message: "Please select a condition",
  }),
  notes: z.string().trim().max(500).optional(),
  photoUrl: z
    .string()
    .trim()
    .url("Photo URL must be a valid URL")
    .optional()
    .or(z.literal("")),
});
type PickupFormValues = z.infer<typeof pickupFormSchema>;

const PICKUP_CONDITION_META: Record<
  PickupCondition,
  { label: string; description: string; colour: string }
> = {
  GOOD: {
    label: "Good",
    description: "Parcel is intact with no visible damage",
    colour: "border-emerald-400 text-emerald-700",
  },
  DAMAGED: {
    label: "Damaged",
    description: "Parcel shows visible damage or breakage",
    colour: "border-rose-400 text-rose-700",
  },
  PACKAGING_WORN: {
    label: "Packaging Worn",
    description: "Outer packaging is worn but contents appear intact",
    colour: "border-amber-400 text-amber-700",
  },
};

function PickupDialog({
  shipmentId,
  open,
  onClose,
  onSuccess,
}: {
  shipmentId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<PickupFormValues>({
    resolver: zodResolver(pickupFormSchema),
    defaultValues: { condition: undefined, notes: "", photoUrl: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ condition: undefined, notes: "", photoUrl: "" });
  }, [open, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: PickupFormValues) =>
      markShipmentPickedUp(shipmentId, {
        condition: values.condition as PickupCondition,
        notes: values.notes || undefined,
        photoUrl: values.photoUrl || undefined,
      }),
    successToast: false,
    onSuccess: () => {
      toast.success("Parcel marked as picked up!", {
        description: "Proceed to scan at the origin hub.",
      });
      onSuccess();
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CarFront className="h-5 w-5 text-cyan-500" />
            Mark as Picked Up
          </DialogTitle>
          <DialogDescription>
            Record the parcel condition at pickup. A photo URL is optional but
            recommended.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutate(v))}
            className="space-y-5 pt-1"
          >
            {/* Condition */}
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Condition <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="grid gap-2"
                    >
                      {(
                        Object.entries(PICKUP_CONDITION_META) as [
                          PickupCondition,
                          (typeof PICKUP_CONDITION_META)[PickupCondition],
                        ][]
                      ).map(([k, meta]) => (
                        <label
                          key={k}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition hover:bg-muted/40",
                            field.value === k
                              ? `${meta.colour} bg-current/5`
                              : "border-border",
                          )}
                        >
                          <RadioGroupItem value={k} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{meta.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {meta.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any observations about the parcel or pickup…"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Photo URL */}
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" />
                    Photo Proof URL (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://res.cloudinary.com/…"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Paste a direct image URL. Upload to Cloudinary or Imgur
                    first.
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
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Confirm pickup
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Hub scan dialog ───────────────────────────────────────────────────────── */

const hubScanSchema = z.object({
  hubId: z.string().min(1, "Please select a hub"),
  location: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
});
type HubScanFormValues = z.infer<typeof hubScanSchema>;

function HubScanDialog({
  shipmentId,
  targetStatus,
  transition,
  open,
  onClose,
  onSuccess,
}: {
  shipmentId: string;
  targetStatus: TransitionTarget;
  transition: TransitionDef;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<HubScanFormValues>({
    resolver: zodResolver(hubScanSchema),
    defaultValues: { hubId: "", location: "", notes: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ hubId: "", location: "", notes: "" });
  }, [open, form]);

  // Fetch hubs for the select dropdown
  const { data: hubsData, isLoading: hubsLoading } =
    useApiQuery<PaginatedData<Hub>>({
      queryKey: ["hubs", { limit: 100 }],
      queryFn: () => getHubs({ limit: 100, status: "active" }),
      staleTime: 5 * 60_000,
      enabled: open,
    });

  const hubs = hubsData?.items ?? [];

  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: HubScanFormValues) =>
      transitionShipmentStatus(shipmentId, {
        status: targetStatus,
        hubId: values.hubId || undefined,
        location: values.location || undefined,
        notes: values.notes || undefined,
      }),
    successToast: false,
    onSuccess: () => {
      toast.success(`Status updated: ${transition.label}`, {
        description: "Shipment timeline updated.",
      });
      onSuccess();
      onClose();
    },
  });

  const Icon = transition.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-indigo-500" />
            {transition.label}
          </DialogTitle>
          <DialogDescription>{transition.description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutate(v))}
            className="space-y-4 pt-1"
          >
            <FormField
              control={form.control}
              name="hubId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hub <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={hubsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            hubsLoading ? "Loading hubs…" : "Select a hub"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {hubs.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          <span className="font-mono mr-2 text-[11px] text-muted-foreground">
                            [{h.code}]
                          </span>
                          {h.name}
                          {h.city ? ` · ${h.city}` : ""}
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location note (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Bay 3, Zone A"
                      {...field}
                    />
                  </FormControl>
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
                      placeholder="Any scan notes…"
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || hubsLoading}>
                {isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Simple status transition dialog (no hub) ──────────────────────────────── */

const simpleTransitionSchema = z.object({
  location: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
});
type SimpleTransitionValues = z.infer<typeof simpleTransitionSchema>;

function SimpleTransitionDialog({
  shipmentId,
  targetStatus,
  transition,
  open,
  onClose,
  onSuccess,
}: {
  shipmentId: string;
  targetStatus: TransitionTarget;
  transition: TransitionDef;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<SimpleTransitionValues>({
    resolver: zodResolver(simpleTransitionSchema),
    defaultValues: { location: "", notes: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ location: "", notes: "" });
  }, [open, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: SimpleTransitionValues) =>
      transitionShipmentStatus(shipmentId, {
        status: targetStatus,
        location: values.location || undefined,
        notes: values.notes || undefined,
      }),
    successToast: false,
    onSuccess: () => {
      toast.success(`Status updated: ${transition.label}`, {
        description: "Shipment timeline updated.",
      });
      onSuccess();
      onClose();
    },
  });

  const Icon = transition.icon;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-indigo-500" />
            {transition.label}
          </DialogTitle>
          <DialogDescription>{transition.description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutate(v))}
            className="space-y-4 pt-1"
          >
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Current location…" {...field} />
                  </FormControl>
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
                      placeholder="Any additional notes…"
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
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Confirm
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Tracking timeline ─────────────────────────────────────────────────────── */

function TrackingTimeline({
  events,
  loading,
}: {
  events: TrackingEvent[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="relative space-y-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              {i < 3 && <div className="w-0.5 flex-1 bg-muted mt-2" />}
            </div>
            <div className="flex-1 space-y-1.5 pt-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3.5 w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No tracking events yet.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {events.map((ev, idx) => {
        const Icon =
          EVENT_ICON[ev.status as ShipmentStatus] ?? EVENT_ICON.default;
        const tone =
          EVENT_TONE[ev.status as ShipmentStatus] ?? EVENT_TONE.default;
        const isLast = idx === events.length - 1;

        return (
          <div key={ev.id} className="flex gap-4 pb-6 last:pb-0">
            {/* Icon column */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={cn(
                  "h-8 w-8 rounded-full border-2 flex items-center justify-center z-10",
                  tone,
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-border mt-1" aria-hidden />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5 pb-1">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <ShipmentStatusBadge
                  status={ev.status}
                  size="sm"
                  className="shrink-0"
                />
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                  {formatDateTime(ev.timestamp)}
                </span>
              </div>
              {ev.location && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {ev.location}
                </p>
              )}
              {ev.hub?.name && (
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Building2 className="h-3 w-3 shrink-0" />
                  {ev.hub.name}
                </p>
              )}
              {ev.notes && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">
                  &ldquo;{ev.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Address block (mini) ──────────────────────────────────────────────────── */

function AddressBlock({
  title,
  address,
}: {
  title: string;
  address: Shipment["senderAddress"] | undefined;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {title}
      </p>
      {address ? (
        <>
          <p className="text-sm font-semibold">{address.fullName}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Phone className="h-3 w-3 shrink-0" />
            {address.phone}
          </p>
          <p className="text-xs text-muted-foreground">
            {[address.street, address.city, address.region]
              .filter(Boolean)
              .join(", ")}
          </p>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">—</p>
      )}
    </div>
  );
}

/* ─── Courier action panel ───────────────────────────────────────────────────── */

interface ActionPanelProps {
  shipment: Shipment;
  onPickupSuccess: () => void;
  onTransitionSuccess: () => void;
}

function CourierActionPanel({
  shipment,
  onPickupSuccess,
  onTransitionSuccess,
}: ActionPanelProps) {
  const [pickupOpen, setPickupOpen] = React.useState(false);
  const [activeTransition, setActiveTransition] =
    React.useState<TransitionDef | null>(null);

  const status = shipment.status;

  // Which transitions are applicable for the current status
  const applicable = TRANSITIONS.filter((t) => t.from === status);

  // Can the courier mark pickup?
  const canPickup = status === "ASSIGNED";

  // Is there a next step available?
  const hasActions = canPickup || applicable.length > 0;

  // Is the delivery attempt button visible (done in step 22)?
  const canAttemptDelivery = status === "OUT_FOR_DELIVERY";

  if (!hasActions && !canAttemptDelivery) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center space-y-2">
          {status === "DELIVERED" ? (
            <>
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold">Delivery complete!</p>
              <p className="text-xs text-muted-foreground">
                This shipment has been delivered successfully.
              </p>
            </>
          ) : status === "CANCELLED" ? (
            <>
              <XCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">
                Shipment cancelled
              </p>
            </>
          ) : (
            <>
              <Clock className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-semibold text-muted-foreground">
                No actions available
              </p>
              <p className="text-xs text-muted-foreground">
                Current status:{" "}
                <span className="font-mono">{status}</span>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="h-4.5 w-4.5 text-amber-500" />
            Courier Actions
          </CardTitle>
          <CardDescription>
            Follow the workflow steps in order. Each action is gated by the
            current shipment status.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {/* Pickup button */}
          {canPickup && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <CarFront className="h-4 w-4 text-cyan-600" />
                    Mark as Picked Up
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Record the parcel condition and optional photo at pickup.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setPickupOpen(true)}
                  className="shrink-0"
                >
                  <CarFront className="h-3.5 w-3.5 mr-1.5" />
                  Pickup
                </Button>
              </div>
            </div>
          )}

          {/* Status transition buttons */}
          {applicable.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.to}
                className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Icon className="h-4 w-4 text-indigo-600" />
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTransition(t)}
                    className="shrink-0"
                  >
                    <Icon className="h-3.5 w-3.5 mr-1.5" />
                    {t.label}
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Delivery attempt placeholder — step 22 */}
          {canAttemptDelivery && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Record Delivery Attempt
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mark as DELIVERED (with proof) or FAILED (with reason).
                    Implemented in Step 22.
                  </p>
                </div>
                <Link href={`/courier/assignments/${shipment.id}/deliver`}>
                  <Button size="sm" className="shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Deliver
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pickup dialog */}
      <PickupDialog
        shipmentId={shipment.id}
        open={pickupOpen}
        onClose={() => setPickupOpen(false)}
        onSuccess={onPickupSuccess}
      />

      {/* Hub scan dialog */}
      {activeTransition?.needsHub && (
        <HubScanDialog
          shipmentId={shipment.id}
          targetStatus={activeTransition.to}
          transition={activeTransition}
          open={!!activeTransition}
          onClose={() => setActiveTransition(null)}
          onSuccess={onTransitionSuccess}
        />
      )}

      {/* Simple transition dialog */}
      {activeTransition && !activeTransition.needsHub && (
        <SimpleTransitionDialog
          shipmentId={shipment.id}
          targetStatus={activeTransition.to}
          transition={activeTransition}
          open={!!activeTransition}
          onClose={() => setActiveTransition(null)}
          onSuccess={onTransitionSuccess}
        />
      )}
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const invalidate = React.useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["shipments", "detail", id] });
    void qc.invalidateQueries({ queryKey: ["shipments", "tracking", id] });
    void qc.invalidateQueries({ queryKey: ["assignments", "my"] });
    void qc.invalidateQueries({ queryKey: ["courier", "me"] });
  }, [qc, id]);

  // ── Data ────────────────────────────────────────────────────────────────────
  const {
    data: shipment,
    isLoading: shipmentLoading,
    isError: shipmentError,
    refetch,
    isFetching,
  } = useApiQuery<Shipment>({
    queryKey: ["shipments", "detail", id],
    queryFn: () => getShipment(id as string),
    enabled: !!id,
    staleTime: 30_000,
  });

  const { data: trackingData, isLoading: trackingLoading } = useApiQuery<{
    shipment: Shipment;
    events: TrackingEvent[];
  }>({
    queryKey: ["shipments", "tracking", id],
    queryFn: () => getShipmentTracking(id as string),
    enabled: !!id,
    staleTime: 30_000,
    retry: 1,
  });

  const events = React.useMemo<TrackingEvent[]>(() => {
    const raw = trackingData?.events ?? [];
    return [...raw].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [trackingData]);

  // ── Not found ───────────────────────────────────────────────────────────────
  if (shipmentError && !shipment) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg">Assignment not found</CardTitle>
            <CardDescription>
              We couldn&apos;t load this assignment. It may not belong to your
              account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/courier/assignments">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to assignments
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      {/* ── Back nav + header ── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/courier/assignments")}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Assignments
          </Button>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {shipment ? (
              <ShipmentStatusBadge status={shipment.status} />
            ) : (
              <Skeleton className="h-5 w-32 rounded-full" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isFetching && "animate-spin")}
              />
            </Button>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight font-mono">
            {shipmentLoading ? (
              <Skeleton className="h-7 w-64 inline-block" />
            ) : (
              shipment?.trackingNumber ?? `Assignment ${id?.slice(0, 12)}…`
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {shipment
              ? `Created ${formatDateTime(shipment.createdAt)} · ${shipment.serviceType} · ${formatBDT(shipment.totalAmount)}`
              : "Loading assignment details…"}
          </p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: summary + tracking */}
        <div className="lg:col-span-7 space-y-5">
          {/* Sender / Recipient */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <UserRound className="h-4.5 w-4.5 text-primary" />
                Route
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {shipmentLoading && !shipment ? (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4">
                  {[0, 1].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3.5 w-48" />
                    </div>
                  ))}
                </div>
              ) : shipment ? (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-start gap-4">
                  <AddressBlock
                    title="Pickup (Sender)"
                    address={shipment.senderAddress}
                  />
                  <div className="hidden sm:flex items-center justify-center pt-4">
                    <div className="h-8 w-8 rounded-full border-2 border-dashed border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <AddressBlock
                    title="Dropoff (Recipient)"
                    address={shipment.recipientAddress}
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Parcel */}
          {shipment?.parcel && (
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4.5 w-4.5 text-primary" />
                  Parcel
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {[
                    {
                      label: "Weight",
                      value: `${shipment.parcel.weightKg.toFixed(2)} kg`,
                    },
                    {
                      label: "Dimensions",
                      value:
                        shipment.parcel.lengthCm &&
                        shipment.parcel.widthCm &&
                        shipment.parcel.heightCm
                          ? `${shipment.parcel.lengthCm}×${shipment.parcel.widthCm}×${shipment.parcel.heightCm} cm`
                          : "—",
                    },
                    {
                      label: "Category",
                      value: shipment.parcel.category || "General",
                    },
                    {
                      label: "Total",
                      value: formatBDT(shipment.totalAmount),
                    },
                  ].map((row) => (
                    <div key={row.label} className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                        {row.label}
                      </p>
                      <p className="font-semibold text-sm">{row.value}</p>
                    </div>
                  ))}
                </div>
                {shipment.deliveryInstructions && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                        Delivery instructions
                      </p>
                      <p className="text-sm text-muted-foreground italic">
                        &ldquo;{shipment.deliveryInstructions}&rdquo;
                      </p>
                    </div>
                  </>
                )}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {shipment.parcel.isFragile && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-rose-400/40 text-rose-700"
                    >
                      Fragile
                    </Badge>
                  )}
                  {shipment.codAmount ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-amber-400/40 text-amber-700"
                    >
                      CoD {formatBDT(shipment.codAmount)}
                    </Badge>
                  ) : null}
                  {shipment.parcel.insuranceEnabled && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-emerald-400/40 text-emerald-700"
                    >
                      Insured
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking timeline */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <PackageCheck className="h-4.5 w-4.5 text-primary" />
                Tracking Timeline
              </CardTitle>
              <CardDescription>
                All status events — newest first
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <TrackingTimeline
                events={events}
                loading={trackingLoading && events.length === 0}
              />
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: action panel */}
        <div className="lg:col-span-5 space-y-4">
          {shipmentLoading && !shipment ? (
            <Card>
              <CardHeader className="pb-3 border-b">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-56 mt-1" />
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </CardContent>
            </Card>
          ) : shipment ? (
            <CourierActionPanel
              shipment={shipment}
              onPickupSuccess={invalidate}
              onTransitionSuccess={invalidate}
            />
          ) : null}

          {/* Hub info */}
          {(shipment?.originHub || shipment?.destinationHub) && (
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-indigo-500" />
                  Assigned hubs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {shipment.originHub && (
                  <div className="rounded-lg border p-3 space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Origin hub
                    </p>
                    <p className="text-sm font-semibold">
                      {shipment.originHub.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        shipment.originHub.address,
                        shipment.originHub.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
                {shipment.destinationHub && (
                  <div className="rounded-lg border p-3 space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Destination hub
                    </p>
                    <p className="text-sm font-semibold">
                      {shipment.destinationHub.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        shipment.destinationHub.address,
                        shipment.destinationHub.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
