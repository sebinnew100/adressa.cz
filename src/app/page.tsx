'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { CITIES } from '@/data/cities';
import type { Provider } from '@/types';

interface ArticlePreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImagePath: string | null;
  createdAt: string;
}

export default function HomePage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [featured, setFeatured] = useState<Provider[]>([]);
  const [articles, setArticles] = useState<ArticlePreview[]>([]);

  useEffect(() => {
    fetch('/api/providers?limit=8')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setFeatured(data.slice(0, 8)))
      .catch(() => null);

    fetch('/api/articles?limit=3')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setArticles(data))
      .catch(() => null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />

        {/* Customer request CTA — visible immediately below the hero */}
        <section style={{ backgroundColor: '#f0fdf4', borderTop: '3px solid #1DBF73', borderBottom: '3px solid #1DBF73' }} className="py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#1DBF73' }}>
                {language === 'cs' ? 'Pro zákazníky' : 'For customers'}
              </p>
              <h2 className="text-2xl font-bold" style={{ color: '#1e3a2f' }}>
                {language === 'cs'
                  ? 'Nenašli jste, co hledáte?'
                  : "Can't find what you need?"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {language === 'cs'
                  ? 'Popište svoji poptávku — profesionálové vás sami kontaktují.'
                  : 'Describe what you need — professionals will contact you directly.'}
              </p>
            </div>
            <button
              onClick={() => router.push('/poptavky/nova')}
              className="flex-shrink-0 font-bold px-8 py-3.5 rounded-lg transition-colors text-sm whitespace-nowrap shadow-md hover:opacity-90"
              style={{ backgroundColor: '#1DBF73', color: '#fff' }}
            >
              {language === 'cs' ? '+ Přidat poptávku' : '+ Post a Request'}
            </button>
          </div>
        </section>

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

        {/* Latest articles */}
        {articles.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-ink">{t.articlesHome.title}</h2>
                  <p className="text-ink-lighter text-sm mt-1">{t.articlesHome.subtitle}</p>
                </div>
                <Link
                  href="/clanky"
                  className="text-brand hover:text-brand-hover text-sm font-medium transition-colors"
                >
                  {t.categories.viewAll} →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {articles.map(a => (
                  <Link
                    key={a.id}
                    href={`/clanky/${a.slug}`}
                    className="group block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {a.coverImagePath && (
                        <Image
                          src={a.coverImagePath}
                          alt={a.title}
                          width={400}
                          height={225}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-ink group-hover:text-brand transition-colors line-clamp-2">
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{a.excerpt}</p>
                      )}
                    </div>
                  </Link>
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
