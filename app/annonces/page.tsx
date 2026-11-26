"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { COMMUNES_ABIDJAN, ETATS_ARTICLE } from "@/lib/constantes";
import { AnnonceCard } from "@/components/annonces/AnnonceCard";
import { AnnonceSkeleton } from "@/components/annonces/AnnonceSkeleton";
import { EmptyAnnonces } from "@/components/annonces/EmptyAnnonces";
import type { Annonce, Categorie } from "@/lib/types";

export default function CatalogueAnnoncesPage() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);

  const [recherche, setRecherche] = useState("");
  const [commune, setCommune] = useState("Toutes");
  const [categorieId, setCategorieId] = useState<number | "Toutes">("Toutes");
  const [etatFiltre, setEtatFiltre] = useState("Tous");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [tri, setTri] = useState<"recentes" | "prix_asc" | "prix_desc">("recentes");

  useEffect(() => {
    async function chargerCatalogue() {
      const [resCat, resAnn] = await Promise.all([
        supabase.from("categories").select("id, nom, icone").order("id"),
        supabase
          .from("annonces")
          .select("*")
          .eq("statut", "active")
          .order("booste", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (resCat.data) setCategories(resCat.data);
      if (resAnn.data) setAnnonces(resAnn.data);
      setLoading(false);
    }
    chargerCatalogue();
  }, []);

  const annoncesFiltrees = useMemo(() => {
    const minNum = prixMin ? parseInt(prixMin.replace(/\D/g, ""), 10) : null;
    const maxNum = prixMax ? parseInt(prixMax.replace(/\D/g, ""), 10) : null;

    return annonces
      .filter((a) => {
        const terme = recherche.trim().toLowerCase();
        const matchRecherche =
          !terme ||
          a.titre.toLowerCase().includes(terme) ||
          (a.quartier || "").toLowerCase().includes(terme);

        const matchCommune =
          commune === "Toutes" ||
          a.commune.toLowerCase() === commune.toLowerCase();

        const matchCategorie =
          categorieId === "Toutes" || a.categorie_id === categorieId;

        const matchEtat = etatFiltre === "Tous" || a.etat === etatFiltre;
        const matchMin = minNum === null || a.prix >= minNum;
        const matchMax = maxNum === null || a.prix <= maxNum;

        return (
          matchRecherche &&
          matchCommune &&
          matchCategorie &&
          matchEtat &&
          matchMin &&
          matchMax
        );
      })
      .sort((a, b) => {
        if (tri === "prix_asc") {
          if (a.prix === 0 && b.prix > 0) return 1;
          if (b.prix === 0 && a.prix > 0) return -1;
          return a.prix - b.prix;
        }
        if (tri === "prix_desc") return b.prix - a.prix;
        if (a.booste !== b.booste) return a.booste ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [annonces, recherche, commune, categorieId, etatFiltre, prixMin, prixMax, tri]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Toutes les annonces DJASSA
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {annoncesFiltrees.length} bonne(s) affaire(s) disponible(s) à Abidjan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="tri-prix" className="text-xs font-bold text-gray-600 shrink-0">
            Trier par :
          </label>
          <select
            id="tri-prix"
            value={tri}
            onChange={(e) =>
              setTri(e.target.value as "recentes" | "prix_asc" | "prix_desc")
            }
            className="border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold bg-white"
          >
            <option value="recentes">✨ Plus récentes</option>
            <option value="prix_asc">💰 Prix croissant</option>
            <option value="prix_desc">💎 Prix décroissant</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-5 shadow-sm mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Mot-clé, quartier..."
            className="border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm"
          />
          <select
            value={categorieId}
            onChange={(e) =>
              setCategorieId(e.target.value === "Toutes" ? "Toutes" : Number(e.target.value))
            }
            className="border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="Toutes">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icone ? `${cat.icone} ` : ""}
                {cat.nom}
              </option>
            ))}
          </select>
          <select
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            className="border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="Toutes">Toutes les communes</option>
            {COMMUNES_ABIDJAN.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={etatFiltre}
            onChange={(e) => setEtatFiltre(e.target.value)}
            className="border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="Tous">Tous les états</option>
            {ETATS_ARTICLE.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600">Budget (FCFA) :</span>
            <input
              type="number"
              min={0}
              value={prixMin}
              onChange={(e) => setPrixMin(e.target.value)}
              placeholder="Min"
              className="w-28 border border-gray-300 rounded-xl px-3 py-1.5 text-xs"
            />
            <span className="text-gray-400 text-xs">—</span>
            <input
              type="number"
              min={0}
              value={prixMax}
              onChange={(e) => setPrixMax(e.target.value)}
              placeholder="Max"
              className="w-28 border border-gray-300 rounded-xl px-3 py-1.5 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setRecherche("");
              setCommune("Toutes");
              setCategorieId("Toutes");
              setEtatFiltre("Tous");
              setPrixMin("");
              setPrixMax("");
              setTri("recentes");
            }}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <AnnonceSkeleton key={i} />
          ))}
        </div>
      ) : annoncesFiltrees.length === 0 ? (
        <EmptyAnnonces
          message="Aucune annonce ne correspond à vos critères"
          sousMessage="Élargissez votre budget ou sélectionnez « Toutes les communes »."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {annoncesFiltrees.map((annonce) => (
            <AnnonceCard key={annonce.id} annonce={annonce} />
          ))}
        </div>
      )}
    </div>
  );
}
