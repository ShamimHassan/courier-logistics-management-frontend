import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-64 rounded-lg" />

      {/* Rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl border p-4">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-3.5 w-24 shrink-0" />
            </div>
            <Skeleton className="h-3.5 w-full max-w-sm" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
