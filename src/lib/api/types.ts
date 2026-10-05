export type Role = "ADMIN" | "COURIER" | "CUSTOMER";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_APPROVAL";

export type ShipmentStatus =
  | "DRAFT"
  | "PAYMENT_PENDING"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "ASSIGNMENT_PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "AT_ORIGIN_HUB"
  | "IN_TRANSIT"
  | "AT_DESTINATION_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERY_FAILED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "CANCELLED"
  | "DELIVERED";

export type ServiceType = "STANDARD" | "EXPRESS" | "OVERNIGHT";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "DISPUTED"
  | "EXPIRED";

export type AssignmentStatus =
  | "OFFERED"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type DeliveryAttemptStatus = "DELIVERED" | "FAILED";

export type PickupCondition = "GOOD" | "DAMAGED" | "PACKAGING_WORN";

export type RejectAssignmentReason =
  | "VEHICLE_ISSUE"
  | "PERSONAL_EMERGENCY"
  | "WRONG_ZONE"
  | "PACKAGE_CONFLICT"
  | "OTHER";

export type FailDeliveryReason =
  | "RECIPIENT_UNAVAILABLE"
  | "WRONG_ADDRESS"
  | "REFUSED"
  | "BAD_WEATHER"
  | "OTHER";

export type NotificationType =
  | "SHIPMENT_CREATED"
  | "SHIPMENT_PAID"
  | "SHIPMENT_ASSIGNED"
  | "SHIPMENT_PICKED_UP"
  | "SHIPMENT_IN_TRANSIT"
  | "SHIPMENT_OUT_FOR_DELIVERY"
  | "SHIPMENT_DELIVERED"
  | "SHIPMENT_FAILED"
  | "SHIPMENT_CANCELLED"
  | "ASSIGNMENT_OFFERED"
  | "ASSIGNMENT_ACCEPTED"
  | "ASSIGNMENT_REJECTED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "REFUND_PROCESSED"
  | "COURIER_AVAILABILITY"
  | "GENERIC";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "CANCEL"
  | "ASSIGN"
  | "ACCEPT"
  | "REJECT"
  | "PICKUP"
  | "TRANSIT"
  | "DELIVER"
  | "REFUND"
  | "LOGIN"
  | "LOGOUT"
  | "STATUS_CHANGE"
  | "OTHER";

