// Maps a CPV (Common Procurement Vocabulary) code — the EU-wide classification
// used on all Czech public procurement notices — to the closest matching
// adressa.cz SERVICES category. Best-effort: many CPV codes have no clean
// match to our local-services taxonomy, and those are left unmapped (still
// shown, just without a relatedServiceId filter/badge) rather than guessed.
// Ordered longest-prefix-first so more specific codes win over broad ones.
const CPV_PREFIX_TO_SERVICE: [prefix: string, serviceId: string][] = [
  ['45310', 'elektrikar'],
  ['45330', 'instalater'],
  ['45440', 'malir'],
  ['45420', 'truhlar'],
  ['45422', 'tesar'],
  ['452625', 'zednik'],
  ['452619', 'klempir'],
  ['451127', 'zahradnik'],
  ['77310', 'zahradnik'],
  ['50112', 'autoservis'],
  ['5030', 'it-technik'],
  ['72', 'it-technik'],
  ['71200', 'architekt'],
  ['79100', 'pravnik'],
  ['79210', 'ucetni'],
  ['79961', 'fotograf'],
  ['798225', 'grafik'],
  ['79530', 'prekladatel'],
  ['90910', 'uklid'],
  ['98392', 'stehovaci-firma'],
  ['8513', 'zubar'],
  ['85121', 'lekar'],
  ['80', 'ucitel'],
];

export function serviceIdForCpvCode(cpvCode: string | null | undefined): string | null {
  if (!cpvCode) return null;
  const match = CPV_PREFIX_TO_SERVICE
    .filter(([prefix]) => cpvCode.startsWith(prefix))
    .sort((a, b) => b[0].length - a[0].length)[0];
  return match ? match[1] : null;
}
