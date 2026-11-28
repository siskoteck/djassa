import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Annonce | DJASSA Abidjan",
    };
  }

  const sb = createClient(url, key);
  const { data } = await sb
    .from("annonces")
    .select("titre, prix, commune, description, photos")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Annonce introuvable | DJASSA Abidjan",
    };
  }

  const prixTxt =
    typeof data.prix === "number" && data.prix > 0
      ? `${data.prix.toLocaleString("fr-FR")} FCFA`
      : "Prix à débattre";
  const titreComplet = `${data.titre} (${prixTxt}) - ${data.commune || "Abidjan"} | DJASSA`;
  const descPropre =
    data.description?.trim().slice(0, 155) ||
    `${data.titre} (${prixTxt}) disponible à ${data.commune || "Abidjan"} sur DJASSA.`;
  const photoPrincipale =
    Array.isArray(data.photos) && data.photos.length > 0 && data.photos
      ? data.photos
      : null;

  return {
    metadataBase: new URL(SITE_URL),
    title: titreComplet,
    description: descPropre,
    openGraph: {
      type: "website",
      siteName: "DJASSA Abidjan",
      locale: "fr_CI",
      url: `${SITE_URL}/annonces/${id}`,
      title: titreComplet,
      description: descPropre,
      images: photoPrincipale
        ? [
            {
              url: photoPrincipale,
              width: 1200,
              height: 630,
              alt: data.titre,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: titreComplet,
      description: descPropre,
      images: photoPrincipale ? [photoPrincipale] : [],
    },
  };
}

export default function LayoutAnnonce({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}