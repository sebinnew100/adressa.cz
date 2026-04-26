'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface FaqItem {
  q: string;
  a: string;
}

const faqsCs: FaqItem[] = [
  {
    q: 'Co je adressa.cz?',
    a: 'adressa.cz je online adresář místních profesionálů a řemeslníků v České republice. Najdete zde elektrikáře, instalatéry, zubaře, malíře, tesaře, zahradníky, právníky, účetní, fotografy, kadeřníky a desítky dalších odborníků přímo ve vašem městě — s kontakty, hodnoceními a možností poslat poptávku.',
  },
  {
    q: 'Jak najdu řemeslníka nebo profesionála ve svém městě?',
    a: 'Na hlavní stránce adresáře vyberte město (Praha, Brno, České Budějovice, Ostrava…) a kategorii služby (elektrikář, instalatér, zubař…). Zobrazí se vám aktuální seznam ověřených profesionálů s popisy a hodnoceními. Kontakt odemknete zdarma krátkým zhlédnutím reklamy.',
  },
  {
    q: 'Jak najdu elektrikáře v Českých Budějovicích?',
    a: 'Přejděte přímo na stránku adressa.cz/elektrikar/ceske-budejovice nebo na hlavní stránce adresáře nastavte filtr na město „České Budějovice" a kategorii „Elektrikář". Zobrazí se seznam místních elektrikářů s telefony, e-maily a adresami.',
  },
  {
    q: 'Jak najdu instalatéra v Praze?',
    a: 'Navštivte adressa.cz/instalater/praha nebo na hlavní stránce zvolte město Praha a kategorii Instalatér. Zobrazí se přehled prověřených instalatérů v Praze s kontakty a hodnoceními zákazníků.',
  },
  {
    q: 'Je používání adressa.cz pro zákazníky zdarma?',
    a: 'Ano, adressa.cz je pro zákazníky hledající profesionály zcela zdarma. Kontaktní údaje (telefon, e-mail) odemknete krátkým zhlédnutím reklamy — žádná registrace ani platba není potřeba.',
  },
  {
    q: 'Jak kontaktuji profesionála přes adressa.cz?',
    a: 'Na profilu profesionála klikněte na „Zobrazit kontakt", zhlédněte krátkou reklamu (cca 8 sekund) a okamžitě se vám odemkne telefon a e-mail. Alternativně můžete odeslat poptávku přímo přes formulář na profilu — zpráva jde profesionálovi e-mailem.',
  },
  {
    q: 'Jak odešlu poptávku profesionálovi?',
    a: 'Na každém profilu je sekce „Poptávka schůzky". Vyplňte své jméno, e-mail, telefon, případně adresu a popis práce, a klikněte na „Odeslat poptávku". Zpráva je okamžitě doručena profesionálovi e-mailem a také uložena pro správce adresáře.',
  },
  {
    q: 'Jak zaregistruji svůj profil jako řemeslník nebo poskytovatel služeb?',
    a: 'Klikněte na tlačítko „Přidat profil" na hlavní stránce. Vyplňte jméno, kategorii, město, telefon, e-mail a popis vaší služby. Profil je aktivní ihned po odeslání — žádné čekání na schválení.',
  },
  {
    q: 'Je registrace profilu na adressa.cz zdarma?',
    a: 'Základní registrace profilu je zdarma. Pro zvýraznění profilu (zobrazení na prvních místech, zlatý rámeček, prioritní zobrazení) nabízíme placené zvýraznění. Kontaktujte nás na customerserviceentfin@gmail.com nebo +420 728 415 630.',
  },
  {
    q: 'V jakých městech adressa.cz funguje?',
    a: 'adressa.cz pokrývá všechna hlavní česká města — Praha, Brno, Ostrava, Plzeň, České Budějovice, Hradec Králové, Liberec, Olomouc, Zlín, Pardubice a další. Průběžně přidáváme nová města a regiony.',
  },
  {
    q: 'Jaké profese a služby najdu na adressa.cz?',
    a: 'Na adressa.cz najdete elektrikáře, instalatéry, malíře, tesaře, truhláře, zedníky, zahradníky, zubaře, praktické lékaře, právníky, účetní, fotografy, kadeřníky, architekty, psychology, osobní trenéry, IT techniky, realitní makléře, stěhovací firmy, restaurace, překladatele, grafické designéry, lektory jazyků a desítky dalších oborů.',
  },
  {
    q: 'Jak přidám hodnocení řemeslníka nebo profesionála?',
    a: 'Na profilu každého profesionála je sekce „Hodnocení". Vyplňte své jméno, vyberte počet hvězdiček (1 až 5) a napište komentář. Hodnocení je zveřejněno okamžitě a pomáhá ostatním zákazníkům i Google vyhledávači lépe najít kvalitní profesionály.',
  },
  {
    q: 'Jsou profily na adressa.cz ověřené?',
    a: 'Profily jsou vytvářeny samotnými poskytovateli nebo přidávány administrátory na základě veřejně dostupných informací z firemních webů a českých adresářů. Hodnocení zákazníků slouží jako dodatečné ověření kvality. Nahlásit nesprávný profil lze na customerserviceentfin@gmail.com.',
  },
  {
    q: 'Co mám dělat, když se mi nedaří dovolat řemeslníkovi?',
    a: 'Zkuste zaslat e-mail nebo poptávkový formulář přímo z profilu. Pokud profesionál neodpovídá, nabízí adressa.cz v dané kategorii a městě další dostupné odborníky — vyberte jiného z přehledu.',
  },
  {
    q: 'Jak funguje zvýraznění profilu?',
    a: 'Zvýrazněný profil se zobrazuje na prvních místech výsledků vyhledávání v dané kategorii a městě, má zlatý rámeček a označení „Zvýrazněný profil". Díky tomu ho zákazníci uvidí jako první. Pro informace o zvýraznění kontaktujte customerserviceentfin@gmail.com nebo +420 728 415 630.',
  },
  {
    q: 'Jak nahlásím nesprávné nebo zastaralé informace?',
    a: 'Napište nám na customerserviceentfin@gmail.com s odkazem na profil a popisem chyby (nesprávný telefon, e-mail, adresa apod.). Profil opravíme nebo odstraníme do 48 hodin.',
  },
];

