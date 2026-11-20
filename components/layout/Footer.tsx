import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xl font-extrabold text-emerald-500">DJASSA</span>
          <p className="text-xs text-gray-400 mt-1">
            Achetez et vendez rapidement entre particuliers et boutiques à Abidjan.
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <Link href="/annonces" className="hover:text-white">
            Toutes les annonces
          </Link>
          <Link href="/publier" className="hover:text-white">
            Déposer une annonce
          </Link>
        </div>

        <p className="text-xs text-gray-500">© 2026 DJASSA Abidjan.</p>
      </div>
    </footer>
  );
}
