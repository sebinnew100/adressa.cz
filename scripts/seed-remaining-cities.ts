import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface CityDef {
  id: string; nom: string; loc: string; adr: string; phone: string;
  streets: [string, string, string, string];
  names: [string, string, string, string];
  biz: [string, string, string, string];
}

const CITIES: CityDef[] = [
  { id: 'pardubice', nom: 'Pardubice', loc: 'v Pardubicích', adr: 'Pardubice', phone: '466',
    streets: ['náměstí Republiky 22', 'Palackého třída 345/18', 'tř. Míru 456/29', 'Polabiny 789/41'],
    names: ['Novák','Horáček','Blažek','Červinka'], biz: ['PARDO','PardubiceServis','EastBohemia','PardFirma'] },
  { id: 'usti-nad-labem', nom: 'Ústí nad Labem', loc: 'v Ústí nad Labem', adr: 'Ústí nad Labem', phone: '475',
    streets: ['Mírové náměstí 12', 'Revoluční 345/22', 'Masarykova 567/38', 'Střekov 890/51'],
    names: ['Krátký','Beneš','Holub','Majer'], biz: ['ÚSTÍ','ElbeServis','NorthBohemia','ÚstíFirma'] },
  { id: 'zlin', nom: 'Zlín', loc: 've Zlíně', adr: 'Zlín', phone: '577',
    streets: ['náměstí Míru 14', 'tř. Tomáše Bati 234/19', 'Gahurova 456/33', 'Dlouhá 789/47'],
    names: ['Baťa','Horáček','Kovář','Šimánek'], biz: ['ZLÍN','BaťaServis','MoravaZlín','ZlínFirma'] },
  { id: 'havirov', nom: 'Havířov', loc: 'v Havířově', adr: 'Havířov', phone: '596',
    streets: ['Hlavní třída 55', 'Šumbarská 234/18', 'Havířov-Město 345/22', 'Dlouhá 678/39'],
    names: ['Novotný','Bláha','Šimek','Procházka'], biz: ['HAVÍŘ','SileziaServis','MoraviaHav','HavFirma'] },
  { id: 'kladno', nom: 'Kladno', loc: 'v Kladně', adr: 'Kladno', phone: '312',
    streets: ['náměstí starosty Pavla 8', 'T. G. Masaryka 234/16', 'nám. Sítná 456/28', 'Vrapice 789/44'],
    names: ['Vejvoda','Kopec','Mašek','Holub'], biz: ['KLADNO','SteelServis','CentralBohemia','KladFirma'] },
  { id: 'most', nom: 'Most', loc: 'v Mostě', adr: 'Most', phone: '476',
    streets: ['Radniční náměstí 6', 'tř. Budovatelů 234/17', 'Zahradní 456/29', 'Mostecká 789/43'],
    names: ['Krejčí','Fiala','Vlček','Šimák'], biz: ['MOST','BrownCoal','NorthBohem','MostFirma'] },
  { id: 'opava', nom: 'Opava', loc: 'v Opavě', adr: 'Opava', phone: '553',
    streets: ['Horní náměstí 11', 'Ostrožná 234/19', 'Pekařská 456/31', 'Těšínská 789/47'],
    names: ['Jurečka','Balcárek','Šimko','Pavlíček'], biz: ['OPAVA','SilézieServis','OpavaFirma','SilezServ'] },
  { id: 'frydek-mistek', nom: 'Frýdek-Místek', loc: 've Frýdku-Místku', adr: 'Frýdek-Místek', phone: '558',
    streets: ['náměstí Svobody 7', 'Palackého 234/15', '8. pěšího pluku 456/27', 'Pionýrů 789/41'],
    names: ['Brablec','Szturc','Kantor','Vojtek'], biz: ['FMSERVIS','BeskydyFirm','FMTechnik','MoravSilc'] },
  { id: 'karvina', nom: 'Karviná', loc: 'v Karviné', adr: 'Karviná', phone: '596',
    streets: ['náměstí Budovatelů 5', 'tř. Osvobození 234/18', 'Fryštátská 456/29', 'Karviná-Fryštát 789/43'],
    names: ['Szymeczek','Konderla','Havránek','Kula'], biz: ['KARVÍNA','CollieryServ','SilézieKarv','KarvFirma'] },
  { id: 'jihlava', nom: 'Jihlava', loc: 'v Jihlavě', adr: 'Jihlava', phone: '567',
    streets: ['Masarykovo náměstí 9', 'Palackého 234/16', 'Třebízského 456/28', 'Havlíčkova 789/44'],
    names: ['Horký','Vávra','Čermák','Dvořák'], biz: ['JIHLAVA','HighlandServ','VysočinaFirm','JihServis'] },
  { id: 'teplice', nom: 'Teplice', loc: 'v Teplicích', adr: 'Teplice', phone: '417',
    streets: ['náměstí Svobody 14', 'Masarykova třída 234/19', 'U Nových lázní 456/33', 'Novosedlická 789/48'],
    names: ['Kuchař','Kalina','Mach','Šimánek'], biz: ['TEPLICE','SpaServis','NorthBohem','TepFirma'] },
  { id: 'decin', nom: 'Děčín', loc: 'v Děčíně', adr: 'Děčín', phone: '412',
    streets: ['náměstí Benešovo 3', 'Masarykovo náměstí 234/17', 'Riegrova 456/29', 'Labská 789/42'],
    names: ['Šturma','Kutil','Kratochvíl','Mašek'], biz: ['DĚČÍN','ElbeNorth','BohemianSwiss','DečFirma'] },
  { id: 'chomutov', nom: 'Chomutov', loc: 'v Chomutově', adr: 'Chomutov', phone: '474',
    streets: ['náměstí 1. máje 8', 'Palackého 234/16', 'Blatenská 456/27', 'Zahradní 789/43'],
    names: ['Vaněk','Kopec','Fiala','Šimák'], biz: ['CHOMUTOV','NorthBohServ','OreMount','ChomFirma'] },
  { id: 'kolin', nom: 'Kolín', loc: 'v Kolíně', adr: 'Kolín', phone: '321',
    streets: ['Karlovo náměstí 6', 'Politických vězňů 234/14', 'Tyršova 456/26', 'Kutnohorská 789/40'],
    names: ['Vlček','Horák','Kříž','Blažek'], biz: ['KOLÍN','ElbeServis','CentralBoh','KolFirma'] },
  { id: 'prostejov', nom: 'Prostějov', loc: 'v Prostějově', adr: 'Prostějov', phone: '582',
    streets: ['náměstí T. G. Masaryka 7', 'Wolkerova 234/15', 'Rejskovo náměstí 456/27', 'Brněnská 789/41'],
    names: ['Juránek','Zatloukal','Novosad','Hanák'], biz: ['PROSTĚJOV','HanaServis','MoraviaFirm','ProstFirm'] },
  { id: 'prerov', nom: 'Přerov', loc: 'v Přerově', adr: 'Přerov', phone: '581',
    streets: ['Čechova 12', 'T. G. Masaryka 234/18', 'Komenského 456/30', 'Kratochvílova 789/44'],
    names: ['Pecl','Fojtík','Macháček','Jurka'], biz: ['PŘEROV','MoraviaServ','Přerov24','PrerFirma'] },
  { id: 'ceska-lipa', nom: 'Česká Lípa', loc: 'v České Lípě', adr: 'Česká Lípa', phone: '487',
    streets: ['náměstí T. G. Masaryka 5', 'Jindřicha z Lipé 234/16', 'Arbesova 456/28', 'Dubická 789/42'],
    names: ['Horáček','Mašek','Kratochvíl','Šimánek'], biz: ['ČESLÍPA','NorthBohServ','LipaFirma','NordBohemia'] },
];

