"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMMUNES_ABIDJAN } from "@/lib/constantes";

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
  const [savingProfil, setSavingProfil] = useState(false);
  const [msgProfil, setMsgProfil] = useState("");

  // Changement de mot de passe vendeur avec vérification de l'ancien
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [verifMdpEnCours, setVerifMdpEnCours] = useState(false);
  const [msgMdp, setMsgMdp] = useState("");

  const [suppressionCompteEnCours, setSuppressionCompteEnCours] = useState(false);

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
        supabase
          .from("utilisateurs")
          .select("*")
          .eq("id", user.id)
          .maybeSingle(),
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

        if (!resProfil.data.email && emailActuel) {
          await supabase
            .from("utilisateurs")
            .update({ email: emailActuel })
            .eq("id", user.id);
        }
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
  async function handleSaveProfil(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setSavingProfil(true);
    setMsgProfil("");

    const { error } = await supabase.from("utilisateurs").upsert([
      {
        id: userId,
        nom: nom.trim() || "Vendeur DJASSA",
        telephone: telephone.trim(),
        email: emailUser.trim().toLowerCase(),
        commune,
      },
    ]);

    if (error) {
      setMsgProfil("Erreur : " + error.message);
    } else {
      setMsgProfil(
        "✅ Vos informations vendeur ont été enregistrées (connexion par téléphone activée)."
      );
    }
    setSavingProfil(false);
  }

  async function handleChangerMdpVendeur(e: React.FormEvent) {
    e.preventDefault();
    setMsgMdp("");

    if (!ancienMdp) {
      setMsgMdp("❌ Veuillez saisir votre ancien mot de passe.");
      return;
    }
    if (nouveauMdp.length < 6) {
      setMsgMdp("❌ Le nouveau mot de passe doit contenir 6 caractères minimum.");
      return;
    }

    setVerifMdpEnCours(true);

    const { error: checkError } = await supabase.auth.signInWithPassword({
      email: emailUser,
      password: ancienMdp,
    });

    if (checkError) {
      setMsgMdp("❌ L'ancien mot de passe est incorrect.");
      setVerifMdpEnCours(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });
    if (error) {
      setMsgMdp("❌ Erreur : " + error.message);
    } else {
      setMsgMdp("✅ Votre mot de passe a été modifié avec succès !");
      setAncienMdp("");
      setNouveauMdp("");
    }
    setVerifMdpEnCours(false);
  }

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

  async function handleSupprimerMonCompte() {
    const confirmation1 = confirm(
      "⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement votre compte DJASSA ainsi que toutes vos annonces ?"
    );
    if (!confirmation1) return;

    const saisie = prompt(
      'Pour confirmer la suppression définitive, tapez SUPPRIMER en majuscules :'
    );
    if (saisie !== "SUPPRIMER") {
      alert("Suppression annulée.");
      return;
    }

    setSuppressionCompteEnCours(true);

    const { error } = await supabase.rpc("supprimer_mon_compte");

    if (error) {
      alert("Erreur lors de la suppression du compte : " + error.message);
      setSuppressionCompteEnCours(false);
      return;
    }

    await supabase.auth.signOut();
    alert("Votre compte DJASSA et toutes vos annonces ont été supprimés.");
    router.push("/");
    router.refresh();
  }
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">
        Chargement de votre espace vendeur...
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

      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 mb-4">
          Mes coordonnées par défaut
        </h2>

        <form onSubmit={handleSaveProfil} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nom / Boutique
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Téléphone WhatsApp
              </label>
              <input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="07 00 00 00 00"
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Commune principale
              </label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white"
              >
                {COMMUNES_ABIDJAN.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {msgProfil && (
            <p className="text-xs font-bold text-emerald-700">{msgProfil}</p>
          )}

          <button
            type="submit"
            disabled={savingProfil}
            className="bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {savingProfil ? "Enregistrement..." : "Enregistrer mes infos"}
          </button>
        </form>
      </div>

      {/* Modification du mot de passe avec vérification de l'ancien */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 mb-3">
          🔐 Modifier mon mot de passe
        </h2>
        <form
          onSubmit={handleChangerMdpVendeur}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <input
            type="password"
            required
            value={ancienMdp}
            onChange={(e) => setAncienMdp(e.target.value)}
            placeholder="Ancien mot de passe *"
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            value={nouveauMdp}
            onChange={(e) => setNouveauMdp(e.target.value)}
            placeholder="Nouveau mot de passe *"
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={verifMdpEnCours}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {verifMdpEnCours ? "Vérification..." : "Mettre à jour"}
          </button>
        </form>
        {msgMdp && (
          <p
            className={`text-xs font-bold mt-2 ${
              msgMdp.startsWith("✅") ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {msgMdp}
          </p>
        )}
      </div>
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
          <div className="text-center py-8">
            <p className="text-sm text-gray-600 mb-4">
              Vous n&apos;avez encore publié aucun article sur DJASSA.
            </p>
            <Link
              href="/publier"
              className="inline-block bg-emerald-600 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
            >
              + Publier ma première annonce
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {mesAnnonces.map((ann) => (
              <div
                key={ann.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  {Array.isArray(ann.photos) && ann.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={String(ann.photos)}
                      alt={ann.titre}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 shrink-0">
                      Photo
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          ann.statut === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {ann.statut === "active" ? "🟢 En ligne" : "✅ Vendu"}
                      </span>
                      <span className="text-xs text-gray-500">
                        📍 {ann.commune}
                      </span>
                    </div>

                    <Link
                      href={`/annonces/${ann.id}`}
                      className="font-bold text-gray-900 text-sm hover:text-emerald-700"
                    >
                      {ann.titre}
                    </Link>
                    <p className="text-emerald-700 font-extrabold text-xs mt-0.5">
                      {ann.prix > 0
                        ? ann.prix.toLocaleString("fr-FR") + " FCFA"
                        : "Prix à débattre"}
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

      {/* Zone de danger : Suppression définitive du compte */}
      <div className="bg-red-50/70 rounded-3xl border border-red-200 p-6">
        <h2 className="text-base font-extrabold text-red-900">
          ⚠️ Zone de danger — Supprimer mon compte
        </h2>
        <p className="text-xs sm:text-sm text-red-800 mt-1 mb-4">
          La suppression de votre compte est irréversible. Toutes vos annonces
          publiées et vos informations de profil seront définitivement effacées.
        </p>
        <button
          type="button"
          onClick={handleSupprimerMonCompte}
          disabled={suppressionCompteEnCours}
          className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {suppressionCompteEnCours
            ? "Suppression définitive en cours..."
            : "🗑️ Supprimer définitivement mon compte"}
        </button>
      </div>
    </div>
  );
}
