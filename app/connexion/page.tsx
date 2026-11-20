"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConnexionDjassaPage() {
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [infoReset, setInfoReset] = useState("");

  async function resoudreEmail(saisie: string): Promise<string | null> {
    const valeur = saisie.trim();
    if (valeur.includes("@")) {
      return valeur.toLowerCase();
    }

    // Recherche par numéro de téléphone (en comparant uniquement les chiffres)
    const chiffresSaisis = valeur.replace(/\D/g, "");
    if (chiffresSaisis.length < 8) return null;

    const { data } = await supabase
      .from("utilisateurs")
      .select("email, telephone")
      .not("email", "is", null);

    if (!data) return null;

    const trouve = data.find((u) => {
      const telBase = (u.telephone || "").replace(/\D/g, "");
      return (
        telBase === chiffresSaisis ||
        telBase.endsWith(chiffresSaisis) ||
        chiffresSaisis.endsWith(telBase)
      );
    });

    return trouve?.email || null;
  }
  async function handleConnexion(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur("");
    setInfoReset("");

    const emailFinal = await resoudreEmail(identifiant);

    if (!emailFinal) {
      setErreur(
        "Aucun compte trouvé avec ce numéro de téléphone. Essayez avec votre adresse e-mail."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailFinal,
      password,
    });

    if (error) {
      setErreur("Identifiant ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/mon-compte");
    router.refresh();
  }

  async function handleMotDePasseOublie() {
    setErreur("");
    setInfoReset("");

    const emailFinal = await resoudreEmail(identifiant);
    if (!emailFinal) {
      setErreur(
        "Saisissez votre adresse e-mail ou votre numéro de téléphone enregistré ci-dessus."
      );
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailFinal, {
      redirectTo: `${window.location.origin}/mon-compte`,
    });

    if (error) {
      setErreur(error.message);
    } else {
      setInfoReset(
        `Un lien de réinitialisation vient d'être envoyé à ${emailFinal}.`
      );
    }
  }
  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
            ESPACE VENDEUR & ACHETEUR
          </span>
          <h1 className="text-2xl font-black text-gray-900 mt-2">
            Connexion <span className="text-emerald-600">DJASSA</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Connectez-vous avec votre e-mail ou votre numéro de téléphone.
          </p>
        </div>

        <form onSubmit={handleConnexion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Adresse e-mail ou Numéro de téléphone *
            </label>
            <input
              type="text"
              required
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              placeholder="Ex: 07 00 00 00 00 ou vous@exemple.com"
              className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">
                Mot de passe
              </label>
              <button
                type="button"
                onClick={handleMotDePasseOublie}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          {erreur && (
            <div className="text-red-600 text-xs bg-red-50 border border-red-200 p-3 rounded-xl">
              {erreur}
            </div>
          )}

          {infoReset && (
            <div className="text-emerald-800 text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-semibold">
              ✅ {infoReset}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50 shadow-sm"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600 mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="text-emerald-700 font-bold hover:underline"
          >
            Créer un compte gratuit
          </Link>
        </p>
      </div>
    </div>
  );
}
