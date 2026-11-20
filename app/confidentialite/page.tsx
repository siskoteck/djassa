import Link from "next/link";

export default function ConfidentialiteDjassaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
            PROTECTION DES DONNÉES • CÔTE D&apos;IVOIRE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">
            Politique de Confidentialité
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Conformément à la législation ivoirienne relative à la protection des
            données à caractère personnel
          </p>
        </div>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            1. Données collectées
          </h2>
          <p>
            Lors de votre inscription et de la publication d&apos;annonces sur{" "}
            <strong>DJASSA</strong>, nous collectons uniquement les
            informations nécessaires au bon fonctionnement du service : votre
            nom ou nom de boutique, votre adresse e-mail, votre numéro de
            téléphone/WhatsApp, votre commune ainsi que les photos et
            descriptions de vos articles.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            2. Utilisation des données
          </h2>
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Créer et sécuriser votre espace vendeur et acheteur.</li>
            <li>Permettre aux acheteurs intéressés de vous contacter par téléphone ou WhatsApp au sujet de vos annonces.</li>
            <li>Assurer la modération et la lutte contre les fraudes sur la plateforme.</li>
          </ul>
          <p>
            <strong>DJASSA ne vend et ne loue jamais vos données personnelles</strong>{" "}
            à des tiers commerciaux.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            3. Vos droits (Accès, Rectification et Suppression)
          </h2>
          <p>
            Vous disposez d&apos;un droit total d&apos;accès, de modification et
            de suppression de vos données personnelles. Vous pouvez modifier vos
            coordonnées ou supprimer définitivement votre compte et toutes vos
            annonces directement depuis{" "}
            <Link
              href="/mon-compte"
              className="text-emerald-700 font-bold hover:underline"
            >
              votre espace personnel
            </Link>
            , ou nous écrire via la page{" "}
            <Link
              href="/contact"
              className="text-emerald-700 font-bold hover:underline"
            >
              Contact
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
