"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMMUNES_ABIDJAN, ETATS_ARTICLE } from "@/lib/constantes";

interface Categorie {
  id: number;
  nom: string;
  icone: string | null;
}

export default function PublierAnnonceDjassaPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Categorie[]>([]);

  const [titre, setTitre] = useState("");
  const [categorieId, setCategorieId] = useState<string>("");
  const [prix, setPrix] = useState("");
  const [etat, setEtat] = useState("Occasion - Bon état");
  const [commune, setCommune] = useState("Treichville");
  const [quartier, setQuartier] = useState("");
  const [telephone, setTelephone] = useState("");
  const [description, setDescription] = useState("");

  const [fichiersPhotos, setFichiersPhotos] = useState<File[]>([]);
  const [apercusPhotos, setApercusPhotos] = useState<string[]>([]);

  const [videoFichier, setVideoFichier] = useState<File | null>(null);
  const [videoApercu, setVideoApercu] = useState<string>("");

  const [publicationEnCours, setPublicationEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    async function initPublication() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.replace("/connexion");
        return;
      }

      setUserId(user.id);

      const [resCat, resProfil] = await Promise.all([
        supabase.from("categories").select("id, nom, icone").order("id"),
        supabase
          .from("utilisateurs")
          .select("telephone, commune")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

      if (resCat.data) {
        setCategories(resCat.data as Categorie[]);
        if (resCat.data.length > 0) {
          setCategorieId(String(resCat.data[0].id));
        }
      }

      if (resProfil.data) {
        if (resProfil.data.telephone) setTelephone(resProfil.data.telephone);
        if (resProfil.data.commune) setCommune(resProfil.data.commune);
      } else if (user.user_metadata?.telephone) {
        setTelephone(user.user_metadata.telephone);
      }
    }

    initPublication();
  }, [router]);
  function handleSelectionPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const selectionnes = Array.from(e.target.files || []);
    if (selectionnes.length === 0) return;

    const restants = 8 - fichiersPhotos.length;
    if (restants <= 0) {
      alert("Vous avez déjà atteint le maximum de 8 photos.");
      return;
    }

    const ajouts = selectionnes.slice(0, restants);
    const nouveauxFichiers = [...fichiersPhotos, ...ajouts];
    const nouveauxApercus = [
      ...apercusPhotos,
      ...ajouts.map((f) => URL.createObjectURL(f)),
    ];

    setFichiersPhotos(nouveauxFichiers);
    setApercusPhotos(nouveauxApercus);
    e.target.value = "";
  }

  function retirerPhoto(index: number) {
    URL.revokeObjectURL(apercusPhotos[index]);
    setFichiersPhotos((prev) => prev.filter((_, i) => i !== index));
    setApercusPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSelectionVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    if (fichier.size > 30 * 1024 * 1024) {
      alert("La vidéo est trop lourde (30 Mo maximum).");
      return;
    }

    if (videoApercu) URL.revokeObjectURL(videoApercu);
    setVideoFichier(fichier);
    setVideoApercu(URL.createObjectURL(fichier));
    e.target.value = "";
  }

  function retirerVideo() {
    if (videoApercu) URL.revokeObjectURL(videoApercu);
    setVideoFichier(null);
    setVideoApercu("");
  }

  async function handlePublier(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    if (!titre.trim()) {
      setErreur("Veuillez saisir le titre de votre article.");
      return;
    }

    setPublicationEnCours(true);
    setErreur("");

    try {
      const urlsPhotos: string[] = [];

      for (let i = 0; i < fichiersPhotos.length; i++) {
        const fichier = fichiersPhotos[i];
        const ext = fichier.name.split(".").pop() || "jpg";
        const chemin = `${userId}/${Date.now()}_${i}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("annonces-photos")
          .upload(chemin, fichier, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadErr) {
          throw new Error("Erreur envoi photo : " + uploadErr.message);
        }

        const { data: urlData } = supabase.storage
          .from("annonces-photos")
          .getPublicUrl(chemin);

        urlsPhotos.push(urlData.publicUrl);
      }

      let videoUrlFinale: string | null = null;

      if (videoFichier) {
        const extVid = videoFichier.name.split(".").pop() || "mp4";
        const cheminVid = `${userId}/vid_${Date.now()}.${extVid}`;

        const { error: vidErr } = await supabase.storage
          .from("annonces-photos")
          .upload(cheminVid, videoFichier, {
            cacheControl: "3600",
            upsert: true,
          });

        if (vidErr) {
          throw new Error("Erreur envoi vidéo : " + vidErr.message);
        }

        const { data: vidUrlData } = supabase.storage
          .from("annonces-photos")
          .getPublicUrl(cheminVid);

        videoUrlFinale = vidUrlData.publicUrl;
      }

      const prixNumerique = parseInt(prix.replace(/\D/g, ""), 10) || 0;

      const { data: inseree, error: insertErr } = await supabase
        .from("annonces")
        .insert([
          {
            user_id: userId,
            categorie_id: categorieId ? Number(categorieId) : null,
            titre: titre.trim(),
            description: description.trim() || null,
            prix: prixNumerique,
            etat,
            commune,
            quartier: quartier.trim() || null,
            telephone: telephone.trim(),
            photos: urlsPhotos,
            video_url: videoUrlFinale,
            statut: "active",
          },
        ])
        .select("id")
        .single();

      if (insertErr) {
        throw new Error(insertErr.message);
      }

      router.push(`/annonces/${inseree.id}`);
      router.refresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la publication.";
      setErreur(msg);
      setPublicationEnCours(false);
    }
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
          PUBLICATION GRATUITE • ABIDJAN
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
          Vendre un article sur <span className="text-emerald-600">DJASSA</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1 mb-6">
          Ajoutez des photos nettes et une courte vidéo pour vendre encore plus
          vite.
        </p>

        <form onSubmit={handlePublier} className="space-y-5">
          {/* Section Photos (jusqu'à 8) */}
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-gray-900">
                📸 Photos de l&apos;article ({fichiersPhotos.length}/8)
              </label>
              {fichiersPhotos.length < 8 && (
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Cliquez ci-dessous pour ajouter
                </span>
              )}
            </div>

            {fichiersPhotos.length < 8 && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectionPhotos}
                className="block w-full text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
            )}

            {apercusPhotos.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-4">
                {apercusPhotos.map((src, idx) => (
                  <div
                    key={src}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => retirerPhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Vidéo de démonstration (optionnel - 30 Mo max) */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-gray-900">
                🎥 Vidéo de présentation (optionnel — 30 Mo max)
              </label>
              {videoFichier && (
                <button
                  type="button"
                  onClick={retirerVideo}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Supprimer la vidéo
                </button>
              )}
            </div>

            {!videoApercu ? (
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={handleSelectionVideo}
                className="block w-full text-xs text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
            ) : (
              <video
                src={videoApercu}
                controls
                className="w-full max-h-64 rounded-xl bg-black mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Titre de l&apos;annonce *
            </label>
            <input
              type="text"
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: iPhone 13 Pro Max 256 Go très propre"
              className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                value={categorieId}
                onChange={(e) => setCategorieId(e.target.value)}
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icone ? `${c.icone} ` : ""}
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Prix (FCFA)
              </label>
              <input
                type="number"
                min={0}
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                placeholder="Ex: 250000 (0 = à débattre)"
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                État *
              </label>
              <select
                value={etat}
                onChange={(e) => setEtat(e.target.value)}
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm bg-white"
              >
                {ETATS_ARTICLE.map((item: string) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Commune *
              </label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm bg-white"
              >
                {COMMUNES_ABIDJAN.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Quartier / Repère
              </label>
              <input
                type="text"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                placeholder="Ex: Rue 12, Zone 3, Angré..."
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Téléphone WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="07 00 00 00 00"
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Description détaillée
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez les caractéristiques, accessoires inclus, livraison possible..."
              className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          {erreur && (
            <div className="text-red-600 text-xs bg-red-50 border border-red-200 p-3 rounded-xl">
              {erreur}
            </div>
          )}

          <button
            type="submit"
            disabled={publicationEnCours}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm transition disabled:opacity-50 shadow-sm"
          >
            {publicationEnCours
              ? "Publication en cours (envoi photos/vidéo)..."
              : "🚀 Publier mon annonce maintenant"}
          </button>
        </form>
      </div>
    </div>
  );
}
