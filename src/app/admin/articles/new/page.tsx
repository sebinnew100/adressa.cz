'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      body: new FormData(e.currentTarget),
    });

    if (res.ok) {
      router.push('/admin/articles');
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error === 'Slug already exists' ? 'Tento slug už existuje, zvolte jiný.' : 'Chyba při ukládání. Zkuste to znovu.');
    }
    setSaving(false);
  };

  const inputClass = 'w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand placeholder-gray-500';
  const labelClass = 'block text-gray-400 text-sm font-medium mb-1.5';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.push('/admin/articles')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Zpět
        </button>
        <h1 className="font-bold">Nový článek</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
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
                {preview ? (
                  <Image src={preview} alt="Náhled" width={112} height={80} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-600 text-xs">Bez obrázku</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm text-brand hover:text-brand-hover transition-colors font-medium"
              >
                Vybrat obrázek
              </button>
              <input ref={fileRef} type="file" name="coverImage" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Titulek *</label>
            <input type="text" name="title" required className={inputClass} placeholder="Jak vybrat elektrikáře v Praze" />
          </div>

          <div>
            <label className={labelClass}>Slug (URL adresa)</label>
            <input type="text" name="slug" className={inputClass} placeholder="Nechte prázdné pro automatické vygenerování" />
          </div>

          <div>
            <label className={labelClass}>Krátký popis (excerpt)</label>
            <textarea name="excerpt" rows={2} className={`${inputClass} resize-none`} placeholder="Krátké shrnutí pro výpis článků a vyhledávače" />
          </div>

          <div>
            <label className={labelClass}>Obsah článku *</label>
            <textarea name="content" required rows={14} className={`${inputClass} resize-none`} placeholder="Text článku. Nový odstavec oddělte prázdným řádkem." />
          </div>

          <div>
            <label className={labelClass}>Odkaz na nabídku (nepovinné)</label>
            <p className="text-gray-500 text-xs mb-3">Pokud článek souvisí s konkrétní službou a městem, zobrazí se na konci tlačítko odkazující na danou nabídku.</p>
            <div className="grid grid-cols-2 gap-3">
              <select name="relatedServiceId" defaultValue="" className={inputClass}>
                <option value="">— Bez služby —</option>
                {SERVICES.map(s => <option key={s.id} value={s.id}>{s.icon} {s.nameCz}</option>)}
              </select>
              <select name="relatedCityId" defaultValue="" className={inputClass}>
                <option value="">— Bez města —</option>
                {CITIES.map(c => <option key={c.id} value={c.id}>{c.nameCz}</option>)}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" name="published" className="w-4 h-4 rounded accent-brand" />
            Publikovat ihned
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {saving ? 'Ukládám...' : 'Vytvořit článek'}
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
