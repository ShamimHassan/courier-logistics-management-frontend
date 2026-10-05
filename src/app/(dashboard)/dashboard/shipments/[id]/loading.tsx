import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  PackageOpen,
  UserRound,
} from "lucide-react";
import Link from "next/link";

export default function ShipmentDetailLoading() {
  return (
    <div className="space-y-5 pb-10 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-md" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 border-primary/30">
                <PackageOpen className="h-3 w-3 text-primary" />
                Shipment
              </Badge>
            </div>
            <Skeleton className="h-7 w-64 rounded-md font-mono" />
            <Skeleton className="h-4 w-80 max-w-[90%] rounded" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-40 rounded-md" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* LEFT column (summary) */}
        <div className="md:col-span-7 space-y-5">
          {/* Amount + service */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
                Amount & service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`amt-${i}`} className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Sender ↔ Recipient */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="h-4.5 w-4.5 text-primary" />
                Sender & recipient
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={`addr-${i}`} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parcel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageOpen className="h-4.5 w-4.5 text-primary" />
                Parcel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`parcel-${i}`} className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
              <div className="pt-4 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-4 w-full max-w-xl" />
              </div>
              <div className="flex flex-wrap gap-2 pt-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowLeft className="h-4.5 w-4.5 text-primary" />
                Instructions & notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-5/6 max-w-2xl" />
            </CardContent>
          </Card>

          {/* Courier assignment + actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Courier & actions</CardTitle>
              <CardDescription className="text-xs">
                <Skeleton className="h-3 w-60" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Skeleton className="h-9 w-28 rounded-md" />
                <Skeleton className="h-9 w-40 rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT column (timeline + rating) */}
        <div className="md:col-span-5 space-y-5">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PackageOpen className="h-4.5 w-4.5 text-primary" />
                Tracking timeline
              </CardTitle>
              <CardDescription className="text-xs">
                <Skeleton className="h-3 w-24" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-6 relative">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={`ev-${i}`} className="flex gap-3 relative">
                    <div className="pt-0.5 shrink-0">
                      <Skeleton className="h-10 w-10 rounded-2xl" />
                    </div>
                    <div className="flex-1 space-y-2 pb-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-28 rounded-full" />
                        <Skeleton className="h-3 w-24 ml-auto" />
                      </div>
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="h-3 w-52 max-w-full" />
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
