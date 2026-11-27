"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AnnonceCard } from "@/components/annonces/AnnonceCard";
import { AnnonceSkeleton } from "@/components/annonces/AnnonceSkeleton";
import { EmptyAnnonces } from "@/components/annonces/EmptyAnnonces";
import { SearchBarDjassa } from "@/components/search/SearchBarDjassa";
import { CategoriesGrid } from "@/components/categories/CategoriesGrid";
import type { Annonce, Categorie } from "@/lib/types";

const COMMUNES_POPULAIRES = [
  "Toutes",
  "Treichville",
  "Cocody",
  "Yopougon",
  "Marcory",
  "Plateau",
  "Koumassi",
  "Abobo",
  "Port-Bouët",
  "Bingerville",
];

export default function HomeDjassaPage() {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  const [recherche, setRecherche] = useState("");
  const [commune, setCommune] = useState("Toutes");
  const [categorieId, setCategorieId] = useState<number | "Toutes">("Toutes");

  useEffect(() => {
    async function chargerAccueil() {
      const [resCat, resAnn] = await Promise.all([
        supabase.from("categories").select("*").order("id"),
        supabase
          .from("annonces")
          .select("*")
          .or("statut.eq.active,statut.is.null")
          .order("booste", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(32),
      ]);

      if (resCat.data) setCategories(resCat.data);
      if (resAnn.data) setAnnonces(resAnn.data);
      setLoading(false);
    }
    chargerAccueil();
  }, []);

  const annoncesFiltrees = useMemo(() => {
    return annonces.filter((a) => {
      const q = recherche.trim().toLowerCase();
      const matchRecherche =
        !q ||
        a.titre.toLowerCase().includes(q) ||
        (a.quartier || "").toLowerCase().includes(q);

      const matchCommune =
        commune === "Toutes" ||
        a.commune.toLowerCase() === commune.toLowerCase();

      const matchCategorie =
        categorieId === "Toutes" || a.categorie_id === categorieId;

      return matchRecherche && matchCommune && matchCategorie;
    });
  }, [annonces, recherche, commune, categorieId]);

  const annoncesAlaUne = useMemo(
    () => annoncesFiltrees.filter((a) => a.booste),
    [annoncesFiltrees]
  );

  const aUnFiltreActif =
    recherche.trim() !== "" ||
    commune !== "Toutes" ||
    categorieId !== "Toutes";

  return (
    <div className="bg-gray-50/60">
      {/* Hero Abidjan */}
      <section className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 text-white pt-10 pb-12 px-4 relative overflow-hidden">
        <div className="animate-djassa-fade-up max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-xs border border-white/20 text-xs font-extrabold px-3.5 py-1 rounded-full mb-3">
            🇨🇮 LE GRAND MARCHÉ EN LIGNE D&apos;ABIDJAN
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Achetez et vendez près de chez vous sur{" "}
            <span className="text-amber-300">DJASSA</span>
          </h1>
          <p className="text-emerald-50 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Téléphones, voitures, meubles, vêtements ou logements à Treichville,
            Cocody, Yopougon, Marcory et partout à Abidjan.
          </p>

          <SearchBarDjassa
            recherche={recherche}
            setRecherche={setRecherche}
            commune={commune}
            setCommune={setCommune}
            onReset={() => {
              setRecherche("");
              setCommune("Toutes");
              setCategorieId("Toutes");
            }}
          />

          {/* Indicateurs de confiance rapides */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-emerald-100 font-semibold">
            <span>✅ Publication 100 % gratuite</span>
            <span>💬 Discussion WhatsApp directe</span>
            <span>📍 Remise en main propre à Abidjan</span>
          </div>
        </div>
      </section>

      {/* Accès rapide par communes d'Abidjan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs font-extrabold text-gray-500 shrink-0">
            📍 Communes :
          </span>
          {COMMUNES_POPULAIRES.map((c) => {
            const actif = commune === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCommune(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition ${
                  actif
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                {c === "Toutes" ? "Tout Abidjan" : c}
              </button>
            );
          })}
        </div>
      </section>

      {/* Catégories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <CategoriesGrid
          categories={categories}
          categorieId={categorieId}
          setCategorieId={setCategorieId}
        />
      </section>

      {/* Section Annonces à la une (si présentes) */}
      {!loading && annoncesAlaUne.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-lg text-sm">
                ⭐ À la une
              </span>
              <span>Sélection Abidjan</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {annoncesAlaUne.map((annonce) => (
              <AnnonceCard key={annonce.id} annonce={annonce} />
            ))}
          </div>
        </section>
      )}

      {/* Bonnes affaires récentes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {aUnFiltreActif
                ? `Résultats filtrés (${annoncesFiltrees.length})`
                : `Bonnes affaires récentes (${annoncesFiltrees.length})`}
            </h2>
            {aUnFiltreActif && (
              <button
                type="button"
                onClick={() => {
                  setRecherche("");
                  setCommune("Toutes");
                  setCategorieId("Toutes");
                }}
                className="text-xs font-bold text-red-600 hover:underline mt-0.5"
              >
                ✕ Effacer les filtres actifs
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/annonces"
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-emerald-700"
            >
              Tout voir →
            </Link>
            <Link
              href="/publier"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition shadow-xs"
            >
              + Déposer une annonce
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <AnnonceSkeleton key={i} />
            ))}
          </div>
        ) : annoncesFiltrees.length === 0 ? (
          <EmptyAnnonces />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {annoncesFiltrees.map((annonce) => (
              <AnnonceCard key={annonce.id} annonce={annonce} />
            ))}
          </div>
        )}

        {/* Bannière d'incitation vendeur */}
        <div className="mt-14 bg-gradient-to-r from-emerald-900 to-teal-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="text-center sm:text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Vendez vite à Abidjan
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              Vous avez un article à vendre ?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Publiez votre annonce gratuitement en moins de 2 minutes et
              recevez des messages WhatsApp d&apos;acheteurs près de chez vous.
            </p>
          </div>
          <Link
            href="/publier"
            className="animate-djassa-glow bg-amber-400 hover:bg-amber-300 hover:scale-105 active:scale-95 text-gray-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-sm transition shrink-0"
          >
            📸 Publier gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}