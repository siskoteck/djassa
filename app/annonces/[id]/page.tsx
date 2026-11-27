"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { basculerFavoriId, obtenirFavorisIds } from "@/lib/favoris";

interface AnnonceDetail {
  id: string;
  created_at: string;
  user_id: string;
  categorie_id: number | null;
  titre: string;
  description: string | null;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  telephone: string | null;
  photos: string[];
  video_url?: string | null;
  statut: string;
  vues?: number;
  categories?: {
    nom: string;
    icone: string | null;
  } | null;
}

interface VendeurInfo {
  nom: string;
  verifie: boolean;
  created_at?: string;
}

interface AnnonceSimilaire {
  id: string;
  titre: string;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  photos: string[];
}

function ContenuDetailAnnonce() {
  const params = useParams();
  const rawId = params?.id;
  const id = decodeURIComponent(
    String(Array.isArray(rawId) ? rawId : rawId ?? "")
  );

  const [annonce, setAnnonce] = useState<AnnonceDetail | null>(null);
  const [vendeur, setVendeur] = useState<VendeurInfo | null>(null);
  const [noteVendeur, setNoteVendeur] = useState<{
    moyenne: string;
    total: number;
  } | null>(null);
  const [similaires, setSimilaires] = useState<AnnonceSimilaire[]>([]);
  const [nbVues, setNbVues] = useState<number>(0);
  const [photoActive, setPhotoActive] = useState<number>(0);
  const [visionneuseOuverte, setVisionneuseOuverte] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copieLien, setCopieLien] = useState(false);
  const [estFavori, setEstFavori] = useState(false);
  const [signale, setSignale] = useState(false);
  useEffect(() => {
    async function chargerAnnonce() {
      if (!id || id === "undefined" || id === "null") {
        setLoading(false);
        return;
      }

      setEstFavori(obtenirFavorisIds().includes(id));

      let { data, error } = await supabase
        .from("annonces")
        .select("*, categories(nom, icone)")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        const resSimple = await supabase
          .from("annonces")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        data = resSimple.data;
        error = resSimple.error;
      }

      if (!error && data) {
        const detail = data as AnnonceDetail;
        setAnnonce(detail);
        setNbVues(detail.vues || 0);

        const cleVue = `djassa_vu_${detail.id}`;
        if (typeof window !== "undefined" && !sessionStorage.getItem(cleVue)) {
          sessionStorage.setItem(cleVue, "1");
          supabase
            .rpc("incrementer_vue_annonce", { annonce_uuid: detail.id })
            .then(({ data: vuesMaj }) => {
              if (typeof vuesMaj === "number") {
                setNbVues(vuesMaj);
              }
            });
        }

        const promesseVendeur = detail.user_id
          ? supabase
              .from("utilisateurs")
              .select("nom, verifie, created_at")
              .eq("id", detail.user_id)
              .maybeSingle()
          : Promise.resolve({ data: null });

        const promesseNotes = detail.user_id
          ? supabase
              .from("avis_vendeurs")
              .select("note")
              .eq("vendeur_id", detail.user_id)
          : Promise.resolve({ data: null });

        const promesseSimilaires = supabase
          .from("annonces")
          .select("id, titre, prix, etat, commune, quartier, photos, categorie_id")
          .eq("statut", "active")
          .neq("id", detail.id)
          .or(
            detail.categorie_id
              ? `categorie_id.eq.${detail.categorie_id},commune.eq.${detail.commune}`
              : `commune.eq.${detail.commune}`
          )
          .order("created_at", { ascending: false })
          .limit(8);

        const [resVendeur, resNotes, resSim] = await Promise.all([
          promesseVendeur,
          promesseNotes,
          promesseSimilaires,
        ]);

        if (resVendeur.data) {
          setVendeur(resVendeur.data as VendeurInfo);
        }

        if (resNotes.data && resNotes.data.length > 0) {
          const somme = resNotes.data.reduce(
            (acc, item) => acc + Number(item.note),
            0
          );
          setNoteVendeur({
            moyenne: (somme / resNotes.data.length).toFixed(1),
            total: resNotes.data.length,
          });
        }

        if (resSim.data) {
          const triees = [...resSim.data].sort((a, b) => {
            const scoreA =
              (a.categorie_id === detail.categorie_id ? 2 : 0) +
              (a.commune === detail.commune ? 1 : 0);
            const scoreB =
              (b.categorie_id === detail.categorie_id ? 2 : 0) +
              (b.commune === detail.commune ? 1 : 0);
            return scoreB - scoreA;
          });
          setSimilaires(triees.slice(0, 4) as AnnonceSimilaire[]);
        }
      }

      setLoading(false);
    }

    chargerAnnonce();
  }, [id]);

  function formaterPrixFCFA(prix: number) {
    if (!prix || prix <= 0) return "Prix à débattre";
    return prix.toLocaleString("fr-FR") + " FCFA";
  }

  function genererLienWhatsApp(tel: string | null, titreAnnonce: string) {
    let chiffres = (tel || "").replace(/\D/g, "");
    if (chiffres.length === 10 && chiffres.startsWith("0")) {
      chiffres = "225" + chiffres;
    } else if (chiffres.startsWith("00225")) {
      chiffres = chiffres.slice(2);
    }
    const urlActuelle =
      typeof window !== "undefined" ? window.location.href : "";
    const texte = encodeURIComponent(
      `Bonjour, j'ai vu votre annonce "${titreAnnonce}" sur DJASSA Abidjan et je suis intéressé(e).\nLien : ${urlActuelle}`
    );
    return `https://wa.me{chiffres}?text=${texte}`;
  }

  function copierLienAnnonce() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopieLien(true);
      setTimeout(() => setCopieLien(false), 2500);
    }
  }

  function toggleFavori() {
    if (!annonce) return;
    const nouveaux = basculerFavoriId(annonce.id);
    setEstFavori(nouveaux.includes(annonce.id));
  }

  async function signalerAnnonce() {
    if (!annonce || signale) return;
    const motif = prompt(
      "Pourquoi signalez-vous cette annonce ? (Ex: Déjà vendue, arnaque, faux numéro...)"
    );
    if (!motif || !motif.trim()) return;

    await supabase.from("messages_contact").insert([
      {
        nom: "Signalement Visiteur",
        sujet: "Signaler une annonce",
        message: `Annonce signalée : "${annonce.titre}" (ID: ${annonce.id})\nMotif : ${motif.trim()}`,
      },
    ]);
    setSignale(true);
    alert("Merci ! Votre signalement a été transmis à l'administrateur DJASSA.");
  }
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        Chargement de l&apos;annonce...
      </div>
    );
  }

  if (!annonce) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Annonce introuvable ou déjà vendue
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Cet article n&apos;est plus disponible sur DJASSA.
        </p>
        <Link
          href="/annonces"
          className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-emerald-700 transition"
        >
          ← Retour aux bonnes affaires
        </Link>
      </div>
    );
  }

  const photos = Array.isArray(annonce.photos) ? annonce.photos : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link
          href="/annonces"
          className="text-sm font-bold text-gray-600 hover:text-emerald-700 transition"
        >
          ← Retour au catalogue
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFavori}
            className={`text-xs font-bold border px-3.5 py-2 rounded-xl transition ${
              estFavori
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-white border-gray-300 hover:bg-gray-50 text-gray-800"
            }`}
          >
            {estFavori ? "❤️ Sauvegardé" : "🤍 Favoris"}
          </button>

          <button
            type="button"
            onClick={copierLienAnnonce}
            className="text-xs font-bold bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-2 rounded-xl transition"
          >
            {copieLien ? "✅ Lien copié !" : "🔗 Partager"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm aspect-[4/3] relative flex items-center justify-center">
            {photos.length > 0 ? (
              <button type="button" onClick={() => setVisionneuseOuverte(true)} title="Agrandir la photo" className="w-full h-full block cursor-zoom-in relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={String(photos[photoActive] || photos)}
                  alt={annonce.titre}
                  className="w-full h-full object-contain bg-gray-900"
                />
                  <span className="absolute top-3 right-3 bg-black/65 text-white text-[11px] font-bold px-2.5 py-1 rounded-full opacity-90 group-hover:scale-105 transition">🔍 Agrandir</span>
                </button>
            ) : (
              <div className="text-gray-400 text-sm font-medium">
                Aucune photo fournie par le vendeur
              </div>
            )}

            {photos.length > 1 && (
              <span className="absolute bottom-3 right-3 bg-black/75 text-white text-xs font-bold px-3 py-1 rounded-full">
                Photo {photoActive + 1} / {photos.length}
              </span>
            )}
          </div>

          {photos.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {photos.map((url, index) => (
                <button
                  key={url + index}
                  type="button"
                  onClick={() => setPhotoActive(index)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                    photoActive === index
                      ? "border-emerald-600 ring-2 ring-emerald-200"
                      : "border-gray-200 opacity-75 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Miniature ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          {annonce.video_url && (
            <div className="bg-white rounded-3xl border border-emerald-200 p-5 shadow-sm mt-6">
              <h2 className="text-base font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎥</span> Vidéo de démonstration de l&apos;article
              </h2>
              <video
                src={annonce.video_url}
                controls
                playsInline
                preload="metadata"
                className="w-full max-h-[420px] rounded-2xl bg-black"
              />
            </div>
          )}

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm mt-6">
            <h2 className="text-lg font-extrabold text-gray-900 mb-3">
              Description de l&apos;article
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {annonce.description ||
                "Aucune description supplémentaire renseignée par le vendeur."}
            </p>
          </div>
        </div>
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {annonce.categories && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
                  {annonce.categories.icone ? `${annonce.categories.icone} ` : ""}
                  {annonce.categories.nom}
                </span>
              )}
              <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                {annonce.etat}
              </span>
            </div>

            <h1 className="text-2xl font-black text-gray-900 leading-snug">
              {annonce.titre}
            </h1>

            <p className="text-3xl font-black text-emerald-700 mt-3">
              {formaterPrixFCFA(annonce.prix)}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm text-gray-600">
              <p>
                📍 <strong className="text-gray-900">{annonce.commune}</strong>
                {annonce.quartier ? ` (${annonce.quartier})` : ""}
              </p>
              <p className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                <span>
                  Publiée le{" "}
                  {new Date(annonce.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span>•</span>
                <span className="font-bold text-emerald-700">
                  👁️ Vu {nbVues} fois
                </span>
              </p>
            </div>

            {annonce.telephone && (
              <div className="mt-6 space-y-2.5">
                <a
                  href={genererLienWhatsApp(annonce.telephone, annonce.titre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <span>💬</span> Discuter sur WhatsApp
                </a>

                <a
                  href={"tel:" + annonce.telephone.replace(/\s+/g, "")}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-5 rounded-2xl text-sm flex items-center justify-center gap-2 transition"
                >
                  <span>📞</span> Appeler ({annonce.telephone})
                </a>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-gray-400 mb-2">
              Informations vendeur
            </p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-extrabold text-gray-900 text-base">
                  {vendeur?.nom || "Vendeur DJASSA Abidjan"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Zone : {annonce.commune}
                </p>
                {noteVendeur && (
                  <p className="text-xs font-extrabold text-amber-700 mt-1">
                    ⭐ {noteVendeur.moyenne} / 5 ({noteVendeur.total} avis)
                  </p>
                )}
              </div>
              {vendeur?.verifie && (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
                  ✓ Vendeur vérifié
                </span>
              )}
            </div>

            {annonce.user_id && (
              <Link
                href={`/boutique/${annonce.user_id}`}
                className="mt-4 block w-full text-center border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2.5 rounded-xl transition"
              >
                🏪 Voir la boutique &amp; noter ce vendeur →
              </Link>
            )}
          </div>

          <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-5">
            <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-1.5">
              <span>🛡️</span> Conseils de sécurité DJASSA
            </h3>
            <ul className="text-xs text-emerald-900 space-y-1.5 mt-2 list-disc pl-4">
              <li>
                Ne versez jamais d&apos;acompte (Wave, Orange Money, MTN) avant
                d&apos;avoir vu et testé l&apos;article en main propre.
              </li>
              <li>
                Privilégiez les rencontres en journée dans un lieu public animé.
              </li>
            </ul>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={signalerAnnonce}
              disabled={signale}
              className="text-xs font-bold text-gray-500 hover:text-red-600 transition"
            >
              {signale
                ? "🚩 Annonce signalée à l'équipe DJASSA"
                : "🚩 Signaler cette annonce"}
            </button>
          </div>
        </div>
      </div>
      {similaires.length > 0 && (
        <section className="mt-14 pt-10 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Annonces similaires à Abidjan
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Autres articles dans la même catégorie ou à {annonce.commune}
              </p>
            </div>
            <Link
              href="/annonces"
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:underline"
            >
              Voir tout le catalogue →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similaires.map((sim) => (
              <Link
                key={sim.id}
                href={`/annonces/${sim.id}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-400 transition flex flex-col"
              >
                <div className="h-44 bg-gray-100 relative">
                  {Array.isArray(sim.photos) && sim.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={String(sim.photos[0])}
                      alt={sim.titre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Aucune photo
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 bg-white/95 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    {sim.etat}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-emerald-700 font-black text-base">
                      {formaterPrixFCFA(sim.prix)}
                    </p>
                    <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">
                      {sim.titre}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                    📍 {sim.commune}
                    {sim.quartier ? ` (${sim.quartier})` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    
      {/* Visionneuse plein écran (Lightbox) */}
      {visionneuseOuverte && photos.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setVisionneuseOuverte(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={() => setVisionneuseOuverte(false)}
            aria-label="Fermer l'aperçu"
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white text-xl font-black flex items-center justify-center transition"
          >
            ✕
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoActive((prev) => (prev - 1 + photos.length) % photos.length);
                }}
                aria-label="Photo précédente"
                className="absolute left-3 sm:left-6 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white text-2xl font-black flex items-center justify-center transition"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoActive((prev) => (prev + 1) % photos.length);
                }}
                aria-label="Photo suivante"
                className="absolute right-3 sm:right-6 z-20 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 text-white text-2xl font-black flex items-center justify-center transition"
              >
                ›
              </button>
            </>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-5xl max-h-[88vh] flex flex-col items-center gap-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={String(photos[photoActive] || photos[0])}
              alt={annonce.titre}
              className="max-h-[78vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />
            <span className="text-xs font-bold text-gray-200 bg-white/15 px-3.5 py-1 rounded-full">
              Photo {photoActive + 1} / {photos.length} • Touchez à côté pour fermer
            </span>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DetailAnnoncePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
          Chargement de la fiche produit...
        </div>
      }
    >
      <ContenuDetailAnnonce />
    </Suspense>
  );
}
