export function formatTelephoneWhatsApp(
  telephone: string | null | undefined
): string {
  let chiffres = (telephone || "").replace(/\D/g, "");
  if (chiffres.length === 10 && chiffres.startsWith("0")) {
    chiffres = "225" + chiffres;
  } else if (chiffres.startsWith("00225")) {
    chiffres = chiffres.slice(2);
  }
  return chiffres;
}

export function genererLienWhatsApp(
  telephone: string | null | undefined,
  nomOuArticle?: string,
  messagePersonnalise?: string
): string {
  const numero = formatTelephoneWhatsApp(telephone);
  const texteParDefaut = nomOuArticle
    ? `Bonjour ${nomOuArticle}, j'ai vu votre annonce sur DJASSA Abidjan et je suis intéressé(e).`
    : "Bonjour, j'ai vu votre annonce sur DJASSA Abidjan et je suis intéressé(e).";

  const texte = encodeURIComponent(messagePersonnalise || texteParDefaut);
  return `https://wa.me{numero}?text=${texte}`;
}

export function genererLienWhatsAppAchat(
  telephone: string | null | undefined,
  titreArticle?: string,
  prix?: number | string | null
): string {
  const numero = formatTelephoneWhatsApp(telephone);
  const detailPrix = prix ? ` au prix de ${prix} FCFA` : "";
  const message = titreArticle
    ? `Bonjour, j'ai vu votre article "${titreArticle}"${detailPrix} sur DJASSA Abidjan. Est-il toujours disponible ?`
    : "Bonjour, j'ai vu votre article sur DJASSA Abidjan. Est-il toujours disponible ?";

  return `https://wa.me{numero}?text=${encodeURIComponent(message)}`;
}
