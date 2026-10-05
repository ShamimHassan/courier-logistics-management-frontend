"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertCircle,
  Boxes,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  HandCoins,
  Info,
  Loader2,
  Package,
  Receipt,
  Scale,
  Shield,
  Sparkles,
  Truck,
  Zap,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

import { formatBDT } from "@/lib/utils";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import { getShipmentQuote } from "@/lib/api/endpoints";
import type { ServiceType, ShipmentQuote } from "@/lib/api/types";
import type { QuoteInput } from "@/lib/validations/shipment";
import { PKG_CATEGORIES } from "@/lib/validations/constants";
import type { Wizard4StepInput } from "./schema";
import useShipmentWizardStore from "@/store/useShipmentWizardStore";

const PARCEL_CATEGORIES = PKG_CATEGORIES as unknown as readonly string[];

export interface Step3ParcelServiceProps {
  form: UseFormReturn<Wizard4StepInput>;
}

const SERVICE_OPTIONS: Array<{
  value: ServiceType;
  title: string;
  tagline: string;
  Icon: React.ComponentType<{ className?: string }>;
  eta: string;
  accent: string;
  selectedRing: string;
}> = [
  {
    value: "STANDARD",
    title: "Standard",
    tagline: "Best value — 3–5 days all districts",
    Icon: Truck,
    eta: "3–5 days",
    accent: "from-slate-500/10 to-slate-500/0 text-slate-700 dark:text-slate-300",
    selectedRing: "border-primary ring-2 ring-primary/20 shadow-sm",
  },
  {
    value: "EXPRESS",
    title: "Express",
    tagline: "Most popular — 1–2 days, priority",
    Icon: Zap,
    eta: "1–2 days",
    accent: "from-sky-500/10 to-sky-500/0 text-sky-700 dark:text-sky-400",
    selectedRing: "border-primary ring-2 ring-primary/20 shadow-sm",
  },
  {
    value: "OVERNIGHT",
    title: "Overnight",
    tagline: "Urgent — delivered by 10 AM next day",
    Icon: Clock,
    eta: "Next morning",
    accent: "from-fuchsia-500/10 to-fuchsia-500/0 text-fuchsia-700 dark:text-fuchsia-400",
    selectedRing: "border-primary ring-2 ring-primary/20 shadow-sm",
  },
];

function buildQuoteInput(values: Wizard4StepInput): QuoteInput | null {
  if (
    !values.sender?.zoneId ||
    !values.recipient?.zoneId ||
    !values.parcel?.weightKg
  ) {
    return null;
  }
  return {
    weightKg: Number(values.parcel.weightKg),
    lengthCm:
      typeof values.parcel.lengthCm === "number" &&
      !Number.isNaN(values.parcel.lengthCm)
        ? values.parcel.lengthCm
        : undefined,
    widthCm:
      typeof values.parcel.widthCm === "number" &&
      !Number.isNaN(values.parcel.widthCm)
        ? values.parcel.widthCm
        : undefined,
    heightCm:
      typeof values.parcel.heightCm === "number" &&
      !Number.isNaN(values.parcel.heightCm)
        ? values.parcel.heightCm
        : undefined,
    originZoneId: values.sender.zoneId,
    destinationZoneId: values.recipient.zoneId,
    serviceType: values.serviceType,
    codEnabled: !!values.codEnabled,
    codAmount: values.codEnabled ? Number(values.codAmount || 0) : 0,
    insuranceEnabled: !!values.parcel.insuranceEnabled,
    declaredValue: Number(values.parcel.declaredValue ?? 0),
  };
}

