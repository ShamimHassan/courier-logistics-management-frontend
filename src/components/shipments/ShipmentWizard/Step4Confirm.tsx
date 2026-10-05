"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  Package,
  Phone,
  Receipt,
  Shield,
  Sparkles,
  User,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

import { formatBDT, formatDateTime } from "@/lib/utils";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import {
  createShipment,
  initiatePaymentCheckout,
} from "@/lib/api/endpoints";
import type {
  CreateShipmentInput,
  Shipment,
  ShipmentQuote,
} from "@/lib/api/types";
import type { Wizard4StepInput } from "./schema";
import useShipmentWizardStore from "@/store/useShipmentWizardStore";

export interface Step4ConfirmProps {
  form: UseFormReturn<Wizard4StepInput>;
  onFinalSubmitSuccess?: (
    created: Shipment & { quote?: ShipmentQuote },
  ) => void;
}

export default function Step4Confirm({
  form,
  onFinalSubmitSuccess,
}: Step4ConfirmProps) {
  const router = useRouter();
  const values = form.getValues();
  const quote = useShipmentWizardStore((s) => s.quoteResult);
  const setDeliveryInstructions = useShipmentWizardStore(
    (s) => s.setDeliveryInstructions,
  );
  const setSpecialNotes = useShipmentWizardStore((s) => s.setSpecialNotes);

  const deliveryInstructions = form.watch("deliveryInstructions");
  const specialNotes = form.watch("specialNotes");

  useEffect(() => {
    setDeliveryInstructions(deliveryInstructions ?? "");
  }, [deliveryInstructions, setDeliveryInstructions]);

  useEffect(() => {
    setSpecialNotes(specialNotes ?? "");
  }, [specialNotes, setSpecialNotes]);

  /* Create shipment mutation */
  const {
    mutateAsync: apiCreateShipment,
    isPending: createPending,
  } = useApiMutation({
    mutationKey: ["wizard4", "create-shipment"],
    mutationFn: (p: CreateShipmentInput) => createShipment(p),
    successToast: false,
    errorToast: false,
  });

  /* Checkout redirect mutation */
  const {
    mutateAsync: apiCheckout,
    isPending: checkoutPending,
  } = useApiMutation({
    mutationKey: ["wizard4", "initiate-checkout"],
    mutationFn: (shipmentId: string) => initiatePaymentCheckout(shipmentId),
    successToast: false,
    errorToast: false,
  });

  const submitting = createPending || checkoutPending;

  function buildApiPayload(v: Wizard4StepInput): CreateShipmentInput {
    return {
      sender: {
        fullName: v.sender.fullName,
        phone: v.sender.phone,
        street: v.sender.street,
        city: v.sender.city,
        region: v.sender.region,
        zip: (v.sender.zip as string) || "",
        country: "Bangladesh",
        zoneId: v.sender.zoneId,
        label: (v.sender.label ?? "") as "home" | "office" | "other" | "",
      },
      recipient: {
        fullName: v.recipient.fullName,
        phone: v.recipient.phone,
        street: v.recipient.street,
        city: v.recipient.city,
        region: v.recipient.region,
        zip: (v.recipient.zip as string) || "",
        country: "Bangladesh",
        zoneId: v.recipient.zoneId,
        label: (v.recipient.label ?? "") as "home" | "office" | "other" | "",
      },
      parcel: {
        weightKg: Number(v.parcel.weightKg),
        lengthCm:
          typeof v.parcel.lengthCm === "number" &&
          !Number.isNaN(v.parcel.lengthCm)
            ? v.parcel.lengthCm
            : null,
        widthCm:
          typeof v.parcel.widthCm === "number" &&
          !Number.isNaN(v.parcel.widthCm)
            ? v.parcel.widthCm
            : null,
        heightCm:
          typeof v.parcel.heightCm === "number" &&
          !Number.isNaN(v.parcel.heightCm)
            ? v.parcel.heightCm
            : null,
        category: v.parcel.category?.length ? v.parcel.category : null,
        description: v.parcel.description?.length
          ? v.parcel.description
          : null,
        declaredValue: Number(v.parcel.declaredValue ?? 0),
        isFragile: !!v.parcel.isFragile,
        insuranceEnabled: !!v.parcel.insuranceEnabled,
      },
      serviceType: v.serviceType,
      codAmount: v.codEnabled ? Number(v.codAmount ?? 0) : 0,
      deliveryInstructions: (v.deliveryInstructions ?? "").slice(0, 500),
      specialNotes: (v.specialNotes ?? "").slice(0, 500),
    };
  }

  async function handleFinalSubmit(ev?: React.FormEvent) {
    ev?.preventDefault();
    const allOk = await form.trigger();
    if (!allOk) {
      toast.error("Please fix the highlighted fields", {
        description: "Some required fields are missing across steps 1–3.",
      });
      return;
    }
    if (!quote) {
      toast.error("No pricing quote available", {
        description:
          "Return to step 3 and make sure both zones + parcel weight are set.",
      });
      return;
    }
    const payload = buildApiPayload(form.getValues());

    const pipeline = (async () => {
      const created = await apiCreateShipment(payload);
      try {
        const checkout = await apiCheckout(created.id);
        onFinalSubmitSuccess?.({ ...created, quote });
        if (checkout?.gatewayUrl) {
          toast.success("Redirecting to SSLCommerz…", {
            description: `Total ${formatBDT(created.totalAmount)}`,
          });
          window.setTimeout(() => {
            window.location.href = checkout.gatewayUrl;
          }, 400);
        } else {
          toast.success("Shipment confirmed", {
            description: `Tracking: ${created.trackingNumber}`,
          });
          void router.push(`/dashboard/shipments/${created.id}`);
        }
      } catch (checkoutErr) {
        const msg =
          checkoutErr instanceof Error ? checkoutErr.message : "Checkout error";
        toast.error("Shipment saved — redirecting to details", {
          description: msg,
        });
        onFinalSubmitSuccess?.({ ...created, quote });
        void router.push(`/dashboard/shipments/${created.id}`);
      }
      return created;
    })();

    toast.promise(pipeline, {
      loading: "Creating your shipment…",
      success: (shipment) =>
        `Shipment ${shipment.trackingNumber} saved — please complete payment`,
      error: (err: unknown) => {
        const e = err as { message?: string; status?: number };
        return (
          e.message ??
          "Something went wrong. If this persists please contact support."
        );
      },
    });
  }

  /* Render */
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr] items-start">
      {/* LEFT: Summary cards */}
      <div className="space-y-5">
        {/* Sender + Recipient cards */}
        <div className="grid gap-5 md:grid-cols-2">
          <AddressSummaryCard
            title="Sender / Pickup"
            Icon={User}
            accent="from-primary/10 to-transparent"
            address={values.sender}
          />
          <AddressSummaryCard
            title="Recipient / Delivery"
            Icon={UserRound}
            accent="from-emerald-500/10 to-transparent"
            address={values.recipient}
          />
        </div>

        {/* Parcel + Service */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Package className="h-4 w-4" />
              </span>
              Parcel &amp; service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
              <SumRow label="Weight" value={`${values.parcel.weightKg} kg`} />
              <SumRow
                label="Dimensions"
                value={
                  typeof values.parcel.lengthCm === "number" &&
                  typeof values.parcel.widthCm === "number" &&
                  typeof values.parcel.heightCm === "number"
                    ? `${values.parcel.lengthCm} × ${values.parcel.widthCm} × ${values.parcel.heightCm} cm`
                    : "Not provided"
                }
              />
              <SumRow
                label="Category"
                value={values.parcel.category || "—"}
              />
              <SumRow
                label="Fragile"
                value={values.parcel.isFragile ? "Yes" : "No"}
              />
              <SumRow
                label="Insurance"
                value={
                  values.parcel.insuranceEnabled
                    ? `Yes — up to ${formatBDT(Number(values.parcel.declaredValue) || 0)}`
                    : "Default (৳10,000)"
                }
              />
              <SumRow
                label="COD"
                value={
                  values.codEnabled
                    ? `Yes — collect ${formatBDT(Number(values.codAmount) || 0)}`
                    : "No"
                }
              />
            </div>
            {values.parcel.description?.length ? (
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  Contents
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {values.parcel.description}
                </p>
              </div>
            ) : null}

            <Separator />

            <div className="grid md:grid-cols-2 gap-2">
              <Badge variant="outline" className="gap-1.5 w-full md:w-fit py-1.5 px-3">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Service: <span className="font-semibold">{values.serviceType}</span>
              </Badge>
              {quote ? (
                <Badge variant="outline" className="gap-1.5 w-full md:w-fit py-1.5 px-3">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  Est. delivery:{" "}
                  <span className="font-semibold">
                    {quote.estimatedDeliveryDays?.[0] ===
                    quote.estimatedDeliveryDays?.[1]
                      ? `${quote.estimatedDeliveryDays?.[0]} day`
                      : `${quote.estimatedDeliveryDays?.[0]}–${quote.estimatedDeliveryDays?.[1]} days`}
                  </span>
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Delivery instructions */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Info className="h-4 w-4" />
              </span>
              Delivery notes
            </CardTitle>
            <CardDescription className="text-sm">
              Optional — instructions that will show up on the waybill and in
              the courier&apos;s app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="deliveryInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm">
                    Courier instructions (500 char max)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="e.g. Call on arrival; gate pass needed; leave with reception if nobody home"
                      {...field}
                      value={(field.value ?? "") as unknown as string}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Keep it short — couriers see this before arrival and
                    before delivery.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium text-sm">
                    Admin notes{" "}
                    <span className="font-normal text-muted-foreground">
                      (internal, not shown to courier)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Reference order #INV-2026-0317 from contact form"
                      {...field}
                      value={(field.value ?? "") as unknown as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {!quote ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs">
              Cannot proceed — quote missing
            </AlertTitle>
            <AlertDescription className="text-[11px] pt-0.5">
              Go back to step 3 and make sure parcel weight + both zones are
              selected. The quote auto-computes in ~350 ms.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      {/* RIGHT: Checkout quote card */}
      <div className="lg:sticky lg:top-6 space-y-4">
        <Card className="border-primary/30 ring-1 ring-primary/10 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Receipt className="h-4 w-4" />
              </div>
              Payable now
            </CardTitle>
            <CardDescription className="text-xs">
              After clicking &quot;Proceed to checkout&quot; you&apos;ll be
              redirected to SSLCommerz to complete payment securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 space-y-4">
            {quote ? (
              <QuoteBreakdown quote={quote} />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground leading-relaxed">
                <Loader2 className="h-5 w-5 mx-auto mb-2 text-muted-foreground animate-spin" />
                Awaiting price from step 3…
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2 border-t pt-4">
            <Button
              type="button"
              size="lg"
              className="gap-2 w-full"
              onClick={handleFinalSubmit as () => void}
              disabled={submitting || !quote}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              {submitting
                ? "Creating shipment…"
                : quote
                  ? `Proceed to Checkout · ${formatBDT(quote.totalAmount)}`
                  : "Proceed to Checkout"}
            </Button>
            <div className="flex items-start gap-2 pt-1 text-[11px] text-muted-foreground leading-relaxed">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <p>
                100% SSLCommerz encrypted. Demo mode — no real money is
                charged. You&apos;ll return to a status page after payment.
              </p>
            </div>
          </CardFooter>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">
              After payment
            </p>
            <ul className="space-y-1.5 pl-0.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                Instant tracking link sent via SMS + email
              </li>
              <li className="flex items-start gap-2">
                <BadgeCheck className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                Courier assigned within 1 business hour
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-primary/80 mt-0.5 shrink-0" />
                Pickup attempted on your selected date
              </li>
              <li className="flex items-start gap-2">
                <Receipt className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                VAT invoice emailed after confirmed delivery
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ==================== Helpers ==================== */

function SumRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-0.5 border-b border-dashed border-border/70 last:border-0">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold whitespace-nowrap">
        {label}
      </span>
      <span className="text-sm text-foreground/85 text-right tabular-nums break-words">
        {value}
      </span>
    </div>
  );
}

function AddressSummaryCard({
  title,
  Icon,
  accent,
  address,
}: {
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
  address: Wizard4StepInput["sender"];
}) {
  return (
    <Card className={`border-border/60 bg-gradient-to-br ${accent}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-background/70 border border-border/60 flex items-center justify-center text-primary">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>
        {address.label ? (
          <CardDescription className="text-xs">
            <Badge variant="secondary" className="text-[10px] capitalize">
              {address.label}
            </Badge>
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-semibold text-foreground flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          {address.fullName}
        </p>
        <p className="text-muted-foreground/90 flex items-start gap-1.5 leading-snug">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <span>
            {address.street}, {address.city}, {address.region}
            {address.zip ? ` — ${address.zip}` : ""}
          </span>
        </p>
        <p className="text-muted-foreground/90 flex items-center gap-1.5 tabular-nums">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          {address.phone}
        </p>
        <Badge variant="outline" className="gap-1 mt-1 w-fit text-[10px]">
          Zone <span className="font-semibold">{address.zoneId || "—"}</span>
        </Badge>
      </CardContent>
    </Card>
  );
}

function QuoteBreakdown({ quote }: { quote: ShipmentQuote }) {
  const rows =
    quote.breakdown && quote.breakdown.length > 0
      ? quote.breakdown
      : [
          { label: "Base price", amount: quote.basePrice },
          ...(quote.weightSurcharge > 0
            ? [{ label: "Weight surcharge", amount: quote.weightSurcharge }]
            : []),
          ...(quote.servicePremium > 0
            ? [{ label: "Service premium", amount: quote.servicePremium }]
            : []),
          ...(quote.codFee > 0
            ? [{ label: "COD fee", amount: quote.codFee }]
            : []),
          ...(quote.insuranceFee > 0
            ? [{ label: "Insurance", amount: quote.insuranceFee }]
            : []),
          ...(quote.taxAmount > 0
            ? [{ label: "VAT", amount: quote.taxAmount }]
            : []),
        ];
  const eta =
    quote.estimatedDeliveryDays?.[0] === quote.estimatedDeliveryDays?.[1]
      ? `${quote.estimatedDeliveryDays?.[0]} day`
      : `${quote.estimatedDeliveryDays?.[0]}–${quote.estimatedDeliveryDays?.[1]} days`;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-semibold text-foreground text-sm">Quote ready</p>
          <p className="text-muted-foreground">
            Valid for 7 days · generated{" "}
            <span className="tabular-nums font-medium">
              {formatDateTime(new Date())}
            </span>
          </p>
        </div>
      </div>
      <div className="space-y-2.5 text-sm">
        {rows.map((r, idx) => (
          <div
            key={`${r.label}-${idx}`}
            className="flex items-start justify-between gap-2 text-xs md:text-sm"
          >
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3 w-3 text-muted-foreground/70 mt-0.5 shrink-0" />
              {r.label}
            </span>
            <span className="tabular-nums font-medium">
              {formatBDT(r.amount)}
            </span>
          </div>
        ))}
        <Separator className="my-2" />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Est. delivery</span>
          <span className="text-xs font-medium text-foreground/90 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
            {eta}
          </span>
        </div>
        <div className="flex items-end justify-between gap-2 pt-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Grand total · {quote.currency || "BDT"}
          </span>
          <span className="text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums text-primary">
            {formatBDT(quote.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
