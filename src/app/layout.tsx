import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HookLab AI - Generate Winning Ad Hooks",
  description:
    "HookLab AI membantu Anda membuat hook iklan yang memikat untuk Meta Ads, TikTok, Instagram, dan YouTube Shorts dalam hitungan detik.",
  keywords: [
    "hook generator",
    "ai marketing",
    "meta ads",
    "copywriting",
    "social media marketing",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
