export default function CGUPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 space-y-6 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-gray-900">
          Conditions Générales d&apos;Utilisation (CGU)
        </h1>
        <p className="text-xs text-gray-500">
          Dernière mise à jour : Novembre 2026
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            1. Objet de la plateforme
          </h2>
          <p>
            <strong>BARA</strong> est une plateforme numérique de mise en
            relation entre des particuliers ayant un besoin de travaux ou de
            services à Abidjan et des artisans indépendants.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            2. Rôle d&apos;intermédiaire et limitation de responsabilité
          </h2>
          <p>
            BARA agit exclusivement en qualité d&apos;hébergeur d&apos;annonces et
            d&apos;intermédiaire technique. BARA n&apos;est pas une entreprise de
            bâtiment ou de prestation de services et n&apos;emploie pas les
            artisans inscrits sur la plateforme.
          </p>
          <p>
            En conséquence, le contrat de prestation, le devis, l&apos;exécution
            des travaux, les délais et le règlement financier sont convenus
            directement entre le particulier et l&apos;artisan. BARA ne saurait
            être tenue responsable des malfaçons, retards, dommages matériels ou
            litiges commerciaux survenant entre les utilisateurs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            3. Engagements des artisans
          </h2>
          <p>
            Chaque artisan inscrit s&apos;engage à fournir des informations exactes
            sur son identité, son métier, sa commune d&apos;exercice et son numéro
            de téléphone. L&apos;ajout de photos de réalisations n&apos;appartenant
            pas à l&apos;artisan entraînera la suppression immédiate de son compte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            4. Avis et commentaires
          </h2>
          <p>
            Les particuliers peuvent publier des avis objectifs après une
            prestation. Tout commentaire injurieux, diffamatoire ou frauduleux
            pourra être supprimé sans préavis par l&apos;administration de BARA.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            5. Droit applicable
          </h2>
          <p>
            Les présentes CGU sont régies par le droit ivoirien. En cas de
            litige, et à défaut d&apos;accord amiable, les tribunaux d&apos;Abidjan
            seront seuls compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
