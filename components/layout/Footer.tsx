"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Colonne 1 - Logo & Description */}
          <div>
            <h3 className="text-2xl font-extrabold text-orange-500 mb-4">
              DJASSA
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              La marketplace de vente et d&apos;achat entre particuliers à
              Abidjan. Publiez gratuitement et échangez directement sur WhatsApp.
            </p>
          </div>

          {/* Colonne 2 - Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Explorer</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/annonces" className="hover:text-orange-500">
                  Parcourir les annonces
                </Link>
              </li>
              <li>
                <Link href="/publier" className="hover:text-orange-500">
                  Vendre un article
                </Link>
              </li>
              <li>
                <Link href="/comment-ca-marche" className="hover:text-orange-500">
                  Comment ça marche
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-orange-500">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 - Légal */}
          <div>
            <h4 className="font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-orange-500">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:text-orange-500">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-orange-500">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="hover:text-orange-500"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 - Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-gray-400">Abidjan, Côte d&apos;Ivoire</p>
            <p className="text-sm text-gray-400 mt-2">contact@djassa.ci</p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © 2026 DJASSA. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
