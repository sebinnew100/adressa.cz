'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export function Hero() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [service, setService] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set('service', service);
    if (city) params.set('city', city);
    router.push(`/providers?${params.toString()}`);
  };

  return (
    <section className="relative bg-[#1e3a2f] overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
          {t.hero.title}
        </h1>
        <p className="text-lg text-emerald-100 mb-10 max-w-2xl mx-auto">
          {t.hero.subtitle}
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto"
        >
          <select
            value={service}
            onChange={e => setService(e.target.value)}
            className="flex-1 px-4 py-3 text-ink text-sm rounded-lg border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="">{t.hero.searchService}</option>
            {SERVICES.map(s => (
              <option key={s.id} value={s.id}>
                {s.icon} {language === 'cs' ? s.nameCz : s.nameEn}
              </option>
            ))}
          </select>

          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="flex-1 px-4 py-3 text-ink text-sm rounded-lg border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="">{t.hero.searchCity}</option>
            {CITIES.map(c => (
              <option key={c.id} value={c.id}>
                {language === 'cs' ? c.nameCz : c.nameEn}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors whitespace-nowrap"
          >
            {t.hero.searchBtn}
          </button>
        </form>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-emerald-200 text-sm">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t.hero.trust1}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t.hero.trust2}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t.hero.trust3}
          </span>
        </div>
      </div>
    </section>
  );
}
