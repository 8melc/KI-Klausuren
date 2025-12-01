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
  title: "KorrekturPilot – Digitale Unterstützung für Klausurkorrekturen",
  description:
    "KorrekturPilot hilft Lehrkräften beim Upload, bei der Bewertung und beim Export von Klausuren auf Basis des eigenen Erwartungshorizonts.",
  keywords: [
    "Klausurkorrektur",
    "KI Korrektur Lehrer",
    "automatische Bewertung Klassenarbeiten",
    "Erwartungshorizont",
    "DOCX Feedback",
  ],
  openGraph: {
    title: "KorrekturPilot | Automatisierte Klausurkorrektur",
    description:
      "Zeit sparen bei der Korrektur: Handschrift-OCR, faire Bewertung nach Erwartungshorizont und DOCX-Exports.",
    url: "/",
    siteName: "KorrekturPilot",
    locale: "de_DE",
    type: "website",
    images: [
      {
        url: "/og-korrekturpilot.svg",
        width: 1200,
        height: 630,
        alt: "KorrekturPilot Landing Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KorrekturPilot | Automatisierte Klausurkorrektur",
    description:
      "Korrigieren Sie eine Klasse in Minuten: OCR, Erwartungshorizont-Abgleich, Teilpunkte und DOCX-Feedback.",
    images: ["/og-korrekturpilot.svg"],
  },
  alternates: {
    canonical: "/",
  },
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
