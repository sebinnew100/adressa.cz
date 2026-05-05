import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const CITY = 'praha';

const profiles = [
  // ── AUTOSERVIS ────────────────────────────────────────────────────────────
  { fullName: 'Autoservis OK Praha', phone: '+420 775 918 918', email: null, serviceId: 'autoservis', cityId: CITY, address: 'Kolbenova 958/27g, Praha 9 – Hloubětín', description: 'Autoservis OK nabízí komplexní opravy a servis vozidel všech značek v Praze 9. Zkušený tým mechaniků zajistí rychlý a spolehlivý autoservis pro zákazníky z celé Prahy.', picturePath: null, active: true },
  { fullName: 'MK Autoservis Praha', phone: '+420 775 258 031', email: null, serviceId: 'autoservis', cityId: CITY, address: 'Nademlejnská 823/11, Praha 9 – Hloubětín', description: 'MK Autoservis poskytuje profesionální opravy osobních i užitkových vozidel v Praze 9. Autoservis Praha zajišťuje diagnostiku, mechanické opravy a pravidelné servisní prohlídky.', picturePath: null, active: true },
  { fullName: 'Autoservis Perfekt Praha', phone: '+420 603 551 252', email: null, serviceId: 'autoservis', cityId: CITY, address: 'Praha 3 – Žižkov', description: 'Autoservis Perfekt je nonstop autoservis v Praze 3 se specializací na opravy všech typů automobilů. Nabízí rychlý zásah a kvalitní servis vozidel přímo v srdci Prahy.', picturePath: null, active: true },
  { fullName: 'Autoservis Zrály – Bosch servis Praha', phone: '+420 251 610 817', email: null, serviceId: 'autoservis', cityId: CITY, address: 'Jindrova 1389/58, Praha 5 – Stodůlky', description: 'Autoservis Zrály je certifikovaný Bosch servis s dlouholetou tradicí v Praze 5 Stodůlky. Specializuje se na opravy, diagnostiku a pravidelnou údržbu vozidel v Praze.', picturePath: null, active: true },

  // ── IT TECHNIK ────────────────────────────────────────────────────────────
  { fullName: 'PC Servis Praha', phone: '+420 607 855 050', email: 'info@pc-servis-praha.cz', serviceId: 'it-technik', cityId: CITY, address: 'Liborova 3, Praha 6', description: 'PC Servis Praha nabízí nonstop IT pohotovost a počítačový servis pro firmy i domácnosti v Praze 6. Zkušený IT technik Praha zajistí opravu počítačů, instalaci softwaru a správu sítí.', picturePath: null, active: true },
  { fullName: 'Počítačová pohotovost Praha', phone: '+420 224 262 826', email: null, serviceId: 'it-technik', cityId: CITY, address: 'Lublaňská 1731/19, Praha 2 – Nové Město', description: 'Počítačová pohotovost je zkušený IT servis v Praze 2 s více než 25 lety praxe v opravách počítačů a notebooků. IT technik Praha poskytuje servis tiskáren, obnovu dat a ochranu před viry.', picturePath: null, active: true },
  { fullName: 'BrontoPC – počítačový servis Praha', phone: '+420 732 604 000', email: null, serviceId: 'it-technik', cityId: CITY, address: 'Lidická 336/28, Praha 5 – Smíchov', description: 'BrontoPC je specializovaný IT technik a počítačový servis v Praze 5 Smíchov zaměřený na opravu PC a notebooků všech značek. Nabízí expresní servis, reinstalaci systému a správu počítačových sítí v Praze.', picturePath: null, active: true },
  { fullName: 'ITC Services Praha', phone: '+420 722 443 322', email: 'info@itc-services.cz', serviceId: 'it-technik', cityId: CITY, address: 'Harmonická 1384/13, Praha 5', description: 'ITC Services je profesionální IT servis a počítačový technik v Praze 5 zaměřený na opravy PC, notebooků a IT infrastruktury. Poskytuje komplexní IT podporu pro firmy i jednotlivce po celé Praze.', picturePath: null, active: true },

  // ── FOTOGRAF ──────────────────────────────────────────────────────────────
  { fullName: 'Veronika Pietrowská – PhotoShine', phone: '+420 773 700 275', email: 'info@photoshine.cz', serviceId: 'fotograf', cityId: CITY, address: 'Mezi Vodami 1955/19, Praha 12 – Modřany', description: 'Veronika Pietrowská je profesionální fotograf Praha specializující se na portréty, rodinné a firemní focení. Fotografické studio PhotoShine nabízí kreativní fotografické služby pro zákazníky z celé Prahy.', picturePath: null, active: true },
  { fullName: 'Lucie Písecká – fotograf Praha', phone: '+420 603 795 711', email: 'foto@luciepisecka.cz', serviceId: 'fotograf', cityId: CITY, address: 'Zelenohorská 506/17, Praha 8 – Bohnice', description: 'Lucie Písecká je zkušená fotografka působící v Praze 8 se zaměřením na portrétní, rodinnou a těhotenskou fotografii. Jako profesionální fotograf Praha nabízí individuální přístup a kvalitní výsledky pro každého klienta.', picturePath: null, active: true },
  { fullName: 'Petr Dlouhý – fotograf Praha', phone: '+420 732 349 231', email: 'info@petrdlouhy.com', serviceId: 'fotograf', cityId: CITY, address: 'Jaromírova 659/8, Praha 2 – Nusle', description: 'Petr Dlouhý je profesionální fotograf Praha 2 se specializací na reklamní, produktovou a portrétní fotografii. Nabízí kompletní fotografické služby pro firmy i soukromé klienty v Praze a okolí.', picturePath: null, active: true },
  { fullName: 'FotoEmotion – Martina Root', phone: '+420 605 765 101', email: 'info@fotoemotion.cz', serviceId: 'fotograf', cityId: CITY, address: 'Voroněžská 564/19, Praha 10 – Vinohrady', description: 'Martina Root je profesionální fotografka zaměřená na business portréty, firemní fotografii a video produkci v Praze. FotoEmotion nabízí moderní fotografické studio a komplexní fotografické služby v Praze.', picturePath: null, active: true },
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
