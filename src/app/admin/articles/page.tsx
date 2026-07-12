'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NextRunCountdown } from '@/components/admin/NextRunCountdown';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImagePath: string | null;
  published: boolean;
  createdAt: string;
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/articles')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setArticles(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Smazat článek "${title}"?`)) return;
    setDeletingId(id);
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
    setArticles(prev => prev.filter(a => a.id !== id));
    setDeletingId(null);
  };

  const handleTogglePublished = async (id: string, current: boolean) => {
    setTogglingId(id);
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !current }),
    });
    if (res.ok) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !current } : a));
    }
    setTogglingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Zpět
          </button>
          <h1 className="font-bold">📝 Články</h1>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nový článek
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <NextRunCountdown
            label="Příští automatické publikování (autopilot)"
            hourUtc={22}
            description={
              loading
                ? undefined
                : `Publikuje až 2 další články z fronty (aktuálně čeká ${articles.filter(a => !a.published).length}), dokud celkem nedosáhne 119 publikovaných (nyní ${articles.filter(a => a.published).length}).`
            }
          />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-500">Načítám...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Žádné články zatím. Vytvořte první.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {articles.map(a => (
                <div key={a.id} className={`px-6 py-4 flex items-center gap-4 ${!a.published ? 'opacity-60' : ''}`}>
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                    {a.coverImagePath && (
                      <Image src={a.coverImagePath} alt={a.title} width={64} height={64} className="object-cover w-full h-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{a.title}</div>
                    <div className="text-gray-500 text-xs truncate">/clanky/{a.slug}</div>
                    <div className="text-gray-500 text-xs mt-1">{new Date(a.createdAt).toLocaleDateString('cs-CZ')}</div>
                  </div>
                  <button
                    onClick={() => handleTogglePublished(a.id, a.published)}
                    disabled={togglingId === a.id}
                    className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors flex-shrink-0 ${a.published ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-gray-700 text-gray-500 hover:bg-green-500/20 hover:text-green-400'}`}
                  >
                    {a.published ? '✓ Publikováno' : '✗ Koncept'}
                  </button>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {a.published && (
                      <Link
                        href={`/clanky/${a.slug}`}
                        target="_blank"
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      >
                        ↗ Zobrazit
                      </Link>
                    )}
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    >
                      ✏️ Upravit
                    </Link>
                    <button
                      onClick={() => handleDelete(a.id, a.title)}
                      disabled={deletingId === a.id}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      🗑 Smazat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
