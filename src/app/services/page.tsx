import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Boxes,
  CircleCheckBig,
  CloudSun,
  CreditCard,
  FileCheck2,
  HandCoins,
  HeartHandshake,
  Landmark,
  MapPin,
  MessageCircle,
  MoonStar,
  Package,
  Phone,
  ShieldCheck,
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
import { Separator } from "@/components/ui/separator";
import { formatBDT } from "@/lib/utils";

export const metadata = {
  title: "Our Services",
  description:
    "Explore CourierFlow's courier services: STANDARD, EXPRESS and OVERNIGHT delivery across 64 districts. COD, insurance, hub network, tracking and more — all in BDT via SSLCommerz.",
};

const services = [
  {
    name: "STANDARD",
    tag: "Best value",
    badge: "3–5 days",
    price: 120,
    accent:
      "border-muted bg-card text-foreground",
    pill: "bg-muted text-muted-foreground",
    icon: Truck,
    color: "bg-primary/10 text-primary",
    description:
      "Budget-friendly delivery for non-urgent shipments anywhere in Bangladesh.",
    features: [
      "All 64 districts covered",
      "3–5 business day delivery",
      "Default insurance up to ৳10,000",
      "Real-time tracking on every step",
      "SMS + email & in-app notifications",
      "Digital invoice on delivery",
    ],
    useCases: ["eCommerce clothing", "Documents & papers", "Non-perishable goods"],
  },
  {
    name: "EXPRESS",
    tag: "Most popular",
    badge: "1–2 days",
    price: 220,
    accent:
      "border-primary/30 ring-1 ring-primary/10 shadow-xl relative -translate-y-2",
    pill: "bg-primary text-primary-foreground",
    icon: Truck,
    color: "bg-primary text-primary-foreground",
    description:
      "Fast, tracked, and reliable — perfect for most online shops and urgent personal parcels.",
    features: [
      "64 districts + priority handling",
      "1–2 business day delivery",
      "Dhaka next-business-day metro service",
      "Default insurance up to ৳25,000",
      "Priority SMS + courier contact shared",
      "2-attempt delivery at destination",
      "COD available for corporate accounts",
    ],
    useCases: ["Online shops", "Pharmacy / gifts", "Documents next-day"],
  },
  {
    name: "OVERNIGHT",
    tag: "Urgent parcels",
    badge: "Next morning 10AM",
    price: 380,
    accent:
      "border-violet-300/40 bg-violet-500/[0.04] dark:bg-violet-500/10",
    pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    icon: MoonStar,
    color: "bg-violet-600 text-white",
    description:
      "Same-night dispatch with next-morning delivery by 10 AM — metro corridors only.",
    features: [
      "Dhaka / Chattogram / Sylhet / Rajshahi metro corridors",
      "Next-morning delivery by 10 AM",
      "Insurance up to ৳50,000",
      "Mandatory pickup photo + condition check",
      "Signature required on receipt",
      "Admin P1 priority support channel",
      "Dedicated courier assigned",
    ],
    useCases: ["Critical documents", "Medical tests / meds", "Birthday / anniversary gifts"],
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.07] to-background border-b">
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-24">
          <div className="max-w-3xl space-y-6">
            <Badge variant="outline" className="gap-1">
              <Boxes className="h-3.5 w-3.5 text-primary" />
              Our Services
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Delivery that fits your schedule & budget
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              STANDARD for everyday shipments. EXPRESS for e-commerce shops.
              OVERNIGHT for urgent documents and gifts. Every plan includes
              tracking scans, default insurance, and SSLCommerz-secure checkout
              in Bangladeshi Taka.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href="/pricing">
                  Get a live quote
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
        </div>
      </section>

      {/* ── Plans grid ── */}
      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-col items-center gap-3 text-center mb-10">
          <Badge variant="outline" className="gap-1">
            <Truck className="h-3.5 w-3.5 text-primary" />
            Choose your speed
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Three shipping plans for every urgency
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Prices start from 1kg for Dhaka metro. Add extra weight or
            inter-city distance on the Pricing page for an exact quote.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((plan) => (
            <Card key={plan.name} className={`h-full ${plan.accent}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${plan.color}`}>
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <Badge className={plan.pill}>{plan.badge}</Badge>
                </div>
                <div className="space-y-1 pt-4">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl font-extrabold tracking-tight">
                      {plan.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {plan.tag}
                    </Badge>
                  </div>
                  <CardDescription className="leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </div>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-extrabold">{formatBDT(plan.price)}</span>
                  <span className="text-sm text-muted-foreground">
                    from · up to 1kg
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <BadgeCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Separator />
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Popular use cases
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {plan.useCases.map((u) => (
                      <Badge key={u} variant="outline" className="text-xs font-normal">
                        {u}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2">
                <Button asChild variant="default" className="w-full sm:flex-1 gap-2">
                  <Link href="/pricing">
                    Get a {plan.name} quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                >
                  <Link href="/contact">
                    <MessageCircle className="h-4 w-4" />
                    Need help?
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Add-on services ── */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto max-w-7xl px-4 py-20">
          <div className="flex flex-col items-center gap-3 text-center mb-10">
            <Badge variant="outline" className="gap-1">
              <Sparkles_placeholder />
              Add-ons
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Extra services for peace of mind
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Combine these optional services with any plan at checkout.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                t: "Cash on Delivery (COD)",
                d: "Deliver and collect cash from the receiver. Available on EXPRESS for corporate senders with credit limit.",
                icon: HandCoins,
                price: "+ 2.0%",
              },
              {
                t: "Extra Insurance",
                d: "Increase default coverage for jewellery, electronics and important documents — up to ৳100,000.",
                icon: ShieldCheck,
                price: "+ 1.5% of value",
              },
              {
                t: "Fragile Handling",
                d: "Mandatory package condition check at pickup + scan at every hub + fragile stickers + training reminders.",
                icon: Package,
                price: "+ ৳80",
              },
              {
                t: "Signature Required",
                d: "Receiver must show ID and sign. Prevents porch theft and disputed deliveries.",
                icon: FileCheck2,
                price: "+ ৳40",
              },
              {
                t: "2-hour Pickup Window",
                d: "Choose a 2-hour window today — courier arrives in that slot. 1 AM–11 PM coverage in metro areas.",
                icon: CloudSun,
                price: "+ ৳60",
              },
              {
                t: "Return to Sender",
                d: "3 failed delivery attempts → package returned to sender with full tracking trail.",
                icon: Boxes,
                price: "+ 50% of base fee",
              },
              {
                t: "Corporate API / CSV",
                d: "Create 500+ shipments via CSV upload or direct REST API. Finance reports by email each Monday.",
                icon: Landmark,
                price: "Volume pricing",
              },
              {
                t: "Gift Wrapping + Note",
                d: "Send a birthday, Eid or pohela boishakh parcel in gift-wrap with a custom printed note card.",
                icon: HeartHandshake,
                price: "+ ৳120",
              },
            ].map((addon) => (
              <Card key={addon.t} className="h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <addon.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {addon.price}
                    </Badge>
                  </div>
                  <CardTitle className="text-base pt-3">{addon.t}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {addon.d}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Network / Hubs + Coverage ── */}
      <section className="container mx-auto max-w-7xl px-4 py-20 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
        <div className="space-y-6">
          <Badge variant="outline" className="gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Network & Hubs
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            8 divisional hubs · 64 districts · 500+ couriers
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            CourierFlow runs a spoke-and-hub model across 8 divisional hubs.
            Every parcel is scanned in, sorted, scanned out, and tracked between
            origin hub → destination hub → final address. Hub scans mean: (1)
            you can see exactly where your parcel is at any time, (2) we can
            detect missing shipments within 12 hours, (3) corporate customers
            get finance reports that match hub-to-hub transport.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {[
              { k: "Dhaka", note: "Central hub" },
              { k: "Chattogram", note: "Port city hub" },
              { k: "Sylhet", note: "North-east hub" },
              { k: "Rajshahi", note: "North-west hub" },
              { k: "Khulna", note: "South-west hub" },
              { k: "Barishal", note: "South hub" },
              { k: "Rangpur", note: "North hub" },
              { k: "Mymensingh", note: "North-central hub" },
            ].map((h) => (
              <div key={h.k} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{h.k}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{h.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit gap-1">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
                Payment methods
              </Badge>
              <CardTitle className="pt-2">
                Every BDT payment method Bangladeshis actually use
              </CardTitle>
              <CardDescription>
                Powered by SSLCommerz — the de-facto Bangladeshi payment
                gateway used by 100,000+ merchants.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              {[
                "bKash (Merchant & Personal)",
                "Nagad (Merchant & Cash-out)",
                "Rocket Dutch-Bangla",
                "VISA / Mastercard / AMEX",
                "DBBL Nexus",
                "T-cash / Upay",
                "City Bank touchpoints",
                "Bank Transfer (all major banks)",
              ].map((m) => (
                <div
                  key={m}
                  className="flex items-start gap-2 rounded-lg border p-3 bg-muted/40"
                >
                  <CircleCheckBig className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground border-t pt-4 gap-2">
              <Banknote className="h-4 w-4 text-primary" />
              Corporate accounts can enable CODs via EXPRESS service volume.
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* ── Tracking / Tech explained ── */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto max-w-7xl px-4 py-20 grid md:grid-cols-3 gap-6">
          {[
            {
              t: "Realtime tracking",
              d: "Scans at pickup, origin-hub-in, origin-hub-out, destination-hub-in, destination-hub-out, out-for-delivery, delivery-attempt, delivered-or-failed. You see every scan, every timestamp, every hub.",
              icon: Zap,
              color: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
            },
            {
              t: "State machine statuses",
              d: "Every shipment moves through 15+ well-defined statuses — from QUOTE_PROVIDED all the way through DELIVERED or RETURNED. No vague 'in processing' labels.",
              icon: BadgeCheck,
              color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
            },
            {
              t: "Proof of delivery",
              d: "Delivered? We capture photo + receiver signature + timestamp + GPS. Failed? The reason is logged (receiver unreachable / refused / wrong address) and we try 2 more times.",
              icon: FileCheck2,
              color: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
            },
          ].map((c) => (
            <Card key={c.t}>
              <CardHeader>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <CardTitle className="pt-3">{c.t}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.d}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="container mx-auto max-w-5xl px-4 py-20">
        <div className="rounded-2xl border bg-card p-8 md:p-14 grid md:grid-cols-[1fr_auto] items-center gap-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Not sure which service is right?
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl">
              Use our live quote calculator to see an exact itemised price
              (base fee, fuel, hub, SSLCommerz fee, insurance) in under 5
              seconds. Or chat with our Dhaka sales team — we&apos;ll pick the
              best plan for your use case and budget.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
            <Button asChild size="lg" className="gap-2 w-full md:w-auto">
              <Link href="/pricing">
                Get a live quote
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 w-full md:w-auto"
            >
              <Link href="/contact">
                <Phone className="h-4 w-4" />
                Contact sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Sparkles_placeholder() {
  return <Zap className="h-3.5 w-3.5 text-primary" />;
}
