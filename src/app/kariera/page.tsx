import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Kariéra | adressa.cz',
  description: 'Hledáme marketingového partnera, který pomůže s růstem adressa.cz — adresáře místních řemeslníků a poskytovatelů služeb v České republice.',
  alternates: {
    canonical: 'https://www.adressa.cz/kariera',
  },
  openGraph: {
    title: 'Kariéra | adressa.cz',
    description: 'Hledáme marketingového partnera pro adressa.cz.',
    url: 'https://www.adressa.cz/kariera',
  },
};

const jobPostingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: 'Marketingový partner',
  description:
    'adressa.cz hledá marketingového partnera, který pomůže s růstem adresáře místních řemeslníků a poskytovatelů služeb v České republice.',
  datePosted: '2026-10-07',
  employmentType: 'OTHER',
  hiringOrganization: {
    '@type': 'Organization',
    name: 'adressa.cz',
    sameAs: 'https://www.adressa.cz',
  },
  jobLocationType: 'TELECOMMUTE',
  applicantLocationRequirements: {
    '@type': 'Country',
    name: 'Česká republika',
  },
};

export default function CareerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-sm sm:prose-base">
          <h1>Kariéra</h1>

          <p>
            adressa.cz je rostoucí online adresář místních řemeslníků a poskytovatelů služeb v České
            republice. Aktuálně hledáme jednoho člověka na pozici níže.
          </p>

          <h2>Marketingový partner</h2>
          <p>
            Hledáme spolehlivého partnera, který nám pomůže zvýšit povědomí o adressa.cz mezi zákazníky
            i poskytovateli služeb a podpoří dlouhodobý růst platformy.
          </p>

          <h3>Co bude náplní práce</h3>
          <ul>
            <li>Plánování a realizace marketingových aktivit (online i offline)</li>
            <li>Spolupráce na růstu počtu uživatelů a poskytovatelů na platformě</li>
            <li>Komunikace se zákazníky a partnery</li>
            <li>Návrhy a testování nových způsobů, jak platformu zviditelnit</li>
          </ul>

          <h3>Koho hledáme</h3>
          <ul>
            <li>Zkušenosti s marketingem nebo růstem online projektů výhodou</li>
            <li>Samostatnost a chuť pracovat na dlouhodobém projektu</li>
            <li>Komunikativnost a dobré organizační schopnosti</li>
            <li>Znalost českého trhu</li>
          </ul>

          <h3>Jak se přihlásit</h3>
          <p>
            Pošlete nám pár řádků o sobě a svých zkušenostech na{' '}
            <a href="mailto:customerserviceentfin@gmail.com">customerserviceentfin@gmail.com</a>{' '}
            s předmětem &bdquo;Marketingový partner&ldquo;. Podrobnosti o spolupráci a podmínkách
            probereme individuálně.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
