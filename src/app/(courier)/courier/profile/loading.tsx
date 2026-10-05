import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CourierProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left */}
        <div className="lg:col-span-7 space-y-5">
          {/* Edit profile */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
                <div className="flex justify-end">
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader className="pb-4 border-b">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-72 mt-1" />
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <div className="flex justify-end">
                <Skeleton className="h-9 w-36" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="lg:col-span-5 space-y-5">
          {/* Availability */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-52 mt-1" />
            </CardHeader>
            <CardContent className="pt-5">
              <Skeleton className="h-14 w-full rounded-lg" />
              <Skeleton className="h-4 w-36 mt-3" />
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-3 space-y-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Vehicle */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56 mt-1" />
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zones table */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
