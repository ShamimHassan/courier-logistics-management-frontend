import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  Building2,
  CircleHelp,
  HandCoins,
  HeartHandshake,
  Landmark,
  MapPin,
  PackageCheck,
  Phone,
  ShieldCheck,
  StarHalf,
  Target,
  Truck,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata = {
  title: "About Us",
  description:
    "Meet CourierFlow — Bangladesh-first courier & logistics platform. Our mission, story, numbers, and how we help 10,000+ senders ship reliably every month.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.07] to-background border-b">
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-24 relative">
          <div className="max-w-3xl space-y-6">
            <Badge variant="outline" className="gap-1">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              About CourierFlow
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Bangladesh&apos;s modern logistics engine
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              CourierFlow is a Bangladesh-born courier & logistics platform
              designed for the way Bangladeshis actually shop, sell and send —
              from a small home baker sending cookies in Dhaka, to a
              Chattogram-based B2B exporter shipping 500 parcels a week.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href="/pricing">
                  Get a quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/contact">
                  <Phone className="h-4 w-4" />
                  Contact us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission / Story ── */}
      <section className="container mx-auto max-w-7xl px-4 py-20 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-start">
        <div className="space-y-6">
          <Badge variant="outline" className="gap-1">
            <Target className="h-3.5 w-3.5 text-primary" />
            Our mission
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Make shipping 10× simpler for everyone
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Traditional couriers in Bangladesh treat tracking like a state
              secret, hide fees in receipts, and make refunds feel like an
              in-person office visit. We built CourierFlow to flip that:
              real-time transparency at every step, clear pricing, and
              payments that any Bangladeshi can actually use — bKash, Nagad,
              Rocket, cards, all settled in BDT through SSLCommerz.
            </p>
            <p>
              The name says it all: your shipment should literally flow. Our
              3-role platform — Customer, Courier, Admin — treats every person
              in the chain as a first-class citizen. Couriers get clear
              earnings, timely payouts, and fair ratings. Admins get a
              transparent audit log and 2-click refunds. Customers get peace
              of mind.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-3">
            {[
              {
                t: "Transparent pricing",
                d: "No hidden fuel fees or COD tricks — itemised quotes before you pay.",
                icon: HandCoins,
              },
              {
                t: "SSLCommerz security",
                d: "All BDT transactions are protected by SSLCommerz bank-grade risk engine.",
                icon: ShieldCheck,
              },
              {
                t: "Humans, not bots",
                d: "Our Dhaka support team answers your call in under 3 minutes on average.",
                icon: UsersRound,
              },
              {
                t: "64 district coverage",
                d: "We deliver inside every divisional city and every upazilla.",
                icon: MapPin,
              },
            ].map((v) => (
              <div key={v.t} className="rounded-xl border p-4 bg-card">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <v.icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold mt-3 text-sm">{v.t}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {v.d}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: timeline */}
        <div className="space-y-3">
          <Badge variant="outline" className="gap-1">
            <Landmark className="h-3.5 w-3.5 text-primary" />
            Our story
          </Badge>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            From a small Dhaka hub to 64 districts
          </h3>
          <ol className="relative border-s border-border mt-8 ms-3">
            {[
              {
                y: "2024 · Idea",
                t: "Two frustrated senders + one courier",
                d: "We started because we couldn't get a reliable, trackable delivery for our own side businesses. We sat down with a veteran APPROVED courier from Mohammadpur and mapped every pain point we could find.",
              },
              {
                y: "Q1 2025 · MVP",
                t: "First 100 test parcels in Dhaka",
                d: "We started manual deliveries in Dhaka with 4 couriers. Every parcel was tracked in a shared spreadsheet. A spreadsheet! We were hooked — and knew we needed real software.",
              },
              {
                y: "Q3 2025 · V2 Launch",
                t: "Customer + Courier + Admin apps",
                d: "Rebuilt with real-time tracking scans, SSLCommerz payments, and role-based dashboards. 1,200 parcels delivered that month, 4.92★ average rating.",
              },
              {
                y: "Q2 2026 · Today",
                t: "500+ couriers, 64 districts, 1M+ parcels",
                d: "CourierFlow now runs on the latest Next.js + Express + Prisma stack. Corporate customers use our API & bulk CSV import to ship thousands of parcels every week. This is just the beginning.",
              },
            ].map((step, i) => (
              <li key={step.y} className="mb-8 ms-6 last:mb-0">
                <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background text-xs font-bold">
                  {i + 1}
                </span>
                <time className="text-xs font-semibold tracking-wider uppercase text-primary">
                  {step.y}
                </time>
                <h4 className="text-lg font-semibold mt-1">{step.t}</h4>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {step.d}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto max-w-7xl px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { k: "1M+", v: "Parcels delivered", icon: PackageCheck },
            { k: "500+", v: "APPROVED Couriers", icon: Truck },
            { k: "64", v: "Districts covered", icon: MapPin },
            { k: "4.9★", v: "Average rating", icon: StarHalf },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border bg-card p-6 text-center"
            >
              <div className="mx-auto h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-foreground mt-4">
                {s.k}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works (from landing, slightly condensed) ── */}
      <section className="container mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-col items-center gap-3 text-center mb-12">
          <Badge variant="outline" className="gap-1">
            <CircleHelp className="h-3.5 w-3.5 text-primary" />
            How it works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Shipping in 4 simple steps
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              n: "01",
              t: "Book & quote",
              d: "Enter pickup & delivery details. We show you the exact price before you check out.",
              icon: HandCoins,
            },
            {
              n: "02",
              t: "Secure checkout",
              d: "Pay via SSLCommerz using your favourite BDT method — bKash, Nagad, cards, Rocket.",
              icon: ShieldCheck,
            },
            {
              n: "03",
              t: "Courier picks up",
              d: "We assign an APPROVED courier who contacts you within your 2-hour pickup window.",
              icon: Truck,
            },
            {
              n: "04",
              t: "Track & rate",
              d: "Track in real time through every hub scan, then rate your delivery experience.",
              icon: BadgeCheck,
            },
          ].map((s) => (
            <Card key={s.n} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-black text-muted-foreground/40">
                    {s.n}
                  </span>
                </div>
                <CardTitle className="text-lg mt-4">{s.t}</CardTitle>
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

      {/* ── Values / Team promise ── */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto max-w-7xl px-4 py-20 grid md:grid-cols-3 gap-6">
          {[
            {
              t: "Built for Bangladesh",
              d: "BD phone regex. BD addresses. BDT pricing. SSLCommerz. bKash payouts to couriers. Everything is tailored — not ported from overseas.",
              icon: MapPin,
              accent: "bg-primary/10 text-primary",
            },
            {
              t: "Everyone gets a voice",
              d: "Customers can rate couriers with stars & comments. Couriers can reject bad assignments with reasons. Admins see the full story in audit logs.",
              icon: UsersRound,
              accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            },
            {
              t: "Responsible delivery",
              d: "We train couriers in fragile packaging and safe riding. Every pickup has a mandatory package condition check.",
              icon: Boxes,
              accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
            },
          ].map((v) => (
            <Card key={v.t}>
              <CardHeader>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${v.accent}`}>
                  <v.icon className="h-6 w-6" />
                </div>
                <CardTitle className="pt-2">{v.t}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.d}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── FAQ (short version) ── */}
      <section className="container mx-auto max-w-4xl px-4 py-20">
        <div className="flex flex-col items-center gap-3 text-center mb-10">
          <Badge variant="outline" className="gap-1">
            <CircleHelp className="h-3.5 w-3.5 text-primary" />
            Questions about us
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Frequently asked about CourierFlow
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: "Is CourierFlow a Bangladesh-based company?",
              a: "Yes. Our HQ is in Dhaka. All deliveries are inside Bangladesh, payments are in BDT through SSLCommerz, and our support team speaks Bengali and English.",
            },
            {
              q: "How are couriers vetted?",
              a: "Every courier provides a valid BD driving licence, motorcycle documents, NID, and a personal reference. They go through an onboarding ride + quiz. Only APPROVED couriers can accept assignments.",
            },
            {
              q: "What's your refund policy?",
              a: "If a parcel is lost or damaged above the baseline insurance limit, Admins review the audit log (scans + pickup condition + courier notes) and issue a refund via SSLCommerz — usually within 48 hours.",
            },
            {
              q: "Do you work with e-commerce shops?",
              a: "Absolutely. We power 200+ e-commerce shops across Bangladesh, from tiny home bakeries to 10k+/month electronics stores. Corporate plans include CSV bulk upload, finance reports and API access.",
            },
          ].map((it, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {it.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {it.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Separator className="my-12" />

        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center rounded-2xl border p-8 md:p-10 bg-card">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <HeartHandshake className="h-5 w-5" />
              <p className="font-semibold">Partner with us</p>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
              Have a business or want to drive for CourierFlow?
            </h3>
            <p className="text-muted-foreground max-w-2xl">
              We&apos;re always welcoming corporate senders and new APPROVED
              couriers. Reach out and a real person will reply within one
              business hour.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/contact">
                Contact us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link href="/services">
                <Boxes className="h-4 w-4" />
                See services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function generatePageMeta() {
  return CardDescription;
}