const SERVICES = [
  { id: 'elektrikar', cz: 'elektrikář', cz2: 'elektroinstalace a revize' },
  { id: 'instalater', cz: 'instalatér', cz2: 'instalatérské a topenářské práce' },
  { id: 'malir', cz: 'malíř pokojů', cz2: 'malování a lakýrnické práce' },
  { id: 'tesar', cz: 'tesař', cz2: 'tesařské práce a krovy' },
  { id: 'truhlar', cz: 'truhlář', cz2: 'zakázkovou výrobu nábytku' },
  { id: 'zednik', cz: 'zedník', cz2: 'zednické a stavební práce' },
  { id: 'klempir', cz: 'klempíř', cz2: 'klempířské a pokrývačské práce' },
  { id: 'autoservis', cz: 'autoservis', cz2: 'opravy a servis vozidel' },
  { id: 'it-technik', cz: 'IT technik', cz2: 'opravy počítačů a IT servis' },
  { id: 'fotograf', cz: 'fotograf', cz2: 'profesionální fotografické služby' },
  { id: 'ucitel', cz: 'lektor', cz2: 'jazykové kurzy a doučování' },
  { id: 'restaurace', cz: 'restaurace', cz2: 'českou kuchyni a pohostinství' },
  { id: 'zubar', cz: 'zubař', cz2: 'stomatologickou péči' },
  { id: 'lekar', cz: 'lékař', cz2: 'zdravotní péči pro dospělé a děti' },
  { id: 'psycholog', cz: 'psycholog', cz2: 'psychoterapii a poradenství' },
  { id: 'pravnik', cz: 'právník', cz2: 'právní poradenství a zastupování' },
  { id: 'ucetni', cz: 'účetní', cz2: 'vedení účetnictví a daňové přiznání' },
  { id: 'kadernik', cz: 'kadeřník', cz2: 'střihy, barvení a styling vlasů' },
  { id: 'architekt', cz: 'architekt', cz2: 'projektování a interiérový design' },
  { id: 'realitni-makler', cz: 'realitní makléř', cz2: 'prodej a pronájem nemovitostí' },
  { id: 'zahradnik', cz: 'zahradník', cz2: 'zahradnické práce a péče o zeleň' },
  { id: 'uklid', cz: 'úklidová firma', cz2: 'profesionální úklid bytů a kanceláří' },
  { id: 'stehovaci-firma', cz: 'stěhovací firma', cz2: 'stěhování bytů a firem' },
  { id: 'trener', cz: 'osobní trenér', cz2: 'fitness tréninky a sportovní poradenství' },
  { id: 'prekladatel', cz: 'překladatel', cz2: 'překlady a tlumočení' },
  { id: 'grafik', cz: 'grafik', cz2: 'grafický design a tvorbu webů' },
];

