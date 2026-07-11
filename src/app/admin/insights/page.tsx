'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

interface ArticleStat {
  id: string;
  title: string;
  slug: string;
  source: string;
  views: number;
  ctaClicks: number;
  relatedServiceId: string | null;
  relatedCityId: string | null;
  createdAt: string;
}

interface Totals {
  autopilot: { views: number; ctaClicks: number; count: number };
  manual: { views: number; ctaClicks: number; count: number };
}

function ctr(views: number, clicks: number): string {
  if (views === 0) return '—';
  return `${((clicks / views) * 100).toFixed(1)}%`;
}

export default function AdminInsightsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleStat[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/insights')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.articles)) setArticles(data.articles);
        if (data.totals) setTotals(data.totals);
      })
      .finally(() => setLoading(false));
  }, []);

  const grandViews = (totals?.autopilot.views ?? 0) + (totals?.manual.views ?? 0);
  const grandClicks = (totals?.autopilot.ctaClicks ?? 0) + (totals?.manual.ctaClicks ?? 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Zpět
          </button>
          <h1 className="font-bold">📈 Přehledy článků</h1>
        </div>
        <Link href="/admin/articles" className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors">
          📝 Články
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-gray-400 text-sm mb-6">
          Kolik lidí čte články a kolik z nich klikne na tlačítko &quot;Najít&quot; směrem k firmám. Počítadlo se zvyšuje při každém načtení stránky článku (kromě vyhledávacích robotů).
        </p>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Načítám...</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl mb-1">👀</div>
                <div className="text-3xl font-bold text-white">{grandViews}</div>
                <div className="text-gray-400 text-sm mt-1">Celkem přečtení článků</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl mb-1">➡️</div>
                <div className="text-3xl font-bold text-white">{grandClicks}</div>
                <div className="text-gray-400 text-sm mt-1">Prokliků na firmy ({ctr(grandViews, grandClicks)})</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="text-2xl mb-1">🤖</div>
                <div className="text-3xl font-bold text-white">
                  {totals?.autopilot.views ?? 0}
                  <span className="text-gray-500 text-lg"> / {grandViews}</span>
                </div>
                <div className="text-gray-400 text-sm mt-1">Přečtení z autopilot článků</div>
              </div>
            </div>

            {/* Autopilot vs manual comparison */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="font-bold text-lg">🤖 Autopilot vs. ✍️ Ruční články</h2>
              </div>
              <div className="grid grid-cols-2 divide-x divide-gray-800">
                {(['autopilot', 'manual'] as const).map(key => {
                  const t = totals?.[key] ?? { views: 0, ctaClicks: 0, count: 0 };
                  return (
                    <div key={key} className="px-6 py-5">
                      <div className="text-sm text-gray-400 mb-3">
                        {key === 'autopilot' ? '🤖 Autopilot' : '✍️ Ruční'} ({t.count} článků)
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <div className="text-2xl font-bold">{t.views}</div>
                          <div className="text-xs text-gray-500">přečtení</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{t.ctaClicks}</div>
                          <div className="text-xs text-gray-500">prokliků</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{ctr(t.views, t.ctaClicks)}</div>
                          <div className="text-xs text-gray-500">CTR</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-article table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="font-bold text-lg">Podle článku (seřazeno dle přečtení)</h2>
              </div>
              {articles.length === 0 ? (
                <div className="text-center py-16 text-gray-500">Žádné publikované články</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                        <th className="text-left px-6 py-3">Článek</th>
                        <th className="text-left px-6 py-3">Zdroj</th>
                        <th className="text-left px-6 py-3">Téma</th>
                        <th className="text-right px-6 py-3">Přečtení</th>
                        <th className="text-right px-6 py-3">Prokliků</th>
                        <th className="text-right px-6 py-3">CTR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {articles.map(a => {
                        const service = SERVICES.find(s => s.id === a.relatedServiceId);
                        const city = CITIES.find(c => c.id === a.relatedCityId);
                        return (
                          <tr key={a.id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <a
                                href={`/clanky/${a.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white hover:text-brand transition-colors font-medium"
                              >
                                {a.title}
                              </a>
                              <div className="text-gray-500 text-xs mt-0.5">
                                {new Date(a.createdAt).toLocaleDateString('cs-CZ')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                a.source === 'autopilot' ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {a.source === 'autopilot' ? '🤖 autopilot' : '✍️ ruční'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">
                              {service ? `${service.icon} ${service.nameCz}` : '—'}
                              {city ? ` · ${city.nameCz}` : ''}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-white">{a.views}</td>
                            <td className="px-6 py-4 text-right text-gray-300">{a.ctaClicks}</td>
                            <td className="px-6 py-4 text-right text-gray-300">{ctr(a.views, a.ctaClicks)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
