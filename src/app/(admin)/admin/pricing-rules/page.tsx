"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Loader2,
  PlusCircle,
  RefreshCw,
  Scale,
} from "lucide-react";import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getHubs, createPricingRule, updatePricingRule } from "@/lib/api/endpoints";
import type { Hub, PaginatedData, PricingRule, ServiceType } from "@/lib/api/types";
import { cn, formatBDT, formatDate } from "@/lib/utils";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const SERVICE_COLOURS: Record<ServiceType, string> = {
  STANDARD: "border-slate-400/40 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  EXPRESS: "border-indigo-400/40 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  OVERNIGHT: "border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

function numStr(v: number | null | undefined) {
  return v?.toString() ?? "";
}

/* ─── Form value types — all strings for <input type="number"> ─────────────── */

interface CreateRuleValues {
  serviceType: "STANDARD" | "EXPRESS" | "OVERNIGHT";
  minWeightKg: string;
  maxWeightKg: string;
  basePrice: string;
  weightSurchargePerKg: string;
  expressFee: string;
  taxRatePercent: string;
  insuranceFeePercent: string;
  codFeePercent: string;
  codFeeMin: string;
  effectiveFrom: string;
  effectiveUntil: string;
}

interface EditRuleValues {
  basePrice: string;
  weightSurchargePerKg: string;
  taxRatePercent: string;
  isActive: boolean;
  effectiveUntil: string;
}

/* ─── Number input field helper ─────────────────────────────────────────── */

function NumField({
  label,
  placeholder,
  step = "1",
  required = false,
  field,
}: {
  label: string;
  placeholder?: string;
  step?: string;
  required?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
}) {
  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <Input
          type="number"
          step={step}
          min="0"
          placeholder={placeholder}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

/* ─── Create rule modal ────────────────────────────────────────────────── */

function CreateRuleModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<CreateRuleValues>({
    defaultValues: {
      serviceType: "STANDARD",
      minWeightKg: "0",
      maxWeightKg: "10",
      basePrice: "100",
      weightSurchargePerKg: "0",
      expressFee: "0",
      taxRatePercent: "5",
      insuranceFeePercent: "0",
      codFeePercent: "0",
      codFeeMin: "0",
      effectiveFrom: "",
      effectiveUntil: "",
    },
  });

  React.useEffect(() => {
    if (open) form.reset();
  }, [open, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: CreateRuleValues) =>
      createPricingRule({
        serviceType: values.serviceType,
        minWeightKg: parseFloat(values.minWeightKg) || 0,
        maxWeightKg: parseFloat(values.maxWeightKg),
        basePrice: parseInt(values.basePrice, 10),
        weightSurchargePerKg: parseInt(values.weightSurchargePerKg, 10) || 0,
        expressFee: parseInt(values.expressFee, 10) || 0,
        taxRatePercent: parseFloat(values.taxRatePercent) || 5,
        insuranceFeePercent: parseFloat(values.insuranceFeePercent) || 0,
        codFeePercent: parseFloat(values.codFeePercent) || 0,
        codFeeMin: parseInt(values.codFeeMin, 10) || 0,
        effectiveFrom: values.effectiveFrom || undefined,
        effectiveUntil: values.effectiveUntil || undefined,
      }),
    successToast: "Pricing rule created.",
    onSuccess: () => { onSuccess(); onClose(); },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-500" />
            Create Pricing Rule
          </DialogTitle>
          <DialogDescription>
            Define a new rule for a service type and weight bracket.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4 pt-1">
            {/* Service type */}
            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service type…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="EXPRESS">Express</SelectItem>
                      <SelectItem value="OVERNIGHT">Overnight</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="minWeightKg"
                render={({ field }) => <NumField label="Min Weight (kg)" step="0.1" field={field} />} />
              <FormField control={form.control} name="maxWeightKg"
                render={({ field }) => <NumField label="Max Weight (kg)" step="0.1" required field={field} />} />
              <FormField control={form.control} name="basePrice"
                render={({ field }) => <NumField label="Base Price (BDT)" required field={field} />} />
              <FormField control={form.control} name="weightSurchargePerKg"
                render={({ field }) => <NumField label="Surcharge / kg (BDT)" field={field} />} />
              <FormField control={form.control} name="expressFee"
                render={({ field }) => <NumField label="Express Fee (BDT)" field={field} />} />
              <FormField control={form.control} name="taxRatePercent"
                render={({ field }) => <NumField label="Tax Rate (%)" step="0.1" field={field} />} />
              <FormField control={form.control} name="codFeePercent"
                render={({ field }) => <NumField label="CoD Fee (%)" step="0.1" field={field} />} />
              <FormField control={form.control} name="codFeeMin"
                render={({ field }) => <NumField label="CoD Fee Min (BDT)" field={field} />} />
              <FormField control={form.control} name="insuranceFeePercent"
                render={({ field }) => <NumField label="Insurance (%)" step="0.1" field={field} />} />

              {/* Effective dates */}
              <FormField control={form.control} name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField control={form.control} name="effectiveUntil"
                render={({ field }) => (
                  <FormItem className="col-span-2 sm:col-span-1">
                    <FormLabel>Effective Until</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create rule
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Edit rule dialog ─────────────────────────────────────────────────── */

function EditRuleDialog({
  rule,
  open,
  onClose,
  onSuccess,
}: {
  rule: PricingRule | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<EditRuleValues>({
    defaultValues: {
      basePrice: "",
      weightSurchargePerKg: "",
      taxRatePercent: "",
      isActive: true,
      effectiveUntil: "",
    },
  });

  React.useEffect(() => {
    if (open && rule) {
      form.reset({
        basePrice: numStr(rule.basePrice),
        weightSurchargePerKg: numStr(rule.weightSurchargePerKg),
        taxRatePercent: numStr(rule.taxRatePercent),
        isActive: rule.isActive,
        effectiveUntil: rule.effectiveUntil
          ? new Date(rule.effectiveUntil).toISOString().slice(0, 10)
          : "",
      });
    }
  }, [open, rule, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: EditRuleValues) =>
      updatePricingRule(rule!.id, {
        basePrice: values.basePrice ? parseInt(values.basePrice, 10) : undefined,
        weightSurchargePerKg: values.weightSurchargePerKg
          ? parseInt(values.weightSurchargePerKg, 10)
          : undefined,
        taxRatePercent: values.taxRatePercent
          ? parseFloat(values.taxRatePercent)
          : undefined,
        isActive: values.isActive,
        effectiveUntil: values.effectiveUntil || undefined,
      }),
    successToast: "Pricing rule updated.",
    onSuccess: () => { onSuccess(); onClose(); },
  });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-amber-500" />
            Edit Pricing Rule
          </DialogTitle>
          <DialogDescription>
            {rule?.serviceType} · {rule?.minWeightKg}–{rule?.maxWeightKg} kg
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="basePrice"
                render={({ field }) => <NumField label="Base Price (BDT)" field={field} />} />
              <FormField control={form.control} name="weightSurchargePerKg"
                render={({ field }) => <NumField label="Surcharge/kg (BDT)" field={field} />} />
              <FormField control={form.control} name="taxRatePercent"
                render={({ field }) => <NumField label="Tax Rate (%)" step="0.1" field={field} />} />
              <FormField control={form.control} name="effectiveUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Until</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Switch
                      id="rule-active"
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                    <FormLabel htmlFor="rule-active" className="cursor-pointer text-sm font-medium">
                      Rule is active
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function AdminPricingRulesPage() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<PricingRule | null>(null);

  /* Inline isActive toggle via updatePricingRule */
  const { mutate: toggleActive } = useApiMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updatePricingRule(id, { isActive }),
    successToast: false,
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["admin", "pricing-rules"] }),
  });

  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["admin", "pricing-rules"] });

  /* NOTE: The backend doesn't expose GET /admin/pricing-rules as a list endpoint.
     We render the create/edit UI as functional and show an informational empty state.
     Rules are used by the quote engine internally. */
  const items: PricingRule[] = [];

  return (
    <>
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-500" />
            Pricing Rules
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure pricing for each service type and weight bracket.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create rule
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b py-3 px-4">
          <CardTitle className="text-sm font-semibold">Active Rules</CardTitle>
          <CardDescription className="text-xs">
            Rules are applied automatically during shipment quote calculation.
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table className="[&_td]:py-3 [&_th]:py-3">
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead className="whitespace-nowrap">Weight (kg)</TableHead>
                <TableHead className="text-right whitespace-nowrap">Base (BDT)</TableHead>
                <TableHead className="text-right whitespace-nowrap">Surcharge/kg</TableHead>
                <TableHead className="text-right">Tax %</TableHead>
                <TableHead className="whitespace-nowrap">Effective Until</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="py-16 text-center space-y-3">
                      <Scale className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">No pricing rules yet</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Create rules to control pricing for STANDARD, EXPRESS and OVERNIGHT
                          deliveries by weight bracket. Rules are applied automatically during
                          the quote calculation.
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setCreateOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create first rule
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((r) => (
                  <TableRow key={r.id} className="group">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] font-medium border", SERVICE_COLOURS[r.serviceType])}
                      >
                        {r.serviceType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {r.minWeightKg}–{r.maxWeightKg}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm font-semibold">
                      {formatBDT(r.basePrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {formatBDT(r.weightSurchargePerKg)}
                    </TableCell>
                    <TableCell className="text-right text-sm">{r.taxRatePercent}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.effectiveUntil ? formatDate(r.effectiveUntil) : "∞"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={r.isActive}
                        onCheckedChange={(v) => toggleActive({ id: r.id, isActive: v })}
                        aria-label="Toggle rule active"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs opacity-70 group-hover:opacity-100"
                        onClick={() => setEditTarget(r)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <CreateRuleModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={invalidate}
      />
      <EditRuleDialog
        rule={editTarget}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={invalidate}
      />
    </>
  );
}
