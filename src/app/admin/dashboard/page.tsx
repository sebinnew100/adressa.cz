'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import type { Provider } from '@/types';

interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  message: string | null;
  createdAt: string;
  provider: { fullName: string; serviceId: string };
}

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
  const [exportService, setExportService] = useState('');
  const [exportCity, setExportCity] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'providers' | 'appointments' | 'codes' | 'requests'>('providers');

  interface AccessCode { id: string; code: string; label: string | null; active: boolean; createdAt: string; }
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  interface ServiceReq {
    id: string; title: string; description: string | null;
    serviceId: string | null; cityId: string | null;
    contactName: string; contactEmail: string | null; contactPhone: string | null;
    budget: string | null; active: boolean; createdAt: string;
  }
  const [serviceReqs, setServiceReqs] = useState<ServiceReq[]>([]);
  const [reqsLoading, setReqsLoading] = useState(false);
  const [editingReq, setEditingReq] = useState<ServiceReq | null>(null);
  const [savingReq, setSavingReq] = useState(false);

  const fetchProviders = async () => {
    const res = await fetch('/api/admin/providers');
    const data = await res.json();
    if (Array.isArray(data)) setProviders(data);
    setLoading(false);
  };

  const fetchCodes = async () => {
    setCodesLoading(true);
    const res = await fetch('/api/admin/codes');
    const data = await res.json();
    if (Array.isArray(data)) setCodes(data);
    setCodesLoading(false);
  };

  const generateCode = async () => {
    setGeneratingCode(true);
    const res = await fetch('/api/admin/codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: newLabel }),
    });
    const created = await res.json();
    if (res.ok && created.code) {
      setCodes(prev => [created, ...prev]);
      setNewLabel('');
    } else {
      alert('Chyba: ' + (created.error ?? 'Nepodařilo se vygenerovat kód.'));
    }
    setGeneratingCode(false);
  };

  const toggleCode = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/codes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current }),
    });
    if (res.ok) setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !current } : c));
  };

  const deleteCode = async (id: string) => {
    if (!confirm('Smazat tento kód?')) return;
    await fetch(`/api/admin/codes/${id}`, { method: 'DELETE' });
    setCodes(prev => prev.filter(c => c.id !== id));
  };

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchServiceReqs = async () => {
    setReqsLoading(true);
    const res = await fetch('/api/admin/requests');
    const data = await res.json();
    if (Array.isArray(data)) setServiceReqs(data);
    setReqsLoading(false);
  };

  const deleteServiceReq = async (id: string) => {
    if (!confirm('Smazat tuto poptávku?')) return;
    await fetch(`/api/admin/requests/${id}`, { method: 'DELETE' });
    setServiceReqs(prev => prev.filter(r => r.id !== id));
  };

  const saveServiceReq = async () => {
    if (!editingReq) return;
    setSavingReq(true);
    const res = await fetch(`/api/admin/requests/${editingReq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingReq),
    });
    if (res.ok) {
      const updated = await res.json();
      setServiceReqs(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditingReq(null);
    }
    setSavingReq(false);
  };

  useEffect(() => {
    fetchProviders();
    fetch('/api/admin/appointments')
      .then(r => r.json())
      .then(data => Array.isArray(data) && setAppointments(data))
      .finally(() => setApptLoading(false));
    fetchCodes();
    fetchServiceReqs();
  }, []);

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

  const handleToggleActive = async (id: string, current: boolean) => {
    setActivatingId(id);
    const res = await fetch(`/api/admin/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !current }),
    });
    if (res.ok) {
      setProviders(prev => prev.map(p => p.id === id ? { ...p, active: !current } : p));
    }
    setActivatingId(null);
  };

  const filtered = providers.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (p.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const featuredCount = providers.filter(p => p.featured).length;
  const pendingCount = providers.filter(p => !p.active).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">
            <span className="text-brand">adressa</span>.cz
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-sm font-medium">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            📝 Články
          </Link>
          <Link
            href="/admin/insights"
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            📈 Přehledy
          </Link>
          <Link
            href="/admin/game"
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            🎮 Game Mode
          </Link>
          <Link
            href="/admin/sales"
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            💌 Sales
          </Link>
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
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button onClick={() => setActiveTab('providers')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'providers' ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            👥 Profily ({providers.length})
          </button>
          <button onClick={() => setActiveTab('appointments')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'appointments' ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            📅 Poptávky ({appointments.length})
          </button>
          <button onClick={() => setActiveTab('codes')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'codes' ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            🔑 Přístupové kódy ({codes.length})
          </button>
          <button onClick={() => setActiveTab('requests')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'requests' ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
            📋 Zákaznické poptávky ({serviceReqs.length})
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Celkem profilů', value: providers.length, icon: '👥' },
            { label: 'Zvýrazněných', value: featuredCount, icon: '⭐' },
            { label: 'Čeká na aktivaci', value: pendingCount, icon: '⏳' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {activeTab === 'appointments' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-lg">Poptávky schůzek</h2>
            </div>
            {apptLoading ? (
              <div className="text-center py-16 text-gray-500">Načítám...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">Žádné poptávky zatím</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {appointments.map(a => {
                  const service = SERVICES.find(s => s.id === a.provider.serviceId);
                  return (
                    <div key={a.id} className="px-6 py-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">{a.customerName}</span>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-sm text-brand font-medium">{a.provider.fullName}</span>
                            {service && <span className="text-xs text-gray-500">{service.icon} {service.nameCz}</span>}
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                            {a.customerEmail && <span>✉️ {a.customerEmail}</span>}
                            {a.customerPhone && <span>📞 {a.customerPhone}</span>}
                            {a.customerAddress && <span>📍 {a.customerAddress}</span>}
                          </div>
                          {a.message && (
                            <p className="text-sm text-gray-300 bg-gray-800 rounded-lg px-4 py-2.5 mt-2 max-w-xl">{a.message}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(a.createdAt).toLocaleString('cs-CZ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-lg mb-4">🔑 Přístupové kódy pro zobrazení kontaktů</h2>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Jméno zákazníka (volitelné)"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateCode()}
                  className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-64 placeholder-gray-500"
                />
                <button
                  onClick={generateCode}
                  disabled={generatingCode}
                  className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {generatingCode ? '…' : '+ Vygenerovat kód'}
                </button>
              </div>
            </div>
            {codesLoading ? (
              <div className="text-center py-16 text-gray-500">Načítám...</div>
            ) : codes.length === 0 ? (
              <div className="text-center py-16 text-gray-500">Žádné kódy zatím. Vygenerujte první.</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {codes.map(c => (
                  <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-lg font-bold tracking-widest ${c.active ? 'text-brand' : 'text-gray-600 line-through'}`}>
                        {c.code}
                      </span>
                      <button
                        onClick={() => copyCode(c.id, c.code)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-2 py-1 rounded transition-colors"
                      >
                        {copiedId === c.id ? '✓ Zkopírováno' : '📋 Kopírovat'}
                      </button>
                      {c.label && <span className="text-sm text-gray-400">{c.label}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('cs-CZ')}</span>
                      <button
                        onClick={() => toggleCode(c.id, c.active)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${c.active ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-gray-700 text-gray-500 hover:bg-green-500/20 hover:text-green-400'}`}
                      >
                        {c.active ? '✓ Aktivní' : '✗ Zakázán'}
                      </button>
                      <button
                        onClick={() => deleteCode(c.id)}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg transition-colors"
                      >
                        Smazat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-lg">📋 Zákaznické poptávky</h2>
            </div>
            {reqsLoading ? (
              <div className="text-center py-16 text-gray-500">Načítám...</div>
            ) : serviceReqs.length === 0 ? (
              <div className="text-center py-16 text-gray-500">Žádné poptávky zatím</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {serviceReqs.map(r => {
                  const service = SERVICES.find(s => s.id === r.serviceId);
                  const city = CITIES.find(c => c.id === r.cityId);
                  const isEditing = editingReq?.id === r.id;
                  const row = isEditing ? editingReq! : r;
                  return (
                    <div key={r.id} className={`px-6 py-5 ${!r.active ? 'opacity-50' : ''}`}>
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="Nadpis"
                            value={row.title}
                            onChange={e => setEditingReq({ ...row, title: e.target.value })}
                          />
                          <textarea
                            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="Popis"
                            rows={3}
                            value={row.description ?? ''}
                            onChange={e => setEditingReq({ ...row, description: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                              value={row.serviceId ?? ''}
                              onChange={e => setEditingReq({ ...row, serviceId: e.target.value || null })}
                            >
                              <option value="">— Kategorie —</option>
                              {SERVICES.map(s => <option key={s.id} value={s.id}>{s.nameCz}</option>)}
                            </select>
                            <select
                              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                              value={row.cityId ?? ''}
                              onChange={e => setEditingReq({ ...row, cityId: e.target.value || null })}
                            >
                              <option value="">— Město —</option>
                              {CITIES.map(c => <option key={c.id} value={c.id}>{c.nameCz}</option>)}
                            </select>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <input
                              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                              placeholder="Jméno"
                              value={row.contactName}
                              onChange={e => setEditingReq({ ...row, contactName: e.target.value })}
                            />
                            <input
                              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                              placeholder="E-mail"
                              value={row.contactEmail ?? ''}
                              onChange={e => setEditingReq({ ...row, contactEmail: e.target.value })}
                            />
                            <input
                              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                              placeholder="Telefon"
                              value={row.contactPhone ?? ''}
                              onChange={e => setEditingReq({ ...row, contactPhone: e.target.value })}
                            />
                          </div>
                          <input
                            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-full"
                            placeholder="Rozpočet"
                            value={row.budget ?? ''}
                            onChange={e => setEditingReq({ ...row, budget: e.target.value })}
                          />
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={saveServiceReq}
                              disabled={savingReq}
                              className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {savingReq ? 'Ukládám…' : '✓ Uložit'}
                            </button>
                            <button
                              onClick={() => setEditingReq(null)}
                              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition-colors"
                            >
                              Zrušit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-semibold text-white">{r.title}</span>
                              {service && <span className="text-xs text-brand">{service.icon} {service.nameCz}</span>}
                              {city && <span className="text-xs text-gray-400">📍 {city.nameCz}</span>}
                              {r.budget && <span className="text-xs text-green-400">💰 {r.budget}</span>}
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                                {r.active ? 'Aktivní' : 'Skrytá'}
                              </span>
                            </div>
                            {r.description && (
                              <p className="text-sm text-gray-400 line-clamp-2 mb-2">{r.description}</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                              <span className="font-medium text-gray-300">{r.contactName}</span>
                              {r.contactEmail && <span>✉️ {r.contactEmail}</span>}
                              {r.contactPhone && <span>📞 {r.contactPhone}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('cs-CZ')}</span>
                            <button
                              onClick={() => {
                                const res = fetch(`/api/admin/requests/${r.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ ...r, active: !r.active }),
                                });
                                res.then(res => res.ok && setServiceReqs(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x)));
                              }}
                              className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${r.active ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-gray-700 text-gray-500 hover:bg-green-500/20 hover:text-green-400'}`}
                            >
                              {r.active ? '✓ Aktivní' : '✗ Skrytá'}
                            </button>
                            <button
                              onClick={() => setEditingReq(r)}
                              className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              ✏️ Upravit
                            </button>
                            <button
                              onClick={() => deleteServiceReq(r.id)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              🗑 Smazat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'providers' && (
        <>{/* Search + Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between gap-4">
            <h2 className="font-bold text-lg">Všechny profily</h2>
            <div className="flex items-center gap-3">
              <select
                value={exportService}
                onChange={e => setExportService(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">Všechny kategorie</option>
                {SERVICES.map(s => (
                  <option key={s.id} value={s.id}>{s.nameCz}</option>
                ))}
              </select>
              <select
                value={exportCity}
                onChange={e => setExportCity(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">Všechna města</option>
                {CITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.nameCz}</option>
                ))}
              </select>
              <a
                href={`/api/admin/providers/export?${new URLSearchParams({
                  ...(exportService ? { service: exportService } : {}),
                  ...(exportCity ? { city: exportCity } : {}),
                }).toString()}`}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              >
                Stáhnout Excel (CSV)
              </a>
              <input
                type="text"
                placeholder="Hledat podle jména nebo e-mailu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-64 placeholder-gray-500"
              />
            </div>
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
                    <th className="text-center px-6 py-3">Stav</th>
                    <th className="text-center px-6 py-3">Zvýraznit</th>
                    <th className="text-right px-6 py-3">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map(provider => {
                    const service = SERVICES.find(s => s.id === provider.serviceId);
                    const city = CITIES.find(c => c.id === provider.cityId);
                    return (
                      <tr key={provider.id} className={`hover:bg-gray-800/50 transition-colors ${!provider.active ? 'opacity-60' : provider.featured ? 'bg-yellow-500/5' : ''}`}>
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
                        {/* Active status */}
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleActive(provider.id, provider.active)}
                            disabled={activatingId === provider.id}
                            title={provider.active ? 'Deaktivovat' : 'Aktivovat profil'}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                              provider.active
                                ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400'
                                : 'bg-orange-500/20 text-orange-400 hover:bg-green-500/20 hover:text-green-400'
                            } ${activatingId === provider.id ? 'opacity-50' : ''}`}
                          >
                            {provider.active ? '✓ Aktivní' : '⏳ Čeká'}
                          </button>
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
        </>)}
      </main>
    </div>
  );
}
