import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import RQProviders from "./_providers/RQProviders";
import OfflineOverlay from "@/components/ui/OfflineOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#060d1f",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://loglife-rho.vercel.app"),
  title: "LogLife",
  description: "버킷리스트를 지구본 위에 기록하세요",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "LogLife",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060d1f]">
        <RQProviders>{children}</RQProviders>
        <OfflineOverlay />
      </body>
    </html>
  );
}
