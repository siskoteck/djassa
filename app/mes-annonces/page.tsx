"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMMUNES_ABIDJAN, ETATS_ARTICLE } from "@/lib/constantes";

interface MonAnnonceItem {
  id: string;
  created_at: string;
  titre: string;
  description: string | null;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  statut: string;
  booste: boolean;
  vues?: number;
  photos: string[];
}

export default function MesAnnoncesPage() {
  const router = useRouter();
  const [annonces, setAnnonces] = useState<MonAnnonceItem[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<
    "toutes" | "active" | "vendue"
  >("toutes");
  const [loading, setLoading] = useState(true);

  const [annonceEnEdition, setAnnonceEnEdition] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState("");
  const [editPrix, setEditPrix] = useState("");
  const [editEtat, setEditEtat] = useState("");
  const [editCommune, setEditCommune] = useState("");
  const [editQuartier, setEditQuartier] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    async function chargerMesAnnonces() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.replace("/connexion");
        return;
      }

      const { data: liste } = await supabase
        .from("annonces")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (liste) {
        setAnnonces(liste as MonAnnonceItem[]);
      }
      setLoading(false);
    }

    chargerMesAnnonces();
  }, [router]);

  function ouvrirEdition(ann: MonAnnonceItem) {
    setAnnonceEnEdition(ann.id);
    setEditTitre(ann.titre);
    setEditPrix(String(ann.prix || 0));
    setEditEtat(ann.etat || "Occasion - Bon état");
    setEditCommune(ann.commune || "Treichville");
    setEditQuartier(ann.quartier || "");
    setEditDescription(ann.description || "");
  }

  async function enregistrerModification(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (!editTitre.trim()) return;

    setSavingEdit(true);
    const prixNumerique = parseInt(editPrix.replace(/\D/g, ""), 10) || 0;

    const miseAJour = {
      titre: editTitre.trim(),
      prix: prixNumerique,
      etat: editEtat,
      commune: editCommune,
      quartier: editQuartier.trim() || null,
      description: editDescription.trim() || null,
    };

    const { error } = await supabase
      .from("annonces")
      .update(miseAJour)
      .eq("id", id);

    if (!error) {
      setAnnonces((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...miseAJour } : a))
      );
      setAnnonceEnEdition(null);
    } else {
      alert("Erreur lors de la modification : " + error.message);
    }
    setSavingEdit(false);
  }

  async function toggleStatut(id: string, statutActuel: string) {
    const nouveauStatut = statutActuel === "active" ? "vendue" : "active";
    const { error } = await supabase
      .from("annonces")
      .update({ statut: nouveauStatut })
      .eq("id", id);

    if (!error) {
      setAnnonces((prev) =>
        prev.map((a) => (a.id === id ? { ...a, statut: nouveauStatut } : a))
      );
    }
  }

  async function supprimerAnnonce(id: string, titre: string) {
    if (!confirm(`Supprimer définitivement l'annonce "${titre}" ?`)) return;
    const { error } = await supabase.from("annonces").delete().eq("id", id);
    if (!error) {
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    }
  }
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        Chargement de vos annonces...
      </div>
    );
  }

  const annoncesFiltrees = annonces.filter((a) => {
    if (filtreStatut === "toutes") return true;
    return a.statut === filtreStatut;
  });

  const nbActives = annonces.filter((a) => a.statut === "active").length;
  const nbVendues = annonces.filter((a) => a.statut === "vendue").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            📦 Mes annonces ({annonces.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Modifiez vos prix, suivez vos vues ou marquez vos articles comme vendus.
          </p>
        </div>

        <Link
          href="/publier"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          + Publier un nouvel article
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFiltreStatut("toutes")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            filtreStatut === "toutes"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          Toutes ({annonces.length})
        </button>
        <button
          type="button"
          onClick={() => setFiltreStatut("active")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            filtreStatut === "active"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          🟢 En ligne ({nbActives})
        </button>
        <button
          type="button"
          onClick={() => setFiltreStatut("vendue")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            filtreStatut === "vendue"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          ✅ Vendues ({nbVendues})
        </button>
      </div>

      {annoncesFiltrees.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
          <p className="text-base font-bold text-gray-900 mb-2">
            Aucune annonce dans cette catégorie
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mb-6">
            Publiez gratuitement vos articles pour toucher des acheteurs à
            Abidjan.
          </p>
          <Link
            href="/publier"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition"
          >
            + Vendre un article maintenant
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {annoncesFiltrees.map((ann) => {
            const estEnCoursEdition = annonceEnEdition === ann.id;

            return (
              <div
                key={ann.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm"
              >
                {estEnCoursEdition ? (
                  <form
                    onSubmit={(e) => enregistrerModification(e, ann.id)}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h2 className="text-sm font-extrabold text-emerald-700">
                        ✏️ Modifier l&apos;annonce
                      </h2>
                      <button
                        type="button"
                        onClick={() => setAnnonceEnEdition(null)}
                        className="text-xs font-bold text-gray-500 hover:text-gray-800"
                      >
                        ✕ Annuler
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Titre *
                        </label>
                        <input
                          type="text"
                          required
                          value={editTitre}
                          onChange={(e) => setEditTitre(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Prix (FCFA)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={editPrix}
                          onChange={(e) => setEditPrix(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          État
                        </label>
                        <select
                          value={editEtat}
                          onChange={(e) => setEditEtat(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white"
                        >
                          {ETATS_ARTICLE.map((item: string) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Commune
                        </label>
                        <select
                          value={editCommune}
                          onChange={(e) => setEditCommune(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-white"
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
                          Quartier
                        </label>
                        <input
                          type="text"
                          value={editQuartier}
                          onChange={(e) => setEditQuartier(e.target.value)}
                          placeholder="Ex: Zone 3"
                          className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAnnonceEnEdition(null)}
                        className="text-xs font-bold px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={savingEdit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition disabled:opacity-50"
                      >
                        {savingEdit ? "Enregistrement..." : "💾 Enregistrer"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex gap-3.5 min-w-0">
                      {Array.isArray(ann.photos) && ann.photos.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={String(ann.photos[0])}
                          alt={ann.titre}
                          className="w-24 h-24 rounded-xl object-cover border border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0">
                          Aucune photo
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                              ann.statut === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {ann.statut === "active"
                              ? "🟢 En ligne"
                              : "✅ Vendu"}
                          </span>
                          {ann.booste && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              ⭐ À la une
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/annonces/${ann.id}`}
                          className="font-bold text-gray-900 text-sm hover:text-emerald-700 line-clamp-1 block"
                        >
                          {ann.titre}
                        </Link>

                        <p className="text-emerald-700 font-black text-sm mt-0.5">
                          {ann.prix > 0
                            ? ann.prix.toLocaleString("fr-FR") + " FCFA"
                            : "Prix à débattre"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          📍 {ann.commune}
                          {ann.quartier ? ` (${ann.quartier})` : ""} •{" "}
                          <span className="font-bold text-emerald-700">
                            👁️ {ann.vues || 0} vue{(ann.vues || 0) > 1 ? "s" : ""}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-col justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                      <button
                        type="button"
                        onClick={() => ouvrirEdition(ann)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition text-center"
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatut(ann.id, ann.statut)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 transition text-center"
                      >
                        {ann.statut === "active"
                          ? "Marquer vendu"
                          : "Remettre en ligne"}
                      </button>
                      <button
                        type="button"
                        onClick={() => supprimerAnnonce(ann.id, ann.titre)}
                        className="text-xs font-bold text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50 transition text-center"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
