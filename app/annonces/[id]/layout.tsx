import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("annonces").select("titre, prix, commune, description, photos").eq("id", id).maybeSingle();
  if (!data) return { title: "Annonce | DJASSA Abidjan" };
  const prixTxt = data.prix > 0 ? `${data.prix.toLocaleString("fr-FR")} FCFA` : "Prix à débattre";
  return {
    title: `${data.titre} (${prixTxt}) - ${data.commune} | DJASSA`,
    description: data.description?.slice(0, 150) || `${data.titre} disponible à ${data.commune}, Abidjan sur DJASSA.`,
    openGraph: { images: Array.isArray(data.photos) && data.photos[0] ? [data.photos[0]] : [] },
  };
}

export default function LayoutAnnonce({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}