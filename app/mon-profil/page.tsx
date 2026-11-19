"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { METIERS, COMMUNES } from "@/lib/constantes";
import { AvatarUpload } from "@/components/AvatarUpload";
import { RealisationsUpload } from "@/components/RealisationsUpload";

type Fiche = {
  id: number;
  name: string | null;
  metier: string | null;
  commune: string | null;
  quartier: string | null;
  disponible: boolean | null;
  description: string | null;
  telephone: string | null;
  avatar_url: string | null;
  realisations: string[] | null;
};

export default function MonProfilPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [disponible, setDisponible] = useState<boolean>(true);
  const [chargement, setChargement] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    async function charger() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(user.id);

      const { data: ligne, error: erreur } = await supabase
        .from("artisans")
        .select(
          "id, name, metier, commune, quartier, disponible, description, telephone, avatar_url, realisations"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (erreur) {
        console.error("Erreur chargement fiche:", erreur);
        setError("Impossible de charger votre fiche.");
      }

      if (ligne) {
        setFiche(ligne);
        setDisponible(ligne.disponible ?? true);
      }
      setChargement(false);
    }

    charger();
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError("");
    setSucces(false);

    const formData = new FormData(e.currentTarget);
    const miseAJour = {
      name: (formData.get("name") as string).trim(),
      metier: formData.get("metier") as string,
      commune: (formData.get("commune") as string) || null,
      quartier: ((formData.get("quartier") as string) || "").trim() || null,
      disponible,
      description: ((formData.get("description") as string) || "").trim() || null,
      telephone: (formData.get("telephone") as string).trim(),
    };

    try {
      const { data, error: updateError } = await supabase
        .from("artisans")
        .update(miseAJour)
        .eq("user_id", userId)
        .select("id");

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error("Modification refusée. Reconnectez-vous et réessayez.");
      }

      setFiche((prev) => (prev ? { ...prev, ...miseAJour } : null));
      setSucces(true);
    } catch (err: any) {
      console.error("Erreur mise à jour fiche:", err);
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  if (chargement) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-gray-500">
        Chargement…
      </div>
    );
  }

  if (!fiche) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <h1 className="text-xl font-bold mb-2">Pas de fiche artisan</h1>
          <p className="text-gray-600 mb-6">
            Votre compte n&apos;est pas un compte artisan, donc il n&apos;a pas de fiche à
            modifier.
          </p>
          <Link href="/artisans" className="text-orange-600 font-medium hover:underline">
            Voir les artisans
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-1">Mon profil</h1>
        <p className="text-gray-600 mb-6">
          Complétez votre fiche : c&apos;est ce que voient les clients avant de vous
          contacter sur WhatsApp.
        </p>

        {userId && (
          <div className="space-y-4 mb-6">
            <AvatarUpload
              userId={userId}
              nom={fiche.name ?? "Artisan"}
              urlActuelle={fiche.avatar_url}
              onUpload={(nouvelleUrl) =>
                setFiche((prev) =>
                  prev ? { ...prev, avatar_url: nouvelleUrl } : null
                )
              }
            />

            <RealisationsUpload
              userId={userId}
              photosActuelles={fiche.realisations ?? []}
              onChange={(nouvellesPhotos) =>
                setFiche((prev) =>
                  prev ? { ...prev, realisations: nouvellesPhotos } : null
                )
              }
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Statut de disponibilité */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm text-gray-900">
                Statut de disponibilité
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {disponible
                  ? "🟢 Vous apparaissez comme disponible immédiatement."
                  : "🟠 Vous apparaissez comme actuellement occupé."}
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={disponible}
                onChange={(e) => setDisponible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom complet
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={fiche.name ?? ""}
              autoComplete="name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="metier" className="block text-sm font-medium mb-1">
              Métier principal
            </label>
            <select
              id="metier"
              name="metier"
              defaultValue={fiche.metier ?? METIERS[0]}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
            >
              {METIERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="commune" className="block text-sm font-medium mb-1">
                Commune
              </label>
              <select
                id="commune"
                name="commune"
                defaultValue={fiche.commune ?? ""}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white"
              >
                <option value="">Choisir une commune</option>
                {COMMUNES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quartier" className="block text-sm font-medium mb-1">
                Quartier précis{" "}
                <span className="text-gray-400 font-normal">(facultatif)</span>
              </label>
              <input
                id="quartier"
                name="quartier"
                type="text"
                defaultValue={fiche.quartier ?? ""}
                placeholder="Ex: Angré, Riviera, Niangon, Zone 4..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>
          </div>

          <div>
            <label htmlFor="telephone" className="block text-sm font-medium mb-1">
              Numéro WhatsApp
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              required
              defaultValue={fiche.telephone ?? ""}
              autoComplete="tel"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              placeholder="07 00 00 00 00"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Présentation
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={fiche.description ?? ""}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              placeholder="Vos services, votre expérience, vos zones d'intervention…"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {succes && (
            <div className="text-green-700 text-sm bg-green-50 p-3 rounded-lg">
              Votre fiche a été mise à jour.{" "}
              <Link
                href={`/artisans/${fiche.id}`}
                className="font-medium underline"
              >
                Voir ma fiche publique
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      </div>
    </div>
  );
}
