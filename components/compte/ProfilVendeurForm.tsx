"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { COMMUNES_ABIDJAN } from "@/lib/constantes";

interface Props {
  userId: string;
  emailUser: string;
  nomInitial: string;
  telephoneInitial: string;
  communeInitiale: string;
}

export function ProfilVendeurForm({
  userId,
  emailUser,
  nomInitial,
  telephoneInitial,
  communeInitiale,
}: Props) {
  const [nom, setNom] = useState(nomInitial);
  const [telephone, setTelephone] = useState(telephoneInitial);
  const [commune, setCommune] = useState(communeInitiale || "Treichville");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("utilisateurs").upsert([
      {
        id: userId,
        nom: nom.trim() || "Vendeur DJASSA",
        telephone: telephone.trim(),
        email: emailUser.trim().toLowerCase(),
        commune,
      },
    ]);

    setMessage(
      error
        ? "Erreur : " + error.message
        : "✅ Coordonnées enregistrées avec succès."
    );
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-extrabold text-gray-900 mb-4">
        Mes coordonnées par défaut
      </h2>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="vendeur-nom"
              className="block text-xs font-bold text-gray-700 mb-1"
            >
              Nom / Boutique
            </label>
            <input
              id="vendeur-nom"
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="vendeur-tel"
              className="block text-xs font-bold text-gray-700 mb-1"
            >
              Téléphone WhatsApp
            </label>
            <input
              id="vendeur-tel"
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="07 00 00 00 00"
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="vendeur-commune"
              className="block text-xs font-bold text-gray-700 mb-1"
            >
              Commune principale
            </label>
            <select
              id="vendeur-commune"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-sm bg-white"
            >
              {COMMUNES_ABIDJAN.map((c: string) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && (
          <p className="text-xs font-bold text-emerald-700">{message}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 hover:bg-gray-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer mes infos"}
        </button>
      </form>
    </div>
  );
}