import { apiFetch } from "./client";
import type {
  AdminShipmentFilter,
  AuditLog,
  AuthResponse,
  ChangePasswordInput,
  CourierAssignment,
  CourierEarningsEntry,
  CourierEarningsSummary,
  CourierProfile,
  CreateShipmentInput,
  DashboardStats,
  DeliveryAttempt,
  DeliveryAttemptStatus,
  FailDeliveryReason,
  HealthResponse,
  Hub,
  Notification,
  NotificationListMeta,
  PaginatedData,
  Parcel,
  Payment,
  PickupCondition,
  PricingRule,
  Rating,
  RefreshTokenResponse,
  RejectAssignmentReason,
  Role,
  Shipment,
  ShipmentQuote,
  ShipmentQuoteInput,
  TrackingEvent,
  UpdateProfileInput,
  User,
} from "./types";

// ============== General / Health ==============
export const getApiIndex = () =>
  apiFetch<{
    name: string;
    version: string;
    endpoints: Record<string, string[]>;
  }>("/", { method: "GET", skipAuth: true });

export const getHealth = () =>
  apiFetch<HealthResponse>("/health", { method: "GET", skipAuth: true });

// ============== Authentication ==============
export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}
export const registerCustomer = (body: RegisterInput) =>
  apiFetch<AuthResponse>("/auth/register", { method: "POST", body, skipAuth: true });

export interface LoginInput {
  email: string;
  password: string;
}
export const loginUser = (body: LoginInput) =>
  apiFetch<AuthResponse>("/auth/login", { method: "POST", body, skipAuth: true });

export const refreshToken = (body: { refreshToken: string }) =>
  apiFetch<RefreshTokenResponse>("/auth/refresh-token", {
    method: "POST",
    body,
    skipAuth: true,
  });

export const logoutUser = (body?: { refreshToken?: string }) =>
  apiFetch<{ revoked: boolean }>("/auth/logout", {
    method: "POST",
    body: body ?? {},
    skipAuth: true,
  });

export const getGoogleAuthUrl = (): string =>
  // URL returned by backend may be a 302; we expose a helper + caller handles redirects.
  "";

// ============== Users (profile) ==============
export const getMe = () => apiFetch<User>("/users/me", { method: "GET" });

export const updateMe = (body: UpdateProfileInput) =>
  apiFetch<User>("/users/me", { method: "PATCH", body });

export const changePassword = (body: ChangePasswordInput) =>
  apiFetch<{ updated: boolean }>("/users/me/password", { method: "PATCH", body });

// ============== Couriers ==============
export const getCourierMe = () =>
  apiFetch<CourierProfile & { user: User }>("/couriers/me", { method: "GET" });

export const getCourierEarnings = (query?: {
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}) =>
  apiFetch<
    CourierEarningsSummary & {
      entries: CourierEarningsEntry[];
      page: number;
      limit: number;
      totalEntries: number;
    }
  >("/couriers/me/earnings", { method: "GET", query });

export const setCourierAvailability = (body: { available: boolean; reason?: string }) =>
  apiFetch<{ isAvailable: boolean }>("/couriers/me/availability", {
    method: "PATCH",
    body,
  });

// ============== Shipments ==============
export const getShipmentQuote = (body: ShipmentQuoteInput) =>
  apiFetch<ShipmentQuote>("/shipments/quote", { method: "POST", body });

export const searchShipments = (query: {
  q: string;
  page?: number;
  limit?: number;
}) =>
  apiFetch<PaginatedData<Shipment>>("/shipments/search", { method: "GET", query });

export const getShipments = (query?: AdminShipmentFilter & Record<string, unknown>) =>
  apiFetch<PaginatedData<Shipment>>("/shipments", { method: "GET", query });

