import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { METIERS, COMMUNES } from "@/lib/constantes";
import { genererLienWhatsApp } from "@/lib/whatsapp";

const ICONES_METIERS: Record<string, string> = {
  "Plombier": "🔧",
  "Électricien": "⚡",
  "Maçon": "🧱",
  "Peintre": "🎨",
  "Menuisier": "🪚",
  "Carreleur": "🔲",
  "Soudeur / Ferronnier": "🔥",
  "Charpentier / Couvreur": "🏠",
  "Plaquiste": "📐",
  "Vitrier / Aluminium": "🪟",
  "Climatisation / Froid": "❄️",
  "Réparateur électroménager": "🧺",
  "Mécanicien auto": "🚗",
  "Technicien informatique": "💻",
  "Jardinier / Paysagiste": "🌿",
  "Nettoyage / Ménage": "🧹",
  "Déménageur": "🚚",
  "Couturier / Tailleur": "🧵",
  "Coiffeur / Coiffeuse": "✂️",
  "Autre": "🛠️",
};

const CATEGORIES_ACCUEIL = METIERS.filter((m) => m !== "Autre").slice(0, 12);

export default async function HomePage() {
  const { data: artisansRecommandes } = await supabase
    .from("artisans")
    .select("id, name, metier, commune, telephone, avatar_url, verifie")
    .order("verifie", { ascending: false })
    .limit(6);

  return (
    <div>
      {/* Hero Section avec barre de recherche rapide */}
      <section className="bg-orange-600 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Trouvez un artisan de confiance à Abidjan
          </h1>
          <p className="text-xl mb-10 text-orange-100">
            Plombiers, électriciens, maçons, peintres… Trouvez le bon professionnel rapidement.
          </p>

          <form
            action="/artisans"
            method="GET"
            className="bg-white p-3 rounded-2xl shadow-lg max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 text-gray-800"
          >
            <div className="flex-1">
              <label htmlFor="search-metier" className="sr-only">
                Métier recherché
              </label>
              <select
                id="search-metier"
                name="metier"
                defaultValue=""
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500 text-gray-800"
              >
                <option value="">Tous les métiers</option>
                {METIERS.map((metier) => (
                  <option key={metier} value={metier}>
                    {metier}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="search-commune" className="sr-only">
                Commune à Abidjan
              </label>
              <select
                id="search-commune"
                name="commune"
                defaultValue=""
                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-orange-500 text-gray-800"
              >
                <option value="">Toutes les communes</option>
                {COMMUNES.map((commune) => (
                  <option key={commune} value={commune}>
                    {commune}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="h-12 px-8 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition shrink-0"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-6 text-sm text-orange-100">
            Vous préférez recevoir des devis ?{" "}
            <Link
              href="/demande"
              className="underline font-semibold text-white hover:text-orange-50"
            >
              Poster une demande gratuitement →
            </Link>
          </div>
        </div>
      </section>

      {/* Catégories populaires */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Catégories populaires</h2>
          <Link
            href="/artisans"
            className="text-orange-600 font-medium hover:underline text-sm"
          >
            Voir tous les métiers →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORIES_ACCUEIL.map((metier) => (
            <Link
              key={metier}
              href={`/artisans?metier=${encodeURIComponent(metier)}`}
              className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-orange-500 hover:shadow-md transition text-center group"
            >
              <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                {ICONES_METIERS[metier] || "🛠️"}
              </span>
              <span className="font-medium text-gray-800 group-hover:text-orange-600">
                {metier}
              </span>
            </Link>
          ))}
        </div>
      </section>
      {/* Artisans recommandés à Abidjan */}
      {artisansRecommandes && artisansRecommandes.length > 0 && (
        <section className="py-16 bg-orange-50/50 border-t border-b border-orange-100">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Artisans recommandés à Abidjan
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Des professionnels disponibles dans votre commune
                </p>
              </div>
              <Link
                href="/artisans"
                className="text-orange-600 font-medium hover:underline text-sm"
              >
                Voir tout l&apos;annuaire →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {artisansRecommandes.map((artisan) => {
                const initiales = artisan.name
                  ? artisan.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "A";

                return (
                  <div
                    key={artisan.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        {artisan.avatar_url ? (
                          <img
                            src={artisan.avatar_url}
                            alt={artisan.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-lg font-bold border border-orange-200 shrink-0">
                            {initiales}
                          </div>
                        )}

                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {artisan.name}
                          </h3>
                          <p className="text-orange-600 font-medium text-sm">
                            {artisan.metier}
                          </p>
                          {artisan.commune && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              📍 {artisan.commune}
                            </p>
                          )}
                        </div>
                      </div>

                      {artisan.verifie && (
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <span>✓</span> Profil vérifié
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Link
                        href={`/artisans/${artisan.id}`}
                        className="flex-1 text-center py-2.5 px-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Voir le profil
                      </Link>
                      {artisan.telephone && (
                        <a
                          href={genererLienWhatsApp(
                            artisan.telephone,
                            artisan.name,
                            artisan.metier,
                            artisan.commune
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-2.5 px-3 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Comment ça marche */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comment ça marche ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Décrivez votre besoin</h3>
              <p className="text-gray-600">
                Expliquez ce dont vous avez besoin et votre quartier à Abidjan.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Recevez des propositions</h3>
              <p className="text-gray-600">
                Des artisans qualifiés vous contactent rapidement.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Choisissez et notez</h3>
              <p className="text-gray-600">
                Sélectionnez l&apos;artisan et laissez un avis après le travail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-orange-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Vous êtes artisan ?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Rejoignez BARA et développez votre activité à Abidjan.
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50"
          >
            Créer mon profil artisan
          </Link>
        </div>
      </section>
    </div>
  );
}
