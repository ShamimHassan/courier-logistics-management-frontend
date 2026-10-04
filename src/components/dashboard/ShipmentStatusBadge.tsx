"use client";

import * as React from "react";
import { Badge, type VariantProps } from "@/components/ui/badge";
import type { ShipmentStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type BadgeVariant = NonNullable<VariantProps<typeof Badge>["variant"]>;

interface StatusMeta {
  label: string;
  variant: BadgeVariant;
  toneToken: string;
  dot: string;
}

const STATUS_MAP: Record<ShipmentStatus, StatusMeta> = {
  DRAFT: {
    label: "Draft",
    variant: "outline",
    toneToken: "border-slate-400/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    variant: "secondary",
    toneToken: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    dot: "bg-amber-500",
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    variant: "destructive",
    toneToken: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    dot: "bg-rose-500",
  },
  CONFIRMED: {
    label: "Confirmed",
    variant: "secondary",
    toneToken: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
    dot: "bg-indigo-500",
  },
  ASSIGNMENT_PENDING: {
    label: "Awaiting Courier",
    variant: "secondary",
    toneToken: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
    dot: "bg-orange-500",
  },
  ASSIGNED: {
    label: "Courier Assigned",
    variant: "secondary",
    toneToken: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    dot: "bg-sky-500",
  },
  PICKED_UP: {
    label: "Picked Up",
    variant: "secondary",
    toneToken: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
    dot: "bg-cyan-500",
  },
  AT_ORIGIN_HUB: {
    label: "At Origin Hub",
    variant: "default",
    toneToken: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    dot: "bg-indigo-600",
  },
  IN_TRANSIT: {
    label: "In Transit",
    variant: "default",
    toneToken: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
    dot: "bg-blue-600",
  },
  AT_DESTINATION_HUB: {
    label: "At Destination Hub",
    variant: "secondary",
    toneToken: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    dot: "bg-purple-500",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    variant: "default",
    toneToken: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dot: "bg-amber-500",
  },
  DELIVERY_FAILED: {
    label: "Delivery Failed",
    variant: "destructive",
    toneToken: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    dot: "bg-rose-600",
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    variant: "secondary",
    toneToken: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
    dot: "bg-violet-500",
  },
  RETURNED: {
    label: "Returned",
    variant: "secondary",
    toneToken: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/20",
    dot: "bg-fuchsia-500",
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "ghost",
    toneToken: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
    dot: "bg-slate-500",
  },
  DELIVERED: {
    label: "Delivered",
    variant: "secondary",
    toneToken: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-500",
  },
};

const FALLBACK_META: StatusMeta = STATUS_MAP.DRAFT;

export function getShipmentStatusMeta(
  status: ShipmentStatus | string | null | undefined,
): StatusMeta {
  if (!status) return FALLBACK_META;
  const key = status as ShipmentStatus;
  return STATUS_MAP[key] ?? FALLBACK_META;
}

export interface ShipmentStatusBadgeProps extends React.ComponentProps<typeof Badge> {
  status: ShipmentStatus | string | null | undefined;
  showDot?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ShipmentStatusBadge({
  status,
  showDot = true,
  showLabel = true,
  size = "md",
  className,
  variant,
  ...rest
}: ShipmentStatusBadgeProps) {
  const meta = getShipmentStatusMeta(status);
  return (
    <Badge
      variant={variant ?? meta.variant}
      className={cn(
        "border shrink-0 gap-1.5",
        meta.toneToken,
        size === "sm" ? "h-4 px-1.5 text-[10px]" : "h-5 text-[11px]",
        className,
      )}
      {...rest}
    >
      {showDot ? (
        <span
          aria-hidden
          className={cn("h-1.5 w-1.5 rounded-full", meta.dot)}
        />
      ) : null}
      {showLabel ? <span>{meta.label}</span> : null}
    </Badge>
  );
}

export default ShipmentStatusBadge;
export { STATUS_MAP as SHIPMENT_STATUS_META };
