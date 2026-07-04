import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const jobs = [
  {
    title: 'Elektrikář — revize a drobné opravy v bytovém domě, Praha',
    description:
      'Poptáváme elektrikáře na revizi elektroinstalace ve starším bytovém domě a opravu vadného jističe ve společných prostorách. Potřebujeme revizní zprávu pro SVJ. Termín do 3 týdnů, možnost dlouhodobé spolupráce na dalších objektech.',
    serviceId: 'elektrikar',
    cityId: 'praha',
    contactName: 'Jiří Novotný (předseda SVJ)',
    contactEmail: 'svj.novotny.dum@gmail.com',
    budget: '8 000 – 15 000 Kč',
  },
  {
    title: 'Instalatér — výměna bojleru a rozvodů, Brno-Žabovřesky',
    description:
      'Hledáme instalatéra na výměnu starého bojleru za nový (již zakoupený, 120 l) a přepojení rozvodů teplé vody v koupelně. Byt je obydlený, potřebujeme domluvit termín přes víkend nebo večer. Zkušenosti s podobnými zakázkami vítány.',
    serviceId: 'instalater',
    cityId: 'brno',
    contactName: 'Markéta Svobodová',
    contactEmail: 'm.svobodova.brno@seznam.cz',
    contactPhone: '+420 731 224 xxx',
    budget: '6 000 – 10 000 Kč',
  },
  {
    title: 'Malíř pokojů — vymalování bytu 3+1 před nastěhováním, Ostrava',
    description:
      'Poptávám malíře na vymalování celého bytu 3+1 (cca 75 m²) včetně stropů, jedna barva dle vzorníku. Byt je prázdný, přístup kdykoli v pracovní dny. Preferuji nabídku s cenou za m² a odhadem počtu dní.',
    serviceId: 'malir',
    cityId: 'ostrava',
    contactName: 'Roman Dvořák',
    contactEmail: 'roman.dvorak.ostrava@email.cz',
    budget: '12 000 – 18 000 Kč',
  },
  {
    title: 'Stěhovací firma — přestěhování domácnosti Plzeň → Praha',
    description:
      'Potřebujeme stěhovací firmu na přestěhování bytu 2+kk (nábytek, spotřebiče, cca 25 krabic) z Plzně do Prahy. Prosíme o nacenění včetně balicího materiálu a možnosti vynesení z 3. patra bez výtahu. Termín orientačně poslední víkend v měsíci.',
    serviceId: 'stehovaci-firma',
    cityId: 'plzen',
    contactName: 'Tereza a Pavel Kovářovi',
    contactEmail: 'kovarovi.stehovani@gmail.com',
    contactPhone: '+420 604 887 xxx',
    budget: '9 000 – 14 000 Kč',
  },
  {
    title: 'IT technik — nastavení domácí sítě a NAS serveru, Praha',
    description:
      'Hledám IT technika na nastavení domácí sítě (Wi-Fi pokrytí většího bytu, 2x access point) a instalaci/nastavení NAS serveru pro zálohování rodinných fotek. Vlastní hardware již mám doma, potřebuji hlavně odbornou instalaci a zaškolení.',
    serviceId: 'it-technik',
    cityId: 'praha',
    contactName: 'Filip Král',
    contactEmail: 'filip.kral.it@email.cz',
    budget: '3 000 – 5 500 Kč',
  },
];

async function main() {
  console.log('Seeding job requests (batch 2)...');
  for (const job of jobs) {
    await prisma.serviceRequest.create({ data: job });
    console.log(`  ✓ ${job.title.slice(0, 60)}…`);
  }
  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
