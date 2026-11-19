export default function ConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 space-y-6 text-gray-700 leading-relaxed">
        <h1 className="text-3xl font-bold text-gray-900">
          Politique de confidentialité
        </h1>
        <p className="text-xs text-gray-500">
          Conformément à la loi n° 2013-450 du 19 juin 2013 relative à la
          protection des données à caractère personnel en Côte d&apos;Ivoire.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            1. Données collectées
          </h2>
          <p>
            Dans le cadre de l&apos;utilisation de BARA, nous collectons uniquement
            les informations nécessaires à la mise en relation :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Pour les artisans :</strong> nom complet, métier, commune et
              quartier, numéro de téléphone WhatsApp, photo de profil et photos de
              réalisations.
            </li>
            <li>
              <strong>Pour les particuliers :</strong> nom, commune d&apos;intervention,
              description du besoin et numéro de téléphone pour être recontacté.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            2. Utilisation des données
          </h2>
          <p>
            Vos données sont utilisées exclusivement pour afficher les fiches
            professionnelles dans l&apos;annuaire, transmettre les demandes de
            chantiers aux artisans concernés et assurer le support technique.
            BARA ne vend ni ne loue aucune donnée personnelle à des tiers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">
            3. Vos droits (Accès, rectification et suppression)
          </h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de modification et de
            suppression de vos données personnelles à tout moment. Les artisans
            peuvent modifier leurs informations directement depuis leur espace{" "}
            <strong>« Mon profil »</strong>, ou demander la suppression totale
            de leur compte en écrivant à <strong>contact@bara.ci</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
