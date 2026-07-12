'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import { NextRunCountdown } from '@/components/admin/NextRunCountdown';

type Stage = 'intro' | 'waiting' | 'hidden' | 'followup';

const STAGES: { key: Stage; label: string; title: string }[] = [
  { key: 'intro', label: '1️⃣', title: '1. Úvodní pitch — představení adressa.cz + ukázková poptávka' },
  { key: 'waiting', label: '2️⃣', title: '2. „8 lidí čeká na váš obor"' },
  { key: 'hidden', label: '3️⃣', title: '3. „10 skrytých poptávek"' },
  { key: 'followup', label: '4️⃣', title: '4. Follow-up připomínka' },
];

const STAGE_LABEL_LONG: Record<string, string> = {
  intro: '1️⃣ Úvod',
  waiting: '2️⃣ Čekají',
  hidden: '3️⃣ Skryté',
  followup: '4️⃣ Follow-up',
};

interface Lead {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  serviceId: string;
  cityId: string;
  active: boolean;
  salesExempt: boolean;
  removalDeadline: string | null;
  scheduledSendAt: string | null;
  daysLeft: number | null;
  createdAt: string;
  contactCount: number;
  lastContactedAt: string | null;
  lastContactedType: string | null;
}

interface SalesData {
  leads: Lead[];
  stats: {
    totalProviders: number;
    subscribed: number;
    leads: number;
    contacted: number;
    pastDeadline: number;
    manuallyDeactivated: number;
    scheduled: number;
  };
}

