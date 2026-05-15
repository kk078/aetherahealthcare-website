import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aetherahealthcare-website.pages.dev";

export const metadata: Metadata = {
  title: {
    default: "Aethera Healthcare Solutions | Medical Billing & Revenue Cycle Management",
    template: "%s | Aethera Healthcare Solutions",
  },
  description: "Maximizing Revenue. Minimizing Burden. Aethera Healthcare Solutions is your full-service medical billing partner handling coding, claims, payments, denials, and collections so you can focus on patients.",
  keywords: ["medical billing", "revenue cycle management", "healthcare billing", "medical coding", "claims processing"],
  authors: [{ name: "Aethera Healthcare Solutions" }],
  creator: "Aethera Healthcare Solutions",
  publisher: "Aethera Healthcare Solutions",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Aethera Healthcare Solutions | Medical Billing & Revenue Cycle Management",
    description: "Maximizing Revenue. Minimizing Burden. Aethera Healthcare Solutions is your full-service medical billing partner.",
    siteName: "Aethera Healthcare Solutions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aethera Healthcare Solutions | Medical Billing & Revenue Cycle Management",
    description: "Maximizing Revenue. Minimizing Burden. Aethera Healthcare Solutions is your full-service medical billing partner.",
  },
};

import CookieConsent from '@/components/ui/CookieConsent';
import BackToTop from '@/components/ui/BackToTop';
import CallbackButton from '@/components/ui/CallbackButton';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-dark">
        {children}
        <CookieConsent />
        <BackToTop />
        <CallbackButton />
      </body>
    </html>
  );
}