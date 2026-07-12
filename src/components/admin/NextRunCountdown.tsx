'use client';

import { useEffect, useState } from 'react';

function nextOccurrenceUtc(hourUtc: number): Date {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUtc, 0, 0));
  if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function formatRemaining(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function NextRunCountdown({ label, hourUtc }: { label: string; hourUtc: number }) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(formatRemaining(nextOccurrenceUtc(hourUtc).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [hourUtc]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
      <span className="text-xl">⏱</span>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm font-bold text-white">{remaining ?? '…'}</div>
      </div>
    </div>
  );
}
