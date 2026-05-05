import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profiles = [
  // --- Gardeners (zahradník) --- 12 profiles ---
  {
    fullName: 'Ing. Petr Klíma — Zahradní centrum',
    email: 'klima.cb@volny.cz',
    phone: '+420 602 734 082',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Strakonická 1072, 370 04 České Budějovice',
    description: 'Zahradní centrum — zakládání a úpravy zahrad, výsadba, sekání trávy, údržba zeleně.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Zahradnické centrum Ferenčík',
    email: 'info@ferencik.cz',
    phone: '+420 602 779 652',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Generála Píky 729/2, 370 01 České Budějovice',
    description: 'Zahradnické centrum — prodej rostlin, návrh a realizace zahrad, zahradnické služby.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Zahradnictví ANTIARIS s.r.o.',
    email: 'antiaris@antiaris.cz',
    phone: '+420 777 235 288',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'U Voříškův Dvůr 548, 370 04 České Budějovice',
    description: 'Zahradnictví — realizace zahrad, terénní úpravy, trávníky, záhony, údržba.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Petra Daňková — Krásná zahrada',
    email: 'krasna-zahrada@seznam.cz',
    phone: '+420 602 376 292',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Suchomelská 2716/34, 370 04 České Budějovice',
    description: 'Návrh a realizace zahrad na míru — výsadba, okrasné prvky, údržba celoročně.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Zahrady OUPIC — Jarda Oupic',
    email: 'jardaoupic@seznam.cz',
    phone: '+420 604 231 577',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'U Rybníka 2245/2, Dobrá Voda u Českých Budějovic',
    description: 'Zahradnické práce — zakládání zahrad, sekání trávníků, výsadba, tvarování keřů.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Petr Hrdina — Zahrady bez vady',
    email: 'pet.hrdina@gmail.com',
    phone: '+420 724 819 280',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Hlavní 56, Nové Homole, České Budějovice',
    description: 'Kompletní zahradnické služby — trávníky, záhony, terénní úpravy, pravidelná údržba.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Robert Hajný — Zahrady Hajný',
    email: 'robhajny@seznam.cz',
    phone: '+420 603 264 729',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Doubravice 142, 370 06 České Budějovice',
    description: 'Realizace a údržba zahrad v Českých Budějovicích a okolí. Výsadba, sekání, stříhání.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Jaroslav Coufal — HELPMAN zahradnické práce',
    email: 'j.coufal@helpman-cb.cz',
    phone: '+420 603 277 743',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Otakarova 1658/36, 370 01 České Budějovice',
    description: 'Zahradnické práce a drobné opravy. Sekání trávy, výsadba, úpravy zahrady.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'WISTERIA s.r.o. — Zahradní ateliér',
    email: 'wisteria@wisteria.cz',
    phone: '+420 602 409 460',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Jeremiášova 1712/21, 370 01 České Budějovice',
    description: 'Zahradní ateliér — projektování a realizace zahrad, střešní zahrady, terasy.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'BO TREE zahradní ateliér s.r.o.',
    email: 'botree@botree.cz',
    phone: '+420 602 104 622',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Planá 7, 370 01 České Budějovice',
    description: 'Návrh a realizace zahrad — moderní zahrady, přírodní zahrady, péče o dřeviny.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'ARBON — Péče o dřeviny a arboristika',
    email: 'richard.jirak@centrum.cz',
    phone: '+420 739 828 527',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Drátenická 2276/4, 370 07 České Budějovice',
    description: 'Arboristika, kácení a ořez stromů, péče o dřeviny, zahradnické práce.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Bc. Jan Kec — Zahradnictví KEC',
    email: null,
    phone: '+420 607 252 546',
    serviceId: 'zahradnik',
    cityId: 'ceske-budejovice',
    address: 'Dr. Stejskala 110/11, 370 01 České Budějovice',
    description: 'Zahradnické práce — úpravy a zakládání zahrad, výsadba, trávníky, průklesty.',
    picturePath: null,
    active: true,
  },

  // --- Movers (stěhování) — 1 additional ---
  {
    fullName: 'Šikula-Stěhovák s.r.o.',
    email: 'info@sikula-stehovak.cz',
    phone: '+420 773 282 389',
    serviceId: 'stehovaci-firma',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Profesionální stěhování s tradicí od roku 1996. Byty, domy, kanceláře, celá ČR.',
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
