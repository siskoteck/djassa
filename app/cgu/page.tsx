import Link from "next/link";

export default function CguDjassaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
            RÈGLES D&apos;UTILISATION • CÔTE D&apos;IVOIRE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Dernière mise à jour : Novembre 2026 — DJASSA Abidjan
          </p>
        </div>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            1. Objet de la plateforme DJASSA
          </h2>
          <p>
            <strong>DJASSA</strong> est une plateforme en ligne de petites
            annonces mettant en relation des vendeurs (particuliers et
            commerçants) et des acheteurs à Abidjan et sur l&apos;ensemble du
            territoire de la Côte d&apos;Ivoire. DJASSA agit uniquement en tant
            qu&apos;intermédiaire technique et n&apos;intervient pas dans les
            transactions financières entre utilisateurs.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            2. Publication d&apos;annonces et articles interdits
          </h2>
          <p>
            La publication d&apos;annonces sur DJASSA est gratuite. Le vendeur
            s&apos;engage à proposer uniquement des biens licites, disponibles et
            dont il est légitimement propriétaire. Sont strictement interdits :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Les produits contrefaits, volés ou illégaux en Côte d&apos;Ivoire.</li>
            <li>Les armes, substances stupéfiantes, médicaments sans autorisation.</li>
            <li>Les annonces trompeuses, fausses promotions ou usurpations d&apos;identité.</li>
          </ul>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            3. Sécurité des transactions et responsabilités
          </h2>
          <p>
            Les acheteurs et vendeurs conviennent directement entre eux du lieu
            de rencontre et du mode de paiement. DJASSA recommande vivement de{" "}
            <strong>
              ne jamais envoyer d&apos;argent (Mobile Money, Wave, virement)
              avant d&apos;avoir vu et vérifié l&apos;article en personne
            </strong>{" "}
            dans un lieu public sécurisé.
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            4. Modération et suppression de compte
          </h2>
          <p>
            L&apos;équipe DJASSA se réserve le droit de retirer sans préavis
            toute annonce ne respectant pas les présentes CGU. Chaque
            utilisateur peut également modifier ses annonces ou supprimer
            définitivement son compte à tout moment depuis la rubrique{" "}
            <Link
              href="/mon-compte"
              className="text-emerald-700 font-bold hover:underline"
            >
              Mon compte
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
