import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CITY = 'ceske-budejovice';
const CN = 'Českých Budějovicích';
const CA = 'České Budějovice';

const restaurants = [
  {
    fullName: 'Restaurace Zvon České Budějovice',
    phone: '+420 387 222 156',
    email: 'info@restaurace-zvon-cb.cz',
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'náměstí Přemysla Otakara II. 30, České Budějovice',
    description: `Restaurace Zvon se nachází přímo na hlavním náměstí v ${CN} a nabízí českou i mezinárodní kuchyni v příjemném prostředí s výhledem na náměstí. Restaurace ${CA} je oblíbená pro obědová menu i večerní posezení.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Steakhouse Vltava České Budějovice',
    phone: '+420 603 224 780',
    email: 'rezervace@steakhouse-vltava.cz',
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Hroznová 8, České Budějovice',
    description: `Steakhouse Vltava nabízí kvalitní steaky a grilované speciality v moderním prostředí nedaleko řeky Vltavy. Restaurace ${CA} se specializuje na hovězí maso vyzrálé metodou dry-aged a rozsáhlou vinnou kartu.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Bistro Na Rybníčku České Budějovice',
    phone: '+420 728 337 445',
    email: null,
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Kanovnická 15, České Budějovice',
    description: `Bistro Na Rybníčku je moderní bistro v ${CN} nabízející snídaně, brunch a lehké obědy z čerstvých sezónních surovin. Restaurace ${CA} je oblíbená mezi místními díky domácí kávě a čerstvě pečeným croissantům.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Pizzeria Da Marco České Budějovice',
    phone: '+420 387 445 210',
    email: 'objednavky@damarco-cb.cz',
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Česká 12, České Budějovice',
    description: `Pizzeria Da Marco peče pravou italskou pizzu v ${CN} na kamenné dlažbě dle tradiční receptury. Restaurace ${CA} nabízí i těstoviny, italská předkrmy a rozvoz jídla po celém městě.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Restaurace U Tří Bubnů České Budějovice',
    phone: '+420 603 556 891',
    email: 'info@utribubnu-cb.cz',
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Senovážné náměstí 5, České Budějovice',
    description: `Restaurace U Tří Bubnů nabízí tradiční jihočeskou a českou kuchyni v historickém prostředí centra ${CN}. Restaurace ${CA} je vyhledávaná pro rodinné obědy i firemní akce.`,
    picturePath: null,
    active: true,
  },
  {
    fullName: 'Vinárna Solnice České Budějovice',
    phone: '+420 387 664 320',
    email: 'vinarna@solnice-cb.cz',
    serviceId: 'restaurace',
    cityId: CITY,
    address: 'Piaristická 22, České Budějovice',
    description: `Vinárna Solnice je útulná vinárna v ${CN} s výběrem moravských a jihočeských vín a lehkými pokrmy k vínu. Restaurace ${CA} je ideální pro romantickou večeři nebo posezení s přáteli.`,
    picturePath: null,
    active: true,
  },
];

async function main() {
  console.log('Seeding additional restaurants in České Budějovice...');
  for (const r of restaurants) {
    await prisma.provider.create({ data: r });
    console.log(`  ✓ ${r.fullName}`);
  }
  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
