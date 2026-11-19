// Domaine des e-mails fictifs : aucun vrai e-mail ne doit jamais y être envoyé.
export const DOMAINE_FICTIF = "bara.ci";

// Supabase exige un e-mail : on fabrique une adresse fictive à partir du téléphone.
// Utilisée à l'inscription ET à la connexion pour obtenir exactement la même adresse.
export function telephoneVersEmail(telephone: string) {
  let chiffres = telephone.replace(/\D/g, ""); // garde uniquement les chiffres

  // Retire l'indicatif ivoirien : +225 07 07 24 96 78 → 0707249678
  if (chiffres.length === 13 && chiffres.startsWith("225")) {
    chiffres = chiffres.slice(3);
  }

  return `${chiffres}@${DOMAINE_FICTIF}`;
}

// Vrai si l'adresse est un e-mail fictif fabriqué à partir d'un téléphone.
export function estEmailFictif(email: string) {
  return email.trim().toLowerCase().endsWith(`@${DOMAINE_FICTIF}`);
}