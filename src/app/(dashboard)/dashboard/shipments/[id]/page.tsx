"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowLeftRight,
  Building2,
  CarFront,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  Package,
  PackageCheck,
  PackagePlus,
  Phone,
  ShieldCheck,
  SquareX,
  Star,
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
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import ShipmentStatusBadge, {
  SHIPMENT_STATUS_META,
} from "@/components/dashboard/ShipmentStatusBadge";
import {
  cancelShipment,
  getPaymentByShipment,
  getShipment,
  getShipmentTracking,
  initiatePaymentCheckout,
  rateShipment,
} from "@/lib/api/endpoints";
import type {
  Payment,
  PaymentStatus,
  Rating,
  ServiceType,
  Shipment,
  ShipmentStatus,
  TrackingEvent,
} from "@/lib/api/types";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { cn, formatBDT, formatDateTime } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

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

const EXCEPTION_STATUSES: ShipmentStatus[] = [
  "PAYMENT_FAILED",
  "CANCELLED",
  "DELIVERY_FAILED",
  "RETURNED",
  "RETURN_REQUESTED",
];

const HUB_STATUSES: ShipmentStatus[] = [
  "AT_ORIGIN_HUB",
  "AT_DESTINATION_HUB",
];

const EVENT_ICON: Record<ShipmentStatus, LucideIcon> = {
  DRAFT: Package,
  PAYMENT_PENDING: Clock,
  PAYMENT_FAILED: AlertTriangle,
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
  RETURN_REQUESTED: AlertCircle,
  RETURNED: AlertTriangle,
};

const EVENT_TONE: Record<ShipmentStatus, string> = {
  DRAFT: "border-slate-300 bg-slate-100 text-slate-600",
  PAYMENT_PENDING: "border-amber-300 bg-amber-100 text-amber-700",
  PAYMENT_FAILED:
    "border-destructive/30 bg-destructive/10 text-destructive",
  CONFIRMED: "border-sky-300 bg-sky-100 text-sky-700",
  ASSIGNMENT_PENDING: "border-violet-300 bg-violet-100 text-violet-700",
  ASSIGNED: "border-violet-300 bg-violet-100 text-violet-700",
  PICKED_UP: "border-indigo-300 bg-indigo-100 text-indigo-700",
  AT_ORIGIN_HUB: "border-primary/30 bg-primary/10 text-primary",
  IN_TRANSIT: "border-primary/30 bg-primary/10 text-primary",
  AT_DESTINATION_HUB: "border-primary/30 bg-primary/10 text-primary",
  OUT_FOR_DELIVERY: "border-emerald-300 bg-emerald-100 text-emerald-700",
  DELIVERY_FAILED:
    "border-destructive/30 bg-destructive/10 text-destructive",
  DELIVERED: "border-emerald-400 bg-emerald-500 text-white",
  CANCELLED: "border-destructive/30 bg-destructive/10 text-destructive",
  RETURN_REQUESTED:
    "border-orange-300 bg-orange-100 text-orange-700",
  RETURNED: "border-destructive/30 bg-destructive/10 text-destructive",
};

