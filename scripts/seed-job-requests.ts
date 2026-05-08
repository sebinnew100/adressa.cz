import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const jobs = [
  {
    title: 'Hledáme zkušeného kuchaře — restaurace v centru Prahy',
    description:
      'Přijmeme kuchaře s min. 2 lety praxe v kuchyni. Nabízíme plný úvazek, stabilní zázemí a příjemný kolektiv. Nástup možný ihned nebo dle dohody. Zkušenosti s českou i evropskou kuchyní výhodou. Kontaktujte nás e-mailem s krátkým představením a vaší praxí.',
    serviceId: 'restaurace',
    cityId: 'praha',
    contactName: 'Petra N. (personalistka)',
    contactEmail: 'nabor.kuchyne24@gmail.com',
    budget: '38 000 – 48 000 Kč/měsíc',
  },
  {
    title: 'Číšník/servírka — gastro provozovna Brno',
    description:
      'Hledáme komunikativního číšníka nebo servírku pro obsluhu v restauraci. Pracovní doba na směny (dle dohody). Požadujeme spolehlivost, příjemné vystupování a základní znalost anglického jazyka. Praxe vítána, ale není podmínkou — zaškolíme.',
    serviceId: 'restaurace',
    cityId: 'brno',
    contactName: 'Martin H. (provozní)',
    contactEmail: 'gastro.nabor.brno@seznam.cz',
    budget: '25 000 – 32 000 Kč/měsíc + spropitné',
  },
  {
    title: 'Pomocný kuchař / přípravář — rychlé obsazení',
    description:
      'Přijmeme pomocného kuchaře nebo přípraváře do fungující kuchyně. Zkušenosti nejsou podmínkou, naučíme vše potřebné. Požadujeme platný zdravotní průkaz, spolehlivost a ochotu pracovat. Nástup nejpozději do 2 týdnů.',
    serviceId: 'restaurace',
    cityId: 'ostrava',
    contactName: 'Jana K.',
    contactEmail: 'kuchyne.ostrava.nabor@gmail.com',
    budget: '22 000 – 27 000 Kč/měsíc',
  },
  {
    title: 'Junior IT technik — podpora uživatelů (Praha)',
    description:
      'Hledáme IT technika pro HelpDesk podporu a správu firemní infrastruktury. Požadujeme: základy sítí (TCP/IP), zkušenost s Windows Server, komunikační dovednosti. Výhodou jsou certifikáty (CompTIA, CCNA). Nabízíme zázemí stabilní firmy, 5 týdnů dovolené.',
    serviceId: 'it-technik',
    cityId: 'praha',
    contactName: 'Tomáš B. (HR)',
    contactEmail: 'it.jobs.cz24@gmail.com',
    budget: '35 000 – 45 000 Kč/měsíc',
  },
  {
    title: 'Účetní / mzdová účetní — práce z domova možná',
    description:
      'Přijmeme zkušenou účetní pro vedení podvojného účetnictví menší firmy. Požadujeme znalost SW Money S3 nebo Pohoda, prax min. 3 roky, orientaci v DPH. Možnost částečného home office. Vhodné i pro OSVČ na IČO.',
    serviceId: 'ucetni',
    cityId: 'brno',
    contactName: 'Radka M.',
    contactEmail: 'ucetni.pozice.brno@email.cz',
    budget: '40 000 – 55 000 Kč/měsíc',
  },
  {
    title: 'Grafický designér — freelance spolupráce (dlouhodobá)',
    description:
      'Hledáme spolehlivého grafika pro dlouhodobou spolupráci na tvorbě marketingových materiálů — bannery, sociální sítě, tiskové podklady. Požadujeme znalost Adobe Creative Suite (Illustrator, Photoshop, InDesign). Práce na dálku, platba za projekt.',
    serviceId: 'grafik',
    cityId: 'praha',
    contactName: 'Ondřej V. (marketingový manažer)',
    contactEmail: 'grafik.freelance.nabidka@gmail.com',
    budget: '500 – 900 Kč/hod',
  },
  {
    title: 'Osobní trenér — fitness centrum hledá spolupráci',
    description:
      'Fitness centrum hledá certifikovaného osobního trenéra pro spolupráci na živnostenský list. Zajistíme klientelu a prostory, vy přinášíte odbornost a motivaci. Požadujeme certifikát trenéra fitness, první aid, zkušenosti s individuálním tréninkem.',
    serviceId: 'trener',
    cityId: 'praha',
    contactName: 'Lucie F. (provozní manažerka)',
    contactEmail: 'fitness.trener.spoluprace@seznam.cz',
    budget: 'Podíl z tréninků (dohodou)',
  },
  {
    title: 'Překladatel CZ–EN pro pravidelné zakázky',
    description:
      'Překladatelská agentura hledá překladatele pro pravidelné překlady z češtiny do angličtiny a zpět. Zaměření: obchodní korespondence, smlouvy, webový obsah. Požadujeme: rodilý mluvčí nebo C2, rychlost, přesnost. Platba za normostranu.',
    serviceId: 'prekladatel',
    cityId: 'praha',
    contactName: 'Simona K. (projektová manažerka)',
    contactEmail: 'preklady.nabidka24@gmail.com',
    budget: '280 – 380 Kč / normostrana',
  },
  {
    title: 'Kadeřník/kadeřnice — volná pozice v salonu, Olomouc',
    description:
      'Kadeřnický salon hledá kadeřníka nebo kadeřnici na HPP nebo nájem křesla. Moderně vybavený salon v centru města, stabilní klientela. Požadujeme vyučení v oboru, příjemné vystupování, zájem o seberozvoj. Nástup dle dohody.',
    serviceId: 'kadernik',
    cityId: 'olomouc',
    contactName: 'Andrea S.',
    contactEmail: 'kadernictvi.olomouc.nabor@email.cz',
    budget: 'HPP od 28 000 Kč nebo nájem křesla',
  },
  {
    title: 'Zahradník / správce zeleně — sezónní i stálý poměr',
    description:
      'Správcovská firma hledá zahradníka pro údržbu zeleně u komerčních objektů. Náplň práce: sekání trávníků, stříhání keřů, výsadba, zimní příprava. Řidičský průkaz B nutností. Možnost stálého poměru pro osvědčené pracovníky.',
    serviceId: 'zahradnik',
    cityId: 'plzen',
    contactName: 'Pavel R. (vedoucí týmu)',
    contactEmail: 'zahradnicke.prace.plzen@gmail.com',
    budget: '24 000 – 30 000 Kč/měsíc',
  },
];

async function main() {
  console.log('Seeding job requests...');
  for (const job of jobs) {
    await prisma.serviceRequest.create({ data: job });
    console.log(`  ✓ ${job.title.slice(0, 60)}…`);
  }
  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
