import type { Metadata } from "next";
import { Suspense } from "react";
import RoleDashboardShellClient from "@/components/layout/RoleDashboardShellClient";
import DashboardSkeleton from "@/components/layout/DashboardSkeleton";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s · Admin Dashboard",
  },
  description:
    "CourierFlow administrator workspace — manage shipments, users, hubs, pricing rules and audit logs.",
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleDashboardShellClient role="ADMIN">
      <Suspense fallback={<DashboardSkeleton rows={5} cols={4} />}>
        {children}
      </Suspense>
    </RoleDashboardShellClient>
  );
}
