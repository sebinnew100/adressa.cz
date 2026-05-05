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

export function RequestsBoard({ requests: initial }: { requests: ServiceRequest[] }) {
  const { language } = useLanguage();
  const isCz = language === 'cs';

  const [requests, setRequests] = useState<ServiceRequest[]>(initial);
  const [unlocked, setUnlocked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const serviceMap = isCz ? serviceMapCs : serviceMapEn;
  const cityMap = isCz ? cityMapCs : cityMapEn;

  // Auto-unlock if a valid code was saved previously
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
        setShowForm(false);
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

      {/* Access code banner */}
      {!unlocked && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-800 text-sm">
                🔒 {isCz ? 'Kontaktní údaje jsou zamčené' : 'Contact details are locked'}
              </p>
              <p className="text-amber-700 text-xs mt-0.5">
                {isCz
                  ? 'Pro zobrazení kontaktů zadejte přístupový kód. Kód získáte po kontaktování týmu adressa.cz.'
                  : 'Enter your access code to view contact details. Get your code by contacting the adressa.cz team.'}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowForm(v => !v)}
                className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {isCz ? 'Zadat kód' : 'Enter code'}
              </button>
              <a
                href="mailto:customerserviceentfin@gmail.com"
                className="text-xs font-semibold bg-white border border-amber-300 text-amber-700 hover:bg-amber-100 px-4 py-2 rounded-md transition-colors"
              >
                {isCz ? 'Získat kód' : 'Get code'}
              </a>
            </div>
          </div>

          {showForm && (
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
        </div>
      )}

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
                        onClick={() => setShowForm(true)}
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
