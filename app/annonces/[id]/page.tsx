import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { genererLienWhatsAppAchat } from "@/lib/whatsapp";

export default function AnnonceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
          Chargement de l&apos;annonce...
        </div>
      }
    >
      <AnnonceDetailContent params={params} />
    </Suspense>
  );
}

async function AnnonceDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createSupabaseClient();

  const { data: annonce, error } = await supabase
    .from("annonces")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !annonce) {
    notFound();
  }

  const photos: string[] = Array.isArray(annonce.photos) ? annonce.photos : [];
  const lienWhatsApp = genererLienWhatsAppAchat(
    annonce.telephone,
    annonce.vendeur_nom,
    annonce.titre,
    annonce.prix
  );

  const datePublication = new Date(annonce.created_at).toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link
        href="/annonces"
        className="text-sm text-orange-600 hover:underline font-medium inline-block mb-6"
      >
        ← Retour aux annonces
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : Photos & Description */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {photos.length > 0 ? (
              <div>
                <a
                  href={photos[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photos[0]}
                    alt={annonce.titre}
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                </a>

                {photos.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-3 bg-gray-50 border-t border-gray-100">
                    {photos.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden rounded-lg border border-gray-200 hover:opacity-90"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`${annonce.titre} - photo ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400">
                Aucune photo fournie pour cet article
              </div>
            )}
          </div>

          {/* Description détaillée */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Description de l&apos;article
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {annonce.description}
            </p>
          </div>
        </div>

        {/* Colonne droite : Prix, Vendeur & Contact */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            {annonce.statut === "vendu" && (
              <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                Article déjà vendu
              </span>
            )}

            <p className="text-3xl font-extrabold text-orange-600 mb-2">
              {Number(annonce.prix).toLocaleString("fr-FR")} FCFA
            </p>

            <h1 className="text-xl font-bold text-gray-900 mb-4">
              {annonce.titre}
            </h1>

            <div className="space-y-2 text-sm text-gray-600 border-t border-b border-gray-100 py-4 my-4">
              <p>
                <span className="font-medium text-gray-800">Catégorie :</span>{" "}
                {annonce.categorie}
              </p>
              <p>
                <span className="font-medium text-gray-800">État :</span>{" "}
                {annonce.etat}
              </p>
              <p>
                <span className="font-medium text-gray-800">Lieu :</span> 📍{" "}
                {annonce.commune}
                {annonce.quartier ? ` (${annonce.quartier})` : ""}
              </p>
              <p>
                <span className="font-medium text-gray-800">Publiée le :</span>{" "}
                {datePublication}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                Vendeur
              </p>
              <p className="font-bold text-gray-900 text-base">
                {annonce.vendeur_nom}
              </p>
            </div>

            {annonce.statut !== "vendu" ? (
              <div className="space-y-3">
                <a
                  href={lienWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-4 rounded-xl transition"
                >
                  💬 Acheter sur WhatsApp
                </a>

                <a
                  href={`tel:${annonce.telephone.replace(/\s+/g, "")}`}
                  className="block w-full text-center border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-xl transition"
                >
                  📞 Appeler ({annonce.telephone})
                </a>
              </div>
            ) : (
              <p className="text-sm text-red-600 font-medium text-center bg-red-50 p-3 rounded-xl">
                Cet article n&apos;est plus disponible.
              </p>
            )}
          </div>

          {/* Conseils de sécurité */}
          <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-5 text-xs text-gray-700 space-y-2">
            <p className="font-bold text-gray-900 text-sm">
              🛡️ Conseils de sécurité DJASSA
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Privilégiez une rencontre dans un lieu public et fréquenté à
                Abidjan.
              </li>
              <li>
                Vérifiez l&apos;état de l&apos;article avant de payer.
              </li>
              <li>
                N&apos;envoyez jamais d&apos;avance d&apos;argent par Mobile
                Money avant d&apos;avoir vu le produit.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
