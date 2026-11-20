"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConnexionDjassaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [infoReset, setInfoReset] = useState("");

  async function handleConnexion(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur("");
    setInfoReset("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErreur("Adresse e-mail ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/mon-compte");
    router.refresh();
  }

  async function handleMotDePasseOublie() {
    setErreur("");
    setInfoReset("");

    if (!email.trim()) {
      setErreur("Saisissez d'abord votre adresse e-mail ci-dessus.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/mon-compte`,
    });

    if (error) {
      setErreur(error.message);
    } else {
      setInfoReset(
        "Un lien de réinitialisation vient d'être envoyé sur votre boîte e-mail."
      );
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-gray-900">Connexion DJASSA</h1>
          <p className="text-sm text-gray-600 mt-1">
            Accédez à votre boutique et gérez vos annonces à Abidjan.
          </p>
        </div>

        <form onSubmit={handleConnexion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
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
                className="text-xs font-bold text-orange-600 hover:underline"
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
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          {erreur && (
            <div className="text-red-600 text-xs bg-red-50 border border-red-200 p-3 rounded-xl">
              {erreur}
            </div>
          )}

          {infoReset && (
            <div className="text-green-700 text-xs bg-green-50 border border-green-200 p-3 rounded-xl font-semibold">
              ✅ {infoReset}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600 mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="text-orange-600 font-bold hover:underline"
          >
            Créer un compte gratuit
          </Link>
        </p>
      </div>
    </div>
  );
}
