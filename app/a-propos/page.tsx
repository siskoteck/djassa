import Link from "next/link";

export default function AProposPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* En-tête */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-10 mb-8">
        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          Notre mission à Abidjan
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          À propos de BARA
        </h1>

        <div className="text-gray-700 space-y-5 leading-relaxed text-base sm:text-lg">
          <p>
            <strong>BARA</strong> est une plateforme ivoirienne de mise en
            relation directe entre les artisans qualifiés et les particuliers à
            Abidjan.
          </p>

          <p>
            Notre mission est simple : permettre aux habitants des 13 communes
            d&apos;Abidjan de trouver rapidement un professionnel de confiance
            (plombier, électricien, maçon, peintre, frigoriste, menuisier…) et
            aider les artisans locaux à développer leur activité grâce à une
            vitrine numérique gratuite et visible.
          </p>
        </div>
      </div>

      {/* Nos engagements en 4 cartes */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Pourquoi choisir BARA ?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-2xl mb-3">📍</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Proximité immédiate
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Trouvez en quelques secondes un artisan disponible dans votre
              commune et votre quartier à Abidjan pour des interventions plus
              rapides.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-2xl mb-3">💬</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Contact direct sans intermédiaire
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Discutez directement sur WhatsApp ou par téléphone avec
              l&apos;artisan pour expliquer votre besoin et convenir du tarif.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-2xl mb-3">✓</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Confiance et transparence
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Consultez les photos de réalisations, les badges « Profil vérifié »
              et les vrais avis laissés par les clients précédents.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="text-2xl mb-3">🤝</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Soutien à l&apos;artisanat local
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Nous offrons aux artisans de Côte d&apos;Ivoire un outil simple pour
              valoriser leur savoir-faire et décrocher de nouveaux chantiers.
            </p>
          </div>
        </div>
      </div>

      {/* Vision & Appels à l'action */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Notre vision</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed">
          Devenir la référence de la mise en relation entre artisans et
          particuliers en Côte d&apos;Ivoire, en commençant par Abidjan, avec
          simplicité, confiance et proximité.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/artisans"
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition"
          >
            Trouver un artisan
          </Link>
          <Link
            href="/auth/register"
            className="bg-white text-orange-600 border border-orange-300 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition"
          >
            Créer mon profil artisan
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          BARA – Abidjan, Côte d&apos;Ivoire
        </p>
      </div>
    </div>
  );
}
