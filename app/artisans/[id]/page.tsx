import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { genererLienWhatsApp } from "@/lib/whatsapp";
import { SectionAvis } from "@/components/SectionAvis";

export default function ArtisanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-8">Chargement…</div>}
    >
      <ArtisanContent params={params} />
    </Suspense>
  );
}

async function ArtisanContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createSupabaseClient();

  const { data: artisan, error } = await supabase
    .from("artisans")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Erreur Supabase:", error);
  }

  if (error || !artisan) {
    notFound();
  }

  const lienWhatsApp =
    artisan.telephone && artisan.telephone.replace(/\D/g, "").length >= 8
      ? genererLienWhatsApp(
          artisan.telephone,
          artisan.name,
          artisan.metier || "Artisan",
          artisan.commune
        )
      : null;

  const photoProfil = artisan.avatar_url || artisan.photo_url;

  const initiales = artisan.name
    ? artisan.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href="/artisans"
        className="text-sm text-orange-600 hover:underline font-medium"
      >
        ← Retour aux artisans
      </Link>

      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {artisan.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artisan.photo_url}
            alt={artisan.name}
            className="w-full h-56 object-cover"
          />
        )}

        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {photoProfil ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoProfil}
                  alt={artisan.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-orange-500 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-bold border border-orange-200 shrink-0">
                  {initiales}
                </div>
              )}

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {artisan.name}
                </h1>
                {artisan.verifie && (
                  <span className="mt-1 inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-0.5 rounded-full">
                    ✓ Profil vérifié
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Badges Métier, Commune + Quartier et Disponibilité */}
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-700">
            {artisan.metier && (
              <span className="bg-orange-50 text-orange-700 font-medium px-3 py-1 rounded-full">
                {artisan.metier}
              </span>
            )}
            {artisan.commune && (
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                📍 {artisan.commune}
                {artisan.quartier ? ` (${artisan.quartier})` : ""}
              </span>
            )}
            {artisan.disponible !== false ? (
              <span className="bg-green-50 text-green-700 border border-green-200 font-medium px-3 py-1 rounded-full">
                🟢 Disponible
              </span>
            ) : (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 font-medium px-3 py-1 rounded-full">
                🟠 Occupé actuellement
              </span>
            )}
          </div>

          {artisan.note && (
            <p className="mt-4 text-sm text-gray-600">
              <span className="text-yellow-500 font-semibold">
                ★ {artisan.note}
              </span>{" "}
              ({artisan.avis ?? 0} avis)
            </p>
          )}

          {artisan.description && (
            <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-line">
              {artisan.description}
            </p>
          )}

          {/* Galerie des réalisations */}
          {artisan.realisations && artisan.realisations.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                Réalisations récentes
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {artisan.realisations.map((photoUrl: string, index: number) => (
                  <a
                    key={photoUrl}
                    href={photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl border border-gray-200 hover:opacity-95 transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`Réalisation ${index + 1} de ${artisan.name}`}
                      className="w-full h-40 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {lienWhatsApp ? (
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={lienWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition"
              >
                💬 Discuter sur WhatsApp
              </a>
              <a
                href={`tel:${artisan.telephone.replace(/\s/g, "")}`}
                className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl transition"
              >
                📞 Appeler ({artisan.telephone})
              </a>
            </div>
          ) : (
            <p className="mt-8 text-sm text-gray-500">
              Cet artisan n&apos;a pas encore renseigné de numéro de téléphone.
            </p>
          )}

          {/* Section Avis et Notation */}
          <SectionAvis artisanId={artisan.id} />
        </div>
      </div>
    </div>
  );
}
