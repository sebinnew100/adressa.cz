'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

const STAGE_LABEL: Record<string, string> = {
  intro: '1️⃣ Úvod',
  waiting: '2️⃣ Čekají',
  hidden: '3️⃣ Skryté',
  followup: '4️⃣ Follow-up',
};

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  subscribed: { label: '✓ Předplácí', className: 'bg-green-500/20 text-green-400' },
  removed: { label: 'Odstraněno', className: 'bg-red-500/20 text-red-400' },
  pending: { label: 'Čeká', className: 'bg-amber-500/20 text-amber-400' },
};

interface HistoryEntry {
  id: string;
  sentAt: string;
  type: string;
  providerId: string;
  fullName: string;
  email: string | null;
  serviceId: string;
  cityId: string;
  status: 'subscribed' | 'removed' | 'pending';
}

export default function SalesHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    fetch('/api/admin/sales/history')
      .then(r => r.json())
      .then(json => {
        if (Array.isArray(json.history)) setHistory(json.history);
        setTruncated(!!json.truncated);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return history.filter(h => {
      if (stageFilter !== 'all' && h.type !== stageFilter) return false;
      if (!q) return true;
      return h.fullName.toLowerCase().includes(q) || (h.email ?? '').toLowerCase().includes(q);
    });
  }, [history, search, stageFilter]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/admin/sales" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Zpět
          </Link>
          <h1 className="font-bold text-sm">📊 Historie odesílání</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Hledat podle jména nebo e-mailu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-64 placeholder-gray-500"
          />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="all">Všechny fáze</option>
            {Object.entries(STAGE_LABEL).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} záznamů</span>
        </div>

        {truncated && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-6 text-xs text-amber-300">
            Zobrazeno posledních 2000 záznamů — starší nejsou v tomto přehledu vidět.
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-500">Načítám...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Zatím žádné odeslané e-maily.</div>
          ) : (
            <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900 z-10">
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left px-6 py-3">Datum a čas</th>
                    <th className="text-left px-6 py-3">Profil</th>
                    <th className="text-left px-6 py-3">Služba</th>
                    <th className="text-left px-6 py-3">Město</th>
                    <th className="text-center px-6 py-3">Fáze</th>
                    <th className="text-center px-6 py-3">Stav</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map(h => {
                    const service = SERVICES.find(s => s.id === h.serviceId);
                    const city = CITIES.find(c => c.id === h.cityId);
                    const status = STATUS_LABEL[h.status];
                    return (
                      <tr key={h.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-3 text-gray-300 text-xs whitespace-nowrap">
                          {new Date(h.sentAt).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-6 py-3">
                          <Link href={`/admin/providers/${h.providerId}/edit`} className="font-medium text-white hover:text-brand transition-colors">
                            {h.fullName}
                          </Link>
                          <div className="text-gray-500 text-xs">{h.email}</div>
                        </td>
                        <td className="px-6 py-3 text-gray-300">{service ? `${service.icon} ${service.nameCz}` : h.serviceId}</td>
                        <td className="px-6 py-3 text-gray-300">{city ? city.nameCz : h.cityId}</td>
                        <td className="px-6 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-800 text-gray-300">
                            {STAGE_LABEL[h.type] ?? h.type}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.className}`}>
                            {status.label}
                          </span>
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
