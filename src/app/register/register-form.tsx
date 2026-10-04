"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";
import {
  BD_PHONE_REGEX,
  PASSWORD_NUMBER,
  PASSWORD_SYMBOL,
  PASSWORD_UPPERCASE,
} from "@/lib/validations/constants";
import {
  useAuthStore,
  getRoleHome,
  selectIsAuthenticated,
} from "@/store/useAuthStore";
import { ApiRequestError } from "@/lib/api/client";
import { env } from "@/lib/config/env";

type PasswordRuleKey = "length" | "uppercase" | "digit" | "symbol";

const PASSWORD_RULES: { key: PasswordRuleKey; label: string }[] = [
  { key: "length", label: "At least 8 characters" },
  { key: "uppercase", label: "One uppercase letter (A–Z)" },
  { key: "digit", label: "One number (0–9)" },
  { key: "symbol", label: "One symbol (!@#$…)" },
];

function testPasswordRule(key: PasswordRuleKey, value: string): boolean {
  switch (key) {
    case "length":
      return value.length >= 8;
    case "uppercase":
      return PASSWORD_UPPERCASE.test(value);
    case "digit":
      return PASSWORD_NUMBER.test(value);
    case "symbol":
      return PASSWORD_SYMBOL.test(value);
  }
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? undefined;
  const prefillEmail = searchParams.get("email") ?? undefined;

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  const authRegister = useAuthStore((s) => s.register);
  const user = useAuthStore((s) => s.user);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: prefillEmail ?? "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
    delayError: 150,
  });

  const passwordValue = form.watch("password");
  const confirmPasswordValue = form.watch("confirmPassword");

  const passwordScore = useMemo(() => {
    return PASSWORD_RULES.reduce(
      (acc, r) => (testPasswordRule(r.key, passwordValue ?? "") ? acc + 1 : acc),
      0,
    );
  }, [passwordValue]);

  const confirmMatches = useMemo(() => {
    if (!confirmPasswordValue) return true;
    return confirmPasswordValue === passwordValue;
  }, [passwordValue, confirmPasswordValue]);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated && user) {
      const destination = redirectTo ?? getRoleHome(user.role);
      router.replace(destination);
    }
  }, [isHydrated, isAuthenticated, user, redirectTo, router]);

  const onSubmit = async (values: RegisterInput) => {
    try {
      const result = await authRegister({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      if (result.ok && result.user) {
        toast.success("Account created successfully 🎉", {
          description: `Welcome to CourierFlow, ${result.user.name.split(" ")[0]}! Your dashboard is loading…`,
        });
        const destination = redirectTo ?? getRoleHome(result.user.role);
        router.replace(destination);
      }
    } catch (err) {
      const apiErr = err as ApiRequestError;
      const status = apiErr.status;

      const conflictField = apiErr.errors?.find(
        (e) => e.path && (e.path.includes("email") || e.path.includes("phone")),
      );

      if (status === 409 || apiErr.code === "DUPLICATE_EMAIL" || conflictField) {
        if (conflictField?.path?.includes("phone")) {
          form.setError("phone", {
            type: "manual",
            message:
              "This phone number is already registered. Sign in or use a different number.",
          });
          toast.error("Phone already in use", {
            description: "An account with this phone number already exists.",
          });
        } else {
          form.setError("email", {
            type: "manual",
            message: "Email already registered. Please sign in instead.",
          });
          toast.error("Email already registered", {
            description: (
              <span>
                <Link
                  href="/login"
                  className="underline underline-offset-2 font-medium"
                >
                  Go to Sign in
                </Link>
                , or request a password reset.
              </span>
            ),
          });
        }
        return;
      }

      if (apiErr.errors && apiErr.errors.length > 0) {
        for (const fieldErr of apiErr.errors) {
          const field = fieldErr.path?.[0];
          if (
            typeof field === "string" &&
            ["name", "email", "phone", "password", "confirmPassword"].includes(
              field,
            )
          ) {
            form.setError(field as keyof RegisterInput, {
              type: "manual",
              message: fieldErr.message,
            });
          }
        }
      }

      toast.error(apiErr.message || "Could not create your account", {
        description: status
          ? `Server responded with ${status}. Please try again.`
          : "Check your internet connection and try again.",
      });
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const googleAuthUrl = `${env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
  const phoneHint = BD_PHONE_REGEX.source
    .replace(/^(\(\?\:)/, "")
    .replace(/\\d/g, "X")
    .replace(/\[/, "[3-9]")
    .replace(/\]\\d\{8\}\$/, "XXXXXXXX")
    .slice(0, 22);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 px-4 py-10">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-xl font-bold text-primary"
          >
            <ShieldCheck className="h-6 w-6" />
            CourierFlow
          </Link>
          <p className="text-sm text-muted-foreground">
            Create a customer account to start shipping Bangladesh-wide
          </p>
        </div>

        <Card className="border-muted/60 bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>
              Already have an account?{" "}
              <Link
                href={
                  redirectTo
                    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                    : "/login"
                }
                className="text-primary font-medium underline underline-offset-2 hover:text-primary/80"
              >
                Sign in
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <InputGroupText>
                                <User className="h-4 w-4" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              type="text"
                              placeholder="Md. Rakib Hasan"
                              autoComplete="name"
                              disabled={isAuthenticating}
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bangladesh phone</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <InputGroupText>
                                <Phone className="h-4 w-4" />
                              </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              type="tel"
                              placeholder="01712345678"
                              autoComplete="tel"
                              disabled={isAuthenticating}
                              {...field}
                            />
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <InputGroupText>
                              <Mail className="h-4 w-4" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            disabled={isAuthenticating}
                            {...field}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <InputGroupText>
                              <LockKeyhole className="h-4 w-4" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            type={showPassword ? "text" : "password"}
                            placeholder="Choose a strong password"
                            autoComplete="new-password"
                            disabled={isAuthenticating}
                            {...field}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>

                      <div className="space-y-2 pt-2">
                        <div className="flex gap-1.5">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={[
                                "h-1.5 flex-1 rounded-full transition-colors",
                                i < passwordScore
                                  ? passwordScore === 1
                                    ? "bg-red-500"
                                    : passwordScore === 2
                                      ? "bg-amber-500"
                                      : passwordScore === 3
                                        ? "bg-lime-500"
                                        : "bg-emerald-500"
                                  : "bg-border",
                              ].join(" ")}
                            />
                          ))}
                        </div>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          {PASSWORD_RULES.map((rule) => {
                            const ok = testPasswordRule(rule.key, passwordValue ?? "");
                            return (
                              <li
                                key={rule.key}
                                className={[
                                  "flex items-start gap-1.5",
                                  ok
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground",
                                ].join(" ")}
                              >
                                {ok ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-60" />
                                )}
                                <span>{rule.label}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <InputGroupText>
                              <LockKeyhole className="h-4 w-4" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            disabled={isAuthenticating}
                            aria-invalid={!confirmMatches || undefined}
                            {...field}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              aria-label={
                                showConfirmPassword
                                  ? "Hide confirm password"
                                  : "Show confirm password"
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      {confirmPasswordValue && !confirmMatches ? (
                        <p className="text-xs font-medium text-destructive flex items-center gap-1.5 pt-1">
                          <XCircle className="h-3.5 w-3.5" />
                          Passwords do not match
                        </p>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isAuthenticating || !confirmMatches}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating your account…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Create account
                    </>
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <a
                  href={googleAuthUrl}
                  className="block no-underline"
                  aria-disabled={isAuthenticating}
                  onClick={(e) => {
                    if (isAuthenticating) e.preventDefault();
                  }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full gap-2"
                    asChild
                  >
                    <span>
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </span>
                  </Button>
                </a>

                <p className="pt-2 text-center text-xs text-muted-foreground leading-relaxed">
                  By creating an account, you agree to our Terms of Service &amp;
                  Privacy Policy. Your phone is only used for shipment &amp;
                  delivery notifications (we never sell or share).
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Already shipping with us?{" "}
                  <Link
                    href={
                      redirectTo
                        ? `/login?redirect=${encodeURIComponent(redirectTo)}`
                        : "/login"
                    }
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    Sign in to your existing account
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          CourierFlow demo · SSLCommerz sandbox ·{" "}
          <span className="tabular-nums">Format hint: {phoneHint}</span>
        </p>
      </div>
    </div>
  );
}
