"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Box,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  MapPin,
  Package,
  Phone,
  Sparkles,
  Truck,
  UserRound,
  Zap,
  Shield,
  ShieldAlert,
  Loader2,
  ShieldPlus,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import QuickShipStepper, {
  type QuickShipStep,
  STEP_ORDER,
  TOTAL_STEPS,
} from "./QuickShipStepper";

import {
  BD_DISTRICTS_WITH_ZONES,
  BD_PHONE_REGEX,
  PKG_CATEGORIES,
  normalizePhone,
} from "@/lib/validations/constants";
import { formatBDT } from "@/lib/utils";
import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { useApiQuery } from "@/lib/hooks/useApiQuery";
import {
  createShipment,
  getShipmentQuote,
  initiatePaymentCheckout,
  getHubs,
} from "@/lib/api/endpoints";
import type {
  CreateShipmentInput as ApiCreateShipmentInput,
  ServiceType,
  Shipment,
  ShipmentQuote,
  ShipmentQuoteInput,
} from "@/lib/api/types";

/* ===========================================
 * 0. Types + constants
 * =========================================== */
type WizardStep = QuickShipStep;
const STEPS: WizardStep[] = ["parcel", "pickup", "delivery", "service", "review"];

const SERVICE_OPTIONS: {
  value: ServiceType;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  eta: string;
  accent: string;
}[] = [
  {
    value: "STANDARD",
    title: "Standard",
    tagline: "Reliable 2–4 day delivery across BD",
    icon: Truck,
    eta: "2–4 days",
    accent: "from-slate-500/10 to-slate-500/0 text-slate-700 dark:text-slate-300",
  },
  {
    value: "EXPRESS",
    title: "Express",
    tagline: "Next business day for major hubs",
    icon: Zap,
    eta: "1–2 days",
    accent: "from-sky-500/10 to-sky-500/0 text-sky-700 dark:text-sky-400",
  },
  {
    value: "OVERNIGHT",
    title: "Overnight",
    tagline: "Same-night pickup → delivered by 10AM",
    icon: Clock,
    eta: "Next morning",
    accent: "from-fuchsia-500/10 to-fuchsia-500/0 text-fuchsia-700 dark:text-fuchsia-400",
  },
];

/* ===========================================
 * 1. Shape schema for the entire 5-step wizard
 *    (uses addressSchema + parcel + quoteSchema fields)
 * =========================================== */
const wizardAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100),
  phone: z
    .string()
    .trim()
    .regex(BD_PHONE_REGEX, "Phone must be a valid Bangladesh mobile number")
    .transform(normalizePhone),
  street: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(300),
  city: z.string().trim().min(2, "City / Thana is required").max(100),
  region: z.string().trim().min(2, "District is required").max(100),
  zip: z.string().trim().max(20).optional(),
  zoneId: z.string().min(1, "Please select a district / zone"),
  label: z.enum(["home", "office", "other"]).default("home"),
});

const wizardParcelSchema = z
  .object({
    weightKg: z.coerce
      .number({ message: "Weight must be a number" })
      .positive("Weight must be greater than 0 kg")
      .max(500, "Weight cannot exceed 500 kg"),
    lengthCm: z.coerce
      .number({ message: "Length must be a number" })
      .positive()
      .max(300)
      .optional(),
    widthCm: z.coerce
      .number({ message: "Width must be a number" })
      .positive()
      .max(300)
      .optional(),
    heightCm: z.coerce
      .number({ message: "Height must be a number" })
      .positive()
      .max(300)
      .optional(),
    category: z
      .enum([...PKG_CATEGORIES] as [string, ...string[]])
      .optional(),
    description: z.string().trim().max(500).optional(),
    declaredValue: z.coerce
      .number()
      .int("Declared value must be whole BDT")
      .nonnegative("Declared value cannot be negative")
      .default(0),
    isFragile: z.boolean().default(false),
    insuranceEnabled: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const dims = [data.lengthCm, data.widthCm, data.heightCm];
    const someDefined = dims.some((d) => d !== undefined && !Number.isNaN(d));
    const allDefined = dims.every((d) => d !== undefined && !Number.isNaN(d));
    if (someDefined && !allDefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Provide all three dimensions (L×W×H) when describing parcel size, or leave them empty.",
        path: ["lengthCm"],
      });
    }
    if ((data.weightKg ?? 0) >= 10 && !allDefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Shipments ≥ 10 kg require length, width & height for accurate pricing.",
        path: ["weightKg"],
      });
    }
  });

