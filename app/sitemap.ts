import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://vercel.app";
  const pages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/annonces`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
  ];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !key) return pages;

  const sb = createClient(url, key);
  const { data } = await sb.from("annonces").select("id, created_at").or("statut.eq.active,statut.is.null").limit(500);
  const items: MetadataRoute.Sitemap = (data || []).map((a) => ({
    url: `${base}/annonces/${a.id}`,
    lastModified: a.created_at ? new Date(a.created_at) : new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));
  return [...pages, ...items];
}