"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMMUNES } from "@/lib/constantes";

export default function RegisterDjassaPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [commune, setCommune] = useState("Cocody");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          nom: nom.trim(),
          telephone: telephone.trim(),
          commune,
        },
      },
    });

    if (error) {
      setErreur(error.message);
      setLoading(false);
      return;
    }

    router.push("/mon-profil");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          Créer un compte DJASSA
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Publiez vos annonces et achetez en toute confiance à Abidjan.
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom ou Boutique *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Kouamé Boutique"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Numéro WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="07 00 00 00 00"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Commune *</label>
            <select
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
            >
              {COMMUNES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Adresse e-mail *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Mot de passe (6 caractères min.) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>

          {erreur && (
            <div className="text-red-600 text-xs bg-red-50 p-3 rounded-lg">
              {erreur}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition"
          >
            {loading ? "Création du compte..." : "Créer mon compte DJASSA"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Déjà inscrit ?{" "}
          <Link
            href="/auth/login"
            className="text-emerald-600 font-semibold hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
