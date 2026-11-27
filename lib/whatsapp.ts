export function formaterNumeroCIDjassa(tel: string | null | undefined): string {
  if (!tel) return "";
  let chiffres = String(tel).replace(/\D/g, "");
  if (chiffres.length === 10 && chiffres.startsWith("0")) {
    chiffres = "225" + chiffres;
  } else if (chiffres.length === 8) {
    chiffres = "225" + chiffres;
  } else if (chiffres.startsWith("00225")) {
    chiffres = chiffres.slice(2);
  }
  return chiffres;
}

export function formaterNumeroCI8ChiffresDjassa(tel: string | null | undefined): string {
  const c10 = formaterNumeroCIDjassa(tel);
  if (c10.length === 13 && c10.startsWith("2250")) {
    return "225" + c10.slice(5);
  }
  return c10;
}

export function genererLienWhatsAppAchat(
  telephone: string | null | undefined,
  _titreArticle?: string
): string {
  const chiffres = formaterNumeroCIDjassa(telephone);
  if (!chiffres) return "";
  return "https://wa.me/" + chiffres;
}

export function genererLienWhatsApp8ChiffresDjassa(
  telephone: string | null | undefined
): string {
  const chiffres8 = formaterNumeroCI8ChiffresDjassa(telephone);
  if (!chiffres8) return "";
  return "https://wa.me/" + chiffres8;
}
