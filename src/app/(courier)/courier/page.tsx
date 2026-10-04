"use client";

import Link from "next/link";
import {
  Banknote,
  CheckCircle2,
  Clock,
  PackageCheck,
  Star,
  Truck,
  ArrowRight,
  HandCoins,
  ClipboardList,
  User as UserIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatBDT, formatDate, formatDateTime } from "@/lib/utils";

export default function CourierDashboardPage() {
  const stats = [
    {
      label: "Today's deliveries",
      value: 8,
      delta: "+3 vs yesterday",
      variant: "emerald" as const,
      icon: CheckCircle2,
    },
    {
      label: "Weekly earnings",
      value: formatBDT(11840),
      delta: "14 deliveries",
      variant: "amber" as const,
      icon: HandCoins,
    },
    {
      label: "Average rating",
      value: "4.8",
      delta: "last 50 trips",
      variant: "indigo" as const,
      icon: Star,
    },
    {
      label: "Success rate",
      value: "96.2%",
      delta: "last 30 days",
      variant: "lime" as const,
      icon: PackageCheck,
    },
  ];

  const assignments = [
    {
      id: "ASG-20261004-0021",
      tracking: "CFY20261004DH7712",
      pickup: "Dhaka — Mirpur DOHS, Road 11, House 32",
      dropoff: "Uttara, Sector 10, Road 13, Apt 4B",
      earning: 320,
      status: "OFFERED",
      eta: "Today · 10:30 AM",
    },
    {
      id: "ASG-20261004-0018",
      tracking: "CFY20261004CT5509",
      pickup: "Dhaka — Banani, Kemal Ataturk Ave",
      dropoff: "Chattogram, Agrabad C/A",
      earning: 1180,
      status: "ACCEPTED",
      eta: "Tomorrow · 02:00 PM",
    },
    {
      id: "ASG-20261003-0144",
      tracking: "CFY20261003SY2201",
      pickup: "Gulshan 2, Police Plaza Concord",
      dropoff: "Sylhet, Dargah Gate, Ambarkhana",
      earning: 960,
      status: "IN_PROGRESS",
      eta: "Today · 05:45 PM",
    },
  ];

  const weeklyDeliveries = [
    { day: "Sat", count: 9 },
    { day: "Sun", count: 14 },
    { day: "Mon", count: 12 },
    { day: "Tue", count: 16 },
    { day: "Wed", count: 11 },
    { day: "Thu", count: 8 },
    { day: "Fri", count: 0 },
  ];
  const maxWeekly = Math.max(1, ...weeklyDeliveries.map((d) => d.count));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const accentMap = {
            emerald: "text-emerald-600 bg-emerald-500/10",
            amber: "text-amber-600 bg-amber-500/10",
            indigo: "text-indigo-600 bg-indigo-500/10",
            lime: "text-lime-600 bg-lime-500/10",
          } as const;
          const deltaAccent = {
            emerald: "text-emerald-600",
            amber: "text-amber-600",
            indigo: "text-indigo-600",
            lime: "text-lime-600",
          } as const;
          return (
            <Card key={s.label}>
              <CardHeader className="pb-2 flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </CardTitle>
                  <CardDescription className="text-[11px] uppercase tracking-wider">
                    {s.delta}
                  </CardDescription>
                </div>
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${accentMap[s.variant]}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${deltaAccent[s.variant]}`}>{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 mt-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-amber-600" />
                Your assignments
              </CardTitle>
              <CardDescription>
                Accept or reject new offers, then proceed to pickup and delivery.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/courier/assignments">
                View all assignments
                <ArrowRight className="h-3.5 w-3.5 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.map((a) => {
              const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> =
                {
                  OFFERED: "secondary",
                  ACCEPTED: "default",
                  IN_PROGRESS: "default",
                  COMPLETED: "outline",
                };
              return (
                <div
                  key={a.id}
                  className="rounded-xl border bg-card/60 p-4 hover:bg-muted/30 transition"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {a.id}
                        </Badge>
                        <Badge variant={statusVariant[a.status]} className="text-[10px]">
                          {a.status.replace("_", " ")}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {a.eta}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-2">
                        Tracking: {a.tracking}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Your earning
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        {formatBDT(a.earning)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/40 p-2.5 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Pickup
                      </p>
                      <p className="text-xs">{a.pickup}</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2.5 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Dropoff
                      </p>
                      <p className="text-xs">{a.dropoff}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    {a.status === "OFFERED" ? (
                      <>
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                        <Button size="sm">
                          <Truck className="h-3.5 w-3.5 mr-2" />
                          Accept
                        </Button>
                      </>
                    ) : (
                      <Button asChild size="sm">
                        <Link href={`/courier/assignments/${a.id}`}>
                          {a.status === "IN_PROGRESS" ? "Continue workflow" : "View details"}
                          <ArrowRight className="h-3.5 w-3.5 ml-2" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" />
                Availability
              </CardTitle>
              <CardDescription>
                Turn this on so dispatch can assign you new jobs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="courier-available" className="text-sm font-medium">
                    I&apos;m available for new assignments
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Auto-synced to CourierFlow dispatch engine.
                  </p>
                </div>
                <Switch id="courier-available" defaultChecked />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Last active: {formatDateTime(new Date(Date.now() - 1000 * 60 * 7))}</span>
                <span>Zone: Dhaka (North)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Deliveries this week
              </CardTitle>
              <CardDescription>Mon–Sun · successful dropoffs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {weeklyDeliveries.map((d) => {
                  const h = (d.count / maxWeekly) * 100;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="text-[10px] font-semibold text-muted-foreground">
                        {d.count}
                      </div>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-indigo-500 to-purple-500"
                        style={{ height: `${Math.max(6, h)}%` }}
                      />
                      <div className="text-[10px] text-muted-foreground">{d.day}</div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Total this week: <span className="font-semibold text-foreground">70</span>
                </span>
                <Link
                  href="/courier/earnings"
                  className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Banknote className="h-3.5 w-3.5" />
                  Earnings report
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/courier/assignments">
                  <ClipboardList className="h-4 w-4" />
                  All assignments
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/courier/earnings">
                  <Banknote className="h-4 w-4" />
                  Earnings &amp; payouts
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start gap-2">
                <Link href="/courier/profile">
                  <UserIcon className="h-4 w-4" />
                  Vehicle &amp; zones
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
