'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { CITIES } from '@/data/cities';
import type { Provider } from '@/types';

export default function HomePage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [featured, setFeatured] = useState<Provider[]>([]);

  useEffect(() => {
    fetch('/api/providers?limit=8')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setFeatured(data.slice(0, 8)))
      .catch(() => null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <HowItWorks />

        {/* Featured providers */}
        {featured.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-ink">{t.featured.title}</h2>
                  <p className="text-ink-lighter text-sm mt-1">{t.featured.subtitle}</p>
                </div>
                <button
                  onClick={() => router.push('/providers')}
                  className="text-brand hover:text-brand-hover text-sm font-medium transition-colors"
                >
                  {t.categories.viewAll} →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {featured.map(p => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Cities section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-ink text-center mb-8">{t.cities.title}</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {CITIES.map(city => (
                <button
                  key={city.id}
                  onClick={() => router.push(`/providers?city=${city.id}`)}
                  className="bg-white border border-gray-200 text-ink text-sm font-medium px-5 py-2.5 rounded-full hover:border-brand hover:text-brand transition-colors shadow-card"
                >
                  {language === 'cs' ? city.nameCz : city.nameEn}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-16 bg-[#1e3a2f]">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">{t.register.title}</h2>
            <p className="text-emerald-200 mb-8">{t.register.subtitle}</p>
            <button
              onClick={() => router.push('/register')}
              className="bg-brand hover:bg-brand-hover text-white font-bold px-10 py-4 rounded-lg transition-colors text-base"
            >
              {t.nav.register}
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