const wizardServiceSchema = z.object({
  serviceType: z.enum(["STANDARD", "EXPRESS", "OVERNIGHT"] as [
    ServiceType,
    ...ServiceType[],
  ]),
  codEnabled: z.boolean().default(false),
  codAmount: z.coerce
    .number()
    .int("Cash on delivery amount must be whole BDT")
    .nonnegative()
    .default(0),
});

const wizardNotesSchema = z.object({
  deliveryInstructions: z.string().trim().max(500).optional(),
  specialNotes: z.string().trim().max(500).optional(),
});

const wizardSchema = z.intersection(
  z.intersection(
    z.object({
      parcel: wizardParcelSchema,
      pickup: wizardAddressSchema,
      delivery: wizardAddressSchema,
    }),
    wizardServiceSchema,
  ),
  wizardNotesSchema,
);

export type QuickShipWizardInput = z.infer<typeof wizardSchema>;

const DEFAULT_VALUES: QuickShipWizardInput = {
  parcel: {
    weightKg: 1,
    lengthCm: undefined,
    widthCm: undefined,
    heightCm: undefined,
    category: "general",
    description: "",
    declaredValue: 0,
    isFragile: false,
    insuranceEnabled: false,
  },
  pickup: {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    region: "",
    zip: "",
    zoneId: "",
    label: "home",
  },
  delivery: {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    region: "",
    zip: "",
    zoneId: "",
    label: "home",
  },
  serviceType: "STANDARD",
  codEnabled: false,
  codAmount: 0,
  deliveryInstructions: "",
  specialNotes: "",
};

/* ===========================================
 * 2. Small helpers
 * =========================================== */
function zoneFromDistrict(region: string): string | "" {
  const match = BD_DISTRICTS_WITH_ZONES.find(
    (d: { district: string; zoneId: string }) => d.district === region,
  );
  return match ? match.zoneId : "";
}

function hasLength(v: unknown) {
  return typeof v === "string" && v.trim().length > 0;
}

function buildQuoteInput(
  v: QuickShipWizardInput,
): ShipmentQuoteInput | null {
  const weightOk = !!v.parcel.weightKg && v.parcel.weightKg > 0;
  const zoneOk = hasLength(v.pickup.zoneId) && hasLength(v.delivery.zoneId);
  if (!weightOk || !zoneOk) return null;
  const input: ShipmentQuoteInput = {
    serviceType: v.serviceType,
    weightKg: v.parcel.weightKg,
    originZoneId: v.pickup.zoneId,
    destinationZoneId: v.delivery.zoneId,
    codEnabled: !!v.codEnabled,
    codAmount: v.codEnabled ? v.codAmount ?? 0 : 0,
    insuranceEnabled: !!v.parcel.insuranceEnabled,
    declaredValue: v.parcel.declaredValue ?? 0,
  };
  if (
    v.parcel.lengthCm !== undefined &&
    !Number.isNaN(v.parcel.lengthCm) &&
    v.parcel.widthCm !== undefined &&
    !Number.isNaN(v.parcel.widthCm) &&
    v.parcel.heightCm !== undefined &&
    !Number.isNaN(v.parcel.heightCm)
  ) {
    input.lengthCm = v.parcel.lengthCm;
    input.widthCm = v.parcel.widthCm;
    input.heightCm = v.parcel.heightCm;
  }
  return input;
}

/* ===========================================
 * 3. Step components (kept inline within same
 *    file to minimize FS churn for Step 11)
 * =========================================== */
interface StepProps {
  form: UseFormReturn<QuickShipWizardInput>;
  quote?: ShipmentQuote | null;
  quoteLoading?: boolean;
  quoteError?: Error | null;
  hubs?: { id: string; name: string; zoneId?: string | null }[];
}

