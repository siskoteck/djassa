"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { COMMUNES_ABIDJAN, ETATS_ARTICLE } from "@/lib/constantes";

interface Categorie {
  id: number;
  nom: string;
  icone: string | null;
}
export default function PublierAnnoncePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [chargementAuth, setChargementAuth] = useState(true);
  const [categories, setCategories] = useState<Categorie[]>([]);

  const [titre, setTitre] = useState("");
  const [categorieId, setCategorieId] = useState<number>(1);
  const [prix, setPrix] = useState("");
  const [etat, setEtat] = useState(ETATS_ARTICLE[0] || "Occasion - Bon état");
  const [commune, setCommune] = useState("Treichville");
  const [quartier, setQuartier] = useState("");
  const [telephone, setTelephone] = useState("");
  const [description, setDescription] = useState("");

  const [fichiersPhotos, setFichiersPhotos] = useState<File[]>([]);
  const [apercusPhotos, setApercusPhotos] = useState<string[]>([]);
  const [publicationEnCours, setPublicationEnCours] = useState(false);
  const [erreur, setErreur] = useState("");
  useEffect(() => {
    async function initialiser() {
      const [resSession, resCat] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("categories").select("id, nom, icone").order("id"),
      ]);

      const user = resSession.data.session?.user;
      if (user) {
        setUserId(user.id);
        const { data: monProfil } = await supabase
          .from("utilisateurs")
          .select("telephone, commune")
          .eq("id", user.id)
          .maybeSingle();

        if (monProfil?.telephone) setTelephone(monProfil.telephone);
        if (monProfil?.commune) setCommune(monProfil.commune);
      }

      if (resCat.data && resCat.data.length > 0) {
        setCategories(resCat.data as Categorie[]);
        setCategorieId(resCat.data[0].id);
      }

      setChargementAuth(false);
    }

    initialiser();
  }, []);
  function handleSelectionPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const placesRestantes = 8 - fichiersPhotos.length;
    if (placesRestantes <= 0) {
      setErreur("Vous avez déjà atteint la limite de 8 photos.");
      return;
    }

    const nouveauxFichiers = files.slice(0, placesRestantes);
    const nouvellesUrls = nouveauxFichiers.map((file) =>
      URL.createObjectURL(file)
    );

    setFichiersPhotos((prev) => [...prev, ...nouveauxFichiers]);
    setApercusPhotos((prev) => [...prev, ...nouvellesUrls]);
    setErreur("");
    e.target.value = "";
  }

  function retirerPhoto(index: number) {
    setFichiersPhotos((prev) => prev.filter((_, i) => i !== index));
    setApercusPhotos((prev) => prev.filter((_, i) => i !== index));
  }
  async function handlePublier(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    if (!titre.trim()) {
      setErreur("Veuillez indiquer le titre de votre annonce.");
      return;
    }

    setPublicationEnCours(true);
    setErreur("");

    try {
      const urlsPubliques: string[] = [];

      for (let i = 0; i < fichiersPhotos.length; i++) {
        const fichier = fichiersPhotos[i];
        const extension = fichier.name.split(".").pop() || "jpg";
        const cheminFichier = `${userId}/${Date.now()}_${i}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("annonces-photos")
          .upload(cheminFichier, fichier, { upsert: true });

        if (uploadError) {
          throw new Error("Erreur envoi photo : " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("annonces-photos")
          .getPublicUrl(cheminFichier);

        if (urlData?.publicUrl) {
          urlsPubliques.push(urlData.publicUrl);
        }
      }

      const prixNumerique = parseInt(prix.replace(/\D/g, ""), 10) || 0;

      const { data: nouvelleAnnonce, error: insertError } = await supabase
        .from("annonces")
        .insert([
          {
            user_id: userId,
            categorie_id: categorieId,
            titre: titre.trim(),
            description: description.trim() || null,
            prix: prixNumerique,
            etat,
            commune,
            quartier: quartier.trim() || null,
            telephone: telephone.trim(),
            photos: urlsPubliques,
            statut: "active",
          },
        ])
        .select("id")
        .single();

      if (insertError) throw insertError;

      router.push(nouvelleAnnonce ? `/annonces/${nouvelleAnnonce.id}` : "/");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      setErreur(message);
    } finally {
      setPublicationEnCours(false);
    }
  }
  if (chargementAuth) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">
        Chargement...
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-sm">
          <span className="text-4xl">🛍️</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-3">
            Connectez-vous pour vendre sur DJASSA
          </h1>
          <p className="text-sm text-gray-600 mt-2 mb-6">
            La publication d&apos;annonces est 100 % gratuite à Abidjan. Créez
            votre compte en 30 secondes pour gérer vos ventes.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/connexion"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-sm px-6 py-3 rounded-xl transition"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Publier une annonce gratuite
        </h1>
        <p className="text-sm text-gray-600 mt-1 mb-6">
          Ajoutez jusqu&apos;à 8 photos claires pour vendre rapidement à Abidjan.
        </p>

        <form onSubmit={handlePublier} className="space-y-5">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-dashed border-emerald-300">
            <label className="block text-sm font-bold text-gray-900 mb-1">
              📸 Photos de l&apos;article ({fichiersPhotos.length}/8 photos)
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Vous pouvez sélectionner plusieurs photos en une ou plusieurs fois.
            </p>

            {fichiersPhotos.length < 8 && (
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectionPhotos}
                className="block w-full text-xs text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
            )}

            {apercusPhotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {apercusPhotos.map((src, index) => (
                  <div key={src} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Aperçu ${index + 1}`}
                      className="w-full h-24 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => retirerPhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Titre de l&apos;annonce *
            </label>
            <input
              type="text"
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex: iPhone 13 Pro Max 256 Go très propre"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Catégorie *
              </label>
              <select
                value={categorieId}
                onChange={(e) => setCategorieId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icone ? `${cat.icone} ` : ""}
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Prix en FCFA (0 = à débattre)
              </label>
              <input
                type="number"
                min={0}
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                placeholder="Ex: 250000"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                État de l&apos;article
              </label>
              <select
                value={etat}
                onChange={(e) => setEtat(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
              >
                {ETATS_ARTICLE.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Numéro WhatsApp / Téléphone *
              </label>
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="07 00 00 00 00"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Commune *
              </label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm bg-white"
              >
                {COMMUNES_ABIDJAN.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Quartier précis (optionnel)
              </label>
              <input
                type="text"
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                placeholder="Ex: Zone 3, Angré 8e tranche..."
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              Description détaillée
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Caractéristiques, accessoires inclus, possibilités de livraison..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
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
              ? "Envoi des photos et publication..."
              : "🚀 Publier mon annonce maintenant"}
          </button>
        </form>
      </div>
    </div>
  );
}
