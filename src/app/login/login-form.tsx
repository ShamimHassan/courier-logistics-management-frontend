"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Package,
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";

import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useAuthStore, getRoleHome, selectIsAuthenticated } from "@/store/useAuthStore";
import { ApiRequestError } from "@/lib/api/client";
import DemoLoginCard from "@/components/auth/DemoLoginCard";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? undefined;
  const errorParam = searchParams.get("error");

  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticating = useAuthStore((s) => s.isAuthenticating);
  const authLogin = useAuthStore((s) => s.login);
  const user = useAuthStore((s) => s.user);

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (errorParam === "Unauthorized") {
      toast.error("Please log in to access that page.", {
        description: "Your session may have expired or you need a different role.",
      });
    }
    if (errorParam === "LoggedOut") {
      toast.success("You have been signed out securely.");
    }
  }, [errorParam]);

  useEffect(() => {
    if (!isHydrated) return;
    if (isAuthenticated && user) {
      const destination = redirectTo ?? getRoleHome(user.role);
      router.replace(destination);
    }
  }, [isHydrated, isAuthenticated, user, redirectTo, router]);

  const onSubmit = async (values: LoginInput) => {
    try {
      const result = await authLogin({
        email: values.email,
        password: values.password,
      });
      if (result.ok && result.user) {
        toast.success(`Welcome back, ${result.user.name.split(" ")[0]}!`, {
          description: "Signing you in to your dashboard…",
        });
        const destination = redirectTo ?? getRoleHome(result.user.role);
        router.replace(destination);
      }
    } catch (err) {
      const apiErr = err as ApiRequestError;
      const status = apiErr.status;

      if (status === 401 || status === 403 || apiErr.code === "INVALID_CREDENTIALS") {
        form.setError("email", {
          type: "manual",
          message: " ",
        });
        form.setError("password", {
          type: "manual",
          message: "Invalid email or password. Please try again.",
        });
        toast.error("Sign in failed", {
          description: "The email and password combination does not match our records.",
        });
      } else if (status === 423 || apiErr.code === "ACCOUNT_SUSPENDED") {
        toast.error("Account suspended", {
          description: "Your account is currently suspended. Please contact support.",
        });
      } else if (status === 412 || apiErr.code === "PENDING_APPROVAL") {
        toast.warning("Account pending approval", {
          description: "Your courier application is under review. We'll email you once approved.",
        });
      } else {
        toast.error(apiErr.message || "Sign in failed", {
          description: status
            ? `Server responded with ${status}. Please try again.`
            : "Check your internet connection and try again.",
        });
      }
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-xl font-bold text-primary"
          >
            <Package className="h-6 w-6" />
            CourierFlow
          </Link>
          <p className="text-sm text-muted-foreground">
            Bangladesh-wide courier &amp; logistics platform
          </p>
        </div>

        <Card className="border-muted/60 bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Sign in
            </CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
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
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <button
                          type="button"
                          onClick={() =>
                            toast.info("Password recovery coming soon", {
                              description:
                                "For the demo, use your registered credentials or one of the quick demo login buttons above.",
                            })
                          }
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <InputGroupText>
                              <LockKeyhole className="h-4 w-4" />
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? true}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                          disabled={isAuthenticating}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label className="text-sm font-medium">
                          Remember me for 30 days
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Skip signing in on this device. Uncheck on shared
                          computers.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      New to CourierFlow?
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link href="/register">Create a customer account</Link>
                </Button>

                <p className="pt-2 text-center text-xs text-muted-foreground">
                  By signing in, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        <DemoLoginCard />

        <p className="text-center text-xs text-muted-foreground">
          CourierFlow demo · SSLCommerz sandbox mode ·{" "}
          <Link href="/contact" className="underline underline-offset-2">
            Need help?
          </Link>
        </p>
      </div>
    </div>
  );
}
