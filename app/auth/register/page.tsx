"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { telephoneVersEmail } from "@/lib/auth";
import { METIERS, COMMUNES } from "@/lib/constantes";
import Captcha, { CAPTCHA_ACTIF } from "@/components/Captcha";

export default function RegisterPage() {
  const router = useRouter();
  const [typeCompte, setTypeCompte] = useState<"particulier" | "artisan">("particulier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const nom = (formData.get("nom") as string).trim();
    const telephone = (formData.get("telephone") as string).trim();
    const emailSaisi = ((formData.get("email") as string) || "").trim().toLowerCase();
    const password = formData.get("password") as string;
    const metier = formData.get("metier") as string;
    const commune = formData.get("commune") as string;

    // E-mail réel si fourni, sinon e-mail fictif basé sur le téléphone
    const email = emailSaisi || telephoneVersEmail(telephone);

    try {
      // 1. Créer le compte
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken: captchaToken ?? undefined,
          data: {
            nom,
            telephone,
            email_contact: emailSaisi || null,
            type_compte: typeCompte,
            metier: typeCompte === "artisan" ? metier : null,
            commune: typeCompte === "artisan" ? commune : null,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // 2. Redirection après succès
      alert("Compte créé avec succès !");
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Erreur Supabase:", err);
      const msg: string = err.message || "";
      if (msg.toLowerCase().includes("captcha")) {
        setError("Vérification de sécurité échouée. Réessayez.");
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
        <h1 className="text-2xl font-bold text-center mb-2">Créer un compte</h1>
        <p className="text-gray-600 text-center mb-8">
          Rejoignez BARA en quelques secondes
        </p>

        {/* Choix du type de compte */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setTypeCompte("particulier")}
            className={`flex-1 py-2.5 rounded-lg font-medium border ${
              typeCompte === "particulier"
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Particulier
          </button>
          <button
            type="button"
            onClick={() => setTypeCompte("artisan")}
            className={`flex-1 py-2.5 rounded-lg font-medium border ${
              typeCompte === "artisan"
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            Artisan
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium mb-1">
              Nom complet
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              autoComplete="name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium mb-1">
              Téléphone
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              autoComplete="tel"
              required
              pattern="[0-9 +]{8,16}"
              title="Entrez un numéro valide, par exemple 07 00 00 00 00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              placeholder="07 00 00 00 00"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              E-mail{" "}
              <span className="text-gray-400 font-normal">(facultatif)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              placeholder="vous@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Mot de passe
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

          {typeCompte === "artisan" && (
            <>
              <div>
                <label htmlFor="metier" className="block text-sm font-medium mb-1">
                  Métier principal
                </label>
                <select
                  id="metier"
                  name="metier"
                  required
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                >
                  <option value="" disabled>
                    Choisir un métier
                  </option>
                  {METIERS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="commune" className="block text-sm font-medium mb-1">
                  Commune d'intervention
                </label>
                <select
                  id="commune"
                  name="commune"
                  required
                  defaultValue=""
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
                >
                  <option value="" disabled>
                    Choisir une commune
                  </option>
                  {COMMUNES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <Captcha onToken={setCaptchaToken} resetSignal={resetSignal} />

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (CAPTCHA_ACTIF && !captchaToken)}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 mt-2 disabled:opacity-50"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-orange-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}