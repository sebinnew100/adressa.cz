'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import type { Provider } from '@/types';

export default function EditProviderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/providers/${id}`)
      .then(r => r.json())
      .then(data => { setProvider(data); setLoading(false); });
  }, [id]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(`/api/admin/providers/${id}`, {
      method: 'PUT',
      body: new FormData(e.currentTarget),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/admin/dashboard'), 1500);
    } else {
      setError('Chyba při ukládání. Zkuste to znovu.');
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

  if (!provider) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-400">Profil nenalezen</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.push('/admin/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Zpět
        </button>
        <h1 className="font-bold">Upravit profil: {provider.fullName}</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-4 mb-6 text-sm text-center">
            ✅ Profil byl úspěšně uložen. Přesměrovávám...
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-6">
          {/* Photo */}
          <div>
            <label className={labelClass}>Profilová fotografie</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700 flex-shrink-0 border-2 border-gray-600">
                {(preview || provider.picturePath) ? (
                  <Image
                    src={preview ?? provider.picturePath!}
                    alt={provider.fullName}
                    width={80} height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                    {provider.fullName[0]}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm text-brand hover:text-brand-hover transition-colors font-medium"
              >
                Změnit fotografii
              </button>
              <input ref={fileRef} type="file" name="picture" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Celé jméno *</label>
              <input type="text" name="fullName" required defaultValue={provider.fullName} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>E-mail *</label>
              <input type="email" name="email" required defaultValue={provider.email ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telefon *</label>
              <input type="tel" name="phone" required defaultValue={provider.phone ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Služba *</label>
              <select name="serviceId" required defaultValue={provider.serviceId} className={inputClass}>
                {SERVICES.map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {s.nameCz}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Město *</label>
              <select name="cityId" required defaultValue={provider.cityId} className={inputClass}>
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.nameCz}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Popis</label>
              <textarea
                name="description"
                rows={4}
                defaultValue={provider.description ?? ''}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

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
              onClick={() => router.push('/admin/dashboard')}
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
