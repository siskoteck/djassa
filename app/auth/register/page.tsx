"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COMMUNES_ABIDJAN } from "@/lib/constantes";

export default function RegisterDjassaPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [commune, setCommune] = useState("Treichville");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    const { data, error } = await supabase.auth.signUp({
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

        if (data.user) {
      await supabase.from("utilisateurs").upsert([
        {
          id: data.user.id,
          nom: nom.trim(),
          telephone: telephone.trim(),
          email: email.trim().toLowerCase(),
          commune,
        },
      ]);
    }


    router.push("/mon-compte");
    router.refresh();
  }
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
            GRATUIT • ABIDJAN
          </span>
          <h1 className="text-2xl font-black text-gray-900 mt-2">
            Créer mon compte <span className="text-emerald-600">DJASSA</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Publiez vos annonces gratuitement et vendez vite près de chez vous.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nom ou nom de boutique *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Ex: Koné Ibrahim ou Boutique Treichville"
              className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Numéro WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="07 00 00 00 00"
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Commune *
              </label>
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-sm bg-white"
              >
                {COMMUNES_ABIDJAN.map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Adresse e-mail *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Mot de passe (6 caractères min.) *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choisissez un mot de passe"
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
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50 shadow-sm"
          >
            {loading ? "Création du compte..." : "Créer mon compte DJASSA"}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-600 mt-6">
          Déjà inscrit ?{" "}
          <Link
            href="/connexion"
            className="text-emerald-700 font-bold hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
