import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GradingProvider } from "./providers";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KorrekturPilot – Automatische Klausurkorrektur",
  description:
    "KorrekturPilot analysiert handschriftliche Klausuren anhand des Erwartungshorizonts in wenigen Minuten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GradingProvider>
          <AppHeader />
          <main className="main-content">{children}</main>
          <AppFooter />
        </GradingProvider>
      </body>
    </html>
  );
}
