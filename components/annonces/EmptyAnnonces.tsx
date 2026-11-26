import Link from "next/link";

interface Props {
  message?: string;
  sousMessage?: string;
}

export function EmptyAnnonces({
  message = "Aucune annonce publiée pour le moment",
  sousMessage = "Soyez le premier vendeur à publier un article sur DJASSA Abidjan !",
}: Props) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-10 text-center">
      <p className="text-lg font-bold text-gray-900 mb-2">{message}</p>
      <p className="text-sm text-gray-600 mb-6">{sousMessage}</p>
      <Link
        href="/publier"
        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
      >
        + Publier une annonce gratuite
      </Link>
    </div>
  );
}
