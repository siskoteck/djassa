export function genererLienWhatsAppAchat(
  telephone: string,
  vendeurNom: string,
  titreArticle: string,
  prixFcfa: number
): string {
  let chiffres = telephone.replace(/\D/g, "");
  if (chiffres.length === 10 && chiffres.startsWith("0")) {
    chiffres = `225${chiffres}`;
  } else if (chiffres.startsWith("00225")) {
    chiffres = chiffres.slice(2);
  }

  const prixFormate = prixFcfa.toLocaleString("fr-FR");
  const message = `Bonjour ${vendeurNom}, j'ai vu votre annonce "${titreArticle}" à ${prixFormate} FCFA sur DJASSA. Est-ce toujours disponible ?`;

  return `https://wa.me{chiffres}?text=${encodeURIComponent(message)}`;
}
