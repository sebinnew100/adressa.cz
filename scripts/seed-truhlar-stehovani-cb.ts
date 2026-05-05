import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const profiles = [
  // --- Joiners (truhlář) ---
  {
    fullName: 'Juhas-truhlářství — Pavel Juhas',
    email: 'info@paveljuhas.cz',
    phone: '+420 608 122 029',
    serviceId: 'truhlar',
    cityId: 'ceske-budejovice',
    address: 'Zborov 67, 370 06 České Budějovice',
    description: 'Zakázkové truhlářství — výroba nábytku na míru, kuchyně, vestavěné skříně, schodiště.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Truhlář z Budějc — Lukáš Drbohlav',
    email: 'info@truhlarzbudejc.cz',
    phone: '+420 734 638 455',
    serviceId: 'truhlar',
    cityId: 'ceske-budejovice',
    address: 'České Budějovice',
    description: 'Truhlářství na míru — kuchyně, skříně, dveře, obložky. Výroba i montáž v Českých Budějovicích.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Truhlářství Lhoták — Martin Lhoták',
    email: 'lhotak-smolik@volny.cz',
    phone: '+420 605 909 899',
    serviceId: 'truhlar',
    cityId: 'ceske-budejovice',
    address: 'Lidická tř. 1126/230, 370 07 České Budějovice',
    description: 'Truhlářství a výroba kuchyní na míru. Zakázková výroba nábytku pro domy i byty.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Jan Volf — Zakázkové truhlářství',
    email: 'volf.tpv@seznam.cz',
    phone: '+420 602 409 009',
    serviceId: 'truhlar',
    cityId: 'ceske-budejovice',
    address: 'Třebotovice 2431, 370 06 České Budějovice',
    description: 'Zakázkový truhlář — výroba dřevěného nábytku, oken, dveří a dřevěných doplňků.',
    picturePath: null,
    active: true,
  },

  // --- Movers (stěhování) ---
  {
    fullName: 'Stěhování FOFR',
    email: 'info@stehovani-fofr.cz',
    phone: '+420 606 060 512',
    serviceId: 'stehovaci-firma',
    cityId: 'ceske-budejovice',
    address: 'J. Hloucha 1, České Budějovice',
    description: 'Profesionální stěhování bytů, domů a kanceláří v Českých Budějovicích a okolí.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Stěhování Segr',
    email: 'stehovanisegr@seznam.cz',
    phone: '+420 775 042 459',
    serviceId: 'stehovaci-firma',
    cityId: 'ceske-budejovice',
    address: 'Krčínova 1575/15, 370 11 České Budějovice',
    description: 'Stěhování a vyklízení bytů, domů, kanceláří. Rychlé a spolehlivé služby v Českých Budějovicích.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Stěhování AAA-RIVO',
    email: 'vosika@aaarivo.cz',
    phone: '+420 602 408 667',
    serviceId: 'stehovaci-firma',
    cityId: 'ceske-budejovice',
    address: 'Vidov 125, České Budějovice',
    description: 'Stěhovací firma s dlouholetou tradicí. Stěhování domácností i firem, skladování nábytku.',
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Dan Stěhuje — Daniel Kadlec',
    email: 'info@danstehuje.cz',
    phone: '+420 730 892 090',
    serviceId: 'stehovaci-firma',
    cityId: 'ceske-budejovice',
    address: 'V Zahrádkách 29, 370 07 České Budějovice',
    description: 'Stěhování bytů, domů a kanceláří. Balení, transport, montáž nábytku na nové adrese.',
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
