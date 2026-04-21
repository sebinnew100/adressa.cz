'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERVICES } from '@/data/services';

export function CategoryGrid() {
  const { language, t } = useLanguage();
  const router = useRouter();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-ink">{t.categories.title}</h2>
          <button
            onClick={() => router.push('/providers')}
            className="text-brand hover:text-brand-hover text-sm font-medium transition-colors"
          >
            {t.categories.viewAll} →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {SERVICES.map(service => (
            <button
              key={service.id}
              onClick={() => router.push(`/providers?service=${service.id}`)}
              className={`${service.color} rounded-xl p-4 text-center hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group border border-transparent hover:border-brand/20`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">
                {service.icon}
              </div>
              <p className="text-xs font-semibold text-ink leading-tight">
                {language === 'cs' ? service.nameCz : service.nameEn}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
