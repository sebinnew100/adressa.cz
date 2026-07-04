export interface ArticleCategory {
  id: string;
  nameCz: string;
  descriptionCz: string;
  serviceIds: string[];
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    id: 'remeslnici',
    nameCz: 'Řemeslníci',
    descriptionCz: 'Rady a ceníky pro elektrikáře, instalatéry, malíře, truhláře, zedníky a další řemeslné obory.',
    serviceIds: ['elektrikar', 'instalater', 'malir', 'tesar', 'truhlar', 'zednik', 'klempir'],
  },
  {
    id: 'pece-o-domacnost',
    nameCz: 'Péče o domácnost',
    descriptionCz: 'Úklid, zahradnictví, stěhování a další služby pro chod domácnosti.',
    serviceIds: ['uklid', 'zahradnik', 'stehovaci-firma'],
  },
  {
    id: 'odborne-sluzby',
    nameCz: 'Odborné služby',
    descriptionCz: 'Účetní, právníci, IT technici, překladatelé a další odborné profese.',
    serviceIds: ['ucetni', 'pravnik', 'it-technik', 'prekladatel', 'architekt', 'realitni-makler'],
  },
  {
    id: 'osobni-sluzby',
    nameCz: 'Osobní služby',
    descriptionCz: 'Kadeřníci, lékaři, fotografové, trenéři a další služby pro jednotlivce.',
    serviceIds: ['kadernik', 'lekar', 'fotograf', 'trener', 'psycholog', 'zubar'],
  },
  {
    id: 'auto-a-doprava',
    nameCz: 'Auto a doprava',
    descriptionCz: 'Autoservisy a další služby spojené s automobily.',
    serviceIds: ['autoservis'],
  },
];
