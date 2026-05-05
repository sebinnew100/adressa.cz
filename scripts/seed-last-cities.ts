import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface CityDef {
  id: string; nom: string; loc: string; adr: string; phone: string;
  streets: [string, string, string, string];
  names: [string, string, string, string];
}

const CITIES: CityDef[] = [
  { id: 'jihlava', nom: 'Jihlava', loc: 'v Jihlavě', adr: 'Jihlava', phone: '567',
    streets: ['Masarykovo náměstí 9', 'Palackého 234/16', 'Třebízského 456/28', 'Havlíčkova 789/44'],
    names: ['Horák','Vávra','Čermák','Dvořák'] },
  { id: 'teplice', nom: 'Teplice', loc: 'v Teplicích', adr: 'Teplice', phone: '417',
    streets: ['náměstí Svobody 14', 'Masarykova třída 234/19', 'U Nových lázní 456/33', 'Novosedlická 789/48'],
    names: ['Kuchař','Kalina','Mach','Šimánek'] },
  { id: 'decin', nom: 'Děčín', loc: 'v Děčíně', adr: 'Děčín', phone: '412',
    streets: ['náměstí Benešovo 3', 'Masarykovo náměstí 234/17', 'Riegrova 456/29', 'Labská 789/42'],
    names: ['Šturma','Kutil','Kratochvíl','Mašek'] },
  { id: 'chomutov', nom: 'Chomutov', loc: 'v Chomutově', adr: 'Chomutov', phone: '474',
    streets: ['náměstí 1. máje 8', 'Palackého 234/16', 'Blatenská 456/27', 'Zahradní 789/43'],
    names: ['Vaněk','Kopec','Fiala','Šimák'] },
  { id: 'kolin', nom: 'Kolín', loc: 'v Kolíně', adr: 'Kolín', phone: '321',
    streets: ['Karlovo náměstí 6', 'Politických vězňů 234/14', 'Tyršova 456/26', 'Kutnohorská 789/40'],
    names: ['Vlček','Horák','Kříž','Blažek'] },
  { id: 'prostejov', nom: 'Prostějov', loc: 'v Prostějově', adr: 'Prostějov', phone: '582',
    streets: ['náměstí T. G. Masaryka 7', 'Wolkerova 234/15', 'Rejskovo náměstí 456/27', 'Brněnská 789/41'],
    names: ['Juránek','Zatloukal','Novosad','Hanák'] },
  { id: 'prerov', nom: 'Přerov', loc: 'v Přerově', adr: 'Přerov', phone: '581',
    streets: ['Čechova 12', 'T. G. Masaryka 234/18', 'Komenského 456/30', 'Kratochvílova 789/44'],
    names: ['Pecl','Fojtík','Macháček','Jurka'] },
  { id: 'ceska-lipa', nom: 'Česká Lípa', loc: 'v České Lípě', adr: 'Česká Lípa', phone: '487',
    streets: ['náměstí T. G. Masaryka 5', 'Jindřicha z Lipé 234/16', 'Arbesova 456/28', 'Dubická 789/42'],
    names: ['Horáček','Mašek','Kratochvíl','Novák'] },
];

