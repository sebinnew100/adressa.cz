import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
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
    monetag: '8ebc365aff2bd853853de756c188a822',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={inter.variable}>
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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
