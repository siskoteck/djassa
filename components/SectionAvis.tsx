"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface AvisItem {
  id: number;
  created_at: string;
  auteur_nom: string;
  note: number;
  commentaire: string;
}

export function SectionAvis({ artisanId }: { artisanId: number }) {
  const [avisListe, setAvisListe] = useState<AvisItem[]>([]);
  const [noteChoisie, setNoteChoisie] = useState<number>(5);
  const [auteurNom, setAuteurNom] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [messageSucces, setMessageSucces] = useState(false);

  useEffect(() => {
    async function chargerAvis() {
      const { data } = await supabase
        .from("avis")
        .select("*")
        .eq("artisan_id", artisanId)
        .order("created_at", { ascending: false });

      if (data) setAvisListe(data);
    }

    chargerAvis();
  }, [artisanId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auteurNom.trim() || !commentaire.trim()) return;

    setEnvoi(true);
    setMessageSucces(false);

    const { data, error } = await supabase
      .from("avis")
      .insert([
        {
          artisan_id: artisanId,
          auteur_nom: auteurNom.trim(),
          note: noteChoisie,
          commentaire: commentaire.trim(),
        },
      ])
      .select("*")
      .single();

    if (!error && data) {
      setAvisListe((prev) => [data, ...prev]);
      setAuteurNom("");
      setCommentaire("");
      setNoteChoisie(5);
      setMessageSucces(true);
    } else {
      alert("Erreur lors de l'envoi de votre avis.");
    }

    setEnvoi(false);
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Avis des clients ({avisListe.length})
      </h2>

      {/* Formulaire pour laisser un avis */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-8 space-y-4"
      >
        <h3 className="font-semibold text-gray-900 text-sm">
          Vous avez travaillé avec cet artisan ? Laissez un avis
        </h3>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Votre note
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((etoile) => (
              <button
                key={etoile}
                type="button"
                onClick={() => setNoteChoisie(etoile)}
                className={`text-2xl transition ${
                  etoile <= noteChoisie ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="auteur_nom" className="block text-xs font-medium text-gray-600 mb-1">
            Votre nom *
          </label>
          <input
            id="auteur_nom"
            type="text"
            required
            value={auteurNom}
            onChange={(e) => setAuteurNom(e.target.value)}
            placeholder="Ex: Konan Marc"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label htmlFor="commentaire" className="block text-xs font-medium text-gray-600 mb-1">
            Votre commentaire *
          </label>
          <textarea
            id="commentaire"
            required
            rows={3}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Qualité du travail, ponctualité, tarif..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>

        {messageSucces && (
          <p className="text-green-700 text-xs font-medium">
            Merci ! Votre avis a bien été publié.
          </p>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {envoi ? "Publication..." : "Publier mon avis"}
        </button>
      </form>

      {/* Liste des avis publiés */}
      {avisListe.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucun avis pour le moment. Soyez le premier à évaluer cet artisan !
        </p>
      ) : (
        <div className="space-y-4">
          {avisListe.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-gray-900">
                  {item.auteur_nom}
                </span>
                <span className="text-yellow-500 text-sm">
                  {"★".repeat(item.note)}
                  <span className="text-gray-300">
                    {"★".repeat(5 - item.note)}
                  </span>
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-line">
                {item.commentaire}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