const SERVICES = [
  { id: 'elektrikar',      cz: 'elektrikář',       desc: (c:string,l:string) => `Elektroinstalace a revize elektroinstalací v ${l}. Elektrikář ${c} zajistí kompletní elektroinstalační práce pro domácnosti i firmy s rychlým výjezdem.` },
  { id: 'instalater',      cz: 'instalatér',        desc: (c:string,l:string) => `Vodoinstalace a topenářské práce v ${l}. Instalatér ${c} provádí opravy vodovodů, výměnu kotlů a rekonstrukce koupelen pro zákazníky v ${c}.` },
  { id: 'malir',           cz: 'malíř',             desc: (c:string,l:string) => `Malování pokojů a lakýrnické práce v ${l}. Malíř ${c} nabídne precizní přípravu povrchů, stěrkování a výmalbu bytů a kanceláří.` },
  { id: 'tesar',           cz: 'tesař',             desc: (c:string,l:string) => `Tesařské práce a výstavba krovů v ${l}. Tesař ${c} realizuje dřevěné konstrukce, střechy, pergoly a přístřešky v ${c} a okolí.` },
  { id: 'truhlar',         cz: 'truhlář',           desc: (c:string,l:string) => `Zakázková výroba nábytku v ${l}. Truhlář ${c} vyrábí kuchyně, skříně, dveře a dřevěné interiéry na míru pro zákazníky v ${c}.` },
  { id: 'zednik',          cz: 'zedník',            desc: (c:string,l:string) => `Zednické a stavební práce v ${l}. Zedník ${c} provádí omítky, obklady, příčky a kompletní rekonstrukce bytů a rodinných domů.` },
  { id: 'klempir',         cz: 'klempíř',           desc: (c:string,l:string) => `Klempířské a pokrývačské práce v ${l}. Klempíř ${c} montuje okapy, provádí oplechování střech a parapetů pro domy v ${c}.` },
  { id: 'autoservis',      cz: 'autoservis',        desc: (c:string,l:string) => `Opravy a servis vozidel v ${l}. Autoservis ${c} nabízí diagnostiku, výměnu oleje, brzd a kompletní údržbu osobních i užitkových vozidel.` },
  { id: 'it-technik',      cz: 'IT technik',        desc: (c:string,l:string) => `Počítačový servis a IT podpora v ${l}. IT technik ${c} opravuje PC, notebooky, instaluje systémy a spravuje sítě pro firmy i domácnosti.` },
  { id: 'fotograf',        cz: 'fotograf',          desc: (c:string,l:string) => `Profesionální fotografické služby v ${l}. Fotograf ${c} pořídí rodinné, firemní, svatební i produktové fotografie s osobitým přístupem.` },
  { id: 'ucitel',          cz: 'lektor',            desc: (c:string,l:string) => `Jazykové kurzy a doučování v ${l}. Lektor ${c} nabízí výuku angličtiny, němčiny a doučování školních předmětů pro děti i dospělé.` },
  { id: 'restaurace',      cz: 'restaurace',        desc: (c:string,l:string) => `Česká restaurace v ${l}. Restaurace ${c} nabídne poctivou českou kuchyni, denní menu a příjemné prostředí pro rodiny i firemní obedy.` },
  { id: 'zubar',           cz: 'zubař',             desc: (c:string,l:string) => `Zubní ordinace v ${l}. Zubař ${c} zajistí komplexní stomatologickou péči, bělení zubů, dentální hygienu a ortodoncii pro celou rodinu.` },
  { id: 'lekar',           cz: 'lékař',             desc: (c:string,l:string) => `Praktický lékař v ${l}. Lékař ${c} přijímá nové pacienty a poskytuje komplexní zdravotní péči, pravidelné prohlídky a vydávání receptů.` },
  { id: 'psycholog',       cz: 'psycholog',         desc: (c:string,l:string) => `Psycholog a psychoterapeut v ${l}. Psycholog ${c} nabídne individuální terapii, párové poradenství a pomoc při zvládání úzkostí a životních krizí.` },
  { id: 'pravnik',         cz: 'právník',           desc: (c:string,l:string) => `Advokát a právní poradenství v ${l}. Právník ${c} zajistí sepis smluv, zastupování u soudu a poradenství v oblasti občanského a obchodního práva.` },
  { id: 'ucetni',          cz: 'účetní',            desc: (c:string,l:string) => `Vedení účetnictví a daňové poradenství v ${l}. Účetní ${c} zpracuje daňová přiznání, mzdovou agendu a podvojné účetnictví pro OSVČ i firmy.` },
  { id: 'kadernik',        cz: 'kadeřník',          desc: (c:string,l:string) => `Kadeřnický salon v ${l}. Kadeřník ${c} nabídne střihy, barvení, melír, keratin a styling vlasů pro ženy i muže v příjemném prostředí.` },
  { id: 'architekt',       cz: 'architekt',         desc: (c:string,l:string) => `Architekt a interiérový designér v ${l}. Architekt ${c} navrhne rodinný dům, rekonstrukci bytu nebo interiér kanceláře přesně dle vašich přání.` },
  { id: 'realitni-makler', cz: 'realitní makléř',   desc: (c:string,l:string) => `Realitní makléř v ${l}. Realitní makléř ${c} pomůže s koupí, prodejem nebo pronájmem bytu, domu nebo komerčních prostor v ${c}.` },
  { id: 'zahradnik',       cz: 'zahradník',         desc: (c:string,l:string) => `Zahradnické práce a péče o zeleň v ${l}. Zahradník ${c} zajistí sekání trávníků, výsadbu rostlin, terénní úpravy a pravidelnou údržbu zahrady.` },
  { id: 'uklid',           cz: 'úklid',             desc: (c:string,l:string) => `Profesionální úklidová firma v ${l}. Úklid ${c} nabídne pravidelný i jednorázový úklid bytů, kanceláří a provozoven s ekologickými prostředky.` },
  { id: 'stehovaci-firma', cz: 'stěhování',         desc: (c:string,l:string) => `Stěhovací firma v ${l}. Stěhování ${c} provede profesionální stěhování bytů a firem se zabalením, přepravou a složením nábytku.` },
  { id: 'trener',          cz: 'trenér',            desc: (c:string,l:string) => `Osobní trenér a fitness poradenství v ${l}. Trenér ${c} sestaví individuální tréninkový plán pro hubnutí, nabírání svalů nebo zlepšení kondice.` },
  { id: 'prekladatel',     cz: 'překladatel',       desc: (c:string,l:string) => `Překlady a tlumočení v ${l}. Překladatel ${c} zajistí odborné překlady smluv, technické dokumentace a úřední překlady pro firmy i jednotlivce.` },
  { id: 'grafik',          cz: 'grafik',            desc: (c:string,l:string) => `Grafický design a tvorba webů v ${l}. Grafik ${c} navrhne logo, firemní identitu, reklamní materiály a webové stránky pro firmy v ${c}.` },
];

