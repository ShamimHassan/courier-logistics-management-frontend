import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      {/* Edit profile skeleton */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex justify-end">
            <Skeleton className="h-9 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Change password skeleton */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-80 mt-1" />
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {[1, 2, 3].map((i) => (
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
  );
}
