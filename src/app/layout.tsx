import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'adresar.cz — Místní poskytovatelé služeb',
  description:
    'Najděte místní řemeslníky a profesionály v České republice. Elektrikáři, instalatéři, malíři, zubaři a mnoho dalších.',
  keywords: 'řemeslníci, elektrikář, instalatér, malíř, zubař, Praha, Brno, Ostrava, Česká republika',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs" className={inter.variable}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
