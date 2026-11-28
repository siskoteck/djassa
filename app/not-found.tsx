import Link from "next/link";
import { Home, Search, PlusCircle } from "lucide-react";

export default function NotFoundDjassa() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 text-center shadow-xs space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 font-black text-2xl flex items-center justify-center mx-auto">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Oups, cette annonce ou page n&apos;existe plus
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          L&apos;article a peut-être déjà été vendu ou retiré par son vendeur sur DJASSA Abidjan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm px-5 py-3 rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            <span>Accueil DJASSA</span>
          </Link>
          <Link
            href="/annonces"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-sm px-5 py-3 rounded-xl transition"
          >
            <Search className="w-4 h-4" />
            <span>Voir toutes les annonces</span>
          </Link>
        </div>
        <div className="pt-2">
          <Link
            href="/publier"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Publier une annonce gratuitement</span>
          </Link>
        </div>
      </div>
    </div>
  );
}