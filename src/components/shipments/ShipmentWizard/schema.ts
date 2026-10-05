import { z } from "zod";
import {
  BD_PHONE_REGEX,
  PKG_CATEGORIES,
  normalizePhone,
} from "@/lib/validations/constants";
import type { ServiceType } from "@/lib/api/types";

const MAX_DIMENSION_CM = 300;
const MAX_PARCEL_WEIGHT_KG = 500;
const MIN_PARCEL_WEIGHT_KG = 0.1;
const PARCEL_CATEGORIES = PKG_CATEGORIES as readonly string[];
const SERVICE_TYPES: readonly [ServiceType, ...ServiceType[]] = [
  "STANDARD",
  "EXPRESS",
  "OVERNIGHT",
];

/* ===================================================================
 * 4-step wizard zod schema — used by page.tsx root RHF
 * Field names match nested FormField "sender.fullName" usage.
 * Mirror zod API patterns from shipment.ts exactly.
 * =================================================================== */

const labelSchema = z.enum(["home", "office", "other", ""]).optional();

export const senderAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Enter at least 3 characters")
    .max(120, "Max 120 characters"),
  phone: z
    .string()
    .trim()
    .min(10, "Phone number is too short")
    .regex(BD_PHONE_REGEX, "Use a valid BD phone (+880 1XXXXXXXXX or 01XXXXXXXXX)")
    .transform(normalizePhone),
  street: z
    .string()
    .trim()
    .min(8, "Enter full street (house/road/area)")
    .max(255, "Max 255 characters"),
  city: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .max(80, "Max 80 characters"),
  region: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .max(80, "Max 80 characters"),
  zip: z
    .string()
    .trim()
    .regex(/^\d{0,5}$/, "Use a 4-5 digit BD post code")
    .max(5, "Max 5 digits")
    .optional()
    .or(z.literal("")),
  zoneId: z.string().min(2, "Pick a pricing zone"),
  label: labelSchema,
});

export const parcelSchema = z
  .object({
    weightKg: z.coerce
      .number({ message: "Weight must be a number" })
      .min(MIN_PARCEL_WEIGHT_KG, `Min ${MIN_PARCEL_WEIGHT_KG.toFixed(1)} kg`)
      .max(MAX_PARCEL_WEIGHT_KG, `Max ${MAX_PARCEL_WEIGHT_KG} kg per shipment`),
    lengthCm: z.coerce
      .number({ message: "Length must be a number" })
      .optional()
      .nullable(),
    widthCm: z.coerce
      .number({ message: "Width must be a number" })
      .optional()
      .nullable(),
    heightCm: z.coerce
      .number({ message: "Height must be a number" })
      .optional()
      .nullable(),
    category: z
      .enum(PARCEL_CATEGORIES as [string, ...string[]])
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(255, "Description max 255 characters")
      .optional()
      .or(z.literal("")),
    isFragile: z.boolean().default(false),
    insuranceEnabled: z.boolean().default(false),
    declaredValue: z.coerce
      .number({ message: "Declared value must be BDT amount" })
      .min(0, "Cannot be negative")
      .default(0),
  })
  .superRefine((data, ctx) => {
    const dims = [data.lengthCm, data.widthCm, data.heightCm];
    const hasAny = dims.some(
      (d) => typeof d === "number" && !Number.isNaN(d),
    );
    const hasAll = dims.every(
      (d) => typeof d === "number" && !Number.isNaN(d),
    );
    if (hasAny && !hasAll) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fill all three dimensions (L/W/H) or leave all empty",
        path: ["lengthCm"],
      });
    }
    if (hasAll) {
      (
        [
          ["lengthCm", data.lengthCm],
          ["widthCm", data.widthCm],
          ["heightCm", data.heightCm],
        ] as const
      ).forEach(([key, val]) => {
        if (typeof val === "number") {
          if (val <= 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Dimension must be greater than 0",
              path: [key],
            });
          } else if (val > MAX_DIMENSION_CM) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Max side ${MAX_DIMENSION_CM} cm`,
              path: [key],
            });
          }
        }
      });
    }
    if (
      typeof data.weightKg === "number" &&
      data.weightKg >= 10 &&
      !hasAll
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dimensions are required for parcels ≥ 10 kg",
        path: ["lengthCm"],
      });
    }
    if (data.insuranceEnabled) {
      if (!data.declaredValue || data.declaredValue <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter declared parcel value to enable insurance",
          path: ["declaredValue"],
        });
      } else if (data.declaredValue > 200000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Insurance max ৳200,000",
          path: ["declaredValue"],
        });
      }
    }
  });

export const wizard4Schema = z
  .object({
    sender: senderAddressSchema,
    recipient: senderAddressSchema,
    parcel: parcelSchema,
    serviceType: z.enum(SERVICE_TYPES),
    codEnabled: z.boolean().default(false),
    codAmount: z.coerce
      .number({ message: "COD amount must be BDT amount" })
      .min(0, "Cannot be negative")
      .default(0),
    deliveryInstructions: z
      .string()
      .trim()
      .max(500, "Max 500 characters")
      .optional()
      .or(z.literal("")),
    specialNotes: z
      .string()
      .trim()
      .max(500, "Max 500 characters")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.codEnabled && (!data.codAmount || data.codAmount <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter the COD amount to collect on delivery",
        path: ["codAmount"],
      });
    }
  });

export type Wizard4StepInput = z.infer<typeof wizard4Schema>;
export type Wizard4Address = z.infer<typeof senderAddressSchema>;
export type Wizard4Parcel = z.infer<typeof parcelSchema>;
