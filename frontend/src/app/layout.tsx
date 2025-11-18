import type { Metadata } from "next";
import { Playfair_Display, Lato, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { AgeVerificationProvider } from "@/contexts/AgeVerificationContext";
import { LazyShoppingCart } from "@/components/lazy";
import CookieConsentBanner from "@/components/privacy/CookieConsentBanner";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/Toast";
import { ConnectionFeedback } from "@/components/feedback/ConnectionFeedback";
import { OfflineBanner } from "@/components/connection/OfflineIndicator";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "300", "400", "700", "900"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Luxury Wine Collection - Premium Wines with Crypto Payments",
  description: "Discover the world's finest wines with secure cryptocurrency payments. Premium wine collection featuring Bordeaux, Burgundy, Champagne, and exclusive vintages.",
  keywords: "luxury wine, cryptocurrency payments, premium wines, wine collection, crypto wine store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.coinbase.com" />

        <meta name="theme-color" content="#4B1E2F" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${playfairDisplay.variable} ${lato.variable} ${cormorantGaramond.variable} font-body antialiased`}
      >
        <ErrorBoundary>
          <PerformanceProvider>
            <ConnectionProvider>
              <ToastProvider>
                <AgeVerificationProvider>
                  <AuthProvider>
                    <CartProvider>
                      <OfflineBanner />
                      <ConnectionFeedback />
                      {children}
                      <LazyShoppingCart />
                      <CookieConsentBanner />
                    </CartProvider>
                  </AuthProvider>
                </AgeVerificationProvider>
              </ToastProvider>
            </ConnectionProvider>
          </PerformanceProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
