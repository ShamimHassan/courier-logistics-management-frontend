import type { Shipment, User } from "@/lib/api/types";
import type { ShipmentStatus } from "@/lib/api/types";

export const ACTIVE_STATUSES: ReadonlySet<ShipmentStatus> = new Set<ShipmentStatus>([
  "CONFIRMED",
  "ASSIGNMENT_PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
]);

export const DELIVERED_STATUSES: ReadonlySet<ShipmentStatus> = new Set<ShipmentStatus>([
  "DELIVERED",
]);

export function isActiveShipment(s: { status: string }): boolean {
  return ACTIVE_STATUSES.has(s.status as ShipmentStatus);
}

export interface CustomerDashboardKpis {
  totalShipments: number;
  activeShipments: number;
  deliveredShipments: number;
  spentTotal: number;
  onTimeRate: number | null;
  spentThisMonth: number;
  shipmentsThisMonth: number;
  avgDeliveryDays: number | null;
  delivered30d: number;
}

export function computeCustomerKpis(
  shipments: Shipment[] | null | undefined,
  now: Date = new Date(),
): CustomerDashboardKpis {
  const list = shipments ?? [];
  const totalShipments = list.length;
  const activeShipments = list.filter((s) => ACTIVE_STATUSES.has(s.status)).length;
  const deliveredShipments = list.filter((s) => DELIVERED_STATUSES.has(s.status)).length;
  const spentTotal = list.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0);

  const year = now.getFullYear();
  const month = now.getMonth();
  const startOfMonth = new Date(year, month, 1).getTime();
  const thisMonthList = list.filter((s) => new Date(s.createdAt).getTime() >= startOfMonth);
  const spentThisMonth = thisMonthList.reduce((sum, s) => sum + (s.totalAmount ?? 0), 0);
  const shipmentsThisMonth = thisMonthList.length;

  const start30d = now.getTime() - 30 * 86400 * 1000;
  const delivered30d = list.filter(
    (s) => DELIVERED_STATUSES.has(s.status) && new Date(s.createdAt).getTime() >= start30d,
  ).length;

  const withTime = list
    .filter((s) => DELIVERED_STATUSES.has(s.status))
    .map((s) => {
      const created = new Date(s.createdAt).getTime();
      const updated = new Date(s.updatedAt).getTime();
      const days = (updated - created) / (86400 * 1000);
      return days > 0 ? days : null;
    })
    .filter((d): d is number => d !== null);

  const avgDeliveryDays = withTime.length
    ? withTime.reduce((a, b) => a + b, 0) / withTime.length
    : null;

  const onTimeRate =
    withTime.length >= 5 ? withTime.filter((d) => d <= 3).length / withTime.length : null;

  return {
    totalShipments,
    activeShipments,
    deliveredShipments,
    spentTotal,
    onTimeRate,
    spentThisMonth,
    shipmentsThisMonth,
    avgDeliveryDays,
    delivered30d,
  };
}

export function greetingForUser(
  user: Pick<User, "name"> | null | undefined,
  now: Date = new Date(),
): string {
  const name = user?.name?.trim().split(/\s+/)[0] ?? "there";
  const h = now.getHours();
  const part =
    h < 5
      ? "Late night"
      : h < 12
        ? "Good morning"
        : h < 17
          ? "Good afternoon"
          : h < 21
            ? "Good evening"
            : "Hi";
  return `${part}, ${name} 👋`;
}
