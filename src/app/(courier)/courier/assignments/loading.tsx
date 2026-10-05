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
      <TableCell>
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell>
        <div className="flex gap-2 justify-end">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AssignmentsLoading() {
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-full max-w-lg rounded-lg mb-4" />

      {/* Table card */}
      <Card>
        <CardHeader className="border-b py-3 px-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-20 mt-1" />
        </CardHeader>
        <CardContent className="p-0">
          <Table className="[&_td]:py-3.5 [&_th]:py-3">
            <TableHeader>
              <TableRow>
                {["Assignment ID", "Shipment / Route", "Status", "Earning", "Assigned", ""].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
