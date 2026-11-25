import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavbarDjassa } from "@/components/NavbarDjassa";
import { BoutonInstallerApp } from "@/components/BoutonInstallerApp";
import { AssistantIADjassa } from "@/components/AssistantIADjassa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#059669",
};

export const metadata: Metadata = {
  title:
    "DJASSA Abidjan — Petites annonces, bonnes affaires & achats en Côte d'Ivoire",
  description:
    "Achetez et vendez rapidement téléphones, voitures, meubles, vêtements et immobilier à Abidjan (Treichville, Cocody, Yopougon, Marcory, Plateau...).",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DJASSA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
      >
        <NavbarDjassa />
        <main className="flex-1">{children}</main>
        <BoutonInstallerApp />
        <AssistantIADjassa />
        <footer className="bg-gray-900 text-gray-400 text-xs py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-bold text-white">
              DJASSA Côte d&apos;Ivoire — Le marché des bonnes affaires à Abidjan
            </p>

            <div className="flex flex-wrap items-center justify-center gap-5 font-semibold">
              <Link href="/cgu" className="hover:text-emerald-400 transition">
                Conditions Générales (CGU)
              </Link>
              <Link
                href="/confidentialite"
                className="hover:text-emerald-400 transition"
              >
                Confidentialité
              </Link>
              <Link
                href="/contact"
                className="hover:text-emerald-400 transition"
              >
                Contact
              </Link>
            </div>

            <p>© 2026 DJASSA. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
