import type { Metadata } from "next";
import { Suspense } from "react";
import RoleDashboardShellClient from "@/components/layout/RoleDashboardShellClient";
import DashboardSkeleton from "@/components/layout/DashboardSkeleton";

export const metadata: Metadata = {
  title: {
    default: "Customer Dashboard",
    template: "%s · Customer Dashboard",
  },
  description:
    "CourierFlow customer workspace — book shipments, track parcels, manage payments and update your profile.",
  robots: { index: false, follow: false },
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleDashboardShellClient role="CUSTOMER">
      <Suspense fallback={<DashboardSkeleton rows={5} cols={4} />}>
        {children}
      </Suspense>
    </RoleDashboardShellClient>
  );
}
