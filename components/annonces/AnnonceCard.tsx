"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Annonce } from "@/lib/types";
import { formaterPrixFCFA } from "@/lib/utils";
import { basculerFavoriId, obtenirFavorisIds } from "@/lib/favoris";

function formaterDateRelative(dateIso: string): string {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const heures = Math.floor(diffMs / (1000 * 60 * 60));
  if (heures < 1) return "À l'instant";
  if (heures < 24) return "Aujourd'hui";
  const jours = Math.floor(heures / 24);
  if (jours === 1) return "Hier";
  if (jours < 30) return `Il y a ${jours} j`;
  return new Date(dateIso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const photos = Array.isArray(annonce.photos) ? annonce.photos : [];
  const photoPrincipale = photos[0] || null;
  const [animeCoeur, setAnimeCoeur] = useState(false);
  const [estFavori, setEstFavori] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? obtenirFavorisIds().includes(annonce.id)
      : false
  );

  const estNouveau =
    Date.now() - new Date(annonce.created_at).getTime() < 24 * 60 * 60 * 1000;

  function handleToggleFavori(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const maj = basculerFavoriId(annonce.id);
    setEstFavori(maj.includes(annonce.id));
    setAnimeCoeur(true);
    setTimeout(() => setAnimeCoeur(false), 380);
  }

  return (
    <div className="animate-djassa-fade-up group bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-500 transition-all duration-200 flex flex-col relative">
      {/* Bouton Favori 1-clic */}
      <button
        type="button"
        onClick={handleToggleFavori}
        aria-label={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
        title={estFavori ? "Retirer des favoris" : "Sauvegarder"}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-sm flex items-center justify-center text-sm transition active:scale-90"
      >
        <span className={animeCoeur ? "inline-block animate-djassa-heart" : "inline-block"}>{estFavori ? "❤️" : "🤍"}</span>
      </button>

      <Link href={`/annonces/${annonce.id}`} className="flex-1 flex flex-col">
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {photoPrincipale ? (
            <Image
              src={photoPrincipale}
              alt={annonce.titre}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
              <span className="text-2xl">📷</span>
              <span>Aucune photo</span>
            </div>
          )}

          {/* Badges haut-gauche */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 pr-9">
            {annonce.booste && (
              <span className="animate-djassa-glow bg-amber-400 text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                ⭐ À la une
              </span>
            )}
            <span className="bg-white/95 backdrop-blur-xs text-gray-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              {annonce.etat}
            </span>
          </div>

          {/* Compteur photos & vidéo en bas de l'image */}
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            {estNouveau ? (
              <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                ✨ Nouveau
              </span>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-1">
              {annonce.video_url && (
                <span className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  🎥 Vidéo
                </span>
              )}
              {photos.length > 1 && (
                <span className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  📷 {photos.length}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-emerald-700 font-black text-lg tracking-tight">
              {formaterPrixFCFA(annonce.prix)}
            </p>
            <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">
              {annonce.titre}
            </h3>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2 text-[11px] text-gray-500">
            <span className="truncate font-medium">
              📍 {annonce.commune}
              {annonce.quartier ? ` • ${annonce.quartier}` : ""}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              {typeof annonce.vues === "number" && annonce.vues > 0 && (
                <span className="font-semibold text-gray-600">
                  👁️ {annonce.vues}
                </span>
              )}
              <span className="text-gray-400">
                {formaterDateRelative(annonce.created_at)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}