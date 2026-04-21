'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import type { Provider } from '@/types';

function Initials({ name }: { name: string }) {
  const p = name.trim().split(' ');
  return <>{p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2)}</>;
}

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/providers/${id}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(data => data && setProvider(data))
      .finally(() => setLoading(false));
  }, [id]);

  const service = provider ? SERVICES.find(s => s.id === provider.serviceId) : null;
  const city = provider ? CITIES.find(c => c.id === provider.cityId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-ink-light hover:text-brand transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.provider.back}
        </button>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 h-96 animate-pulse" />
        ) : notFound || !provider ? (
          <div className="text-center py-24">
            <p className="text-xl font-semibold text-ink">{t.provider.notFound}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-[#1e3a2f] to-brand" />

            <div className="px-8 pb-8">
              {/* Avatar */}
              <div className="relative -mt-14 mb-4">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-violet-500 flex items-center justify-center">
                  {provider.picturePath ? (
                    <Image
                      src={provider.picturePath}
                      alt={provider.fullName}
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-white font-bold text-3xl uppercase">
                      <Initials name={provider.fullName} />
                    </span>
                  )}
                </div>
              </div>

              {/* Name & badges */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-ink">{provider.fullName}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {service && (
                    <span className="inline-flex items-center gap-1.5 bg-brand-light text-brand text-sm font-semibold px-3 py-1 rounded-full">
                      {service.icon} {language === 'cs' ? service.nameCz : service.nameEn}
                    </span>
                  )}
                  {city && (
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-ink-light text-sm font-medium px-3 py-1 rounded-full">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {language === 'cs' ? city.nameCz : city.nameEn}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {provider.description && (
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-ink uppercase tracking-wide mb-3">{t.provider.description}</h2>
                  <p className="text-ink-light text-sm leading-relaxed whitespace-pre-line">
                    {provider.description}
                  </p>
                </div>
              )}

              {/* Contact */}
              <div>
                <h2 className="text-sm font-bold text-ink uppercase tracking-wide mb-4">{t.provider.contact}</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-ink-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a href={`mailto:${provider.email}`} className="text-brand hover:underline truncate">
                      {provider.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-ink-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <a href={`tel:${provider.phone}`} className="text-brand hover:underline">
                      {provider.phone}
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`mailto:${provider.email}`}
                    className="flex-1 bg-brand hover:bg-brand-hover text-white font-semibold text-center py-3 rounded-lg transition-colors"
                  >
                    {t.provider.sendEmail}
                  </a>
                  <a
                    href={`tel:${provider.phone}`}
                    className="flex-1 border-2 border-brand text-brand hover:bg-brand-light font-semibold text-center py-3 rounded-lg transition-colors"
                  >
                    {t.provider.callNow}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
