import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profiles = [
  // --- Joiners (truhlář) — remaining 3 ---
  {
    fullName: 'Truhlářství Bohemia s.r.o.',
    email: 'poptavka@truhlarstvi-bohemia.cz',
    phone: '+420 774 226 742',
    serviceId: 'truhlar',
    cityId: 'ceske-budejovice',
    address: 'Plavská 598, 373 81 Kamenný Újezd',
    description: 'Truhlářství — výroba kuchyní, nábytku a interiérů na míru. Jihočeský kraj.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Truhlářství Fencl — Tomáš Fencl',
    email: 'info@truhlarstvifencl.cz',
    phone: '+420 731 118 735',
    serviceId: 'truhlar',
    cityId: 'ceske-budejovice',
    address: 'Budějovická 620, 373 11 Ledenice',
    description: 'Zakázkové truhlářství — kuchyně, dveře, okna, nábytek. Oblast Českých Budějovic.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Truhlářství Souhrada — Martin Souhrada',
    email: 'truhlarstvisouhrada@seznam.cz',
    phone: '+420 724 806 776',
    serviceId: 'truhlar',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Truhlářské práce na míru — nábytek, vestavěné skříně, kuchyně, renovace.',
    picturePath: null,
    active: true,
  },

  // --- Movers (stěhování) — remaining 2 ---
  {
    fullName: 'Stěhování Mamut',
    email: 'info@stehovanimamut.cz',
    phone: '+420 602 321 004',
    serviceId: 'stehovaci-firma',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Stěhování bytů, domů a firem. Zkušený tým, šetrné zacházení s nábytkem.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Stěhování Zadražil',
    email: 'stehovanizadrazil@seznam.cz',
    phone: '+420 777 266 105',
    serviceId: 'stehovaci-firma',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Stěhování domácností a kanceláří v Jihočeském kraji. Rychlé a spolehlivé.',
    picturePath: null,
    active: true,
  },

  // --- Painters (malíř) — remaining 3 ---
  {
    fullName: 'Radim Štěpánek — Malířství a lakýrnictví',
    email: 'radim-stepanek@seznam.cz',
    phone: '+420 776 307 759',
    serviceId: 'malir',
    cityId: 'ceske-budejovice',
    address: 'Trnková 1850/10, 370 05 České Budějovice',
    description: 'Rodinná firma od roku 1997. Malování, natěračství, lakýrnictví, dekorativní techniky.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Malířství Novák — Tomáš Novák',
    email: 'novak.malirstvi@seznam.cz',
    phone: '+420 720 365 322',
    serviceId: 'malir',
    cityId: 'ceske-budejovice',
    address: 'Bezdrevská 1159/15, 370 11 České Budějovice',
    description: 'Malíř pokojů — interiéry, exteriéry, fasády, tapetování. Kvalitní práce za rozumnou cenu.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Malířství Petr Škoda s.r.o.',
    email: 'info@malirstvi-skoda.cz',
    phone: '+420 604 533 924',
    serviceId: 'malir',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Malování a natěračství od roku 2000. Byty, domy, kanceláře i průmyslové objekty.',
    picturePath: null,
    active: true,
  },

  // --- Carpenters (tesař) — remaining 3 ---
  {
    fullName: 'Truhlářství Bohemia — Tesařství',
    email: 'info@truhlarstvi-bohemia.cz',
    phone: '+420 774 226 742',
    serviceId: 'tesar',
    cityId: 'ceske-budejovice',
    address: 'Plavská 598, 373 81 Kamenný Újezd',
    description: 'Tesařství a dřevěné konstrukce — krovy, pergoly, přístřešky. Oblast Českých Budějovic.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Miroslav Kalkán — Tesař',
    email: null,
    phone: '+420 776 236 459',
    serviceId: 'tesar',
    cityId: 'ceske-budejovice',
    address: 'Větrná 38, 370 05 České Budějovice',
    description: 'Tesařské práce — krovy, střešní konstrukce, opravy a novostavby v Českých Budějovicích.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'RVM Tesařské konstrukce s.r.o.',
    email: null,
    phone: '+420 777 263 626',
    serviceId: 'tesar',
    cityId: 'ceske-budejovice',
    address: 'Skuherského 28/1461, 370 01 České Budějovice',
    description: 'Tesařské a truhlářské konstrukce. Krovy, střechy, dřevostavby v jihočeském regionu.',
    picturePath: null,
    active: true,
  },
];

async function main() {
  for (const p of profiles) {
    const created = await prisma.provider.create({ data: p });
    console.log(`Created: ${created.fullName} (${created.id})`);
  }
  console.log(`Done. Total added: ${profiles.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
