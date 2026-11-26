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
          .eq("statut", "active")
          .order("booste", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(24),
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

  return (
    <div>
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-xs font-extrabold px-3 py-1 rounded-full mb-3">
            🇨🇮 LE GRAND MARCHÉ EN LIGNE D&apos;ABIDJAN
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            Achetez et vendez près de chez vous sur DJASSA
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
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <CategoriesGrid
          categories={categories}
          categorieId={categorieId}
          setCategorieId={setCategorieId}
        />
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Bonnes affaires récentes ({annoncesFiltrees.length})
          </h2>
          <Link
            href="/publier"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:underline"
          >
            + Déposer une annonce
          </Link>
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
      </section>
    </div>
  );
}
