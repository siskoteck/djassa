"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface MonAnnonceItem {
  id: string;
  created_at: string;
  titre: string;
  prix: number;
  etat: string;
  commune: string;
  quartier: string | null;
  statut: string;
  booste: boolean;
  photos: string[];
}

export default function MesAnnoncesPage() {
  const router = useRouter();
  const [annonces, setAnnonces] = useState<MonAnnonceItem[]>([]);
  const [filtreStatut, setFiltreStatut] = useState<
    "toutes" | "active" | "vendue"
  >("toutes");
  const [loading, setLoading] = useState(true);

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
            Gérez vos articles en ligne ou marquez-les comme vendus.
          </p>
        </div>

        <Link
          href="/publier"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
        >
          + Publier un nouvel article
        </Link>
      </div>

      {/* Onglets de statut */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {annoncesFiltrees.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between"
            >
              <div className="flex gap-3.5 min-w-0">
                {Array.isArray(ann.photos) && ann.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={String(ann.photos)}
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
                      {ann.statut === "active" ? "🟢 En ligne" : "✅ Vendu"}
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
                    {ann.quartier ? ` (${ann.quartier})` : ""}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <button
                  type="button"
                  onClick={() => toggleStatut(ann.id, ann.statut)}
                  className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition text-center"
                >
                  {ann.statut === "active"
                    ? "Marquer vendu"
                    : "Remettre en ligne"}
                </button>
                <button
                  type="button"
                  onClick={() => supprimerAnnonce(ann.id, ann.titre)}
                  className="text-xs font-bold text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition text-center"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
