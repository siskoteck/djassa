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

interface AvisVendeur {
  id: string;
  created_at: string;
  auteur_id: string;
  auteur_nom: string;
  note: number;
  commentaire: string | null;
}

function ContenuBoutiqueVendeur() {
  const params = useParams();
  const rawId = params?.id;
  const vendeurId = decodeURIComponent(
    String(Array.isArray(rawId) ? rawId : rawId ?? "")
  );

  const [vendeur, setVendeur] = useState<VendeurBoutique | null>(null);
  const [articles, setArticles] = useState<ArticleBoutique[]>([]);
  const [avis, setAvis] = useState<AvisVendeur[]>([]);
  const [loading, setLoading] = useState(true);
  const [lienCopie, setLienCopie] = useState(false);

  // États utilisateur connecté & formulaire d'avis
  const [userConnecteId, setUserConnecteId] = useState<string | null>(null);
  const [userConnecteNom, setUserConnecteNom] = useState("Acheteur DJASSA");
  const [noteChoisie, setNoteChoisie] = useState<number>(5);
  const [commentaireAvis, setCommentaireAvis] = useState("");
  const [envoiAvis, setEnvoiAvis] = useState(false);
  const [msgAvis, setMsgAvis] = useState("");
  useEffect(() => {
    async function chargerBoutiqueEtAvis() {
      if (!vendeurId || vendeurId === "undefined" || vendeurId === "null") {
        setLoading(false);
        return;
      }

      const [resSession, resVendeur, resArticles, resAvis] = await Promise.all([
        supabase.auth.getSession(),
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
        supabase
          .from("avis_vendeurs")
          .select("*")
          .eq("vendeur_id", vendeurId)
          .order("created_at", { ascending: false }),
      ]);

      const user = resSession.data.session?.user;
      if (user) {
        setUserConnecteId(user.id);
        setUserConnecteNom(
          user.user_metadata?.nom ||
            user.email?.split("@")[0] ||
            "Acheteur DJASSA"
        );
      }

      if (resVendeur.data) setVendeur(resVendeur.data as VendeurBoutique);
      if (resArticles.data) setArticles(resArticles.data as ArticleBoutique[]);
      if (resAvis.data) {
        const listeAvis = resAvis.data as AvisVendeur[];
        setAvis(listeAvis);
        if (user) {
          const monAvis = listeAvis.find((a) => a.auteur_id === user.id);
          if (monAvis) {
            setNoteChoisie(monAvis.note);
            setCommentaireAvis(monAvis.commentaire || "");
          }
        }
      }

      setLoading(false);
    }

    chargerBoutiqueEtAvis();
  }, [vendeurId]);

  function partagerBoutique() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2500);
    }
  }

  async function handlePublierAvis(e: React.FormEvent) {
    e.preventDefault();
    if (!userConnecteId || !vendeurId || userConnecteId === vendeurId) return;

    setEnvoiAvis(true);
    setMsgAvis("");

    const payload = {
      vendeur_id: vendeurId,
      auteur_id: userConnecteId,
      auteur_nom: userConnecteNom,
      note: noteChoisie,
      commentaire: commentaireAvis.trim() || null,
    };

    const { data, error } = await supabase
      .from("avis_vendeurs")
      .upsert([payload], { onConflict: "vendeur_id,auteur_id" })
      .select("*")
      .single();

    if (error) {
      setMsgAvis("❌ Erreur : " + error.message);
    } else if (data) {
      const avisEnregistre = data as AvisVendeur;
      setAvis((prev) => {
        const sansAncien = prev.filter((a) => a.auteur_id !== userConnecteId);
        return [avisEnregistre, ...sansAncien];
      });
      setMsgAvis("✅ Merci ! Votre avis étoilé a bien été publié.");
    }

    setEnvoiAvis(false);
  }
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">
        Chargement de la boutique...
      </div>
    );
  }

  const moyenneNote =
    avis.length > 0
      ? (avis.reduce((acc, item) => acc + item.note, 0) / avis.length).toFixed(
          1
        )
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
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
            {moyenneNote && (
              <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full">
                ⭐ {moyenneNote} / 5 ({avis.length} avis)
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
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-5">
          Articles disponibles ({articles.length})
        </h2>

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
                    <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">
                      {art.titre}
                    </h3>
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
      {/* Section Avis étoilés des acheteurs */}
      <section className="pt-8 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-1">
              ⭐ Noter ce vendeur
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Partagez votre expérience d&apos;achat avec les autres membres DJASSA.
            </p>

            {!userConnecteId ? (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs text-gray-700">
                  Connectez-vous pour laisser une note étoilée à ce vendeur.
                </p>
                <Link
                  href="/connexion"
                  className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Se connecter
                </Link>
              </div>
            ) : userConnecteId === vendeurId ? (
              <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
                Vous consultez votre propre boutique vendeur.
              </p>
            ) : (
              <form onSubmit={handlePublierAvis} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Votre note ({noteChoisie} / 5)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((etoile) => (
                      <button
                        key={etoile}
                        type="button"
                        onClick={() => setNoteChoisie(etoile)}
                        className={`text-2xl transition transform hover:scale-110 ${
                          etoile <= noteChoisie
                            ? "text-amber-400"
                            : "text-gray-300"
                        }`}
                        aria-label={`${etoile} étoile${etoile > 1 ? "s" : ""}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Votre commentaire (optionnel)
                  </label>
                  <textarea
                    rows={3}
                    value={commentaireAvis}
                    onChange={(e) => setCommentaireAvis(e.target.value)}
                    placeholder="Ex: Vendeur sérieux, article conforme à la description..."
                    className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                {msgAvis && (
                  <p
                    className={`text-xs font-bold ${
                      msgAvis.startsWith("✅")
                        ? "text-emerald-700"
                        : "text-red-600"
                    }`}
                  >
                    {msgAvis}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={envoiAvis}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {envoiAvis ? "Envoi..." : "Publier mon avis"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-lg font-black text-gray-900">
            Avis des acheteurs ({avis.length})
          </h2>

          {avis.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center text-sm text-gray-500">
              Aucun avis publié pour ce vendeur pour le moment.
            </div>
          ) : (
            avis.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-gray-900 text-sm">
                    {item.auteur_nom}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>

                <div className="text-amber-400 text-base mt-1">
                  {"★".repeat(item.note)}
                  <span className="text-gray-200">
                    {"★".repeat(5 - item.note)}
                  </span>
                </div>

                {item.commentaire && (
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {item.commentaire}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
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