export interface ApiError {
  code: string;
  message: string;
  path?: (string | number)[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: ApiError[];
  requestId?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  profileImageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface CourierProfile {
  id: string;
  userId: string;
  vehicle?: string | null;
  license?: string | null;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  zones?: Zone[];
  totalDeliveries?: number;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  totalShipments?: number;
  spentTotal?: number;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  region?: string | null;
  isActive: boolean;
}

export interface Hub {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  zip?: string | null;
  operatingHours?: string | null;
  contactPhone?: string | null;
  isActive: boolean;
  originZoneId?: string | null;
  destinationZoneId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  street?: string | null;
  city?: string | null;
  region?: string | null;
  zip?: string | null;
  country: string;
  zoneId?: string | null;
  label?: string | null;
}

export interface Parcel {
  id: string;
  weightKg: number;
  lengthCm?: number | null;
  widthCm?: number | null;
  heightCm?: number | null;
  category?: string | null;
  description?: string | null;
  declaredValue?: number | null;
  isFragile: boolean;
  insuranceEnabled: boolean;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  customerId: string;
  courierId?: string | null;
  senderAddressId: string;
  recipientAddressId: string;
  parcelId: string;
  originHubId?: string | null;
  destinationHubId?: string | null;
  serviceType: ServiceType;
  status: ShipmentStatus;
  codAmount?: number | null;
  totalAmount: number;
  currency: string;
  deliveryInstructions?: string | null;
  specialNotes?: string | null;
  pricingRuleId?: string | null;
  senderAddress?: Address;
  recipientAddress?: Address;
  parcel?: Parcel;
  originHub?: Hub | null;
  destinationHub?: Hub | null;
  courier?: User | null;
  customer?: User | null;
  rating?: Rating | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentQuoteInput {
  originZoneId?: string;
  destinationZoneId?: string;
  serviceType: ServiceType;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  codEnabled?: boolean;
  codAmount?: number;
  insuranceEnabled?: boolean;
  declaredValue?: number;
}

export interface ShipmentQuote {
  basePrice: number;
  weightSurcharge: number;
  servicePremium: number;
  codFee: number;
  insuranceFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  estimatedDeliveryDays: [number, number];
  breakdown: Array<{ label: string; amount: number; description?: string }>;
}

export interface CreateShipmentInput {
  sender: Omit<Address, "id">;
  recipient: Omit<Address, "id">;
  parcel: Omit<Parcel, "id">;
  serviceType: ServiceType;
  codAmount?: number;
  deliveryInstructions?: string;
  specialNotes?: string;
}

export interface CourierAssignment {
  id: string;
  shipmentId: string;
  courierId: string;
  assignedById: string;
  status: AssignmentStatus;
  rejectReason?: RejectAssignmentReason | null;
  rejectNotes?: string | null;
  assignedAt: string;
  decidedAt?: string | null;
  shipment?: Shipment;
  courier?: User;
  assignedBy?: User;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location?: string | null;
  hubId?: string | null;
  notes?: string | null;
  actorId?: string | null;
  timestamp: string;
  hub?: Hub | null;
  actor?: User | null;
}

export interface PickupRecord {
  id: string;
  shipmentId: string;
  courierId: string;
  condition: PickupCondition;
  notes?: string | null;
  photoUrl?: string | null;
  pickedUpAt: string;
}

export interface DeliveryAttempt {
  id: string;
  shipmentId: string;
  courierId: string;
  attemptNumber: number;
  outcome: DeliveryAttemptStatus;
  recipientName?: string | null;
  signatureUrl?: string | null;
  photoProofUrl?: string | null;
  otpVerified?: boolean | null;
  failReason?: FailDeliveryReason | null;
  notes?: string | null;
  attemptedAt: string;
}

export interface Rating {
  id: string;
  shipmentId: string;
  customerId: string;
  courierId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment?: string | null;
  ratedAt: string;
  courier?: User | null;
}

export interface PricingRule {
  id: string;
  originZoneId?: string | null;
  destinationZoneId?: string | null;
  serviceType: ServiceType;
  minWeightKg: number;
  maxWeightKg: number;
  basePrice: number;
  weightSurchargePerKg: number;
  expressFee: number;
  insuranceFeePercent: number;
  taxRatePercent: number;
  codFeePercent: number;
  codFeeMin: number;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  isActive: boolean;
  originZone?: Zone | null;
  destinationZone?: Zone | null;
}

export interface Payment {
  id: string;
  shipmentId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  sslcommerzSessionKey?: string | null;
  transactionId?: string | null;
  paymentMethod?: string | null;
  initiatedAt?: string | null;
  confirmedAt?: string | null;
  gatewayUrl?: string;
  events?: PaymentEvent[];
  shipment?: Shipment | null;
}

export interface PaymentEvent {
  id: string;
  paymentId: string;
  eventType:
    | "INIT"
    | "IPN"
    | "SUCCESS"
    | "FAIL"
    | "CANCEL"
    | "REFUND";
  rawPayload?: unknown;
  processedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedShipmentId?: string | null;
  relatedPaymentId?: string | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationListMeta {
  items: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditLog {
  id: string;
  actorId?: string | null;
  actorRole?: Role | null;
  module?: string | null;
  action: AuditAction;
  entityType?: string | null;
  entityId?: string | null;
  summary?: string | null;
  details?: {
    old?: unknown;
    new?: unknown;
    reason?: string;
  } | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  createdAt: string;
  actor?: User | null;
}

export interface DashboardStats {
  // Actual shape returned by GET /admin/dashboard-stats
  shipments: {
    total: number;
    inTransit: number;
    delivered: number;
    failed: number;
  };
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  couriers: {
    active: number;
    available: number;
    busy: number;
  };
  delivery: {
    successRate: number;
    totalAttempts: number;
  };
  // Legacy flat fields kept for backwards compat (may not be present)
  totalShipments?: number;
  activeShipments?: number;
  deliveredToday?: number;
  cancelledToday?: number;
  totalRevenue?: number;
  pendingPayments?: number;
  totalCouriers?: number;
  availableCouriers?: number;
  totalCustomers?: number;
  averageDeliveryHours?: number;
  onTimeRatePercent?: number;
  refundRatePercent?: number;
  lastUpdatedAt?: string;
}

export interface CourierEarningsSummary {
  totalDeliveries: number;
  totalEarnings: number;
  currency: string;
  fromDate?: string | null;
  toDate?: string | null;
  perDeliveryAvg: number;
  bonusAmount?: number;
  adjustments?: number;
  netAmount: number;
}

export interface CourierEarningsEntry {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  amount: number;
  type: "DELIVERY" | "BONUS" | "ADJUSTMENT" | "DEDUCTION";
  description?: string | null;
  earnedAt: string;
}

export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptime: number;
  environment: string;
  version?: string;
  checks?: Record<string, { status: "ok" | "error"; latencyMs?: number }>;
}

export interface AdminShipmentFilter {
  status?: ShipmentStatus;
  serviceType?: ServiceType;
  search?: string;
  originHubId?: string;
  destinationHubId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  profileImageUrl?: string | null;
}
