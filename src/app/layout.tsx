import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";
import { PWAStatusBar } from "@/components/pwa/PWAStatusBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SYSTEM",
  description: "Personal Intelligence System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SYSTEM",
  },
  icons: {
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192" },
      { url: "/icon-512x512.png", sizes: "512x512" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#070d1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SYSTEM" />
        <meta name="application-name" content="SYSTEM" />
        <meta name="msapplication-TileColor" content="#070d1a" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <PWAStatusBar />
        <div className="pt-safe">
          {children}
        </div>
      </body>
    </html>
  );
}
