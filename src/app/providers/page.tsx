'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { SearchFilters } from '@/components/providers/SearchFilters';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Provider } from '@/types';

function ProvidersContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/providers?${searchParams.toString()}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setProviders(data))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t.providers.title}</h1>
        {!loading && (
          <span className="text-sm text-ink-lighter">
            {providers.length} {t.providers.results}
          </span>
        )}
      </div>

      <Suspense>
        <SearchFilters />
      </Suspense>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl font-semibold text-ink mb-2">{t.providers.noResults}</p>
            <p className="text-ink-lighter text-sm">{t.providers.noResultsSub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {providers.map(p => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function ProvidersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Suspense>
          <ProvidersContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
