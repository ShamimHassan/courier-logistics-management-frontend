"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Boxes,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  Loader2,
  MapPin,
  Package,
  Receipt,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Truck,
  Zap,
  HandCoins,
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
  Form,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { quoteSchema, type QuoteInput } from "@/lib/validations/shipment";
import { BD_DISTRICTS_WITH_ZONES } from "@/lib/validations/constants";
import { formatBDT } from "@/lib/utils";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { getShipmentQuote } from "@/lib/api/endpoints";
import type { ServiceType, ShipmentQuote } from "@/lib/api/types";

/* ============================================
 * 0. Constants — service options + unique zones
 * ============================================ */

const SERVICE_OPTIONS: Array<{
  value: ServiceType;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  eta: string;
  accent: string;
  selectedRing: string;
}> = [
  {
    value: "STANDARD",
    title: "Standard",
    tagline: "Best value — 3–5 days across 64 districts",
    icon: Truck,
    eta: "3–5 days",
    accent: "from-slate-500/10 to-slate-500/0 text-slate-700 dark:text-slate-300",
    selectedRing: "border-primary ring-2 ring-primary/20 shadow-sm",
  },
  {
    value: "EXPRESS",
    title: "Express",
    tagline: "Most popular — 1–2 days, priority handling",
    icon: Zap,
    eta: "1–2 days",
    accent: "from-sky-500/10 to-sky-500/0 text-sky-700 dark:text-sky-400",
    selectedRing: "border-primary ring-2 ring-primary/20 shadow-sm",
  },
  {
    value: "OVERNIGHT",
    title: "Overnight",
    tagline: "Urgent — pickup tonight, delivered by 10AM",
    icon: Clock,
    eta: "Next morning",
    accent: "from-fuchsia-500/10 to-fuchsia-500/0 text-fuchsia-700 dark:text-fuchsia-400",
    selectedRing: "border-primary ring-2 ring-primary/20 shadow-sm",
  },
];

interface ZoneOption {
  zoneId: string;
  label: string;
  region: string;
  districts: string[];
}

