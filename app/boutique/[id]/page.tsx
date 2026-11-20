"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface VendeurBoutique {
  id: string;
  nom: string;
  commune: string | null;
  verifie: boolean;
  created_at?: string;
}

interface ArticleBoutique {
  id: string;
  titre: string;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  photos: string[];
  booste: boolean;
}

function ContenuBoutiqueVendeur() {
  const params = useParams();
  const rawId = params?.id;
  const vendeurId = decodeURIComponent(
    String(Array.isArray(rawId) ? rawId[0] : rawId ?? "")
  );

  const [vendeur, setVendeur] = useState<VendeurBoutique | null>(null);
  const [articles, setArticles] = useState<ArticleBoutique[]>([]);
  const [loading, setLoading] = useState(true);
  const [lienCopie, setLienCopie] = useState(false);

  useEffect(() => {
    async function chargerBoutique() {
      if (!vendeurId || vendeurId === "undefined" || vendeurId === "null") {
        setLoading(false);
        return;
      }

      const [resVendeur, resArticles] = await Promise.all([
        supabase
          .from("utilisateurs")
          .select("id, nom, commune, verifie, created_at")
          .eq("id", vendeurId)
          .maybeSingle(),
        supabase
          .from("annonces")
          .select("id, titre, prix, etat, commune, quartier, photos, booste")
          .eq("user_id", vendeurId)
          .eq("statut", "active")
          .order("booste", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (resVendeur.data) setVendeur(resVendeur.data as VendeurBoutique);
      if (resArticles.data) setArticles(resArticles.data as ArticleBoutique[]);
      setLoading(false);
    }

    chargerBoutique();
  }, [vendeurId]);

  function partagerBoutique() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2500);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">
        Chargement de la boutique...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête de la boutique */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
              🏪 BOUTIQUE DJASSA
            </span>
            {vendeur?.verifie && (
              <span className="bg-green-100 text-green-800 text-xs font-extrabold px-3 py-1 rounded-full">
                ✓ Vendeur vérifié
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            {vendeur?.nom || "Boutique Vendeur Abidjan"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            📍 Zone principale :{" "}
            <strong>{vendeur?.commune || "Abidjan"}</strong> •{" "}
            {articles.length} article(s) en vente
          </p>
        </div>

        <button
          type="button"
          onClick={partagerBoutique}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition shrink-0"
        >
          {lienCopie ? "✅ Lien boutique copié !" : "🔗 Partager cette boutique"}
        </button>
      </div>

      {/* Articles de la boutique */}
      {articles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
          <p className="text-base font-bold text-gray-900 mb-2">
            Aucun article disponible dans cette boutique pour le moment
          </p>
          <Link
            href="/annonces"
            className="inline-block mt-3 bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
          >
            Voir toutes les annonces DJASSA
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {articles.map((art) => (
            <Link
              key={art.id}
              href={`/annonces/${art.id}`}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-400 transition flex flex-col"
            >
              <div className="h-48 bg-gray-100 relative">
                {Array.isArray(art.photos) && art.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={String(art.photos[0])}
                    alt={art.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Aucune photo
                  </div>
                )}
                <span className="absolute top-2.5 left-2.5 bg-white/95 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {art.etat}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-emerald-700 font-black text-lg">
                    {art.prix > 0
                      ? art.prix.toLocaleString("fr-FR") + " FCFA"
                      : "Prix à débattre"}
                  </p>
                  <h2 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">
                    {art.titre}
                  </h2>
                </div>

                <p className="text-xs text-gray-500 mt-3 pt-2.5 border-t border-gray-100">
                  📍 {art.commune}
                  {art.quartier ? ` (${art.quartier})` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BoutiqueVendeurPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">
          Chargement de la boutique...
        </div>
      }
    >
      <ContenuBoutiqueVendeur />
    </Suspense>
  );
}
