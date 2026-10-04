import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CustomerDashboardHomeLoading() {
  return (
    <div className="space-y-6">
      <Card className="border-indigo-500/20 bg-muted/10">
        <CardContent className="p-5 sm:p-6 space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-28 rounded-4xl" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full" />
        </CardContent>
      </Card>

      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-1">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3.5 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader className="pb-2 flex-row items-start justify-between gap-3 border-b">
            <div className="space-y-1">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-9 w-28 rounded-md" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 border-b space-y-2">
              <Skeleton className="h-9 w-72 max-w-full" />
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-24 rounded-4xl" />
                ))}
              </div>
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-3 grid grid-cols-[auto_1fr_auto] items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-64 max-w-full" />
                    <Skeleton className="h-3 w-40 max-w-full" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-52" />
            </CardHeader>
            <CardContent className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
