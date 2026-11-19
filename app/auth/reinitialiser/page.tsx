"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ReinitialiserPage() {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Le lien de l'e-mail ouvre une session temporaire de récupération
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setPret(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPret(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmation = formData.get("confirmation") as string;

    if (password !== confirmation) {
      setError("Les deux mots de passe ne sont pas identiques.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      alert("Mot de passe modifié. Vous pouvez vous connecter.");
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Erreur mise à jour:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Nouveau mot de passe</h1>

        {!pret ? (
          <div className="text-sm text-gray-600 text-center mt-6">
            <p className="mb-4">
              Lien invalide ou expiré. Refaites une demande de réinitialisation.
            </p>
            <Link
              href="/auth/mot-de-passe-oublie"
              className="text-orange-600 font-medium hover:underline"
            >
              Nouvelle demande
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                placeholder="8 caractères minimum"
              />
            </div>

            <div>
              <label htmlFor="confirmation" className="block text-sm font-medium mb-1">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                placeholder="Répétez le mot de passe"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Changer le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}