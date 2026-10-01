"use client";

import Link from "next/link";
import {
  Globe2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Truck,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const COMPANY_LINKS: { label: string; href: string }[] = [
  { label: "About us", href: "/about" },
  { label: "Our services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Careers", href: "/careers" },
  { label: "Press & media", href: "/press" },
  { label: "Blog", href: "/blog" },
];

const SUPPORT_LINKS: { label: string; href: string }[] = [
  { label: "Help center", href: "/help" },
  { label: "Track shipment", href: "/track" },
  { label: "Contact sales", href: "/contact" },
  { label: "Report issue", href: "/contact?topic=complaint" },
  { label: "Privacy policy", href: "/legal/privacy" },
  { label: "Terms of service", href: "/legal/terms" },
];

const SERVICE_LINKS: { label: string; href: string }[] = [
  { label: "Standard delivery", href: "/services#standard" },
  { label: "Express delivery", href: "/services#express" },
  { label: "Overnight delivery", href: "/services#overnight" },
  { label: "Cash on delivery", href: "/services#cod" },
  { label: "Insurance & fragile", href: "/services#insurance" },
  { label: "Business / API", href: "/services#business" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <Truck className="h-4.5 w-4.5" />
              </span>
              <span className="font-extrabold text-lg tracking-tight">
                Courier<span className="text-primary">Flow</span>
              </span>
              <Badge
                variant="secondary"
                className="ml-1 text-[10px] px-1.5 py-0 tracking-wide"
              >
                BD
              </Badge>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Bangladesh&apos;s fastest-growing courier &amp; logistics network.
              From Dhaka to all 64 districts with real-time tracking,
              SSLCommerz secure payments, and a 4.9/5 customer rating.
            </p>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  House 42, Road 11, Banani, Dhaka 1213, Bangladesh
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a
                  href="tel:+8809612345678"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  +880 9612 345 678
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a
                  href="mailto:support@courierflow.com.bd"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  support@courierflow.com.bd
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {[Globe2, MessageCircle, Share2, Video].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={`social-${i}`}
                  className="h-9 w-9 rounded-lg border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/60 transition"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-sm mb-4 tracking-tight">
              Company
            </h3>
            <ul className="flex flex-col gap-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-sm mb-4 tracking-tight">
              Support
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services links */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-sm mb-4 tracking-tight">
              Services
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h3 className="font-semibold text-sm mb-4 tracking-tight">
              Newsletter
            </h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Get weekly tips, promo codes, and Bangladesh-wide service alerts.
            </p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="your@email.com"
                className="h-10"
                aria-label="Email for newsletter"
              />
              <Button type="submit" size="sm" className="h-10">
                Subscribe
              </Button>
            </form>
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {year} CourierFlow Bangladesh Ltd. All rights reserved.
            CourierFlow® is a registered trademark.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <Link
              href="/legal/privacy"
              className="hover:text-foreground transition"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="hover:text-foreground transition"
            >
              Terms
            </Link>
            <Link
              href="/legal/cookies"
              className="hover:text-foreground transition"
            >
              Cookies
            </Link>
            <Link
              href="/sitemap.xml"
              className="hover:text-foreground transition"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
