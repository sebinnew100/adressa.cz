import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profiles = [
  // --- Electricians ---
  {
    fullName: 'Alan Jakubec',
    email: null,
    phone: '+420 605 739 188',
    serviceId: 'elektrikar',
    cityId: 'ceske-budejovice',
    address: 'Preslova 21, 370 01 České Budějovice',
    description: 'Elektrikář s dlouholetou praxí v Českých Budějovicích. Rozvody elektřiny, opravy, revize.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Ing. David Hruda',
    email: 'david@elektro-hruda.cz',
    phone: '+420 602 975 318',
    serviceId: 'elektrikar',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Elektroinstalace bytů, rodinných domů a komerčních prostor. Revize elektrických zařízení.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Pavel Lískovec ml.',
    email: 'info@pelektrol.cz',
    phone: '+420 602 969 617',
    serviceId: 'elektrikar',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Komplexní elektroinstalační práce, hromosvody, slaboproudé rozvody.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Elektro-revize KP',
    email: 'jipocz@gmail.com',
    phone: '+420 608 969 026',
    serviceId: 'elektrikar',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Revize elektrických instalací, hromosvodů a spotřebičů. Jihočeský kraj.',
    picturePath: null,
    active: true,
  },

  // --- Plumbers ---
  {
    fullName: 'Bedřich Krčka',
    email: 'krcka.b@seznam.cz',
    phone: '+420 608 905 457',
    serviceId: 'instalater',
    cityId: 'ceske-budejovice',
    address: 'Dlouhá 1053/23, 370 01 České Budějovice',
    description: 'Vodoinstalace, topenářství, opravy a nové rozvody. Rychlá reakce na havárie.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'David Zourek',
    email: null,
    phone: '+420 775 244 606',
    serviceId: 'instalater',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice 370 07',
    description: 'Instalatérské práce — vodovod, kanalizace, topení. Práce v Českých Budějovicích a okolí.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Daniel Mísař',
    email: 'misar.daniel@seznam.cz',
    phone: '+420 773 623 006',
    serviceId: 'instalater',
    cityId: 'ceske-budejovice',
    address: 'Krč 21, 398 11 Protivín',
    description: 'Vodoinstalace a topenářství. Opravy, rekonstrukce, nové instalace.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Jaroslav Lex',
    email: 'instalater-cb@email.cz',
    phone: '+420 606 757 780',
    serviceId: 'instalater',
    cityId: 'ceske-budejovice',
    address: 'Tupesy 34, Radošovice, Hluboká nad Vltavou',
    description: 'Instalatér — voda, topení, plyn. Servis a montáže v oblasti Českých Budějovic.',
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