function StepParcel({ form }: StepProps) {
  const insurance = form.watch("parcel.insuranceEnabled");
  const fragile = form.watch("parcel.isFragile");
  const declared = form.watch("parcel.declaredValue");
  useEffect(() => {
    if (insurance) return;
    if (declared && declared > 0) {
      form.setValue("parcel.insuranceEnabled", true, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [declared, insurance, form]);
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-5 md:col-span-2">
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
          <Box className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold text-foreground">Parcel details</p>
            <p className="text-muted-foreground">
              Provide accurate weight &amp; dimensions to get a precise price.
              For shipments ≥ 10 kg, dimensions are required.
            </p>
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name="parcel.weightKg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight (kg)</FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Package className="h-4 w-4" />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  step="0.1"
                  min={0.1}
                  placeholder="e.g. 1.5"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText className="tabular-nums text-xs">
                    kg
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parcel.category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Parcel category</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value ?? undefined}
              value={field.value ?? undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PKG_CATEGORIES.map((c: string) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="parcel.lengthCm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Length <span className="text-muted-foreground font-normal">(cm, optional)</span>
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
                    field.onChange(e.target.value === "" ? undefined : e.target.value)
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
            <FormLabel>
              Width <span className="text-muted-foreground font-normal">(cm)</span>
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
                    field.onChange(e.target.value === "" ? undefined : e.target.value)
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
            <FormLabel>
              Height <span className="text-muted-foreground font-normal">(cm)</span>
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
                    field.onChange(e.target.value === "" ? undefined : e.target.value)
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
        name="parcel.declaredValue"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Declared parcel value (BDT)</FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText className="tabular-nums">৳</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  type="number"
                  step="1"
                  min={0}
                  placeholder="0 — enter value for insurance"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </InputGroup>
            </FormControl>
            <FormDescription className="text-xs">
              Set the value of parcel contents. Used for insurance calculation.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border bg-muted/30 p-3.5">
        <FormField
          control={form.control}
          name="parcel.isFragile"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 flex-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(Boolean(c))}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                  Fragile contents
                </Label>
                <p className="text-xs text-muted-foreground">
                  Glass, ceramic, electronics, liquids — we'll add handling labels.
                </p>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parcel.insuranceEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 flex-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(Boolean(c))}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label className="font-semibold flex items-center gap-1.5">
                  <ShieldPlus className="h-3.5 w-3.5 text-emerald-500" />
                  Add insurance
                </Label>
                <p className="text-xs text-muted-foreground">
                  Covers loss or damage up to declared value.
                </p>
              </div>
            </FormItem>
          )}
        />
        {fragile && (
          <Badge variant="outline" className="w-full sm:w-auto border-amber-400/40 bg-amber-500/5 text-amber-600 dark:text-amber-400">
            Fragile label applied
          </Badge>
        )}
      </div>

      <FormField
        control={form.control}
        name="parcel.description"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                rows={2}
                placeholder="e.g. Books — 2 hardcover novels, well packed"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function AddressForm({
  form,
  path,
  title,
  subtitle,
  Icon,
}: StepProps & {
  path: "pickup" | "delivery";
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const region = form.watch(`${path}.region`) as string;
  useEffect(() => {
    if (!region) return;
    const zone = zoneFromDistrict(region);
    const currentZone = form.getValues(`${path}.zoneId`);
    if (zone && zone !== currentZone) {
      form.setValue(`${path}.zoneId`, zone, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [region, form, path]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
        <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`${path}.label`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Address label</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  className="flex flex-row flex-wrap gap-2"
                >
                  {[
                    {
                      v: "home",
                      label: "Home",
                      icon: <UserRound className="h-3.5 w-3.5" />,
                    },
                    {
                      v: "office",
                      label: "Office",
                      icon: <Building2 className="h-3.5 w-3.5" />,
                    },
                    {
                      v: "other",
                      label: "Other",
                      icon: <MapPin className="h-3.5 w-3.5" />,
                    },
                  ].map((o) => (
                    <div
                      key={o.v}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5 has-[[data-state=checked]]:text-primary"
                    >
                      <RadioGroupItem value={o.v} id={`${path}-${o.v}`} />
                      <Label
                        htmlFor={`${path}-${o.v}`}
                        className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                      >
                        {o.icon}
                        {o.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${path}.fullName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <UserRound className="h-4 w-4" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    placeholder="Md. Rakib Hasan"
                    autoComplete={path === "pickup" ? "name" : "shipping name"}
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
          name={`${path}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact phone</FormLabel>
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
                    autoComplete={
                      path === "pickup" ? "tel-national" : "shipping tel-national"
                    }
                    {...field}
                  />
                </InputGroup>
              </FormControl>
              <FormDescription className="text-xs">
                Bangladesh mobile — courier will call this number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${path}.region`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BD_DISTRICTS_WITH_ZONES.map((d) => (
                    <SelectItem key={d.district} value={d.district}>
                      <span className="flex items-center gap-2">
                        {d.district}
                        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                          {d.zoneId}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${path}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thana / City</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <MapPin className="h-4 w-4" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    placeholder="e.g. Dhanmondi, 32 No. Bus Stand"
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
          name={`${path}.street`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Street / House / Road details</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="House 23, Road 7/A, Block C — 3rd floor, bell on right"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${path}.zip`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Postcode <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <InputGroupInput
                  type="text"
                  inputMode="numeric"
                  placeholder="1205"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${path}.zoneId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Pricing zone
                <Badge variant="outline" className="ml-2 text-[9px] uppercase px-1.5 py-0">
                  Auto
                </Badge>
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <Sparkles className="h-4 w-4 text-primary/70" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    readOnly
                    placeholder="Zone auto-detected from district…"
                    className="bg-muted/50"
                    {...field}
                  />
                </InputGroup>
              </FormControl>
              <FormDescription className="text-xs">
                Zones are pre-mapped to all 64 BD districts — just select a district.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function StepService({ form, quote, quoteLoading, quoteError }: StepProps) {
  const codEnabled = form.watch("codEnabled");
  const codAmount = form.watch("codAmount");
  const serviceType = form.watch("serviceType");

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5">
        <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm leading-relaxed flex-1">
          <p className="font-semibold text-foreground">Choose a delivery service</p>
          <p className="text-muted-foreground">
            Pricing updates live as you change service type, options, or locations.
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="serviceType"
        render={({ field }) => (
          <FormItem spaceY="none">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange as (v: string) => void}
                defaultValue={field.value}
                value={field.value}
                className="grid gap-3 md:grid-cols-3"
              >
                {SERVICE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = opt.value === serviceType;
                  return (
                    <Label
                      key={opt.value}
                      htmlFor={`svc-${opt.value}`}
                      className={[
                        "cursor-pointer relative rounded-xl border p-4 transition-all",
                        "group/data-svc hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md",
                        "bg-gradient-to-br",
                        opt.accent,
                        selected ? "border-primary ring-2 ring-primary/20 shadow-sm" : "border-border",
                      ].join(" ")}
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`svc-${opt.value}`}
                        className="absolute top-4 right-4"
                      />
                      <div className="flex items-center gap-3 pr-6">
                        <div
                          className={[
                            "h-10 w-10 rounded-lg border bg-background/70 flex items-center justify-center shadow-inner",
                            selected ? "text-primary border-primary/40" : "text-foreground/70",
                          ].join(" ")}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-sm font-semibold">{opt.title}</div>
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
                    <CreditCard className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    Cash on Delivery (COD)
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Recipient pays in cash upon delivery. Includes a small COD fee.
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
                  <FormLabel className="text-xs">
                    COD amount to collect (BDT)
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText className="tabular-nums">৳</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        type="number"
                        step="1"
                        min={0}
                        placeholder="e.g. 1500"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {codEnabled && codAmount && codAmount > 0 && (
            <Badge variant="outline" className="w-fit text-[10px]">
              ৳{codAmount} collect on delivery
            </Badge>
          )}
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-sm font-semibold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Live quote summary
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quotes are fetched from the backend pricing engine — updates are
              debounced so you won&apos;t spam the API.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Base rate</span>
              <span className="tabular-nums font-medium">
                {quote ? formatBDT(quote.basePrice) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {(quote?.estimatedDeliveryDays?.[0] ?? 1) ===
                (quote?.estimatedDeliveryDays?.[1] ?? 1)
                  ? `Est. ${quote?.estimatedDeliveryDays?.[0]} day`
                  : `Est. ${quote?.estimatedDeliveryDays?.[0]}–${quote?.estimatedDeliveryDays?.[1]} days`}
              </span>
              <span className="tabular-nums font-semibold text-primary text-base">
                {quote ? formatBDT(quote.totalAmount) : quoteLoading ? "Calculating…" : "—"}
              </span>
            </div>
            {quoteLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Contacting pricing engine…
              </div>
            )}
            {quoteError && !quoteLoading && (
              <Alert variant="destructive" className="mt-2 py-2 px-3">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs">Couldn&apos;t price this route</AlertTitle>
                <AlertDescription className="text-[11px] pt-0.5">
                  Backend may be offline — check zones &amp; try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepReview({
  form,
  quote,
  quoteLoading,
  quoteError,
}: StepProps) {
  const v = form.getValues();
  const svc = SERVICE_OPTIONS.find((s) => s.value === v.serviceType)!;
  const validAddresses = hasLength(v.pickup.zoneId) && hasLength(v.delivery.zoneId);

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold text-foreground">Review your shipment</p>
            <p className="text-muted-foreground">
              Please double-check addresses, parcel value, and options before paying.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Pickup from
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4 space-y-0.5 text-sm">
              <div className="font-semibold">{v.pickup.fullName || "—"}</div>
              <div className="text-muted-foreground text-xs">
                {v.pickup.phone || "—"} · {v.pickup.label}
              </div>
              <div className="pt-1 text-xs leading-relaxed">
                {v.pickup.street || "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {[v.pickup.city, v.pickup.region, v.pickup.zip]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <Badge variant="outline" className="mt-2 text-[10px]">
                {v.pickup.zoneId || "Pickup zone"}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5" />
                Deliver to
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4 space-y-0.5 text-sm">
              <div className="font-semibold">{v.delivery.fullName || "—"}</div>
              <div className="text-muted-foreground text-xs">
                {v.delivery.phone || "—"} · {v.delivery.label}
              </div>
              <div className="pt-1 text-xs leading-relaxed">
                {v.delivery.street || "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {[v.delivery.city, v.delivery.region, v.delivery.zip]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              <Badge variant="outline" className="mt-2 text-[10px]">
                {v.delivery.zoneId || "Delivery zone"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Parcel · {svc.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4 grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Weight · dims
              </div>
              <div className="font-medium text-foreground">
                {v.parcel.weightKg} kg
                {v.parcel.lengthCm && v.parcel.widthCm && v.parcel.heightCm
                  ? ` · ${v.parcel.lengthCm}×${v.parcel.widthCm}×${v.parcel.heightCm} cm`
                  : ""}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Category · value
              </div>
              <div className="font-medium text-foreground capitalize">
                {v.parcel.category || "general"} · {formatBDT(v.parcel.declaredValue ?? 0)}
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
              {v.parcel.isFragile && (
                <Badge variant="outline" className="bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-400/30 text-[10px]">
                  Fragile
                </Badge>
              )}
              {v.parcel.insuranceEnabled && (
                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-400/30 text-[10px]">
                  Insured
                </Badge>
              )}
              {v.codEnabled && v.codAmount > 0 && (
                <Badge variant="outline" className="bg-sky-500/5 text-sky-600 dark:text-sky-400 border-sky-400/30 text-[10px]">
                  COD {formatBDT(v.codAmount)}
                </Badge>
              )}
              {!validAddresses && (
                <Badge variant="outline" className="bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-400/30 text-[10px]">
                  Addresses incomplete
                </Badge>
              )}
            </div>
            {hasLength(v.deliveryInstructions ?? "") && (
              <div className="sm:col-span-2 mt-2 rounded-lg border bg-muted/40 p-3 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Delivery instructions
                </div>
                <div className="text-xs leading-relaxed">{v.deliveryInstructions}</div>
              </div>
            )}
            {hasLength(v.specialNotes ?? "") && (
              <div className="sm:col-span-2 rounded-lg border bg-muted/40 p-3 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Special notes (CourierFlow staff)
                </div>
                <div className="text-xs leading-relaxed">{v.specialNotes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="deliveryInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Delivery instructions (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    className="resize-none text-xs"
                    placeholder="e.g. Call on arrival — gate is locked; ring right-side bell"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specialNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Internal notes (optional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    className="resize-none text-xs"
                    placeholder="Not shared with the courier — for internal support only"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* ============== Pricing summary card ============== */}
      <aside className="lg:col-span-2 space-y-4">
        <Card className="border-primary/30 shadow-md bg-card sticky top-6">
          <CardHeader className="py-4 px-5 space-y-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Price summary
            </CardTitle>
            <CardDescription className="text-xs">
              Secure checkout via SSLCommerz — bKash, Nagad, Rocket, cards
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-4 space-y-2.5 text-sm">
            {quoteLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                <Separator />
                <div className="h-6 w-full bg-muted rounded animate-pulse" />
              </div>
            ) : quote ? (
              <>
                {quote.breakdown && quote.breakdown.length > 0 ? (
                  <>
                    {quote.breakdown.map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Info className="h-3 w-3 text-muted-foreground/70" />
                          {row.label}
                          {row.description ? (
                            <span className="sr-only">{row.description}</span>
                          ) : null}
                        </span>
                        <span className="tabular-nums font-medium">
                          {formatBDT(row.amount)}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Base price</span>
                      <span className="tabular-nums font-medium">
                        {formatBDT(quote.basePrice)}
                      </span>
                    </div>
                    {quote.weightSurcharge > 0 && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Weight surcharge</span>
                        <span className="tabular-nums font-medium">
                          {formatBDT(quote.weightSurcharge)}
                        </span>
                      </div>
                    )}
                    {quote.servicePremium > 0 && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          {svc.title} premium
                        </span>
                        <span className="tabular-nums font-medium">
                          {formatBDT(quote.servicePremium)}
                        </span>
                      </div>
                    )}
                    {quote.codFee > 0 && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">COD fee</span>
                        <span className="tabular-nums font-medium">
                          {formatBDT(quote.codFee)}
                        </span>
                      </div>
                    )}
                    {quote.insuranceFee > 0 && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Insurance</span>
                        <span className="tabular-nums font-medium">
                          {formatBDT(quote.insuranceFee)}
                        </span>
                      </div>
                    )}
                    {quote.taxAmount > 0 && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">VAT</span>
                        <span className="tabular-nums font-medium">
                          {formatBDT(quote.taxAmount)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <Separator className="my-2" />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-xs">
                    Est. delivery
                  </span>
                  <span className="text-xs font-medium text-foreground/90">
                    {quote.estimatedDeliveryDays?.[0] ===
                    quote.estimatedDeliveryDays?.[1]
                      ? `${quote.estimatedDeliveryDays?.[0]} day`
                      : `${quote.estimatedDeliveryDays?.[0]}–${quote.estimatedDeliveryDays?.[1]} days`}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2 pt-1">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Grand total
                  </span>
                  <span className="text-2xl font-extrabold tracking-tight tabular-nums text-primary">
                    {formatBDT(quote.totalAmount)}
                  </span>
                </div>
              </>
            ) : quoteError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="text-xs">Unable to price</AlertTitle>
                <AlertDescription className="text-[11px] pt-0.5">
                  {quoteError.message}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle className="text-xs">Almost there</AlertTitle>
                <AlertDescription className="text-[11px] pt-0.5">
                  Complete the earlier steps to see live pricing.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-muted/20">
          <CardContent className="p-4 space-y-2 text-xs text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-foreground">Secure payments</div>
                SSLCommerz powered — your details are encrypted in transit &amp;
                never stored on our servers. Sandbox mode enabled for demo.
              </div>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

/* ===========================================
 * 4. Exported container
 * =========================================== */
export interface QuickShipWizardProps {
  onSuccess?: (shipment: Shipment & { quote?: ShipmentQuote }) => void;
  initialStep?: WizardStep;
}

export default function QuickShipWizard({
  onSuccess,
  initialStep = "parcel",
}: QuickShipWizardProps) {
  const router = useRouter();
  const form = useForm<QuickShipWizardInput>({
    resolver: zodResolver(wizardSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
    delayError: 200,
  });

  const [step, setStep] = useState<WizardStep>(initialStep);
  const stepIndex = STEPS.indexOf(step);

  const formValues = form.watch();
  const watchedAll = form.watch();

  /* ---------- Debounced quote ---------- */
  const [quoteDebounced, setQuoteDebounced] = useState<ShipmentQuoteInput | null>(null);
  useEffect(() => {
    const input = buildQuoteInput(formValues);
    const t = window.setTimeout(() => setQuoteDebounced(input), 400);
    return () => window.clearTimeout(t);
  }, [
    formValues.parcel.weightKg,
    formValues.parcel.lengthCm,
    formValues.parcel.widthCm,
    formValues.parcel.heightCm,
    formValues.parcel.insuranceEnabled,
    formValues.parcel.declaredValue,
    formValues.pickup.zoneId,
    formValues.delivery.zoneId,
    formValues.serviceType,
    formValues.codEnabled,
    formValues.codAmount,
  ]);

  const {
    data: quote,
    isLoading: quoteLoading,
    error: quoteError,
    isFetching: quoteFetching,
  } = useApiQuery({
    queryKey: ["shipments", "quote", quoteDebounced],
    queryFn: () => getShipmentQuote(quoteDebounced as ShipmentQuoteInput),
    enabled: !!quoteDebounced,
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  /* ---------- Zones / hubs (informational) ---------- */
  useApiQuery({
    queryKey: ["hubs", "list"],
    queryFn: () => getHubs({ limit: 50 }),
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

  /* ---------- Create shipment mutation ---------- */
  const {
    mutateAsync: apiCreateShipment,
    isPending: createPending,
  } = useApiMutation({
    mutationKey: ["shipments", "create"],
    mutationFn: (payload: ApiCreateShipmentInput) => createShipment(payload),
    onSuccess: (data) => {
      toast.success("Shipment saved", {
        description: `Tracking ID: ${data.trackingNumber}`,
      });
      return data;
    },
    onError: (err: Error & { status?: number; errors?: unknown[] }) => {
      toast.error("Couldn't save shipment", {
        description:
          err.status === 422
            ? "Some fields need correction — please review earlier steps."
            : err.message,
      });
    },
  });

  /* ---------- Checkout redirect mutation ---------- */
  const {
    mutateAsync: apiCheckout,
    isPending: checkoutPending,
  } = useApiMutation({
    mutationKey: ["payments", "checkout"],
    mutationFn: (shipmentId: string) => initiatePaymentCheckout(shipmentId),
  });

  const submitting = createPending || checkoutPending;

  /* ---------- Validation helpers per step ---------- */
  const parcelFields = ["parcel"] as const;
  const pickupFields = ["pickup"] as const;
  const deliveryFields = ["delivery"] as const;
  const serviceFields = ["serviceType", "codEnabled", "codAmount"] as const;

  function fieldsFor(
    s: WizardStep,
  ): readonly (keyof QuickShipWizardInput | `parcel` | `pickup` | `delivery`)[] {
    switch (s) {
      case "parcel":
        return parcelFields as unknown as readonly (keyof QuickShipWizardInput)[];
      case "pickup":
        return pickupFields as unknown as readonly (keyof QuickShipWizardInput)[];
      case "delivery":
        return deliveryFields as unknown as readonly (keyof QuickShipWizardInput)[];
      case "service":
        return serviceFields;
      case "review":
        return ["deliveryInstructions", "specialNotes"];
    }
  }

  async function validateStepAndContinue(
    target: WizardStep,
    direction: 1 | -1,
  ): Promise<boolean> {
    if (direction < 0) {
      setStep(target);
      return true;
    }
    const fields = fieldsFor(step);
    const ok = await form.trigger(
      fields as Parameters<typeof form.trigger>[0],
    );
    if (!ok) {
      toast.error("Please fix the highlighted fields", {
        description: `You must complete this step before moving to ${STEP_ORDER.find(
          (s) => s.key === target,
        )?.label}.`,
      });
      return false;
    }
    setStep(target);
    return true;
  }

  const onNext = () => {
    const next = STEPS[stepIndex + 1];
    if (!next) return;
    void validateStepAndContinue(next, 1);
  };

  const onBack = () => {
    const prev = STEPS[stepIndex - 1];
    if (!prev) return;
    void validateStepAndContinue(prev, -1);
  };

  const jumpTo = (target: WizardStep) => {
    const targetIdx = STEPS.indexOf(target);
    if (targetIdx === stepIndex) return;
    if (targetIdx < stepIndex) {
      setStep(target);
      return;
    }
    /* Jump forward through each step to validate */
    void (async () => {
      for (let i = stepIndex; i < targetIdx; i++) {
        const ok = await validateStepAndContinue(STEPS[i + 1], 1);
        if (!ok) return;
      }
    })();
  };

  /* ---------- Final submit ---------- */
  async function onFinalSubmit(values: QuickShipWizardInput) {
    const allOk = await form.trigger();
    if (!allOk) {
      toast.error("Please fix the highlighted fields", {
        description: "Some required fields are still missing.",
      });
      return;
    }
    if (!quote && !quoteError) {
      toast.error("No pricing quote available", {
        description:
          "Please wait for the quote to calculate, or check that pickup & delivery zones are set.",
      });
      return;
    }

    const payload: ApiCreateShipmentInput = {
      sender: {
        fullName: values.pickup.fullName,
        phone: values.pickup.phone,
        street: values.pickup.street,
        city: values.pickup.city,
        region: values.pickup.region,
        zip: values.pickup.zip,
        country: "Bangladesh",
        zoneId: values.pickup.zoneId,
        label: values.pickup.label,
      },
      recipient: {
        fullName: values.delivery.fullName,
        phone: values.delivery.phone,
        street: values.delivery.street,
        city: values.delivery.city,
        region: values.delivery.region,
        zip: values.delivery.zip,
        country: "Bangladesh",
        zoneId: values.delivery.zoneId,
        label: values.delivery.label,
      },
      parcel: {
        weightKg: values.parcel.weightKg,
        lengthCm: values.parcel.lengthCm ?? null,
        widthCm: values.parcel.widthCm ?? null,
        heightCm: values.parcel.heightCm ?? null,
        category: values.parcel.category ?? null,
        description: values.parcel.description ?? null,
        declaredValue: values.parcel.declaredValue ?? 0,
        isFragile: !!values.parcel.isFragile,
        insuranceEnabled: !!values.parcel.insuranceEnabled,
      },
      serviceType: values.serviceType,
      codAmount: values.codEnabled ? values.codAmount ?? 0 : 0,
      deliveryInstructions: values.deliveryInstructions,
      specialNotes: values.specialNotes,
    };

    const createPromise = (async () => {
      const created = await apiCreateShipment(payload);
      const checkout = await apiCheckout(created.id);
      onSuccess?.(created);
      if (checkout?.gatewayUrl) {
        toast.success("Redirecting to SSLCommerz…", {
          description: `Total ${formatBDT(created.totalAmount)}`,
        });
        window.setTimeout(() => {
          window.location.href = checkout.gatewayUrl;
        }, 400);
      } else {
        toast.success("Shipment confirmed", {
          description: "No gateway — you can view it in your shipments list.",
        });
        router.push(`/dashboard/shipments/${created.id}`);
      }
      return created;
    })();

    toast.promise(createPromise, {
      loading: "Creating your shipment…",
      success: (shipment) =>
        `Shipment ${shipment.trackingNumber} saved — please complete payment`,
      error: (err: unknown) => {
        const e = err as { message?: string };
        return e.message ?? "Something went wrong. Please try again.";
      },
    });
  }

  const stepProps: StepProps = {
    form,
    quote,
    quoteLoading: quoteLoading || quoteFetching,
    quoteError: quoteError as Error | null,
  };

  const stepTitles = useMemo(
    () =>
      ({
        parcel: "1. Parcel details",
        pickup: "2. Pickup address",
        delivery: "3. Delivery address",
        service: "4. Service & pricing",
        review: "5. Review & pay",
      }) as const,
    [],
  );

  void watchedAll; // keep reference for reactivity

  return (
    <div className="space-y-5">
      <QuickShipStepper
        current={step}
        onJump={jumpTo}
        allowJumpBefore={stepIndex + 1}
      />

      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="pb-3 flex-row items-center justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
              {stepTitles[step]}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Step {stepIndex + 1} of {TOTAL_STEPS}
            </CardDescription>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex text-[10px]">
            {hasLength(formValues.pickup.zoneId) &&
            hasLength(formValues.delivery.zoneId)
              ? "Quote is live"
              : "Select districts to see price"}
          </Badge>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFinalSubmit)} className="space-y-6">
              {step === "parcel" && <StepParcel {...stepProps} />}
              {step === "pickup" && (
                <AddressForm
                  {...stepProps}
                  path="pickup"
                  title="Pickup address"
                  subtitle="Where should the courier collect your parcel? (sender)"
                  Icon={MapPin}
                />
              )}
              {step === "delivery" && (
                <AddressForm
                  {...stepProps}
                  path="delivery"
                  title="Delivery address"
                  subtitle="Where should we send the parcel? (recipient)"
                  Icon={BadgeCheck}
                />
              )}
              {step === "service" && <StepService {...stepProps} />}
              {step === "review" && <StepReview {...stepProps} />}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
          <div className="flex-1 text-xs text-muted-foreground max-w-md">
            {step === "parcel" &&
              "Tip: If you're not sure about dimensions, weigh the parcel and estimate — we'll weigh again on pickup."}
            {step === "pickup" &&
              "Tip: We only deliver within Bangladesh — pickups are available in all 64 districts (same-day from urban hubs)."}
            {step === "delivery" &&
              "Tip: Add a recipient phone that is reachable — couriers call before arrival to reduce missed deliveries."}
            {step === "service" &&
              "Tip: OVERNIGHT costs more, but includes SMS alerts and priority handling. For gifts try EXPRESS."}
            {step === "review" &&
              "Tip: After payment you'll receive SMS + email with the tracking link and courier ETA."}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={stepIndex === 0 || submitting}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {stepIndex < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={onNext}
                disabled={submitting || quoteLoading && step === "service"}
                className="gap-2"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={form.handleSubmit(onFinalSubmit)}
                disabled={submitting}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {submitting
                  ? createPending
                    ? "Creating shipment…"
                    : "Redirecting to payment…"
                  : `Pay ${quote ? formatBDT(quote.totalAmount) : "now"}`}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
