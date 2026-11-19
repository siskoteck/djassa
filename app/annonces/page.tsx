"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIES_DJASSA, COMMUNES } from "@/lib/constantes";
import { genererLienWhatsAppAchat } from "@/lib/whatsapp";
import { BannierePub } from "@/components/BannierePub";

interface Annonce {
  id: number;
  created_at: string;
  titre: string;
  categorie: string;
  prix: number;
  etat: string;
  commune: string;
  quartier?: string | null;
  telephone: string;
  vendeur_nom: string;
  photos?: string[] | null;
  vedette?: boolean | null;
}

function CatalogueAnnoncesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [motCle, setMotCle] = useState(searchParams.get("q") || "");
  const [categorieFiltre, setCategorieFiltre] = useState(
    searchParams.get("categorie") || ""
  );
  const [communeFiltre, setCommuneFiltre] = useState(
    searchParams.get("commune") || ""
  );
  const [tri, setTri] = useState<"recent" | "prix_asc" | "prix_desc">("recent");

  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMotCle(searchParams.get("q") || "");
    setCategorieFiltre(searchParams.get("categorie") || "");
    setCommuneFiltre(searchParams.get("commune") || "");
  }, [searchParams]);

  useEffect(() => {
    async function chargerAnnonces() {
      setLoading(true);
      let query = supabase
        .from("annonces")
        .select("*")
        .eq("statut", "disponible");

      if (categorieFiltre) {
        query = query.eq("categorie", categorieFiltre);
      }
      if (communeFiltre) {
        query = query.eq("commune", communeFiltre);
      }
      if (motCle.trim()) {
        query = query.ilike("titre", `%${motCle.trim()}%`);
      }

      if (tri === "prix_asc") {
        query = query.order("prix", { ascending: true });
      } else if (tri === "prix_desc") {
        query = query.order("prix", { ascending: false });
      } else {
        query = query
          .order("vedette", { ascending: false })
          .order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (!error && data) {
        setAnnonces(data as Annonce[]);
      }
      setLoading(false);
    }

    chargerAnnonces();
  }, [categorieFiltre, communeFiltre, motCle, tri]);

  function mettreAJourUrl(
    nouveauMotCle: string,
    nouvelleCategorie: string,
    nouvelleCommune: string
  ) {
    const params = new URLSearchParams();
    if (nouveauMotCle.trim()) params.set("q", nouveauMotCle.trim());
    if (nouvelleCategorie) params.set("categorie", nouvelleCategorie);
    if (nouvelleCommune) params.set("commune", nouvelleCommune);

    const queryString = params.toString();
    router.replace(queryString ? `/annonces?${queryString}` : "/annonces");
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Toutes les annonces à Abidjan
          </h1>
          <p className="text-gray-600 mt-1">
            {annonces.length} article{annonces.length > 1 ? "s" : ""} disponible
            {annonces.length > 1 ? "s" : ""} près de chez vous
          </p>
        </div>

        <Link
          href="/publier"
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition text-center shrink-0"
        >
          + Vendre un article
        </Link>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Mot-clé
          </label>
          <input
            type="text"
            value={motCle}
            onChange={(e) => {
              setMotCle(e.target.value);
              mettreAJourUrl(e.target.value, categorieFiltre, communeFiltre);
            }}
            placeholder="Ex: Samsung, canapé, moto..."
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Catégorie
          </label>
          <select
            value={categorieFiltre}
            onChange={(e) => {
              setCategorieFiltre(e.target.value);
              mettreAJourUrl(motCle, e.target.value, communeFiltre);
            }}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES_DJASSA.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Commune
          </label>
          <select
            value={communeFiltre}
            onChange={(e) => {
              setCommuneFiltre(e.target.value);
              mettreAJourUrl(motCle, categorieFiltre, e.target.value);
            }}
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="">Toutes les communes</option>
            {COMMUNES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Trier par
          </label>
          <select
            value={tri}
            onChange={(e) =>
              setTri(e.target.value as "recent" | "prix_asc" | "prix_desc")
            }
            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm bg-white"
          >
            <option value="recent">Plus récentes</option>
            <option value="prix_asc">Prix croissant (moins cher)</option>
            <option value="prix_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {(motCle || categorieFiltre || communeFiltre) && (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setMotCle("");
              setCategorieFiltre("");
              setCommuneFiltre("");
              router.replace("/annonces");
            }}
            className="text-sm text-orange-600 font-medium hover:underline"
          >
            ✕ Effacer tous les filtres
          </button>
        </div>
      )}

      {/* Bannière Publicitaire */}
      <BannierePub emplacement="annuaire" />

      {/* Grille des annonces */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">
          Recherche des articles en cours...
        </div>
      ) : annonces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            Aucun article trouvé pour ces critères
          </p>
          <p className="text-gray-600 mb-6">
            Essayez d&apos;autres mots-clés ou publiez votre propre article à vendre.
          </p>
          <Link
            href="/publier"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700"
          >
            + Publier une annonce gratuitement
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {annonces.map((annonce) => {
            const photoPrincipale =
              annonce.photos && annonce.photos.length > 0
                ? annonce.photos
                : null;

            return (
              <div
                key={annonce.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <Link href={`/annonces/${annonce.id}`} className="block relative">
                    {photoPrincipale ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoPrincipale}
                        alt={annonce.titre}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        Pas de photo
                      </div>
                    )}

                    {annonce.vedette && (
                      <span className="absolute top-2 left-2 bg-orange-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow">
                        ★ À la une
                      </span>
                    )}
                  </Link>

                  <div className="p-4">
                    <p className="text-xl font-extrabold text-orange-600 mb-1">
                      {annonce.prix.toLocaleString("fr-FR")} FCFA
                    </p>

                    <Link href={`/annonces/${annonce.id}`}>
                      <h2 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-orange-600">
                        {annonce.titre}
                      </h2>
                    </Link>

                    <p className="text-xs text-gray-500 mt-1">
                      📍 {annonce.commune}
                      {annonce.quartier ? ` (${annonce.quartier})` : ""}
                    </p>

                    <span className="inline-block mt-2 bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded">
                      {annonce.etat}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-2 flex gap-2">
                  <Link
                    href={`/annonces/${annonce.id}`}
                    className="flex-1 text-center py-2 px-2 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                  >
                    Détails
                  </Link>
                  <a
                    href={genererLienWhatsAppAchat(
                      annonce.telephone,
                      annonce.vendeur_nom,
                      annonce.titre,
                      annonce.prix
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AnnoncesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
          Chargement des annonces...
        </div>
      }
    >
      <CatalogueAnnoncesContent />
    </Suspense>
  );
}