const TITLES = [
  ['Ing.','Mgr.','Bc.','JUDr.','MUDr.','MDDr.','PhDr.','','',''],
];

function phone(prefix: string, svc: number, idx: number): string {
  const base = 100000 + svc * 400 + idx * 97;
  const s = String(base).padStart(6,'0');
  return `+420 ${prefix} ${s.slice(0,3)} ${s.slice(3)}`;
}

function buildProfiles(city: CityDef) {
  const profiles: any[] = [];
  SERVICES.forEach((svc, si) => {
    const variants = [
      // 0: business name style
      {
        fullName: `${svc.cz.charAt(0).toUpperCase()+svc.cz.slice(1)} ${city.names[0]} ${city.nom}`,
        email: `${city.names[0].toLowerCase()}@${svc.id}-${city.id.replace(/-/g,'')}.cz`,
        address: `${city.streets[0]}, ${city.adr}`,
        desc: `${svc.cz.charAt(0).toUpperCase()+svc.cz.slice(1)} ${city.names[0]} nabízí ${svc.cz2} ${city.loc}. ${svc.cz.charAt(0).toUpperCase()+svc.cz.slice(1)} ${city.nom} zajistí profesionální a spolehlivé služby pro domácnosti i firmy v celém okolí ${city.nom}.`,
      },
      // 1: firm style
      {
        fullName: `${city.biz[0]} – ${svc.cz} ${city.nom}`,
        email: `info@${city.biz[0].toLowerCase().replace(/[^a-z]/g,'')}-${svc.id.slice(0,4)}.cz`,
        address: `${city.streets[1]}, ${city.adr}`,
        desc: `${city.biz[0]} je zkušená firma nabízející ${svc.cz2} ${city.loc} a okolí. ${svc.cz.charAt(0).toUpperCase()+svc.cz.slice(1)} ${city.nom} poskytuje kvalitní služby s rychlým výjezdem a zárukou spokojenosti.`,
      },
      // 2: person style
      {
        fullName: `${city.names[2]} – ${svc.cz} ${city.nom}`,
        email: null,
        address: `${city.streets[2]}, ${city.adr}`,
        desc: `${city.names[2]} je profesionální ${svc.cz} ${city.loc} s dlouholetou praxí v oboru ${svc.cz2.split(' ')[0]}. ${svc.cz.charAt(0).toUpperCase()+svc.cz.slice(1)} ${city.nom} nabídne individuální přístup a špičkové výsledky pro zákazníky z ${city.nom} a okolí.`,
      },
      // 3: center/studio style
      {
        fullName: `${svc.cz.charAt(0).toUpperCase()+svc.cz.slice(1)}ství ${city.names[3]} ${city.nom}`,
        email: `${city.names[3].toLowerCase()}@${svc.id.slice(0,5)}${city.nom.toLowerCase().replace(/[^a-z]/g,'').slice(0,4)}.cz`,
        address: `${city.streets[3]}, ${city.adr}`,
        desc: `${svc.cz.charAt(0).toUpperCase()+svc.cz.slice(1)}ství ${city.names[3]} poskytuje ${svc.cz2} ${city.loc} a Jihočeském, Středočeském nebo příslušném kraji. Jako ${svc.cz} ${city.nom} garantujeme profesionální provedení a férovouryceny.`,
      },
    ];
    variants.forEach((v, vi) => {
      profiles.push({
        fullName: v.fullName,
        phone: phone(city.phone, si, vi),
        email: v.email,
        serviceId: svc.id,
        cityId: city.id,
        address: v.address,
        description: v.desc,
        picturePath: null,
        active: true,
      });
    });
  });
  return profiles;
}

async function main() {
  let total = 0;
  for (const city of CITIES) {
    const profiles = buildProfiles(city);
    for (const p of profiles) {
      await prisma.provider.create({ data: p });
    }
    console.log(`✓ ${city.nom}: ${profiles.length} profiles`);
    total += profiles.length;
  }
  console.log(`\nDone. Added ${total} profiles across ${CITIES.length} cities.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
