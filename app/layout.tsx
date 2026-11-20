import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavbarDjassa } from "@/components/NavbarDjassa";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DJASSA Abidjan — Petites annonces, bonnes affaires & achats en Côte d'Ivoire",
  description:
    "Achetez et vendez rapidement téléphones, voitures, meubles, vêtements et immobilier à Abidjan (Treichville, Cocody, Yopougon, Marcory, Plateau...).",
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
        <footer className="bg-gray-900 text-gray-400 text-xs py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-bold text-white">
              DJASSA Côte d&apos;Ivoire — Le marché des bonnes affaires à Abidjan
            </p>
            <p>© 2026 DJASSA. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
