"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { basculerFavoriId, obtenirFavorisIds } from "@/lib/favoris";

interface AnnonceFavori {
  id: string;
  titre: string;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  photos: string[];
  statut: string;
}

export default function FavorisDjassaPage() {
  const [favorisIds, setFavorisIds] = useState<string[]>([]);
  const [annonces, setAnnonces] = useState<AnnonceFavori[]>([]);
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
        .select("id, titre, prix, etat, commune, quartier, photos, statut")
        .in("id", ids);

      if (data) {
        setAnnonces(data as AnnonceFavori[]);
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
        <div className="text-center py-16 text-gray-500">
          Chargement de vos favoris...
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
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col relative"
            >
              <button
                type="button"
                onClick={() => retirerFavori(ann.id)}
                title="Retirer des favoris"
                className="absolute top-2.5 right-2.5 z-10 bg-white/95 hover:bg-red-50 text-red-600 w-8 h-8 rounded-full flex items-center justify-center shadow text-sm font-bold"
              >
                ❤️
              </button>

              <Link href={`/annonces/${ann.id}`} className="block h-48 bg-gray-100">
                {Array.isArray(ann.photos) && ann.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={String(ann.photos)}
                    alt={ann.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Aucune photo
                  </div>
                )}
              </Link>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-emerald-700 font-black text-lg">
                    {ann.prix > 0
                      ? ann.prix.toLocaleString("fr-FR") + " FCFA"
                      : "Prix à débattre"}
                  </p>
                  <Link
                    href={`/annonces/${ann.id}`}
                    className="font-bold text-gray-900 text-sm mt-1 line-clamp-2 hover:text-emerald-700"
                  >
                    {ann.titre}
                  </Link>
                </div>

                <p className="text-xs text-gray-500 mt-3 pt-2.5 border-t border-gray-100">
                  📍 {ann.commune}
                  {ann.quartier ? ` (${ann.quartier})` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