const TRACKING_META_LINE: Record<ShipmentStatus, string> = {
  DRAFT: "Shipment draft created",
  PAYMENT_PENDING: "Awaiting payment confirmation",
  PAYMENT_FAILED: "Payment failed — retry required",
  CONFIRMED: "Shipment confirmed and queued for assignment",
  ASSIGNMENT_PENDING: "Finding an available courier",
  ASSIGNED: "Courier assigned — preparing pickup",
  PICKED_UP: "Parcel picked up from sender",
  AT_ORIGIN_HUB: "Scanned at origin hub",
  IN_TRANSIT: "On the way to destination region",
  AT_DESTINATION_HUB: "Scanned at destination hub",
  OUT_FOR_DELIVERY: "Out for final delivery to recipient",
  DELIVERY_FAILED: "Delivery attempt unsuccessful",
  DELIVERED: "Delivered successfully to recipient",
  CANCELLED: "Shipment cancelled",
  RETURN_REQUESTED: "Return requested by customer",
  RETURNED: "Parcel returned to sender",
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus | null;
  className?: string;
}) {
  if (!status) {
    return (
      <Badge variant="outline" className={cn("gap-1.5", className)}>
        <Clock className="h-3 w-3 text-muted-foreground" />
        Unpaid
      </Badge>
    );
  }
  if (status === "PAID") {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700", className)}
      >
        <CheckCircle2 className="h-3 w-3" />
        Paid
      </Badge>
    );
  }
  if (status === "PENDING") {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-700", className)}
      >
        <Clock className="h-3 w-3" />
        Payment pending
      </Badge>
    );
  }
  if (status === "FAILED") {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1.5 border-destructive/30 bg-destructive/10 text-destructive", className)}
      >
        <XCircle className="h-3 w-3" />
        Payment failed
      </Badge>
    );
  }
  if (status === "REFUNDED") {
    return (
      <Badge
        variant="outline"
        className={cn("gap-1.5 border-slate-400/30 bg-slate-200/60 text-slate-700", className)}
      >
        <CreditCard className="h-3 w-3" />
        Refunded
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn("gap-1.5", className)}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page                                                                 */
/* -------------------------------------------------------------------------- */

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id;

  /* --- Queries (run in parallel, independent) ---------------------------- */
  const qShipment = useApiQuery<Shipment>({
    queryKey: ["shipments", "detail", id],
    queryFn: () => getShipment(id as string),
    enabled: !!id,
    staleTime: 60_000,
  });

  const qTracking = useApiQuery<{
    shipment: Shipment;
    events: TrackingEvent[];
  }>({
    queryKey: ["shipments", "tracking", id],
    queryFn: () => getShipmentTracking(id as string),
    enabled: !!id,
    staleTime: 60_000,
    retry: 1,
  });

  const qPayment = useApiQuery<Payment | null>({
    queryKey: ["payments", "byShipment", id],
    queryFn: () => getPaymentByShipment(id as string),
    enabled: !!id,
    staleTime: 60_000,
    retry: 1,
  });

  const shipment = qShipment.data ?? null;
  const payment = qPayment.data ?? null;
  const rawEvents = qTracking.data?.events ?? [];
  const eventsSorted = useMemo<TrackingEvent[]>(() => {
    const arr = [...rawEvents].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    // Fallback: synthesize Created from shipment if tracking events empty
    if (arr.length === 0 && shipment?.createdAt) {
      arr.push({
        id: `syn-${shipment.id}`,
        shipmentId: shipment.id,
        status: shipment.status === "CANCELLED" ? "CANCELLED" : "DRAFT",
        location: shipment.senderAddress?.city ?? null,
        notes: "Shipment record created",
        timestamp: shipment.createdAt,
        hubId: null,
        actorId: null,
      });
    }
    return arr;
  }, [rawEvents, shipment]);

  const loadingAll = qShipment.isLoading || qShipment.isFetching && !shipment;
  const anyError = qShipment.isError && !shipment;

  /* --- Cancel dialog ----------------------------------------------------- */
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const { mutateAsync: doCancel, isPending: cancelPending } = useApiMutation<
    Shipment,
    { id: string; body: { reason: string } }
  >({
    mutationKey: ["shipments", "cancel", id],
    mutationFn: ({ id: mid, body }) => cancelShipment(mid, body),
    successToast: false,
    errorToast: false,
  });

  const closeCancel = () => {
    if (cancelPending) return;
    setCancelOpen(false);
    setCancelReason("");
  };

  const submitCancel = async () => {
    if (!shipment) return;
    const promise = doCancel({
      id: shipment.id,
      body: {
        reason: cancelReason.trim() || "Customer cancelled via dashboard",
      },
    });
    toast.promise(promise, {
      loading: `Cancelling shipment ${shipment.trackingNumber}…`,
      success: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["shipments", "detail"] }),
          queryClient.invalidateQueries({ queryKey: ["shipments", "tracking"] }),
          queryClient.invalidateQueries({ queryKey: ["shipments", "my"] }),
        ]);
        closeCancel();
        return "Shipment cancelled";
      },
      error: (e) => (e as Error)?.message || "Could not cancel shipment",
    });
  };

  /* --- Pay Now mutation -------------------------------------------------- */
  const { mutateAsync: doCheckout, isPending: payPending } = useApiMutation<
    Payment & { gatewayUrl: string },
    string
  >({
    mutationKey: ["payments", "checkout", id],
    mutationFn: (sid) => initiatePaymentCheckout(sid),
    successToast: false,
    errorToast: false,
  });

  const payNow = async () => {
    if (!shipment) return;
    const promise = doCheckout(shipment.id);
    toast.promise(promise, {
      loading: "Preparing secure checkout…",
      success: (checkout) => {
        if (checkout?.gatewayUrl) {
          window.setTimeout(() => {
            window.location.href = checkout.gatewayUrl;
          }, 400);
        }
        return `Redirecting to SSLCommerz · ${formatBDT(shipment.totalAmount)}`;
      },
      error: (e) => (e as Error)?.message || "Could not start checkout",
    });
  };

  /* --- Rating widget ----------------------------------------------------- */
  const [ratingStars, setRatingStars] = useState<1 | 2 | 3 | 4 | 5 | 0>(0);
  const [ratingHover, setRatingHover] = useState<1 | 2 | 3 | 4 | 5 | 0>(0);
  const [ratingComment, setRatingComment] = useState("");
  const [savedRating, setSavedRating] = useState<Rating | null>(null);
  const { mutateAsync: doRate, isPending: ratePending } = useApiMutation<
    Rating,
    { id: string; body: { stars: 1 | 2 | 3 | 4 | 5; comment?: string } }
  >({
    mutationKey: ["shipments", "rating", id],
    mutationFn: ({ id: rid, body }) => rateShipment(rid, body),
    successToast: false,
    errorToast: false,
  });

  const submitRating = async () => {
    if (!shipment || ratingStars === 0) return;
    try {
      const rated = await doRate({
        id: shipment.id,
        body: {
          stars: ratingStars,
          comment: ratingComment.trim() || undefined,
        },
      });
      toast.success(
        `Thanks for rating ${rated.stars}★ · your feedback helps us improve`,
      );
      setSavedRating(rated);
      void queryClient.invalidateQueries({ queryKey: ["shipments", "detail"] });
    } catch (e) {
      const msg = (e as Error)?.message || "";
      if (msg.toLowerCase().includes("already") || msg.includes("409")) {
        toast.warning("Already rated · thanks though!");
        setSavedRating({
          id: `local-${shipment.id}`,
          shipmentId: shipment.id,
          customerId: "",
          courierId: shipment.courierId ?? "",
          stars: ratingStars,
          comment: ratingComment.trim() || null,
          ratedAt: new Date().toISOString(),
        });
      } else {
        toast.error(msg || "Could not submit rating");
      }
    }
  };

  /* --- Derived: state machine visibility booleans ----------------------- */
  const showPayNow =
    !!shipment &&
    (shipment.status === "DRAFT" || shipment.status === "PAYMENT_PENDING" ||
      shipment.status === "PAYMENT_FAILED");
  const showCancel =
    !!shipment && CANCELLABLE_STATUSES.includes(shipment.status);
  const showRating = !!shipment && shipment.status === "DELIVERED";
  const paymentStatus: PaymentStatus | null =
    payment?.status ??
    (shipment?.status === "DRAFT" || shipment?.status === "PAYMENT_PENDING"
      ? "PENDING"
      : null);

  /* --- Render: loading / 404 -------------------------------------------- */

  if (anyError && !shipment) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <Eye />
              </span>
              Shipment not found
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              We couldn&apos;t find a shipment with this ID. It may have been
              deleted, or the link is incorrect.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-wrap gap-2">
            <Button asChild variant="default" className="gap-2">
              <Link href="/dashboard/shipments">
                <ArrowLeft className="h-4 w-4" />
                My shipments
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/dashboard/shipments/new">
                <PackagePlus className="h-4 w-4" />
                Book new shipment
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/shipments")}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            My shipments
          </Button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {shipment ? (
              <ShipmentStatusBadge status={shipment.status} />
            ) : (
              <Skeleton className="h-7 w-32 rounded-full" />
            )}
            <PaymentStatusBadge
              status={qPayment.isLoading ? "PENDING" : paymentStatus}
              className={cn(qPayment.isLoading && "opacity-60")}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 border-primary/30">
                <Package className="h-3 w-3 text-primary" />
                Shipment
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-mono">
              {shipment?.trackingNumber ?? (
                <Skeleton className="h-7 w-60 inline-block rounded-md" />
              )}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {shipment
                ? `Created ${formatDateTime(shipment.createdAt)} · total ${formatBDT(shipment.totalAmount)}`
                : "Loading shipment details…"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showPayNow && (
              <Button
                type="button"
                onClick={payNow}
                disabled={payPending}
                className="gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {payPending ? "Opening checkout…" : "Pay now"}
                {shipment
                  ? ` · ${formatBDT(shipment.totalAmount)}`
                  : null}
              </Button>
            )}
            {showCancel && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setCancelOpen(true)}
                className="gap-2"
              >
                <SquareX className="h-4 w-4" />
                Cancel shipment
              </Button>
            )}
            {shipment && !showPayNow && !showCancel && !showRating ? (
              <Badge variant="outline" className="gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                Awaiting next update
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* LEFT (summary) */}
        <div className="md:col-span-7 space-y-5">
          {/* Amount & service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
                Amount & service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAll && !shipment ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`amt-sk-${i}`} className="space-y-1.5">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                shipment && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoRow label="Total">
                      <span className="font-semibold tabular-nums">
                        {formatBDT(shipment.totalAmount)}
                      </span>
                    </InfoRow>
                    <InfoRow label="CoD">
                      <span className="tabular-nums">
                        {shipment.codAmount
                          ? formatBDT(shipment.codAmount)
                          : <span className="text-muted-foreground">—</span>}
                      </span>
                    </InfoRow>
                    <InfoRow label="Insurance">
                      <span className="tabular-nums">
                        {shipment.parcel?.insuranceEnabled &&
                        shipment.parcel.declaredValue
                          ? formatBDT(shipment.parcel.declaredValue)
                          : <span className="text-muted-foreground">None</span>}
                      </span>
                    </InfoRow>
                    <InfoRow label="Service">
                      <Badge variant={SERVICE_META[shipment.serviceType].variant}>
                        {SERVICE_META[shipment.serviceType].label}
                      </Badge>
                    </InfoRow>
                  </div>
                )
              )}
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {shipment ? (
                  <>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Created {formatDateTime(shipment.createdAt)}
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
                      <PackageCheck className="h-3.5 w-3.5" />
                      Status:{" "}
                      <span className="text-foreground font-medium ml-1">
                        {SHIPMENT_STATUS_META[shipment.status]?.label || shipment.status}
                      </span>
                    </div>
                    {shipment.originHub && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Origin hub:{" "}
                        <span className="text-foreground font-medium ml-1">
                          {shipment.originHub.name}
                        </span>
                      </div>
                    )}
                    {shipment.destinationHub && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5" />
                        Destination hub:{" "}
                        <span className="text-foreground font-medium ml-1">
                          {shipment.destinationHub.name}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sender / Recipient */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="h-4.5 w-4.5 text-primary" />
                Sender & recipient
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAll && !shipment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={`addr-sk-${i}`} className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-44" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-44" />
                    </div>
                  ))}
                </div>
              ) : (
                shipment && (
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-4">
                    <AddressBlock
                      title="Sender"
                      address={shipment.senderAddress}
                    />
                    <div className="flex md:flex-col items-center justify-center">
                      <div className="h-9 w-9 rounded-full border-2 border-dashed border-border bg-muted/50 flex items-center justify-center text-muted-foreground">
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <AddressBlock
                      title="Recipient"
                      address={shipment.recipientAddress}
                    />
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Parcel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackagePlus className="h-4.5 w-4.5 text-primary" />
                Parcel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAll && !shipment?.parcel ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={`prc-sk-${i}`} className="space-y-1.5">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-4 w-5/6 max-w-xl" />
                </>
              ) : (
                shipment?.parcel && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoRow label="Weight">
                        <span className="tabular-nums font-medium">
                          {shipment.parcel.weightKg.toFixed(2)} kg
                        </span>
                      </InfoRow>
                      <InfoRow label="Dimensions">
                        <span className="tabular-nums text-xs">
                          {shipment.parcel.lengthCm &&
                          shipment.parcel.widthCm &&
                          shipment.parcel.heightCm
                            ? `${shipment.parcel.lengthCm} × ${shipment.parcel.widthCm} × ${shipment.parcel.heightCm} cm`
                            : <span className="text-muted-foreground">—</span>}
                        </span>
                      </InfoRow>
                      <InfoRow label="Category">
                        <Badge variant="outline" className="text-[10px]">
                          {shipment.parcel.category || "General"}
                        </Badge>
                      </InfoRow>
                      <InfoRow label="Declared value">
                        <span className="tabular-nums text-xs">
                          {shipment.parcel.declaredValue
                            ? formatBDT(shipment.parcel.declaredValue)
                            : <span className="text-muted-foreground">—</span>}
                        </span>
                      </InfoRow>
                    </div>
                    {shipment.parcel.description && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                          Description
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          {shipment.parcel.description}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {shipment.parcel.isFragile ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-red-400/40 bg-red-500/10 text-red-700"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Fragile
                        </Badge>
                      ) : null}
                      {shipment.parcel.insuranceEnabled ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-emerald-400/40 bg-emerald-500/10 text-emerald-700"
                        >
                          <ShieldCheck className="h-3 w-3" />
                          Insured
                        </Badge>
                      ) : null}
                    </div>
                  </>
                )
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4.5 w-4.5 text-primary" />
                Instructions & notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingAll && !shipment ? (
                <>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-full max-w-2xl" />
                  <Skeleton className="h-4 w-5/6 max-w-2xl" />
                </>
              ) : shipment ? (
                <>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Delivery instructions
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {shipment.deliveryInstructions?.trim()
                        ? shipment.deliveryInstructions
                        : <span className="italic">None provided</span>}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Special notes (internal)
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {shipment.specialNotes?.trim()
                        ? shipment.specialNotes
                        : <span className="italic">—</span>}
                    </p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          {/* Courier assignment + Rating (left column, below) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserRound className="h-4.5 w-4.5 text-primary" />
                Courier assignment
              </CardTitle>
              <CardDescription className="text-xs">
                Your assigned courier will show here once the booking is accepted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAll && !shipment ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ) : shipment?.courier ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  {shipment.courier.profileImageUrl ? (
                    <img
                      src={shipment.courier.profileImageUrl}
                      alt={shipment.courier.name}
                      className="h-11 w-11 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <UserRound className="h-5 w-5" />
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {shipment.courier.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3 w-3" />
                      <a
                        href={`tel:${shipment.courier.phone}`}
                        className="hover:underline font-mono"
                      >
                        {shipment.courier.phone}
                      </a>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-border bg-muted/20 text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Awaiting courier assignment — we&apos;ll notify you once assigned.
                </div>
              )}

              {/* Rating widget card */}
              {showRating && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
                      <Star className="h-4 w-4 fill-emerald-600 stroke-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {savedRating
                          ? `Thanks for your ${savedRating.stars}★ rating!`
                          : "How was your delivery?"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {savedRating
                          ? "Your feedback helps improve CourierFlow service."
                          : "Tap the stars and add optional notes (1–5)."}
                      </p>
                    </div>
                  </div>

                  {!savedRating ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((n) => {
                          const v = n as 1 | 2 | 3 | 4 | 5;
                          const active =
                            (ratingHover || ratingStars) >= v;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setRatingStars(v)}
                              onMouseEnter={() => setRatingHover(v)}
                              onMouseLeave={() => setRatingHover(0)}
                              aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                              className={cn(
                                "h-9 w-9 rounded-md transition-all",
                                "hover:scale-110 active:scale-95",
                                active
                                  ? "text-amber-500"
                                  : "text-slate-300 hover:text-amber-400/70",
                              )}
                              disabled={ratePending}
                            >
                              <Star
                                className={cn(
                                  "h-6 w-6 mx-auto",
                                  active &&
                                    "fill-amber-400 stroke-amber-500",
                                )}
                              />
                            </button>
                          );
                        })}
                        {ratingStars > 0 && !ratePending && (
                          <button
                            type="button"
                            className="ml-auto text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                            onClick={() => {
                              setRatingStars(0);
                              setRatingComment("");
                            }}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <Textarea
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        rows={2}
                        placeholder="Anything you want us to know? Courier name, packaging, punctuality… (optional)"
                        className="text-sm resize-none"
                        disabled={ratePending}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="sm"
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={ratingStars === 0 || ratePending}
                          onClick={submitRating}
                        >
                          <Star className="h-3.5 w-3.5 fill-white/80 stroke-white" />
                          {ratePending
                            ? "Submitting…"
                            : ratingStars === 0
                              ? "Pick stars to submit"
                              : `Submit ${ratingStars}★ rating`}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={cn(
                              "h-5 w-5",
                              n <= savedRating.stars
                                ? "fill-amber-400 stroke-amber-500 text-amber-500"
                                : "text-slate-200",
                            )}
                          />
                        ))}
                        <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                          {formatDateTime(savedRating.ratedAt)}
                        </span>
                      </div>
                      {savedRating.comment && (
                        <blockquote className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground leading-relaxed">
                          &ldquo;{savedRating.comment}&rdquo;
                        </blockquote>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT (timeline) */}
        <div className="md:col-span-5 space-y-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageCheck className="h-4.5 w-4.5 text-primary" />
                Tracking timeline
              </CardTitle>
              <CardDescription className="text-xs">
                Newest first · updates delivered live by our system.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              {qTracking.isLoading && eventsSorted.length === 0 ? (
                <ol className="space-y-6 relative">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li key={`ev-sk-${i}`} className="flex gap-3 relative">
                      <div className="pt-0.5 shrink-0">
                        <Skeleton className="h-10 w-10 rounded-2xl" />
                      </div>
                      <div className="flex-1 space-y-2 pb-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-28 rounded-full" />
                          <Skeleton className="h-3 w-24 ml-auto" />
                        </div>
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-3 w-52 max-w-full" />
                      </div>
                    </li>
                  ))}
                </ol>
              ) : eventsSorted.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Timeline events not ready yet</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    We&apos;ll populate this timeline as soon as your shipment
                    is accepted by an agent.
                  </p>
                </div>
              ) : (
                <ol className="space-y-0 relative">
                  {eventsSorted.map((ev, i) => {
                    const isFirst = i === 0;
                    const isLast = i === eventsSorted.length - 1;
                    const Icon = EVENT_ICON[ev.status] ?? Package;
                    const tone = EVENT_TONE[ev.status] ?? "border-slate-300 bg-slate-100 text-slate-600";
                    const meta = SHIPMENT_STATUS_META[ev.status];
                    const exc = EXCEPTION_STATUSES.includes(ev.status);
                    const atHub = HUB_STATUSES.includes(ev.status);
                    return (
                      <li key={ev.id} className="flex gap-3.5 pb-7 relative last:pb-0">
                        {/* Connecting rail */}
                        {!isLast ? (
                          <span
                            aria-hidden
                            className="absolute left-[19px] top-12 bottom-0 w-px bg-border"
                          />
                        ) : null}
                        {/* Icon */}
                        <div
                          className={cn(
                            "relative z-10 shrink-0",
                            "h-10 w-10 rounded-2xl border-2 flex items-center justify-center transition-colors",
                            tone,
                            isFirst && !exc && "ring-2 ring-primary/10 scale-105",
                            isFirst && exc && "ring-2 ring-destructive/10",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4.5 w-4.5",
                              isFirst ? "stroke-[2.5]" : "",
                            )}
                          />
                        </div>
                        {/* Body */}
                        <div className="flex-1 space-y-1.5 pt-0.5">
                          <div className="flex items-start gap-2 justify-between flex-wrap">
                            <div className="flex flex-wrap items-center gap-2">
                              <ShipmentStatusBadge
                                status={ev.status}
                                size="sm"
                                className="text-[11px]"
                              />
                              {atHub && ev.hub ? (
                                <Badge variant="outline" className="text-[10px] gap-1">
                                  <Warehouse className="h-3 w-3" />
                                  {ev.hub.name}
                                </Badge>
                              ) : null}
                              {exc ? (
                                <Badge
                                  variant="outline"
                                  className="gap-1 text-[10px] border-destructive/30 text-destructive bg-destructive/[0.04]"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  Exception
                                </Badge>
                              ) : null}
                            </div>
                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                              {formatDateTime(ev.timestamp)}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-sm leading-relaxed",
                              isFirst ? "font-semibold" : "text-muted-foreground",
                            )}
                          >
                            {meta?.label ?? ev.status}
                            <span className="mx-1.5 text-muted-foreground/60">
                              ·
                            </span>
                            <span className="font-normal text-muted-foreground">
                              {TRACKING_META_LINE[ev.status] ||
                                "Tracking event received"}
                            </span>
                          </p>
                          {ev.location || ev.hub?.address || ev.actor ? (
                            <p className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                              {ev.location ? (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {ev.location}
                                </span>
                              ) : null}
                              {ev.hub?.name && !atHub ? (
                                <span className="inline-flex items-center gap-1">
                                  <Warehouse className="h-3 w-3" />
                                  {ev.hub.name}
                                </span>
                              ) : null}
                              {ev.actor?.name ? (
                                <span className="inline-flex items-center gap-1">
                                  <UserRound className="h-3 w-3" />
                                  {ev.actor.name}
                                  {ev.actor.phone ? (
                                    <span className="font-mono text-muted-foreground/70">
                                      · {ev.actor.phone}
                                    </span>
                                  ) : null}
                                </span>
                              ) : null}
                            </p>
                          ) : null}
                          {ev.notes ? (
                            <div className="mt-1 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-[11px] text-foreground/80 leading-relaxed inline-block max-w-full break-words">
                              &ldquo;{ev.notes}&rdquo;
                            </div>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={(o) => !o && closeCancel()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
                <SquareX className="h-4 w-4" />
              </span>
              Cancel shipment {shipment?.trackingNumber ?? ""}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-1">
              This permanently cancels the shipment — any payments already
              processed will be handled by SSLCommerz refund policy within 5–7
              business days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 pt-1">
            <label htmlFor="cancel-reason" className="text-xs font-medium">
              Reason (optional, helps our team)
            </label>
            <Textarea
              id="cancel-reason"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. no longer needed, duplicate booking, changed recipient details…"
              className="text-sm resize-y"
              disabled={cancelPending}
            />
            {shipment && (
              <div className="rounded-md border border-border bg-muted/30 p-3 text-[11px] text-muted-foreground space-y-1">
                <div>
                  <span className="font-semibold text-foreground/70">Service: </span>
                  {SERVICE_META[shipment.serviceType]?.label ?? shipment.serviceType}
                  {" · "}
                  {formatBDT(shipment.totalAmount)}
                </div>
                <div>
                  <span className="font-semibold text-foreground/70">Status: </span>
                  <ShipmentStatusBadge status={shipment.status} size="sm" />
                </div>
                <div>
                  <span className="font-semibold text-foreground/70">Recipient: </span>
                  {shipment.recipientAddress?.fullName ?? "—"}
                  {" · "}
                  {shipment.recipientAddress?.city ?? "—"}
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
              disabled={cancelPending || !shipment}
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
/*  Sub-components (local to page)                                            */
/* -------------------------------------------------------------------------- */

function AddressBlock({
  title,
  address,
}: {
  title: "Sender" | "Recipient";
  address: Shipment["senderAddress"] | Shipment["recipientAddress"];
}) {
  const tone =
    title === "Sender"
      ? {
          badge: "bg-sky-500/10 text-sky-700 border-sky-500/20",
          icon: <ArrowLeftRight className="h-3 w-3 rotate-180" />,
        }
      : {
          badge: "bg-violet-500/10 text-violet-700 border-violet-500/20",
          icon: <MapPin className="h-3 w-3" />,
        };
  if (!address) {
    return (
      <div className="rounded-xl border border-dashed border-border p-4 space-y-2 bg-muted/20">
        <Badge variant="outline" className={cn("gap-1.5 text-[10px]", tone.badge)}>
          {tone.icon}
          {title}
        </Badge>
        <p className="text-xs text-muted-foreground italic">
          Address details not available.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-background/50 p-4 space-y-2">
      <Badge variant="outline" className={cn("gap-1.5 text-[10px]", tone.badge)}>
        {tone.icon}
        {title}
      </Badge>
      <p className="font-semibold text-sm leading-tight">{address.fullName}</p>
      <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
        <Phone className="h-3 w-3" />
        <a href={`tel:${address.phone}`} className="hover:underline">
          {address.phone}
        </a>
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {[
          address.street,
          [address.city, address.region, address.zip]
            .filter(Boolean)
            .join(", "),
        ]
          .filter(Boolean)
          .join("\n") || <span className="italic">—</span>}
      </p>
    </div>
  );
}
