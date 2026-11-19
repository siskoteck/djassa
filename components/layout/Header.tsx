import Link from "next/link";
import AuthButtons from "./AuthButtons";

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo DJASSA */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-orange-600">
              DJASSA
            </span>
            <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full hidden sm:inline">
              Abidjan
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/annonces"
              className="text-gray-700 hover:text-orange-600 font-medium transition"
            >
              Parcourir les annonces
            </Link>
            <Link
              href="/publier"
              className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-xl font-semibold text-sm transition"
            >
              + Vendre un article
            </Link>
            <Link
              href="/comment-ca-marche"
              className="text-gray-700 hover:text-orange-600 font-medium transition"
            >
              Comment ça marche
            </Link>
          </nav>

          {/* Boutons de connexion / compte */}
          <AuthButtons />
        </div>

        {/* Navigation Mobile (visible uniquement sur téléphone) */}
        <nav className="flex md:hidden items-center justify-around border-t border-gray-100 py-2 text-xs font-medium text-gray-700">
          <Link href="/annonces" className="hover:text-orange-600 py-1">
            🔍 Annonces
          </Link>
          <Link
            href="/publier"
            className="text-orange-600 font-semibold py-1"
          >
            ➕ Vendre un article
          </Link>
          <Link href="/comment-ca-marche" className="hover:text-orange-600 py-1">
            ℹ️ Aide
          </Link>
        </nav>
      </div>
    </header>
  );
}
