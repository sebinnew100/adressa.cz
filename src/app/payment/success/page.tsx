'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PaymentSuccessPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink mb-2">
            {language === 'cs' ? 'Platba proběhla úspěšně!' : 'Payment successful!'}
          </h1>
          <p className="text-ink-light text-sm mb-2">
            {language === 'cs'
              ? 'Váš profil byl aktivován a bude viditelný po dobu 30 dní.'
              : 'Your profile has been activated and will be visible for 30 days.'}
          </p>
          <p className="text-ink-lighter text-xs mb-8">
            {language === 'cs'
              ? 'Potvrzení platby obdržíte na e-mail.'
              : 'A payment confirmation has been sent to your email.'}
          </p>
          <Link
            href="/providers"
            className="inline-block bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            {language === 'cs' ? 'Zobrazit všechny profily' : 'Browse all profiles'}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
