"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useApiMutation } from "@/lib/hooks/useApiMutation";
import { refundPayment } from "@/lib/api/endpoints";
import { formatBDT } from "@/lib/utils";

/* ─── Schema ─────────────────────────────────────────────────────────────────── */

const refundSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Reason is required (min 3 characters)")
    .max(500),
  amount: z.string().optional(),
});

type RefundFormValues = z.infer<typeof refundSchema>;

/* ─── Props ──────────────────────────────────────────────────────────────────── */

export interface RefundDialogProps {
  paymentId: string | null;
  shipmentTrackingNumber?: string;
  maxAmount?: number;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function RefundDialog({
  paymentId,
  shipmentTrackingNumber,
  maxAmount,
  open,
  onClose,
  onSuccess,
}: RefundDialogProps) {
  const qc = useQueryClient();

  const form = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: { reason: "", amount: "" },
  });

  React.useEffect(() => {
    if (open) form.reset({ reason: "", amount: "" });
  }, [open, form]);

  const { mutate, isPending } = useApiMutation({
    mutationFn: (values: RefundFormValues) => {
      const parsedAmount = values.amount ? parseInt(values.amount, 10) : undefined;
      return refundPayment(paymentId!, {
        reason: values.reason,
        amount: parsedAmount && !isNaN(parsedAmount) ? parsedAmount : undefined,
      });
    },
    successToast: false,
    onSuccess: (data) => {
      const result = data as { refunded: boolean; amount: number; status: string };
      const toastMsg = `Refund of ${formatBDT(result.amount)} processed successfully.`;
      import("sonner").then(({ toast }) => toast.success(toastMsg));

      // Invalidate all payment/shipment related queries
      void qc.invalidateQueries({ queryKey: ["payments"] });
      void qc.invalidateQueries({ queryKey: ["admin", "shipments"] });
      void qc.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });

      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (values: RefundFormValues) => {
    if (!paymentId) return;
    mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-violet-500" />
            Process Refund
          </DialogTitle>
          <DialogDescription>
            Refund payment for shipment{" "}
            {shipmentTrackingNumber ? (
              <span className="font-mono font-semibold">{shipmentTrackingNumber}</span>
            ) : (
              "this shipment"
            )}
            .{maxAmount != null && (
              <> Maximum refundable: <strong>{formatBDT(maxAmount)}</strong>.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">
            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the reason for this refund…"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Recorded in the audit log and visible to the customer.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Amount (BDT){" "}
                    <span className="text-muted-foreground font-normal">
                      — optional, defaults to full amount
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={maxAmount}
                      placeholder={maxAmount ? String(maxAmount) : "Full amount"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !paymentId}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Process refund
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RefundDialog;
