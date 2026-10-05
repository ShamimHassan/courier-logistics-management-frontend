import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function KpiRow() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboardLoading() {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* 3 KPI sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <section key={i} className="mb-6">
          <div className="flex items-end justify-between mb-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <KpiRow />
        </section>
      ))}

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3 mt-2">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-56 mt-1" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-52 flex items-end gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{ height: `${30 + Math.abs(Math.sin(i)) * 50}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b pb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-44 mt-1" />
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-2.5 rounded-full flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 mt-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="border-b pb-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-44 mt-1" />
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-12 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    </>
  );
}
