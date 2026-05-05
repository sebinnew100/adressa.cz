import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profiles = [
  // --- Painters (malíř) ---
  {
    fullName: 'Radek Furmánek — Malíř pokojů, natěrač',
    email: 'info@maliri-budejovice.cz',
    phone: '+420 774 777 787',
    serviceId: 'malir',
    cityId: 'ceske-budejovice',
    address: 'České Vrbné 1906, 370 11 České Budějovice',
    description: 'Malíř pokojů a natěrač v Českých Budějovicích. Malování interiérů i exteriérů, tapetování, nátěry fasád.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Jiří Dočekal — Malířství a natěračství',
    email: 'info@malirstvi-docekal.cz',
    phone: '+420 728 561 731',
    serviceId: 'malir',
    cityId: 'ceske-budejovice',
    address: 'Opalice 22, Kamenný Újezd, 370 07',
    description: 'Profesionální malíř a natěrač se sídlem v okrese České Budějovice. Interiéry, exteriéry, fasády.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Jiří Dráb — Dráb Malířství',
    email: 'DrabMalirstvi@seznam.cz',
    phone: '+420 603 444 520',
    serviceId: 'malir',
    cityId: 'ceske-budejovice',
    address: 'Kasárenska 157/4, 370 01 České Budějovice',
    description: 'Malířství s tradicí od roku 1991. Malování, tapetování, nátěry, dekorativní techniky.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Malířství OK',
    email: 'info@malirstvi-ok.cz',
    phone: '+420 601 390 538',
    serviceId: 'malir',
    cityId: 'ceske-budejovice',
    address: 'Generála Svobody 434/49, 370 01 České Budějovice',
    description: 'Malířské a natěračské práce v Českých Budějovicích a okolí. Byty, domy, firmy.',
    picturePath: null,
    active: true,
  },

  // --- Carpenters (tesař) ---
  {
    fullName: 'Jan Řehovský — Truhlář a tesař',
    email: 'janrehovsky@gmail.com',
    phone: '+420 777 650 548',
    serviceId: 'tesar',
    cityId: 'ceske-budejovice',
    address: 'Hlinsko 19, 370 01 České Budějovice',
    description: 'Tesař a truhlář — výroba a montáž dřevěných konstrukcí, schodišť, krovů, nábytku na míru.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Petr Dvořáček — PD Střechy a tesařství',
    email: 'dvoracek@pdstrechy.cz',
    phone: '+420 607 747 514',
    serviceId: 'tesar',
    cityId: 'ceske-budejovice',
    address: 'Žár 41, 374 01 Trhové Sviny',
    description: 'Tesařství, krovy, střechy. Výroba a montáž dřevěných konstrukcí v jihočeském kraji.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Jaroslav Netušil — Tesař',
    email: null,
    phone: '+420 604 943 160',
    serviceId: 'tesar',
    cityId: 'ceske-budejovice',
    address: 'V. Nezvala 32/1528, 370 06 České Budějovice',
    description: 'Tesařské práce — krovy, přístřešky, dřevěné konstrukce, rekonstrukce střech.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Rostislav Hněvsa — Tesař',
    email: null,
    phone: '+420 602 590 360',
    serviceId: 'tesar',
    cityId: 'ceske-budejovice',
    address: 'Dlouhá 25/1041, 370 11 České Budějovice',
    description: 'Tesař s praxí v Českých Budějovicích. Krovy, dřevěné konstrukce, opravy a novostavby.',
    picturePath: null,
    active: true,
  },
];

async function main() {
  for (const p of profiles) {
    const created = await prisma.provider.create({ data: p });
    console.log(`Created: ${created.fullName} (${created.id})`);
  }
  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
