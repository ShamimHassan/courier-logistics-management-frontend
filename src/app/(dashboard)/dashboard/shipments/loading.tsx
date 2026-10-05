import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function MyShipmentsLoading() {
  return (
    <div className="space-y-5 pb-10 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-primary/30">
              <Package className="h-3 w-3 text-primary" />
              My shipments
            </Badge>
          </div>
          <div className="h-8 w-56 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-80 max-w-[90%] rounded bg-muted animate-pulse" />
        </div>
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>

      <Card>
        <CardHeader className="space-y-4 border-b">
          {/* Tabs skeleton */}
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton
                key={`tab-${i}`}
                className="h-8 w-[92px] rounded-full"
              />
            ))}
          </div>

          {/* Toolbar skeleton */}
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-9 w-full sm:w-80 rounded-md" />
            <Skeleton className="h-9 w-44 rounded-md" />
            <div className="ml-auto flex items-center gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Columns header */}
          <div className="hidden md:flex items-center gap-4 px-6 py-3 text-[11px] uppercase tracking-wider text-muted-foreground border-b">
            <Skeleton className="h-3 w-[160px]" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24 ml-auto" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-12" />
          </div>

          {/* Rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`row-${i}`}
                className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)_100px_140px_140px_160px_60px] items-center gap-3 px-6 py-4"
              >
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-56 max-w-[90%]" />
                  <Skeleton className="h-3 w-40 max-w-[70%]" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-28 rounded-full" />
                <div className="space-y-1 md:text-right">
                  <Skeleton className="h-4 w-24 md:ml-auto" />
                  <Skeleton className="h-3 w-16 md:ml-auto" />
                </div>
                <Skeleton className="h-3 w-32 md:ml-auto" />
                <Skeleton className="h-8 w-8 rounded-md justify-self-end" />
              </div>
            ))}
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t px-6 py-4">
            <Skeleton className="h-3 w-56" />
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
