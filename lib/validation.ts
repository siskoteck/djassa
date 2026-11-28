export function validerNumeroTelephoneCIDjassa(tel: string): {
  valide: boolean;
  message?: string;
} {
  const chiffres = (tel || "").replace(/\D/g, "");
  if (!chiffres) {
    return { valide: false, message: "Veuillez saisir votre numéro WhatsApp." };
  }
  const sansIndicatif = chiffres.startsWith("225") ? chiffres.slice(3) : chiffres;
  if (sansIndicatif.length !== 10 && sansIndicatif.length !== 8) {
    return {
      valide: false,
      message: "Numéro invalide : entrez les 10 chiffres (ex: 07 07 00 00 00).",
    };
  }
  return { valide: true };
}