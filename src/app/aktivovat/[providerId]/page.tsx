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
  stripeSubscriptionId: string | null;
  paymentMethod: string;
  removalDeadline: string | null;
}

interface QrPaymentData {
  qrDataUrl: string | null;
  ibanFormatted: string;
  variableSymbol: number;
  amountCzk: number;
  dueDate: string | null;
}

function QrPaymentPanel({ providerId, active }: { providerId: string; active: boolean }) {
  const { language } = useLanguage();
  const [qrData, setQrData] = useState<QrPaymentData | null>(null);
  const [loadingQr, setLoadingQr] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  useEffect(() => {
    fetch(`/api/qr-payment/${providerId}`)
      .then(res => res.ok ? res.json() : null)
      .then(setQrData)
      .finally(() => setLoadingQr(false));
  }, [providerId]);

  const handleAlreadyPaid = async () => {
    setReporting(true);
    try {
      await fetch(`/api/qr-payment/${providerId}/self-report`, { method: 'POST' });
      setReported(true);
    } finally {
      setReporting(false);
    }
  };

  if (loadingQr) {
    return <p className="text-ink-light text-sm">{language === 'cs' ? 'Načítám QR platbu…' : 'Loading QR payment…'}</p>;
  }

  if (!qrData || !qrData.qrDataUrl) {
    return (
      <p className="text-red-500 text-sm">
        {language === 'cs' ? 'QR platbu se nepodařilo načíst. Zkuste to prosím znovu.' : 'Could not load the QR payment. Please try again.'}
      </p>
    );
  }

  const dueDateLabel = qrData.dueDate
    ? new Date(qrData.dueDate).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US')
    : null;

  return (
    <div className="text-left">
      <p className="text-sm text-ink-light mb-4">
        {active
          ? language === 'cs'
            ? `Váš profil je aktivní do ${dueDateLabel}. Zaplaťte QR kódem předem, aby vám profil vydržel i další období.`
            : `Your profile is active until ${dueDateLabel}. Pay via the QR code ahead of time to keep it active for the next period.`
          : language === 'cs'
            ? 'Zvolili jste platbu bankovním převodem. Naskenujte QR kód ve své bankovní aplikaci — jakmile platbu ověříme, profil aktivujeme.'
            : "You've chosen bank transfer payment. Scan the QR code in your banking app — once we verify the payment, we'll activate your profile."}
      </p>

      <div className="flex justify-center mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrData.qrDataUrl} alt="QR platba" className="w-48 h-48 rounded-lg border border-gray-200" />
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 mb-6">
        <p><span className="text-ink-light">{language === 'cs' ? 'Účet' : 'Account'}: </span><span className="font-mono">{qrData.ibanFormatted}</span></p>
        <p><span className="text-ink-light">{language === 'cs' ? 'Variabilní symbol' : 'Variable symbol'}: </span><span className="font-mono font-bold">{qrData.variableSymbol}</span></p>
        <p><span className="text-ink-light">{language === 'cs' ? 'Částka' : 'Amount'}: </span><span className="font-bold">{(qrData.amountCzk / 100).toFixed(0)} Kč</span></p>
      </div>

      {reported ? (
        <p className="text-green-600 text-sm font-semibold">
          {language === 'cs' ? '✓ Děkujeme, brzy platbu zkontrolujeme.' : '✓ Thanks, we will check the payment soon.'}
        </p>
      ) : (
        <button
          onClick={handleAlreadyPaid}
          disabled={reporting}
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {reporting
            ? (language === 'cs' ? 'Odesílám…' : 'Sending…')
            : (language === 'cs' ? 'Již jsem zaplatil/a' : "I've already paid")}
        </button>
      )}
    </div>
  );
}

