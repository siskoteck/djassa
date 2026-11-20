import Link from "next/link";
import { CATEGORIES_DJASSA } from "@/lib/constantes";

export default function HomeDjassaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white shadow-md">
        <span className="bg-white/20 text-xs font-bold px-3 py-1 rounded-full">
          LE MARCHÉ EN LIGNE D&apos;ABIDJAN
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold mt-3 max-w-2xl leading-tight">
          Achetez et vendez facilement autour de vous sur DJASSA
        </h1>
        <p className="text-emerald-50 text-sm sm:text-base mt-3 max-w-xl">
          Téléphones, véhicules, immobilier, mode ou électroménager : publiez
          votre annonce gratuitement et discutez directement sur WhatsApp.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/annonces"
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-6 py-3 rounded-xl text-sm transition"
          >
            🔍 Explorer les annonces
          </Link>
          <Link
            href="/publier"
            className="bg-emerald-900/40 hover:bg-emerald-900/60 border border-white/30 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
          >
            + Publier une annonce gratuite
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Catégories populaires
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CATEGORIES_DJASSA.map((cat) => (
            <Link
              key={cat}
              href={`/annonces?categorie=${encodeURIComponent(cat)}`}
              className="bg-white border border-gray-200 hover:border-emerald-400 rounded-2xl p-4 text-sm font-semibold text-gray-800 hover:text-emerald-700 transition shadow-sm"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
