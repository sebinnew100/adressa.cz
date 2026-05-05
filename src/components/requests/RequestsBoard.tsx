'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import type { ServiceRequest } from '@prisma/client';

const serviceMapCs = new Map(SERVICES.map(s => [s.id, s.nameCz]));
const serviceMapEn = new Map(SERVICES.map(s => [s.id, s.nameEn]));
const cityMapCs = new Map(CITIES.map(c => [c.id, c.nameCz]));
const cityMapEn = new Map(CITIES.map(c => [c.id, c.nameEn]));

export function RequestsBoard({ requests }: { requests: ServiceRequest[] }) {
  const { language } = useLanguage();
  const isCz = language === 'cs';

  const serviceMap = isCz ? serviceMapCs : serviceMapEn;
  const cityMap = isCz ? cityMapCs : cityMapEn;

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
                    {r.contactPhone && (
                      <> · <a href={`tel:${r.contactPhone}`} className="hover:text-brand transition-colors">{r.contactPhone}</a></>
                    )}
                    {r.contactEmail && (
                      <> · <a href={`mailto:${r.contactEmail}`} className="hover:text-brand transition-colors">{r.contactEmail}</a></>
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
