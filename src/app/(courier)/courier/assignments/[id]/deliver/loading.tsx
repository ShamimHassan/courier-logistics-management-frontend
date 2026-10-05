import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DeliveryAttemptLoading() {
  return (
    <div className="space-y-5 pb-10 max-w-2xl">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-28 rounded-full" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Recipient card */}
      <Card className="border-dashed">
        <CardContent className="p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-64" />
          </div>
        </CardContent>
      </Card>

      {/* Outcome radio card */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </CardContent>
      </Card>

      {/* Fields card */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-14 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Submit row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-44" />
      </div>
    </div>
  );
}
