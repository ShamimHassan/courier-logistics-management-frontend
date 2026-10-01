"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
    const message = error?.message?.length
      ? error.message
      : "An unexpected error occurred.";
    toast.error(message);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <AlertTriangle className="h-10 w-10" strokeWidth={1.75} />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            We hit an unexpected bump while processing your request. You can
            try again or head back to the home page.
            {error?.digest && (
              <span className="mt-2 block text-xs text-muted-foreground/80">
                Reference: <code className="font-mono">{error.digest}</code>
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button
            asChild
            variant="secondary"
            className="w-full sm:w-auto gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
