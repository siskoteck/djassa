import { COMMUNES_ABIDJAN } from "@/lib/constantes";

interface Props {
  recherche: string;
  setRecherche: (v: string) => void;
  commune: string;
  setCommune: (v: string) => void;
  onReset: () => void;
}

export function SearchBarDjassa({
  recherche,
  setRecherche,
  commune,
  setCommune,
  onReset,
}: Props) {
  return (
    <div className="mt-7 bg-white rounded-2xl p-3 shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-gray-900">
      <input
        type="text"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Que cherchez-vous ? (iPhone, frigo, studio...)"
        className="sm:col-span-2 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
        aria-label="Recherche"
      />
      <select
        value={commune}
        onChange={(e) => setCommune(e.target.value)}
        className="border border-gray-200 rounded-xl px-3.5 py-3 text-sm bg-white font-medium"
        aria-label="Commune"
      >
        <option value="Toutes">Toutes les communes</option>
        {COMMUNES_ABIDJAN.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onReset}
        className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm py-3 px-4 rounded-xl transition"
      >
        Réinitialiser
      </button>
    </div>
  );
}
