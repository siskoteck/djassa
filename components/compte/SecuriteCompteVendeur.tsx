"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function SecuriteCompteVendeur({ emailUser }: { emailUser: string }) {
  const router = useRouter();
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [verifEnCours, setVerifEnCours] = useState(false);
  const [msgMdp, setMsgMdp] = useState("");
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  async function handleChangerMotDePasse(e: React.FormEvent) {
    e.preventDefault();
    if (!ancienMdp || nouveauMdp.length < 6) {
      setMsgMdp("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setVerifEnCours(true);
    setMsgMdp("");

    const { error: verifErr } = await supabase.auth.signInWithPassword({
      email: emailUser,
      password: ancienMdp,
    });

    if (verifErr) {
      setMsgMdp("Ancien mot de passe incorrect.");
      setVerifEnCours(false);
      return;
    }

    const { error: updateErr } = await supabase.auth.updateUser({
      password: nouveauMdp,
    });

    if (updateErr) {
      setMsgMdp("Erreur : " + updateErr.message);
    } else {
      setMsgMdp("✅ Mot de passe mis à jour avec succès.");
      setAncienMdp("");
      setNouveauMdp("");
    }
    setVerifEnCours(false);
  }

  async function handleSupprimerCompte() {
    const ok1 = confirm(
      "⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement votre compte DJASSA ainsi que toutes vos annonces ?"
    );
    if (!ok1) return;

    const saisie = prompt(
      "Pour confirmer la suppression définitive, tapez SUPPRIMER en majuscules :"
    );
    if (saisie !== "SUPPRIMER") {
      alert("Suppression annulée.");
      return;
    }

    setSuppressionEnCours(true);
    const { error } = await supabase.rpc("supprimer_mon_compte");

    if (error) {
      alert("Erreur lors de la suppression du compte : " + error.message);
      setSuppressionEnCours(false);
      return;
    }

    await supabase.auth.signOut();
    alert("Votre compte DJASSA et toutes vos annonces ont été supprimés.");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-900 mb-3">
          🔒 Modifier mon mot de passe
        </h2>

        <form onSubmit={handleChangerMotDePasse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="ancien-mdp"
                className="block text-xs font-bold text-gray-700 mb-1"
              >
                Ancien mot de passe
              </label>
              <input
                id="ancien-mdp"
                type="password"
                required
                value={ancienMdp}
                onChange={(e) => setAncienMdp(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="nouveau-mdp"
                className="block text-xs font-bold text-gray-700 mb-1"
              >
                Nouveau mot de passe (min. 6 caractères)
              </label>
              <input
                id="nouveau-mdp"
                type="password"
                required
                minLength={6}
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          {msgMdp && (
            <p className="text-xs font-bold text-emerald-700">{msgMdp}</p>
          )}

          <button
            type="submit"
            disabled={verifEnCours}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {verifEnCours ? "Mise à jour..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>

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
          onClick={handleSupprimerCompte}
          disabled={suppressionEnCours}
          className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {suppressionEnCours
            ? "Suppression définitive en cours..."
            : "🗑️ Supprimer définitivement mon compte"}
        </button>
      </div>
    </div>
  );
}