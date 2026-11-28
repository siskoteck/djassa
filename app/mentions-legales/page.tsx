import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions Légales | DJASSA Abidjan",
  description:
    "Informations légales, éditeur, hébergeur et contact officiel de la marketplace DJASSA Abidjan en Côte d'Ivoire.",
};

export default function MentionsLegalesDjassaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <span className="bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full">
            INFORMATIONS LÉGALES • CÔTE D&apos;IVOIRE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">
            Mentions Légales
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Plateforme de petites annonces DJASSA Abidjan
          </p>
        </div>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            1. Éditeur de la plateforme
          </h2>
          <p>
            La plateforme <strong>DJASSA Abidjan</strong> (accessible à
            l&apos;adresse <strong>djassa-xi.vercel.app</strong>) est une
            place de marché numérique dédiée à l&apos;achat et la vente
            d&apos;articles neufs et d&apos;occasion à Abidjan et en Côte
            d&apos;Ivoire.
          </p>
          <p>
            <strong>Siège d&apos;exploitation :</strong> Abidjan, Côte d&apos;Ivoire
            <br />
            <strong>Support WhatsApp officiel :</strong>{" "}
            <a
              href="https://wa.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 font-bold underline"
            >
              Contacter l&apos;équipe DJASSA sur WhatsApp
            </a>
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            2. Hébergement technique
          </h2>
          <p>
            L&apos;application web est hébergée par{" "}
            <strong>Vercel Inc.</strong> (440 N Barranca Ave #4133, Covina, CA
            91723, États-Unis) et les données sont stockées sur l&apos;infrastructure
            sécurisée <strong>Supabase Inc.</strong>
          </p>
        </section>

        <section className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <h2 className="text-base font-extrabold text-gray-900">
            3. Responsabilité &amp; Transactions
          </h2>
          <p>
            DJASSA agit en qualité d&apos;hébergeur technique mettant en relation
            acheteurs et vendeurs. Chaque vendeur est responsable de
            l&apos;exactitude et de la licéité de ses annonces. Nous recommandons
            toujours la remise en main propre dans un lieu public à Abidjan avant
            tout paiement.
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs font-bold text-amber-700">
          <Link href="/confidentialite" className="hover:underline">
            Politique de confidentialité →
          </Link>
          <Link href="/cgu" className="hover:underline">
            Conditions Générales d&apos;Utilisation →
          </Link>
        </div>
      </div>
    </div>
  );
}