"use client";

import { useMemo } from "react";
import { BadgeCheck, Copy, MapPin, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";

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

export interface Step2RecipientProps {
  form: UseFormReturn<Wizard4StepInput>;
  onCopySenderToRecipient?: () => void;
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

export default function Step2Recipient({
  form,
  onCopySenderToRecipient,
}: Step2RecipientProps) {
  const zoneOptions = useMemo(buildZoneOptions, []);

  function handleCopy() {
    const values = form.getValues();
    form.setValue("recipient", { ...values.sender }, { shouldDirty: true, shouldTouch: true, shouldValidate: false });
    form.clearErrors("recipient");
    onCopySenderToRecipient?.();
    toast.success("Sender details copied to recipient", {
      description: "Edit the phone/name if the recipient is a different person.",
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] items-start">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <UserRound className="h-4 w-4" />
                </span>
                Recipient (delivery) address
              </CardTitle>
              <CardDescription className="text-sm">
                The person receiving the parcel — courier calls this number
                before drop-off.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 self-start"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy sender
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Name + Phone row */}
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              control={form.control}
              name="recipient.fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Full name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>
                          <UserRound className="h-4 w-4" />
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput placeholder="e.g. Ms. Fatema Khatun" {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipient.phone"
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
                    Mandatory — couriers call 30 min before arrival.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address label */}
          <FormField
            control={form.control}
            name="recipient.label"
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
                        hint: "Residential drop-off",
                      },
                      {
                        value: "office" as const,
                        label: "Office",
                        hint: "Reception desk",
                      },
                      {
                        value: "other" as const,
                        label: "Other",
                        hint: "Add in delivery notes",
                      },
                    ].map((opt) => (
                      <Label
                        key={opt.value}
                        htmlFor={`recipient-label-${opt.value}`}
                        className={[
                          "cursor-pointer rounded-xl border border-border px-3 py-2 pr-4 flex items-center gap-2.5 transition-all",
                          "has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20",
                          "hover:border-primary/40 hover:bg-muted/30",
                        ].join(" ")}
                      >
                        <RadioGroupItem value={opt.value} id={`recipient-label-${opt.value}`} />
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
            name="recipient.street"
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
                      placeholder="House, road, landmark — e.g. Suite 9B, Zaman Tower, 32 Kemal Ataturk Ave"
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
              name="recipient.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    City / District <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroupInput placeholder="e.g. Chattogram" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipient.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">
                    Division / Region <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroupInput placeholder="e.g. Chattogram" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recipient.zip"
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
                        placeholder="4000"
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
            name="recipient.zoneId"
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
                      <SelectValue placeholder="Select zone for delivery address" />
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
                  Metro-corridor delivery (DH-N → DH-S, CTG-N → CTG-S) enjoys
                  1-day Overnight ELA. Same-zone (local metro) has the lowest
                  rate.
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
          <CardContent className="p-4 space-y-2.5 text-xs leading-relaxed">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Badge variant="outline" className="gap-1 border-primary/30">
                <BadgeCheck className="h-3 w-3 text-primary" />
                Delivery best practice
              </Badge>
            </div>
            <ul className="space-y-1.5 text-muted-foreground pl-0.5">
              <li>• Double-check the recipient phone — it is the #1 cause of missed drop-offs.</li>
              <li>• If sending COD (Cash on Delivery), the recipient must have the exact cash ready.</li>
              <li>• Include floor/room/company name for offices — reception drop-offs by default.</li>
              <li>• Surprise gift? Add &quot;Do not mention contents on phone&quot; in delivery instructions (step 4).</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 space-y-2.5 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">Copy sender?</p>
            <p>
              Sending to yourself, or same-return address? Click{" "}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-6 px-2 mx-1 text-[11px] gap-1 inline-flex align-middle"
              >
                <Copy className="h-3 w-3" /> Copy sender
              </Button>{" "}
              to auto-fill — then you only need to update the phone or name if
              different.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
