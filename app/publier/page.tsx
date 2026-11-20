"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginDjassaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErreur("Adresse e-mail ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/mon-profil");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-14">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1">
          Connexion DJASSA
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Accédez à votre espace vendeur et gérez vos annonces à Abidjan.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Adresse e-mail *
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
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mot de passe *
            </label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="text-emerald-600 font-bold hover:underline"
          >
            Créer un compte DJASSA
          </Link>
        </p>
      </div>
    </div>
  );
}
