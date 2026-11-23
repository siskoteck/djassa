import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DJASSA Abidjan — Bonnes affaires",
    short_name: "DJASSA",
    description:
      "Achetez et vendez rapidement téléphones, voitures, meubles et vêtements à Abidjan.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#059669",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
