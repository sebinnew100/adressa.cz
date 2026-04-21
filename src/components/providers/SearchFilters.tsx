'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { CITIES } from '@/data/cities';
import { SERVICES } from '@/data/services';

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();

  const city = searchParams.get('city') || '';
  const service = searchParams.get('service') || '';
  const sort = searchParams.get('sort') || 'name';

  const update = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    value ? p.set(key, value) : p.delete(key);
    router.push(`/providers?${p.toString()}`);
  };

  const selectClass =
    'w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end shadow-card">
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-semibold text-ink-light uppercase tracking-wide mb-1.5">
          {t.providers.filterCity}
        </label>
        <select value={city} onChange={e => update('city', e.target.value)} className={selectClass}>
          <option value="">{t.providers.allCities}</option>
          {CITIES.map(c => (
            <option key={c.id} value={c.id}>
              {language === 'cs' ? c.nameCz : c.nameEn}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-semibold text-ink-light uppercase tracking-wide mb-1.5">
          {t.providers.filterService}
        </label>
        <select value={service} onChange={e => update('service', e.target.value)} className={selectClass}>
          <option value="">{t.providers.allServices}</option>
          {SERVICES.map(s => (
            <option key={s.id} value={s.id}>
              {s.icon} {language === 'cs' ? s.nameCz : s.nameEn}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[160px]">
        <label className="block text-xs font-semibold text-ink-light uppercase tracking-wide mb-1.5">
          {t.providers.sortBy}
        </label>
        <select value={sort} onChange={e => update('sort', e.target.value)} className={selectClass}>
          <option value="name">{t.providers.sortName}</option>
          <option value="city">{t.providers.sortCity}</option>
          <option value="service">{t.providers.sortService}</option>
        </select>
      </div>

      {(city || service) && (
        <button
          onClick={() => router.push('/providers')}
          className="text-sm text-ink-lighter hover:text-ink transition-colors underline underline-offset-2 pb-2.5"
        >
          ✕ Reset
        </button>
      )}
    </div>
  );
}
