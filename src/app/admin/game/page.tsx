'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Submission {
  id: string;
  deviceId: string;
  nickname: string | null;
  photoPath: string;
  status: string;
  pointsAwarded: number | null;
  createdAt: string;
  mission: {
    rewardPoints: number;
    isGrandChallenge: boolean;
    provider: { fullName: string; serviceId: string; cityId: string };
  };
}

export default function AdminGamePage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    const res = await fetch('/api/admin/game');
    const data = await res.json();
    if (Array.isArray(data)) setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    const res = await fetch(`/api/admin/game/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    }
    setProcessingId(null);
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.push('/admin/dashboard')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Zpět
        </button>
        <h1 className="font-bold">🎮 Game Mode — schvalování misí</h1>
        <Link href="/hra" target="_blank" className="ml-auto text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors">
          ↗ Zobrazit Game Mode
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-bold text-lg mb-4">Čeká na schválení ({pending.length})</h2>
        {loading ? (
          <div className="text-center py-16 text-gray-500">Načítám...</div>
        ) : pending.length === 0 ? (
          <div className="text-center py-8 text-gray-500 mb-8">Žádné čekající odeslání.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {pending.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="relative aspect-video bg-gray-800">
                  <Image src={s.photoPath} alt="Důkaz" fill className="object-cover" />
                </div>
                <div className="p-4">
                  <div className="font-semibold">{s.mission.provider.fullName}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Odměna: {s.mission.rewardPoints} bodů {s.mission.isGrandChallenge && '👑'}
                  </div>
                  <div className="text-xs text-purple-400 mt-1">
                    🏷️ {s.nickname || `Hráč #${s.deviceId.slice(-4).toUpperCase()}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(s.createdAt).toLocaleString('cs-CZ')}</div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleReview(s.id, 'approve')}
                      disabled={processingId === s.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      ✓ Schválit
                    </button>
                    <button
                      onClick={() => handleReview(s.id, 'reject')}
                      disabled={processingId === s.id}
                      className="flex-1 bg-red-600/80 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                    >
                      ✗ Zamítnout
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="font-bold text-lg mb-4">Historie ({reviewed.length})</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {reviewed.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Zatím žádná historie.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {reviewed.map(s => (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <span>{s.mission.provider.fullName}</span>
                  <span className={s.status === 'approved' ? 'text-green-400' : 'text-red-400'}>
                    {s.status === 'approved' ? `✓ Schváleno (+${s.pointsAwarded})` : '✗ Zamítnuto'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
