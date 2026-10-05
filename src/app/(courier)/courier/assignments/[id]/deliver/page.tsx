"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Loader2,
  Package,
  PenLine,
  Phone,
  ShieldAlert,
  Truck,
  User,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import ShipmentStatusBadge from "@/components/dashboard/ShipmentStatusBadge";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { getShipment, recordDeliveryAttempt } from "@/lib/api/endpoints";
import type { DeliveryAttempt, FailDeliveryReason, Shipment } from "@/lib/api/types";
import { cn, formatBDT, formatDateTime } from "@/lib/utils";

/* ─── Failure reason labels ──────────────────────────────────────────────────── */

const FAIL_REASON_LABELS: Record<FailDeliveryReason, { label: string; description: string }> = {
  RECIPIENT_UNAVAILABLE: {
    label: "Recipient unavailable",
    description: "No one present to receive the parcel",
  },
  WRONG_ADDRESS: {
    label: "Wrong address",
    description: "Address is incorrect or does not exist",
  },
  REFUSED: {
    label: "Refused by recipient",
    description: "Recipient declined to accept the parcel",
  },
  BAD_WEATHER: {
    label: "Bad weather",
    description: "Unsafe conditions prevented delivery",
  },
  OTHER: {
    label: "Other",
    description: "Specify in the notes field",
  },
};

/* ─── Zod schema — mirrors backend discriminated union exactly ───────────────── */

