import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MarketLens - Market Analysis & Trading Insights",
  description: "Track market trends and get AI-powered trading insights. Real-time portfolio management and market analysis across multiple asset classes.",
  keywords: ["market", "trading", "signals", "portfolio", "stocks", "crypto", "AI", "analysis"],
  authors: [{ name: "MarketLens Team" }],
  openGraph: {
    title: "MarketLens",
    description: "AI-powered market analysis and trading insights",
    url: "https://marketlens.app",
    siteName: "MarketLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketLens",
    description: "AI-powered market analysis and trading insights",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
