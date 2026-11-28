import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publier une annonce gratuite | DJASSA Abidjan",
  description: "Vendez vos articles gratuitement à Abidjan en moins de 2 minutes et recevez des messages WhatsApp directs d'acheteurs.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}