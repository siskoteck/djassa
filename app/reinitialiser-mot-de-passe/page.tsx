"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReinitialiserMotDePassePage() {
  const router = useRouter();
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [confirmationMdp, setConfirmationMdp] = useState("");
  const [sessionPrete, setSessionPrete] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    // Vérifie si Supabase a bien ouvert la session de récupération via le lien e-mail
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSessionPrete(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setSessionPrete(true);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleNouveauMotDePasse(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (nouveauMdp.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (nouveauMdp !== confirmationMdp) {
      setErreur("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setChargement(true);

    const { error } = await supabase.auth.updateUser({
      password: nouveauMdp,
    });

    if (error) {
      setErreur(
        "Le lien a expiré ou est invalide. Veuillez refaire une demande sur la page de connexion."
      );
      setChargement(false);
      return;
    }

    setSucces(true);
    setChargement(false);

    setTimeout(() => {
      router.push("/mon-compte");
      router.refresh();
    }, 2000);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
            SÉCURITÉ • DJASSA
          </span>
          <h1 className="text-2xl font-black text-gray-900 mt-2">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Choisissez un nouveau mot de passe pour accéder à votre compte DJASSA.
          </p>
        </div>

        {succes ? (
          <div className="text-center space-y-4 py-4">
            <div className="text-emerald-800 text-sm bg-emerald-50 border border-emerald-200 p-4 rounded-2xl font-bold">
              ✅ Mot de passe modifié avec succès ! Redirection vers votre espace...
            </div>
            <Link
              href="/mon-compte"
              className="inline-block bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
            >
              Accéder à mon compte
            </Link>
          </div>
        ) : (
          <form onSubmit={handleNouveauMotDePasse} className="space-y-4">
            {!sessionPrete && (
              <div className="text-amber-800 text-xs bg-amber-50 border border-amber-200 p-3 rounded-xl">
                ℹ️ Assurez-vous d&apos;avoir ouvert cette page depuis le lien reçu
                dans votre boîte e-mail.
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nouveau mot de passe (6 caractères min.) *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={nouveauMdp}
                onChange={(e) => setNouveauMdp(e.target.value)}
                placeholder="Saisissez le nouveau mot de passe"
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Confirmer le nouveau mot de passe *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmationMdp}
                onChange={(e) => setConfirmationMdp(e.target.value)}
                placeholder="Répétez le nouveau mot de passe"
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
              disabled={chargement}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50 shadow-sm"
            >
              {chargement
                ? "Enregistrement..."
                : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-gray-600 mt-6">
          <Link
            href="/connexion"
            className="text-emerald-700 font-bold hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