export default function ActivateProviderPage() {
  const { language } = useLanguage();
  const params = useParams();
  const providerId = params.providerId as string;

  const [provider, setProvider] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [choosingQr, setChoosingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/providers/${providerId}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setProvider(data))
      .catch(() => setError('not_found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
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

  const chooseQr = async () => {
    setChoosingQr(true);
    setError(null);
    try {
      const res = await fetch('/api/qr-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId }),
      });
      if (!res.ok) throw new Error();
      setProvider(prev => prev ? { ...prev, paymentMethod: 'qr_bank_transfer' } : prev);
    } catch {
      setError('checkout_failed');
    } finally {
      setChoosingQr(false);
    }
  };

  const daysLeft = provider?.removalDeadline
    ? Math.ceil((new Date(provider.removalDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const hasActiveSubscription = !!provider && (!!provider.stripeSubscriptionId || (provider.paymentMethod === 'qr_bank_transfer' && provider.active));

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
          ) : provider.stripeSubscriptionId ? (
            <>
              <h1 className="text-xl font-bold text-ink mb-2">
                {language === 'cs' ? 'Předplatné je již aktivní' : 'Subscription is already active'}
              </h1>
              <p className="text-ink-light text-sm mb-6">
                {language === 'cs'
                  ? `Děkujeme, ${provider.fullName} má aktivní předplatné a je viditelný pro zákazníky.`
                  : `Thanks, ${provider.fullName} has an active subscription and is visible to customers.`}
              </p>
              <Link
                href="/providers"
                className="inline-block bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-lg transition-colors"
              >
                {language === 'cs' ? 'Zobrazit profily' : 'Browse profiles'}
              </Link>
            </>
          ) : provider.paymentMethod === 'qr_bank_transfer' ? (
            <>
              <h1 className="text-xl font-bold text-ink mb-2">
                {hasActiveSubscription
                  ? (language === 'cs' ? 'Platba QR kódem' : 'QR code payment')
                  : (language === 'cs' ? 'Dokončete platbu' : 'Complete your payment')}
              </h1>
              <QrPaymentPanel providerId={providerId} active={hasActiveSubscription} />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-ink mb-2">
                {provider.active
                  ? (language === 'cs' ? 'Potvrďte předplatné a ponechte si profil' : 'Confirm your subscription to keep your profile')
                  : (language === 'cs' ? 'Znovu zveřejněte svůj profil' : 'Publish your profile again')}
              </h1>
              <p className="text-ink-light text-sm mb-2">
                {provider.active
                  ? (language === 'cs'
                      ? `${provider.fullName}, váš profil je nyní viditelný zdarma na adressa.cz.`
                      : `${provider.fullName}, your profile is currently visible for free on adressa.cz.`)
                  : (language === 'cs'
                      ? `${provider.fullName}, váš profil byl z webu odstraněn, protože nebylo potvrzeno předplatné.`
                      : `${provider.fullName}, your profile was removed from the site because no subscription was confirmed.`)}
              </p>
              {provider.active && daysLeft !== null && (
                <p className={`text-sm font-semibold mb-6 ${daysLeft <= 2 ? 'text-red-500' : 'text-amber-600'}`}>
                  {language === 'cs'
                    ? daysLeft > 0
                      ? `Zbývá ${daysLeft} ${daysLeft === 1 ? 'den' : daysLeft < 5 ? 'dny' : 'dní'}, jinak bude profil odstraněn.`
                      : 'Termín vypršel — profil bude brzy odstraněn.'
                    : daysLeft > 0
                      ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left, or your profile will be removed.`
                      : 'Deadline passed — your profile will be removed soon.'}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 mb-4">
                <div className="border border-gray-200 rounded-xl p-4 text-left">
                  <p className="font-semibold text-ink text-sm mb-2">💳 {language === 'cs' ? 'Platba kartou' : 'Card payment'}</p>
                  <ul className="text-xs text-ink-light space-y-1 mb-4">
                    <li>{language === 'cs' ? '• 15 Kč aktivační poplatek (jednorázově)' : '• 15 CZK one-time activation fee'}</li>
                    <li>{language === 'cs' ? '• 7 dní zdarma na vyzkoušení' : '• 7 days free trial'}</li>
                    <li>{language === 'cs' ? '• poté 299 Kč každých 28 dní' : '• then 299 CZK every 28 days'}</li>
                  </ul>
                  <button
                    onClick={startCheckout}
                    disabled={starting || choosingQr}
                    className="w-full bg-brand hover:bg-brand-hover text-white font-bold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    {starting
                      ? (language === 'cs' ? 'Přesměrovávám…' : 'Redirecting…')
                      : (language === 'cs' ? 'Platit kartou' : 'Pay by card')}
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 text-left">
                  <p className="font-semibold text-ink text-sm mb-2">🏦 {language === 'cs' ? 'Platba QR kódem' : 'Bank QR payment'}</p>
                  <ul className="text-xs text-ink-light space-y-1 mb-4">
                    <li>{language === 'cs' ? '• bankovní převod, žádná karta' : '• bank transfer, no card needed'}</li>
                    <li>{language === 'cs' ? '• 299 Kč každých 28 dní' : '• 299 CZK every 28 days'}</li>
                    <li>{language === 'cs' ? '• profil se aktivuje po ověření platby' : '• profile activates once payment is verified'}</li>
                  </ul>
                  <button
                    onClick={chooseQr}
                    disabled={starting || choosingQr}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    {choosingQr
                      ? (language === 'cs' ? 'Načítám…' : 'Loading…')
                      : (language === 'cs' ? 'Platit QR kódem' : 'Pay by QR code')}
                  </button>
                </div>
              </div>

              {error === 'checkout_failed' && (
                <p className="text-red-500 text-xs mb-2">
                  {language === 'cs' ? 'Něco se nepovedlo, zkuste to prosím znovu.' : 'Something went wrong, please try again.'}
                </p>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
