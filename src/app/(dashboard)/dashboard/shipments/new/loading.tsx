import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PackagePlus,
  Sparkles,
} from "lucide-react";

export default function CreateShipmentLoading() {
  return (
    <div className="space-y-5 pb-10 animate-in fade-in-0 duration-300">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-primary/30">
              <PackagePlus className="h-3 w-3 text-primary" />
              New shipment
            </Badge>
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Sparkles className="h-3 w-3 text-primary" />
              Step 1 of 4
            </Badge>
          </div>
          <div className="h-8 w-64 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-96 max-w-[90%] rounded bg-muted animate-pulse" />
        </div>
      </div>

      {/* Stepper skeleton */}
      <nav
        aria-label="Create shipment progress"
        className="w-full rounded-2xl border bg-background/60 backdrop-blur-sm p-4 sm:p-5"
      >
        <ol className="relative flex items-center justify-between gap-1 sm:gap-3">
          <div className="absolute left-0 right-0 top-[18px] sm:top-6 mx-10 sm:mx-12 h-0.5 bg-border" />
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="relative z-10 flex flex-col items-center gap-1.5 flex-1 min-w-0"
            >
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-border bg-background animate-pulse" />
              <div className="space-y-1 text-center">
                <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                <div className="h-2 w-12 rounded bg-muted animate-pulse" />
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step info banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <div className="h-4 w-4 rounded bg-primary/30 animate-pulse mt-0.5 shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-56 rounded bg-muted animate-pulse" />
          <div className="h-3 w-full rounded bg-muted animate-pulse" />
        </div>
      </div>

      {/* Step content card */}
      <Card className="border-border/80 bg-card shadow-sm">
        <CardHeader className="pb-3 flex-row items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <div className="h-5 w-56 rounded bg-muted animate-pulse" />
            <CardDescription className="text-xs sm:text-sm">
              <div className="h-3 w-28 rounded bg-muted animate-pulse mt-2" />
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] opacity-70">
            Secure checkout
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr] items-start">
            {/* Left column: fields skeleton */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border/60 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 animate-pulse" />
                  <div className="h-5 w-52 rounded bg-muted animate-pulse" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-10 w-full rounded-md border border-border bg-muted/30 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-10 w-full rounded-md border border-border bg-muted/30 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-muted animate-pulse" />
                  <div className="h-10 w-full rounded-md border border-border bg-muted/30 animate-pulse" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-14 rounded bg-muted animate-pulse" />
                      <div className="h-10 w-full rounded-md border border-border bg-muted/30 animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="h-20 rounded-xl border border-border bg-muted/30 animate-pulse" />
                  <div className="h-20 rounded-xl border border-border bg-muted/30 animate-pulse" />
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-5 space-y-4">
                <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                <div className="grid gap-3 md:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-28 rounded-xl border border-border bg-muted/30 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: quote summary skeleton */}
            <div className="lg:sticky lg:top-6 space-y-4">
              <Card className="border-primary/30 ring-1 ring-primary/10 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 animate-pulse" />
                    <div className="h-5 w-32 rounded bg-muted animate-pulse" />
                  </div>
                  <CardDescription className="text-xs pt-1.5">
                    <div className="h-3 w-full rounded bg-muted animate-pulse" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2 space-y-4">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-52 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="h-3.5 w-full rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-[88%] rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-[70%] rounded bg-muted animate-pulse" />
                    <div className="h-3.5 w-[80%] rounded bg-muted animate-pulse" />
                  </div>
                  <div className="h-px bg-border" />
                  <div className="h-8 w-full rounded bg-muted animate-pulse" />
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-2 border-t pt-4">
                  <div className="h-11 w-full rounded-md bg-primary/30 animate-pulse" />
                  <div className="h-3 w-full rounded bg-muted animate-pulse" />
                </CardFooter>
              </Card>
              <div className="h-28 rounded-xl border border-border bg-muted/30 animate-pulse" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
          <div className="h-3 max-w-md w-full rounded bg-muted animate-pulse" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="h-9 w-24 rounded-md border border-border bg-muted/50 animate-pulse" />
            <div className="h-9 w-32 rounded-md bg-primary/50 animate-pulse" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