const FIRST = ['Jan','Petr','Pavel','Martin','Tomáš','Lukáš','Jiří','Ondřej'];
const titles = ['','Mgr. ','Bc. ','Ing. '];

function buildProfiles(city: CityDef, cityIdx: number) {
  const p: any[] = [];
  SERVICES.forEach((svc, si) => {
    const phoneBase = 200000 + cityIdx * 10000 + si * 400;
    p.push({
      fullName: `${svc.cz.charAt(0).toUpperCase()+svc.cz.slice(1)} ${city.names[0]} ${city.nom}`,
      phone: `+420 ${city.phone} ${String(phoneBase).slice(0,3)} ${String(phoneBase).slice(3,6)}`,
      email: `${city.names[0].toLowerCase().replace(/[^a-z]/g,'')}@${svc.id.replace(/-/g,'')}-${city.id.replace(/-/g,'')}.cz`,
      serviceId: svc.id, cityId: city.id,
      address: `${city.streets[0]}, ${city.adr}`,
      description: `${city.names[0]} – ${svc.cz} ${city.loc}. ` + svc.desc(city.nom, city.loc),
      picturePath: null, active: true,
    });
    p.push({
      fullName: `${FIRST[si % 8]} ${city.names[1]} – ${svc.cz} ${city.nom}`,
      phone: `+420 ${city.phone} ${String(phoneBase+1).slice(0,3)} ${String(phoneBase+1).slice(3,6)}`,
      email: null,
      serviceId: svc.id, cityId: city.id,
      address: `${city.streets[1]}, ${city.adr}`,
      description: `${FIRST[si % 8]} ${city.names[1]} je ${svc.cz} ${city.loc} s dlouholetou praxí. ` + svc.desc(city.nom, city.loc),
      picturePath: null, active: true,
    });
    p.push({
      fullName: `${titles[si % 4]}${city.names[2]} – ${svc.cz} ${city.nom}`,
      phone: `+420 ${city.phone} ${String(phoneBase+2).slice(0,3)} ${String(phoneBase+2).slice(3,6)}`,
      email: `${city.names[2].toLowerCase().replace(/[^a-z]/g,'')}@${svc.id.slice(0,5)}-${city.adr.toLowerCase().replace(/[^a-z]/g,'').slice(0,4)}.cz`,
      serviceId: svc.id, cityId: city.id,
      address: `${city.streets[2]}, ${city.adr}`,
      description: `${city.names[2]} je spolehlivý ${svc.cz} ${city.loc}. ` + svc.desc(city.nom, city.loc),
      picturePath: null, active: true,
    });
    p.push({
      fullName: `Studio ${city.names[3]} – ${svc.cz} ${city.nom}`,
      phone: `+420 ${city.phone} ${String(phoneBase+3).slice(0,3)} ${String(phoneBase+3).slice(3,6)}`,
      email: `studio.${city.names[3].toLowerCase().replace(/[^a-z]/g,'')}@${city.id.replace(/-/g,'')}.cz`,
      serviceId: svc.id, cityId: city.id,
      address: `${city.streets[3]}, ${city.adr}`,
      description: `Studio ${city.names[3]} poskytuje ${svc.cz} ${city.loc}. ` + svc.desc(city.nom, city.loc),
      picturePath: null, active: true,
    });
  });
  return p;
}

async function main() {
  let total = 0;
  for (let ci = 0; ci < CITIES.length; ci++) {
    const city = CITIES[ci];
    const profiles = buildProfiles(city, ci);
    for (const p of profiles) {
      await prisma.provider.create({ data: p });
    }
    console.log(`✓ ${city.nom}: ${profiles.length} profiles`);
    total += profiles.length;
  }
  console.log(`\nDone. Added ${total} profiles across ${CITIES.length} cities.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
