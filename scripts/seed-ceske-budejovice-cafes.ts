import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CITY = 'ceske-budejovice';
const CN = 'Českých Budějovicích';
const CA = 'České Budějovice';

const cafes = [
  {
    fullName: 'Kavárna Měsíc ve Dne České Budějovice',
    phone: '+420 387 222 445',
    email: 'info@mesicvedne-cb.cz',
    serviceId: 'kavarna',
    cityId: CITY,
    address: 'Kněžská 8, České Budějovice',
    description: `Kavárna Měsíc ve Dne je oblíbený podnik v ${CN} nabízející kvalitní kávu, domácí koláče a klidnou atmosféru k práci i posezení s přáteli. Kavárna ${CA} je vyhledávaná pro příjemný interiér a přátelský personál.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Café Zastávka České Budějovice',
    phone: '+420 603 334 221',
    email: null,
    serviceId: 'kavarna',
    cityId: CITY,
    address: 'Biskupská 5, České Budějovice',
    description: `Café Zastávka nabízí speciality kávu, čerstvé pečivo a domácí limonády v příjemném prostředí centra ${CN}. Kavárna ${CA} je oblíbeným místem pro snídani i odpolední kávu.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Kavárna Suterén České Budějovice',
    phone: '+420 728 556 890',
    email: 'kavarna.suteren@gmail.com',
    serviceId: 'kavarna',
    cityId: CITY,
    address: 'U Černé věže 3, České Budějovice',
    description: `Kavárna Suterén se nachází v historickém sklepení nedaleko Černé věže v ${CN} a nabízí útulné posezení s kvalitní kávou a čajovým výběrem. Kavárna ${CA} pořádá i drobné kulturní akce a čtení.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Café Kobka České Budějovice',
    phone: '+420 387 667 123',
    email: 'cafekobka@seznam.cz',
    serviceId: 'kavarna',
    cityId: CITY,
    address: 'Karla IV. 12, České Budějovice',
    description: `Café Kobka nabízí kávu z lokální pražírny, zdravé snídaně a veganské dezerty v ${CN}. Kavárna ${CA} je oblíbená mezi studenty i rodinami s dětmi díky příjemnému a moderního prostoru.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Kavárna Perla České Budějovice',
    phone: '+420 603 445 780',
    email: null,
    serviceId: 'kavarna',
    cityId: CITY,
    address: 'Dr. Bureše 9, České Budějovice',
    description: `Kavárna Perla je rodinná kavárna v ${CN} nabízející domácí zákusky, kávu a odpolední čaje. Kavárna ${CA} je známá svou přátelskou atmosférou a pravidelnými zákazníky z okolí.`,
    picturePath: null,
    active: true,
  },
];

async function main() {
  console.log('Seeding cafes in České Budějovice...');
  for (const c of cafes) {
    await prisma.provider.create({ data: c });
    console.log(`  ✓ ${c.fullName}`);
  }
  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
