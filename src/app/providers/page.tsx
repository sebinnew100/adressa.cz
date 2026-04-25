'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProviderCard } from '@/components/providers/ProviderCard';
import { SearchFilters } from '@/components/providers/SearchFilters';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Provider } from '@/types';

function ProvidersContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
    fetch(`/api/providers?${searchParams.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data.providers)) {
          setProviders(data.providers);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/providers?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{t.providers.title}</h1>
        {!loading && (
          <span className="text-sm text-ink-lighter">
            {total} {t.providers.results}
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-ink-light hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Předchozí
                </button>

                {pageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-ink-lighter text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === p
                          ? 'bg-brand text-white'
                          : 'text-ink hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-ink-light hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Další →
                </button>
              </div>
            )}
          </>
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
