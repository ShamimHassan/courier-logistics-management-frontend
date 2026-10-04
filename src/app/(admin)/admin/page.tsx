"use client";

import Link from "next/link";
import {
  Users2,
  PackageCheck,
  Banknote,
  Crown,
  Truck,
  History,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Timer,
  Users,
  Clock,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBDT, formatDateTime } from "@/lib/utils";

export default function AdminDashboardPage() {
  const kpiGroups = [
    {
      title: "Shipments",
      items: [
        { label: "Total", value: "2,487", delta: "+12%", up: true, icon: PackageCheck, accent: "bg-indigo-500/10 text-indigo-600" },
        { label: "In transit", value: "142", delta: "+8", up: true, icon: Truck, accent: "bg-blue-500/10 text-blue-600" },
        { label: "Delivered (30d)", value: "1,864", delta: "+22%", up: true, icon: CheckCircle2, accent: "bg-emerald-500/10 text-emerald-600" },
        { label: "Failed", value: "19", delta: "-4", up: true, icon: XCircle, accent: "bg-rose-500/10 text-rose-600" },
      ],
    },
    {
      title: "Revenue",
      items: [
        { label: "Today", value: formatBDT(48720), delta: "+18%", up: true, icon: Banknote, accent: "bg-amber-500/10 text-amber-600" },
        { label: "This week", value: formatBDT(327450), delta: "+11%", up: true, icon: Zap, accent: "bg-yellow-500/10 text-yellow-600" },
        { label: "This month", value: formatBDT(1_482_340), delta: "+7.4%", up: true, icon: TrendingUp, accent: "bg-lime-500/10 text-lime-600" },
        { label: "Refunds", value: formatBDT(8240), delta: "+2", up: false, icon: TrendingDown, accent: "bg-rose-500/10 text-rose-600" },
      ],
    },
    {
      title: "Couriers",
      items: [
        { label: "Active", value: "48", delta: "+3", up: true, icon: Users, accent: "bg-indigo-500/10 text-indigo-600" },
        { label: "Available", value: "27", delta: "now", up: true, icon: Timer, accent: "bg-emerald-500/10 text-emerald-600" },
        { label: "Busy", value: "19", delta: "now", up: true, icon: Truck, accent: "bg-blue-500/10 text-blue-600" },
        { label: "Suspended", value: "2", delta: "0", up: true, icon: ShieldCheck, accent: "bg-rose-500/10 text-rose-600" },
      ],
    },
    {
      title: "Delivery quality",
      items: [
        { label: "Success rate", value: "98.2%", delta: "+0.4pp", up: true, icon: CheckCircle2, accent: "bg-emerald-500/10 text-emerald-600" },
        { label: "Avg delivery", value: "1.4 days", delta: "-0.2d", up: true, icon: Clock, accent: "bg-indigo-500/10 text-indigo-600" },
        { label: "Pending assignment", value: 23, delta: "Action", up: false, icon: AlertTriangle, accent: "bg-amber-500/10 text-amber-600" },
        { label: "Awaiting refund", value: 7, delta: "Review", up: false, icon: History, accent: "bg-orange-500/10 text-orange-600" },
      ],
    },
  ];

  const shipmentsLast14 = [
    142, 158, 163, 171, 149, 180, 195, 210, 204, 221, 208, 235, 244, 260,
  ];
  const max14 = Math.max(1, ...shipmentsLast14);
  const revenueByMonth = [
    { m: "May", v: 780 },
    { m: "Jun", v: 940 },
    { m: "Jul", v: 1080 },
    { m: "Aug", v: 1260 },
    { m: "Sep", v: 1480 },
    { m: "Oct", v: 487 },
  ];
  const maxRev = Math.max(1, ...revenueByMonth.map((r) => r.v));

  const statusDist = [
    { label: "DELIVERED", share: 62, color: "bg-emerald-500" },
    { label: "IN_TRANSIT", share: 15, color: "bg-blue-500" },
    { label: "PROCESSING", share: 12, color: "bg-indigo-500" },
    { label: "FAILED", share: 4, color: "bg-rose-500" },
    { label: "CANCELLED", share: 7, color: "bg-slate-500" },
  ];

  const topCouriers = [
    { name: "Rahim Uddin", deliveries: 186, rating: 4.9, zone: "Dhaka (North)", status: "ACTIVE" },
    { name: "Karim Ahmed", deliveries: 164, rating: 4.8, zone: "Chattogram", status: "ACTIVE" },
    { name: "Fatima Khatun", deliveries: 158, rating: 4.9, zone: "Dhaka (South)", status: "ACTIVE" },
    { name: "Sabbir Hossain", deliveries: 142, rating: 4.7, zone: "Sylhet", status: "ACTIVE" },
    { name: "Nasirul Islam", deliveries: 138, rating: 4.6, zone: "Rajshahi", status: "ACTIVE" },
  ];

  const pendingAssignments = [
    {
      id: "CFY20261004DH1120",
      from: "Dhaka — Dhanmondi 27",
      to: "Uttara Sector 7",
      service: "EXPRESS",
      amount: 460,
      created: Date.now() - 1000 * 60 * 24,
    },
    {
      id: "CFY20261004CT0041",
      from: "Chattogram — EPZ 1",
      to: "Agrabad",
      service: "STANDARD",
      amount: 220,
      created: Date.now() - 1000 * 60 * 42,
    },
    {
      id: "CFY20261004SY0009",
      from: "Sylhet — Zindabazar",
      to: "Ambarkhana Point",
      service: "OVERNIGHT",
      amount: 380,
      created: Date.now() - 1000 * 60 * 11,
    },
  ];

  return (
    <>
      {kpiGroups.map((group) => (
        <section key={group.title} className="mb-6 last:mb-0">
          <div className="flex items-end justify-between mb-3 px-0.5">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground/90">
                {group.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Admin-level aggregate KPIs · updated live
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {group.items.map((it) => {
              const Icon = it.icon;
              return (
                <Card key={it.label}>
                  <CardHeader className="pb-2 flex-row items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {it.label}
                      </CardTitle>
                    </div>
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${it.accent}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-0.5">
                    <p className="text-2xl font-bold tracking-tight">{it.value}</p>
                    <p
                      className={`text-xs font-medium inline-flex items-center gap-1 ${it.up ? "text-emerald-600" : "text-amber-600"}`}
                    >
                      {it.up ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {it.delta}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <div className="grid gap-4 lg:grid-cols-3 mt-2">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                Shipments over Time
              </CardTitle>
              <CardDescription>Last 14 days · total shipments created</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
                Shipments / day
              </span>
              <Badge variant="outline">14-day window</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-48 px-1">
              {shipmentsLast14.map((v, i) => {
                const h = (v / max14) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-500/70 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition"
                    style={{ height: `${Math.max(4, h)}%` }}
                    title={`Day ${i + 1}: ${v}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 px-1 text-[10px] text-muted-foreground">
              <span>14d ago</span>
              <span>7d ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4.5 w-4.5 text-amber-600" />
              Revenue by Month
            </CardTitle>
            <CardDescription>Last 6 months · ৳ thousands</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {revenueByMonth.map((r) => {
              const w = (r.v / maxRev) * 100;
              return (
                <div key={r.m}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{r.m}</span>
                    <span className="text-muted-foreground">{formatBDT(r.v * 1000)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PackageCheck className="h-4.5 w-4.5 text-emerald-600" />
              Status distribution
            </CardTitle>
            <CardDescription>All active shipments in system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {statusDist.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${s.color}`} />
                    {s.label.replace("_", " ")}
                  </span>
                  <span className="text-muted-foreground">{s.share}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.share}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Crown className="h-4.5 w-4.5 text-amber-500" />
                Top couriers · this month
              </CardTitle>
              <CardDescription>Deliveries &amp; ratings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {topCouriers.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center gap-3 rounded-lg border p-2.5 hover:bg-muted/30 transition"
              >
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.zone}</p>
                </div>
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-xs font-bold">
                    {c.deliveries} <span className="text-muted-foreground font-normal">trips</span>
                  </p>
                  <p className="text-[11px] text-amber-600 flex items-center justify-end gap-0.5">
                    <StarInline />
                    {c.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                Pending assignment queue
              </CardTitle>
              <CardDescription>Unassigned · waiting for courier dispatch</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/shipments?filter=unassigned">
                Assign
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {pendingAssignments.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-amber-500/30 bg-amber-500/[0.04] p-3"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px]">{p.id}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {p.service}
                    </Badge>
                    <span className="text-xs font-semibold">{formatBDT(p.amount)}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {p.from} → {p.to}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Created {formatDateTime(new Date(p.created))}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 mt-4 lg:grid-cols-4">
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/admin/shipments">
            <PackageCheck className="h-4 w-4" />
            Manage shipments
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/admin/users">
            <Users2 className="h-4 w-4" />
            Manage users
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/admin/hubs">
            <ShieldCheck className="h-4 w-4" />
            Hubs &amp; zones
          </Link>
        </Button>
        <Button asChild variant="outline" className="justify-start gap-2">
          <Link href="/admin/audit-logs">
            <History className="h-4 w-4" />
            Audit logs
          </Link>
        </Button>
      </div>
    </>
  );
}

function StarInline() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden>
      <path d="M12 2l2.95 6.94L22 9.63l-5.27 4.81L18.18 22 12 18.27 5.82 22l1.45-7.56L2 9.63l7.05-.69z" />
    </svg>
  );
}
