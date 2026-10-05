"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  SaveAll,
  ShieldCheck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { getMe, updateMe, changePassword } from "@/lib/api/endpoints";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "@/lib/validations/user";
import { formatDateTime } from "@/lib/utils";

/* ─── helpers ─── */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─── Password rules indicator ─── */
const PASSWORD_RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function PasswordStrengthIndicator({ password }: { password: string }) {
  const passedCount = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strength =
    passedCount === 0
      ? null
      : passedCount <= 1
        ? "weak"
        : passedCount <= 2
          ? "fair"
          : passedCount <= 3
            ? "good"
            : "strong";

  const colourMap = {
    weak: "bg-rose-500",
    fair: "bg-amber-500",
    good: "bg-blue-500",
    strong: "bg-emerald-500",
  };

  return (
    <div className="space-y-2 pt-1">
      {/* bar */}
      {password.length > 0 && (
        <div className="flex gap-1 h-1.5">
          {[1, 2, 3, 4].map((seg) => (
            <div
              key={seg}
              className={`flex-1 rounded-full transition-colors ${
                passedCount >= seg && strength
                  ? colourMap[strength]
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      )}
      {/* rule list */}
      <ul className="grid gap-1 text-[11px]">
        {PASSWORD_RULES.map((r) => {
          const ok = password.length > 0 && r.test(password);
          return (
            <li
              key={r.label}
              className={`flex items-center gap-1.5 ${
                ok
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
              />
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Edit profile form ─── */
function EditProfileForm() {
  const qc = useQueryClient();

  const { data: user, isLoading } = useApiQuery({
    queryKey: ["users", "me"],
    queryFn: getMe,
    staleTime: 5 * 60_000,
  });

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", phone: "", profileImageUrl: "" },
  });

  // Sync form defaults once user loads
  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        phone: user.phone ?? "",
        profileImageUrl: user.profileImageUrl ?? "",
      });
    }
  }, [user, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: (data: UpdateProfileInput) => updateMe(data),
    successToast: "Profile updated successfully.",
    onSuccess: (updated) => {
      qc.setQueryData(["users", "me"], updated);
    },
  });

  const onSubmit = (values: UpdateProfileInput) => {
    // Strip empty strings to avoid sending them as empty updates
    const cleaned: UpdateProfileInput = {};
    if (values.name?.trim()) cleaned.name = values.name.trim();
    if (values.phone?.trim()) cleaned.phone = values.phone.trim();
    if (values.profileImageUrl !== undefined)
      cleaned.profileImageUrl = values.profileImageUrl || null;
    mutate(cleaned);
  };

  const imageUrl = form.watch("profileImageUrl");

  return (
    <Card>
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-indigo-500" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your display name, Bangladesh mobile number and profile image URL.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6">
          {isLoading ? (
            <Skeleton className="h-16 w-16 rounded-full" />
          ) : (
            <Avatar className="h-16 w-16">
              {imageUrl ? (
                <AvatarImage src={imageUrl} alt={user?.name ?? "Avatar"} />
              ) : null}
              <AvatarFallback className="text-base font-bold bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                {user ? initialsOf(user.name) : "…"}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="space-y-0.5">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56 mt-1" />
              </>
            ) : (
              <>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {user?.role}
                  </Badge>
                  <Badge
                    variant={
                      user?.status === "ACTIVE" ? "default" : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {user?.status}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Rahim Uddin"
                      {...field}
                      disabled={isLoading}
                    />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+8801XXXXXXXXX or 01XXXXXXXXX"
                      type="tel"
                      autoComplete="tel"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Bangladesh mobile number — 01X-XXXXXXXX format.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5" />
                    Profile Image URL
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://res.cloudinary.com/…"
                      type="url"
                      {...field}
                      value={field.value ?? ""}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Paste a direct image URL (Cloudinary, Imgur, etc.). Leave
                    blank to remove your avatar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-1 flex items-center justify-between gap-3 flex-wrap">
              {user?.updatedAt ? (
                <p className="text-[11px] text-muted-foreground">
                  Last updated: {formatDateTime(user.updatedAt)}
                </p>
              ) : (
                <span />
              )}
              <Button type="submit" disabled={isPending || isLoading} size="sm">
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SaveAll className="h-4 w-4 mr-2" />
                )}
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ─── Change password form ─── */
function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPasswordValue = form.watch("newPassword");

  const { mutate, isPending } = useApiMutation({
    mutationFn: (data: ChangePasswordInput) =>
      changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }),
    successToast: "Password changed successfully. Please log in again if prompted.",
    onSuccess: () => {
      form.reset();
    },
  });

  const onSubmit = (values: ChangePasswordInput) => {
    mutate(values);
  };

  return (
    <Card>
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4.5 w-4.5 text-amber-500" />
          Change Password
        </CardTitle>
        <CardDescription>
          Use a strong password with uppercase, number and symbol. Your current
          session stays active.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Current password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Your current password"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowCurrent((p) => !p)}
                        aria-label={showCurrent ? "Hide password" : "Show password"}
                      >
                        {showCurrent ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* New password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Create a strong new password"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowNew((p) => !p)}
                        aria-label={showNew ? "Hide password" : "Show password"}
                      >
                        {showNew ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <PasswordStrengthIndicator password={newPasswordValue} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm new password */}
            <FormField
              control={form.control}
              name="confirmNewPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Repeat your new password"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirm((p) => !p)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-1 flex justify-end">
              <Button type="submit" disabled={isPending} size="sm">
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2" />
                )}
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

/* ─── Page ─── */
export default function CustomerProfilePage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile information and account security.
        </p>
      </div>

      <EditProfileForm />
      <ChangePasswordForm />
    </div>
  );
}
