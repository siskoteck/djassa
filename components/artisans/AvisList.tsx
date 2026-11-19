"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Avis {
  id: string;
  note: number;
  commentaire: string | null;
  created_at: string;
}

export default function AvisList({ artisanId }: { artisanId: string }) {
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAvis() {
      const { data, error } = await supabase
        .from("avis")
        .select("*")
        .eq("artisan_id", artisanId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAvis(data);
      }
      setLoading(false);
    }

    fetchAvis();
  }, [artisanId]);

  if (loading) return <p>Chargement des avis...</p>;

  if (avis.length === 0) {
    return <p className="text-gray-500">Aucun avis pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      {avis.map((a) => (
        <div key={a.id} className="border-b pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-500 font-semibold">
              {"★".repeat(a.note)}{"☆".repeat(5 - a.note)}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(a.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>
          {a.commentaire && (
            <p className="text-gray-700">{a.commentaire}</p>
          )}
        </div>
      ))}
    </div>
  );
}