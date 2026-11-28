import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | DJASSA Abidjan",
  description: "Protection des données personnelles des acheteurs et vendeurs sur DJASSA Abidjan conformément à la loi ivoirienne.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}