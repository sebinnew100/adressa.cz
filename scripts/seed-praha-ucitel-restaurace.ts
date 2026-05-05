import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CITY = 'praha';

const profiles = [
  // ── UČITEL / LEKTOR ───────────────────────────────────────────────────────
  { fullName: 'Jazyková škola Polyglot Praha', phone: '+420 241 740 566', email: 'skola.praha@polyglot.cz', serviceId: 'ucitel', cityId: CITY, address: 'Táborská 34, Praha 4', description: 'Jazyková škola Polyglot nabízí kurzy angličtiny, němčiny a dalších jazyků pro dospělé i firmy v Praze. Zkušení lektoři zajišťují výuku na míru přímo v srdci Prahy 4 – Nuslích.', picturePath: null, active: true },
  { fullName: 'Jazyková škola Elvis Praha', phone: '+420 241 405 628', email: 'elvis@elvis.cz', serviceId: 'ucitel', cityId: CITY, address: 'Hněvkovská 1252/23, Praha 4', description: 'Jazyková škola Elvis je certifikovaným partnerem Cambridge a British Council s 36 lety zkušeností s výukou angličtiny v Praze. Škola nabízí kurzy pro děti i dospělé a přípravu na mezinárodní zkoušky přímo v Praze 4.', picturePath: null, active: true },
  { fullName: 'Jazyková škola Glossa Praha', phone: '+420 224 219 484', email: 'info@glossa.cz', serviceId: 'ucitel', cityId: CITY, address: 'Jindřišská 11, Praha 1', description: 'Jazyková škola Glossa je certifikovaná škola s ISO 9001 působící v centru Prahy 1, nabízející výuku angličtiny a dalších světových jazyků. Zkušení lektoři v Praze zajišťují individuální i skupinové kurzy pro klienty všech věkových kategorií.', picturePath: null, active: true },
  { fullName: 'Jazyková škola Spěváček Praha', phone: '+420 222 517 869', email: 'skola@spevacek.info', serviceId: 'ucitel', cityId: CITY, address: 'Náměstí Na Santince 1554/2, Praha 6', description: 'Jazyková škola Spěváček v Praze 6 – Dejvicích nabízí komplexní jazykové kurzy angličtiny, němčiny, francouzštiny i španělštiny pro firmy i jednotlivce. Profesionální lektoři v Praze zajišťují výuku na více pobočkách po celém hlavním městě.', picturePath: null, active: true },

  // ── RESTAURACE ────────────────────────────────────────────────────────────
  { fullName: 'Restaurace U Kroka Praha', phone: '+420 775 905 022', email: 'kontakt@ukroka.cz', serviceId: 'restaurace', cityId: CITY, address: 'Vratislavova 28, Praha 2', description: 'Restaurace U Kroka je rodinný podnik navazující na tradici pražské hospody u Vyšehradského hradu od roku 1895, který nabízí autentickou českou kuchyni v Praze. Příjemná obsluha a domácí atmosféra lákají hosty z celé Prahy i zahraniční turisty.', picturePath: null, active: true },
  { fullName: 'Restaurace Demínka Praha', phone: '+420 224 224 915', email: 'info@deminka.com', serviceId: 'restaurace', cityId: CITY, address: 'Škrétova 1, Praha 2', description: 'Restaurace Demínka v pražských Vinohradech nabízí poctivou českou kuchyni v secesním interiéru s tradicí od roku 1886. Hosté v Praze 2 si mohou vychutnat tradiční česká jídla v autentickém historickém prostředí.', picturePath: null, active: true },
  { fullName: 'Havelská Koruna Praha', phone: '+420 224 239 331', email: 'info@hkoruna.cz', serviceId: 'restaurace', cityId: CITY, address: 'Havelská 501/23, Praha 1', description: 'Havelská Koruna je tradiční česká restaurace v centru Prahy 1 nabízející více než 40 druhů hotových jídel denně za dostupné ceny. Restaurace v srdci Prahy láká místní i turisty na poctivou domácí českou kuchyni.', picturePath: null, active: true },
  { fullName: 'Restaurace 420 Praha', phone: '+420 722 420 099', email: 'info@420restaurant.cz', serviceId: 'restaurace', cityId: CITY, address: 'Staroměstské náměstí 480/24, Praha 1', description: 'Restaurace 420 na Staroměstském náměstí v Praze nabízí moderní českou kuchyni s důrazem na kvalitní lokální suroviny a je doporučena v Michelin Guide 2025. Unikátní gastronomický zážitek v gotickém sklepení ze 14. století z ní dělá jednu z nejvyhledávanějších restaurací v centru Prahy.', picturePath: null, active: true },
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
