import { z } from "zod";
import {
  ALLOWED_SORT_FIELDS,
  BD_PHONE_REGEX,
  DELIVERY_FAILURE_REASONS,
  PICKUP_CONDITIONS,
  normalizePhone,
} from "./constants";
import type {
  ServiceType,
  ShipmentStatus,
} from "@/lib/api/types";

const SERVICE_TYPES: [ServiceType, ...ServiceType[]] = [
  "STANDARD",
  "EXPRESS",
  "OVERNIGHT",
];

const SHIPMENT_STATUSES: [ShipmentStatus, ...ShipmentStatus[]] = [
  "DRAFT",
  "PAYMENT_PENDING",
  "PAYMENT_FAILED",
  "CONFIRMED",
  "ASSIGNMENT_PENDING",
  "ASSIGNED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERY_FAILED",
  "RETURN_REQUESTED",
  "RETURNED",
  "CANCELLED",
  "DELIVERED",
];

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100),
  phone: z
    .string()
    .trim()
    .regex(BD_PHONE_REGEX, "Phone must be a valid Bangladesh mobile number")
    .transform(normalizePhone),
  street: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(300),
  city: z.string().trim().min(2, "City is required").max(100),
  region: z.string().trim().min(2, "Region is required").max(100),
  zip: z.string().trim().max(20).optional(),
  country: z.string().trim().default("Bangladesh"),
  zoneId: z.string().min(1, "Zone is required"),
  label: z.string().trim().max(100).optional(),
});

export const quoteSchema = z
  .object({
    weightKg: z.coerce
      .number({ message: "weightKg must be a number" })
      .positive("weightKg must be greater than 0")
      .max(500, "weightKg cannot exceed 500 kg"),
    lengthCm: z.coerce
      .number({ message: "lengthCm must be a number" })
      .positive("lengthCm must be greater than 0")
      .max(300, "lengthCm cannot exceed 300 cm")
      .optional(),
    widthCm: z.coerce
      .number({ message: "widthCm must be a number" })
      .positive("widthCm must be greater than 0")
      .max(300, "widthCm cannot exceed 300 cm")
      .optional(),
    heightCm: z.coerce
      .number({ message: "heightCm must be a number" })
      .positive("heightCm must be greater than 0")
      .max(300, "heightCm cannot exceed 300 cm")
      .optional(),
    originZoneId: z.string().min(1, "Origin zone is required"),
    destinationZoneId: z.string().min(1, "Destination zone is required"),
    serviceType: z.enum(SERVICE_TYPES, {
      message: "serviceType must be STANDARD, EXPRESS, or OVERNIGHT",
    }),
    codEnabled: z.boolean().optional().default(false),
    codAmount: z.coerce
      .number()
      .int("codAmount must be an integer (BDT)")
      .nonnegative("codAmount cannot be negative")
      .optional()
      .default(0),
    insuranceEnabled: z.boolean().optional().default(false),
    declaredValue: z.coerce
      .number()
      .int("declaredValue must be an integer (BDT)")
      .nonnegative("declaredValue cannot be negative")
      .optional()
      .default(0),
  })
  .superRefine((data, ctx) => {
    const dims = [data.lengthCm, data.widthCm, data.heightCm];
    if (
      (dims.some((d) => d !== undefined) &&
        dims.some((d) => d === undefined)) ||
      (data.weightKg >= 10 && dims.every((d) => d === undefined))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Provide all three dimensions (length/width/height) or none; required for shipments ≥ 10 kg",
        path: ["lengthCm"],
      });
    }
  });

export const createShipmentSchema = z.object({
  sender: addressSchema,
  recipient: addressSchema,
  parcel: z.object({
    weightKg: z.coerce
      .number({ message: "parcel.weightKg must be a number" })
      .positive("parcel weight must be greater than 0")
      .max(500),
    lengthCm: z.coerce
      .number({ message: "parcel.lengthCm must be a number" })
      .positive()
      .max(300),
    widthCm: z.coerce
      .number({ message: "parcel.widthCm must be a number" })
      .positive()
      .max(300),
    heightCm: z.coerce
      .number({ message: "parcel.heightCm must be a number" })
      .positive()
      .max(300),
    category: z.string().trim().max(100).optional(),
    description: z.string().trim().max(500).optional(),
    declaredValue: z.coerce
      .number()
      .int("declaredValue must be an integer (BDT)")
      .nonnegative()
      .default(0),
    isFragile: z.boolean().default(false),
    insuranceEnabled: z.boolean().default(false),
  }),
  serviceType: z.enum(SERVICE_TYPES, {
    message: "serviceType must be STANDARD, EXPRESS, or OVERNIGHT",
  }),
  codAmount: z.coerce
    .number()
    .int("codAmount must be an integer")
    .nonnegative()
    .optional()
    .default(0),
  deliveryInstructions: z.string().trim().max(500).optional(),
  specialNotes: z.string().trim().max(500).optional(),
});

