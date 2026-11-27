import type { Categorie } from "@/lib/types";

interface Props {
  categories: Categorie[];
  categorieId: number | "Toutes";
  setCategorieId: (id: number | "Toutes") => void;
}

export function CategoriesGrid({
  categories,
  categorieId,
  setCategorieId,
}: Props) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
          Explorer par catégorie
        </h2>
        {categorieId !== "Toutes" && (
          <button className="group transition-all duration-200 hover:-translate-y-1 active:scale-95"
            type="button"
            onClick={() => setCategorieId("Toutes")}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Voir toutes les catégories
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat) => {
          const estActive = categorieId === cat.id;
          return (
            <button className="group transition-all duration-200 hover:-translate-y-1 active:scale-95"
              key={cat.id}
              type="button"
              onClick={() => setCategorieId(estActive ? "Toutes" : cat.id)}
              className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                estActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white hover:border-emerald-400 text-gray-800 border-gray-200"
              }`}
            >
              <span className="text-2xl">{cat.icone || "🛍️"}</span>
              <span className="text-xs font-bold leading-tight">{cat.nom}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
