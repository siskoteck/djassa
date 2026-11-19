"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface MonAnnonce {
  id: number;
  created_at: string;
  titre: string;
  categorie: string;
  prix: number;
  commune: string;
  statut: "disponible" | "vendu";
  photos?: string[] | null;
}

export default function MesAnnoncesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [annonces, setAnnonces] = useState<MonAnnonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function chargerMesAnnonces() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(user.id);

      const { data: liste, error: fetchError } = await supabase
        .from("annonces")
        .select("id, created_at, titre, categorie, prix, commune, statut, photos")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Erreur chargement mes annonces:", fetchError);
        setError("Impossible de charger vos annonces.");
      } else if (liste) {
        setAnnonces(liste as MonAnnonce[]);
      }

      setLoading(false);
    }

    chargerMesAnnonces();
  }, [router]);

  async function changerStatut(id: number, nouveauStatut: "disponible" | "vendu") {
    if (!userId) return;

    const { error: updateError } = await supabase
      .from("annonces")
      .update({ statut: nouveauStatut })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      alert("Erreur lors de la mise à jour : " + updateError.message);
      return;
    }

    setAnnonces((prev) =>
      prev.map((a) => (a.id === id ? { ...a, statut: nouveauStatut } : a))
    );
  }

  async function supprimerAnnonce(id: number, titre: string) {
    if (!userId) return;
    if (!confirm(`Supprimer définitivement l'annonce "${titre}" ?`)) return;

    const { error: deleteError } = await supabase
      .from("annonces")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      alert("Erreur lors de la suppression : " + deleteError.message);
      return;
    }

    setAnnonces((prev) => prev.filter((a) => a.id !== id));
  }
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        Chargement de vos annonces...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
          <p className="text-gray-600 text-sm mt-1">
            Gérez vos articles en vente sur DJASSA à Abidjan.
          </p>
        </div>

        <Link
          href="/publier"
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-3 rounded-xl text-sm transition text-center shrink-0"
        >
          + Vendre un nouvel article
        </Link>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {annonces.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-800 mb-2">
            Vous n&apos;avez pas encore publié d&apos;annonce
          </p>
          <p className="text-gray-600 mb-6">
            Vendez vos téléphones, meubles, vêtements ou appareils gratuitement.
          </p>
          <Link
            href="/publier"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700"
          >
            + Publier ma première annonce
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {annonces.map((annonce) => {
            const photoPrincipale =
              annonce.photos && annonce.photos.length > 0
                ? annonce.photos
                : null;

            return (
              <div
                key={annonce.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  {photoPrincipale ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPrincipale}
                      alt={annonce.titre}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center p-2 shrink-0">
                      Sans photo
                    </div>
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        href={`/annonces/${annonce.id}`}
                        className="font-bold text-gray-900 hover:text-orange-600"
                      >
                        {annonce.titre}
                      </Link>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          annonce.statut === "disponible"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {annonce.statut === "disponible" ? "En vente" : "Vendu"}
                      </span>
                    </div>

                    <p className="text-orange-600 font-bold text-sm">
                      {Number(annonce.prix).toLocaleString("fr-FR")} FCFA
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {annonce.categorie} • 📍 {annonce.commune}
                    </p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                  {annonce.statut === "disponible" ? (
                    <button
                      onClick={() => changerStatut(annonce.id, "vendu")}
                      className="px-3.5 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200 text-xs font-semibold hover:bg-green-100 transition"
                    >
                      ✓ Marquer vendu
                    </button>
                  ) : (
                    <button
                      onClick={() => changerStatut(annonce.id, "disponible")}
                      className="px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition"
                    >
                      Remettre en vente
                    </button>
                  )}

                  <button
                    onClick={() => supprimerAnnonce(annonce.id, annonce.titre)}
                    className="px-3.5 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
