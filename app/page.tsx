import Link from "next/link";

export default function HomeDjassaPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <span className="bg-orange-100 text-orange-800 text-xs font-extrabold px-3 py-1 rounded-full mb-4">
        CÔTE D&apos;IVOIRE • ABIDJAN
      </span>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
        Bienvenue sur <span className="text-orange-600">DJASSA</span>
      </h1>
      <p className="text-gray-600 max-w-xl mt-4 text-base sm:text-lg">
        Achetez, vendez et faites de bonnes affaires rapidement et en toute
        confiance à Abidjan et partout en Côte d&apos;Ivoire.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Link
          href="/annonces"
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          Voir les annonces
        </Link>
        <Link
          href="/publier"
          className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-900 font-bold px-6 py-3 rounded-xl transition"
        >
          + Publier une annonce gratuite
        </Link>
      </div>
    </main>
  );
}
