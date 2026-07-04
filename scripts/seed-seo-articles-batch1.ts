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
    title: 'Kolik stojí instalatér v Brně? Ceník oprav a montáží 2026',
    excerpt: 'Přehled orientačních cen instalatérských prací v Brně — od opravy kapajícího kohoutku po výměnu bojleru.',
    relatedServiceId: 'instalater',
    relatedCityId: 'brno',
    content: `Instalatérské práce patří mezi služby, které většina domácností potřebuje minimálně jednou za pár let — ať už jde o havárii, nebo plánovanou rekonstrukci koupelny. Cena se ale výrazně liší podle rozsahu práce, a proto je dobré mít alespoň orientační představu předem.

Za běžný výjezd a drobnou opravu (kapající kohoutek, ucpaný odpad, výměna těsnění) se v Brně obvykle platí v řádu stovek korun za hodinu práce, k tomu materiál. Složitější zásahy, jako je výměna baterie nebo instalace nového sifonu, se pohybují v jednotkách tisíc korun včetně materiálu.

Výměna bojleru je už větší zakázka — cena se odvíjí od typu a objemu nádrže, ale i od toho, zda se mění za stejný model, nebo je potřeba upravit rozvody. U rekonstrukce koupelny se pak řeší kompletní přepojení vody a odpadů, což je práce na několik dní a cena se počítá individuálně podle rozsahu.

Na co si dát pozor při výběru instalatéra: ptejte se na cenu předem, ideálně formou odhadu po prohlídce na místě, ne jen po telefonu. Solidní řemeslník dokáže rozlišit, co je nutná oprava a co jen doporučení, a nebude tlačit na zbytečné výměny. Reference od předchozích zákazníků a rychlost reakce při havárii jsou často důležitější než nejnižší nabídnutá cena.

Pokud hledáte instalatéra v Brně, srovnejte si nabídky od více odborníků — u běžných oprav se cena může lišit i o desítky procent.`,
  },
  {
    title: 'Malování bytu svépomocí vs. najatý malíř — co se vyplatí?',
    excerpt: 'Srovnání nákladů, času a výsledku při malování svépomocí a najmutí profesionálního malíře pokojů.',
    relatedServiceId: 'malir',
    relatedCityId: null,
    content: `Vymalovat byt sami, nebo zavolat malíře? Otázka, kterou řeší téměř každý, kdo se stěhuje nebo si chce osvěžit interiér. Odpověď záleží hlavně na tom, kolik máte času, jak náročný je prostor a jaký výsledek očekáváte.

Svépomocí ušetříte hlavně na práci — zaplatíte jen barvu, válečky, štětce, lepicí pásku a fólie na ochranu podlahy. U menšího bytu se náklady na materiál pohybují v jednotkách tisíc korun. Nevýhodou je čas: vymalovat byt 2+1 na víkend zvládne zkušenější kutil, začátečník ale často potřebuje dva až tři dny včetně příprav a úklidu.

Najatý malíř práci zvládne rychleji a s rovnoměrnějším výsledkem, hlavně u stropů, rohů a míst, kde je potřeba přesná práce. Cena se počítá obvykle za metr čtvereční nebo paušálně za místnost a zahrnuje i drobné opravy podkladu (výmalba prasklin, tmelení). Za profesionální práci u bytu střední velikosti zaplatíte řádově nižší tisíce až desítky tisíc korun podle rozsahu a počtu barev.

Svépomocné malování se vyplatí, pokud máte čas, jednodušší prostor bez větších oprav podkladu a nevadí vám drobné nedokonalosti. Najatý malíř dává smysl při rekonstrukci, u větších ploch, složitějších barevných kombinací nebo když prostě chcete mít vymalováno rychle a bez starostí.

Ať zvolíte kteroukoli variantu, vyplatí se předem si spočítat plochu stěn a připravit prostor — ochrana podlah a nábytku ušetří čas i nervy.`,
  },
  {
    title: 'Kolik stojí stěhovací firma v Praze? Kompletní ceník',
    excerpt: 'Orientační ceny stěhování v Praze podle velikosti bytu, patra a vzdálenosti — na co se ptát před objednáním.',
    relatedServiceId: 'stehovaci-firma',
    relatedCityId: 'praha',
    content: `Stěhování je jedna z těch služeb, kde se cena může výrazně lišit podle detailů — velikosti bytu, patra, dostupnosti výtahu i vzdálenosti mezi adresami. V Praze se ceny obvykle počítají buď hodinově (tým + auto), nebo paušálně za celou zakázku.

Za menší byt (garsonka, 1+kk) se stěhovací firmy v Praze pohybují v nižších tisících korun, pokud je snadný přístup a výtah. U bytu 2+1 nebo 3+1 se počítá s vyšší časovou náročností i objemem věcí, cena tak roste úměrně. Patro bez výtahu obvykle znamená příplatek — vynášení těžkého nábytku po schodech je fyzicky náročné a firmy si ho počítají zvlášť.

Kromě samotného stěhování si ověřte, zda cena zahrnuje i balicí materiál, případně rozebrání a sestavení nábytku. Některé firmy nabízí i uskladnění věcí, což se hodí při stěhování mezi nájmy s časovou prodlevou.

Při výběru firmy je dobré požádat o cenovou nabídku po telefonickém popisu situace (počet místností, patro, vzdálenost) a porovnat alespoň dvě až tři nabídky. Solidní firma se také zeptá na specifika — velký nábytek, piano, křehké věci — protože to ovlivňuje potřebný počet lidí a typ vozidla.

Naplánujte stěhování s dostatečným předstihem, zvlášť o víkendech a na konci měsíce, kdy je poptávka nejvyšší a firmy mají plný kalendář.`,
  },
  {
    title: 'Jak často si nechat uklidit byt? Průvodce úklidovými službami',
    excerpt: 'Jak vybrat frekvenci úklidu, co obvykle zahrnuje běžný a generální úklid a na co se ptát úklidové firmy.',
    relatedServiceId: 'uklid',
    relatedCityId: 'praha',
    content: `Pravidelný úklid je jedna z služeb, u kterých si lidé často nejsou jistí, jak často ji vlastně potřebují. Odpověď záleží na velikosti domácnosti, počtu lidí, domácích mazlíčcích a na tom, kolik času sami na úklid máte.

Pro jednu nebo dvoučlennou domácnost bez dětí obvykle stačí úklid jednou za dva týdny — zahrnuje vysávání, mytí podlah, koupelny a kuchyně, utírání prachu. Rodiny s dětmi nebo domácnosti se zvířaty často volí týdenní frekvenci, protože se prach a nepořádek hromadí rychleji.

Kromě pravidelného úklidu nabízí většina firem i generální úklid — důkladnější zásah, který zahrnuje mytí oken, čištění spotřebičů, umývání skříněk zevnitř a další detaily, na které při běžném úklidu nezbývá čas. Generální úklid se hodí před stěhováním, po rekonstrukci nebo jednou až dvakrát ročně jako doplněk k pravidelnému úklidu.

Při výběru úklidové firmy v Praze se ptejte na to, zda si nosí vlastní čisticí prostředky a pomůcky, jak řeší případné škody a zda je možné domluvit se na konkrétním čase a dni. Důvěra je tady klíčová — do bytu pouštíte cizí osobu, takže reference a zkušenosti od jiných zákazníků hrají velkou roli.

Cena se obvykle počítá podle metráže bytu a zvolené frekvence — pravidelní zákazníci často dostávají výhodnější sazbu než jednorázový úklid.`,
  },
  {
    title: 'Pomalý počítač nebo pomalý internet? Kdy zavolat IT technika',
    excerpt: 'Jak poznat, jestli problém s počítačem nebo sítí vyřešíte sami, a kdy se vyplatí zavolat IT technika.',
    relatedServiceId: 'it-technik',
    relatedCityId: 'praha',
    content: `Pomalý počítač, výpadky Wi-Fi nebo podivné chyby při spuštění — s podobnými problémy se dřív nebo později setká skoro každá domácnost i malá firma. Otázka je, kdy se dá problém vyřešit svépomocí a kdy je efektivnější zavolat IT technika.

Základní kroky, které zvládne většina uživatelů sama: restart routeru a počítače, kontrola volného místa na disku, aktualizace systému a odinstalování nepoužívaných programů. Tyto jednoduché zásahy vyřeší překvapivě velké procento běžných problémů s výkonem.

Pokud ale problém přetrvává — počítač je pomalý i po restartu, síť vypadává opakovaně bez zjevného důvodu, nebo se objevují chybové hlášky, kterým nerozumíte — má smysl zavolat odborníka. IT technik dokáže rychle diagnostikovat, jestli jde o hardwarový problém (stárnoucí disk, nedostatek paměti), softwarový (malware, konflikty aplikací), nebo problém se samotnou sítí (slabý signál, zastaralý router).

V Praze IT technici často nabízí i vzdálenou pomoc přes internet, což je rychlejší a levnější než osobní návštěva, pokud jde o softwarový problém. Osobní návštěva se vyplatí u hardwarových závad, instalace nové sítě nebo nastavení domácí kanceláře s více zařízeními.

Než technika zavoláte, zkuste si problém krátce popsat — kdy nastává, jak často a co jste zkoušeli sami. Usnadní to diagnostiku a často i zkrátí čas (a cenu) samotné opravy.`,
  },
  {
    title: 'Kolik stojí účetní pro OSVČ? Ceny účetnictví v ČR 2026',
    excerpt: 'Orientační ceny vedení účetnictví a daňové evidence pro OSVČ, a na co se ptát před výběrem účetní.',
    relatedServiceId: 'ucetni',
    relatedCityId: null,
    content: `Vedení účetnictví je pro řadu OSVČ jedna z prvních služeb, kterou si najímají, jakmile administrativa přeroste možnosti dělat si vše sám. Cena se liší podle typu evidence, počtu dokladů a toho, jestli jde o paušální daň, daňovou evidenci, nebo podvojné účetnictví.

OSVČ na paušální dani obvykle potřebuje jen minimální administrativu, takže náklady na účetní bývají nejnižší — často jde jen o kontrolu a přípravu ročního přehledu. U daňové evidence se cena odvíjí hlavně od počtu dokladů za měsíc — čím více faktur a plateb, tím vyšší paušál. Podvojné účetnictví (typické pro s.r.o., ale i některé větší OSVČ) je nejnáročnější na čas účetní, a tomu odpovídá i cena.

Účetní obvykle nabízí buď měsíční paušál, nebo cenu za doklad — paušál se vyplatí při stabilním objemu agendy, cena za doklad zase u sezónních oborů, kde se objem práce mění.

Při výběru účetní se ptejte, jaký účetní software používá a zda vám umožní online přístup k datům, jak rychle reaguje na dotazy a jestli má zkušenosti s vaším oborem podnikání — účetnictví e-shopu se v detailech liší od účetnictví řemeslníka nebo poradce. Důležitá je i odpovědnost za případné chyby — solidní účetní by měla mít profesní pojištění.

Cena za vedení účetnictví se vrátí ušetřeným časem a jistotou, že daně a přiznání jsou v pořádku a včas.`,
  },
  {
    title: 'Jak si vybrat dobrého kadeřníka — na co se ptát předem',
    excerpt: 'Praktické tipy, jak poznat kvalitního kadeřníka v Brně ještě před první návštěvou salonu.',
    relatedServiceId: 'kadernik',
    relatedCityId: 'brno',
    content: `Najít kadeřníka, kterému budete důvěřovat dlouhodobě, není vždy jednoduché — správný střih nebo barvení totiž závisí na zkušenosti a citu pro detail, ne jen na ceně služby. Než se objednáte na první návštěvu, vyplatí se udělat si malý průzkum.

Prvním krokem je pohled na portfolio práce — většina kadeřníků a salonů dnes sdílí fotky předchozích klientů na sociálních sítích. Zaměřte se na účesy podobné tomu, co chcete vy, ne jen na obecně hezké fotky. Recenze od skutečných zákazníků, ideálně s detailním popisem zkušenosti, řeknou víc než jen počet hvězdiček.

Při první konzultaci by měl kadeřník klást otázky — jak strukturu vlasů, tak vaše zvyklosti při stylingu doma, případně alergie na barvicí přípravky. Pokud kadeřník bez ptaní rovnou navrhuje velkou změnu, je namístě chvíli zpomalit a probrat očekávání důkladněji.

V Brně najdete salony napříč cenovými kategoriemi — od studentských cen po prémiové salony s dlouholetou praxí. Vyšší cena obvykle znamená zkušenějšího kadeřníka nebo prémiové produkty, ale i mezi dostupnějšími salony existují šikovní odborníci, zvlášť pokud si najdete konkrétního kadeřníka na doporučení, ne jen salon obecně.

Nebojte se zeptat na cenu předem, včetně případných příplatků za délku vlasů nebo speciální techniky barvení — vyhnete se tak nepříjemnému překvapení na konci návštěvy.`,
  },
  {
    title: 'Údržba zahrady: svépomocí nebo najmout zahradníka?',
    excerpt: 'Srovnání času, nákladů a výsledku při péči o zahradu svépomocí a s pomocí profesionálního zahradníka.',
    relatedServiceId: 'zahradnik',
    relatedCityId: null,
    content: `Zahrada vyžaduje pravidelnou péči — sekání trávníku, stříhání keřů, jarní a podzimní úklid. Otázka, zda vše zvládnout sami nebo najmout zahradníka, závisí hlavně na velikosti pozemku, typu zeleně a na tom, kolik volného času máte k dispozici.

Menší zahradu s trávníkem a pár keři zvládne většina lidí sama s běžným nářadím — sekačkou, nůžkami na živý plot a hráběmi. Časová náročnost roste s velikostí pozemku a počtem stromů či keřů, které vyžadují odborný řez. Svépomocná péče ušetří peníze za práci, ale vyžaduje pravidelnost — zanedbaná zahrada se zarůstá rychle a náprava pak zabere podstatně víc času.

Najmutí zahradníka dává smysl u větších pozemků, komplikovanějšího terénu, nebo když chcete odborný přístup k výsadbě a údržbě okrasných rostlin. Zahradník také lépe pozná, kdy a jak stromy a keře řezat, aby nedošlo k jejich poškození — špatně provedený řez může rostlinu na roky poznamenat.

Řada lidí volí kombinaci: běžné sekání trávníku zvládají sami, ale na odborné zásahy (řez ovocných stromů, zakládání nových záhonů, podzimní přípravu zahrady na zimu) si najímají zahradníka jednou až dvakrát ročně.

Při výběru zahradníka se ptejte na zkušenosti s podobným typem zahrady a požadujte jasnou představu o rozsahu práce a ceně předem — u sezónních prací se poptávka soustředí hlavně na jaro a podzim.`,
  },
  {
    title: 'Kolik stojí truhlář na míru vyrobený nábytek?',
    excerpt: 'Orientační ceny nábytku na míru od truhláře — od vestavěných skříní po kuchyňské linky.',
    relatedServiceId: 'truhlar',
    relatedCityId: null,
    content: `Nábytek na míru od truhláře řeší problém, který sériová výroba často nezvládne — nepravidelné prostory, specifické požadavky na úložný prostor nebo kombinaci materiálů, kterou v obchodě nekoupíte. Cena se ale výrazně liší podle rozsahu a materiálu.

Nejjednodušší zakázkou bývá vestavěná skříň do niky nebo pod schody — cena se počítá podle rozměrů, počtu dveří a typu materiálu (laminovaná deska, dýha, masiv). Masivní dřevo je podstatně dražší než laminátové desky, ale nabízí jinou životnost a vzhled.

Kuchyňská linka na míru patří mezi náročnější zakázky — truhlář musí zohlednit rozměry spotřebičů, rozvody vody a elektřiny i pracovní desku. Cena se tak skládá z více položek a truhláři obvykle nabízí nezávaznou konzultaci s návrhem předtím, než se pustí do výroby.

Při výběru truhláře se dívejte na portfolio předchozích zakázek — u nábytku na míru je vidět kvalita zpracování detailů, jako jsou spáry, kování a povrchová úprava. Ptejte se také na záruční dobu a co zahrnuje (jen konstrukce, nebo i kování a spotřebiče).

Cena za práci na míru je vyšší než u sériového nábytku, ale vyplatí se tam, kde potřebujete přesně využít prostor nebo chcete nábytek, který vydrží déle než běžná montovaná varianta.`,
  },
  {
    title: 'Jak vybrat zubaře v Ostravě — recenze a doporučení',
    excerpt: 'Na co se zaměřit při výběru nového zubaře v Ostravě, včetně otázek k prevenci a akutním zákrokům.',
    relatedServiceId: 'zubar',
    relatedCityId: 'ostrava',
    content: `Výběr zubaře je rozhodnutí, které se dlouhodobě vyplatí udělat pečlivě — pravidelná preventivní péče je totiž levnější a méně nepříjemná než řešení zanedbaných problémů. V Ostravě máte na výběr z řady praxí, soukromých i těch napojených na pojišťovny.

Prvním krokem je zjistit, zda zubař přijímá vaši pojišťovnu a jaké má aktuálně kapacity — u oblíbených praxí bývá čekací doba na zápis delší. Recenze od pacientů dají dobrý obrázek o přístupu k pacientům, zvlášť pokud zmiňují konkrétní zkušenosti s citlivostí k obavám z ošetření nebo trpělivostí u dětí.

Pro pravidelnou péči je důležitá dostupnost termínů na preventivní prohlídky, ideálně dvakrát ročně. U akutních případů (bolest, úraz) se ptejte, jak zubař řeší neobjednané pacienty — někteří mají vyhrazené sloty pro akutní stavy, jiní odkazují na pohotovost.

Pokud plánujete náročnější zákrok, jako je implantát nebo rovnátka, ověřte si, zda ho zubař provádí sám, nebo odkazuje na specialistu. U specializovaných výkonů má smysl požádat o konzultaci předem a nechat si vysvětlit postup i orientační cenu.

Dobrý vztah se zubařem je založený na důvěře a otevřené komunikaci — nebojte se ptát na alternativy ošetření a jejich cenu, seriózní zubař vám vždy vysvětlí, proč doporučuje konkrétní postup.`,
  },
  {
    title: 'Kdy vyměnit brzdy? Praktický průvodce servisem auta',
    excerpt: 'Jak poznat, že auto potřebuje servis brzd, a orientační ceny běžných zásahů v pražských autoservisech.',
    relatedServiceId: 'autoservis',
    relatedCityId: 'praha',
    content: `Brzdy patří mezi nejdůležitější bezpečnostní prvky auta, a přesto jejich opotřebení řada řidičů podceňuje, dokud se neozve nepříjemný zvuk nebo nezhorší brzdná dráha. Znát varovné signály se vyplatí každému.

Mezi typické příznaky opotřebených brzd patří kvílivý nebo skřípavý zvuk při brzdění, delší brzdná dráha, vibrace v pedálu nebo volantu, případně auto stahuje na jednu stranu. Pokud si všimnete kteréhokoli z těchto příznaků, je vhodné nechat brzdy zkontrolovat co nejdřív — odkládání může vést k poškození dalších částí (kotouče, třmeny) a tím i vyšší ceně opravy.

V pražských autoservisech se běžná výměna brzdových destiček pohybuje v nižších tisících korun za nápravu, včetně práce. Pokud je potřeba vyměnit i brzdové kotouče, cena logicky roste. Prevence je levnější než náprava — pravidelná kontrola při STK nebo výměně oleje odhalí opotřebení dřív, než začne být kritické.

Při výběru autoservisu v Praze se ptejte, zda používají originální nebo značkové neoriginální díly, a nechte si vždy vystavit rozpis prací a cenu předem. Seriózní servis vám ukáže opotřebené díly a vysvětlí, proč je výměna potřeba, ne jen sdělí konečnou cenu.

Kromě brzd nezapomínejte na pravidelnou kontrolu pneumatik, oleje a chlazení — pravidelný servis prodlužuje životnost auta a snižuje riziko nečekané poruchy.`,
  },
  {
    title: 'Prodej bytu s makléřem nebo bez? Výhody a nevýhody',
    excerpt: 'Srovnání prodeje nemovitosti s realitním makléřem a svépomocí — co ušetříte a co riskujete.',
    relatedServiceId: 'realitni-makler',
    relatedCityId: null,
    content: `Prodej bytu je jedna z největších finančních transakcí v životě, a proto se řada lidí ptá, jestli se vyplatí platit provizi realitnímu makléři, nebo je lepší prodat nemovitost svépomocí přímo.

Prodej bez makléře ušetří provizi, která se obvykle počítá jako procento z prodejní ceny. Vyžaduje to ale čas a znalosti — od stanovení realistické ceny přes inzerci a komunikaci se zájemci až po právní stránku převodu vlastnictví. Chyba v kterékoli fázi, od podhodnocení nemovitosti po problém ve smlouvě, může stát víc, než by byla ušetřená provize.

Realitní makléř přináší zkušenost s aktuální situací na trhu, síť kontaktů a schopnost oddělit vážné zájemce od zvědavců. Dobrý makléř také pomůže s přípravou bytu na prohlídky, profesionálními fotkami a inzercí na více portálech najednou, což zrychluje prodej.

Klíčové je vybrat makléře s prokazatelnými výsledky v dané lokalitě a ptát se na konkrétní reference z podobných prodejů. Ptejte se také na to, co všechno provize zahrnuje — právní servis, inzerci, home staging — protože rozsah služeb se mezi makléři výrazně liší.

Rozhodnutí mezi svépomocným prodejem a makléřem záleží na tom, kolik času máte, jak dobře znáte místní trh a jak moc chcete mít jistotu hladkého průběhu celé transakce.`,
  },
  {
    title: 'Kolik stojí svatební fotograf v ČR? Ceník 2026',
    excerpt: 'Orientační ceny svatebního focení v Česku podle délky focení, počtu fotografů a rozsahu balíčku.',
    relatedServiceId: 'fotograf',
    relatedCityId: null,
    content: `Svatební fotografie patří mezi vzpomínky, ke kterým se páry vrací celý život, a proto se vyplatí vybrat fotografa pečlivě a s dostatečným předstihem — oblíbení fotografové bývají na oblíbené termíny vyprodaní i rok dopředu.

Cena svatebního focení se v Česku odvíjí hlavně od délky focení (několik hodin vs. celý den), počtu fotografů a rozsahu výstupu — počet upravených fotografií, tisk alba, případně video jako doplněk. Kratší balíčky pokrývající jen obřad a několik hodin oslavy patří k levnějším variantám, celodenní focení s druhým fotografem a fotoknihou naopak k dražším.

Při výběru fotografa se dívejte hlavně na styl portfolia — někteří fotografové preferují klasické pózované snímky, jiní reportážní přístup zachycující spontánní momenty. Styl by měl odpovídat tomu, co si od svatebních fotek představujete vy.

Nezapomeňte se zeptat na termín dodání hotových fotografií, formát předání (online galerie, USB) a zda cena zahrnuje i předsvatební focení (tzv. engagement session). Důležité je také ujasnit si autorská práva k fotkám a možnost tisku u externí tiskárny.

Rezervace fotografa s předstihem není jen o dostupnosti termínu — dá vám i čas na osobní schůzku, kde si ujasníte očekávání a harmonogram svatebního dne.`,
  },
  {
    title: 'Kdy potřebujete právníka na nájemní smlouvu?',
    excerpt: 'Situace, kdy se vyplatí nechat nájemní smlouvu zkontrolovat právníkem, a na co si dát pozor sami.',
    relatedServiceId: 'pravnik',
    relatedCityId: null,
    content: `Nájemní smlouva je dokument, který ovlivňuje vztah mezi pronajímatelem a nájemcem na měsíce až roky dopředu, a přesto ji mnoho lidí podepisuje bez důkladného přečtení. Ne každá smlouva vyžaduje právníka, ale existují situace, kdy se to jednoznačně vyplatí.

Standardní nájemní smlouva na běžný byt s jasnými podmínkami (výše nájmu, kauce, výpovědní lhůta) obvykle zvládne posoudit i laik se základní znalostí svých práv — stačí zkontrolovat, že smlouva neobsahuje nezákonné podmínky, jako je zákaz výpovědi ze strany nájemce nebo nepřiměřeně vysoká kauce.

Právníka se vyplatí zapojit u komplikovanějších situací — dlouhodobý nájem s opcí na koupi, nájem komerčních prostor, smlouva s neobvyklými doložkami, nebo když pronajímatel trvá na vlastní verzi smlouvy s podmínkami, kterým nerozumíte. Právník dokáže odhalit skryté riziko, například nejasně formulovanou odpovědnost za opravy nebo nevýhodné podmínky ukončení smlouvy.

Kontrola smlouvy právníkem před podpisem je obvykle rychlá záležitost v řádu hodin a cena se odvíjí od složitosti dokumentu. Vrátí se ale v jistotě, že nepodepisujete nic, co by vás mohlo později finančně nebo právně poškodit.

Pokud si nejste jistí, zda smlouva potřebuje právní kontrolu, konzultace s právníkem i jen na posouzení pár sporných bodů je rozumný kompromis mezi cenou a jistotou.`,
  },
];

async function main() {
  console.log('Seeding SEO articles (batch 1)...');
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