const faqsEn: FaqItem[] = [
  {
    q: 'What is adressa.cz?',
    a: 'adressa.cz is an online directory of local professionals and tradespeople in the Czech Republic. Find electricians, plumbers, dentists, painters, carpenters, gardeners, lawyers, accountants, photographers, hairdressers and dozens of other experts in your city — with contact details, reviews and the ability to send an enquiry.',
  },
  {
    q: 'How do I find a tradesperson in my city?',
    a: 'On the main directory page, select your city (Prague, Brno, České Budějovice, Ostrava…) and service category (electrician, plumber, dentist…). A current list of verified professionals with descriptions and reviews will appear. Unlock contact details for free by watching a short ad.',
  },
  {
    q: 'How do I find an electrician in České Budějovice?',
    a: 'Go directly to adressa.cz/elektrikar/ceske-budejovice or use the filter on the main directory page — set the city to "České Budějovice" and the category to "Electrician". A list of local electricians with phone numbers, emails and addresses will appear.',
  },
  {
    q: 'How do I find a plumber in Prague?',
    a: 'Visit adressa.cz/instalater/praha or on the main page select Prague and the Plumber category. You\'ll see a list of verified plumbers in Prague with contact details and customer reviews.',
  },
  {
    q: 'Is adressa.cz free to use for customers?',
    a: 'Yes, adressa.cz is completely free for customers looking for professionals. Unlock contact details (phone and email) by watching a short ad — no registration or payment required.',
  },
  {
    q: 'How do I contact a professional through adressa.cz?',
    a: 'On the professional\'s profile, click "Show contact", watch a short ad (approx. 8 seconds) and the phone number and email will immediately unlock. Alternatively, send an enquiry directly through the form on the profile — the message is sent to the professional by email.',
  },
  {
    q: 'How do I send an enquiry to a professional?',
    a: 'Every profile has a "Request Appointment" section. Fill in your name, email, phone, optional address and description of the work needed, then click "Send Request". The message is immediately delivered to the professional by email.',
  },
  {
    q: 'How do I register my profile as a tradesperson or service provider?',
    a: 'Click the "Add profile" button on the main page. Fill in your name, category, city, phone, email and description of your service. Your profile is active immediately after submission — no waiting for approval.',
  },
  {
    q: 'Is registering a profile on adressa.cz free?',
    a: 'Basic profile registration is free. For a highlighted profile (shown first in results, gold border, priority visibility) we offer paid promotion. Contact us at customerserviceentfin@gmail.com or +420 728 415 630.',
  },
  {
    q: 'Which cities does adressa.cz cover?',
    a: 'adressa.cz covers all major Czech cities — Prague, Brno, Ostrava, Plzeň, České Budějovice, Hradec Králové, Liberec, Olomouc, Zlín, Pardubice and more. We continuously add new cities and regions.',
  },
  {
    q: 'What professions and services can I find on adressa.cz?',
    a: 'On adressa.cz you can find electricians, plumbers, painters, carpenters, joiners, masons, gardeners, dentists, general practitioners, lawyers, accountants, photographers, hairdressers, architects, psychologists, personal trainers, IT technicians, real estate agents, moving companies, restaurants, translators, graphic designers, language tutors and dozens of other fields.',
  },
  {
    q: 'How do I add a review for a professional?',
    a: 'On each professional\'s profile there is a "Reviews" section. Fill in your name, choose a star rating (1 to 5) and write a comment. The review is published immediately and helps other customers and Google to better find quality professionals.',
  },
  {
    q: 'Are profiles on adressa.cz verified?',
    a: 'Profiles are created by the service providers themselves or added by administrators based on publicly available information from company websites and Czech directories. Customer reviews serve as additional quality verification. Report an incorrect profile at customerserviceentfin@gmail.com.',
  },
  {
    q: 'What should I do if I cannot reach a tradesperson?',
    a: 'Try sending an email or using the enquiry form on the profile. If the professional does not respond, adressa.cz offers other available experts in the same category and city — choose another from the listing.',
  },
  {
    q: 'How does a highlighted profile work?',
    a: 'A highlighted profile appears at the top of search results in the given category and city, has a gold border and a "Featured" badge. Customers see it first. For information on highlighted listings, contact customerserviceentfin@gmail.com or +420 728 415 630.',
  },
  {
    q: 'How do I report incorrect or outdated information?',
    a: 'Email us at customerserviceentfin@gmail.com with a link to the profile and a description of the error (wrong phone, email, address, etc.). We will correct or remove the profile within 48 hours.',
  },
];

function FaqItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-ink text-sm sm:text-base pr-4">{item.q}</span>
        <svg
          className={`w-5 h-5 text-brand flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 bg-gray-50 text-sm text-ink-light leading-relaxed border-t border-gray-100">
          {item.a}
        </div>
      )}
    </div>
  );
}

export function FaqContent() {
  const { language } = useLanguage();
  const faqs = language === 'cs' ? faqsCs : faqsEn;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-light rounded-2xl mb-4">
            <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-ink mb-3">
            {language === 'cs' ? 'Časté dotazy' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-ink-light max-w-xl mx-auto">
            {language === 'cs'
              ? 'Vše, co potřebujete vědět o adressa.cz — jak hledat profesionály, jak se zaregistrovat a jak funguje poptávka.'
              : 'Everything you need to know about adressa.cz — how to find professionals, how to register and how enquiries work.'}
          </p>
        </div>

        {/* FAQ accordion */}
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <FaqItem key={i} item={item} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <p className="font-semibold text-ink mb-1">
            {language === 'cs' ? 'Nenašli jste odpověď?' : "Didn't find your answer?"}
          </p>
          <p className="text-sm text-ink-light mb-5">
            {language === 'cs'
              ? 'Napište nám přímo — odpovíme do 24 hodin.'
              : 'Write to us directly — we reply within 24 hours.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:customerserviceentfin@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              ✉️ customerserviceentfin@gmail.com
            </a>
            <Link
              href="/providers"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-brand text-ink hover:text-brand font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              {language === 'cs' ? '🔍 Hledat profesionály' : '🔍 Browse professionals'}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