export default function AdminSalesPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [exemptingId, setExemptingId] = useState<string | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<Record<string, string>>({});
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);
  const [testingEmail, setTestingEmail] = useState(false);
  const [bulkStage, setBulkStage] = useState<Stage>('intro');

  const runTestEmail = async () => {
    if (!testEmailAddr) return;
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmailAddr }),
      });
      const json = await res.json();
      if (json.ok) {
        setTestEmailResult(`✅ Odesláno bez chyby (Resend id: ${json.data?.id ?? '—'}). Zkontrolujte doručenou/spam schránku.`);
      } else {
        setTestEmailResult(`❌ Chyba od Resend: ${json.error?.message ?? json.reason ?? JSON.stringify(json.error ?? json)}`);
      }
    } catch {
      setTestEmailResult('❌ Požadavek selhal.');
    }
    setTestingEmail(false);
  };

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
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return leadsWithEmail;
    return leadsWithEmail.filter(l => {
      const service = SERVICES.find(s => s.id === l.serviceId);
      const city = CITIES.find(c => c.id === l.cityId);
      return (
        l.fullName.toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q) ||
        (service?.nameCz.toLowerCase().includes(q)) ||
        (service?.nameEn?.toLowerCase().includes(q)) ||
        (city?.nameCz.toLowerCase().includes(q))
      );
    });
  }, [leadsWithEmail, search]);
  const uncontactedIds = useMemo(
    () => filtered.filter(l => l.contactCount === 0).map(l => l.id),
    [filtered],
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
      prev.size === filtered.length ? new Set() : new Set(filtered.map(l => l.id))
    );
  };

  const sendTo = async (providerIds: string[], stage: Stage) => {
    if (providerIds.length === 0) return;
    setSending(true);
    setLastResult(null);
    const res = await fetch('/api/admin/sales/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerIds, stage }),
    });
    const json = await res.json();
    if (res.ok) {
      type Result = { status: string; error?: string };
      const results: Result[] = json.results;
      const sent = results.filter(r => r.status === 'sent').length;
      const failed = results.filter(r => r.status === 'failed');
      const skipped = results.filter(r => r.status === 'skipped_no_email').length;
      const uniqueErrors = Array.from(new Set(failed.map(r => r.error).filter(Boolean)));
      let msg = `[${STAGE_LABEL_LONG[stage]}] Odesláno: ${sent}`;
      if (failed.length) msg += `, selhalo: ${failed.length}`;
      if (skipped) msg += `, bez e-mailu: ${skipped}`;
      if (uniqueErrors.length) msg += ` — chyba: ${uniqueErrors.join(' | ')}`;
      setLastResult(msg);
      setSelected(new Set());
      await fetchLeads();
    } else {
      setLastResult('Chyba při odesílání');
    }
    setSending(false);
  };

  const toggleExempt = async (id: string, current: boolean) => {
    setExemptingId(id);
    const res = await fetch(`/api/admin/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salesExempt: !current }),
    });
    if (res.ok && data) {
      setData({ ...data, leads: data.leads.map(l => l.id === id ? { ...l, salesExempt: !current } : l) });
    }
    setExemptingId(null);
  };

  const setSchedule = async (id: string) => {
    const value = scheduleDraft[id];
    if (!value) return;
    setSchedulingId(id);
    const scheduledSendAt = new Date(value).toISOString();
    const res = await fetch(`/api/admin/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledSendAt }),
    });
    if (res.ok && data) {
      setData({ ...data, leads: data.leads.map(l => l.id === id ? { ...l, scheduledSendAt } : l) });
      setScheduleDraft(prev => { const next = { ...prev }; delete next[id]; return next; });
    }
    setSchedulingId(null);
  };

  const cancelSchedule = async (id: string) => {
    setSchedulingId(id);
    const res = await fetch(`/api/admin/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledSendAt: null }),
    });
    if (res.ok && data) {
      setData({ ...data, leads: data.leads.map(l => l.id === id ? { ...l, scheduledSendAt: null } : l) });
    }
    setSchedulingId(null);
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
        <div className="flex flex-wrap gap-4 mb-8">
          <NextRunCountdown label="Příští automatický běh (nové leady, připomínky)" hourUtc={20} />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8 text-sm text-blue-300">
          Sales autopilot běží automaticky každý den (Vercel Cron) — automaticky posílá pouze fáze <strong>1️⃣ Úvod</strong> a <strong>2️⃣ Čekají</strong>. Fáze <strong>3️⃣ Skryté</strong> a <strong>4️⃣ Follow-up</strong> jsou pouze pro ruční odeslání níže. E-maily uvádí 7denní lhůtu, ale profily se po vypršení <strong>automaticky neodstraňují</strong> — jde jen o motivační formulaci v textu e-mailu.
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8">
          <h3 className="text-sm font-bold text-white mb-2">📧 Test doručování e-mailů</h3>
          <p className="text-xs text-gray-400 mb-3">
            Pošlete testovací e-mail na libovolnou adresu a uvidíte přesnou chybu od Resend, pokud doručení selže.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="email"
              placeholder="test@example.com"
              value={testEmailAddr}
              onChange={e => setTestEmailAddr(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-64 placeholder-gray-500"
            />
            <button
              onClick={runTestEmail}
              disabled={!testEmailAddr || testingEmail}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-40"
            >
              {testingEmail ? 'Odesílám…' : 'Odeslat test'}
            </button>
          </div>
          {testEmailResult && <p className="text-xs text-gray-300 mt-3 break-words">{testEmailResult}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {[
            { label: 'Celkem profilů', value: data?.stats.totalProviders ?? '—' },
            { label: 'Předplácí', value: data?.stats.subscribed ?? '—' },
            { label: 'Leads', value: data?.stats.leads ?? '—' },
            { label: 'Již oslovení', value: data?.stats.contacted ?? '—' },
            { label: 'Naplánováno', value: data?.stats.scheduled ?? '—' },
            { label: 'Po termínu (bez akce)', value: data?.stats.pastDeadline ?? '—' },
            { label: 'Ručně deaktivováno', value: data?.stats.manuallyDeactivated ?? '—' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-gray-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <Link
          href="/admin/sales/history"
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors mb-8"
        >
          📊 Zobrazit historii odesílání — kdo, kdy, jaká fáze a stav →
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Hledat podle jména, e-mailu, služby nebo města..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand w-64 placeholder-gray-500"
          />
          <select
            value={bulkStage}
            onChange={e => setBulkStage(e.target.value as Stage)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {STAGES.map(s => <option key={s.key} value={s.key}>{s.title}</option>)}
          </select>
          <button
            onClick={() => sendTo(Array.from(selected), bulkStage)}
            disabled={selected.size === 0 || sending}
            className="bg-brand hover:bg-brand-hover text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-40"
          >
            {sending ? 'Odesílám…' : `Odeslat vybraným (${selected.size})`}
          </button>
          <button
            onClick={() => sendTo(uncontactedIds, bulkStage)}
            disabled={uncontactedIds.length === 0 || sending}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-40"
          >
            {sending ? 'Odesílám…' : `Odeslat všem neoslovením ve filtru (${uncontactedIds.length})`}
          </button>
          {lastResult && <span className="text-sm text-gray-400 break-words">{lastResult}</span>}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="font-bold text-lg">Nekonvertovaní poskytovatelé ({filtered.length} z {leadsWithEmail.length} s e-mailem)</h2>
          </div>
          {loading ? (
            <div className="text-center py-16 text-gray-500">Načítám...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">Žádní leadi neodpovídají filtru.</div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900 z-10">
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                    <th className="text-left px-6 py-3">
                      <input type="checkbox" checked={selected.size === filtered.length} onChange={toggleAll} />
                    </th>
                    <th className="text-left px-6 py-3">Profil</th>
                    <th className="text-left px-6 py-3">Služba</th>
                    <th className="text-left px-6 py-3">Město</th>
                    <th className="text-left px-6 py-3">E-mail</th>
                    <th className="text-center px-6 py-3">Stav</th>
                    <th className="text-center px-6 py-3">Poslední kontakt</th>
                    <th className="text-left px-6 py-3">Naplánovat</th>
                    <th className="text-center px-6 py-3">Vyloučit</th>
                    <th className="text-right px-6 py-3">Odeslat fázi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.slice(0, 500).map(lead => {
                    const service = SERVICES.find(s => s.id === lead.serviceId);
                    const city = CITIES.find(c => c.id === lead.cityId);
                    return (
                      <tr key={lead.id} className={`hover:bg-gray-800/50 transition-colors ${lead.salesExempt ? 'opacity-50' : ''}`}>
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
                          {!lead.active ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400">
                              Odstraněno
                            </span>
                          ) : lead.daysLeft === null ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-700 text-gray-400">
                              Živě
                            </span>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${lead.daysLeft <= 2 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                              {lead.daysLeft > 0 ? `${lead.daysLeft} dní` : 'Po termínu'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {lead.contactCount === 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
                              Nikdy
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400" title={lead.lastContactedAt ?? ''}>
                              {lead.lastContactedType ? STAGE_LABEL_LONG[lead.lastContactedType] ?? lead.lastContactedType : ''} · {lead.contactCount}× · {lead.lastContactedAt && new Date(lead.lastContactedAt).toLocaleDateString('cs-CZ')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {lead.scheduledSendAt ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-purple-300 font-medium">
                                📅 {new Date(lead.scheduledSendAt).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                              <button
                                onClick={() => cancelSchedule(lead.id)}
                                disabled={schedulingId === lead.id}
                                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                              >
                                Zrušit
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="datetime-local"
                                value={scheduleDraft[lead.id] ?? ''}
                                onChange={e => setScheduleDraft(prev => ({ ...prev, [lead.id]: e.target.value }))}
                                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                              <button
                                onClick={() => setSchedule(lead.id)}
                                disabled={!scheduleDraft[lead.id] || schedulingId === lead.id}
                                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
                              >
                                📅
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleExempt(lead.id, lead.salesExempt)}
                            disabled={exemptingId === lead.id}
                            title="Vyloučit z kampaně (autopilot tento profil neosloví ani neodstraní)"
                            className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                              lead.salesExempt
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-800 text-gray-600 hover:bg-gray-700 hover:text-gray-300'
                            }`}
                          >
                            {lead.salesExempt ? '🔒' : '🔓'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {STAGES.map(s => (
                              <button
                                key={s.key}
                                onClick={() => sendTo([lead.id], s.key)}
                                disabled={sending}
                                title={s.title}
                                className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-brand text-gray-300 hover:text-white rounded-lg text-sm transition-colors disabled:opacity-40"
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length > 500 && (
                <div className="text-center py-4 text-gray-500 text-xs">
                  Zobrazeno prvních 500 z {filtered.length} — zúžte hledání pro zobrazení dalších.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
