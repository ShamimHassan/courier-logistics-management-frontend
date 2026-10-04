export const BD_PHONE_REGEX = /^(?:\+8801|01)[3-9]\d{8}$/;
export const PASSWORD_UPPERCASE = /[A-Z]/;
export const PASSWORD_NUMBER = /\d/;
export const PASSWORD_SYMBOL = /[^A-Za-z0-9]/;

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const normalizePhone = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.startsWith("01") ? `+880${trimmed.slice(1)}` : trimmed;
};

export const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "totalAmount",
  "status",
] as const;
export type AllowedSortField = (typeof ALLOWED_SORT_FIELDS)[number];

export const PICKUP_CONDITIONS = [
  "GOOD",
  "DAMAGED",
  "PACKAGING_WORN",
] as const;
export type PickupCondition = (typeof PICKUP_CONDITIONS)[number];

export const DELIVERY_FAILURE_REASONS = [
  "RECIPIENT_UNAVAILABLE",
  "WRONG_ADDRESS",
  "REFUSED",
  "BAD_WEATHER",
  "OTHER",
] as const;
export type DeliveryFailureReason =
  (typeof DELIVERY_FAILURE_REASONS)[number];

export const ASSIGNMENT_REJECT_REASONS = [
  "VEHICLE_ISSUE",
  "PERSONAL_EMERGENCY",
  "WRONG_ZONE",
  "PACKAGE_CONFLICT",
  "OTHER",
] as const;
export type AssignmentRejectReason =
  (typeof ASSIGNMENT_REJECT_REASONS)[number];
