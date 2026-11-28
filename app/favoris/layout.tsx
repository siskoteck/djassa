import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes articles favoris | DJASSA Abidjan",
  description: "Retrouvez toutes les annonces sauvegardées sur DJASSA Abidjan.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}