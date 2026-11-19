"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface RealisationsUploadProps {
  userId: string;
  photosActuelles: string[];
  onChange: (nouvellesPhotos: string[]) => void;
}

export function RealisationsUpload({
  userId,
  photosActuelles,
  onChange,
}: RealisationsUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      if (photosActuelles.length >= 4) {
        alert("Vous pouvez ajouter au maximum 4 photos de réalisations.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide (JPG, PNG ou WebP).");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("Chaque photo ne doit pas dépasser 2 Mo.");
        return;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${userId}/${fileName}`;

      // 1. Envoyer la photo dans Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("realisations")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Récupérer l'URL publique
      const { data } = supabase.storage
        .from("realisations")
        .getPublicUrl(filePath);

      const miseAJourPhotos = [...photosActuelles, data.publicUrl];

      // 3. Enregistrer la liste mise à jour dans la table artisans
      const { error: dbError } = await supabase
        .from("artisans")
        .update({ realisations: miseAJourPhotos })
        .eq("user_id", userId);

      if (dbError) throw dbError;

      onChange(miseAJourPhotos);
    } catch (error: any) {
      console.error("Erreur upload réalisation:", error);
      alert("Erreur lors de l'envoi : " + (error.message || "Inconnue"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemovePhoto(urlASupprimer: string) {
    try {
      const miseAJourPhotos = photosActuelles.filter(
        (url) => url !== urlASupprimer
      );

      const { error: dbError } = await supabase
        .from("artisans")
        .update({ realisations: miseAJourPhotos })
        .eq("user_id", userId);

      if (dbError) throw dbError;

      onChange(miseAJourPhotos);
    } catch (error: any) {
      console.error("Erreur suppression photo:", error);
      alert("Impossible de supprimer la photo.");
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Photos de mes réalisations ({photosActuelles.length}/4)
          </p>
          <p className="text-xs text-gray-500">
            Montrez vos meilleurs chantiers aux clients (max 2 Mo par photo).
          </p>
        </div>

        {photosActuelles.length < 4 && (
          <label className="cursor-pointer bg-white hover:bg-orange-50 text-orange-600 border border-orange-300 text-xs font-semibold px-3 py-2 rounded-lg transition shrink-0">
            {uploading ? "Envoi..." : "+ Ajouter une photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAddPhoto}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {photosActuelles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {photosActuelles.map((url, index) => (
            <div key={url} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Réalisation ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(url)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow hover:bg-red-700"
                title="Supprimer cette photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
