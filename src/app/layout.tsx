import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthSessionProvider } from '@/components/AuthSessionProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.adressa.cz'),
  title: 'adressa.cz — Místní poskytovatelé služeb',
  description:
    'Najděte místní řemeslníky a profesionály v České republice. Elektrikáři, instalatéři, malíři, zubaři a mnoho dalších.',
  keywords: 'řemeslníci, elektrikář, instalatér, malíř, zubař, Praha, Brno, Ostrava, Česká republika',
  openGraph: {
    title: 'adressa.cz — Místní poskytovatelé služeb',
    description: 'Najděte místní řemeslníky a profesionály v České republice.',
    url: 'https://www.adressa.cz',
    siteName: 'adressa.cz',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'adressa.cz — Místní poskytovatelé služeb',
    description: 'Najděte místní řemeslníky a profesionály v České republice.',
  },
  other: {
    'seznam-wmt': 'v6toM7Oc6C5oRA9UhMKfdDn36efY6dom',
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'adressa.cz',
  url: 'https://www.adressa.cz',
  description:
    'Katalog místních řemeslníků a profesionálních služeb v České republice — elektrikáři, instalatéři, malíři, zubaři a další, včetně hodnocení od zákazníků.',
  areaServed: { '@type': 'Country', name: 'Česká republika' },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'adressa.cz',
  url: 'https://www.adressa.cz',
  inLanguage: 'cs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={inter.variable}>
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5770800340894128"
          crossOrigin="anonymous"
        />
        {/* Adsterra Popunder */}
        <script src="https://pl31543561.profitableratecpmnetwork.com/a4/25/a0/a425a04b4b512a4bb908e561d8c32aaf.js" />
        {/* Adsterra Social Bar */}
        <script src="https://pl31543563.profitableratecpmnetwork.com/c1/08/ce/c108ce0d2dd18c0f37c3b004e5a8932e.js" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BNF8NTBG6T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BNF8NTBG6T');
          `}
        </Script>
        <AuthSessionProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthSessionProvider>
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
