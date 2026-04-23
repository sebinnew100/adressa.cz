'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyContent() {
  const params = useSearchParams();
  const success = params.get('success') === '1';
  const error = params.get('error');

  if (success) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">E-mail ověřen!</h1>
        <p className="text-ink-light mb-6">Váš profil je nyní aktivní a viditelný pro zákazníky.</p>
        <Link href="/providers" className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          Zobrazit profily
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-ink mb-2">
        {error === 'invalid' ? 'Neplatný odkaz' : 'Něco se pokazilo'}
      </h1>
      <p className="text-ink-light mb-6">Odkaz pro ověření je neplatný nebo již byl použit.</p>
      <Link href="/" className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors">
        Zpět na hlavní stránku
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-12 w-full max-w-md">
        <Suspense>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
