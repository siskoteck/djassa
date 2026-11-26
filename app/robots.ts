import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/annonces", "/publier"], disallow: ["/mon-compte", "/mes-annonces"] }],
    sitemap: "https://vercel.app",
  };
}