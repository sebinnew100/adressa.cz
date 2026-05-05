import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CITY = 'praha';

const profiles = [
  // ── ELEKTRIKÁŘ ────────────────────────────────────────────────────────────
  { fullName: 'Elektrikář Praha', phone: '+420 728 283 131', email: 'info@elektrikar-praha.pro', serviceId: 'elektrikar', cityId: CITY, address: 'Varšavská 715/36, Praha – Vinohrady', description: 'Elektrikář Praha nabízí veškeré elektrikářské a elektroinstalační práce včetně servisu a oprav v Praze a okolí. Specializují se na rekonstrukce rozvaděčů, montáž svítidel a havarijní zásahy dostupné 24 hodin denně v celé Praze.', picturePath: null, active: true },
  { fullName: 'Michal Fuček – Elektrikář Praha', phone: '+420 774 209 774', email: 'info@michal-elektro.cz', serviceId: 'elektrikar', cityId: CITY, address: 'Strašnice, Praha 10', description: 'Michal Fuček poskytuje komplexní elektrotechnické práce a realizaci staveb v oboru elektro po celé Praze. Nabízí instalaci kamerových systémů, zabezpečovacích systémů Jablotron a pravidelné elektrorevize.', picturePath: null, active: true },
  { fullName: 'Elektroinstalace Jedelský a Kuběnka', phone: '+420 720 818 181', email: 'info@eletnany.cz', serviceId: 'elektrikar', cityId: CITY, address: 'Dobratická 522, Praha – Letňany', description: 'Elektroinstalace Jedelský a Kuběnka působí od roku 2007 a zajišťují veškeré elektroinstalační práce v Praze – opravy, údržbu, revize i rekonstrukce. Firma je známá vysokým profesionalismem a výbornou komunikací se zákazníky v celém pražském regionu.', picturePath: null, active: true },
  { fullName: 'ELZED Praha s.r.o.', phone: '+420 257 810 529', email: 'elzed@elzed.cz', serviceId: 'elektrikar', cityId: CITY, address: 'Vrážská 1540/26a, Praha – Radotín', description: 'ELZED Praha s.r.o. se specializuje na kompletní silnoproudé a slaboproudé elektroinstalace, výrobu rozvaděčů nízkého napětí a projektovou činnost v Praze. Firma rovněž dodává a instaluje EZS, EPS a kamerové systémy pro zákazníky z celé Prahy.', picturePath: null, active: true },

  // ── INSTALATÉR ────────────────────────────────────────────────────────────
  { fullName: 'ABC instalatéři Praha', phone: '+420 603 264 217', email: 'mjedlicka@centrum.cz', serviceId: 'instalater', cityId: CITY, address: '5. května 1325/18, Praha – Nusle', description: 'ABC instalatéři Praha zajišťují veškeré instalatérské a topenářské práce včetně čištění kanalizací tlakovým čištěním v celé Praze. Nabízejí kamerové inspekce potrubí a nonstop havarijní službu dostupnou 24 hodin denně v Praze.', picturePath: null, active: true },
  { fullName: 'Instalatér Jan Lakomý', phone: '+420 774 671 971', email: 'lakomyjan@seznam.cz', serviceId: 'instalater', cityId: CITY, address: 'Machkova 1644/6, Praha – Chodov', description: 'Jan Lakomý nabízí instalatérské, topenářské a plynařské práce včetně řešení havarijních stavů v Praze 4 a okolí. Zajišťuje dodávku, montáž a rekonstrukci rozvodů vody a odpadu pro domácnosti i firmy po celé Praze.', picturePath: null, active: true },
  { fullName: 'Nonstop-instalatér Praha', phone: '+420 774 570 059', email: 'info@nonstop-instalater.cz', serviceId: 'instalater', cityId: CITY, address: 'Arménská 1373/12, Praha – Vršovice', description: 'Nonstop-instalatér Praha poskytuje kompletní instalatérské a topenářské práce v Praze a okolí včetně oprav, instalací a výměn kotlů, van a vodovodních baterií. Díky nepřetržitému provozu 24/7 je firma ideální volbou pro rychlé řešení havarijních situací v Praze.', picturePath: null, active: true },
  { fullName: 'Instalatér Jiří Petřík', phone: '+420 606 849 115', email: 'jirkapetrik@email.cz', serviceId: 'instalater', cityId: CITY, address: 'Dělnická 194/2, Praha – Holešovice', description: 'Jiří Petřík nabízí opravy, údržbu, čištění a montáže domovní kanalizace a vodovodních rozvodů v Praze 7 a přilehlých čtvrtích. Specializuje se na instalaci praček, opravy toalet a výměnu vodovodních baterií v pražských domácnostech.', picturePath: null, active: true },
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
