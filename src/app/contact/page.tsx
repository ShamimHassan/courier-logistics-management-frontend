import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
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
import { Label } from "@/components/ui/label";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with CourierFlow — Dhaka support hotline, email, corporate sales, APPROVED courier onboarding, or open a general ticket through our SSLCommerz-secured contact form.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.07] to-background border-b">
        <div className="container mx-auto max-w-7xl px-4 py-16 md:py-20">
          <div className="max-w-3xl space-y-5">
            <Badge variant="outline" className="gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
              Contact us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              We&apos;d love to hear from you
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Real humans in our Dhaka HQ answer support calls, emails and
              tickets in under 3 minutes during business hours. Hotlines,
              email, in-app support — use whatever works for you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Main 2-col layout ── */}
      <section className="container mx-auto max-w-7xl px-4 py-16 grid lg:grid-cols-[1fr_1.25fr] gap-10">
        {/* ── Left column: info cards ── */}
        <div className="space-y-5">
          <InfoCard
            icon={Phone}
            title="Support hotline"
            description="24/7 — even public holidays."
            primaryLine="+880 9610 000 000"
            secondaryLine="+880 9610 000 001 (corporate)"
            accent="bg-sky-500/10 text-sky-600 dark:text-sky-400"
          />
          <InfoCard
            icon={Mail}
            title="Email us"
            description="We reply on average in 12 minutes."
            primaryLine="support@courierflow.com"
            secondaryLine="sales@courierflow.com (corporate)"
            accent="bg-violet-500/10 text-violet-600 dark:text-violet-400"
          />
          <InfoCard
            icon={MapPin}
            title="Headquarters"
            description="Come say hi — we have tea and biscuits."
            primaryLine="House 42, Road 11, Banani DOHS"
            secondaryLine="Dhaka 1206, Bangladesh"
            accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <InfoCard
            icon={Clock}
            title="Business hours"
            description="Courier operations run 24/7."
            primaryLine="Sat–Thu : 9:00 AM – 10:00 PM"
            secondaryLine="Fri : 10:00 AM – 6:00 PM (limited staff)"
            accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />

          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <Badge variant="outline" className="gap-1 border-primary/30">
                  Secure & SSLCommerz protected
                </Badge>
              </div>
              <CardTitle className="pt-2">
                For corporate & bulk senders
              </CardTitle>
              <CardDescription>
                If you send 500+ parcels/month, ask about corporate pricing,
                CSV bulk upload, API access and a dedicated account manager.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="default" className="w-full gap-2">
                <Link href="/pricing">
                  Get corporate pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <ContactForm />
      </section>

      {/* ── FAQ (short) ── */}
      <section className="bg-muted/40 border-y">
        <div className="container mx-auto max-w-5xl px-4 py-16 space-y-8">
          <div className="grid md:grid-cols-[1fr_1.6fr] gap-10 items-start">
            <div className="space-y-3">
              <Badge variant="outline" className="gap-1">
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
                Common questions
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">
                Before you reach out — answers to the most asked questions.
              </h2>
              <p className="text-muted-foreground">
                Still stuck? Use the form above — a real human answers in 3
                minutes or less (Sat–Thu, 9am–10pm).
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  q: "How do I get a quote?",
                  a: "Go to Pricing and enter pickup, delivery, weight — you'll see an itemised price in 5 seconds without logging in.",
                },
                {
                  q: "Can I pay cash on delivery?",
                  a: "COD is available on EXPRESS plans for corporate senders with an approved credit limit. Individual senders pay via SSLCommerz at booking.",
                },
                {
                  q: "How do I become a courier?",
                  a: "Register a courier account and upload NID, driving licence and motorcycle docs. Admin reviews and promotes you to APPROVED status.",
                },
                {
                  q: "My parcel is late — what now?",
                  a: "Open the Shipment page in your dashboard and tap 'Need help?'. That creates an auto-prioritised P1 ticket with the tracking ID attached.",
                },
              ].map((f) => (
                <Card key={f.q}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-start gap-2">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 shrink-0">
                        Q
                      </Badge>
                      {f.q}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.a}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryLine: string;
  secondaryLine: string;
  accent: string;
}

function InfoCard({
  icon: Icon,
  title,
  description,
  primaryLine,
  secondaryLine,
  accent,
}: InfoCardProps) {
  return (
    <Card>
      <CardContent className="p-5 flex gap-4">
        <div
          className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <Label className="text-sm font-semibold text-foreground">
            {title}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            {description}
          </p>
          <p className="text-sm font-semibold truncate">{primaryLine}</p>
          <p className="text-sm text-muted-foreground truncate">
            {secondaryLine}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
