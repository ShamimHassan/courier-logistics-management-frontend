"use client";

import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardSkeleton({
  rows = 4,
  cols = 2,
  className,
}: {
  rows?: number;
  cols?: 2 | 3 | 4;
  className?: string;
}) {
  const gridCols =
    cols === 4
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      : cols === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={cn("space-y-6", className)} aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      <div className={cn("grid gap-4", gridCols)}>
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`stat-${i}`}
            className="rounded-xl border bg-card p-5 space-y-3"
          >
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-3 w-40 rounded-md" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-5">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={`row-${i}`}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-56 max-w-full rounded-md" />
                <Skeleton className="h-3 w-40 max-w-full rounded-md" />
              </div>
              <Skeleton className="hidden sm:block h-8 w-24 shrink-0 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
