'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProviderInfo {
  id: string;
  fullName: string;
  active: boolean;
}

export default function ActivateProviderPage() {
  const { language } = useLanguage();
  const params = useParams();
  const providerId = params.providerId as string;

  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/providers/${providerId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setProvider(data))
      .catch(() => setError('not_found'))
      .finally(() => setLoading(false));
  }, [providerId]);

  const startCheckout = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError('checkout_failed');
        setStarting(false);
      }
    } catch {
      setError('checkout_failed');
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-card p-12 text-center max-w-md w-full">
          {loading ? (
            <p className="text-ink-light text-sm">
              {language === 'cs' ? 'Načítám…' : 'Loading…'}
            </p>
          ) : error === 'not_found' || !provider ? (
            <>
              <h1 className="text-xl font-bold text-ink mb-2">
                {language === 'cs' ? 'Profil nenalezen' : 'Profile not found'}
              </h1>
              <Link href="/register" className="text-sm text-brand hover:underline">
                {language === 'cs' ? 'Vytvořit nový profil' : 'Create a new profile'}
              </Link>
            </>
          ) : provider.active ? (
            <>
              <h1 className="text-xl font-bold text-ink mb-2">
                {language === 'cs' ? 'Profil je již aktivní' : 'Profile is already active'}
              </h1>
              <p className="text-ink-light text-sm mb-6">
                {language === 'cs'
                  ? `${provider.fullName} je již viditelný pro zákazníky.`
                  : `${provider.fullName} is already visible to customers.`}
              </p>
              <Link
                href="/providers"
                className="inline-block bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-lg transition-colors"
              >
                {language === 'cs' ? 'Zobrazit profily' : 'Browse profiles'}
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-ink mb-2">
                {language === 'cs' ? 'Dokončete aktivaci profilu' : 'Complete your profile activation'}
              </h1>
              <p className="text-ink-light text-sm mb-6">
                {language === 'cs'
                  ? `${provider.fullName}, aktivujte svůj profil a začněte získávat nové zákazníky přes adressa.cz.`
                  : `${provider.fullName}, activate your profile and start getting new customers through adressa.cz.`}
              </p>
              <ul className="text-left text-sm text-ink-light mb-8 space-y-1.5 bg-gray-50 rounded-xl p-4">
                <li>
                  {language === 'cs' ? '• 15 Kč aktivační poplatek (jednorázově)' : '• 15 CZK one-time activation fee'}
                </li>
                <li>{language === 'cs' ? '• 7 dní zdarma na vyzkoušení' : '• 7 days free trial'}</li>
                <li>
                  {language === 'cs'
                    ? '• poté 299 Kč každých 28 dní, kdykoliv zrušitelné'
                    : '• then 299 CZK every 28 days, cancel anytime'}
                </li>
              </ul>
              {error === 'checkout_failed' && (
                <p className="text-red-500 text-xs mb-4">
                  {language === 'cs' ? 'Něco se nepovedlo, zkuste to prosím znovu.' : 'Something went wrong, please try again.'}
                </p>
              )}
              <button
                onClick={startCheckout}
                disabled={starting}
                className="bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {starting
                  ? (language === 'cs' ? 'Přesměrovávám…' : 'Redirecting…')
                  : (language === 'cs' ? 'Aktivovat profil' : 'Activate profile')}
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
