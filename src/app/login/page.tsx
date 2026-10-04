import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoginForm from "./login-form";

export const metadata = {
  title: "Sign in — CourierFlow",
  description:
    "Sign in to your CourierFlow account to manage shipments, track packages, and access your dashboard.",
};

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-7 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </div>
        <div className="rounded-xl border border-muted/60 bg-card/80 p-6 shadow-lg flex flex-col gap-6">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-8 w-full bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-3 w-28 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-8 w-full bg-muted rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 border rounded" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-9 w-full bg-primary/60 rounded-lg animate-pulse flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground/80" />
            </div>
            <div className="h-9 w-full border rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