export default function Step3ParcelService({
  form,
}: Step3ParcelServiceProps) {
  const router = useRouter();
  const selectedService = form.watch("serviceType");
  const codEnabled = form.watch("codEnabled");
  const insuranceEnabled = form.watch("parcel.insuranceEnabled");
  const allValues = form.watch();

  const setQuoteResult = useShipmentWizardStore((s) => s.setQuoteResult);
  const setServiceType = useShipmentWizardStore((s) => s.setServiceType);
  const setCodAmount = useShipmentWizardStore((s) => s.setCodAmount);
  const setCodEnabled = useShipmentWizardStore((s) => s.setCodEnabled);
  const setParcel = useShipmentWizardStore((s) => s.setParcel);

  /* Debounce quote calculation */
  const [quoteDebounced, setQuoteDebounced] = useState<QuoteInput | null>(null);
  useEffect(() => {
    const input = buildQuoteInput(allValues);
    const t = window.setTimeout(() => setQuoteDebounced(input), 350);
    return () => window.clearTimeout(t);
  }, [
    allValues.parcel?.weightKg,
    allValues.parcel?.lengthCm,
    allValues.parcel?.widthCm,
    allValues.parcel?.heightCm,
    allValues.parcel?.insuranceEnabled,
    allValues.parcel?.declaredValue,
    allValues.sender?.zoneId,
    allValues.recipient?.zoneId,
    allValues.serviceType,
    allValues.codEnabled,
    allValues.codAmount,
  ]);

  const {
    data: quote,
    isLoading: quoteLoading,
    error: quoteError,
    isFetching: quoteFetching,
  } = useApiQuery({
    queryKey: ["shipments", "wizard4-quote", quoteDebounced],
    queryFn: () => getShipmentQuote(quoteDebounced as QuoteInput),
    enabled: !!quoteDebounced,
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  /* Keep Zustand in sync */
  useEffect(() => {
    setQuoteResult(quote ?? null, quoteDebounced ?? undefined);
  }, [quote, quoteDebounced, setQuoteResult]);

  useEffect(() => {
    setServiceType(selectedService);
  }, [selectedService, setServiceType]);

  useEffect(() => {
    setCodEnabled(!!codEnabled);
    setCodAmount(Number(codEnabled ? allValues.codAmount : 0));
  }, [codEnabled, allValues.codAmount, setCodEnabled, setCodAmount]);

  useEffect(() => {
    setParcel({
      weightKg: Number(allValues.parcel?.weightKg ?? 1),
      lengthCm: allValues.parcel?.lengthCm ?? undefined,
      widthCm: allValues.parcel?.widthCm ?? undefined,
      heightCm: allValues.parcel?.heightCm ?? undefined,
      category: allValues.parcel?.category ?? "",
      description: allValues.parcel?.description ?? "",
      isFragile: !!allValues.parcel?.isFragile,
      insuranceEnabled: !!allValues.parcel?.insuranceEnabled,
      declaredValue: Number(allValues.parcel?.declaredValue ?? 0),
    });
  }, [allValues.parcel, setParcel]);

  const readyForQuote = !!quoteDebounced;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr] items-start">
      {/* LEFT: Parcel + Service form */}
      <div className="space-y-5">
        {/* Parcel */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Package className="h-4 w-4" />
              </span>
              Parcel details
            </CardTitle>
            <CardDescription className="text-sm">
              Set weight, optional dimensions, and any extras.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="parcel.weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Parcel weight{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <InputGroupText>
                            <Scale className="h-4 w-4" />
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          step="0.1"
                          min={0.1}
                          placeholder="e.g. 1.5"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? undefined : e.target.value,
                            )
                          }
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText className="tabular-nums text-xs">
                            kg
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Maximum 500 kg per shipment.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parcel.category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Category{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pick a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PARCEL_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="parcel.lengthCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-xs">
                      Length (cm)
                    </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <InputGroupText>L</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          step="0.1"
                          placeholder="30"
                          {...field}
                          value={(field.value ?? "") as unknown as string}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.value,
                            )
                          }
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parcel.widthCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-xs">
                      Width (cm)
                    </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <InputGroupText>W</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          step="0.1"
                          placeholder="20"
                          {...field}
                          value={(field.value ?? "") as unknown as string}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.value,
                            )
                          }
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parcel.heightCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-xs">
                      Height (cm)
                    </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <InputGroupText>H</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          step="0.1"
                          placeholder="15"
                          {...field}
                          value={(field.value ?? "") as unknown as string}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : e.target.value,
                            )
                          }
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormDescription className="text-xs -mt-2 pt-0">
              Dimensions are recommended for all parcels and required for ≥ 10
              kg. All three L/W/H, or none.
            </FormDescription>

            <FormField
              control={form.control}
              name="parcel.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Contents description{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="e.g. 2 branded T-shirts and a mug (gift wrapped)"
                      {...field}
                      value={(field.value ?? "") as unknown as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-3 md:grid-cols-3">
              <FormField
                control={form.control}
                name="parcel.isFragile"
                render={({ field }) => (
                  <FormItem className="rounded-xl border border-border bg-muted/20 p-3.5 flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-0.5 flex-1">
                      <Label className="font-semibold text-sm flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        Fragile
                      </Label>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Glass, ceramic, electronics — marked on the waybill.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parcel.insuranceEnabled"
                render={({ field }) => (
                  <FormItem className="rounded-xl border border-border bg-muted/20 p-3.5 flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={(c) => {
                          field.onChange(c);
                          if (
                            !c &&
                            !form.getValues("parcel.declaredValue")
                          ) {
                            form.setValue("parcel.declaredValue", 0);
                          }
                          if (c && !form.getValues("parcel.declaredValue")) {
                            toast.info(
                              "Enter a declared BDT value to calculate insurance",
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-0.5 flex-1">
                      <Label className="font-semibold text-sm flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-primary" />
                        Insurance
                      </Label>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Cover loss or damage up to declared value.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {insuranceEnabled ? (
                <FormField
                  control={form.control}
                  name="parcel.declaredValue"
                  render={({ field }) => (
                    <FormItem className="rounded-xl border border-border bg-muted/20 p-3.5">
                      <FormLabel className="text-xs font-semibold">
                        Declared value (BDT)
                      </FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupAddon align="inline-start">
                            <InputGroupText className="tabular-nums">
                              ৳
                            </InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            type="number"
                            step={1}
                            min={0}
                            placeholder="e.g. 5000"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? 0 : e.target.value,
                              )
                            }
                          />
                        </InputGroup>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/5 p-3.5 flex items-center">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Default insurance <Badge variant="outline">৳10,000</Badge>{" "}
                    applies for non-fragile standard parcels.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service type */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Truck className="h-4 w-4" />
              </span>
              Delivery service
            </CardTitle>
            <CardDescription className="text-sm">
              Pick a speed that fits your budget and timeline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange as (v: string) => void}
                      defaultValue={field.value || undefined}
                      value={field.value || undefined}
                      className="grid gap-3 md:grid-cols-3"
                    >
                      {SERVICE_OPTIONS.map((opt) => {
                        const { Icon } = opt;
                        const selected = opt.value === selectedService;
                        return (
                          <Label
                            key={opt.value}
                            htmlFor={`w4-svc-${opt.value}`}
                            className={[
                              "cursor-pointer relative rounded-xl border p-4 transition-all",
                              "group hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md",
                              "bg-gradient-to-br",
                              opt.accent,
                              selected ? opt.selectedRing : "border-border",
                            ].join(" ")}
                          >
                            <RadioGroupItem
                              value={opt.value}
                              id={`w4-svc-${opt.value}`}
                              className="absolute top-4 right-4"
                            />
                            <div className="flex items-center gap-3 pr-6">
                              <div
                                className={[
                                  "h-10 w-10 rounded-lg border bg-background/70 flex items-center justify-center shadow-inner",
                                  selected
                                    ? "text-primary border-primary/40"
                                    : "text-foreground/70",
                                ].join(" ")}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="text-sm font-semibold">
                                  {opt.title}
                                </div>
                                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                  {opt.eta}
                                </div>
                              </div>
                            </div>
                            <p className="pt-3 text-xs text-muted-foreground leading-snug">
                              {opt.tagline}
                            </p>
                          </Label>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* COD */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HandCoins className="h-4 w-4" />
              </span>
              Cash on Delivery (optional)
            </CardTitle>
            <CardDescription className="text-sm">
              Collect a fixed BDT amount from the recipient at drop-off time.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-[auto_1fr] items-start md:items-center">
            <FormField
              control={form.control}
              name="codEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-3 space-y-0">
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={(c) => {
                        field.onChange(c);
                        if (!c) form.setValue("codAmount", 0);
                      }}
                    />
                  </FormControl>
                  <Label className="font-semibold text-sm cursor-pointer">
                    Enable COD for this shipment
                  </Label>
                </FormItem>
              )}
            />
            {codEnabled ? (
              <FormField
                control={form.control}
                name="codAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Amount to collect (BDT)
                    </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon align="inline-start">
                          <InputGroupText className="tabular-nums">
                            ৳
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          step={1}
                          min={0}
                          placeholder="e.g. 1500"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : e.target.value,
                            )
                          }
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/5 p-3.5">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  COD funds remitted to your linked bKash / bank account in
                  T+3 business days after confirmed delivery.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Sticky quote summary */}
      <div className="lg:sticky lg:top-6 space-y-4">
        <Card
          className={[
            "shadow-md transition-all",
            quote
              ? "border-primary/30 ring-1 ring-primary/10"
              : "border-muted/60",
          ].join(" ")}
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div
                className={[
                  "h-9 w-9 rounded-lg flex items-center justify-center",
                  quote
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                <Receipt className="h-4.5 w-4.5" />
              </div>
              Live quote
            </CardTitle>
            <CardDescription className="text-sm">
              {quote
                ? "This exact amount carries forward to checkout."
                : readyForQuote
                  ? "Calculating based on parcel, zones & service…"
                  : "Complete parcel + both zones to see pricing."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 space-y-4">
            {quoteLoading || quoteFetching ? (
              !quote ? (
                <QuoteBreakdownSkeleton />
              ) : (
                <QuoteBreakdown quote={quote} loading />
              )
            ) : quote ? (
              <QuoteBreakdown quote={quote} />
            ) : quoteError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs">
                  Couldn&apos;t calculate this quote
                </AlertTitle>
                <AlertDescription className="text-[11px] pt-0.5">
                  {quoteError.message ||
                    "Check that origin + destination zones are selected and try again."}
                </AlertDescription>
              </Alert>
            ) : readyForQuote ? (
              <QuoteBreakdownSkeleton />
            ) : (
              <QuoteEmptyState />
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-muted/20">
          <CardContent className="p-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-foreground">
                  Secure checkout
                </div>
                SSLCommerz — bKash, Nagad, Rocket, VISA, Mastercard,
                American Express. Sandbox enabled for demo — no real money
                moves.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ==================== Quote breakdown (reused) ==================== */

function QuoteBreakdown({
  quote,
  loading = false,
}: {
  quote: ShipmentQuote;
  loading?: boolean;
}) {
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
    <div className={`space-y-4 ${loading ? "opacity-70" : ""}`}>
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-foreground">Quote ready</p>
          <p className="text-muted-foreground text-xs">
            Valid for 7 days · same pricing used at checkout.
          </p>
        </div>
      </div>
      <div className="space-y-2.5 text-sm">
        {rows.map((row, idx) => (
          <div
            key={`${row.label}-${idx}`}
            className="flex items-start justify-between gap-2 text-xs md:text-sm"
          >
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Info className="h-3 w-3 text-muted-foreground/70 mt-0.5 shrink-0" />
              <span>{row.label}</span>
            </span>
            <span className="tabular-nums font-medium">
              {formatBDT(row.amount)}
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

function QuoteBreakdownSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-3.5 w-full bg-muted rounded animate-pulse" />
        <div className="h-3.5 w-[85%] bg-muted rounded animate-pulse" />
        <div className="h-3.5 w-[70%] bg-muted rounded animate-pulse" />
      </div>
      <Separator />
      <div className="h-8 w-full bg-muted rounded animate-pulse" />
    </div>
  );
}

function QuoteEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 text-center space-y-3">
      <div className="mx-auto h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        <Calculator className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          Live quote will appear here
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Set parcel weight, make sure sender + recipient zones are selected,
          and pick a service — pricing updates automatically, ~350 ms after
          you stop typing.
        </p>
      </div>
    </div>
  );
}
