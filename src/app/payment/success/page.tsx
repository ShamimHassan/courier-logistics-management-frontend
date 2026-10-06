"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* Simple CSS confetti burst on mount */
function ConfettiBurst() {
  const pieces = React.useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      colour: [
        "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6",
        "#ef4444", "#ec4899", "#06b6d4",
      ][i % 7],
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 w-2 h-2 rounded-sm opacity-0 animate-[confetti_1.2s_ease-out_forwards]"
          style={{
            left: `${p.x}%`,
            backgroundColor: p.colour,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(180px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();

  /* SSLCommerz passes these as query params after redirect */
  const tranId = searchParams.get("tran_id") ?? searchParams.get("tranId") ?? null;
  const valId = searchParams.get("val_id") ?? null;
  const shipmentId = searchParams.get("shipmentId") ?? searchParams.get("shipment_id") ?? null;
  const amount = searchParams.get("amount") ?? null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500/[0.05] via-background to-background">
      <div className="w-full max-w-md relative">
        <ConfettiBurst />

        <Card className="border-emerald-500/30 shadow-xl relative overflow-hidden">
          {/* Decorative top band */}
          <div className="h-1.5 w-full bg-linear-to-r from-emerald-400 via-teal-400 to-cyan-400" />

          <CardContent className="pt-10 pb-8 flex flex-col items-center text-center gap-5">
            {/* Icon */}
            <div className="h-20 w-20 rounded-full bg-emerald-500/15 flex items-center justify-center ring-4 ring-emerald-500/20">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
                Payment Successful!
              </h1>
              <p className="text-sm text-muted-foreground">
                Your payment has been confirmed. We&apos;re processing your
                shipment now.
              </p>
            </div>

            {/* Details */}
            {(tranId || valId || amount) && (
              <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left space-y-2.5">
                {tranId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ReceiptText className="h-3.5 w-3.5" />
                      Transaction ID
                    </span>
                    <span className="font-mono font-semibold text-xs">{tranId}</span>
                  </div>
                )}
                {amount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount paid</span>
                    <span className="font-semibold">৳ {Number(amount).toLocaleString()}</span>
                  </div>
                )}
                {valId && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Validation ID</span>
                    <Badge variant="outline" className="font-mono text-[10px]">{valId.slice(0, 20)}</Badge>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {shipmentId ? (
                <Button asChild className="flex-1">
                  <Link href={`/dashboard/shipments/${shipmentId}`}>
                    <Package className="h-4 w-4 mr-2" />
                    View shipment
                  </Link>
                </Button>
              ) : (
                <Button asChild className="flex-1">
                  <Link href="/dashboard/shipments">
                    <Package className="h-4 w-4 mr-2" />
                    My shipments
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
