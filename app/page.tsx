"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { COMMUNES_ABIDJAN } from "@/lib/constantes";

interface Categorie {
  id: number;
  nom: string;
  slug: string;
  icone: string | null;
}

interface Annonce {
  id: string;
  created_at: string;
  titre: string;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  photos: string[];
  categorie_id: number | null;
}

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
        supabase.from("categories").select("*").order("id", { ascending: true }),
        supabase
          .from("annonces")
          .select("*")
          .eq("statut", "active")
          .order("booste", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(24),
      ]);

      if (resCat.data) setCategories(resCat.data as Categorie[]);
      if (resAnn.data) setAnnonces(resAnn.data as Annonce[]);
      setLoading(false);
    }

    chargerAccueil();
  }, []);

  const annoncesFiltrees = annonces.filter((a) => {
    const matchRecherche =
      !recherche.trim() ||
      a.titre.toLowerCase().includes(recherche.trim().toLowerCase()) ||
      (a.quartier || "").toLowerCase().includes(recherche.trim().toLowerCase());

    const matchCommune =
      commune === "Toutes" || a.commune.toLowerCase() === commune.toLowerCase();

    const matchCategorie =
      categorieId === "Toutes" || a.categorie_id === categorieId;

    return matchRecherche && matchCommune && matchCategorie;
  });

  function formaterPrixFCFA(prix: number) {
    if (!prix || prix <= 0) return "Prix à débattre";
    return prix.toLocaleString("fr-FR") + " FCFA";
  }

  return (
    <div>
      {/* Bannière principale + Barre de recherche */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full mb-3">
            🇨🇮 LE GRAND MARCHÉ EN LIGNE D&apos;ABIDJAN
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Achetez et vendez près de chez vous sur DJASSA
          </h1>
          <p className="text-orange-50 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Téléphones, voitures, meubles, vêtements ou logements à Treichville,
            Cocody, Yopougon, Marcory et partout à Abidjan.
          </p>

          {/* Barre de recherche multi-critères */}
          <div className="mt-7 bg-white rounded-2xl p-3 shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-gray-900">
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Que cherchez-vous ? (iPhone, frigo, studio...)"
              className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
            />

            <select
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-white font-medium"
            >
              <option value="Toutes">Toutes les communes</option>
              {COMMUNES_ABIDJAN.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setRecherche("");
                setCommune("Toutes");
                setCategorieId("Toutes");
              }}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm py-3 px-4 rounded-xl transition"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </section>

      {/* Grille des catégories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Explorer par catégorie
          </h2>
          {categorieId !== "Toutes" && (
            <button
              type="button"
              onClick={() => setCategorieId("Toutes")}
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Voir toutes les catégories
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const estActive = categorieId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setCategorieId(estActive ? "Toutes" : cat.id)
                }
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                  estActive
                    ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                    : "bg-white hover:border-orange-400 text-gray-800 border-gray-200"
                }`}
              >
                <span className="text-2xl">{cat.icone || "🛍️"}</span>
                <span className="text-xs font-bold leading-tight">
                  {cat.nom}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dernières annonces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Bonnes affaires récentes ({annoncesFiltrees.length})
          </h2>
          <Link
            href="/publier"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:underline"
          >
            + Déposer une annonce
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">
            Chargement des annonces DJASSA...
          </div>
        ) : annoncesFiltrees.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">
              Aucune annonce publiée pour le moment
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Soyez le premier vendeur à publier un article sur DJASSA Abidjan !
            </p>
            <Link
              href="/publier"
              className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
            >
              + Publier ma première annonce gratuite
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {annoncesFiltrees.map((annonce) => (
              <Link
                key={annonce.id}
                href={`/annonces/${annonce.id}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-orange-300 transition flex flex-col"
              >
                <div className="h-48 bg-gray-100 relative">
                  {annonce.photos && annonce.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={annonce.photos}
                      alt={annonce.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                      Aucune photo
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-white/95 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {annonce.etat}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-orange-600 font-black text-lg">
                      {formaterPrixFCFA(annonce.prix)}
                    </p>
                    <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">
                      {annonce.titre}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 pt-2.5 border-t border-gray-100">
                    📍 {annonce.commune}
                    {annonce.quartier ? ` (${annonce.quartier})` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
