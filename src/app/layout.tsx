import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delayDuration={150}>
          {children}
          <Toaster richColors position="bottom-right" closeButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
