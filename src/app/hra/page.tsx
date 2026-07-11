'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';
import { getOrCreateDeviceId, getNickname, setNickname, hasSeenGameOnboarding, markGameOnboardingSeen } from '@/lib/gameDevice';
import { TourOverlay, type TourStep } from '@/components/game/TourOverlay';
import { useLanguage } from '@/contexts/LanguageContext';

import type { Mission } from '@/types/game';

interface LeaderboardEntry {
  deviceId: string;
  nickname: string | null;
  points: number;
}

const MissionMap = dynamic(() => import('@/components/game/MissionMap'), { ssr: false });

const GAME_CITIES = ['ceske-budejovice', 'praha'] as const;

const PRE_MODAL_STEP_COUNT = 3;

const TOUR_TARGETS: { targetId: string; advanceOnTargetClick?: boolean }[] = [
  { targetId: 'tour-city-tabs', advanceOnTargetClick: true },
  { targetId: 'tour-map', advanceOnTargetClick: true },
  { targetId: 'tour-mission-card', advanceOnTargetClick: true },
  { targetId: 'tour-photo-input' },
  { targetId: 'tour-submit-btn' },
  { targetId: 'tour-points-badge' },
];

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
  const { language, t, setLanguage } = useLanguage();
  const TOUR_STEPS: TourStep[] = TOUR_TARGETS.map((target, i) => ({
    ...target,
    title: t.game.tour.steps[i].title,
    body: t.game.tour.steps[i].body,
  }));

  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [totalPoints, setTotalPoints] = useState(0);
  const [selected, setSelected] = useState<Mission | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [nickname, setNicknameState] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [city, setCity] = useState<typeof GAME_CITIES[number]>('ceske-budejovice');
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const fetchMissions = useCallback(async (cityId: string) => {
    setLoading(true);
    const res = await fetch(`/api/game/missions?city=${cityId}`);
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

  const fetchLeaderboard = useCallback(async () => {
    const res = await fetch('/api/game/leaderboard');
    const data = await res.json();
    if (Array.isArray(data)) setLeaderboard(data);
  }, []);

  const saveNickname = () => {
    setNickname(nicknameDraft);
    setNicknameState(nicknameDraft.trim().slice(0, 20));
    setEditingNickname(false);
  };

  const endTour = () => {
    markGameOnboardingSeen();
    setTourActive(false);
    setSelected(null);
  };

  const goToStep = (index: number) => {
    if (index >= TOUR_STEPS.length) {
      endTour();
      return;
    }
    // Entering the "upload photo" step: if the player used Next instead of
    // actually clicking a mission, open the first real mission ourselves so
    // there's something real to point at.
    if (index === PRE_MODAL_STEP_COUNT && !selected) {
      if (missions.length > 0) setSelected(missions[0]);
      else { endTour(); return; }
    }
    setTourStep(index);
  };

  const nextStep = () => goToStep(tourStep + 1);
  const backStep = () => goToStep(Math.max(0, tourStep - 1));

  // If the player clicks a real mission (map pin or card) during the
  // pre-modal steps, jump straight to the modal steps.
  useEffect(() => {
    if (tourActive && selected && tourStep < PRE_MODAL_STEP_COUNT) {
      setTourStep(PRE_MODAL_STEP_COUNT);
    }
  }, [selected, tourActive, tourStep]);

  // If the player closes the mission modal mid-tour, don't leave the tour
  // pointing at a vanished target — just end it gracefully.
  useEffect(() => {
    if (tourActive && !selected && tourStep >= PRE_MODAL_STEP_COUNT) {
      endTour();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Auto-advance when the player actually clicks the highlighted element.
  useEffect(() => {
    if (!tourActive) return;
    const step = TOUR_STEPS[tourStep];
    if (!step?.advanceOnTargetClick || !step.targetId) return;

    const handler = (e: MouseEvent) => {
      const target = document.getElementById(step.targetId as string);
      if (target && e.target instanceof Node && target.contains(e.target)) {
        goToStep(tourStep + 1);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourActive, tourStep]);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
    setNicknameState(getNickname());
    fetchStatus(id);
    fetchLeaderboard();
    if (!hasSeenGameOnboarding()) {
      setTourStep(0);
      setTourActive(true);
    }

    const statusTimer = setInterval(() => fetchStatus(id), 15000);
    const leaderboardTimer = setInterval(fetchLeaderboard, 20000);
    const tickTimer = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      clearInterval(tickTimer);
      clearInterval(statusTimer);
      clearInterval(leaderboardTimer);
    };
  }, [fetchStatus, fetchLeaderboard]);

  useEffect(() => {
    fetchMissions(city);
    const missionsTimer = setInterval(() => fetchMissions(city), 30000);
    return () => clearInterval(missionsTimer);
  }, [city, fetchMissions]);

  const level = Math.floor(totalPoints / 200) + 1;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    setUploading(true);
    setSubmitMessage('');

    const formData = new FormData(e.currentTarget);
    formData.set('deviceId', deviceId);
    formData.set('missionId', selected.id);
    formData.set('nickname', nickname);

    const res = await fetch('/api/game/submit', { method: 'POST', body: formData });
    if (res.ok) {
      setSubmitMessage(t.game.modal.success);
      setTimeout(() => { setSelected(null); setSubmitMessage(''); }, 2000);
    } else {
      setSubmitMessage(t.game.modal.error);
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
          <span className="text-purple-400 font-bold flex items-center gap-1.5">🎮 {t.game.gameMode}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center rounded-full border border-gray-700 overflow-hidden text-xs font-bold">
            <button
              onClick={() => setLanguage('cs')}
              className={`px-2.5 py-1.5 transition-colors ${language === 'cs' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              CS
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1.5 transition-colors ${language === 'en' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              EN
            </button>
          </div>
          <button
            onClick={() => { setTourStep(0); setTourActive(true); }}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            {t.game.howToPlay}
          </button>
          <span id="tour-points-badge" className="bg-yellow-500/10 text-yellow-400 font-bold px-3 py-1.5 rounded-full">
            💰 {t.game.points(totalPoints)}
          </span>
          <span className="bg-purple-500/10 text-purple-300 font-bold px-3 py-1.5 rounded-full">
            ⭐ {t.game.level(level)}
          </span>
          {editingNickname ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={nicknameDraft}
                onChange={e => setNicknameDraft(e.target.value.slice(0, 20))}
                onKeyDown={e => { if (e.key === 'Enter') saveNickname(); }}
                placeholder={t.game.nicknamePlaceholder}
                className="w-28 bg-gray-800 border border-gray-700 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                onClick={saveNickname}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-full transition-colors"
              >
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setNicknameDraft(nickname); setEditingNickname(true); }}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-3 py-1.5 rounded-full transition-colors text-xs"
            >
              🏷️ {nickname || t.game.setNickname}
            </button>
          )}
          <Link
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold px-3 py-1.5 rounded-full transition-colors"
          >
            {t.game.backToSite}
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50 rounded-2xl p-6 mb-8 text-center">
          <p className="text-gray-300 text-sm">
            {t.game.bannerText}
          </p>
        </div>

        {leaderboard.length > 0 && (
          <div className="mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
              {t.game.leaderboardTitle}
            </h2>
            <div className="space-y-1.5">
              {leaderboard.map((entry, i) => {
                const isMe = entry.deviceId === deviceId;
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
                const displayName = entry.nickname || t.game.playerFallback(entry.deviceId.slice(-4).toUpperCase());
                return (
                  <div
                    key={entry.deviceId}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      isMe ? 'bg-purple-600/20 border border-purple-500/50' : 'bg-gray-800/50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold">{medal}</span>
                      <span className={isMe ? 'font-bold text-purple-300' : 'text-gray-300'}>
                        {displayName}{isMe ? ` ${t.game.you}` : ''}
                      </span>
                    </span>
                    <span className="font-bold text-yellow-400">{t.game.points(entry.points)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div id="tour-city-tabs" className="mb-6 flex gap-2">
          {GAME_CITIES.map(cityId => (
            <button
              key={cityId}
              onClick={() => setCity(cityId)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                city === cityId ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {t.game.cities[cityId]}
            </button>
          ))}
        </div>

        {!loading && missions.length > 0 && (
          <div id="tour-map" className="mb-8">
            <h2 className="text-sm font-bold text-purple-300 mb-3 flex items-center gap-2">
              {t.game.mapTitle(t.game.cities[city])}
            </h2>
            <MissionMap key={city} missions={missions} now={now} onSelect={setSelected} />
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-500">{t.game.loadingMissions}</div>
        ) : missions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">{t.game.noMissions}</div>
        ) : (
          <>
          <h2 className="text-sm font-bold text-purple-300 mb-3">{t.game.missionListTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission, i) => {
              const remaining = new Date(mission.expiresAt).getTime() - now;
              const service = SERVICES.find(s => s.id === mission.provider.serviceId);
              const city = CITIES.find(c => c.id === mission.provider.cityId);
              return (
                <button
                  key={mission.id}
                  id={i === 0 ? 'tour-mission-card' : undefined}
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
                        {t.game.grandChallenge}
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
                      {t.game.rewardPoints(mission.rewardPoints)}
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]" onClick={() => setSelected(null)}>
          <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelected(null)}
              aria-label={t.game.modal.close}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-lg leading-none transition-colors"
            >
              ✕
            </button>
            {selected.provider.picturePath && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-gray-800">
                <Image src={selected.provider.picturePath} alt={selected.provider.fullName} fill className="object-cover" />
              </div>
            )}
            <h2 className="text-xl font-bold mb-1 pr-8">{selected.provider.fullName}</h2>
            <p className="text-green-400 font-bold mb-4">{t.game.modal.rewardLine(selected.rewardPoints)}</p>
            <p className="text-gray-400 text-sm mb-4">
              {t.game.modal.instructions}
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
                {t.game.modal.navigate}
              </a>
            )}
            {submitMessage ? (
              <p className="text-center py-4">{submitMessage}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input id="tour-photo-input" type="file" name="photo" accept="image/*" required className="w-full text-sm text-gray-300" />
                <div className="flex gap-3">
                  <button
                    id="tour-submit-btn"
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors"
                  >
                    {uploading ? t.game.modal.submitting : t.game.modal.submit}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  >
                    {t.game.modal.cancel}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {tourActive && (
        <TourOverlay
          step={TOUR_STEPS[tourStep]}
          stepIndex={tourStep}
          totalSteps={TOUR_STEPS.length}
          onNext={nextStep}
          onBack={backStep}
          onSkip={endTour}
        />
      )}
    </div>
  );
}
