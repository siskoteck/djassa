"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { basculerFavoriId, obtenirFavorisIds } from "@/lib/favoris";
import { AnnonceCard } from "@/components/annonces/AnnonceCard";
import { AnnonceSkeleton } from "@/components/annonces/AnnonceSkeleton";
import type { Annonce } from "@/lib/types";

export default function FavorisDjassaPage() {
  const [favorisIds, setFavorisIds] = useState<string[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerFavoris() {
      const ids = obtenirFavorisIds();
      setFavorisIds(ids);

      if (ids.length === 0) {
        setAnnonces([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("annonces")
        .select("*")
        .in("id", ids);

      if (data) {
        setAnnonces(data as Annonce[]);
      }
      setLoading(false);
    }

    chargerFavoris();
  }, []);

  function retirerFavori(id: string) {
    const nouveauxIds = basculerFavoriId(id);
    setFavorisIds(nouveauxIds);
    setAnnonces((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          ❤️ Mes annonces sauvegardées ({annonces.length})
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Retrouvez ici les bonnes affaires DJASSA que vous avez mises de côté.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <AnnonceSkeleton key={i} />
          ))}
        </div>
      ) : favorisIds.length === 0 || annonces.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
          <p className="text-lg font-bold text-gray-900 mb-2">
            Vous n&apos;avez aucun favori pour le moment
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Cliquez sur le cœur ❤️ d&apos;une annonce pour la retrouver
            facilement ici.
          </p>
          <Link
            href="/annonces"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
          >
            Explorer le catalogue DJASSA
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {annonces.map((ann) => (
            <div key={ann.id} className="relative">
              <button
                type="button"
                onClick={() => retirerFavori(ann.id)}
                title="Retirer des favoris"
                aria-label="Retirer des favoris"
                className="absolute top-2.5 right-2.5 z-10 bg-white/95 hover:bg-red-50 text-red-600 w-8 h-8 rounded-full flex items-center justify-center shadow text-sm font-bold"
              >
                ✕
              </button>
              <AnnonceCard annonce={ann} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
