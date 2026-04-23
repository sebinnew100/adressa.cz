'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Suspense } from 'react';

function CancelContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const providerId = searchParams.get('providerId');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-12 text-center max-w-md w-full">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-ink mb-2">
        {language === 'cs' ? 'Platba zrušena' : 'Payment cancelled'}
      </h1>
      <p className="text-ink-light text-sm mb-8">
        {language === 'cs'
          ? 'Platba nebyla dokončena. Váš profil nebyl aktivován. Zkuste to znovu.'
          : 'Payment was not completed. Your profile was not activated. Please try again.'}
      </p>
      <div className="flex flex-col gap-3">
        {providerId && (
          <button
            onClick={async () => {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ providerId }),
              });
              const { url } = await res.json();
              window.location.href = url;
            }}
            className="bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            {language === 'cs' ? 'Zkusit znovu' : 'Try again'}
          </button>
        )}
        <Link href="/register" className="text-sm text-ink-light hover:text-brand transition-colors">
          {language === 'cs' ? 'Nová registrace' : 'New registration'}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Suspense>
          <CancelContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
