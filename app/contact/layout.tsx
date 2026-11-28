import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Assistance | DJASSA Abidjan",
  description: "Une question ou un signalement sur DJASSA Abidjan ? Contactez notre équipe support sur WhatsApp.",
};

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}