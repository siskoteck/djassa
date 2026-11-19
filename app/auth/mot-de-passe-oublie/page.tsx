"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { estEmailFictif } from "@/lib/auth";
import Captcha, { CAPTCHA_ACTIF } from "@/components/Captcha";

const WHATSAPP_SUPPORT = "2250707249678";

export default function MotDePasseOubliePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [sansEmail, setSansEmail] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSansEmail(false);

    const formData = new FormData(e.currentTarget);
    const identifiant = (formData.get("identifiant") as string).trim().toLowerCase();

    // Un numéro de téléphone ou un e-mail fictif ne peut pas recevoir d'e-mail
    const estFictif = estEmailFictif(identifiant);
    if (!identifiant.includes("@") || estFictif) {
      setSansEmail(true);
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        identifiant,
        {
          redirectTo: `${window.location.origin}/auth/reinitialiser`,
          captchaToken: captchaToken ?? undefined,
        }
      );
      if (resetError) throw resetError;
      setEnvoye(true);
    } catch (err: any) {
      console.error("Erreur réinitialisation:", err);
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
        <h1 className="text-2xl font-bold text-center mb-2">Mot de passe oublié</h1>
        <p className="text-gray-600 text-center mb-8">
          Entrez l'e-mail de votre compte pour recevoir un lien de réinitialisation.
        </p>

        {envoye ? (
          <div className="text-green-700 text-sm bg-green-50 p-4 rounded-lg">
            Si un compte existe avec cet e-mail, un lien de réinitialisation vient
            d'être envoyé. Pensez à vérifier vos courriers indésirables.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifiant" className="block text-sm font-medium mb-1">
                Téléphone ou Email
              </label>
              <input
                id="identifiant"
                name="identifiant"
                type="text"
                autoComplete="username"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                placeholder="vous@exemple.com"
              />
            </div>

            {sansEmail && (
              <div className="text-orange-800 text-sm bg-orange-50 p-3 rounded-lg">
                Les comptes créés avec un numéro de téléphone ne peuvent pas recevoir
                d'e-mail.{" "}
                <a
                  href={`https://wa.me/${WHATSAPP_SUPPORT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline"
                >
                  Contactez-nous sur WhatsApp
                </a>{" "}
                pour récupérer votre accès.
              </div>
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
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link href="/auth/login" className="text-orange-600 font-medium hover:underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}