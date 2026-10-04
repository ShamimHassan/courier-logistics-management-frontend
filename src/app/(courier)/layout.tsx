import type { Metadata } from "next";
import { Suspense } from "react";
import RoleDashboardShellClient from "@/components/layout/RoleDashboardShellClient";
import DashboardSkeleton from "@/components/layout/DashboardSkeleton";

export const metadata: Metadata = {
  title: {
    default: "Courier Dashboard",
    template: "%s · Courier Dashboard",
  },
  description:
    "CourierFlow courier workspace — accept assignments, mark pickups, record deliveries and track your earnings.",
  robots: { index: false, follow: false },
};

export default function CourierDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleDashboardShellClient role="COURIER">
      <Suspense fallback={<DashboardSkeleton rows={5} cols={4} />}>
        {children}
      </Suspense>
    </RoleDashboardShellClient>
  );
}
