import { Suspense } from "react";
import { Loader2, ShieldCheck, User, Mail, Phone, LockKeyhole } from "lucide-react";
import RegisterForm from "./register-form";

export const metadata = {
  title: "Create account — CourierFlow",
  description:
    "Create a free CourierFlow customer account. Book shipments, track packages, and pay securely via SSLCommerz across all 64 Bangladesh districts.",
};

function RegisterSkeleton() {
  const rows = [
    { w1: "w-28", w2: "w-full", icon: <User className="h-4 w-4" /> },
    { w1: "w-40", w2: "w-full", icon: <Phone className="h-4 w-4" /> },
  ];
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-primary/5 px-4 py-10">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="h-7 w-44 bg-muted rounded animate-pulse" />
          <div className="h-4 w-80 bg-muted rounded animate-pulse" />
        </div>
        <div className="rounded-xl border border-muted/60 bg-card/80 p-6 shadow-lg flex flex-col gap-6">
          <div className="space-y-2">
            <div className="h-7 w-44 bg-muted rounded animate-pulse" />
            <div className="h-4 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {rows.map((r, i) => (
                <div key={i} className="space-y-2">
                  <div className={`h-4 ${r.w1} bg-muted rounded animate-pulse`} />
                  <div className="h-8 w-full bg-muted rounded animate-pulse flex items-center px-2.5 gap-2 text-muted-foreground">
                    {r.icon}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-8 w-full bg-muted rounded animate-pulse flex items-center px-2.5 gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-full bg-muted rounded animate-pulse flex items-center px-2.5 gap-2 text-muted-foreground">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <div className="h-12 space-y-1.5 pt-2">
                <div className="flex gap-1.5">
                  <div className="h-1.5 flex-1 bg-border rounded-full animate-pulse" />
                  <div className="h-1.5 flex-1 bg-border rounded-full animate-pulse" />
                  <div className="h-1.5 flex-1 bg-border rounded-full animate-pulse" />
                  <div className="h-1.5 flex-1 bg-border rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-8 w-full bg-muted rounded animate-pulse flex items-center px-2.5 gap-2 text-muted-foreground">
                <LockKeyhole className="h-4 w-4" />
              </div>
            </div>
            <div className="h-9 w-full bg-primary/60 rounded-lg animate-pulse flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground/80" />
            </div>
            <div className="h-9 w-full border rounded-lg animate-pulse flex items-center justify-center" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterForm />
    </Suspense>
  );
}
