"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CreditCard, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();

  const tranId = searchParams.get("tran_id") ?? searchParams.get("tranId") ?? null;
  const shipmentId = searchParams.get("shipmentId") ?? searchParams.get("shipment_id") ?? null;

  /* Build retry URL — go back to the shipment detail which has "Pay Now" */
  const retryHref = shipmentId
    ? `/dashboard/shipments/${shipmentId}`
    : "/dashboard/shipments";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-500/[0.04] via-background to-background">
      <div className="w-full max-w-md">
        <Card className="border-rose-500/20 shadow-xl overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-rose-400 via-orange-400 to-amber-400" />

          <CardContent className="pt-10 pb-8 flex flex-col items-center text-center gap-5">
            {/* Icon */}
            <div className="h-20 w-20 rounded-full bg-rose-500/10 flex items-center justify-center ring-4 ring-rose-500/15">
              <XCircle className="h-10 w-10 text-rose-500" />
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Payment Cancelled
              </h1>
              <p className="text-sm text-muted-foreground max-w-xs">
                You cancelled the payment. Your shipment is still saved and you
                can retry payment whenever you&apos;re ready.
              </p>
            </div>

            {/* Details */}
            {tranId && (
              <div className="w-full rounded-xl border border-rose-500/15 bg-rose-500/[0.03] p-4 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reference ID</span>
                  <span className="font-mono font-semibold text-xs">{tranId}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground px-4">
              No charges were made to your account. Your shipment status remains{" "}
              <span className="font-semibold text-foreground">Payment Pending</span>.
            </p>

            <Separator />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button asChild className="flex-1">
                <Link href={retryHref}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Retry payment
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
