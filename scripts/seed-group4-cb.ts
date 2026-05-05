import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CITY = 'ceske-budejovice';

const profiles = [
  // ── OSOBNÍ TRENÉR ─────────────────────────────────────────────────────────
  { fullName: 'Jiří Študent — osobní trenér', email: 'jirkas82@gmail.com', phone: '+420 732 819 543', serviceId: 'trener', cityId: CITY, address: 'Křižíkova 734/1, České Budějovice', description: 'Osobní trenér — silový trénink, kondice, hubnutí, individuální tréninkové plány.', picturePath: null, active: true },
  { fullName: 'David Vaš — běžecký a kondiční trenér', email: 'trener@davidvas.cz', phone: '+420 732 654 180', serviceId: 'trener', cityId: CITY, address: 'Sokolský ostrov 462/1, 370 01 České Budějovice', description: 'Běžecký a kondiční trenér — příprava na závody, kondice, individuální trénink.', picturePath: null, active: true },
  { fullName: 'Fitness Pouzar — personal training', email: 'fitness.pouzar@tiscali.cz', phone: '+420 774 953 434', serviceId: 'trener', cityId: CITY, address: 'Dlouhá 35, 370 11 České Budějovice', description: 'Fitness centrum s osobními trenéry — individuální i skupinové tréninky, výživa.', picturePath: null, active: true },
  { fullName: 'Petr Okrohlý — osobní trenér', email: 'p.okrouhly@email.cz', phone: '+420 724 521 331', serviceId: 'trener', cityId: CITY, address: 'České Budějovice', description: 'Osobní trenér — silový trénink, redukce váhy, funkční trénink, sportovní příprava.', picturePath: null, active: true },

  // ── PŘEKLADATEL ───────────────────────────────────────────────────────────
  { fullName: 'SOPHIA jazykové služby s.r.o.', email: 'sophia@sophia-cb.cz', phone: '+420 774 672 992', serviceId: 'prekladatel', cityId: CITY, address: 'Hroznová 253/28, 370 01 České Budějovice', description: 'Překlady, tlumočení a DTP — anglický, německý, francouzský jazyk a další. České Budějovice.', picturePath: null, active: true },
  { fullName: 'Skřivánek s.r.o. — pobočka České Budějovice', email: 'c.budejovice@skrivanek.cz', phone: '+420 603 171 139', serviceId: 'prekladatel', cityId: CITY, address: 'Radniční 133/1, 370 01 České Budějovice', description: 'Překladatelská agentura Skřivánek — překlady všech jazyků, úřední překlady, tlumočení.', picturePath: null, active: true },
  { fullName: 'Mgr. Dana Šetinová — překlady a tlumočení', email: null, phone: '+420 381 601 461', serviceId: 'prekladatel', cityId: CITY, address: 'Tř. 28. října 1309/22, 370 01 České Budějovice', description: 'Soudní překladatel a tlumočník — němčina, angličtina. Úřední překlady s kulatým razítkem.', picturePath: null, active: true },
  { fullName: 'Překlady-Návody.cz P-N s.r.o.', email: 'info@preklady-navody.cz', phone: '+420 723 445 552', serviceId: 'prekladatel', cityId: CITY, address: 'Čéčova 625/26, 370 04 České Budějovice', description: 'Překlady návodů, technických textů a dokumentace. Rychlé dodání, přijatelné ceny.', picturePath: null, active: true },

  // ── GRAFICKÝ DESIGNER ─────────────────────────────────────────────────────
  { fullName: 'Martin Šimánek — Grafické studio SIMIS', email: 'martin@simis.cz', phone: '+420 776 196 758', serviceId: 'grafik', cityId: CITY, address: 'K. Weise 2517/16, České Budějovice', description: 'Grafické studio — logo, vizuální identita, webdesign, tiskové materiály, branding.', picturePath: null, active: true },
  { fullName: 'Ondřej Selner — grafický designer', email: 'ondrej.selner@gmail.com', phone: '+420 728 682 556', serviceId: 'grafik', cityId: CITY, address: 'J. Š. Baara 1604/1, 370 01 České Budějovice', description: 'Grafický designer — branding, logo design, vizuální identita firem, tiskoviny.', picturePath: null, active: true },
  { fullName: 'DOT. Grafické studio & Tiskárna', email: 'studio@dot.cz', phone: '+420 777 812 297', serviceId: 'grafik', cityId: CITY, address: 'Za Otýlií 2872/18, 370 01 České Budějovice', description: 'Grafické studio a tiskárna — grafika, tisk, reklamní materiály, polepy vozidel.', picturePath: null, active: true },
  { fullName: 'Diana Talafousová — KELT REKLAMA grafické studio', email: 'talafousova@kelt-reklama.cz', phone: '+420 775 939 949', serviceId: 'grafik', cityId: CITY, address: 'U Sirkárny 658, 370 04 České Budějovice', description: 'Grafické studio — reklamní grafika, logo, letáky, bannery, webová grafika.', picturePath: null, active: true },

  // ── UČITEL / LEKTOR ───────────────────────────────────────────────────────
  { fullName: 'Jazyková škola EDUCO', email: 'educo@educo-cb.cz', phone: '+420 777 694 577', serviceId: 'ucitel', cityId: CITY, address: 'Štítného 80/12, 370 01 České Budějovice', description: 'Jazyková škola — angličtina, němčina, španělština. Individuální i skupinové kurzy pro dospělé i děti.', picturePath: null, active: true },
  { fullName: 'Jazyková škola Gaudeo CB', email: 'recepce@gaudeo.cz', phone: '+420 387 410 011', serviceId: 'ucitel', cityId: CITY, address: 'Pražská tř. 527/125, 370 04 České Budějovice', description: 'Jazykové kurzy — angličtina, němčina, ruština, příprava na zkoušky, firemní výuka.', picturePath: null, active: true },
  { fullName: 'Jazyková škola Radost', email: 'studijni@elec.eu', phone: '+420 387 200 611', serviceId: 'ucitel', cityId: CITY, address: 'Mlýnská 172/2, 370 01 České Budějovice', description: 'Výuka jazyků — angličtina, němčina, příprava na Cambridge a jiné certifikáty.', picturePath: null, active: true },
  { fullName: 'CC Škola jazyků — České Budějovice', email: 'ceskebudejovice@lingua-centrum.cz', phone: '+420 777 911 113', serviceId: 'ucitel', cityId: CITY, address: 'Hroznová 62/7, 370 01 České Budějovice', description: 'Jazyková škola — kurzy angličtiny, němčiny, španělštiny. Přípravné kurzy na zkoušky.', picturePath: null, active: true },
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
