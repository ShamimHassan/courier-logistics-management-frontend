"use client";

import { useMemo } from "react";
import { MapPin, Phone, User } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { BD_DISTRICTS_WITH_ZONES } from "@/lib/validations/constants";
import type { Wizard4StepInput } from "./schema";

export interface Step1SenderProps {
  form: UseFormReturn<Wizard4StepInput>;
}

function buildZoneOptions() {
  const map = new Map<
    string,
    { zoneId: string; label: string; region: string; districts: string[] }
  >();
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

export default function Step1Sender({ form }: Step1SenderProps) {
  const zoneOptions = useMemo(buildZoneOptions, []);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] items-start">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <User className="h-4 w-4" />
            </span>
            Sender (pickup) address
          </CardTitle>
          <CardDescription className="text-sm">
            Your details — the courier will call this phone before arriving for
            pickup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Name + Phone row */}
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="sender.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Full name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>
                          <User className="h-4 w-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput placeholder="e.g. Md. Rahim Ahmed" {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Shown on the waybill as the sender.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sender.phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Phone (BD) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText className="tabular-nums">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          +880
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        type="tel"
                        inputMode="tel"
                        placeholder="1XXXXXXXXX"
                        maxLength={14}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Format: +880 1XXXXXXXXX or 01XXXXXXXXX
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address label (home / office / other) */}
          <FormField
            control={form.control}
            name="sender.label"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Address label (optional)</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                    value={field.value || undefined}
                    className="flex flex-wrap items-center gap-2"
                  >
                    {[
                      {
                        value: "home" as const,
                        label: "Home",
                        hint: "Residential pickup",
                      },
                      {
                        value: "office" as const,
                        label: "Office",
                        hint: "Business hours",
                      },
                      {
                        value: "other" as const,
                        label: "Other",
                        hint: "Specify in notes",
                      },
                    ].map((opt) => (
                      <Label
                        key={opt.value}
                        htmlFor={`sender-label-${opt.value}`}
                        className={[
                          "cursor-pointer rounded-xl border border-border px-3 py-2 pr-4 flex items-center gap-2.5 transition-all",
                          "has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20",
                          "hover:border-primary/40 hover:bg-muted/30",
                        ].join(" ")}
                      >
                        <RadioGroupItem value={opt.value} id={`sender-label-${opt.value}`} />
                        <div className="leading-tight">
                          <div className="text-sm font-semibold">{opt.label}</div>
                          <div className="text-[11px] text-muted-foreground">{opt.hint}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Street */}
          <FormField
            control={form.control}
            name="sender.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Street address <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <InputGroupText>
                        <MapPin className="h-4 w-4" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="House/road, block, area — e.g. House 42, Road 11, Banani"
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City + Region + Zip row */}
          <div className="grid gap-5 md:grid-cols-3">
            <FormField
              control={form.control}
              name="sender.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    City / District <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroupInput placeholder="e.g. Dhaka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sender.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Division / Region <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroupInput placeholder="e.g. Dhaka" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sender.zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">ZIP / Post code</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText className="tabular-nums text-[11px]">
                          ZIP
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        inputMode="numeric"
                        placeholder="1213"
                        maxLength={5}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Zone ID */}
          <FormField
            control={form.control}
            name="sender.zoneId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">
                  Pricing zone{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select zone for pickup address" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {zoneOptions.map((z) => (
                      <SelectItem key={z.zoneId} value={z.zoneId}>
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-sm font-medium">
                            {z.zoneId}{" "}
                            <span className="text-muted-foreground">·</span>{" "}
                            <span className="text-foreground/80">{z.region}</span>
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Covers {z.districts.length} district
                            {z.districts.length === 1 ? "" : "s"}:{" "}
                            {z.districts.slice(0, 3).join(", ")}
                            {z.districts.length > 3
                              ? ` +${z.districts.length - 3}`
                              : ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs">
                  Pricing zones are pre-mapped to all 64 Bangladesh districts.
                  If unsure, pick the zone that contains your district.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Right info column */}
      <div className="space-y-4">
        <Card className="border-border bg-muted/20">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Badge variant="outline" className="gap-1 border-primary/30">
                <MapPin className="h-3 w-3 text-primary" />
                Pickup tips
              </Badge>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed pl-0.5">
              <li>• Couriers arrive between 9:00 AM – 6:00 PM on the pickup date.</li>
              <li>• Keep the parcel sealed and ready at the pickup location.</li>
              <li>• An accessible phone number is mandatory — the courier calls before arrival.</li>
              <li>• For office pickups: include floor/room number in street line.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 space-y-2 text-xs leading-relaxed">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">Not sure about your zone?</p>
            </div>
            <p className="text-muted-foreground">
              Most of Dhaka north (Banani, Gulshan, Uttara) maps to{" "}
              <Badge variant="secondary">DH-N</Badge>, and Dhaka south (Dhanmondi,
              Motijheel, Jatrabari) to <Badge variant="secondary">DH-S</Badge>.
              Outside Dhaka, zone is usually the first two letters of the
              division.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
