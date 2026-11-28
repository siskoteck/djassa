import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation (CGU) | DJASSA Abidjan",
  description: "Règles de publication, sécurité des transactions et conditions d'utilisation de la marketplace DJASSA Abidjan.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}