const deliveredSchema = z.object({
  outcome: z.literal("DELIVERED"),
  recipientName: z
    .string()
    .trim()
    .min(2, "Recipient name is required (min 2 characters)")
    .max(100),
  photoProofUrl: z
    .string()
    .trim()
    .min(1, "Photo proof URL is required for delivered shipments")
    .url("Must be a valid URL (https://…)"),
  signatureUrl: z
    .string()
    .trim()
    .url("Signature URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  otpVerified: z.boolean().optional(),
});

const failedSchema = z.object({
  outcome: z.literal("FAILED"),
  reason: z.enum(
    ["RECIPIENT_UNAVAILABLE", "WRONG_ADDRESS", "REFUSED", "BAD_WEATHER", "OTHER"],
    { message: "Please select a failure reason" },
  ),
  notes: z
    .string()
    .trim()
    .min(3, "Notes are required for failed deliveries (min 3 characters)")
    .max(500),
});

// Union: the form stores both sets of fields but only validates relevant ones
const formSchema = z.discriminatedUnion("outcome", [deliveredSchema, failedSchema]);

type DeliveryFormValues = z.infer<typeof formSchema>;

/* ─── Success celebration banner ─────────────────────────────────────────────── */

function SuccessBanner({
  result,
  trackingNumber,
  onBack,
}: {
  result: DeliveryAttempt & { shipmentStatus?: string };
  trackingNumber: string | undefined;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] to-background shadow-md">
        <CardContent className="pt-10 pb-8 flex flex-col items-center text-center gap-4">
          {/* Animated check */}
          <div className="h-20 w-20 rounded-full bg-emerald-500/15 flex items-center justify-center ring-4 ring-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
              Delivery Complete!
            </h2>
            <p className="text-sm text-muted-foreground">
              Shipment{" "}
              <span className="font-mono font-semibold text-foreground">
                {trackingNumber ?? "—"}
              </span>{" "}
              has been delivered successfully.
            </p>
          </div>

          <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left space-y-2.5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Recipient
                </p>
                <p className="font-semibold mt-0.5">
                  {result.recipientName ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Delivered at
                </p>
                <p className="font-semibold mt-0.5 text-xs">
                  {formatDateTime(result.attemptedAt)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Attempt #
                </p>
                <p className="font-semibold mt-0.5">{result.attemptNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  OTP verified
                </p>
                <p className="font-semibold mt-0.5">
                  {result.otpVerified ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2 flex-wrap justify-center">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to assignment
            </Button>
            <Button asChild>
              <Link href="/courier/assignments">
                <Truck className="h-4 w-4 mr-2" />
                All assignments
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Failed delivery banner ─────────────────────────────────────────────────── */

function FailedBanner({
  result,
  trackingNumber,
  onBack,
}: {
  result: DeliveryAttempt & { shipmentStatus?: string };
  trackingNumber: string | undefined;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-lg border-rose-500/30 shadow-md">
        <CardContent className="pt-10 pb-8 flex flex-col items-center text-center gap-4">
          <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center ring-4 ring-rose-500/20">
            <XCircle className="h-10 w-10 text-rose-500" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">
              Delivery Attempt Recorded
            </h2>
            <p className="text-sm text-muted-foreground">
              Failed attempt #{result.attemptNumber} for{" "}
              <span className="font-mono font-semibold text-foreground">
                {trackingNumber ?? "—"}
              </span>{" "}
              has been logged.
            </p>
          </div>

          <div className="w-full rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-4 text-left space-y-2 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Reason
              </p>
              <p className="font-semibold mt-0.5">
                {result.failReason
                  ? FAIL_REASON_LABELS[result.failReason]?.label ?? result.failReason
                  : "—"}
              </p>
            </div>
            {result.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="text-muted-foreground italic mt-0.5">
                  &ldquo;{result.notes}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to assignment
            </Button>
            <Button asChild variant="outline">
              <Link href="/courier/assignments">All assignments</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────── */

export default function DeliveryAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [submittedResult, setSubmittedResult] = React.useState<
    (DeliveryAttempt & { shipmentStatus?: string }) | null
  >(null);

  // ── Fetch shipment ───────────────────────────────────────────────────────────
  const { data: shipment, isLoading: shipmentLoading } =
    useApiQuery<Shipment>({
      queryKey: ["shipments", "detail", id],
      queryFn: () => getShipment(id as string),
      enabled: !!id,
      staleTime: 60_000,
    });

  // ── Guard: only show form when OUT_FOR_DELIVERY ──────────────────────────────
  const isEligible = shipment?.status === "OUT_FOR_DELIVERY";

  // ── Form setup ───────────────────────────────────────────────────────────────
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outcome: "DELIVERED",
      recipientName: "",
      photoProofUrl: "",
      signatureUrl: "",
      otpVerified: false,
    } as DeliveryFormValues,
  });

  const outcome = form.watch("outcome");

  // When outcome changes, reset to fresh defaults for that branch
  React.useEffect(() => {
    if (outcome === "DELIVERED") {
      form.reset({
        outcome: "DELIVERED",
        recipientName: "",
        photoProofUrl: "",
        signatureUrl: "",
        otpVerified: false,
      });
    } else {
      form.reset({
        outcome: "FAILED",
        reason: undefined as unknown as FailDeliveryReason,
        notes: "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  // ── Mutation ─────────────────────────────────────────────────────────────────
  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: DeliveryFormValues) => {
      if (values.outcome === "DELIVERED") {
        return recordDeliveryAttempt(id as string, {
          outcome: "DELIVERED",
          recipientName: values.recipientName,
          photoProofUrl: values.photoProofUrl,
          signatureUrl: values.signatureUrl || undefined,
          otpVerified: values.otpVerified ?? false,
        });
      } else {
        return recordDeliveryAttempt(id as string, {
          outcome: "FAILED",
          failReason: values.reason,
          notes: values.notes,
        });
      }
    },
    successToast: false,
    onSuccess: (data) => {
      setSubmittedResult(data as DeliveryAttempt & { shipmentStatus?: string });
      // Invalidate all related queries
      void qc.invalidateQueries({ queryKey: ["shipments", "detail", id] });
      void qc.invalidateQueries({ queryKey: ["shipments", "tracking", id] });
      void qc.invalidateQueries({ queryKey: ["assignments", "my"] });
      void qc.invalidateQueries({ queryKey: ["courier", "me"] });
      void qc.invalidateQueries({ queryKey: ["courier", "earnings"] });
    },
  });

  const onSubmit = (values: DeliveryFormValues) => mutate(values);

  // ── Post-submit banners ───────────────────────────────────────────────────────
  if (submittedResult) {
    const backFn = () => router.push(`/courier/assignments/${id}`);
    if (submittedResult.outcome === "DELIVERED") {
      return (
        <SuccessBanner
          result={submittedResult}
          trackingNumber={shipment?.trackingNumber}
          onBack={backFn}
        />
      );
    }
    return (
      <FailedBanner
        result={submittedResult}
        trackingNumber={shipment?.trackingNumber}
        onBack={backFn}
      />
    );
  }

  return (
    <div className="space-y-5 pb-10 max-w-2xl">
      {/* ── Back nav ── */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/courier/assignments/${id}`)}
          className="gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Assignment detail
        </Button>
        {shipment && <ShipmentStatusBadge status={shipment.status} />}
      </div>

      {/* ── Page title ── */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Truck className="h-5 w-5 text-amber-500" />
          Record Delivery Attempt
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {shipmentLoading ? (
            <Skeleton className="inline-block h-4 w-72" />
          ) : shipment ? (
            <>
              Shipment{" "}
              <span className="font-mono font-semibold text-foreground">
                {shipment.trackingNumber}
              </span>{" "}
              · {formatBDT(shipment.totalAmount)} · Created{" "}
              {formatDateTime(shipment.createdAt)}
            </>
          ) : null}
        </p>
      </div>

      {/* ── Ineligible guard ── */}
      {!shipmentLoading && shipment && !isEligible && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-5 flex items-start gap-4">
            <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Delivery attempt not available
              </p>
              <p className="text-xs text-muted-foreground">
                This shipment is currently{" "}
                <span className="font-mono font-medium">{shipment.status}</span>
                . Delivery attempts can only be recorded when the status is{" "}
                <span className="font-mono font-medium">OUT_FOR_DELIVERY</span>.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-2">
                <Link href={`/courier/assignments/${id}`}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                  Back to assignment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Recipient summary card ── */}
      {shipment?.recipientAddress && (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <Package className="h-4.5 w-4.5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Delivering to
              </p>
              <p className="text-sm font-semibold truncate">
                {shipment.recipientAddress.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Phone className="h-3 w-3 shrink-0" />
                {shipment.recipientAddress.phone} ·{" "}
                {[
                  shipment.recipientAddress.street,
                  shipment.recipientAddress.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            {shipment.codAmount ? (
              <Badge
                variant="outline"
                className="shrink-0 border-amber-400/40 text-amber-700 text-[11px]"
              >
                CoD {formatBDT(shipment.codAmount)}
              </Badge>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* ── Main form ── */}
      {(shipmentLoading || isEligible) && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Outcome radio (top) ── */}
            <Card>
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base">Delivery Outcome</CardTitle>
                <CardDescription>
                  Select whether the delivery was completed or failed.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <FormField
                  control={form.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid sm:grid-cols-2 gap-3"
                        >
                          {/* DELIVERED option */}
                          <label
                            className={cn(
                              "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition hover:bg-muted/40",
                              field.value === "DELIVERED"
                                ? "border-emerald-500 bg-emerald-500/5"
                                : "border-border",
                            )}
                          >
                            <RadioGroupItem
                              value="DELIVERED"
                              className="mt-0.5 shrink-0"
                              id="outcome-delivered"
                            />
                            <div>
                              <p
                                className={cn(
                                  "text-sm font-semibold flex items-center gap-1.5",
                                  field.value === "DELIVERED"
                                    ? "text-emerald-700 dark:text-emerald-300"
                                    : "",
                                )}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Delivered
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Parcel successfully handed to recipient
                              </p>
                            </div>
                          </label>

                          {/* FAILED option */}
                          <label
                            className={cn(
                              "flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition hover:bg-muted/40",
                              field.value === "FAILED"
                                ? "border-rose-500 bg-rose-500/5"
                                : "border-border",
                            )}
                          >
                            <RadioGroupItem
                              value="FAILED"
                              className="mt-0.5 shrink-0"
                              id="outcome-failed"
                            />
                            <div>
                              <p
                                className={cn(
                                  "text-sm font-semibold flex items-center gap-1.5",
                                  field.value === "FAILED"
                                    ? "text-rose-700 dark:text-rose-300"
                                    : "",
                                )}
                              >
                                <XCircle className="h-4 w-4" />
                                Failed
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Could not complete the delivery
                              </p>
                            </div>
                          </label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* ── DELIVERED fields ── */}
            {outcome === "DELIVERED" && (
              <Card className="border-emerald-500/20">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    Delivery Proof
                  </CardTitle>
                  <CardDescription>
                    Required: recipient name and photo proof URL.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  {/* Recipient name */}
                  <FormField
                    control={form.control}
                    name="recipientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          Recipient Name{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name of the person who accepted the parcel"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Who physically received the parcel — may differ from
                          the recipient on the label.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Photo proof URL (required) */}
                  <FormField
                    control={form.control}
                    name="photoProofUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5" />
                          Photo Proof URL{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://res.cloudinary.com/…"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Required. Upload your delivery photo to Cloudinary or
                          Imgur, then paste the direct URL here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Signature URL (optional) */}
                  <FormField
                    control={form.control}
                    name="signatureUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <PenLine className="h-3.5 w-3.5" />
                          Signature URL (optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            placeholder="https://res.cloudinary.com/…"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* OTP verified */}
                  <FormField
                    control={form.control}
                    name="otpVerified"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-3 rounded-lg border p-3">
                          <FormControl>
                            <Checkbox
                              id="otp-verified"
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div>
                            <FormLabel
                              htmlFor="otp-verified"
                              className="text-sm font-medium cursor-pointer"
                            >
                              OTP verified
                            </FormLabel>
                            <p className="text-[11px] text-muted-foreground">
                              Recipient confirmed delivery via one-time password
                            </p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* ── FAILED fields ── */}
            {outcome === "FAILED" && (
              <Card className="border-rose-500/20">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2 text-rose-700 dark:text-rose-300">
                    <XCircle className="h-4.5 w-4.5" />
                    Failure Details
                  </CardTitle>
                  <CardDescription>
                    Required: select a reason and add notes for dispatch.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  {/* Reason select */}
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Failure Reason{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid gap-2"
                          >
                            {(
                              Object.entries(
                                FAIL_REASON_LABELS,
                              ) as [FailDeliveryReason, (typeof FAIL_REASON_LABELS)[FailDeliveryReason]][]
                            ).map(([k, meta]) => (
                              <label
                                key={k}
                                className={cn(
                                  "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition hover:bg-muted/40",
                                  field.value === k
                                    ? "border-rose-400/60 bg-rose-500/5"
                                    : "border-border",
                                )}
                              >
                                <RadioGroupItem
                                  value={k}
                                  className="mt-0.5 shrink-0"
                                />
                                <div>
                                  <p className="text-sm font-medium">
                                    {meta.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {meta.description}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes (required for FAILED) */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Notes{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what happened in detail so dispatch can follow up…"
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Min 3 characters. Be specific — dispatch uses this to
                          plan the next attempt.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* ── Submit ── */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/courier/assignments/${id}`)}
                disabled={isPending}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || shipmentLoading || !isEligible}
                className={cn(
                  "min-w-[180px]",
                  outcome === "DELIVERED"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-rose-600 hover:bg-rose-700 text-white",
                )}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : outcome === "DELIVERED" ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {isPending
                  ? "Recording…"
                  : outcome === "DELIVERED"
                    ? "Confirm Delivery"
                    : "Record Failed Attempt"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
