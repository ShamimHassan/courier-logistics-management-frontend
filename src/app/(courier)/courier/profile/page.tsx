"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  IdCard,
  KeyRound,
  Loader2,
  MapPin,
  PackageCheck,
  SaveAll,
  ShieldCheck,
  Star,
  Truck,
  User,
} from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  getCourierMe,
  getMe,
  updateMe,
  changePassword,
  setCourierAvailability,
  type CourierMeResponse,
} from "@/lib/api/endpoints";
import type { User as UserType } from "@/lib/api/types";
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from "@/lib/validations/user";
import { cn, formatBDT, formatDate } from "@/lib/utils";

/* ─── helpers ────────────────────────────────────────────────────────────────── */

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─── Password strength indicator (shared with customer profile) ─────────────── */

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
      {password.length > 0 && (
        <div className="flex gap-1 h-1.5">
          {[1, 2, 3, 4].map((seg) => (
            <div
              key={seg}
              className={cn(
                "flex-1 rounded-full transition-colors",
                passedCount >= seg && strength
                  ? colourMap[strength]
                  : "bg-muted",
              )}
            />
          ))}
        </div>
      )}
      <ul className="grid gap-1 text-[11px]">
        {PASSWORD_RULES.map((r) => {
          const ok = password.length > 0 && r.test(password);
          return (
            <li
              key={r.label}
              className={cn(
                "flex items-center gap-1.5",
                ok
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  ok ? "bg-emerald-500" : "bg-muted-foreground/40",
                )}
              />
              {r.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Availability toggle card ───────────────────────────────────────────────── */

function AvailabilityCard({
  profile,
  isLoading,
}: {
  profile: CourierMeResponse["profile"] | undefined;
  isLoading: boolean;
}) {
  const qc = useQueryClient();
  const [optimistic, setOptimistic] = React.useState<boolean | null>(null);
  const isAvailable = optimistic ?? profile?.available ?? false;

  const { mutate, isPending } = useApiMutation({
    mutationFn: (val: boolean) => setCourierAvailability({ available: val }),
    successToast: false,
    onSuccess: (data, val) => {
      setOptimistic(null);
      qc.setQueryData<CourierMeResponse>(["courier", "me"], (old) =>
        old
          ? { profile: { ...old.profile, available: (data as { isAvailable: boolean }).isAvailable } }
          : old,
      );
      toast.success(
        val ? "You are now available for assignments." : "You are now unavailable.",
      );
    },
    onError: () => setOptimistic(null),
  });

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="h-4.5 w-4.5 text-amber-500" />
          Availability
        </CardTitle>
        <CardDescription>
          Turn this on so dispatch can assign you new shipments.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        {isLoading ? (
          <Skeleton className="h-14 w-full rounded-lg" />
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label
                  htmlFor="courier-available-profile"
                  className="text-sm font-medium cursor-pointer"
                >
                  Available for new assignments
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Auto-synced to the CourierFlow dispatch engine.
                </p>
              </div>
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <Switch
                  id="courier-available-profile"
                  checked={isAvailable}
                  onCheckedChange={(val) => {
                    setOptimistic(val);
                    mutate(val);
                  }}
                  aria-label="Toggle availability"
                />
              )}
            </div>
            <p
              className={cn(
                "mt-3 text-xs flex items-center gap-1.5 font-medium",
                isAvailable
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isAvailable ? "bg-emerald-500" : "bg-slate-400",
                )}
              />
              {isAvailable ? "Currently available" : "Currently unavailable"}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Courier stats summary card ─────────────────────────────────────────────── */

function CourierStatsCard({
  profile,
  isLoading,
}: {
  profile: CourierMeResponse["profile"] | undefined;
  isLoading: boolean;
}) {
  const stats = [
    {
      label: "Total deliveries",
      value: isLoading ? null : (profile?.totalDeliveries ?? 0),
      icon: PackageCheck,
      accent: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Average rating",
      value: isLoading
        ? null
        : profile?.averageRating != null
          ? Number(profile.averageRating).toFixed(1)
          : "—",
      icon: Star,
      accent: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      label: "Total earnings",
      value: isLoading ? null : formatBDT(profile?.totalEarnings ?? 0),
      icon: PackageCheck,
      accent: "text-indigo-600",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Coverage radius",
      value: isLoading
        ? null
        : (profile as any)?.coverageRadiusKm != null
          ? `${(profile as any).coverageRadiusKm} km`
          : "—",
      icon: MapPin,
      accent: "text-blue-600",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <PackageCheck className="h-4.5 w-4.5 text-indigo-500" />
          Performance Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl border bg-card/50 p-3 space-y-2"
            >
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  s.bg,
                )}
              >
                <Icon className={cn("h-4 w-4", s.accent)} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {s.label}
                </p>
                {isLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className={cn("text-lg font-bold", s.accent)}>{s.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ─── Vehicle info card (read-only; backend doesn't expose PATCH for these) ──── */

function VehicleInfoCard({
  profile,
  isLoading,
}: {
  profile: CourierMeResponse["profile"] | undefined;
  isLoading: boolean;
}) {
  const fields = [
    {
      label: "Vehicle type",
      value: (profile as any)?.vehicleType ?? null,
      icon: Car,
    },
    {
      label: "Plate number",
      value: (profile as any)?.vehiclePlateNumber ?? null,
      icon: Car,
    },
    {
      label: "Driver license",
      value: (profile as any)?.driverLicenseNumber ?? null,
      icon: IdCard,
    },
    {
      label: "Approval status",
      value: (profile as any)?.approvalStatus ?? null,
      icon: ShieldCheck,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Car className="h-4.5 w-4.5 text-amber-500" />
          Vehicle &amp; License
        </CardTitle>
        <CardDescription>
          Contact support to update vehicle or license details.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))
        ) : (
          fields.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="flex items-center justify-between py-2 border-b last:border-0 gap-3"
              >
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                  {f.label}
                </p>
                {f.value ? (
                  <p className="text-sm font-medium text-right truncate">{f.value}</p>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Not set</span>
                )}
              </div>
            );
          })
        )}
        {(profile as any)?.notes && (
          <div className="rounded-lg border bg-muted/30 p-3 mt-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
              Notes
            </p>
            <p className="text-xs text-muted-foreground italic">
              {(profile as any).notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Service zones table ────────────────────────────────────────────────────── */

function ServiceZonesCard({
  profile,
  isLoading,
}: {
  profile: CourierMeResponse["profile"] | undefined;
  isLoading: boolean;
}) {
  const zones = profile?.serviceZones ?? [];

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4.5 w-4.5 text-blue-500" />
          Service Zones
        </CardTitle>
        <CardDescription>
          Zones you are assigned to cover. Contact admin to update zone assignments.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : zones.length === 0 ? (
          <div className="py-10 text-center space-y-2 px-4">
            <MapPin className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-muted-foreground">
              No zones assigned yet
            </p>
            <p className="text-xs text-muted-foreground">
              Contact your admin to get assigned to service zones.
            </p>
          </div>
        ) : (
          <Table className="[&_td]:py-3 [&_th]:py-2.5">
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((sz) => (
                <TableRow key={sz.id}>
                  <TableCell className="font-medium text-sm">
                    {sz.zone.name}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">
                      {sz.zone.code}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sz.zone.city ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sz.zone.region ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={sz.isPrimary ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      {sz.isPrimary ? "Primary" : "Secondary"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Edit profile form (user fields: name, phone, avatar) ───────────────────── */

function EditProfileForm({
  user,
  userLoading,
}: {
  user: UserType | undefined;
  userLoading: boolean;
}) {
  const qc = useQueryClient();

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", phone: "", profileImageUrl: "" },
  });

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

  const imageUrl = form.watch("profileImageUrl");

  const onSubmit = (values: UpdateProfileInput) => {
    const cleaned: UpdateProfileInput = {};
    if (values.name?.trim()) cleaned.name = values.name.trim();
    if (values.phone?.trim()) cleaned.phone = values.phone.trim();
    if (values.profileImageUrl !== undefined)
      cleaned.profileImageUrl = values.profileImageUrl || null;
    mutate(cleaned);
  };

  return (
    <Card>
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-indigo-500" />
          Edit Profile
        </CardTitle>
        <CardDescription>
          Update your display name, Bangladesh mobile number and profile image.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-6">
          {userLoading ? (
            <Skeleton className="h-16 w-16 rounded-full" />
          ) : (
            <Avatar className="h-16 w-16">
              {imageUrl ? (
                <AvatarImage src={imageUrl} alt={user?.name ?? "Avatar"} />
              ) : null}
              <AvatarFallback className="text-base font-bold bg-linear-to-br from-amber-500 to-orange-500 text-white">
                {user ? initialsOf(user.name) : "…"}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="space-y-0.5 min-w-0">
            {userLoading ? (
              <>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56 mt-1" />
              </>
            ) : (
              <>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px] border-amber-400/40 text-amber-700">
                    COURIER
                  </Badge>
                  <Badge
                    variant={user?.status === "ACTIVE" ? "default" : "destructive"}
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
                      disabled={userLoading}
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
                      disabled={userLoading}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Bangladesh mobile — 01X-XXXXXXXX format.
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
                      disabled={userLoading}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Paste a direct image URL. Leave blank to remove avatar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-1 flex justify-end">
              <Button
                type="submit"
                disabled={isPending || userLoading}
                size="sm"
              >
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

/* ─── Change password card ───────────────────────────────────────────────────── */

function ChangePasswordCard() {
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
    successToast: "Password changed successfully.",
    onSuccess: () => form.reset(),
  });

  return (
    <Card>
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="h-4.5 w-4.5 text-amber-500" />
          Change Password
        </CardTitle>
        <CardDescription>
          Use a strong password with uppercase, number and symbol.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutate(v))}
            className="space-y-5"
          >
            {/* Current */}
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
                        aria-label={showCurrent ? "Hide" : "Show"}
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

            {/* New */}
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
                        aria-label={showNew ? "Hide" : "Show"}
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

            {/* Confirm */}
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
                        aria-label={showConfirm ? "Hide" : "Show"}
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

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function CourierProfilePage() {
  // Fetch both user record and courier profile in parallel
  const { data: user, isLoading: userLoading } = useApiQuery<UserType>({
    queryKey: ["users", "me"],
    queryFn: getMe,
    staleTime: 5 * 60_000,
  });

  const { data: profileData, isLoading: profileLoading } =
    useApiQuery<CourierMeResponse>({
      queryKey: ["courier", "me"],
      queryFn: getCourierMe,
      staleTime: 2 * 60_000,
    });

  const profile = profileData?.profile;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Truck className="h-5 w-5 text-amber-500" />
          Courier Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your availability, vehicle details and account security.
        </p>
      </div>

      {/* Two-column layout on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT column: user profile + password */}
        <div className="lg:col-span-7 space-y-5">
          <EditProfileForm user={user} userLoading={userLoading} />
          <ChangePasswordCard />
        </div>

        {/* RIGHT column: availability + stats + vehicle + zones */}
        <div className="lg:col-span-5 space-y-5">
          <AvailabilityCard profile={profile} isLoading={profileLoading} />
          <CourierStatsCard profile={profile} isLoading={profileLoading} />
          <VehicleInfoCard profile={profile} isLoading={profileLoading} />
        </div>
      </div>

      {/* Zones table — full width */}
      <ServiceZonesCard profile={profile} isLoading={profileLoading} />
    </div>
  );
}
