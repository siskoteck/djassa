"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Banniere {
  id: number;
  partenaire: string;
  image_url: string;
  lien_destination: string;
  clics: number;
}

export function BannierePub({
  emplacement,
}: {
  emplacement: "accueil" | "annuaire";
}) {
  const [banniere, setBanniere] = useState<Banniere | null>(null);

  useEffect(() => {
    async function chargerBanniere() {
      const { data } = await supabase
        .from("bannieres")
        .select("id, partenaire, image_url, lien_destination, clics")
        .eq("emplacement", emplacement)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) setBanniere(data);
    }

    chargerBanniere();
  }, [emplacement]);

  if (!banniere) return null;

  async function enregistrerClic() {
    if (!banniere) return;
    await supabase
      .from("bannieres")
      .update({ clics: (banniere.clics || 0) + 1 })
      .eq("id", banniere.id);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 my-8">
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white">
        <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 rounded">
          Sponsorisé • {banniere.partenaire}
        </span>

        <a
          href={banniere.lien_destination}
          target="_blank"
          rel="noopener noreferrer"
          onClick={enregistrerClic}
          className="block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banniere.image_url}
            alt={`Publicité ${banniere.partenaire}`}
            className="w-full h-32 sm:h-44 object-cover hover:opacity-95 transition"
          />
        </a>
      </div>
    </div>
  );
}
