'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Payout {
  id: string;
  pointsSpent: number;
  amountCzk: number;
  accountName: string;
  accountDetails: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  player: { name: string | null; email: string | null; nickname: string | null };
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPayouts = async () => {
    const res = await fetch('/api/admin/payouts');
    const data = await res.json();
    if (Array.isArray(data)) setPayouts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayouts(); }, []);

  const markPaid = async (id: string) => {
    setProcessingId(id);
    const res = await fetch(`/api/admin/payouts/${id}`, { method: 'PATCH' });
    if (res.ok) {
      const updated = await res.json();
      setPayouts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    }
    setProcessingId(null);
  };

  const pending = payouts.filter(p => p.status === 'pending');
  const paid = payouts.filter(p => p.status === 'paid');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.push('/admin/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Zpět
        </button>
        <h1 className="font-bold">💸 Game Mode — výplaty</h1>
        <Link href="/admin/game" className="ml-auto text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors">
          🎮 Mise
        </Link>
        <Link href="/admin/players" className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors">
          👥 Hráči
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-bold text-lg mb-4">Čeká na vyplacení ({pending.length})</h2>
        {loading ? (
          <div className="text-center py-16 text-gray-500">Načítám...</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-8 text-gray-500 mb-8">Žádné čekající žádosti o výplatu.</div>
        ) : (
          <div className="space-y-3 mb-10">
            {pending.map(p => (
              <div key={p.id} className="bg-gray-900 border border-yellow-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold">{p.player.nickname || p.player.name || p.player.email}</div>
                  <div className="text-xs text-gray-500">{p.player.email}</div>
                  <div className="text-sm text-yellow-400 font-bold mt-1">{p.amountCzk} Kč ({p.pointsSpent} bodů)</div>
                  <div className="text-xs text-gray-400 mt-1">👤 {p.accountName}</div>
                  <div className="text-xs text-gray-400">🏦 {p.accountDetails}</div>
                  <div className="text-xs text-gray-600 mt-1">{new Date(p.createdAt).toLocaleString('cs-CZ')}</div>
                </div>
                <button
                  onClick={() => markPaid(p.id)}
                  disabled={processingId === p.id}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  ✓ Označit jako vyplaceno
                </button>
              </div>
            ))}
          </div>
        )}

        <h2 className="font-bold text-lg mb-4">Historie ({paid.length})</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {paid.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Zatím žádná historie.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {paid.map(p => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <span>{p.player.nickname || p.player.name || p.player.email}</span>
                  <span className="text-green-400">✓ Vyplaceno {p.amountCzk} Kč {p.paidAt ? `— ${new Date(p.paidAt).toLocaleDateString('cs-CZ')}` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