function buildZoneOptions(): ZoneOption[] {
  const map = new Map<string, ZoneOption>();
  for (const dz of BD_DISTRICTS_WITH_ZONES) {
    const existing = map.get(dz.zoneId);
    if (existing) {
      if (!existing.districts.includes(dz.district)) {
        existing.districts.push(dz.district);
      }
    } else {
      map.set(dz.zoneId, {
        zoneId: dz.zoneId,
        label: `${dz.region} · ${dz.zoneId}`,
        region: dz.region,
        districts: [dz.district],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.zoneId.localeCompare(b.zoneId),
  );
}

/* ============================================
 * 1. PricingPage component
 * ============================================ */

export default function PricingPage() {
  const router = useRouter();
  const zoneOptions = useMemo(buildZoneOptions, []);

  const form = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema) as unknown as Parameters<
      typeof useForm<QuoteInput>
    >[0]["resolver"],
    defaultValues: {
      weightKg: 1,
      lengthCm: undefined,
      widthCm: undefined,
      heightCm: undefined,
      originZoneId: "",
      destinationZoneId: "",
      serviceType: "STANDARD",
      codEnabled: false,
      codAmount: 0,
      insuranceEnabled: false,
      declaredValue: 0,
    },
    mode: "onTouched",
  });

  const codEnabled = form.watch("codEnabled");
  const insuranceEnabled = form.watch("insuranceEnabled");
  const selectedService = form.watch("serviceType");

  const quoteMutation = useApiMutation({
    mutationFn: (body: QuoteInput) => getShipmentQuote(body),
    successToast: false,
    errorToast: false,
  });

  const quote: ShipmentQuote | null = quoteMutation.data ?? null;
  const quoteLoading = quoteMutation.isPending;
  const quoteError = quoteMutation.error ?? null;

  const onSubmit = async (values: QuoteInput) => {
    if (!values.originZoneId) {
      toast.error("Please select origin zone", {
        description: "Pick the district area the parcel is sent from.",
      });
      return;
    }
    if (!values.destinationZoneId) {
      toast.error("Please select destination zone", {
        description: "Pick the district area the parcel is delivered to.",
      });
      return;
    }
    if (values.originZoneId === values.destinationZoneId) {
      toast.info("Same-zone delivery selected", {
        description: "Local metro rates will apply.",
      });
    }
    try {
      await quoteMutation.mutateAsync(values);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Could not reach the pricing engine. Try again in a moment.";
      toast.error("Quote calculation failed", { description: msg });
    }
  };

  const handleCreateShipment = () => {
    if (!quote) return;
    const values = form.getValues();
    const payload = {
      quote: {
        input: values,
        result: quote,
        generatedAt: new Date().toISOString(),
      },
    };
    try {
      sessionStorage.setItem("cf_prefilled_quote", JSON.stringify(payload));
    } catch {
      /* sessionStorage may be disabled — ignore */
    }
    const params = new URLSearchParams({
      originZoneId: values.originZoneId,
      destinationZoneId: values.destinationZoneId,
      serviceType: values.serviceType,
      weightKg: String(values.weightKg),
    });
    if (values.codEnabled && values.codAmount) {
      params.set("codAmount", String(values.codAmount));
    }
    if (values.insuranceEnabled && values.declaredValue) {
      params.set("declaredValue", String(values.declaredValue));
    }
    router.push(`/dashboard/shipments/new?${params.toString()}`);
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.08] via-primary/[0.04] to-background border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15] dark:opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary) / 0.35) 0%, transparent 70%)",
          }}
        />
        <div className="container mx-auto max-w-7xl px-4 py-18 md:py-22 relative">
          <div className="max-w-3xl space-y-5">
            <Badge variant="outline" className="gap-1.5 border-primary/30">
              <Calculator className="h-3.5 w-3.5 text-primary" />
              Pricing &amp; Live Quote
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Transparent pricing — calculate an exact quote in 5 seconds
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Enter parcel size, origin, and destination to see an itemised
              price. Every fee — base, weight surcharge, service premium,
              insurance, COD, and VAT — is shown in Bangladeshi Taka with no
              surprises. Powered by the same deterministic pricing engine used
              at checkout.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Badge variant="secondary" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                SSLCommerz secure checkout
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Boxes className="h-3.5 w-3.5" />
                64 district coverage
              </Badge>
              <Badge variant="secondary" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                No hidden fees
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main: Form + Summary side by side ── */}
      <section className="container mx-auto max-w-7xl px-4 py-14 lg:py-18">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          {/* ========= Left: Quote calculator form ========= */}
          <Card className="border-muted/60 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Scale className="h-4.5 w-4.5" />
                </div>
                Live quote calculator
              </CardTitle>
              <CardDescription className="text-sm">
                Fill in the fields below — we&apos;ll send the parameters to
                the pricing engine and return a full breakdown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  {/* Parcel details */}
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                      <Package className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm leading-relaxed">
                        <p className="font-semibold text-foreground">
                          1. Parcel details
                        </p>
                        <p className="text-muted-foreground">
                          Weight is always required. Dimensions (L×W×H) are
                          recommended for accuracy and mandatory for shipments
                          ≥ 10 kg.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="weightKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Weight <span className="text-destructive">*</span>
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
                                    field.onChange(e.target.value)
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

                      <div className="hidden md:block" aria-hidden />

                      <FormField
                        control={form.control}
                        name="lengthCm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Length{" "}
                              <span className="text-muted-foreground font-normal">
                                (cm, optional)
                              </span>
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
                                  value={field.value ?? ""}
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
                        name="widthCm"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Width{" "}
                              <span className="text-muted-foreground font-normal">
                                (cm)
                              </span>
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
                                  value={field.value ?? ""}
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
                        name="heightCm"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel className="font-medium">
                              Height{" "}
                              <span className="text-muted-foreground font-normal">
                                (cm)
                              </span>
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
                                  value={field.value ?? ""}
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
                            <FormDescription className="text-xs">
                              Provide all three dimensions, or leave empty for
                              small shipments &lt; 10 kg.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Zones */}
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm leading-relaxed">
                        <p className="font-semibold text-foreground">
                          2. Origin &amp; destination zones
                        </p>
                        <p className="text-muted-foreground">
                          Select a pricing zone for pickup and dropoff. Zones
                          are pre-mapped to all 64 Bangladesh districts.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="originZoneId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Origin zone{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || undefined}
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pickup from…" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {zoneOptions.map((z) => (
                                  <SelectItem key={z.zoneId} value={z.zoneId}>
                                    <span className="flex items-center gap-2">
                                      <span>{z.zoneId}</span>
                                      <span className="text-muted-foreground text-xs">
                                        {z.region} · {z.districts.length}{" "}
                                        district
                                        {z.districts.length === 1 ? "" : "s"}
                                      </span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Zone the courier will pick up the parcel from.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="destinationZoneId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">
                              Destination zone{" "}
                              <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value || undefined}
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Deliver to…" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {zoneOptions.map((z) => (
                                  <SelectItem key={z.zoneId} value={z.zoneId}>
                                    <span className="flex items-center gap-2">
                                      <span>{z.zoneId}</span>
                                      <span className="text-muted-foreground text-xs">
                                        {z.region} · {z.districts.length}{" "}
                                        district
                                        {z.districts.length === 1 ? "" : "s"}
                                      </span>
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              Zone the parcel will be delivered to.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Service type */}
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                      <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm leading-relaxed">
                        <p className="font-semibold text-foreground">
                          3. Delivery service
                        </p>
                        <p className="text-muted-foreground">
                          Choose a speed that fits your budget and timeline.
                        </p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={
                                field.onChange as (v: string) => void
                              }
                              defaultValue={field.value}
                              value={field.value}
                              className="grid gap-3 md:grid-cols-3"
                            >
                              {SERVICE_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const selected = opt.value === selectedService;
                                return (
                                  <Label
                                    key={opt.value}
                                    htmlFor={`price-svc-${opt.value}`}
                                    className={[
                                      "cursor-pointer relative rounded-xl border p-4 transition-all",
                                      "group/data-svc hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md",
                                      "bg-gradient-to-br",
                                      opt.accent,
                                      selected
                                        ? opt.selectedRing
                                        : "border-border",
                                    ].join(" ")}
                                  >
                                    <RadioGroupItem
                                      value={opt.value}
                                      id={`price-svc-${opt.value}`}
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
                  </div>

                  {/* Optional toggles: COD + Insurance */}
                  <div className="space-y-5">
                    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
                      <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="text-sm leading-relaxed">
                        <p className="font-semibold text-foreground">
                          4. Optional extras
                        </p>
                        <p className="text-muted-foreground">
                          Add cash-on-delivery collection or extra parcel
                          insurance — both are calculated into your final
                          quote.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                        <FormField
                          control={form.control}
                          name="codEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(c) => {
                                    field.onChange(c);
                                    if (!c) form.setValue("codAmount", 0);
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 flex-1">
                                <Label className="font-semibold flex items-center gap-1.5">
                                  <HandCoins className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  Cash on Delivery (COD)
                                </Label>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Collect BDT from the recipient on delivery.
                                  A small COD fee applies.
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                        {codEnabled && (
                          <FormField
                            control={form.control}
                            name="codAmount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">
                                  Amount to collect on delivery (BDT)
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
                                      step="1"
                                      min={0}
                                      placeholder="e.g. 1500"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                    />
                                  </InputGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                        <FormField
                          control={form.control}
                          name="insuranceEnabled"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(c) => {
                                    field.onChange(c);
                                    if (
                                      !c &&
                                      !form.getValues("declaredValue")
                                    ) {
                                      form.setValue("declaredValue", 0);
                                    }
                                    if (
                                      c &&
                                      !form.getValues("declaredValue")
                                    ) {
                                      toast.info(
                                        "Enter a declared value to calculate insurance",
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 flex-1">
                                <Label className="font-semibold flex items-center gap-1.5">
                                  <Shield className="h-3.5 w-3.5 text-primary" />
                                  Parcel insurance
                                </Label>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Covers loss or damage up to declared value.
                                </p>
                              </div>
                            </FormItem>
                          )}
                        />
                        {insuranceEnabled && (
                          <FormField
                            control={form.control}
                            name="declaredValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-medium">
                                  Declared parcel value (BDT)
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
                                      step="1"
                                      min={0}
                                      placeholder="e.g. 5000"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(e.target.value)
                                      }
                                    />
                                  </InputGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="gap-2 sm:flex-1"
                      disabled={quoteLoading}
                    >
                      {quoteLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Calculating quote…
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4" />
                          Calculate exact price
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        form.reset();
                        quoteMutation.reset();
                      }}
                      className="gap-2"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* ========= Right: Quote summary / result ========= */}
          <div className="lg:sticky lg:top-6 space-y-5">
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
                  Quote result
                </CardTitle>
                <CardDescription className="text-sm">
                  {quote
                    ? "Breakdown returned by the pricing engine — exact same numbers you'll see at checkout."
                    : "Fill in the calculator on the left to see a live, itemised quote."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 space-y-4">
                {quoteLoading && !quote ? (
                  <QuoteBreakdownSkeleton />
                ) : quote ? (
                  <QuoteBreakdown quote={quote} />
                ) : quoteError ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xs">
                      Could not calculate this quote
                    </AlertTitle>
                    <AlertDescription className="text-[11px] pt-0.5">
                      {quoteError.message ||
                        "Check that origin and destination zones are correct and try again."}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <QuoteEmptyState />
                )}
              </CardContent>

              {quote && (
                <CardFooter className="flex-col items-stretch gap-2 border-t pt-4">
                  <Button
                    size="lg"
                    className="gap-2 w-full"
                    onClick={handleCreateShipment}
                  >
                    <CreditCard className="h-4 w-4" />
                    Create shipment with this quote
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground pt-0.5">
                    Prefills the 5-step shipment wizard and takes you to
                    checkout.
                  </p>
                </CardFooter>
              )}
            </Card>

            {/* Side info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Banknote className="h-4 w-4 text-primary" />
                    What&apos;s included
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    "End-to-end tracking with 8+ scans",
                    "Default insurance up to ৳10,000",
                    "2 delivery attempts + return trail",
                    "SSLCommerz checkout (bKash, Nagad, Rocket, cards)",
                    "Digital invoice emailed on delivery",
                  ].map((f) => (
                    <div
                      key={f}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" />
                    Pricing notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p>
                    • Metro-to-metro (same zone) pricing applies within Dhaka,
                    Chattogram, Sylhet and Rajshahi city limits.
                  </p>
                  <p>
                    • Volumetric weight kicks in for large, light boxes
                    (density &lt; 166 kg/m³) — the pricing engine picks the
                    higher of actual vs. volumetric.
                  </p>
                  <p>
                    • Fuel &amp; regulatory surcharges are already folded into
                    the base and weight lines above — nothing added at
                    checkout.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Service tier highlights (3 cards) ── */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col items-center gap-3 text-center mb-10">
            <Badge variant="outline" className="gap-1">
              <Truck className="h-3.5 w-3.5 text-primary" />
              Service tiers
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Three speeds, one consistent experience
            </h2>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              Every plan includes the same tracking precision, the same
              SSLCommerz-secure checkout, and the same 2-delivery-attempt SLA.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SERVICE_OPTIONS.map((plan) => (
              <Card key={plan.value} className="h-full border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    {(() => {
                      const Icon = plan.icon;
                      return (
                        <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <Icon className="h-5 w-5" />
                        </div>
                      );
                    })()}
                    <Badge variant="outline">{plan.eta}</Badge>
                  </div>
                  <div className="space-y-1 pt-4">
                    <CardTitle className="text-2xl font-extrabold tracking-tight">
                      {plan.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                      {plan.tagline}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <ul className="space-y-2">
                    {plan.value === "STANDARD" && [
                      "All 64 districts covered",
                      "Default insurance ৳10,000",
                      "SMS + email tracking notifications",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.value === "EXPRESS" && [
                      "Priority hub sort — 1–2 days",
                      "Default insurance ৳25,000",
                      "Courier phone shared pre-delivery",
                      "COD available for corporate senders",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.value === "OVERNIGHT" && [
                      "Metro corridors only (DH/CTG/SYL/Raj)",
                      "Next-morning delivery by 10:00 AM",
                      "Insurance up to ৳50,000",
                      "Mandatory photo + signature on receipt",
                      "Dedicated courier assigned",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ / How quotes work ── */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div className="space-y-5">
            <Badge variant="outline" className="gap-1">
              <Info className="h-3.5 w-3.5 text-primary" />
              How pricing works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Deterministic pricing — the same quote, every time
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CourierFlow uses a rule-based pricing engine (Express / Prisma)
              that matches every input (weight, zones, service, add-ons)
              against a set of active pricing rules. The result is byte-for-byte
              reproducible: if you submit the same inputs tomorrow, you get the
              same number.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  icon: Scale,
                  t: "Base + weight",
                  d: "Each rule defines a price per weight bracket for a zone pair.",
                },
                {
                  icon: Zap,
                  t: "Service premium",
                  d: "Express adds a flat premium; Overnight adds a higher one.",
                },
                {
                  icon: Shield,
                  t: "Insurance %",
                  d: "Percent of declared value, with per-shipment min/max caps.",
                },
                {
                  icon: CreditCard,
                  t: "COD % + min",
                  d: "Percentage of COD amount, floored at a minimum BDT amount.",
                },
                {
                  icon: Receipt,
                  t: "VAT",
                  d: "Applied to the subtotal at the statutory rate.",
                },
                {
                  icon: CalendarDays,
                  t: "ETA window",
                  d: "Returned alongside the price so you can promise delivery dates.",
                },
              ].map((row) => {
                const Ico = row.icon;
                return (
                  <div
                    key={row.t}
                    className="rounded-xl border border-border bg-card p-3.5"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Ico className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold">{row.t}</p>
                    </div>
                    <p className="pt-1.5 text-xs text-muted-foreground leading-relaxed pl-10">
                      {row.d}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is this quote final, or will there be surprise charges?",
                a: "The quote you see here is the exact same one returned at checkout and saved with your shipment. The only way your total changes after clicking 'Create shipment' is if you add extra services (fragile handling, signature, etc.) in the wizard.",
              },
              {
                q: "My parcel is big but light — what happens?",
                a: "Our pricing engine computes volumetric weight (L×W×H in cm ÷ 6000) and charges the higher of actual vs. volumetric kg. That's why we ask for dimensions on the form above.",
              },
              {
                q: "Do you offer corporate / volume pricing?",
                a: "Yes. For senders shipping 100+ parcels/month we create custom rules in the pricing engine with tiered discounts. Get in touch via the Contact page with your monthly volume and service mix.",
              },
              {
                q: "When does the COD amount get remitted?",
                a: "COD funds are reconciled within T+3 (3 business days after confirmed delivery) to your linked bKash / bank account via SSLCommerz settlement. Corporate accounts get weekly bulk disbursements + a CSV reconciliation report.",
              },
              {
                q: "How long is this quote valid?",
                a: "Quotes returned today remain valid for 7 calendar days. If pricing rules change (e.g. fuel adjustment), the Create-Shipment wizard will warn you and re-run the quote before payment.",
              },
            ].map((faq) => (
              <Card key={faq.q} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm md:text-base font-semibold leading-snug">
                    {faq.q}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed pt-0">
                  {faq.a}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border bg-card p-8 md:p-12 grid md:grid-cols-[1fr_auto] items-center gap-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Got a pricing question we didn&apos;t answer?
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl">
              Chat with our Dhaka sales team — we&apos;ll help you pick the
              right service, understand volumetric calculations, or set up
              custom corporate pricing rules for high-volume senders.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
            <Button asChild size="lg" className="gap-2 w-full md:w-auto">
              <Link href="/contact">
                Talk to sales
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 w-full md:w-auto"
            >
              <Link href="/services">
                <Package className="h-4 w-4" />
                See all services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================
 * 2. Quote breakdown — result display
 * ============================================ */

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
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-foreground">Quote ready</p>
          <p className="text-muted-foreground">
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
              <span>
                {row.label}
                {row.description ? (
                  <span className="sr-only"> · {row.description}</span>
                ) : null}
              </span>
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
          No quote calculated yet
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pick parcel weight, zones and service → click &quot;Calculate exact
          price&quot; — we&apos;ll render the itemised breakdown here in under
          a second.
        </p>
      </div>
    </div>
  );
}
