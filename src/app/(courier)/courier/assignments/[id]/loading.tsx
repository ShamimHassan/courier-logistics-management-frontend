import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AssignmentDetailLoading() {
  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left */}
        <div className="lg:col-span-7 space-y-5">
          {/* Route card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-48" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parcel card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline card */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-48 mt-1" />
            </CardHeader>
            <CardContent className="pt-4 space-y-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center shrink-0">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    {i < 3 && (
                      <div className="w-0.5 h-10 bg-muted mt-1" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5 pt-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3.5 w-56" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="pb-3 border-b">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56 mt-1" />
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3 border-b">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
