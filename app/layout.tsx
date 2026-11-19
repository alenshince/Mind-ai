/**
 * app/layout.tsx
 * 
 * Root Layout configuring Google Fonts (Anton + Inter) 
 * and dark editorial aesthetics for Mind AI.
 */

import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MIND AI — Intelligent Workspace (Google × Firebase #BuildHybridAI 2026)",
  description: "An ultra-crisp, intelligent developer workspace and research assistant built with Next.js, Cloud Firestore, and Google Gemini 2.5 Flash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} dark`}>
      <body className="bg-[#0A0A0C] text-[#E4E4E7] antialiased min-h-screen selection:bg-emerald-500/25 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
