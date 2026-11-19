"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { telephoneVersEmail } from "@/lib/auth";
import Captcha, { CAPTCHA_ACTIF } from "@/components/Captcha";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const identifiant = (formData.get("identifiant") as string).trim();
    const password = formData.get("password") as string;

    // E-mail saisi tel quel, sinon on convertit le téléphone en e-mail fictif
    const email = identifiant.includes("@")
      ? identifiant.toLowerCase()
      : telephoneVersEmail(identifiant);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken: captchaToken ?? undefined },
      });

      if (signInError) throw signInError;

      router.push("/artisans");
      router.refresh();
    } catch (err: any) {
      console.error("Erreur connexion:", err);
      const msg: string = err.message || "";
      if (msg.toLowerCase().includes("captcha")) {
        setError("Vérification de sécurité échouée. Réessayez.");
      } else if (msg.includes("Email not confirmed")) {
        setError("Compte non confirmé. Contactez le support.");
      } else if (msg.includes("Invalid login credentials")) {
        setError("Identifiant ou mot de passe incorrect.");
      } else {
        setError(msg || "Une erreur est survenue");
      }
    } finally {
      setLoading(false);
      // Un jeton ne sert qu'une fois : on en redemande un nouveau
      setResetSignal((n) => n + 1);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Connexion</h1>
        <p className="text-gray-600 text-center mb-8">
          Accédez à votre compte BARA
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="identifiant"
              className="block text-sm font-medium mb-1"
            >
              Téléphone ou Email
            </label>
            <input
              id="identifiant"
              name="identifiant"
              type="text"
              autoComplete="username"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              placeholder="07 00 00 00 00"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              placeholder="••••••••"
            />
          </div>

          <div className="flex justify-end">
            <Link
              href="/auth/mot-de-passe-oublie"
              className="text-sm text-orange-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <Captcha onToken={setCaptchaToken} resetSignal={resetSignal} />

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (CAPTCHA_ACTIF && !captchaToken)}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="text-orange-600 font-medium hover:underline"
          >
            S’inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}