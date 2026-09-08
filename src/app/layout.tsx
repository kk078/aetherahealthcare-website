import DeliveryNotice from '@/components/ui/DeliveryNotice';
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aetherahealthcare.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Aethera Healthcare Solutions - Revenue Cycle Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aethera Healthcare Solutions | Medical Billing & Revenue Cycle Management",
    description: "Maximizing Revenue. Minimizing Burden. Aethera Healthcare Solutions is your full-service medical billing partner.",
    images: ["/og-image.png"],
  },
};

import GlobalOverlays from '@/components/ui/GlobalOverlays';
import TopContactBar from '@/components/ui/TopContactBar';
import AnalyticsGate from '@/components/ui/AnalyticsGate';
import CookieConsent from '@/components/ui/CookieConsent';
import BackToTop from '@/components/ui/BackToTop';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('aethera-theme');
                if (theme === 'clinical-dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-dark">
        <TopContactBar />
        {children}
        <GlobalOverlays />
        <DeliveryNotice />
        <CookieConsent />
        <AnalyticsGate />
        <BackToTop />
      </body>
    </html>
  );
}