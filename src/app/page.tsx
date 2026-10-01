import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  BellRing,
  Boxes,
  CircleDot,
  Clock,
  CreditCard,
  Gauge,
  HandCoins,
  Headphones,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  MessageCircleHeart,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  StarHalf,
  Truck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatBDT } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_-10%,theme(colors.primary/0.18),transparent)]"
        />
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-28 lg:py-32 relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="gap-2 px-3 py-1 rounded-full text-xs font-medium"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Bangladesh&apos;s fastest-growing courier network
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                Ship smarter, deliver faster with{" "}
                <span className="text-primary">CourierFlow</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Real-time tracking, secure SSLCommerz payments, and 3-role
                dashboards — from booking to proof of delivery.
                STANDARD / EXPRESS / OVERNIGHT for 64 districts.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="gap-2 h-12">
                  <Link href="/pricing">
                    Get a free quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="gap-2 h-12"
                >
                  <Link href="/services">
                    <Truck className="h-4 w-4" />
                    View services
                  </Link>
                </Button>
              </div>

              {/* Track quick-input */}
              <div className="w-full max-w-xl">
                <form
                  action="/pricing"
                  className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2 rounded-xl border bg-card shadow-sm p-2"
                >
                  <div className="flex items-center gap-2 pl-3 text-muted-foreground flex-1">
                    <CircleDot className="h-4 w-4 shrink-0" />
                    <Input
                      type="search"
                      name="track"
                      placeholder="Track your shipment (e.g. CFY-12345678)"
                      className="h-10 border-0 shadow-none focus-visible:ring-0 px-1 text-base"
                    />
                  </div>
                  <Button type="submit" className="sm:w-auto w-full gap-2">
                    Track
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 pl-1">
                  Tip: need a price first? Use our{" "}
                  <Link
                    href="/pricing"
                    className="font-medium text-primary hover:underline"
                  >
                    live quote calculator
                  </Link>
                  .
                </p>
              </div>

              {/* Social proof */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["A", "R", "K", "S"].map((init, i) => (
                      <div
                        key={i}
                        className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 ring-2 ring-background text-primary-foreground flex items-center justify-center text-xs font-bold"
                      >
                        {init}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarHalf
                          key={i}
                          className="h-4 w-4 fill-amber-500"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">4.9/5</strong> ·
                      Trusted by 10,000+ senders
                    </p>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-10" />

                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  SSLCommerz secured · bKash / Nagad / Rocket
                </div>
              </div>
            </div>

            {/* Hero visual card stack */}
            <div className="relative mx-auto w-full max-w-xl">
              <Card className="shadow-2xl border-primary/10 rotate-[1deg]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <PackageCheck className="h-5 w-5 text-primary" />
                      Shipment on the way
                    </CardTitle>
                    <CardDescription>CFY-20261001-8742319</CardDescription>
                  </div>
                  <Badge className="bg-status-in-transit/15 text-status-in-transit hover:bg-status-in-transit/20 border-status-in-transit/30">
                    IN TRANSIT
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">From — Dhaka (1206)</p>
                        <p className="text-muted-foreground">House 42, Road 11</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">To — Chattogram (4000)</p>
                        <p className="text-muted-foreground">
                          67, Probortok Soroni, Pahartoli
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <ol className="relative border-s border-border ms-2">
                    {[
                      { t: "Package booked", s: "Today 09:12", done: true },
                      { t: "Arrived at Origin Hub — Dhaka", s: "Today 11:40", done: true },
                      { t: "Departed for Chattogram", s: "Today 14:05", done: true, active: true },
                      { t: "Out for delivery", s: "Tomorrow", done: false },
                      { t: "Delivered", s: "Tomorrow EOD", done: false },
                    ].map((step, i) => (
                      <li key={i} className="mb-3 ms-6 last:mb-0">
                        <span
                          className={`absolute -start-2.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-background ${
                            step.active
                              ? "bg-primary text-primary-foreground"
                              : step.done
                                ? "bg-emerald-500 text-white"
                                : "bg-muted"
                          }`}
                        >
                          {step.done ? (
                            <BadgeCheck className="h-3 w-3" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                          )}
                        </span>
                        <div className="flex items-baseline justify-between gap-4">
                          <p
                            className={`text-sm font-medium ${
                              step.active ? "text-primary" : ""
                            }`}
                          >
                            {step.t}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {step.s}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
                <CardFooter className="border-t pt-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      EXPRESS · 2 kg · Insured
                    </p>
                    <p className="text-sm font-semibold">
                      Total {formatBDT(890)}
                    </p>
                  </div>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Landmark className="h-3 w-3" />
                    Paid via SSLCommerz
                  </Badge>
                </CardFooter>
              </Card>

              <Card className="absolute -bottom-6 -left-6 w-64 shadow-lg border-amber-500/20 rotate-[-3deg] bg-card/95 backdrop-blur">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Next pickup</p>
                    <p className="text-sm font-semibold">
                      Today · 3:30 PM – 5:30 PM
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute -top-6 -right-4 w-60 shadow-lg border-emerald-500/20 rotate-[4deg] bg-card/95 backdrop-blur">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Today earned</p>
                    <p className="text-sm font-bold">{formatBDT(12_450)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}
      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-col items-center gap-3 text-center mb-12">
          <Badge variant="outline" className="gap-1">
            <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
            How it works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Book → Pickup → Transit → Delivered
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Four simple steps from any device. No setup fees. Pay only when your
            shipment is booked.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              t: "1. Get instant quote",
              d: "Enter pickup, delivery and parcel weight — get a transparent price instantly, no hidden fees.",
              icon: HandCoins,
              c: "bg-primary/10 text-primary",
            },
            {
              t: "2. Book & pay securely",
              d: "Pay via bKash, Nagad, Rocket or cards — SSLCommerz ensures end-to-end BDT encryption.",
              icon: ShieldCheck,
              c: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            },
            {
              t: "3. We pick it up",
              d: "Our APPROVED courier arrives in your pre-selected 2-hour window — with photo proof at pickup.",
              icon: Truck,
              c: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
            },
            {
              t: "4. Live track & rate",
              d: "Track in real time, get SMS/App notifications, and rate your courier after delivery.",
              icon: BellRing,
              c: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
            },
          ].map((s) => (
            <Card key={s.t} className="h-full hover:-translate-y-0.5 transition">
              <CardHeader>
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center ${s.c}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg mt-3">{s.t}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.d}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto max-w-7xl px-4 py-20">
          <div className="flex flex-col items-center gap-3 text-center mb-12">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Why CourierFlow
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Built for Bangladesh businesses & homes
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                t: "Real-time tracking",
                d: "Scans at every hub — origin, transit, destination, out for delivery.",
                icon: Gauge,
              },
              {
                t: "64 district coverage",
                d: "Dhaka, Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh.",
                icon: MapPin,
              },
              {
                t: "SSLCommerz secure pay",
                d: "bKash, Nagad, Rocket, VISA, Mastercard, AMEX — all BDT settled.",
                icon: Banknote,
              },
              {
                t: "24/7 support",
                d: "Phone, email and chat support from real humans in Dhaka.",
                icon: Headphones,
              },
              {
                t: "Smart dashboards",
                d: "Customer, Courier and Admin dashboards with role-appropriate KPIs & charts.",
                icon: BarChart3,
              },
              {
                t: "COD & insurance",
                d: "Cash on Delivery options + parcel insurance up to 50,000 BDT.",
                icon: HandCoins,
              },
              {
                t: "Proof of delivery",
                d: "Photo + signature capture at every delivery attempt.",
                icon: BadgeCheck,
              },
              {
                t: "Refunds when needed",
                d: "Lost or damaged parcels? Admins refund in 2 clicks via SSLCommerz.",
                icon: LifeBuoy,
              },
            ].map((f) => (
              <Card key={f.t} className="h-full">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base mt-2">{f.t}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {f.d}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── SERVICES HIGHLIGHTS ───────────────── */}
      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="flex flex-col gap-3 max-w-2xl">
            <Badge variant="outline" className="gap-1 w-fit">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Three delivery speeds — one promise
            </h2>
            <p className="text-muted-foreground">
              Pick the service that matches your urgency. All include tracking,
              insurance and SMS notifications.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 w-fit">
            <Link href="/services">
              Compare all services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "STANDARD",
              price: "120",
              tagline: "3–5 days · Best value",
              accent:
                "border-muted bg-card text-foreground",
              pill: "bg-muted text-muted-foreground",
              btnVariant: "secondary" as const,
              features: [
                "64 districts",
                "Delivery 3–5 days",
                "Up to ৳10,000 default insurance",
                "SMS + app tracking",
                "Email invoice",
              ],
            },
            {
              name: "EXPRESS",
              price: "220",
              tagline: "1–2 days · Most popular",
              accent:
                "border-primary/30 ring-1 ring-primary/20 shadow-lg relative -translate-y-1",
              pill: "bg-primary text-primary-foreground",
              badgeText: "POPULAR",
              btnVariant: "default" as const,
              features: [
                "64 districts + priority handling",
                "Next-business-day delivery inside Dhaka",
                "Up to ৳25,000 default insurance",
                "Priority SMS every step",
                "Dedicated courier contact",
                "2-attempt delivery at destination",
              ],
            },
            {
              name: "OVERNIGHT",
              price: "380",
              tagline: "Same night · Urgent",
              accent:
                "border-violet-300/40 bg-violet-500/[0.04] dark:bg-violet-500/10",
              pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
              btnVariant: "outline" as const,
              features: [
                "Major cities only (Dhaka / Ctg / Sylhet / Raj)",
                "Next-morning by 10 AM",
                "Up to ৳50,000 insurance",
                "Dedicated courier, photo at pickup",
                "Signature required on receipt",
                "Admin P1 support channel",
              ],
            },
          ].map((plan) => (
            <Card key={plan.name} className={`h-full ${plan.accent}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold uppercase tracking-wider">
                      {plan.name}
                    </div>
                    <Badge className={plan.pill}>
                      {plan.badgeText ?? plan.tagline.split("·")[0].trim()}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 pt-3">
                  <span className="text-4xl font-extrabold">{formatBDT(parseInt(plan.price))}</span>
                  <span className="text-muted-foreground text-sm">up to 1kg</span>
                </div>
                <CardDescription>{plan.tagline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="text-sm space-y-2">
                  {plan.features.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild variant={plan.btnVariant} className="w-full gap-2">
                  <Link href="/pricing">
                    Get {plan.name} quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* ───────────────── TRUST + TESTIMONIALS ───────────────── */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto max-w-7xl px-4 py-20 grid lg:grid-cols-[1.1fr_1fr] gap-12">
          <div className="space-y-6">
            <Badge variant="outline" className="gap-1">
              <MessageCircleHeart className="h-3.5 w-3.5 text-primary" />
              Loved by customers & couriers
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Thousands trust CourierFlow every month
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { k: "1M+", v: "Parcels delivered" },
                { k: "500+", v: "APPROVED couriers" },
                { k: "64", v: "Districts covered" },
                { k: "4.9★", v: "Average rating" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl bg-card border p-4 text-center">
                  <div className="text-2xl md:text-3xl font-extrabold text-primary">
                    {s.k}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarHalf
                        key={i}
                        className="h-4 w-4 fill-amber-500"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">
                    “My e-commerce shop ships 300+ parcels a month. EXPRESS
                    deliveries are reliable, payments settle via SSLCommerz,
                    and the admin dashboard saves me 3 hours a week.”
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-9 w-9 rounded-full bg-pink-500/20 text-pink-700 dark:text-pink-300 flex items-center justify-center font-bold text-sm">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Sultana Begum
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sultana&apos;s Shop · 2 years
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarHalf
                        key={i}
                        className="h-4 w-4 fill-amber-500"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed">
                    “As a courier I can see my earnings and ratings in real
                    time. Assignments are transparent, and weekly payouts
                    through bKash are always on time. Best courier app I&apos;ve
                    driven for.”
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="h-9 w-9 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-sm">
                      R
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Rafiq Hossain</p>
                      <p className="text-xs text-muted-foreground">
                        APPROVED Courier · 8 months
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right column: quick value props list */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Talk to a human, 24/7
                </CardTitle>
                <CardDescription>
                  Real support from our Dhaka HQ — not an overseas bot.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Support hotline</span>
                  <span className="font-medium">+880 9610 000 000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">
                    support@courierflow.com
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg. reply</span>
                  <span className="font-medium">&lt; 3 minutes</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link href="/contact">
                    Contact us
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/15">
                  For business senders
                </Badge>
                <CardTitle>
                  Corporate dashboard · bulk upload · API
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  Send 500+ parcels/month? Get an ADMIN-lite corporate
                  dashboard, CSV/XLSX bulk import, webhooks and direct API
                  access — custom pricing based on volume.
                </p>
                <ul className="space-y-2 text-foreground/90">
                  <li className="flex items-start gap-2">
                    <Boxes className="h-4 w-4 text-primary mt-0.5" />
                    Bulk CSV import
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="h-4 w-4 text-primary mt-0.5" />
                    Finance reconciliation reports
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-primary mt-0.5" />
                    REST / Webhooks / Push notifications
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full gap-2">
                  <Link href="/contact">
                    Request corporate pricing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ ACCORDION ───────────────── */}
      <section className="container mx-auto max-w-5xl px-4 py-20">
        <div className="flex flex-col items-center gap-3 text-center mb-10">
          <Badge variant="outline" className="gap-1">
            <MessageCircleHeart className="h-3.5 w-3.5 text-primary" />
            Frequently asked
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Answers to common questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: "How fast can I get a price quote?",
              a: "Instantly — visit our Pricing page, enter pickup, delivery, weight and service, and get a fully-itemised quote (base fee, fuel, insurance, SSLCommerz fee) in under 5 seconds. No sign-up required to see prices.",
            },
            {
              q: "Which payment methods do you support?",
              a: "All bookings are paid in BDT via SSLCommerz: bKash, Nagad, Rocket (both merchant & personal), VISA, Mastercard, AMEX, DBBL Nexus, T-cash, and bank transfer. Cash on Delivery is available on EXPRESS plans for corporate senders.",
            },
            {
              q: "Can I insure valuable items?",
              a: "Yes — every shipment includes default insurance (STANDARD 10K / EXPRESS 25K / OVERNIGHT 50K BDT). You can add extra coverage at booking for high-value parcels (jewellery, electronics, documents).",
            },
            {
              q: "How do I know who my courier is?",
              a: "Once a courier ACCEPTS your assignment, you receive an SMS + in-app notification with the courier name, rating, phone number, motorcycle number and live ETA updated via GPS scans.",
            },
            {
              q: "What happens if my parcel is lost or damaged?",
              a: "Every shipment is scanned and photographed at pickup and delivery. If the courier marks it DAMAGED or the parcel is lost, open a support ticket from your dashboard — the Admin team reviews audit logs and refunds within 48 hours via SSLCommerz (original payment method).",
            },
            {
              q: "I&apos;m a courier — how do I sign up?",
              a: "Register with a name, BD phone, valid driving licence and motorcycle details. Admin approves you (APPROVED status), then you can accept assignments and withdraw earnings weekly via bKash/Nagad.",
            },
            {
              q: "Which cities do you cover?",
              a: "All 64 districts. OVERNIGHT next-morning service is available on Dhaka, Chattogram, Sylhet and Rajshahi metro corridors. STANDARD & EXPRESS reach all 64 districts within 5 days.",
            },
            {
              q: "Do you provide an API?",
              a: "Yes — the backend is fully documented (see our API_ENDPOINTS.md). Corporate partners can use our REST endpoints and webhooks to create shipments, poll tracking and reconcile payments programmatically.",
            },
          ].map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-[0.95rem]">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-14 text-center space-y-4 rounded-2xl border bg-primary/[0.04] p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready to ship? Get a quote in 5 seconds.
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No account needed to compare prices. Create one when you&apos;re
            ready to pay.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link href="/pricing">
                Get a free quote
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/contact">
                <Phone className="h-4 w-4" />
                Talk to sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
