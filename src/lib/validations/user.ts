import { z } from "zod";
import {
  BD_PHONE_REGEX,
  PASSWORD_NUMBER,
  PASSWORD_SYMBOL,
  PASSWORD_UPPERCASE,
  normalizePhone,
} from "./constants";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(BD_PHONE_REGEX, "Phone must be a valid Bangladesh mobile number")
      .transform(normalizePhone)
      .optional(),
    profileImageUrl: z
      .string()
      .trim()
      .url("Profile image must be a valid URL")
      .max(500, "URL is too long")
      .optional()
      .nullable(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .refine(
        (v) => PASSWORD_UPPERCASE.test(v),
        "New password must contain at least one uppercase letter",
      )
      .refine(
        (v) => PASSWORD_NUMBER.test(v),
        "New password must contain at least one number",
      )
      .refine(
        (v) => PASSWORD_SYMBOL.test(v),
        "New password must contain at least one symbol",
      ),
    confirmNewPassword: z
      .string()
      .min(1, "Please confirm the new password"),
  })
  .refine(
    (data) => data.currentPassword !== data.newPassword,
    {
      message: "New password must be different from the current password",
      path: ["newPassword"],
    },
  )
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const setCourierAvailabilitySchema = z
  .object({
    available: z.boolean({
      message: "available must be true or false",
    }),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type SetCourierAvailabilityInput = z.infer<
  typeof setCourierAvailabilitySchema
>;
