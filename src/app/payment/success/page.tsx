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
            {language === 'cs' ? 'Zkušební období začalo!' : 'Your trial has started!'}
          </h1>
          <p className="text-ink-light text-sm mb-2">
            {language === 'cs'
              ? 'Váš profil je nyní aktivní. Aktivační poplatek 10 Kč byl právě stržen a příštích 7 dní je součástí zkušebního období.'
              : 'Your profile is now active. A 10 CZK activation fee was just charged, and the next 7 days are your trial period.'}
          </p>
          <p className="text-ink-lighter text-xs mb-8">
            {language === 'cs'
              ? 'Poté se z vaší karty automaticky strhne 299 Kč měsíčně, dokud předplatné nezrušíte. Potvrzení obdržíte na e-mail.'
              : 'After that, 299 CZK/month will be automatically charged to your card until you cancel. A confirmation has been sent to your email.'}
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              {language === 'cs' ? '⭐ Zvyšte viditelnost svého profilu' : '⭐ Increase your profile visibility'}
            </p>
            <p className="text-xs text-amber-700 mb-3">
              {language === 'cs'
                ? 'Chcete být vidět jako první? Kontaktujte nás pro zvýraznění vašeho profilu.'
                : 'Want to be seen first? Contact us to highlight your profile.'}
            </p>
            <div className="flex flex-col gap-1.5">
              <a href="mailto:customerserviceentfin@gmail.com" className="text-xs text-amber-900 font-medium hover:underline">
                ✉️ customerserviceentfin@gmail.com
              </a>
              <a href="tel:+420728415630" className="text-xs text-amber-900 font-medium hover:underline">
                📞 +420 728 415 630
              </a>
            </div>
          </div>

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