export const listShipmentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(SHIPMENT_STATUSES).optional(),
  serviceType: z.enum(SERVICE_TYPES).optional(),
  originHubId: z.string().optional(),
  destinationHubId: z.string().optional(),
  search: z.string().trim().max(100).optional(),
  fromDate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), {
      message: "fromDate must be a valid ISO date",
    }),
  toDate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), {
      message: "toDate must be a valid ISO date",
    }),
  sortBy: z
    .enum(ALLOWED_SORT_FIELDS, {
      message: `sortBy must be one of: ${ALLOWED_SORT_FIELDS.join(", ")}`,
    })
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const searchShipmentsSchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters")
    .max(100),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateShipmentSchema = z
  .object({
    deliveryInstructions: z.string().trim().max(500).optional().nullable(),
    specialNotes: z.string().trim().max(500).optional().nullable(),
    parcelDescription: z.string().trim().max(500).optional().nullable(),
    recipientPhone: z
      .string()
      .trim()
      .regex(BD_PHONE_REGEX, "Phone must be a valid Bangladesh mobile number")
      .transform(normalizePhone)
      .optional(),
    recipientName: z.string().trim().min(2).max(100).optional(),
  })
  .strict();

export const cancelShipmentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Cancellation reason must be at least 3 characters")
    .max(500),
});

export const pickupSchema = z.object({
  condition: z.enum(PICKUP_CONDITIONS, {
    message: `condition must be one of: ${PICKUP_CONDITIONS.join(", ")}`,
  }),
  notes: z.string().trim().max(500).optional(),
  photoUrl: z
    .string()
    .trim()
    .url("photoUrl must be a valid URL")
    .optional(),
});

export const statusTransitionSchema = z.object({
  status: z.enum(
    [
      "AT_ORIGIN_HUB",
      "IN_TRANSIT",
      "AT_DESTINATION_HUB",
      "OUT_FOR_DELIVERY",
    ] as const,
    {
      message:
        "status must be one of: AT_ORIGIN_HUB, IN_TRANSIT, AT_DESTINATION_HUB, OUT_FOR_DELIVERY",
    },
  ),
  hubId: z.string().optional(),
  location: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(500).optional(),
  adminReason: z.string().trim().min(3).max(500).optional(),
});

export const deliveryAttemptSchema = z.discriminatedUnion("outcome", [
  z.object({
    outcome: z.literal("DELIVERED"),
    recipientName: z
      .string()
      .trim()
      .min(2, "recipientName is required")
      .max(100),
    signatureUrl: z.string().trim().url().optional(),
    photoProofUrl: z
      .string()
      .trim()
      .url("photoProofUrl must be a valid URL"),
    otpVerified: z.boolean().optional().default(false),
    notes: z.string().trim().max(500).optional(),
  }),
  z.object({
    outcome: z.literal("FAILED"),
    failReason: z.enum(DELIVERY_FAILURE_REASONS, {
      message: `failReason must be one of: ${DELIVERY_FAILURE_REASONS.join(", ")}`,
    }),
    notes: z
      .string()
      .trim()
      .min(3, "notes is required for failed attempts")
      .max(500),
  }),
]);

export const ratingSchema = z.object({
  stars: z.coerce
    .number({ message: "stars must be a number" })
    .int("stars must be an integer")
    .min(1, "stars minimum is 1")
    .max(5, "stars maximum is 5"),
  comment: z.string().trim().max(500).optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type ListShipmentsQuery = z.infer<typeof listShipmentsSchema>;
export type SearchShipmentsQuery = z.infer<typeof searchShipmentsSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>;
export type CancelShipmentInput = z.infer<typeof cancelShipmentSchema>;
export type PickupInput = z.infer<typeof pickupSchema>;
export type StatusTransitionInput = z.infer<typeof statusTransitionSchema>;
export type DeliveryAttemptInput = z.infer<typeof deliveryAttemptSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
