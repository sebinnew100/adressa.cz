'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

interface Lead {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  serviceId: string;
  cityId: string;
  createdAt: string;
  contactCount: number;
  lastContactedAt: string | null;
}

interface SalesData {
  leads: Lead[];
  stats: { totalProviders: number; subscribed: number; leads: number; contacted: number };
}

export default function AdminSalesPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/sales');
    const json = await res.json();
    if (res.ok) setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const leadsWithEmail = useMemo(() => (data?.leads ?? []).filter(l => l.email), [data]);
  const uncontactedIds = useMemo(
    () => leadsWithEmail.filter(l => l.contactCount === 0).map(l => l.id),
    [leadsWithEmail],
  );

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(prev =>
      prev.size === leadsWithEmail.length ? new Set() : new Set(leadsWithEmail.map(l => l.id))
    );
  };

  const sendTo = async (providerIds: string[]) => {
    if (providerIds.length === 0) return;
    setSending(true);
    setLastResult(null);
    const res = await fetch('/api/admin/sales/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerIds }),
    });
    const json = await res.json();
    if (res.ok) {
      const sent = json.results.filter((r: { status: string }) => r.status === 'sent').length;
      const failed = json.results.filter((r: { status: string }) => r.status !== 'sent').length;
      setLastResult(`Odesláno: ${sent}${failed ? `, selhalo: ${failed}` : ''}`);
      setSelected(new Set());
      await fetchLeads();
    } else {
      setLastResult('Chyba při odesílání');
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">
            <span className="text-brand">adressa</span>.cz
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-sm font-medium">Sales</span>
        </div>
        <Link href="/admin/dashboard" className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors">
          ← Zpět na Admin
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Celkem profilů', value: data?.stats.totalProviders ?? '—' },
            { label: 'Předplácí', value: data?.stats.subscribed ?? '—' },
            { label: 'Nekonvertovaní (leads)', value: data?.stats.leads ?? '—' },
            { label: 'Již oslovení', value: data?.stats.contacted ?? '—' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => sendTo(Array.from(selected))}
            disabled={selected.size === 0 || sending}
            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-40"
          >
            {sending ? 'Odesílám…' : `Odeslat vybraným (${selected.size})`}
          </button>
          <button
            onClick={() => sendTo(uncontactedIds)}
            disabled={uncontactedIds.length === 0 || sending}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-40"
          >
            {sending ? 'Odesílám…' : `Odeslat všem neoslovením (${uncontactedIds.length})`}
          </button>
          {lastResult && <span className="text-sm text-gray-400">{lastResult}</span>}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-bold text-lg">Nekonvertovaní poskytovatelé ({leadsWithEmail.length} s e-mailem)</h2>
          </div>
          {loading ? (
            <div className="text-center py-16 text-gray-500">Načítám...</div>
          ) : leadsWithEmail.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Žádní leadi s e-mailem — všichni jsou buď aktivní, nebo bez kontaktu.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left px-6 py-3">
                      <input type="checkbox" checked={selected.size === leadsWithEmail.length} onChange={toggleAll} />
                    </th>
                    <th className="text-left px-6 py-3">Profil</th>
                    <th className="text-left px-6 py-3">Služba</th>
                    <th className="text-left px-6 py-3">Město</th>
                    <th className="text-left px-6 py-3">E-mail</th>
                    <th className="text-center px-6 py-3">Kontaktováno</th>
                    <th className="text-right px-6 py-3">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {leadsWithEmail.map(lead => {
                    const service = SERVICES.find(s => s.id === lead.serviceId);
                    const city = CITIES.find(c => c.id === lead.cityId);
                    return (
                      <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleOne(lead.id)} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{lead.fullName}</div>
                          <div className="text-gray-500 text-xs">{new Date(lead.createdAt).toLocaleDateString('cs-CZ')}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{service ? `${service.icon} ${service.nameCz}` : lead.serviceId}</td>
                        <td className="px-6 py-4 text-gray-300">{city ? city.nameCz : lead.cityId}</td>
                        <td className="px-6 py-4 text-gray-300 text-xs">{lead.email}</td>
                        <td className="px-6 py-4 text-center">
                          {lead.contactCount === 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
                              Nikdy
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400" title={lead.lastContactedAt ?? ''}>
                              {lead.contactCount}× · {lead.lastContactedAt && new Date(lead.lastContactedAt).toLocaleDateString('cs-CZ')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => sendTo([lead.id])}
                            disabled={sending}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                          >
                            {lead.contactCount === 0 ? '✉️ Odeslat pitch' : '✉️ Odeslat připomínku'}
                          </button>
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
