import Link from "next/link";
import Image from "next/image";
import type { Annonce } from "@/lib/types";
import { formaterPrixFCFA } from "@/lib/utils";

export function AnnonceCard({ annonce }: { annonce: Annonce }) {
  const photo = Array.isArray(annonce.photos) && annonce.photos[0]
    ? annonce.photos[0]
    : null;

  return (
    <Link
      href={`/annonces/${annonce.id}`}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-400 transition flex flex-col"
    >
      <div className="relative h-48 bg-gray-100">
        {photo ? (
          <Image
            src={photo}
            alt={annonce.titre}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
            sizes="(max-width: 640px) 100vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Aucune photo
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 bg-white/95 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
          {annonce.etat}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-emerald-700 font-black text-lg">
            {formaterPrixFCFA(annonce.prix)}
          </p>
          <h3 className="font-bold text-gray-900 text-sm mt-1 line-clamp-2">
            {annonce.titre}
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-2.5 border-t border-gray-100">
          📍 {annonce.commune}
          {annonce.quartier ? ` (${annonce.quartier})` : ""}
        </p>
      </div>
    </Link>
  );
}