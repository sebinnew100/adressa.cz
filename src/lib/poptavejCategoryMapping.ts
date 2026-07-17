// Maps Poptávej.cz's own category taxonomy to the closest matching
// adressa.cz SERVICES category. Best-effort — several of their categories
// (Hobby, Textil a oděvy, Zabezpečení, etc.) have no clean local-services
// match and are left unmapped rather than guessed.
const POPTAVEJ_CATEGORY_TO_SERVICE: Record<string, string> = {
  'auto-moto': 'autoservis',
  'doprava-a-logistika': 'stehovaci-firma',
  'drevo': 'truhlar',
  'elektro': 'elektrikar',
  'informacni-technologie': 'it-technik',
  'nabytek': 'truhlar',
  'ostatni': 'jine',
  'reality': 'realitni-makler',
  'reklama-a-tisk': 'grafik',
  'remesla': 'jine',
  'sluzby': 'jine',
  'stavebni-material': 'zednik',
  'stavebnictvi': 'zednik',
  'zahrada': 'zahradnik',
  'zemedelstvi': 'zahradnik',
};

export function serviceIdForPoptavejCategory(categorySlug: string | null | undefined): string | null {
  if (!categorySlug) return null;
  return POPTAVEJ_CATEGORY_TO_SERVICE[categorySlug] ?? null;
}
