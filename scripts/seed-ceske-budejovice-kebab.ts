import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CITY = 'ceske-budejovice';
const CN = 'Českých Budějovicích';
const CA = 'České Budějovice';

const kebabShops = [
  {
    fullName: 'Istanbul Kebab České Budějovice',
    phone: '+420 728 445 120',
    email: 'istanbulkebab.cb@gmail.com',
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Žižkova 15, České Budějovice',
    description: `Istanbul Kebab nabízí čerstvě připravovaný kebab, durum a falafel v centru ${CN}. Rychlé občerstvení ${CA} je oblíbené pro kvalitní maso a domácí omáčky připravované denně.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Kebab House ČB',
    phone: '+420 603 778 452',
    email: null,
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Pražská třída 44, České Budějovice',
    description: `Kebab House ČB je oblíbený kebab bistro v ${CN} nabízející kebab v pita chlebu i talíři. Rychlé občerstvení ${CA} nabízí i rozvoz jídla a otevírací dobu do pozdních nočních hodin.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Sultan Kebab České Budějovice',
    phone: '+420 387 556 890',
    email: 'sultankebab.cb@seznam.cz',
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Dukelská 9, České Budějovice',
    description: `Sultan Kebab připravuje tradiční turecký kebab a adana kebab v ${CN}. Restaurace ${CA} se zaměřuje na čerstvé suroviny a autentickou chuť blízkovýchodní kuchyně.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Anatolia Kebab Grill České Budějovice',
    phone: '+420 728 990 334',
    email: 'anatolia.grill@gmail.com',
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Mánesova 21, České Budějovice',
    description: `Anatolia Kebab Grill nabízí grilovaný kebab, lahmacun a turecké speciality v ${CN}. Rychlé občerstvení ${CA} je vyhledávané studenty i pracujícími na rychlý a chutný oběd.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Efes Kebab Bistro České Budějovice',
    phone: '+420 603 112 678',
    email: null,
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'U Tří Lvů 6, České Budějovice',
    description: `Efes Kebab Bistro nabízí kebab, gyros a čerstvé saláty v příjemném bistru v ${CN}. Restaurace ${CA} klade důraz na kvalitní maso a rychlou obsluhu.`,
    picturePath: null,
    active: true,
  },
];

async function main() {
  console.log('Seeding kebab shops in České Budějovice...');
  for (const r of kebabShops) {
    await prisma.provider.create({ data: r });
    console.log(`  ✓ ${r.fullName}`);
  }
  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
