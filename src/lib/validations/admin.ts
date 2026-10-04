import { z } from "zod";
import type {
  Role,
  ServiceType,
  UserStatus,
} from "@/lib/api/types";
import { ASSIGNMENT_REJECT_REASONS } from "./constants";

const SERVICE_TYPES: [ServiceType, ...ServiceType[]] = [
  "STANDARD",
  "EXPRESS",
  "OVERNIGHT",
];
const ROLES: [Role, ...Role[]] = ["ADMIN", "COURIER", "CUSTOMER"];
const USER_STATUSES: [UserStatus, ...UserStatus[]] = [
  "ACTIVE",
  "SUSPENDED",
  "PENDING_APPROVAL",
];

export const assignCourierSchema = z.object({
  courierId: z.string().min(1, "Courier is required"),
});

export const unassignedListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  originHubId: z.string().optional(),
  destinationHubId: z.string().optional(),
  serviceType: z.enum(SERVICE_TYPES).optional(),
});

export const createPricingRuleSchema = z.object({
  originZoneId: z.string().optional(),
  destinationZoneId: z.string().optional(),
  serviceType: z.enum(SERVICE_TYPES),
  minWeightKg: z.coerce.number().nonnegative().default(0),
  maxWeightKg: z.coerce.number().positive(),
  basePrice: z.coerce.number().int().positive(),
  weightSurchargePerKg: z.coerce.number().int().nonnegative().default(0),
  expressFee: z.coerce.number().int().nonnegative().default(0),
  insuranceFeePercent: z.coerce.number().nonnegative().default(0),
  taxRatePercent: z.coerce.number().nonnegative().default(5),
  codFeePercent: z.coerce.number().nonnegative().default(0),
  codFeeMin: z.coerce.number().int().nonnegative().default(0),
  effectiveFrom: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), {
      message: "effectiveFrom must be a valid ISO date",
    }),
  effectiveUntil: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), {
      message: "effectiveUntil must be a valid ISO date",
    }),
});

export const updatePricingRuleSchema = z
  .object({
    isActive: z.boolean().optional(),
    effectiveUntil: z
      .string()
      .optional()
      .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), {
        message: "effectiveUntil must be a valid ISO date",
      }),
    basePrice: z.coerce.number().int().positive().optional(),
    weightSurchargePerKg: z.coerce.number().int().nonnegative().optional(),
    taxRatePercent: z.coerce.number().nonnegative().optional(),
    expressFee: z.coerce.number().int().nonnegative().optional(),
    insuranceFeePercent: z.coerce.number().nonnegative().optional(),
    codFeePercent: z.coerce.number().nonnegative().optional(),
    codFeeMin: z.coerce.number().int().nonnegative().optional(),
  })
  .strict();

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  search: z.string().trim().max(100).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"] as const),
  reason: z.string().trim().min(3).max(500).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(ROLES),
  reason: z.string().trim().min(3).max(500),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  actorId: z.string().optional(),
  entityType: z.string().trim().max(100).optional(),
  entityId: z.string().optional(),
  action: z.string().trim().max(100).optional(),
  fromDate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime())),
  toDate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime())),
});

export const rejectAssignmentSchema = z.object({
  reason: z.enum(ASSIGNMENT_REJECT_REASONS, {
    message: `reason must be one of: ${ASSIGNMENT_REJECT_REASONS.join(", ")}`,
  }),
  notes: z.string().trim().max(500).optional(),
});

export const refundPaymentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Reason is required")
    .max(500),
  amount: z.coerce.number().int().positive().optional(),
});

export const listHubsSchema = z.object({
  zoneId: z.string().optional(),
  status: z.enum(["active", "inactive", "all"]).optional().default("active"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createHubSchema = z.object({
  name: z.string().trim().min(2).max(200),
  code: z.string().trim().toUpperCase().min(3).max(50),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  region: z.string().trim().min(2).max(100),
  zip: z.string().trim().max(20),
  originZoneId: z.string().optional(),
  destinationZoneId: z.string().optional(),
  operatingHours: z.string().trim().max(200).optional(),
  contactPhone: z.string().trim().max(30).optional(),
  isActive: z.boolean().default(true),
});

export const updateHubSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional(),
    address: z.string().trim().min(5).max(300).optional(),
    city: z.string().trim().min(2).max(100).optional(),
    region: z.string().trim().min(2).max(100).optional(),
    zip: z.string().trim().max(20).optional(),
    operatingHours: z.string().trim().max(200).optional().nullable(),
    contactPhone: z.string().trim().max(30).optional().nullable(),
    isActive: z.boolean().optional(),
    originZoneId: z.string().optional().nullable(),
    destinationZoneId: z.string().optional().nullable(),
  })
  .strict();

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  read: z.enum(["true", "false"]).optional(),
});

export const earningsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  fromDate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime())),
  toDate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime())),
});

export type AssignCourierInput = z.infer<typeof assignCourierSchema>;
export type UnassignedListQuery = z.infer<typeof unassignedListSchema>;
export type CreatePricingRuleInput = z.infer<typeof createPricingRuleSchema>;
export type UpdatePricingRuleInput = z.infer<typeof updatePricingRuleSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
export type RejectAssignmentInput = z.infer<typeof rejectAssignmentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type ListHubsQuery = z.infer<typeof listHubsSchema>;
export type CreateHubInput = z.infer<typeof createHubSchema>;
export type UpdateHubInput = z.infer<typeof updateHubSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsSchema>;
export type EarningsQuery = z.infer<typeof earningsQuerySchema>;
