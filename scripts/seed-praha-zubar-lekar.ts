import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CITY = 'praha';

const profiles = [
  // ── ZUBAŘ ─────────────────────────────────────────────────────────────────
  { fullName: 'MUDr. Martina Byrne', phone: '+420 261 132 211', email: null, serviceId: 'zubar', cityId: CITY, address: 'Na hřebenech II 1132/4, Praha 4', description: 'MUDr. Martina Byrne provozuje zubní ordinaci v Praze 4, kde nabízí komplexní stomatologickou péči pro dospělé i děti. Ordinace v Praze zajišťuje preventivní prohlídky, ošetření zubního kazu i estetickou stomatologii.', picturePath: null, active: true },
  { fullName: 'MUDr. Dagmar Faziková', phone: '+420 731 406 443', email: null, serviceId: 'zubar', cityId: CITY, address: 'Nad Studánkou 1018/9, Praha 4', description: 'MUDr. Dagmar Faziková vede zubní ordinaci v Praze 4, specializovanou na preventivní a léčebnou stomatologii. Zubní praxe v Praze nabízí moderní ošetření včetně bělení zubů a protetiky.', picturePath: null, active: true },
  { fullName: 'MDDr. Veronika Andělová', phone: '+420 778 760 057', email: null, serviceId: 'zubar', cityId: CITY, address: 'Ohradní 1368/4, Praha 4', description: 'MDDr. Veronika Andělová provozuje stomatologickou ordinaci v Praze 4 s důrazem na bezbolestné ošetření a individuální přístup. Zubní ambulance v Praze nabízí záchovnou stomatologii, implantáty i estetické výkony.', picturePath: null, active: true },
  { fullName: 'MUDr. Kristina Šelderová', phone: '+420 601 326 966', email: null, serviceId: 'zubar', cityId: CITY, address: 'Zenklova 39, Praha 8', description: 'MUDr. Kristina Šelderová ordinuje jako praktický zubní lékař v Praze 8 a poskytuje komplexní stomatologickou péči pro celou rodinu. Zubní ordinace v Praze 8 se zaměřuje na prevenci zubního kazu a estetické výkony.', picturePath: null, active: true },

  // ── LÉKAŘ ─────────────────────────────────────────────────────────────────
  { fullName: 'MUDr. Ivana Ballingová', phone: '+420 222 928 336', email: null, serviceId: 'lekar', cityId: CITY, address: 'Palackého 5, Praha 1', description: 'MUDr. Ivana Ballingová je praktická lékařka pro dospělé se ordinací přímo v centru Prahy 1. Péče zahrnuje preventivní prohlídky, léčbu chronických onemocnění a pracovnělékařské služby.', picturePath: null, active: true },
  { fullName: 'MUDr. Cyril Mucha', phone: '+420 737 072 069', email: null, serviceId: 'lekar', cityId: CITY, address: 'Seydlerova 2451/8, Praha 5', description: 'MUDr. Cyril Mucha vede ordinaci praktického lékaře v Praze 5 a zajišťuje komplexní primární zdravotní péči. Ordinace v Praze nabízí registraci nových pacientů, akutní ošetření i pravidelné preventivní prohlídky.', picturePath: null, active: true },
  { fullName: 'MUDr. Jana Bruothová', phone: '+420 728 314 807', email: null, serviceId: 'lekar', cityId: CITY, address: 'Svatoplukova 493/9, Praha 2', description: 'MUDr. Jana Bruothová pracuje jako všeobecná praktická lékařka v Praze a poskytuje odbornou péči dospělým pacientům. Praxe v Praze 2 se specializuje na diagnostiku, léčbu interních onemocnění a vydávání doporučení ke specialistům.', picturePath: null, active: true },
  { fullName: 'MUDr. Jaroslav Krauskopf', phone: '+420 257 215 133', email: null, serviceId: 'lekar', cityId: CITY, address: 'Plzeňská 221/130, Praha 5', description: 'MUDr. Jaroslav Krauskopf je praktický lékař pro dospělé s dlouholetou zkušeností v primární péči v Praze. Ordinace v Praze 5 nabízí komplexní zdravotní péči včetně preventivních prohlídek, EKG a laboratorních odběrů.', picturePath: null, active: true },
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

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