export const getMyShipments = (query?: {
  status?: string;
  serviceType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => apiFetch<PaginatedData<Shipment>>("/shipments/my", { method: "GET", query });

export const createShipment = (body: CreateShipmentInput) =>
  apiFetch<Shipment & { quote?: ShipmentQuote }>("/shipments", { method: "POST", body });

export const getShipmentTracking = (id: string) =>
  apiFetch<{ shipment: Shipment; events: TrackingEvent[] }>(`/shipments/${id}/tracking`);

export const getShipment = (id: string) =>
  apiFetch<
    Shipment & {
      parcel?: Parcel;
      assignments?: CourierAssignment[];
      deliveryAttempts?: DeliveryAttempt[];
      pickupRecord?: unknown;
    }
  >(`/shipments/${id}`);

export const markShipmentPickedUp = (
  id: string,
  body: {
    condition: PickupCondition;
    notes?: string;
    photoUrl?: string;
  },
) => apiFetch<Shipment & { pickupRecordId: string }>(`/shipments/${id}/pickup`, { method: "POST", body });

export const transitionShipmentStatus = (
  id: string,
  body: {
    status: "AT_ORIGIN_HUB" | "IN_TRANSIT" | "AT_DESTINATION_HUB" | "OUT_FOR_DELIVERY";
    hubId?: string;
    location?: string;
    notes?: string;
    adminReason?: string;
  },
) => apiFetch<Shipment>(`/shipments/${id}/status`, { method: "PATCH", body });

export interface RecordDeliveryAttemptInput {
  outcome: DeliveryAttemptStatus;
  notes?: string;
  // DELIVERED fields
  recipientName?: string;
  signatureUrl?: string;
  photoProofUrl?: string;
  otpVerified?: boolean;
  // FAILED fields
  failReason?: FailDeliveryReason;
}
export const recordDeliveryAttempt = (
  id: string,
  body: RecordDeliveryAttemptInput,
) =>
  apiFetch<DeliveryAttempt & { shipmentStatus?: string }>(
    `/shipments/${id}/delivery-attempts`,
    { method: "POST", body },
  );

export const rateShipment = (
  id: string,
  body: { stars: 1 | 2 | 3 | 4 | 5; comment?: string },
) => apiFetch<Rating>(`/shipments/${id}/rating`, { method: "POST", body });

export const updateShipment = (
  id: string,
  body: {
    deliveryInstructions?: string;
    specialNotes?: string;
    parcelDescription?: string;
    recipientName?: string;
    recipientPhone?: string;
  },
) => apiFetch<Shipment>(`/shipments/${id}`, { method: "PATCH", body });

export const cancelShipment = (id: string, body: { reason: string }) =>
  apiFetch<Shipment>(`/shipments/${id}/cancel`, { method: "POST", body });

export const cancelShipmentAlias = (id: string, body: { reason: string }) =>
  apiFetch<Shipment>(`/shipments/${id}`, { method: "DELETE", body });

// ============== Payments ==============
export const initiatePaymentCheckout = (shipmentId: string) =>
  apiFetch<Payment & { gatewayUrl: string }>(
    `/payments/shipments/${shipmentId}/checkout`,
    { method: "POST" },
  );

export const getPayment = (id: string) =>
  apiFetch<Payment & { events?: unknown[] }>(`/payments/${id}`);

export const getPaymentByShipment = (shipmentId: string) =>
  apiFetch<Payment | null>(`/payments/shipments/${shipmentId}`);

export const refundPayment = (
  id: string,
  body: { reason: string; amount?: number },
) =>
  apiFetch<{ refunded: boolean; amount: number; status: string }>(
    `/payments/${id}/refund`,
    { method: "POST", body },
  );

// ============== Admin ==============
export const assignShipmentCourier = (
  shipmentId: string,
  body: { courierId: string },
) =>
  apiFetch<{ assignmentId: string; status: string }>(
    `/admin/shipments/${shipmentId}/assign`,
    { method: "POST", body },
  );

export const getUnassignedShipments = (query?: {
  page?: number;
  limit?: number;
  originHubId?: string;
  destinationHubId?: string;
  serviceType?: string;
}) =>
  apiFetch<PaginatedData<Shipment>>("/admin/assignments/unassigned", {
    method: "GET",
    query,
  });

export const createPricingRule = (
  body: Partial<PricingRule> & { serviceType: string; basePrice: number },
) => apiFetch<PricingRule>("/admin/pricing-rules", { method: "POST", body });

export const updatePricingRule = (
  id: string,
  body: Partial<{
    isActive: boolean;
    effectiveUntil: string;
    basePrice: number;
    weightSurchargePerKg: number;
    taxRatePercent: number;
    expressFee: number;
    insuranceFeePercent: number;
    codFeePercent: number;
    codFeeMin: number;
  }>,
) => apiFetch<PricingRule>(`/admin/pricing-rules/${id}`, { method: "PATCH", body });

export const getAdminUsers = (query?: {
  page?: number;
  limit?: number;
  role?: Role;
  status?: string;
  search?: string;
}) => apiFetch<PaginatedData<User>>("/admin/users", { method: "GET", query });

export const updateUserStatus = (
  id: string,
  body: { status: "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL"; reason?: string },
) =>
  apiFetch<{ id: string; status: string }>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body,
  });

export const updateUserRole = (
  id: string,
  body: { role: Role; reason: string },
) =>
  apiFetch<{ id: string; role: Role }>(`/admin/users/${id}/role`, {
    method: "PATCH",
    body,
  });

export const getAuditLogs = (query?: {
  page?: number;
  limit?: number;
  actorId?: string;
  entityType?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
}) =>
  apiFetch<PaginatedData<AuditLog>>("/admin/audit-logs", { method: "GET", query });

export const getAdminDashboardStats = () =>
  apiFetch<DashboardStats>("/admin/dashboard-stats", { method: "GET" });

export const adminRbacSmokeTest = () =>
  apiFetch<{ role: Role; authorized: true }>("/admin/test", { method: "GET" });

// ============== Assignments ==============
export const acceptAssignment = (id: string) =>
  apiFetch<{ id: string; status: "ACCEPTED" }>(`/assignments/${id}/accept`, {
    method: "PATCH",
  });

export const rejectAssignment = (
  id: string,
  body: { reason: RejectAssignmentReason; notes?: string },
) =>
  apiFetch<{ id: string; status: "REJECTED" }>(`/assignments/${id}/reject`, {
    method: "PATCH",
    body,
  });

// ============== Notifications ==============
export const getNotifications = (query?: {
  page?: number;
  limit?: number;
  read?: boolean;
}) =>
  apiFetch<NotificationListMeta>("/notifications", { method: "GET", query });

export const markNotificationRead = (id: string) =>
  apiFetch<{ id: string; readAt: string }>(`/notifications/${id}/read`, {
    method: "PATCH",
  });

// ============== Hubs ==============
export const getHubs = (query?: {
  page?: number;
  limit?: number;
  zoneId?: string;
  status?: "active" | "inactive" | "all";
}) => apiFetch<PaginatedData<Hub>>("/hubs", { method: "GET", query });

export const getHub = (id: string) => apiFetch<Hub>(`/hubs/${id}`);

export const createHub = (
  body: Omit<Hub, "id" | "createdAt" | "updatedAt"> & Partial<Pick<Hub, "id">>,
) => apiFetch<Hub>("/hubs", { method: "POST", body });

export const updateHub = (id: string, body: Partial<Hub>) =>
  apiFetch<Hub>(`/hubs/${id}`, { method: "PATCH", body });
