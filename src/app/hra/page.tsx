'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import { getOrCreateDeviceId } from '@/lib/gameDevice';

import type { Mission } from '@/types/game';

const MissionMap = dynamic(() => import('@/components/game/MissionMap'), { ssr: false });

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function urgencyClass(ms: number): string {
  if (ms <= 10 * 60 * 1000) return 'bg-red-500/90 text-white game-glow-urgent';
  if (ms <= 60 * 60 * 1000) return 'bg-orange-500/90 text-white';
  return 'bg-blue-500/90 text-white';
}

export default function GameModePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [totalPoints, setTotalPoints] = useState(0);
  const [selected, setSelected] = useState<Mission | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [deviceId, setDeviceId] = useState('');

  const fetchMissions = useCallback(async () => {
    const res = await fetch('/api/game/missions');
    const data = await res.json();
    if (Array.isArray(data)) setMissions(data);
    setLoading(false);
  }, []);

  const fetchStatus = useCallback(async (id: string) => {
    if (!id) return;
    const res = await fetch(`/api/game/status?deviceId=${id}`);
    const data = await res.json();
    if (typeof data.totalPoints === 'number') setTotalPoints(data.totalPoints);
  }, []);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
    fetchMissions();
    fetchStatus(id);

    const tickTimer = setInterval(() => setNow(Date.now()), 1000);
    const missionsTimer = setInterval(fetchMissions, 30000);
    const statusTimer = setInterval(() => fetchStatus(id), 15000);

    return () => {
      clearInterval(tickTimer);
      clearInterval(missionsTimer);
      clearInterval(statusTimer);
    };
  }, [fetchMissions, fetchStatus]);

  const level = Math.floor(totalPoints / 200) + 1;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    setUploading(true);
    setSubmitMessage('');

    const formData = new FormData(e.currentTarget);
    formData.set('deviceId', deviceId);
    formData.set('missionId', selected.id);

    const res = await fetch('/api/game/submit', { method: 'POST', body: formData });
    if (res.ok) {
      setSubmitMessage('✅ Odesláno! Čeká na schválení adminem.');
      setTimeout(() => { setSelected(null); setSubmitMessage(''); }, 2000);
    } else {
      setSubmitMessage('❌ Nepodařilo se odeslat. Zkuste to znovu.');
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-purple-900/50 px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">
            <span className="text-brand">adressa</span>.cz
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-purple-400 font-bold flex items-center gap-1.5">🎮 GAME MODE</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-yellow-500/10 text-yellow-400 font-bold px-3 py-1.5 rounded-full">
            💰 {totalPoints} bodů
          </span>
          <span className="bg-purple-500/10 text-purple-300 font-bold px-3 py-1.5 rounded-full">
            ⭐ Lv. {level}
          </span>
          <Link
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            ↩ Zpět na web
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50 rounded-2xl p-6 mb-8 text-center">
          <p className="text-gray-300 text-sm">
            Navštivte podniky, splňte misi a nahrajte fotku jako důkaz. Po schválení adminem získáte body — 1000 bodů = 200 Kč.
          </p>
        </div>

        {!loading && missions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
              🗺️ Herní mapa — České Budějovice
            </h2>
            <MissionMap missions={missions} now={now} onSelect={setSelected} />
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500">Načítám mise...</div>
        ) : missions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">Žádné aktivní mise právě teď. Zkuste to později.</div>
        ) : (
          <>
          <h2 className="text-sm font-bold text-purple-300 mb-3">📋 Seznam misí</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map(mission => {
              const remaining = new Date(mission.expiresAt).getTime() - now;
              const service = SERVICES.find(s => s.id === mission.provider.serviceId);
              const city = CITIES.find(c => c.id === mission.provider.cityId);
              return (
                <button
                  key={mission.id}
                  onClick={() => setSelected(mission)}
                  className={`text-left bg-gray-900 border rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] ${
                    mission.isGrandChallenge ? 'border-yellow-500 game-pulse' : 'border-gray-800'
                  }`}
                >
                  <div className="relative aspect-video bg-gray-800">
                    {mission.provider.picturePath && (
                      <Image
                        src={mission.provider.picturePath}
                        alt={mission.provider.fullName}
                        fill
                        className="object-cover"
                      />
                    )}
                    {mission.isGrandChallenge && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                        👑 GRAND CHALLENGE
                      </span>
                    )}
                    <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${urgencyClass(remaining)}`}>
                      ⏳ {formatRemaining(remaining)}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-white">{mission.provider.fullName}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {service ? `${service.icon} ${service.nameCz}` : mission.provider.serviceId}
                      {city ? ` · ${city.nameCz}` : ''}
                    </div>
                    <div className="mt-3 text-green-400 font-bold text-sm">
                      +{mission.rewardPoints} bodů
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          </>
        )}
      </main>

      {/* Mission modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-30" onClick={() => setSelected(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">{selected.provider.fullName}</h2>
            <p className="text-green-400 font-bold mb-4">+{selected.rewardPoints} bodů za splnění mise</p>
            <p className="text-gray-400 text-sm mb-4">
              Nakupte cokoli u tohoto poskytovatele a nahrajte fotku jako důkaz nákupu. Odeslání čeká na schválení adminem.
            </p>
            {selected.provider.latitude && selected.provider.longitude && (
              <a
                href={
                  selected.provider.address
                    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${selected.provider.fullName}, ${selected.provider.address}`
                      )}`
                    : `https://www.google.com/maps/search/?api=1&query=${selected.provider.latitude},${selected.provider.longitude}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 flex items-center justify-center gap-2 w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 font-semibold py-2.5 rounded-lg transition-colors"
              >
                🧭 Navigovat na místo
              </a>
            )}
            {submitMessage ? (
              <p className="text-center py-4">{submitMessage}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="file" name="photo" accept="image/*" required className="w-full text-sm text-gray-300" />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors"
                  >
                    {uploading ? 'Odesílám...' : 'Odeslat důkaz'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  >
                    Zrušit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
