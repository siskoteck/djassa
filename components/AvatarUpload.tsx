"use client";

import { useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";

interface AvatarUploadProps {
  userId: string;
  nom: string;
  urlActuelle: string | null;
  onUpload: (nouvelleUrl: string) => void;
}

export function AvatarUpload({
  userId,
  nom,
  urlActuelle,
  onUpload,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);

  const initiales = nom
    ? nom
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide (JPG, PNG ou WebP).");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image ne doit pas dépasser 2 Mo.");
        return;
      }

      const supabase = createSupabaseClient();
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${userId}/avatar.${ext}`;

      // 1. Envoyer le fichier dans Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Récupérer l'URL publique (avec un paramètre de temps pour rafraîchir le cache)
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      // 3. Mettre à jour la fiche artisan dans la base de données
      const { error: dbError } = await supabase
        .from("artisans")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      if (dbError) throw dbError;

      onUpload(publicUrl);
    } catch (error: any) {
      console.error("Erreur upload avatar:", error);
      alert("Erreur lors de l'envoi de la photo : " + (error.message || "Inconnue"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      {urlActuelle ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlActuelle}
          alt={nom}
          className="w-20 h-20 rounded-full object-cover border-2 border-orange-600 shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-bold border-2 border-orange-200 shrink-0">
          {initiales}
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">
          Photo de profil
        </p>
        <label className="cursor-pointer bg-white hover:bg-orange-50 text-orange-600 border border-orange-300 text-sm font-medium px-4 py-2 rounded-lg transition inline-block">
          {uploading ? "Envoi en cours..." : "📷 Choisir une photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-500 mt-1.5">
          JPG, PNG ou WebP. Taille max : 2 Mo.
        </p>
      </div>
    </div>
  );
}
