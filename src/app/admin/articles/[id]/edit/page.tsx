'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImagePath: string | null;
  published: boolean;
}

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/articles/${id}`)
      .then(r => r.json())
      .then(data => { setArticle(data); setLoading(false); });
  }, [id]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'PUT',
      body: new FormData(e.currentTarget),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/admin/articles'), 1200);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error === 'Slug already exists' ? 'Tento slug už existuje, zvolte jiný.' : 'Chyba při ukládání. Zkuste to znovu.');
    }
    setSaving(false);
  };

  const inputClass = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand placeholder-gray-500';
  const labelClass = 'block text-gray-400 text-sm font-medium mb-1.5';

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-500">Načítám...</div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400">Článek nenalezen</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin/articles')} className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Zpět
          </button>
          <h1 className="font-bold">Upravit článek: {article.title}</h1>
        </div>
        {article.published && (
          <a
            href={`/clanky/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
          >
            ↗ Zobrazit na webu
          </a>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-6 text-sm text-center">
            ✅ Článek byl úspěšně uložen. Přesměrovávám...
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          <div>
            <label className={labelClass}>Titulní obrázek</label>
            <div className="flex items-center gap-4">
              <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border-2 border-gray-700 flex items-center justify-center">
                {(preview || article.coverImagePath) ? (
                  <Image src={preview ?? article.coverImagePath!} alt={article.title} width={112} height={80} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-600 text-xs">Bez obrázku</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm text-brand hover:text-brand-hover transition-colors font-medium"
              >
                Změnit obrázek
              </button>
              <input ref={fileRef} type="file" name="coverImage" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Titulek *</label>
            <input type="text" name="title" required defaultValue={article.title} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Slug (URL adresa)</label>
            <input type="text" name="slug" defaultValue={article.slug} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Krátký popis (excerpt)</label>
            <textarea name="excerpt" rows={2} defaultValue={article.excerpt ?? ''} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className={labelClass}>Obsah článku *</label>
            <textarea name="content" required rows={14} defaultValue={article.content} className={`${inputClass} resize-none`} />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" name="published" defaultChecked={article.published} className="w-4 h-4 rounded accent-brand" />
            Publikováno
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {saving ? 'Ukládám...' : 'Uložit změny'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/articles')}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors font-medium"
            >
              Zrušit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
