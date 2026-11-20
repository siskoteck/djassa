export function genererLienWhatsAppAchat(
  telephone: string | null | undefined,
  titreArticle: string,
  prix?: number | string | null
): string {
  let chiffres = (telephone || "").replace(/\D/g, "");
  if (chiffres.length === 10 && chiffres.startsWith("0")) {
    chiffres = "225" + chiffres;
  } else if (chiffres.startsWith("00225")) {
    chiffres = chiffres.slice(2);
  }

  const detailPrix = prix ? ` à ${Number(prix).toLocaleString("fr-FR")} FCFA` : "";
  const message = `Bonjour, j'ai vu votre annonce "${titreArticle}"${detailPrix} sur DJASSA Abidjan. Est-elle toujours disponible ?`;

  return `https://wa.me{chiffres}?text=${encodeURIComponent(message)}`;
}
