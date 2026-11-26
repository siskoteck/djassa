function buildWhatsAppUrl(phone: string | null, itemTitle: string): string {
  let digits = (phone || "").replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) digits = "225" + digits;
  const msg = encodeURIComponent(`Bonjour, votre annonce "${itemTitle}" sur DJASSA m'intéresse.`);
  return `https://wa.me{digits}?text=${msg}`;
}
