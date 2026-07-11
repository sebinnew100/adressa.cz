'use client';

import { useEffect, useState } from 'react';

export interface TourStep {
  targetId: string | null;
  title: string;
  body: string;
  advanceOnTargetClick?: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;

function useTargetRect(targetId: string | null): Rect | null {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!targetId) {
      setRect(null);
      return;
    }

    let raf: number;
    const measure = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
      raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [targetId]);

  return rect;
}

export function TourOverlay({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const rect = useTargetRect(step.targetId);
  const isLast = stepIndex === totalSteps - 1;
  const hasTarget = !!step.targetId;
  const targetFound = hasTarget && !!rect;

  // Tooltip position: below the target if there's room, else above; clamped horizontally.
  const tooltipWidth = 300;
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 10001,
    width: tooltipWidth,
  };

  if (rect) {
    const spaceBelow = window.innerHeight - (rect.top + rect.height + PAD);
    const placeBelow = spaceBelow > 180;
    const left = Math.min(Math.max(rect.left, 12), window.innerWidth - tooltipWidth - 12);
    tooltipStyle = {
      ...tooltipStyle,
      left,
      top: placeBelow ? rect.top + rect.height + PAD + 10 : undefined,
      bottom: placeBelow ? undefined : window.innerHeight - rect.top + PAD + 10,
    };
  } else {
    tooltipStyle = {
      ...tooltipStyle,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  return (
    <>
      {/* Dimmed backdrop, split into 4 bands around the spotlighted rect so clicks inside it reach the real element */}
      {targetFound && rect ? (
        <>
          <div style={{ position: 'fixed', zIndex: 9999, background: 'rgba(0,0,0,0.75)', top: 0, left: 0, right: 0, height: Math.max(0, rect.top - PAD) }} />
          <div style={{ position: 'fixed', zIndex: 9999, background: 'rgba(0,0,0,0.75)', top: rect.top + rect.height + PAD, left: 0, right: 0, bottom: 0 }} />
          <div style={{ position: 'fixed', zIndex: 9999, background: 'rgba(0,0,0,0.75)', top: rect.top - PAD, left: 0, width: Math.max(0, rect.left - PAD), height: rect.height + PAD * 2 }} />
          <div style={{ position: 'fixed', zIndex: 9999, background: 'rgba(0,0,0,0.75)', top: rect.top - PAD, left: rect.left + rect.width + PAD, right: 0, height: rect.height + PAD * 2 }} />
          {/* Highlight ring */}
          <div
            style={{
              position: 'fixed',
              zIndex: 10000,
              top: rect.top - PAD,
              left: rect.left - PAD,
              width: rect.width + PAD * 2,
              height: rect.height + PAD * 2,
              borderRadius: 14,
              border: '3px solid #a855f7',
              boxShadow: '0 0 20px rgba(168,85,247,0.7)',
              pointerEvents: 'none',
              transition: 'all 0.15s ease-out',
            }}
          />
        </>
      ) : (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)' }} />
      )}

      <div
        style={tooltipStyle}
        className="bg-gray-900 border border-purple-700/50 rounded-2xl p-5 shadow-2xl"
      >
        <p className="text-purple-400 font-bold text-xs tracking-wide mb-2">
          KROK {stepIndex + 1} Z {totalSteps}
        </p>
        <h3 className="text-white font-bold mb-1.5">{step.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4">{step.body}</p>
        {hasTarget && targetFound && step.advanceOnTargetClick && (
          <p className="text-purple-300 text-xs font-semibold mb-3">👆 Zkuste na to kliknout</p>
        )}
        <div className="flex items-center justify-between gap-2">
          <button onClick={onSkip} className="text-gray-500 hover:text-gray-300 text-xs font-medium transition-colors">
            Přeskočit
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                onClick={onBack}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-semibold transition-colors"
              >
                ‹ Zpět
              </button>
            )}
            <button
              onClick={onNext}
              className="px-3 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg text-xs font-bold transition-colors"
            >
              {isLast ? 'Dokončit ✓' : 'Další →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
