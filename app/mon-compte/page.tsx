"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formaterPrixFCFA } from "@/lib/utils";
import { ProfilVendeurForm } from "@/components/compte/ProfilVendeurForm";
import { SecuriteCompteVendeur } from "@/components/compte/SecuriteCompteVendeur";

interface AnnonceVendeur {
  id: string;
  created_at: string;
  titre: string;
  prix: number;
  commune: string;
  statut: string;
  photos: string[];
}

export default function MonCompteDjassaPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [emailUser, setEmailUser] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [commune, setCommune] = useState("Treichville");
  const [mesAnnonces, setMesAnnonces] = useState<AnnonceVendeur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function chargerEspaceVendeur() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.replace("/connexion");
        return;
      }

      setUserId(user.id);
      const emailActuel = (user.email || "").trim().toLowerCase();
      setEmailUser(emailActuel);

      const [resProfil, resAnnonces] = await Promise.all([
        supabase.from("utilisateurs").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("annonces")
          .select("id, created_at, titre, prix, commune, statut, photos")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (resProfil.data) {
        setNom(resProfil.data.nom || "");
        setTelephone(resProfil.data.telephone || "");
        setCommune(resProfil.data.commune || "Treichville");
      } else {
        setNom(user.user_metadata?.nom || "");
        setTelephone(user.user_metadata?.telephone || "");
        setCommune(user.user_metadata?.commune || "Treichville");
      }

      if (resAnnonces.data) {
        setMesAnnonces(resAnnonces.data as AnnonceVendeur[]);
      }
      setLoading(false);
    }

    chargerEspaceVendeur();
  }, [router]);

  async function toggleStatutAnnonce(id: string, statutActuel: string) {
    const nouveauStatut = statutActuel === "active" ? "vendue" : "active";
    const { error } = await supabase
      .from("annonces")
      .update({ statut: nouveauStatut })
      .eq("id", id);

    if (!error) {
      setMesAnnonces((prev) =>
        prev.map((a) => (a.id === id ? { ...a, statut: nouveauStatut } : a))
      );
    }
  }

  async function supprimerAnnonce(id: string, titre: string) {
    if (!confirm(`Supprimer définitivement l'annonce "${titre}" ?`)) return;
    const { error } = await supabase.from("annonces").delete().eq("id", id);
    if (!error) {
      setMesAnnonces((prev) => prev.filter((a) => a.id !== id));
    }
  }

  async function handleDeconnexion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-44 bg-gray-100 rounded-3xl" />
        <div className="h-56 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Mon espace vendeur DJASSA
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{emailUser}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/publier"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition"
          >
            + Nouvelle annonce
          </Link>
          <button
            type="button"
            onClick={handleDeconnexion}
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {userId && (
        <ProfilVendeurForm
          userId={userId}
          emailUser={emailUser}
          nomInitial={nom}
          telephoneInitial={telephone}
          communeInitiale={commune}
        />
      )}

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-gray-900">
            Mes annonces publiées ({mesAnnonces.length})
          </h2>
          <Link
            href="/mes-annonces"
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Gérer et modifier mes annonces →
          </Link>
        </div>

        {mesAnnonces.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            Vous n&apos;avez pas encore publié d&apos;annonce.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {mesAnnonces.map((ann) => (
              <div
                key={ann.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {Array.isArray(ann.photos) && ann.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={String(ann.photos)}
                      alt={ann.titre}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 shrink-0">
                      Sans photo
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          ann.statut === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {ann.statut === "active" ? "En ligne" : "Vendu"}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        📍 {ann.commune}
                      </span>
                    </div>

                    <Link
                      href={`/annonces/${ann.id}`}
                      className="font-bold text-gray-900 text-sm hover:text-emerald-700 truncate block"
                    >
                      {ann.titre}
                    </Link>
                    <p className="text-emerald-700 font-extrabold text-xs mt-0.5">
                      {formaterPrixFCFA(ann.prix)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleStatutAnnonce(ann.id, ann.statut)}
                    className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
                  >
                    {ann.statut === "active"
                      ? "Marquer vendu"
                      : "Remettre en ligne"}
                  </button>
                  <button
                    type="button"
                    onClick={() => supprimerAnnonce(ann.id, ann.titre)}
                    className="text-xs font-bold text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SecuriteCompteVendeur emailUser={emailUser} />
    </div>
  );
}