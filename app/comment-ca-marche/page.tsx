import Link from "next/link";

export default function CommentCaMarchePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* En-tête */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Comment fonctionne BARA ?
        </h1>
        <p className="text-gray-600 text-lg">
          La plateforme qui connecte rapidement les particuliers et les meilleurs artisans dans les 13 communes d&apos;Abidjan.
        </p>
      </div>

      {/* Double parcours côte à côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Carte Particuliers */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Vous avez un besoin
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pour les particuliers
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900">
                    Cherchez ou postez votre besoin
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Parcourez l&apos;annuaire par métier et commune, ou décrivez gratuitement vos travaux en 30 secondes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-9 h-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900">
                    Échangez directement sur WhatsApp
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Discutez du tarif et de la disponibilité sans intermédiaire avec les artisans proches de chez vous.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-9 h-9 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900">
                    Faites réaliser vos travaux
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Choisissez le professionnel qui vous convient et laissez un avis une fois l&apos;intervention terminée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/artisans"
              className="flex-1 text-center bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-700 transition text-sm"
            >
              Trouver un artisan
            </Link>
            <Link
              href="/demande"
              className="flex-1 text-center border border-orange-600 text-orange-600 px-4 py-3 rounded-xl font-semibold hover:bg-orange-50 transition text-sm"
            >
              Poster une demande
            </Link>
          </div>
        </section>

        {/* Carte Artisans */}
        <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Vous êtes professionnel
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Pour les artisans
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900">
                    Créez votre fiche professionnelle
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Inscrivez-vous gratuitement avec votre numéro de téléphone, votre métier, votre commune et votre photo.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900">
                    Consultez les demandes de votre métier
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Accédez aux besoins postés par les clients d&apos;Abidjan correspondant exactement à votre spécialité.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-base text-gray-900">
                    Développez votre clientèle
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Les clients vous contactent directement sur WhatsApp ou par appel pour conclure le chantier.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/auth/register"
              className="block w-full text-center bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition text-sm"
            >
              Créer mon profil artisan gratuitement
            </Link>
          </div>
        </section>
      </div>

      {/* Questions fréquentes (FAQ) */}
      <section className="bg-orange-50/60 border border-orange-100 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Questions fréquentes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">
              Est-ce que l&apos;utilisation de BARA est payante ?
            </h3>
            <p className="text-gray-600">
              Non, la recherche d&apos;artisans, le dépôt de demande et la création d&apos;une fiche artisan sont entièrement gratuits.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">
              Comment se fait le paiement des travaux ?
            </h3>
            <p className="text-gray-600">
              Vous négociez et réglez la prestation directement avec l&apos;artisan (en espèces ou Mobile Money) selon votre accord.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">
              Quelles zones sont couvertes ?
            </h3>
            <p className="text-gray-600">
              BARA couvre les 13 communes du district d&apos;Abidjan : Abobo, Adjamé, Anyama, Attécoubé, Bingerville, Cocody, Koumassi, Marcory, Plateau, Port-Bouët, Songon, Treichville et Yopougon.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">
              Que signifie le badge « Profil vérifié » ?
            </h3>
            <p className="text-gray-600">
              Ce badge indique que l&apos;identité, le numéro WhatsApp et l&apos;activité de l&apos;artisan ont été contrôlés par l&apos;équipe BARA.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
