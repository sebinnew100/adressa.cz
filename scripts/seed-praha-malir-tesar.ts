import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CITY = 'praha';

const profiles = [
  // ── MALÍŘ ─────────────────────────────────────────────────────────────────
  { fullName: 'Petr Verner – malíř pokojů', phone: '+420 608 303 300', email: 'vernermal@seznam.cz', serviceId: 'malir', cityId: CITY, address: 'Kukučínova 1148/4, Praha 4 – Krč', description: 'Petr Verner je zkušený malíř pokojů s více než 25 lety praxe v Praze a okolí. Provádí kompletní malování bytů, domů a kanceláří v Praze včetně dekorativních technik a přípravných prací.', picturePath: null, active: true },
  { fullName: 'Jiří Kerner – malíř lakýrník', phone: '+420 608 030 989', email: 'kerner@post.cz', serviceId: 'malir', cityId: CITY, address: 'Kubelíkova 1655/8, Praha 3 – Žižkov', description: 'Jiří Kerner nabízí profesionální malířské a lakýrnické práce v Praze a přilehlém okolí. Specializuje se na malování bytů, domů a průmyslových prostor v Praze včetně nátěrů fasád.', picturePath: null, active: true },
  { fullName: 'Jan Břečka – malíř pokojů Praha', phone: '+420 602 617 291', email: 'brecka.jan@volny.cz', serviceId: 'malir', cityId: CITY, address: 'U valu 844/1, Praha 6 – Ruzyně', description: 'Jan Břečka poskytuje veškeré malířské a lakýrnické práce v Praze a Středočeském kraji. Zaměřuje se na kvalitní malování pokojů a bytů v Praze s důrazem na čistotu a precizní provedení.', picturePath: null, active: true },
  { fullName: 'Michal Macek – malíř Praha', phone: '+420 739 453 188', email: 'info@malmex.cz', serviceId: 'malir', cityId: CITY, address: 'U Hostavického potoka 722/1, Praha 9 – Hostavice', description: 'Michal Macek je profesionální malíř pokojů působící v Praze od roku 2005. Nabízí kompletní malování bytů, kanceláří a průmyslových prostor v Praze včetně termoizolačních nátěrů a ochrany proti plísním.', picturePath: null, active: true },

  // ── TESAŘ ─────────────────────────────────────────────────────────────────
  { fullName: 'Lukáš Poláček – tesař Praha', phone: '+420 776 406 055', email: 'polacek@tesarpraha.cz', serviceId: 'tesar', cityId: CITY, address: 'Novákových 885/35, Praha 8 – Libeň', description: 'Lukáš Poláček je zkušený tesař nabízející komplexní tesařské a pokrývačské práce v Praze a Středočeském kraji. Specializuje se na výstavbu krovů, střešních konstrukcí a dřevěných staveb v Praze na klíč.', picturePath: null, active: true },
  { fullName: 'Tesařství Hronek', phone: '+420 732 185 182', email: null, serviceId: 'tesar', cityId: CITY, address: 'Na Dionysce 3/1552, Praha 6 – Dejvice', description: 'Ondřej Hronek provozuje tesařství zaměřené na výstavbu a rekonstrukci dřevěných krovů a střech v Praze. Tesařství Hronek zajišťuje veškeré tesařské práce v Praze včetně pergol, přístřešků a zahradních staveb.', picturePath: null, active: true },
  { fullName: 'Tesařství Tůma Praha', phone: '+420 608 310 088', email: 'tuma@tesarstvituma.cz', serviceId: 'tesar', cityId: CITY, address: 'U vlečky 2166/7, Praha 4 – Komořany', description: 'Petr Tůma je majitel Tesařství Tůma s dlouholetou tradicí v oblasti dřevostaveb a střešních konstrukcí v Praze. Firma provádí komplexní tesařské práce v Praze zahrnující krovy, dřevostavby a rekonstrukce střech na klíč.', picturePath: null, active: true },
  { fullName: 'Tesářství Čermák Praha', phone: '+420 774 808 687', email: 'tony.cermak@seznam.cz', serviceId: 'tesar', cityId: CITY, address: 'Třebohostická 987/5, Praha 10 – Strašnice', description: 'Antonín Čermák je tesař a truhlář s rozsáhlými zkušenostmi s výstavbou dřevěných teras, pergol a zahradních altánů v Praze. Tesářství Čermák realizuje tesařské práce v Praze a okolí včetně dřevěných přístřešků a zahradních domků.', picturePath: null, active: true },
];

async function main() {
  let count = 0;
  for (const p of profiles) {
    const created = await prisma.provider.create({ data: p });
    console.log(`✓ ${created.fullName}`);
    count++;
  }
  console.log(`\nDone. Added ${count} profiles.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
