"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface AnnonceDetail {
  id: string;
  created_at: string;
  user_id: string;
  titre: string;
  description: string | null;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  telephone: string | null;
  photos: string[];
  statut: string;
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

function ContenuDetailAnnonce() {
  const params = useParams();
  const rawId = params?.id;
  const id = decodeURIComponent(
    String(Array.isArray(rawId) ? rawId[0] : rawId ?? "")
  );

  const [annonce, setAnnonce] = useState<AnnonceDetail | null>(null);
  const [vendeur, setVendeur] = useState<VendeurInfo | null>(null);
  const [photoActive, setPhotoActive] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copieLien, setCopieLien] = useState(false);

  useEffect(() => {
    async function chargerAnnonce() {
      if (!id || id === "undefined" || id === "null") {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("annonces")
        .select("*, categories(nom, icone)")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        const detail = data as AnnonceDetail;
        setAnnonce(detail);

        if (detail.user_id) {
          const { data: profilVendeur } = await supabase
            .from("utilisateurs")
            .select("nom, verifie, created_at")
            .eq("id", detail.user_id)
            .maybeSingle();

          if (profilVendeur) {
            setVendeur(profilVendeur as VendeurInfo);
          }
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
          href="/"
          className="inline-block bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-orange-700 transition"
        >
          ← Retour aux bonnes affaires
        </Link>
      </div>
    );
  }

  const photos = Array.isArray(annonce.photos) ? annonce.photos : [];
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="text-sm font-bold text-gray-600 hover:text-orange-600 transition"
        >
          ← Retour aux annonces
        </Link>

        <button
          type="button"
          onClick={copierLienAnnonce}
          className="text-xs font-bold bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-3.5 py-2 rounded-xl transition"
        >
          {copieLien ? "✅ Lien copié !" : "🔗 Partager l'annonce"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Gauche : Galerie photos (7 colonnes) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm aspect-[4/3] relative flex items-center justify-center">
            {photos.length > 0 ? (
              <a
                href={photos[photoActive] || photos[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[photoActive] || photos[0]}
                  alt={annonce.titre}
                  className="w-full h-full object-contain bg-gray-900"
                />
              </a>
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

          {/* Miniatures des photos (jusqu'à 8) */}
          {photos.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {photos.map((url, index) => (
                <button
                  key={url + index}
                  type="button"
                  onClick={() => setPhotoActive(index)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition ${
                    photoActive === index
                      ? "border-orange-600 ring-2 ring-orange-200"
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

          {/* Description détaillée (affichée sous les photos sur grand écran) */}
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
        {/* Colonne Droite : Infos prix, vendeur & contact (5 colonnes) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {annonce.categories && (
                <span className="bg-orange-100 text-orange-800 text-xs font-extrabold px-3 py-1 rounded-full">
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

            <p className="text-3xl font-black text-orange-600 mt-3">
              {formaterPrixFCFA(annonce.prix)}
            </p>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-sm text-gray-600">
              <p>
                📍 <strong className="text-gray-900">{annonce.commune}</strong>
                {annonce.quartier ? ` (${annonce.quartier})` : ""}
              </p>
              <p className="text-xs text-gray-400">
                Publiée le{" "}
                {new Date(annonce.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Boutons de contact direct */}
            {annonce.telephone && (
              <div className="mt-6 space-y-2.5">
                <a
                  href={genererLienWhatsApp(annonce.telephone, annonce.titre)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-5 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-sm"
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

          {/* Carte Vendeur */}
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
              </div>
              {vendeur?.verifie && (
                <span className="bg-green-100 text-green-800 text-xs font-extrabold px-3 py-1 rounded-full">
                  ✓ Vendeur vérifié
                </span>
              )}
            </div>
          </div>

          {/* Conseils anti-arnaque DJASSA */}
          <div className="bg-amber-50 rounded-3xl border border-amber-200 p-5">
            <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-1.5">
              <span>🛡️</span> Conseils de sécurité DJASSA
            </h3>
            <ul className="text-xs text-amber-900 space-y-1.5 mt-2 list-disc pl-4">
              <li>
                Ne versez jamais d&apos;acompte (Wave, Orange Money, MTN) avant
                d&apos;avoir vu et testé l&apos;article en main propre.
              </li>
              <li>
                Privilégiez les rencontres en journée dans un lieu public animé
                (centre commercial, station-service, carrefour).
              </li>
              <li>
                Vérifiez le bon fonctionnement et la facture d&apos;origine pour
                les téléphones et appareils électroniques.
              </li>
            </ul>
          </div>
        </div>
      </div>
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
