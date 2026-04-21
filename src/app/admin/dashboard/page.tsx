'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import type { Provider } from '@/types';

function Initials({ name }: { name: string }) {
  const p = name.trim().split(' ');
  const i = p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2);
  return <>{i.toUpperCase()}</>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProviders = async () => {
    const res = await fetch('/api/providers');
    const data = await res.json();
    if (Array.isArray(data)) setProviders(data);
    setLoading(false);
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Smazat profil "${name}"?`)) return;
    setDeletingId(id);
    await fetch(`/api/admin/providers/${id}`, { method: 'DELETE' });
    setProviders(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const handleToggleFeatured = async (id: string, current: boolean) => {
    setTogglingId(id);
    const res = await fetch(`/api/admin/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !current }),
    });
    if (res.ok) {
      setProviders(prev => prev.map(p => p.id === id ? { ...p, featured: !current } : p));
    }
    setTogglingId(null);
  };

  const filtered = providers.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = providers.filter(p => p.featured).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">
            <span className="text-brand">adresar</span>.cz
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-sm font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ↗ View Site
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            Odhlásit
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Celkem profilů', value: providers.length, icon: '👥' },
            { label: 'Zvýrazněných', value: featuredCount, icon: '⭐' },
            { label: 'Měst', value: new Set(providers.map(p => p.cityId)).size, icon: '📍' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between gap-4">
            <h2 className="font-bold text-lg">Všechny profily</h2>
            <input
              type="text"
              placeholder="Hledat podle jména nebo e-mailu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-64 placeholder-gray-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-500">Načítám...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Žádné profily nenalezeny</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left px-6 py-3">Profil</th>
                    <th className="text-left px-6 py-3">Služba</th>
                    <th className="text-left px-6 py-3">Město</th>
                    <th className="text-left px-6 py-3">Kontakt</th>
                    <th className="text-center px-6 py-3">Zvýraznit</th>
                    <th className="text-right px-6 py-3">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map(provider => {
                    const service = SERVICES.find(s => s.id === provider.serviceId);
                    const city = CITIES.find(c => c.id === provider.cityId);
                    return (
                      <tr key={provider.id} className={`hover:bg-gray-800/50 transition-colors ${provider.featured ? 'bg-yellow-500/5' : ''}`}>
                        {/* Profile */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-violet-600 flex items-center justify-center text-white font-bold text-sm">
                              {provider.picturePath ? (
                                <Image src={provider.picturePath} alt={provider.fullName} width={40} height={40} className="object-cover w-full h-full" />
                              ) : (
                                <Initials name={provider.fullName} />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white flex items-center gap-1.5">
                                {provider.fullName}
                                {provider.featured && <span className="text-yellow-400 text-xs">⭐</span>}
                              </div>
                              <div className="text-gray-500 text-xs">{new Date(provider.createdAt).toLocaleDateString('cs-CZ')}</div>
                            </div>
                          </div>
                        </td>
                        {/* Service */}
                        <td className="px-6 py-4 text-gray-300">
                          {service ? `${service.icon} ${service.nameCz}` : provider.serviceId}
                        </td>
                        {/* City */}
                        <td className="px-6 py-4 text-gray-300">
                          {city ? city.nameCz : provider.cityId}
                        </td>
                        {/* Contact */}
                        <td className="px-6 py-4">
                          <div className="text-gray-300 text-xs">{provider.email}</div>
                          <div className="text-gray-500 text-xs">{provider.phone}</div>
                        </td>
                        {/* Featured toggle */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(provider.id, provider.featured)}
                            disabled={togglingId === provider.id}
                            title={provider.featured ? 'Odebrat zvýraznění' : 'Zvýraznit profil'}
                            className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-all ${
                              provider.featured
                                ? 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30'
                                : 'bg-gray-800 text-gray-600 hover:bg-gray-700 hover:text-yellow-400'
                            } ${togglingId === provider.id ? 'opacity-50' : ''}`}
                          >
                            ⭐
                          </button>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/providers/${provider.id}/edit`}
                              className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              ✏️ Upravit
                            </Link>
                            <button
                              onClick={() => handleDelete(provider.id, provider.fullName)}
                              disabled={deletingId === provider.id}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              🗑 Smazat
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
