'use client';

import { useEffect, useState } from 'react';

function nextOccurrenceUtc(hourUtc: number): Date {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUtc, 0, 0));
  if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function NextRunCountdown({
  label,
  hourUtc,
  description,
}: {
  label: string;
  hourUtc: number;
  description?: string;
}) {
  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(formatRemaining(nextOccurrenceUtc(hourUtc).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hourUtc]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-start gap-3">
      <span className="text-xl leading-none mt-0.5">⏱</span>
      <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm font-bold text-white tabular-nums">{remaining ?? '…'}</div>
        {description && <div className="text-xs text-gray-500 mt-1 max-w-md">{description}</div>}
      </div>
    </div>
  );
}
