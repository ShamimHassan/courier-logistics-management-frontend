"use client";

import {
  Bell,
  CreditCard,
  Home as HomeIcon,
  Package,
  PlusCircle,
  Settings,
  User,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardShell from "@/components/layout/DashboardShell";
import SidebarNav, { type SidebarNavItem } from "@/components/layout/SidebarNav";
import { formatBDT, formatDateTime } from "@/lib/utils";

const DEMO_SIDEBAR_ITEMS: SidebarNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: HomeIcon, roles: ["CUSTOMER"] },
  { label: "My Shipments", href: "/dashboard/shipments", icon: Package, roles: ["CUSTOMER"], badge: 12 },
  { label: "Create Shipment", href: "/dashboard/shipments/new", icon: PlusCircle, roles: ["CUSTOMER"] },
  { label: "Pricing Calculator", href: "/dashboard/pricing", icon: CreditCard, roles: ["CUSTOMER"] },
  { label: "Track & Trace", href: "/dashboard/track", icon: MapPin, roles: ["CUSTOMER"] },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["CUSTOMER", "COURIER", "ADMIN"], badge: 3 },
  { label: "Profile", href: "/dashboard/profile", icon: User, roles: ["CUSTOMER", "COURIER", "ADMIN"] },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["CUSTOMER", "COURIER", "ADMIN"] },
];

export default function CustomerDashboardPreviewPage() {
  return (
    <DashboardShell
      sidebarTitle="Customer"
      sidebar={
        <SidebarNav
          items={DEMO_SIDEBAR_ITEMS}
          role="CUSTOMER"
          title="Customer Workspace"
        />
      }
      headerSlot={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">
              Welcome back, Shamim 👋
            </h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Here&apos;s your CourierFlow summary for today.
            </p>
          </div>
          <Button size="sm" asChild>
            <a href="/dashboard/shipments/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              New shipment
            </a>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total shipments
            </CardTitle>
            <CardDescription>Lifetime</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">47</p>
            <p className="text-xs text-emerald-600 mt-1">+6 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In transit
            </CardTitle>
            <CardDescription>Active now</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              9 <Badge variant="outline" className="ml-1">IN_TRANSIT</Badge>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Est. delivery by {formatDateTime(new Date(Date.now() + 86400000 * 2))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spent this month
            </CardTitle>
            <CardDescription>September</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatBDT(12480)}</p>
            <p className="text-xs text-muted-foreground mt-1">14 shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On-time rate
            </CardTitle>
            <CardDescription>Last 30 deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">98.4%</p>
            <p className="text-xs text-muted-foreground mt-1">Avg 1.3 days</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent shipments</CardTitle>
          <CardDescription>
            Dashboard shell preview — sidebar, header &amp; KPI cards wired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Tracking ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Destination</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { id: "CFY20261001DH8821", to: "Chattogram", status: "IN_TRANSIT", amount: 220 },
                  { id: "CFY20260930SY5510", to: "Sylhet", status: "DELIVERED", amount: 380 },
                  { id: "CFY20260929RA1088", to: "Rajshahi", status: "PICKED_UP", amount: 180 },
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                    <td className="px-4 py-3">{row.to}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          row.status === "DELIVERED"
                            ? "secondary"
                            : row.status === "IN_TRANSIT"
                              ? "default"
                              : "outline"
                        }
                      >
                        {row.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatBDT(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
