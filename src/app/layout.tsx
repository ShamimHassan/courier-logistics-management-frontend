import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthAdapterRegistrar from "@/components/auth/AuthAdapterRegistrar";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#151b2e" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "CourierFlow — Courier & Logistics Management Platform",
    template: "%s · CourierFlow",
  },
  description:
    "Bangladesh-first courier & logistics platform — real-time tracking, SSLCommerz secure payments, 3-role dashboards for Customers, Couriers & Admins, STANDARD / EXPRESS / OVERNIGHT services.",
  keywords: [
    "courier bangladesh",
    "logistics dhaka",
    "bKash delivery",
    "SSLCommerz shipment",
    "courier management",
    "Nagad payment",
    "courier dashboard",
    "shipment tracking",
  ],
  authors: [{ name: "Md Shamim Hassan" }],
  openGraph: {
    title: "CourierFlow — Courier & Logistics Management",
    description:
      "Book shipments, pay securely via SSLCommerz (bKash/Nagad), track live, and manage couriers — all in one Bangladesh-first platform.",
    type: "website",
    locale: "en_BD",
    siteName: "CourierFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "CourierFlow — Courier & Logistics Management",
    description:
      "Bangladesh-first courier platform — real-time tracking, SSLCommerz, 3 role dashboards.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <TooltipProvider delayDuration={150}>
            {/* Skip-to-content for keyboard / screen reader accessibility */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-semibold focus:shadow-lg"
            >
              Skip to main content
            </a>
            <AuthAdapterRegistrar />
            <Navbar />
            <main id="main-content" className="flex-1 flex flex-col">{children}</main>
            <Footer />
            <Toaster richColors position="bottom-right" closeButton />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
