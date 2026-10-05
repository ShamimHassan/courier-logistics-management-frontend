"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Home,
  PackagePlus,
  PackageX,
  RefreshCcw,
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ShipmentDetailErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ShipmentDetailErrorBoundary({
  error,
  reset,
}: ShipmentDetailErrorBoundaryProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[shipments/[id]] error boundary caught:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10 px-4">
      <Card className="w-full max-w-xl border-destructive/30 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="gap-1 border-destructive/40 text-destructive"
            >
              <PackageX className="h-3 w-3" />
              Shipment detail error
            </Badge>
          </div>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl font-bold tracking-tight">
            <span className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="h-4.5 w-4.5" />
            </span>
            Something went wrong loading this shipment
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed pt-1">
            We couldn&apos;t load this shipment right now. Your data is safe —
            try the actions below to refresh or navigate away.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">
              {error.name || "Application error"}
            </AlertTitle>
            <AlertDescription className="text-[11px] pt-0.5 leading-relaxed break-words">
              {error.message ||
                "An unexpected error occurred. If this persists, contact support with the digest code below."}
            </AlertDescription>
          </Alert>

          {error.digest ? (
            <div className="rounded-lg border border-border bg-muted/30 p-3 font-mono text-[11px] text-muted-foreground break-all">
              <span className="font-semibold text-foreground/70 mr-2">
                DIGEST:
              </span>
              {error.digest}
            </div>
          ) : null}

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="default" onClick={reset} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
            <Button type="button" variant="outline" asChild className="gap-2">
              <Link href="/dashboard/shipments">
                <ArrowLeft className="h-4 w-4" />
                Back to my shipments
              </Link>
            </Button>
            <Button type="button" variant="outline" asChild className="gap-2">
              <Link href="/dashboard/shipments/new">
                <PackagePlus className="h-4 w-4" />
                Book a new shipment
              </Link>
            </Button>
            <Button type="button" variant="ghost" asChild className="sm:col-span-2 gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Return to dashboard home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
