import Link from "next/link";
import { ArrowLeft, Home, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-10">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <PackageSearch className="h-14 w-14" strokeWidth={1.75} />
        </div>

        <div className="space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
              404 — Page not found
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              We couldn&apos;t find that shipment
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-xl">
              The page you are looking for may have been moved, deleted, or the
              tracking ID you followed doesn&apos;t exist. Use the buttons below
              to get back on track.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 md:justify-start justify-center pt-1">
            <Button asChild className="w-full sm:w-auto gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Return home
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="w-full sm:w-auto gap-2"
            >
              <Link href="/pricing">
                <ArrowLeft className="h-4 w-4" />
                Get a quote
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
