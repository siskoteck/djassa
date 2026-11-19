"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIES_DJASSA, COMMUNES } from "@/lib/constantes";
import { genererLienWhatsAppAchat } from "@/lib/whatsapp";
import { BannierePub } from "@/components/BannierePub";

interface Annonce {
  id: number;
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

const CATEGORIES_ACCUEIL = [
  { nom: "Téléphones & Tablettes", icone: "📱" },
  { nom: "Informatique & Jeux vidéo", icone: "💻" },
  { nom: "TV, Audio & Photo", icone: "📺" },
  { nom: "Électroménager", icone: "❄️" },
  { nom: "Meubles & Décoration", icone: "🛋️" },
  { nom: "Mode, Vêtements & Chaussures", icone: "👟" },
  { nom: "Véhicules & Motos", icone: "🚗" },
  { nom: "Bricolage & Matériaux", icone: "🛠️" },
];

export default function HomePage() {
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [categorieChoisie, setCategorieChoisie] = useState("");
  const [communeChoisie, setCommuneChoisie] = useState("");
  const [dernieresAnnonces, setDernieresAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerAnnonces() {
      const { data, error } = await supabase
        .from("annonces")
        .select("*")
        .eq("statut", "disponible")
        .order("vedette", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        setDernieresAnnonces(data as Annonce[]);
      }
      setLoading(false);
    }

    chargerAnnonces();
  }, []);

  function lancerRecherche(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (recherche.trim()) params.set("q", recherche.trim());
    if (categorieChoisie) params.set("categorie", categorieChoisie);
    if (communeChoisie) params.set("commune", communeChoisie);

    const query = params.toString();
    router.push(query ? `/annonces?${query}` : "/annonces");
  }
  return (
    <div>
      {/* Hero & Barre de recherche rapide */}
      <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Le grand marché en ligne d&apos;Abidjan
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Achetez et vendez facilement entre particuliers sur DJASSA
          </h1>
          <p className="text-orange-100 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Téléphones, meubles, électroménager, mode ou véhicules dans les 13
            communes d&apos;Abidjan. Sans commission, contact direct sur WhatsApp.
          </p>

          {/* Barre de recherche */}
          <form
            onSubmit={lancerRecherche}
            className="bg-white p-3 rounded-2xl shadow-lg max-w-4xl mx-auto flex flex-col md:flex-row gap-3 text-gray-800"
          >
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Que cherchez-vous ? (ex: iPhone, frigo, canapé...)"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500"
            />

            <select
              value={categorieChoisie}
              onChange={(e) => setCategorieChoisie(e.target.value)}
              className="md:w-52 border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="">Toutes catégories</option>
              {CATEGORIES_DJASSA.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={communeChoisie}
              onChange={(e) => setCommuneChoisie(e.target.value)}
              className="md:w-44 border border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="">Tout Abidjan</option>
              {COMMUNES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition shrink-0"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* Catégories populaires */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Catégories populaires
          </h2>
          <Link
            href="/annonces"
            className="text-sm text-orange-600 font-medium hover:underline"
          >
            Tout voir →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES_ACCUEIL.map((cat) => (
            <Link
              key={cat.nom}
              href={`/annonces?categorie=${encodeURIComponent(cat.nom)}`}
              className="bg-white border border-gray-200 hover:border-orange-400 rounded-2xl p-5 text-center shadow-sm hover:shadow transition flex flex-col items-center gap-2"
            >
              <span className="text-3xl">{cat.icone}</span>
              <span className="font-semibold text-sm text-gray-800">
                {cat.nom}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bannière Publicitaire Partenaire */}
      <BannierePub emplacement="accueil" />

      {/* Dernières annonces publiées */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Dernières bonnes affaires à Abidjan
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Articles disponibles immédiatement près de chez vous
            </p>
          </div>
          <Link
            href="/annonces"
            className="text-orange-600 font-medium hover:underline text-sm"
          >
            Voir toutes les annonces →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Chargement des annonces...
          </div>
        ) : dernieresAnnonces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Aucune annonce publiée pour le moment
            </p>
            <p className="text-gray-600 mb-6">
              Soyez le premier à vendre un article gratuitement sur DJASSA !
            </p>
            <Link
              href="/publier"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700"
            >
              + Publier une annonce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dernieresAnnonces.map((annonce) => {
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
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 hover:text-orange-600">
                          {annonce.titre}
                        </h3>
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
      </section>

      {/* Bandeau d'incitation à la vente */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gray-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Vous avez des articles à vendre ?
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl">
              Prenez une photo, fixez votre prix en FCFA et publiez votre annonce
              gratuitement en moins d&apos;une minute sur DJASSA.
            </p>
          </div>
          <Link
            href="/publier"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-xl transition shrink-0"
          >
            + Vendre un article gratuitement
          </Link>
        </div>
      </section>
    </div>
  );
}
