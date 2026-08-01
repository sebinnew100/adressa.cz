import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Kontakt | adressa.cz',
  description: 'Kontaktujte adressa.cz — e-mail, telefon a adresa provozovatele.',
  alternates: {
    canonical: 'https://www.adressa.cz/kontakt',
  },
  openGraph: {
    title: 'Kontakt | adressa.cz',
    description: 'Kontaktujte adressa.cz — e-mail, telefon a adresa provozovatele.',
    url: 'https://www.adressa.cz/kontakt',
  },
};

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Kontakt — adressa.cz',
  url: 'https://www.adressa.cz/kontakt',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-10 max-w-md w-full">
          <h1 className="text-2xl font-bold text-ink mb-2">Kontakt</h1>
          <p className="text-ink-light text-sm mb-8">
            Máte dotaz, nápad na vylepšení nebo chcete nahlásit problém s profilem? Ozvěte se nám —
            odpovídáme obvykle do 2 pracovních dnů.
          </p>

          <div className="space-y-5 text-sm">
            <div>
              <p className="text-ink-lighter text-xs uppercase tracking-wider mb-1">Zákaznická podpora</p>
              <a href="mailto:customerserviceentfin@gmail.com" className="text-brand hover:underline font-medium">
                customerserviceentfin@gmail.com
              </a>
            </div>
            <div>
              <p className="text-ink-lighter text-xs uppercase tracking-wider mb-1">Telefon</p>
              <a href="tel:+420728415630" className="text-brand hover:underline font-medium">
                +420 728 415 630
              </a>
            </div>
            <div>
              <p className="text-ink-lighter text-xs uppercase tracking-wider mb-1">Adresa</p>
              <p className="text-ink">V. Volfa 1335/33, České Budějovice</p>
            </div>
            <div>
              <p className="text-ink-lighter text-xs uppercase tracking-wider mb-1">Provozovatel</p>
              <p className="text-ink">Sebin Varghese</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
