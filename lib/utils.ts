export function formaterPrixFCFA(prix: number): string {
  if (!prix || prix <= 0) return "Prix à débattre";
  return prix.toLocaleString("fr-FR") + " FCFA";
}
