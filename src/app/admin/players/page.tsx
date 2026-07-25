'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Player {
  id: string;
  email: string | null;
  name: string | null;
  nickname: string | null;
  picture: string | null;
  totalPoints: number;
  submissionCount: number;
  createdAt: string;
}

export default function AdminPlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/players')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setPlayers(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.push('/admin/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Zpět
        </button>
        <h1 className="font-bold">🎮 Game Mode — hráči ({players.length})</h1>
        <Link href="/admin/payouts" className="ml-auto text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors">
          💸 Výplaty
        </Link>
        <a
          href="/api/admin/players/export"
          className="text-sm bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg transition-colors"
        >
          ⬇ Stáhnout Excel (CSV)
        </a>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-16 text-gray-500">Načítám...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Zatím žádní hráči.</div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-800">
              {players.map(p => (
                <div key={p.id} className="px-4 py-3 flex items-center gap-3 text-sm">
                  {p.picture && (
                    <Image src={p.picture} alt={p.name ?? ''} width={32} height={32} className="rounded-full" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p.nickname || p.name || 'Bez jména'}</div>
                    <div className="text-xs text-gray-500 truncate">{p.email}</div>
                  </div>
                  <div className="text-yellow-400 font-bold">{p.totalPoints} b.</div>
                  <div className="text-gray-500 text-xs w-24 text-right">{p.submissionCount} odeslání</div>
                  <div className="text-gray-500 text-xs w-24 text-right">{new Date(p.createdAt).toLocaleDateString('cs-CZ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
