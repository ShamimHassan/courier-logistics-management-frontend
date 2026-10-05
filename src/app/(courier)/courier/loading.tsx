import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CourierOverviewLoading() {
  return (
    <>
      {/* Welcome banner */}
      <Card className="mb-6">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-9 w-9" />
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 flex-row items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3.5 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-4 mt-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Assignments list */}
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-9 w-24 shrink-0" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3.5 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20 shrink-0" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Skeleton className="h-14 rounded-lg" />
                  <Skeleton className="h-14 rounded-lg" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Availability */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3.5 w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-3.5 w-3/4 mt-3" />
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3.5 w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-t-md"
                    style={{ height: `${30 + i * 8}%` }}
                  />
                ))}
              </div>
              <Skeleton className="h-4 w-full mt-3" />
            </CardContent>
          </Card>

          {/* Earnings summary */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              <Skeleton className="h-9 w-full mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
