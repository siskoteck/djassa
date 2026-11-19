"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AvisFormProps {
  artisanId: string;
  clientId: string;
  onSuccess?: () => void;
}

export default function AvisForm({ artisanId, clientId, onSuccess }: AvisFormProps) {
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("avis").insert({
      artisan_id: artisanId,
      client_id: clientId,
      note,
      commentaire: commentaire || null,
    });

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("Avis envoyé avec succès !");
      setCommentaire("");
      setNote(5);
      onSuccess?.();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl space-y-4">
      <h3 className="font-semibold text-lg">Laisser un avis</h3>

      <div>
        <label className="block text-sm mb-1">Note</label>
        <select
          value={note}
          onChange={(e) => setNote(Number(e.target.value))}
          className="border rounded-lg px-3 py-2"
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Très bien</option>
          <option value={3}>3 - Moyen</option>
          <option value={2}>2 - Faible</option>
          <option value={1}>1 - Mauvais</option>
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Commentaire (optionnel)</label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={3}
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Partagez votre expérience..."
        />
      </div>

      {message && (
        <p className={`text-sm ${message.includes("Erreur") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Envoyer mon avis"}
      </button>
    </form>
  );
}