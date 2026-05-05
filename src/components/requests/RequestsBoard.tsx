'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import type { ServiceRequest } from '@prisma/client';

const serviceMapCs = new Map(SERVICES.map(s => [s.id, s.nameCz]));
const serviceMapEn = new Map(SERVICES.map(s => [s.id, s.nameEn]));
const cityMapCs = new Map(CITIES.map(c => [c.id, c.nameCz]));
const cityMapEn = new Map(CITIES.map(c => [c.id, c.nameEn]));

const LS_KEY = 'adressa_access_code';

const ACCOUNT_NUMBER = '4467569004/5500';
const ACCOUNT_NAME = 'Sebin Varghese';
const VARIABLE_SYMBOL = '1005';
const PRICE_MONTHLY = '299 Kč';
const PRICE_YEARLY = '3 400 Kč';
const CONTACT_EMAIL = 'customerserviceentfin@gmail.com';

export function RequestsBoard({ requests: initial }: { requests: ServiceRequest[] }) {
  const { language } = useLanguage();
  const isCz = language === 'cs';

  const [requests, setRequests] = useState<ServiceRequest[]>(initial);
  const [unlocked, setUnlocked] = useState(false);
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const serviceMap = isCz ? serviceMapCs : serviceMapEn;
  const cityMap = isCz ? cityMapCs : cityMapEn;

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) tryUnlock(saved, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function tryUnlock(inputCode: string, silent = false) {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/requests/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode }),
      });
      const json = await res.json();
      if (json.ok) {
        setRequests(json.requests);
        setUnlocked(true);
        setShowCodeForm(false);
        setShowPayment(false);
        localStorage.setItem(LS_KEY, inputCode);
      } else {
        if (!silent) setError(isCz ? 'Nesprávný přístupový kód.' : 'Invalid access code.');
        localStorage.removeItem(LS_KEY);
      }
    } catch {
      if (!silent) setError(isCz ? 'Nastala chyba. Zkuste to znovu.' : 'Something went wrong.');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => copyText(text, id)}
      className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
    >
      {copied === id ? '✓' : isCz ? 'Kopírovat' : 'Copy'}
    </button>
  );

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink">
            {isCz ? 'Poptávky služeb' : 'Service Requests'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isCz
              ? 'Zákazníci hledají profesionály — přihlaste se k jejich poptávce.'
              : 'Customers looking for professionals — respond to their request.'}
          </p>
        </div>
        <Link
          href="/poptavky/nova"
          className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors whitespace-nowrap"
        >
          {isCz ? '+ Přidat poptávku' : '+ Post a Request'}
        </Link>
      </div>

      {/* Lock banner */}
      {!unlocked && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                🔒 {isCz ? 'Kontaktní údaje jsou zamčené' : 'Contact details are locked'}
              </p>
              <p className="text-amber-700 text-xs mt-0.5">
                {isCz
                  ? 'Pro zobrazení kontaktů zadejte přístupový kód nebo si jej pořiďte.'
                  : 'Enter your access code to view contacts, or purchase one.'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { setShowCodeForm(v => !v); setShowPayment(false); }}
                className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {isCz ? 'Zadat kód' : 'Enter code'}
              </button>
              <button
                onClick={() => { setShowPayment(v => !v); setShowCodeForm(false); }}
                className="text-xs font-semibold bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 px-4 py-2 rounded-md transition-colors"
              >
                {isCz ? 'Získat přístup' : 'Get access'}
              </button>
            </div>
          </div>

          {/* Enter code form */}
          {showCodeForm && (
            <div className="mt-4 flex gap-2 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && tryUnlock(code)}
                  placeholder={isCz ? 'Váš přístupový kód' : 'Your access code'}
                  className="w-full border border-amber-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
              </div>
              <button
                onClick={() => tryUnlock(code)}
                disabled={loading || !code.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? '…' : (isCz ? 'Odemknout' : 'Unlock')}
              </button>
            </div>
          )}

          {/* Payment info panel */}
          {showPayment && (
            <div className="mt-4 bg-white border border-amber-200 rounded-xl p-5">
              <h3 className="font-bold text-ink text-base mb-4">
                {isCz ? '💳 Platební údaje' : '💳 Payment Details'}
              </h3>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="border-2 border-brand rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">{isCz ? 'Měsíční přístup' : 'Monthly access'}</p>
                  <p className="text-2xl font-bold text-ink">{PRICE_MONTHLY}</p>
                  <p className="text-xs text-gray-400">{isCz ? '/ měsíc' : '/ month'}</p>
                </div>
                <div className="border-2 border-gray-200 rounded-lg p-3 text-center relative overflow-hidden">
                  <span className="absolute top-1 right-1 text-xs bg-brand text-white px-1.5 py-0.5 rounded font-semibold">
                    {isCz ? 'Výhodné' : 'Best value'}
                  </span>
                  <p className="text-xs text-gray-500 mb-1">{isCz ? 'Roční přístup' : 'Yearly access'}</p>
                  <p className="text-2xl font-bold text-ink">{PRICE_YEARLY}</p>
                  <p className="text-xs text-gray-400">{isCz ? '/ rok' : '/ year'}</p>
                </div>
              </div>

              {/* Bank details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{isCz ? 'Číslo účtu' : 'Account number'}</span>
                  <span className="font-mono font-bold text-ink">
                    {ACCOUNT_NUMBER}
                    <CopyBtn text={ACCOUNT_NUMBER} id="account" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{isCz ? 'Majitel účtu' : 'Account holder'}</span>
                  <span className="font-semibold text-ink">{ACCOUNT_NAME}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{isCz ? 'Variabilní symbol' : 'Variable symbol'}</span>
                  <span className="font-mono font-bold text-ink">
                    {VARIABLE_SYMBOL}
                    <CopyBtn text={VARIABLE_SYMBOL} id="vs" />
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">
                  {isCz ? '📸 Po zaplacení:' : '📸 After payment:'}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
                  <li>
                    {isCz
                      ? 'Pořiďte screenshot potvrzení platby (včetně ID transakce)'
                      : 'Take a screenshot of the payment confirmation (including transaction ID)'}
                  </li>
                  <li>
                    {isCz
                      ? <>Zašlete jej na e-mail: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">{CONTACT_EMAIL}</a></>
                      : <>Send it to: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline">{CONTACT_EMAIL}</a></>}
                  </li>
                  <li>
                    {isCz
                      ? 'Do zprávy uveďte svůj e-mail — přístupový kód vám zašleme do 24 hodin'
                      : 'Include your email — we will send your access code within 24 hours'}
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unlocked banner */}
      {unlocked && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-2">
          <span className="text-green-600 text-sm font-semibold">
            ✓ {isCz ? 'Přístup odemčen — kontaktní údaje jsou viditelné.' : 'Access granted — contact details are visible.'}
          </span>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl mb-2">{isCz ? 'Zatím žádné poptávky' : 'No requests yet'}</p>
          <p className="text-sm">{isCz ? 'Buďte první, kdo přidá poptávku.' : 'Be the first to post a request.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const serviceName = r.serviceId ? serviceMap.get(r.serviceId) : null;
            const cityName = r.cityId ? cityMap.get(r.cityId) : null;
            const date = new Date(r.createdAt).toLocaleDateString(isCz ? 'cs-CZ' : 'en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            });
            return (
              <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-ink truncate">{r.title}</h2>
                  {r.description && (
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{r.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {serviceName && (
                      <span className="inline-flex items-center text-xs bg-brand/10 text-brand font-medium px-2.5 py-1 rounded-full">
                        {serviceName}
                      </span>
                    )}
                    {cityName && (
                      <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">
                        📍 {cityName}
                      </span>
                    )}
                    {r.budget && (
                      <span className="inline-flex items-center text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full">
                        💰 {r.budget}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-ink">{r.contactName}</span>
                    {unlocked ? (
                      <>
                        {r.contactPhone && (
                          <> · <a href={`tel:${r.contactPhone}`} className="hover:text-brand transition-colors">{r.contactPhone}</a></>
                        )}
                        {r.contactEmail && (
                          <> · <a href={`mailto:${r.contactEmail}`} className="hover:text-brand transition-colors">{r.contactEmail}</a></>
                        )}
                      </>
                    ) : (
                      <span
                        className="ml-2 text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded cursor-pointer select-none"
                        onClick={() => { setShowPayment(true); setShowCodeForm(false); }}
                      >
                        🔒 {isCz ? 'kontakt skryt' : 'contact hidden'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
