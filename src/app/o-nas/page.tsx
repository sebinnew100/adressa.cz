import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'O nás | adressa.cz',
  description: 'adressa.cz je online adresář místních řemeslníků a poskytovatelů služeb v České republice. Zjistěte, co děláme a proč.',
  alternates: {
    canonical: 'https://www.adressa.cz/o-nas',
  },
  openGraph: {
    title: 'O nás | adressa.cz',
    description: 'adressa.cz je online adresář místních řemeslníků a poskytovatelů služeb v České republice.',
    url: 'https://www.adressa.cz/o-nas',
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'O nás — adressa.cz',
  url: 'https://www.adressa.cz/o-nas',
  isPartOf: { '@type': 'WebSite', name: 'adressa.cz', url: 'https://www.adressa.cz' },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-sm sm:prose-base">
          <h1>O nás</h1>

          <p>
            adressa.cz je online adresář místních řemeslníků a poskytovatelů služeb v České republice.
            Pomáháme lidem najít elektrikáře, instalatéra, zubaře, malíře, zahradníka nebo desítky
            dalších odborníků přímo ve svém městě — rychle, přehledně a bez zbytečného hledání po
            nesourodých inzertních portálech.
          </p>

          <h2>Co děláme</h2>
          <p>
            Na jednom místě spojujeme dvě strany: zákazníky, kteří hledají spolehlivého odborníka, a
            poskytovatele služeb, kteří chtějí být vidět. Zákazníci si mohou prohlédnout profily
            poskytovatelů podle města a kategorie služby, přečíst si recenze od předchozích klientů a
            odeslat poptávku nebo žádost o termín přímo z webu. Poskytovatelé si mohou zdarma vytvořit
            profil a rozšířit tak svou viditelnost mezi lidmi, kteří jejich služby aktivně hledají.
          </p>

          <h2>Kromě adresáře nabízíme</h2>
          <ul>
            <li>
              <strong>Přehled veřejných zakázek</strong> — denně aktualizovaný přehled aktuálních
              veřejných zakázek, přehledně na jednom místě.
            </li>
            <li>
              <strong>Herní mód</strong> — hravý způsob, jak objevovat místní podniky ve vašem městě a
              získávat za návštěvy odměny.
            </li>
            <li>
              <strong>Magazín</strong> — články a tipy týkající se bydlení, oprav a služeb pro domácnost
              i firmy v jednotlivých městech České republiky.
            </li>
          </ul>

          <h2>Kde nás najdete</h2>
          <p>
            adressa.cz provozujeme z Českých Budějovic a aktuálně pokrýváme desítky měst po celé České
            republice, s postupně rostoucí nabídkou kategorií služeb.
          </p>

          <p>
            Máte dotaz, nápad na vylepšení nebo chcete nahlásit problém? Napište nám na{' '}
            <Link href="/kontakt">kontaktní stránce</Link>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
