import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const articles = [
  {
    title: 'Kdy potřebujete revizi elektroinstalace a kolik stojí?',
    excerpt: 'Jak poznat, že byt nebo dům potřebuje revizi elektroinstalace, a orientační ceny v Praze.',
    relatedServiceId: 'elektrikar',
    relatedCityId: 'praha',
    content: `Revize elektroinstalace patří mezi věci, na které se snadno zapomíná, dokud se něco nepokazí — a přitom jde o jednu z mála kontrol, která dokáže předejít požáru nebo úrazu elektrickým proudem. Kdy je na čase ji nechat udělat?

Ze zákona je revize povinná při kolaudaci novostavby, po větší rekonstrukci elektroinstalace a v pravidelných intervalech u bytů a domů — obvykle jednou za pět let u bydlení, kratší lhůty platí pro provozovny a sklepy s vyšším rizikem. Kromě povinných termínů se revize vyplatí i mimo harmonogram, pokud kupujete starší byt a nevíte, v jakém stavu elektroinstalace skutečně je.

Varovné signály, které by měly popohnat k zavolání elektrikáře i mimo plánovanou revizi: jističe padají bez zjevného důvodu, zásuvky jsou na dotek teplé, cítíte zápach spáleniny u vypínačů, nebo světla občas blikají bez souvislosti se spotřebou. Jakýkoli z těchto příznaků je důvod nečekat na pravidelný termín.

V Praze se cena revize odvíjí hlavně od velikosti bytu a počtu měřených okruhů — u běžného bytu jde o práci na pár hodin, u rodinného domu s víc rozvaděči logicky déle. Součástí revize je i písemná zpráva s případnými závadami, kterou budete potřebovat i pro pojišťovnu v případě škody způsobené elektroinstalací.

Při výběru elektrikáře na revizi se ujistěte, že má platné oprávnění revizního technika — bez něj zpráva nemá právní váhu. Revize sice stojí peníze navíc, ale ve srovnání s rizikem požáru nebo škody na majetku jde o jednu z nejlevnějších jistot, které si můžete pořídit.`,
  },
  {
    title: 'Rekonstrukce bytu: kdy zavolat zedníka a co všechno řeší',
    excerpt: 'Jaké práce při rekonstrukci bytu spadají na zedníka a orientační ceny v Ostravě.',
    relatedServiceId: 'zednik',
    relatedCityId: 'ostrava',
    content: `Rekonstrukce bytu zahrnuje řadu řemesel, ale zedník bývá tím prvním, kdo na stavbu přijde a posledním, kdo ji opouští — bourání příček, vyzdívky, omítky i závěrečné úpravy povrchů spadají právě do jeho práce.

Mezi typické zakázky patří bourání a stavba nových příček, sekání drážek pro rozvody, vyrovnávání podlah před pokládkou dlažby nebo plovoucí podlahy, a samozřejmě omítky — jak vnitřní, tak fasádní. U starších bytů v Ostravě se často řeší i oprava vlhkých zdí nebo výměna omítky po havárii vody, kde zedník spolupracuje s izolatérem.

Rozsah práce se výrazně liší mezi drobnou opravou (oprava prasklé omítky, dozdění po elektrikáři) a kompletní rekonstrukcí bytového jádra, kde zedník tráví na stavbě týdny. Cena se proto obvykle počítá individuálně po prohlídce, ne paušálně — zkušený zedník dokáže na místě odhadnout rozsah práce a případné komplikace (nerovné zdi, staré vedení v příčkách).

Při plánování rekonstrukce má smysl domluvit pořadí řemesel předem — zedník obvykle nastupuje po bourání a před elektrikářem a instalatérem, kteří potřebují hotové nové příčky pro rozvody, a znovu se vrací na dokončovací omítky. Špatně naplánovaný harmonogram je jeden z nejčastějších důvodů zpoždění rekonstrukcí.

Při výběru zedníka v Ostravě se ptejte na reference z podobně velkých zakázek a na to, zda pracuje sám nebo v týmu — u větších rekonstrukcí tým zvládne práci výrazně rychleji, u drobných oprav stačí jeden zkušený řemeslník.`,
  },
  {
    title: 'Jak si vybrat praktického lékaře po přestěhování',
    excerpt: 'Na co se zaměřit při hledání nového praktického lékaře v Brně a jak probíhá přeregistrace.',
    relatedServiceId: 'lekar',
    relatedCityId: 'brno',
    content: `Po přestěhování do nového města patří hledání praktického lékaře mezi věci, které se snadno odkládají — dokud člověk lékaře skutečně nepotřebuje. Vyřídit registraci v klidu předem se ale vyplatí, protože u oblíbených ordinací bývá čekací doba na přijetí nových pacientů delší.

První krok je zjistit, kteří praktičtí lékaři v Brně aktuálně přijímají nové pacienty a zda mají smlouvu s vaší zdravotní pojišťovnou — ne všechny ordinace mají volnou kapacitu, zvlášť v centru města. Recenze od pacientů dají představu o přístupu lékaře, dostupnosti termínů a o tom, jak dlouho se obvykle čeká v čekárně i na objednání.

Samotná přeregistrace je jednoduchá administrativa — stačí vyplnit registrační list u nového lékaře, který si sám vyžádá zdravotnickou dokumentaci od předchozí ordinace. Pojišťovnu není potřeba kontaktovat zvlášť, o změnu se postará nová ordinace.

Při výběru lékaře zvažte i praktické věci — dostupnost ordinace od bydliště nebo práce, ordinační hodiny (někteří lékaři nabízí i podvečerní hodiny pro pracující pacienty) a možnost objednání online místo telefonického dovolávání se. U rodin s dětmi má smysl zjistit i to, zda lékař řeší akutní stavy mimo objednací dobu nebo odkazuje na pohotovost.

Nový praktický lékař by měl při první návštěvě udělat základní vstupní vyšetření a projít vaši zdravotní historii — je to dobrá příležitost zeptat se na vše, co vás u péče zajímá, a ověřit si, že vám přístup lékaře vyhovuje dlouhodobě.`,
  },
  {
    title: 'Kdy potřebujete klempíře: okapy, střechy a oplechování',
    excerpt: 'Jaké práce spadají pod klempíře, kdy neodkládat opravu okapů a jak vybrat spolehlivého řemeslníka.',
    relatedServiceId: 'klempir',
    relatedCityId: null,
    content: `Klempířské práce si většina lidí spojí až s problémem — ucpaným okapem, zatékající střechou nebo poškozeným oplechováním komína. Přitom pravidelná údržba dokáže řadě těchto problémů předejít a vyjde podstatně levněji než oprava následných škod.

Mezi základní klempířské práce patří montáž a oprava okapů a svodů, oplechování střešních prvků (komíny, úžlabí, atiky) a klempířské prvky fasád. Zanedbaný okap, který přetéká nebo je ucpaný listím, může během pár sezón způsobit vlhnutí fasády nebo dokonce zatékání do konstrukce střechy — oprava takové škody je vždy dražší než pravidelné čištění a kontrola.

Varovné signály, kdy neodkládat návštěvu klempíře: viditelně prohnuté nebo odchlípnuté okapy, rez na plechových prvcích, stopy zatékání na fasádě pod okapem, nebo zjevné poškození oplechování po silném větru či bouři. U starších střech se vyplatí nechat zkontrolovat stav oplechování při každé větší údržbě střechy.

Cena klempířských prací se odvíjí od rozsahu a výšky práce — montáž nových okapů na rodinný dům je jiná zakázka než oprava jednoho poškozeného úseku. U prací ve výškách je potřeba i odborné vybavení (lešení, jištění), což se promítá do ceny, ale zároveň jde o práci, kterou se nevyplatí řešit svépomocí kvůli riziku úrazu.

Při výběru klempíře se ptejte na zkušenosti s podobným typem střechy a materiálem (plech, měď, zinek) a požadujte jasnou představu o rozsahu práce před začátkem — u prací na střeše je nepříjemné překvapení s vícepracemi obzvlášť nákladné.`,
  },
  {
    title: 'Osobní trenér: kolik stojí a jak vybrat toho pravého',
    excerpt: 'Co čekat od spolupráce s osobním trenérem, orientační ceny v Praze a na co se ptát před první lekcí.',
    relatedServiceId: 'trener',
    relatedCityId: 'praha',
    content: `Osobní trenér dává smysl ve chvíli, kdy cvičení v posilovně přestává přinášet výsledky, chybí motivace, nebo prostě nevíte, jak sestavit plán, který odpovídá vašemu cíli — ať je to hubnutí, nabírání síly, nebo rehabilitace po zranění.

V Praze se ceny osobního tréninku pohybují podle zkušeností trenéra, délky lekce a toho, zda probíhá v komerční posilovně, nebo trenér dojíždí domů či do parku. Balíčky více lekcí bývají zpravidla výhodnější než jednotlivé vstupy, a řada trenérů nabízí i úvodní konzultaci zdarma nebo za sníženou cenu.

Při výběru trenéra je klíčové ujasnit si cíl spolupráce už na první schůzce — dobrý trenér se ptá na zdravotní historii, předchozí zkušenosti s cvičením a časové možnosti, ne jen na to, kolik chcete zhubnout. Certifikace a vzdělání jsou důležité, ale minimálně stejně důležitá je schopnost sestavit plán, který reálně zvládnete dodržovat.

Nebojte se zeptat na reference nebo krátké video z tréninku — způsob vedení lekce (motivace, kontrola správného provedení cviků, přizpůsobení tempa) se mezi trenéry výrazně liší a je lepší to zjistit předem, než po zaplacení balíčku lekcí.

Výsledky osobního tréninku nezávisí jen na trenérovi, ale i na pravidelnosti a dodržování doporučení mimo lekce — proto se vyplatí vybrat trenéra, se kterým si dobře rozumíte a jehož přístup vám dlouhodobě vyhovuje, ne jen toho s nejnižší cenou za lekci.`,
  },
];

async function main() {
  console.log('Seeding SEO articles (batch 2)...');
  for (const a of articles) {
    const slug = slugify(a.title);
    await prisma.article.create({
      data: {
        title: a.title,
        slug,
        excerpt: a.excerpt,
        content: a.content,
        relatedServiceId: a.relatedServiceId,
        relatedCityId: a.relatedCityId,
        published: true,
      },
    });
    console.log(`  ✓ ${a.title.slice(0, 60)}…`);
  }
  console.log('Done.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
