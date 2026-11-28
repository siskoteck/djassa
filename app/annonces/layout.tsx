import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toutes les annonces à Abidjan | DJASSA",
  description: "Parcourez des milliers d'articles neufs et d'occasion à Abidjan : téléphones, électronique, mode, meubles, véhicules et maison.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}