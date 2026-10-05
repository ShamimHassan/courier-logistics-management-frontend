import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
    </TableRow>
  );
}

export default function EarningsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Date filter card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            <Skeleton className="h-9 flex-1 min-w-[140px]" />
            <Skeleton className="h-9 flex-1 min-w-[140px]" />
            <Skeleton className="h-9 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 flex-row items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3.5 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart card */}
      <Card>
        <CardHeader className="border-b pb-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-56 flex items-end gap-1 px-4">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${25 + Math.abs(Math.sin(i * 0.8)) * 55}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table card */}
      <Card>
        <CardHeader className="border-b py-3 px-4 flex-row items-center justify-between gap-3">
          <div className="space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3.5 w-44" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </CardHeader>
        <Table className="[&_td]:py-3.5 [&_th]:py-3">
          <TableHeader>
            <TableRow>
              {["Completed", "Tracking #", "Service", "Shipment Amount", "Your Earning"].map(
                (h) => <TableHead key={h}>{h}</TableHead>,
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
