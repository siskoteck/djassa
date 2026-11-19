import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "BARA - Trouvez un artisan de confiance à Abidjan",
  description:
    "Plateforme de mise en relation entre artisans et particuliers à Abidjan. Trouvez rapidement un plombier, électricien, maçon et plus encore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <Suspense fallback={<div className="flex-1" />}>
          <main className="flex-1">{children}</main>
        </Suspense>
        <Footer />
      </body>
    </html>
  );
}
