import type { Metadata } from 'next';
import { FaqContent } from '@/components/faq/FaqContent';

export const metadata: Metadata = {
  title: 'Časté dotazy — FAQ | adressa.cz',
  description: 'Odpovědi na nejčastější otázky o adressa.cz — jak najít elektrikáře, instalatéra nebo jiného profesionála v České republice. Registrace profilu zdarma.',
  alternates: {
    canonical: 'https://www.adressa.cz/faq',
  },
  openGraph: {
    title: 'Časté dotazy — FAQ | adressa.cz',
    description: 'Odpovědi na nejčastější otázky o adressa.cz — jak najít elektrikáře, instalatéra nebo jiného profesionála v České republice.',
    url: 'https://www.adressa.cz/faq',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Co je adressa.cz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'adressa.cz je online adresář místních profesionálů a řemeslníků v České republice. Najdete zde elektrikáře, instalatéry, zubaře, malíře, tesaře, zahradníky, právníky, účetní, fotografy, kadeřníky a desítky dalších odborníků přímo ve vašem městě — s kontakty, hodnoceními a možností poslat poptávku.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak najdu řemeslníka nebo profesionála ve svém městě?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Na hlavní stránce adresáře vyberte město (Praha, Brno, České Budějovice, Ostrava…) a kategorii služby (elektrikář, instalatér, zubař…). Zobrazí se vám aktuální seznam ověřených profesionálů s popisy a hodnoceními. Kontakt odemknete zdarma krátkým zhlédnutím reklamy.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak najdu elektrikáře v Českých Budějovicích?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Přejděte přímo na stránku adressa.cz/elektrikar/ceske-budejovice nebo na hlavní stránce adresáře nastavte filtr na město „České Budějovice" a kategorii „Elektrikář". Zobrazí se seznam místních elektrikářů s telefony, e-maily a adresami.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak najdu instalatéra v Praze?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Navštivte adressa.cz/instalater/praha nebo na hlavní stránce zvolte město Praha a kategorii Instalatér. Zobrazí se přehled prověřených instalatérů v Praze s kontakty a hodnoceními zákazníků.',
      },
    },
    {
      '@type': 'Question',
      name: 'Je používání adressa.cz pro zákazníky zdarma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ano, adressa.cz je pro zákazníky hledající profesionály zcela zdarma. Kontaktní údaje (telefon, e-mail) odemknete krátkým zhlédnutím reklamy — žádná registrace ani platba není potřeba.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak kontaktuji profesionála přes adressa.cz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Na profilu profesionála klikněte na „Zobrazit kontakt", zhlédněte krátkou reklamu (cca 8 sekund) a okamžitě se vám odemkne telefon a e-mail. Alternativně můžete odeslat poptávku přímo přes formulář na profilu — zpráva jde profesionálovi e-mailem.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak odešlu poptávku profesionálovi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Na každém profilu je sekce „Poptávka schůzky". Vyplňte své jméno, e-mail, telefon, případně adresu a popis práce, a klikněte na „Odeslat poptávku". Zpráva je okamžitě doručena profesionálovi e-mailem a také uložena pro správce adresáře.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak zaregistruji svůj profil jako řemeslník nebo poskytovatel služeb?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Klikněte na tlačítko „Přidat profil" na hlavní stránce. Vyplňte jméno, kategorii, město, telefon, e-mail a popis vaší služby. Profil je aktivní ihned po odeslání — žádné čekání na schválení.',
      },
    },
    {
      '@type': 'Question',
      name: 'Je registrace profilu na adressa.cz zdarma?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Základní registrace profilu je zdarma. Pro zvýraznění profilu (zobrazení na prvních místech, zlatý rámeček, prioritní zobrazení) nabízíme placené zvýraznění. Kontaktujte nás na customerserviceentfin@gmail.com nebo +420 728 415 630.',
      },
    },
    {
      '@type': 'Question',
      name: 'V jakých městech adressa.cz funguje?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'adressa.cz pokrývá všechna hlavní česká města — Praha, Brno, Ostrava, Plzeň, České Budějovice, Hradec Králové, Liberec, Olomouc, Zlín, Pardubice a další. Průběžně přidáváme nová města a regiony.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jaké profese a služby najdu na adressa.cz?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Na adressa.cz najdete elektrikáře, instalatéry, malíře, tesaře, truhláře, zedníky, zahradníky, zubaře, praktické lékaře, právníky, účetní, fotografy, kadeřníky, architekty, psychology, osobní trenéry, IT techniky, realitní makléře, stěhovací firmy, restaurace, překladatele, grafické designéry, lektory jazyků a desítky dalších oborů.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak přidám hodnocení řemeslníka nebo profesionála?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Na profilu každého profesionála je sekce „Hodnocení". Vyplňte své jméno, vyberte počet hvězdiček (1 až 5) a napište komentář. Hodnocení je zveřejněno okamžitě a pomáhá ostatním zákazníkům i Google vyhledávači lépe najít kvalitní profesionály.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jsou profily na adressa.cz ověřené?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Profily jsou vytvářeny samotnými poskytovateli nebo přidávány administrátory na základě veřejně dostupných informací z firemních webů a českých adresářů. Hodnocení zákazníků slouží jako dodatečné ověření kvality. Nahlásit nesprávný profil lze na customerserviceentfin@gmail.com.',
      },
    },
    {
      '@type': 'Question',
      name: 'Co mám dělat, když se mi nedaří dovolat řemeslníkovi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zkuste zaslat e-mail nebo poptávkový formulář přímo z profilu. Pokud profesionál neodpovídá, nabízí adressa.cz v dané kategorii a městě další dostupné odborníky — vyberte jiného z přehledu.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak funguje zvýraznění profilu?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zvýrazněný profil se zobrazuje na prvních místech výsledků vyhledávání v dané kategorii a městě, má zlatý rámeček a označení „Zvýrazněný profil". Díky tomu ho zákazníci uvidí jako první. Pro informace o zvýraznění kontaktujte customerserviceentfin@gmail.com nebo +420 728 415 630.',
      },
    },
    {
      '@type': 'Question',
      name: 'Jak nahlásím nesprávné nebo zastaralé informace?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Napište nám na customerserviceentfin@gmail.com s odkazem na profil a popisem chyby (nesprávný telefon, e-mail, adresa apod.). Profil opravíme nebo odstraníme do 48 hodin.',
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqContent />
    </>
  );
}
