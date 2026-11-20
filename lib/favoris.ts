const CLE_FAVORIS = "djassa_favoris_ids";

export function obtenirFavorisIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const brut = localStorage.getItem(CLE_FAVORIS);
    const parsed = brut ? JSON.parse(brut) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function basculerFavoriId(id: string): string[] {
  const actuels = obtenirFavorisIds();
  const existe = actuels.includes(id);
  const suivants = existe
    ? actuels.filter((item) => item !== id)
    : [id, ...actuels];

  if (typeof window !== "undefined") {
    localStorage.setItem(CLE_FAVORIS, JSON.stringify(suivants));
    window.dispatchEvent(new Event("djassa-favoris-maj"));
  }
  return suivants;
}
