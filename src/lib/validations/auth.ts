import { z } from "zod";
import {
  BD_PHONE_REGEX,
  PASSWORD_NUMBER,
  PASSWORD_SYMBOL,
  PASSWORD_UPPERCASE,
  normalizeEmail,
  normalizePhone,
} from "./constants";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z
      .string()
      .trim()
      .email("Email must be valid")
      .transform(normalizeEmail),
    phone: z
      .string()
      .trim()
      .regex(BD_PHONE_REGEX, "Phone must be a valid Bangladesh mobile number")
      .transform(normalizePhone),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(
        (v) => PASSWORD_UPPERCASE.test(v),
        "Password must contain at least one uppercase letter",
      )
      .refine(
        (v) => PASSWORD_NUMBER.test(v),
        "Password must contain at least one number",
      )
      .refine(
        (v) => PASSWORD_SYMBOL.test(v),
        "Password must contain at least one symbol",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Email must be valid")
    .transform(normalizeEmail),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const demoLoginSchema = z.object({
  role: z.enum(["CUSTOMER", "COURIER", "ADMIN"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
export type DemoLoginInput = z.infer<typeof demoLoginSchema>;
